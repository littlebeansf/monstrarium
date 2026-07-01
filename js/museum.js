/* ════════════════════════════════════════════════════════════════
   MONSTRARIUM — 3D MUSEUM  (js/museum.js)

   A first-person walkable gallery that hangs every plate of the codex
   on the walls of a long enfilade of candlelit stone halls — one hall
   per chapter, in order. Read from the same CHAPTERS / MONSTERS data
   the book uses; no new asset pipeline.

   PERFORMANCE (paramount):
   • Three.js is imported lazily on first open — the book's initial
     load is completely untouched.
   • Walls, floors, ceilings and frames are built once from cheap
     shared geometry/materials (few draw calls).
   • Plate TEXTURES stream in only for frames near the player and are
     disposed when far away, so GPU memory stays bounded even at 730
     plates. Distant frames show a parchment canvas placeholder.
   • devicePixelRatio capped at 2. Fog hides distant halls.

   INTEGRATION: standalone. Exposes window.MonstrariumMuseum with
   .open(startChapterIndex) / .close(). No edits needed to book.js.
   ════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  // ── Config ──────────────────────────────────────────────────────
  const THREE_URL = "https://unpkg.com/three@0.160.0/build/three.module.js";
  const PLATE_DIR = "assets/plates/";
  const CHAP_DIR  = ""; // dividers already carry assets/chapters/ prefix

  const WALL_H       = 6.4;      // hall height
  const HALL_HALF_W  = 5.2;      // half-width of a hall (x from -W..W)
  const SLOT_GAP     = 4.2;      // spacing between plates along a wall
  const WALL_INSET   = 0.18;     // frame stands off the wall
  const PLATE_ASPECT = 1054 / 1492; // w/h of a plate (portrait)
  const PLATE_H      = 3.1;      // displayed frame height (world units)
  const PLATE_W      = PLATE_H * PLATE_ASPECT;
  const EYE_H        = 1.62;     // camera height
  const DOOR_W       = 3.0;      // doorway width between halls
  const DOOR_H       = 4.3;
  const HALL_PAD_END = 6.5;      // padding at each hall end
  const STREAM_NEAR  = 26;       // load texture within this many units
  const STREAM_FAR   = 34;       // dispose beyond this
  const MOVE_SPEED   = 5.4;      // units / sec
  const RUN_MULT     = 1.85;

  // ── State ───────────────────────────────────────────────────────
  let THREE = null;
  let inited = false;
  let running = false;
  let scene, camera, renderer, raf = 0;
  let clock;
  let texLoader;
  const keys = Object.create(null);
  let yaw = 0, pitch = 0;
  const pos = { x: 0, y: EYE_H, z: 0 };
  let halls = [];            // { chapter, zStart, zEnd, centerZ }
  let frames = [];           // { mesh, mat, file, name, chapter, caput, x, z, cz, loaded, loading }
  let totalDepth = 0;
  let dom = {};              // overlay elements
  let touch = { active: false, id: null, dx: 0, dy: 0 };       // joystick
  let look = { dragging: false, id: null, lx: 0, ly: 0 };      // drag-look
  let pointerLocked = false;
  let currentHall = -1;
  let focusFrame = null;     // frame currently under reticle
  let zoomIndex = -1;        // index into frames for zoom nav
  let helpTimer = 0;
  let placeholderTex = null;
  const loadQueue = [];
  let activeLoads = 0;
  const MAX_LOADS = 4;

  // ── Data access (from data.js, already global) ──────────────────
  function chapters() { return (typeof CHAPTERS !== "undefined" && CHAPTERS) ? CHAPTERS : []; }

  // ── Public API ──────────────────────────────────────────────────
  const API = {
    open: function (startChapter) { openMuseum(startChapter | 0); },
    close: function () { closeMuseum(); },
    isOpen: function () { return running; }
  };
  window.MonstrariumMuseum = API;

  // ════════════════════════════════════════════════════════════════
  //  OPEN / CLOSE
  // ════════════════════════════════════════════════════════════════
  async function openMuseum(startChapter) {
    ensureDom();
    dom.root.classList.add("on");
    document.body.classList.add("museum-open");
    if (isTouch()) dom.root.classList.add("is-touch");

    if (!inited) {
      dom.load.classList.remove("hidden");
      setProgress(8);
      try {
        THREE = await import(THREE_URL);
      } catch (e) {
        dom.loadSub.textContent = "Could not load the 3D engine. Check your connection.";
        console.error("[museum] three import failed", e);
        return;
      }
      setProgress(30);
      await buildWorld();
      setProgress(100);
      inited = true;
    }

    // place player at the requested hall's entrance
    spawnAtHall(startChapter);
    updateHallLabel(true);

    running = true;
    clock = clock || new THREE.Clock();
    clock.start();
    bindInput();
    // reveal
    setTimeout(() => dom.load.classList.add("hidden"), 260);
    showHelp();
    if (!raf) loop();
  }

  function closeMuseum() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    exitPointerLock();
    unbindInput();
    dom.root.classList.remove("on");
    document.body.classList.remove("museum-open");
    closeZoom();
  }

  // ════════════════════════════════════════════════════════════════
  //  WORLD CONSTRUCTION
  // ════════════════════════════════════════════════════════════════
  async function buildWorld() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0805);
    scene.fog = new THREE.Fog(0x140d07, 26, 78);

    camera = new THREE.PerspectiveCamera(70, aspect(), 0.1, 400);

    renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    resize();
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;

    texLoader = new THREE.TextureLoader();
    placeholderTex = makePlaceholderTexture();

    // Lay out halls along +Z, one per chapter.
    layoutHalls();

    // Shared materials -------------------------------------------------
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x3a2c1a, roughness: 0.9, metalness: 0.02 });
    const wallMat  = new THREE.MeshStandardMaterial({ color: 0x241a10, roughness: 0.94, metalness: 0.0 });
    const ceilMat  = new THREE.MeshStandardMaterial({ color: 0x140d08, roughness: 1.0, metalness: 0.0 });
    const trimMat  = new THREE.MeshStandardMaterial({ color: 0x6f5626, roughness: 0.55, metalness: 0.55, emissive: 0x1a1206, emissiveIntensity: 0.4 });

    const geo = { floor: [], wall: [], ceil: [] };

    // Global ambient + a warm hemispheric fill so nothing is pure black.
    scene.add(new THREE.HemisphereLight(0x6b5230, 0x1a120a, 0.9));
    const amb = new THREE.AmbientLight(0x6a5030, 0.55);
    scene.add(amb);

    const runnerMat = new THREE.MeshStandardMaterial({ color: 0x3a1512, roughness: 0.95 }); // carpet runner

    for (let i = 0; i < halls.length; i++) {
      const h = halls[i];
      const len = h.zEnd - h.zStart;
      const cz = (h.zStart + h.zEnd) / 2;

      // floor
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALL_HALF_W * 2, len), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, 0, cz);
      scene.add(floor);

      // carpet runner down the middle
      const runner = new THREE.Mesh(new THREE.PlaneGeometry(2.2, len - 0.5), runnerMat);
      runner.rotation.x = -Math.PI / 2;
      runner.position.set(0, 0.01, cz);
      scene.add(runner);

      // ceiling
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(HALL_HALF_W * 2, len), ceilMat);
      ceil.rotation.x = Math.PI / 2;
      ceil.position.set(0, WALL_H, cz);
      scene.add(ceil);

      // side walls (left = -x, right = +x)
      for (const sign of [-1, 1]) {
        const w = new THREE.Mesh(new THREE.PlaneGeometry(len, WALL_H), wallMat);
        w.position.set(sign * HALL_HALF_W, WALL_H / 2, cz);
        w.rotation.y = sign > 0 ? -Math.PI / 2 : Math.PI / 2;
        scene.add(w);
        // baseboard trim
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, len), trimMat);
        base.position.set(sign * (HALL_HALF_W - 0.06), 0.14, cz);
        scene.add(base);
      }

      // end walls with doorway (except pass-throughs between halls)
      buildEndWall(h.zStart, i === 0, wallMat, trimMat);           // near end
      if (i === halls.length - 1) buildEndWall(h.zEnd, true, wallMat, trimMat, true); // final back wall (solid)

      // hall marker plaque above the entrance doorway
      addHallPlaque(h, wallMat, trimMat);

      // lay the plates
      layoutFramesForHall(h, trimMat);

      // warm track lighting: a few point lights spaced down the hall
      const nLights = Math.max(2, Math.round(len / 9));
      for (let l = 0; l < nLights; l++) {
        const lz = h.zStart + (len * (l + 0.5)) / nLights;
        const pl = new THREE.PointLight(0xffc072, 26, 26, 1.7);
        pl.position.set(0, WALL_H - 1.0, lz);
        scene.add(pl);
        // small fixture mesh
        const fix = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xffcf8a, emissive: 0xffb457, emissiveIntensity: 2.2 }));
        fix.position.copy(pl.position);
        scene.add(fix);
      }

      // a bench in the middle of larger halls
      if (len > 14) {
        const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.7),
          new THREE.MeshStandardMaterial({ color: 0x2a1d10, roughness: 0.8 }));
        bench.position.set(0, 0.25, cz);
        scene.add(bench);
      }
    }

    yieldFrame();
  }

  function buildEndWall(z, solid, wallMat, trimMat, forceSolid) {
    if (solid || forceSolid) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(HALL_HALF_W * 2, WALL_H), wallMat);
      w.position.set(0, WALL_H / 2, z);
      w.rotation.y = (z < totalDepth / 2 && !forceSolid) ? 0 : Math.PI;
      scene.add(w);
      return;
    }
    // wall with a central doorway — build as three panels
    const side = (HALL_HALF_W * 2 - DOOR_W) / 2;
    for (const sgn of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(side, WALL_H), wallMat);
      p.position.set(sgn * (DOOR_W / 2 + side / 2), WALL_H / 2, z);
      scene.add(p);
      const pb = p.clone(); pb.rotation.y = Math.PI; pb.position.z = z; scene.add(pb);
    }
    // lintel above door
    const lintel = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W, WALL_H - DOOR_H), wallMat);
    lintel.position.set(0, DOOR_H + (WALL_H - DOOR_H) / 2, z);
    scene.add(lintel);
    // gilt door frame trim
    const jamb = new THREE.BoxGeometry(0.16, DOOR_H, 0.16);
    for (const sgn of [-1, 1]) {
      const j = new THREE.Mesh(jamb, trimMat);
      j.position.set(sgn * DOOR_W / 2, DOOR_H / 2, z);
      scene.add(j);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W + 0.32, 0.16, 0.16), trimMat);
    top.position.set(0, DOOR_H, z);
    scene.add(top);
  }

  function addHallPlaque(h, wallMat, trimMat) {
    // a small illuminated plaque above the entrance naming the chapter
    const tex = makeTextTexture("CAPUT " + h.caput, h.title);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const plq = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.9), mat);
    plq.position.set(0, DOOR_H + 0.55, h.zStart + 0.06);
    scene.add(plq);
  }

  // ── Hall layout: chapter -> [zStart, zEnd] along +Z ─────────────
  function layoutHalls() {
    halls = [];
    let z = 0;
    const chs = chapters();
    for (let i = 0; i < chs.length; i++) {
      const ch = chs[i];
      const n = ch.monsters.length;
      // plates alternate walls, so slots-per-wall = ceil(n/2)
      const perWall = Math.ceil(n / 2);
      const len = Math.max(12, perWall * SLOT_GAP + HALL_PAD_END * 2);
      halls.push({
        index: i,
        chapter: ch,
        caput: ch.caput,
        title: ch.title,
        slug: ch.slug,
        divider: ch.divider,
        zStart: z,
        zEnd: z + len,
        centerZ: z + len / 2,
        perWall
      });
      z += len;
    }
    totalDepth = z;
  }

  function layoutFramesForHall(h, trimMat) {
    const mons = h.chapter.monsters;
    // walls: -x (left) and +x (right); alternate placement
    let leftCount = 0, rightCount = 0;
    for (let k = 0; k < mons.length; k++) {
      const m = mons[k];
      const onLeft = (k % 2 === 0);
      const slot = onLeft ? leftCount++ : rightCount++;
      const z = h.zStart + HALL_PAD_END + slot * SLOT_GAP + SLOT_GAP / 2;
      const x = (onLeft ? -1 : 1) * (HALL_HALF_W - WALL_INSET);
      addFrame({
        file: m.file,
        name: m.name,
        caput: h.caput,
        chapterTitle: h.title,
        x, z,
        faceRight: onLeft,            // left wall faces +x
        trimMat
      });
    }
  }

  function addFrame(o) {
    // gilt frame border (box) + inner plate quad using placeholder first
    const group = new THREE.Group();
    const border = new THREE.Mesh(
      new THREE.BoxGeometry(PLATE_W + 0.34, PLATE_H + 0.34, 0.14),
      o.trimMat
    );
    group.add(border);
    // Plates read like softly backlit gallery prints: a low emissive tied to
    // the same map keeps the artwork legible even between the warm lights,
    // without washing out the candlelit mood.
    const mat = new THREE.MeshStandardMaterial({
      map: placeholderTex, roughness: 0.72, metalness: 0.0,
      emissive: 0xffffff, emissiveMap: placeholderTex, emissiveIntensity: 0.32
    });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(PLATE_W, PLATE_H), mat);
    plate.position.z = 0.08;
    group.add(plate);

    group.position.set(o.x, 2.55, o.z);
    group.rotation.y = o.faceRight ? Math.PI / 2 : -Math.PI / 2;
    scene.add(group);

    frames.push({
      group, plate, mat,
      file: o.file, name: o.name, caput: o.caput, chapterTitle: o.chapterTitle,
      x: o.x, z: o.z,
      loaded: false, loading: false, tex: null
    });
  }

  // ════════════════════════════════════════════════════════════════
  //  TEXTURE STREAMING
  // ════════════════════════════════════════════════════════════════
  function streamTextures() {
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      const dz = f.z - pos.z;
      const dx = f.x - pos.x;
      const d = Math.hypot(dx, dz);
      if (d < STREAM_NEAR && !f.loaded && !f.loading) {
        enqueueLoad(f);
      } else if (d > STREAM_FAR && f.loaded) {
        unloadFrame(f);
      }
    }
    pumpQueue();
  }

  function enqueueLoad(f) {
    f.loading = true;
    loadQueue.push(f);
  }

  function pumpQueue() {
    // sort so nearest loads first
    if (loadQueue.length > 1) loadQueue.sort((a, b) =>
      (Math.hypot(a.x - pos.x, a.z - pos.z)) - (Math.hypot(b.x - pos.x, b.z - pos.z)));
    while (activeLoads < MAX_LOADS && loadQueue.length) {
      const f = loadQueue.shift();
      // skip if it wandered out of range while queued
      if (Math.hypot(f.x - pos.x, f.z - pos.z) > STREAM_FAR) { f.loading = false; continue; }
      activeLoads++;
      texLoader.load(PLATE_DIR + f.file,
        (tex) => {
          activeLoads--;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          f.tex = tex;
          f.mat.map = tex;
          f.mat.emissiveMap = tex;
          f.mat.needsUpdate = true;
          f.loaded = true;
          f.loading = false;
          pumpQueue();
        },
        undefined,
        () => { activeLoads--; f.loading = false; pumpQueue(); }
      );
    }
  }

  function unloadFrame(f) {
    if (f.tex) { f.tex.dispose(); f.tex = null; }
    f.mat.map = placeholderTex;
    f.mat.emissiveMap = placeholderTex;
    f.mat.needsUpdate = true;
    f.loaded = false;
  }

  // ════════════════════════════════════════════════════════════════
  //  CANVAS TEXTURES (placeholder + plaques)
  // ════════════════════════════════════════════════════════════════
  function makePlaceholderTexture() {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 180;
    const g = c.getContext("2d");
    g.fillStyle = "#2a2016"; g.fillRect(0, 0, c.width, c.height);
    // subtle parchment grain
    for (let i = 0; i < 900; i++) {
      g.fillStyle = "rgba(201,161,74," + (Math.random() * 0.05) + ")";
      g.fillRect(Math.random() * c.width, Math.random() * c.height, 1.5, 1.5);
    }
    g.strokeStyle = "rgba(201,161,74,0.25)"; g.lineWidth = 3;
    g.strokeRect(8, 8, c.width - 16, c.height - 16);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function makeTextTexture(caput, title) {
    const c = document.createElement("canvas");
    c.width = 640; c.height = 220;
    const g = c.getContext("2d");
    g.clearRect(0, 0, c.width, c.height);
    g.textAlign = "center";
    g.fillStyle = "#e8c878";
    g.font = "600 46px Cinzel, serif";
    g.fillText(caput, c.width / 2, 66);
    g.fillStyle = "#ddc69a";
    g.font = "500 74px 'Cormorant Garamond', serif";
    g.fillText(title, c.width / 2, 156);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  // ════════════════════════════════════════════════════════════════
  //  PLAYER / MOVEMENT / COLLISION
  // ════════════════════════════════════════════════════════════════
  function spawnAtHall(idx) {
    idx = Math.max(0, Math.min(halls.length - 1, idx || 0));
    const h = halls[idx];
    pos.x = 0;
    pos.y = EYE_H;
    pos.z = h.zStart + 2.5;
    yaw = 0;   // looking down +Z into the hall
    pitch = 0;
    if (camera) applyCamera();
  }

  function update(dt) {
    // ── look from touch drag / already-applied pointerlock deltas ──
    // movement vector in local space
    let mf = 0, ms = 0;
    if (keys["w"] || keys["arrowup"]) mf += 1;
    if (keys["s"] || keys["arrowdown"]) mf -= 1;
    if (keys["a"] || keys["arrowleft"]) ms -= 1;
    if (keys["d"] || keys["arrowright"]) ms += 1;
    if (touch.active) { mf += -touch.dy; ms += touch.dx; }

    const run = keys["shift"] ? RUN_MULT : 1;
    const speed = MOVE_SPEED * run * dt;

    if (mf || ms) {
      const len = Math.hypot(mf, ms) || 1;
      mf /= len; ms /= len;
      const sin = Math.sin(yaw), cos = Math.cos(yaw);
      // forward is +Z when yaw 0
      const dz = (mf * cos - ms * sin) * speed;
      const dx = (mf * sin + ms * cos) * speed;
      tryMove(pos.x + dx, pos.z + dz);
    }
    applyCamera();
    streamTextures();
    updateHallLabel(false);
    updateFocus();
  }

  function tryMove(nx, nz) {
    // clamp inside hall bounds; allow passing through doorways (center)
    const margin = 0.5;
    // z within total corridor
    nz = Math.max(0.8, Math.min(totalDepth - 0.8, nz));
    // x clamp — but near a doorway (end wall) the full width is walkable;
    // walls are continuous on the sides, so just clamp to hall half width.
    const maxX = HALL_HALF_W - margin;
    nx = Math.max(-maxX, Math.min(maxX, nx));
    pos.x = nx; pos.z = nz;
  }

  function applyCamera() {
    pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, pitch));
    camera.position.set(pos.x, pos.y, pos.z);
    const cp = Math.cos(pitch);
    const dir = new THREE.Vector3(
      Math.sin(yaw) * cp,
      Math.sin(pitch),
      Math.cos(yaw) * cp
    );
    camera.lookAt(camera.position.x + dir.x, camera.position.y + dir.y, camera.position.z + dir.z);
  }

  function currentHallIndex() {
    for (let i = 0; i < halls.length; i++) {
      if (pos.z >= halls[i].zStart && pos.z < halls[i].zEnd) return i;
    }
    return halls.length - 1;
  }

  function updateHallLabel(force) {
    const idx = currentHallIndex();
    if (idx === currentHall && !force) return;
    currentHall = idx;
    const h = halls[idx];
    if (h && dom.hallCaput) {
      dom.hallCaput.textContent = "Caput " + h.caput;
      dom.hallTitle.textContent = h.title;
    }
  }

  // ── Reticle focus (raycast center → nearest frame) ──────────────
  const _ray = { origin: null, dir: null };
  function updateFocus() {
    // cheap proximity + facing check instead of full raycast every frame
    let best = null, bestD = 7.5;
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      const dx = f.x - pos.x, dz = f.z - pos.z;
      const d = Math.hypot(dx, dz);
      if (d > bestD) continue;
      // is it roughly in front of the camera?
      const fdx = Math.sin(yaw), fdz = Math.cos(yaw);
      const dot = (dx * fdx + dz * fdz) / (d || 1);
      if (dot < 0.55) continue; // must be within ~57° of view center
      if (d < bestD) { bestD = d; best = f; }
    }
    if (best !== focusFrame) {
      focusFrame = best;
      if (best) {
        dom.reticle.classList.add("focus");
        dom.targetName.textContent = best.name;
        dom.target.classList.add("show");
      } else {
        dom.reticle.classList.remove("focus");
        dom.target.classList.remove("show");
      }
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  ZOOM OVERLAY
  // ════════════════════════════════════════════════════════════════
  function openZoom(frame) {
    if (!frame) return;
    zoomIndex = frames.indexOf(frame);
    renderZoom();
    dom.zoom.classList.add("on");
    exitPointerLock();
  }
  function renderZoom() {
    const f = frames[zoomIndex];
    if (!f) return;
    dom.zoomImg.src = PLATE_DIR + f.file;
    dom.zoomImg.alt = f.name;
    dom.zoomName.textContent = f.name;
    dom.zoomChapter.textContent = "Caput " + f.caput + " · " + f.chapterTitle;
  }
  function zoomStep(delta) {
    if (zoomIndex < 0) return;
    zoomIndex = (zoomIndex + delta + frames.length) % frames.length;
    renderZoom();
  }
  function closeZoom() { dom.zoom.classList.remove("on"); }

  // ════════════════════════════════════════════════════════════════
  //  INPUT
  // ════════════════════════════════════════════════════════════════
  function bindInput() {
    window.addEventListener("keydown", onKeyDown, false);
    window.addEventListener("keyup", onKeyUp, false);
    window.addEventListener("resize", resize, false);
    dom.canvas.addEventListener("mousedown", onCanvasDown, false);
    window.addEventListener("mousemove", onMouseMove, false);
    window.addEventListener("mouseup", onCanvasUp, false);
    dom.canvas.addEventListener("click", onCanvasClick, false);
    document.addEventListener("pointerlockchange", onLockChange, false);
    // touch
    dom.canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    dom.canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    dom.canvas.addEventListener("touchend", onTouchEnd, false);
    // joystick
    dom.stick.addEventListener("touchstart", onStickStart, { passive: false });
    dom.stick.addEventListener("touchmove", onStickMove, { passive: false });
    dom.stick.addEventListener("touchend", onStickEnd, false);
  }
  function unbindInput() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("resize", resize);
    dom.canvas.removeEventListener("mousedown", onCanvasDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onCanvasUp);
    dom.canvas.removeEventListener("click", onCanvasClick);
    document.removeEventListener("pointerlockchange", onLockChange);
    dom.canvas.removeEventListener("touchstart", onTouchStart);
    dom.canvas.removeEventListener("touchmove", onTouchMove);
    dom.canvas.removeEventListener("touchend", onTouchEnd);
    dom.stick.removeEventListener("touchstart", onStickStart);
    dom.stick.removeEventListener("touchmove", onStickMove);
    dom.stick.removeEventListener("touchend", onStickEnd);
    for (const k in keys) delete keys[k];
  }

  function onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (dom.zoom.classList.contains("on")) {
      if (k === "escape") { closeZoom(); }
      else if (k === "arrowright") zoomStep(1);
      else if (k === "arrowleft") zoomStep(-1);
      return;
    }
    if (k === "escape") { closeMuseum(); return; }
    if (k === "enter" || k === "e") { if (focusFrame) openZoom(focusFrame); return; }
    keys[k] = true;
    dismissHelp();
  }
  function onKeyUp(e) { keys[e.key.toLowerCase()] = false; }

  function onCanvasDown(e) {
    if (dom.zoom.classList.contains("on")) return;
    look.dragging = true; look.lx = e.clientX; look.ly = e.clientY; look.moved = 0;
  }
  function onCanvasUp() { look.dragging = false; }
  function onMouseMove(e) {
    if (pointerLocked) {
      yaw   -= e.movementX * 0.0022;
      pitch -= e.movementY * 0.0022;
      dismissHelp();
    } else if (look.dragging) {
      const dx = e.clientX - look.lx, dy = e.clientY - look.ly;
      look.moved = (look.moved || 0) + Math.abs(dx) + Math.abs(dy);
      yaw   -= dx * 0.004;
      pitch -= dy * 0.004;
      look.lx = e.clientX; look.ly = e.clientY;
      dismissHelp();
    }
  }
  function onCanvasClick(e) {
    if (dom.zoom.classList.contains("on")) return;
    // if we dragged, don't treat as click
    if (look.moved && look.moved > 6) { look.moved = 0; return; }
    if (!pointerLocked && focusFrame) { openZoom(focusFrame); return; }
    if (!pointerLocked) { requestPointerLock(); return; }
    if (focusFrame) openZoom(focusFrame);
  }

  function requestPointerLock() {
    if (isTouch()) return;
    try { dom.canvas.requestPointerLock(); } catch (e) {}
  }
  function exitPointerLock() {
    if (document.pointerLockElement) { try { document.exitPointerLock(); } catch (e) {} }
  }
  function onLockChange() {
    pointerLocked = document.pointerLockElement === dom.canvas;
    dom.canvas.classList.toggle("locked", pointerLocked);
    dom.reticle.classList.toggle("show", pointerLocked);
  }

  // touch drag-look (single finger on the right/free area)
  function onTouchStart(e) {
    if (dom.zoom.classList.contains("on")) return;
    const t = e.changedTouches[0];
    look.dragging = true; look.id = t.identifier; look.lx = t.clientX; look.ly = t.clientY; look.moved = 0;
  }
  function onTouchMove(e) {
    if (!look.dragging) return;
    for (const t of e.changedTouches) {
      if (t.identifier !== look.id) continue;
      const dx = t.clientX - look.lx, dy = t.clientY - look.ly;
      look.moved += Math.abs(dx) + Math.abs(dy);
      yaw -= dx * 0.005; pitch -= dy * 0.005;
      look.lx = t.clientX; look.ly = t.clientY;
      dismissHelp();
      e.preventDefault();
    }
  }
  function onTouchEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === look.id) {
        look.dragging = false;
        if (look.moved < 12 && focusFrame) openZoom(focusFrame);
      }
    }
  }

  // joystick
  function onStickStart(e) {
    const t = e.changedTouches[0];
    touch.active = true; touch.id = t.identifier;
    stickUpdate(t); e.preventDefault(); e.stopPropagation();
  }
  function onStickMove(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === touch.id) { stickUpdate(t); e.preventDefault(); e.stopPropagation(); }
    }
  }
  function onStickEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === touch.id) {
        touch.active = false; touch.dx = 0; touch.dy = 0;
        dom.stickKnob.style.transform = "translate(0,0)";
      }
    }
  }
  function stickUpdate(t) {
    const r = dom.stick.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = (t.clientX - cx) / (r.width / 2);
    let dy = (t.clientY - cy) / (r.height / 2);
    const mag = Math.hypot(dx, dy);
    if (mag > 1) { dx /= mag; dy /= mag; }
    touch.dx = dx; touch.dy = dy;
    dom.stickKnob.style.transform = "translate(" + (dx * 34) + "px," + (dy * 34) + "px)";
    dismissHelp();
  }

  // ════════════════════════════════════════════════════════════════
  //  LOOP
  // ════════════════════════════════════════════════════════════════
  function loop() {
    raf = requestAnimationFrame(loop);
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    update(dt);
    renderer.render(scene, camera);
  }

  // ════════════════════════════════════════════════════════════════
  //  HELPERS
  // ════════════════════════════════════════════════════════════════
  function aspect() { return dom.root.clientWidth / dom.root.clientHeight; }
  function resize() {
    if (!renderer || !camera) return;
    const w = dom.root.clientWidth, h = dom.root.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  function setProgress(p) { if (dom.loadFill) dom.loadFill.style.width = p + "%"; }
  function isTouch() { return ("ontouchstart" in window) || navigator.maxTouchPoints > 0; }
  function yieldFrame() { return new Promise((r) => requestAnimationFrame(() => r())); }
  function showHelp() {
    dom.help.classList.remove("gone");
    dom.help.textContent = isTouch()
      ? "Drag to look · use the ring to walk · tap a plate to study it"
      : "WASD or arrows to walk · drag or click to look · click a plate to study it · Esc to leave";
    clearTimeout(helpTimer);
    helpTimer = setTimeout(dismissHelp, 6500);
  }
  function dismissHelp() { dom.help.classList.add("gone"); }

  // ════════════════════════════════════════════════════════════════
  //  DOM
  // ════════════════════════════════════════════════════════════════
  function ensureDom() {
    if (dom.root) return;
    const root = document.createElement("div");
    root.className = "museum";
    root.id = "museum";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "The Monstrarium halls — a walkable gallery");
    root.innerHTML = `
      <canvas class="museum__canvas" id="museumCanvas"></canvas>

      <div class="museum__load" id="museumLoad">
        <div class="museum__load-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="54" height="54"><path d="M32 6 L40 24 L60 24 L44 37 L50 58 L32 45 L14 58 L20 37 L4 24 L24 24 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="32" cy="30" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="32" cy="30" r="1.8" fill="currentColor"/></svg>
        </div>
        <h2 class="museum__load-title">Entering the Halls</h2>
        <div class="museum__load-sub" id="museumLoadSub">Raising the walls and hanging the plates…</div>
        <div class="museum__load-bar"><div class="museum__load-fill" id="museumLoadFill"></div></div>
      </div>

      <div class="museum__hud">
        <div class="museum__hall">
          <span class="museum__hall-caput" id="museumHallCaput">Caput I</span>
          <span class="museum__hall-title" id="museumHallTitle">Phobias</span>
        </div>
        <button class="museum__exit" id="museumExit" type="button">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M14 7l-5 5 5 5M9 12h11M4 4v16" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>Leave</span>
        </button>
      </div>

      <div class="museum__reticle" id="museumReticle"></div>
      <div class="museum__target" id="museumTarget">
        <span class="museum__target-name" id="museumTargetName"></span>
        <span class="museum__target-hint">Click to study</span>
      </div>

      <div class="museum__help" id="museumHelp"></div>

      <div class="museum__stick" id="museumStick"><div class="museum__stick-knob" id="museumStickKnob"></div></div>

      <div class="museum__zoom" id="museumZoom" aria-hidden="true">
        <button class="museum__zoom-nav museum__zoom-nav--prev" id="museumZoomPrev" type="button" aria-label="Previous plate">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="museum__zoom-frame">
          <button class="museum__zoom-close" id="museumZoomClose" type="button" aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>
          </button>
          <img class="museum__zoom-img" id="museumZoomImg" alt="" />
          <div class="museum__zoom-cap">
            <span class="museum__zoom-name" id="museumZoomName"></span>
            <span class="museum__zoom-chapter" id="museumZoomChapter"></span>
          </div>
        </div>
        <button class="museum__zoom-nav museum__zoom-nav--next" id="museumZoomNext" type="button" aria-label="Next plate">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    `;
    document.body.appendChild(root);

    dom = {
      root,
      canvas: root.querySelector("#museumCanvas"),
      load: root.querySelector("#museumLoad"),
      loadSub: root.querySelector("#museumLoadSub"),
      loadFill: root.querySelector("#museumLoadFill"),
      hallCaput: root.querySelector("#museumHallCaput"),
      hallTitle: root.querySelector("#museumHallTitle"),
      exit: root.querySelector("#museumExit"),
      reticle: root.querySelector("#museumReticle"),
      target: root.querySelector("#museumTarget"),
      targetName: root.querySelector("#museumTargetName"),
      help: root.querySelector("#museumHelp"),
      stick: root.querySelector("#museumStick"),
      stickKnob: root.querySelector("#museumStickKnob"),
      zoom: root.querySelector("#museumZoom"),
      zoomImg: root.querySelector("#museumZoomImg"),
      zoomName: root.querySelector("#museumZoomName"),
      zoomChapter: root.querySelector("#museumZoomChapter"),
    };

    dom.exit.addEventListener("click", closeMuseum);
    root.querySelector("#museumZoomClose").addEventListener("click", closeZoom);
    root.querySelector("#museumZoomPrev").addEventListener("click", () => zoomStep(-1));
    root.querySelector("#museumZoomNext").addEventListener("click", () => zoomStep(1));
    dom.zoom.addEventListener("click", (e) => { if (e.target === dom.zoom) closeZoom(); });
  }

})();
