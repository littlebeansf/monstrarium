/* ════════════════════════════════════════════════════════════════
   MONSTRARIUM — 3D MUSEUM  (js/museum.js)

   A first-person walkable gallery that hangs every plate of the codex
   on the walls of a long enfilade of candlelit stone halls — one hall
   per chapter, in order. Reads the same CHAPTERS / MONSTERS data the
   book uses; no new asset pipeline.

   PERFORMANCE (paramount — this is a full rewrite of the world builder
   after an earlier version crashed browsers):
   • Three.js is imported lazily on first open — the book's initial
     load is untouched.
   • ZERO dynamic lights. Everything uses MeshBasicMaterial (unlit), so
     the GPU never does per-fragment lighting math and shaders never get
     recompiled per light count. Mood comes from flat warm colours +
     THREE.Fog + additive glow sprites that cast NO light.
   • Geometry and materials are created ONCE in a shared SHARED{} pool
     and reused (meshes are just scaled/positioned) — few unique buffers.
   • Halls are built LAZILY: only the current hall ± HALL_WINDOW are in
     the scene at once. Distant halls are disposed. Each hall is built
     across animation frames (await yieldFrame) so the main thread never
     freezes.
   • Plate TEXTURES stream in only for frames near the player and are
     disposed when far away. Distant frames show a parchment placeholder.
   • devicePixelRatio capped at 2. Fog + tight camera far plane.

   INTEGRATION: standalone. Exposes window.MonstrariumMuseum with
   .open(startChapterIndex) / .close() / .isOpen(). No edits to book.js.
   ════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  // ── Config ──────────────────────────────────────────────────────
  const THREE_URL = "https://unpkg.com/three@0.160.0/build/three.module.js";
  const PLATE_DIR = "assets/plates/";

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
  const HALL_WINDOW  = 2;        // keep current hall ± this many built

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
  let halls = [];            // { index, chapter, caput, title, zStart, zEnd, ... built, group, frameRefs[] }
  let frames = [];           // persistent registry of ALL currently-built frames (for zoom nav + streaming)
  let totalDepth = 0;
  let dom = {};              // overlay elements
  let touch = { active: false, id: null, dx: 0, dy: 0 };       // joystick
  let look = { dragging: false, id: null, lx: 0, ly: 0, moved: 0 }; // drag-look
  let pointerLocked = false;
  let currentHall = -1;
  let builtWindowCenter = -999; // last hall index we built the window around
  let focusFrame = null;     // frame currently under reticle
  let zoomIndex = -1;        // index into frames for zoom nav
  let helpTimer = 0;
  let placeholderTex = null;
  let glowTex = null;
  const loadQueue = [];
  let activeLoads = 0;
  const MAX_LOADS = 4;

  // Shared geometry + materials — created ONCE, reused everywhere.
  const SHARED = {};

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
      setProgress(28);
      await buildWorld();          // scene + shared assets + hall layout (NO geometry yet)
      inited = true;
    }

    // build the halls around the requested start BEFORE revealing
    const startIdx = Math.max(0, Math.min(halls.length - 1, startChapter || 0));
    setProgress(55);
    await ensureHallsAround(startIdx);
    setProgress(100);

    // place player at the requested hall's entrance
    spawnAtHall(startIdx);
    updateHallLabel(true);

    running = true;
    clock = clock || new THREE.Clock();
    clock.start();
    bindInput();
    setTimeout(() => dom.load.classList.add("hidden"), 240);
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
  //  WORLD CONSTRUCTION  (unlit + lazy)
  // ════════════════════════════════════════════════════════════════
  async function buildWorld() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0805);
    // tighter fog so only a couple of halls are ever visible at once
    scene.fog = new THREE.Fog(0x0b0805, 14, 52);

    camera = new THREE.PerspectiveCamera(70, aspect(), 0.1, 120);

    renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    resize();
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // unlit materials — no tone mapping needed; keep colours as authored.

    texLoader = new THREE.TextureLoader();
    placeholderTex = makePlaceholderTexture();
    glowTex = makeGlowTexture();

    buildSharedAssets();
    layoutHalls();

    await yieldFrame();
  }

  // Create every geometry + material exactly once. -------------------
  function buildSharedAssets() {
    // unit primitives (scale meshes rather than making new geometry)
    SHARED.unitPlane = new THREE.PlaneGeometry(1, 1);
    SHARED.unitBox   = new THREE.BoxGeometry(1, 1, 1);
    SHARED.glowPlane = new THREE.PlaneGeometry(1, 1);

    // frame geometry (fixed size — one border + one plate quad, reused)
    SHARED.frameBorder = new THREE.BoxGeometry(PLATE_W + 0.34, PLATE_H + 0.34, 0.12);
    SHARED.framePlate  = new THREE.PlaneGeometry(PLATE_W, PLATE_H);

    // fixture sphere for the faux track-lights
    SHARED.fixtureSphere = new THREE.SphereGeometry(0.13, 10, 10);

    // unlit materials — flat warm palette tuned to read as candlelit stone
    SHARED.floorMat  = new THREE.MeshBasicMaterial({ color: 0x241a10, fog: true });
    SHARED.runnerMat = new THREE.MeshBasicMaterial({ color: 0x3a1512, fog: true });
    SHARED.wallMat   = new THREE.MeshBasicMaterial({ color: 0x1c140b, fog: true });
    SHARED.wallLoMat = new THREE.MeshBasicMaterial({ color: 0x120c07, fog: true }); // lower/darker band
    SHARED.ceilMat   = new THREE.MeshBasicMaterial({ color: 0x0c0805, fog: true });
    SHARED.trimMat   = new THREE.MeshBasicMaterial({ color: 0x8a6a2c, fog: true }); // gilt
    SHARED.trimLitMat= new THREE.MeshBasicMaterial({ color: 0xc9a14a, fog: true }); // brighter gilt
    SHARED.benchMat  = new THREE.MeshBasicMaterial({ color: 0x2a1d10, fog: true });
    SHARED.fixtureMat= new THREE.MeshBasicMaterial({ color: 0xffd79a, fog: true }); // glowing bulb look
    SHARED.plaqueMat = null; // per-hall (unique text texture) — tracked as disposable

    // additive glow sprite material (shared; casts no light)
    SHARED.glowMat = new THREE.MeshBasicMaterial({
      map: glowTex, transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, fog: false, color: 0xffb457
    });
  }

  // Make a plain flat mesh from a shared geometry+material, scaled.
  function panel(geo, mat, sx, sy, sz) {
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(sx, sy, sz || 1);
    return m;
  }

  // ── Hall layout: chapter -> [zStart, zEnd] along +Z ─────────────
  function layoutHalls() {
    halls = [];
    let z = 0;
    const chs = chapters();
    for (let i = 0; i < chs.length; i++) {
      const ch = chs[i];
      const n = ch.monsters.length;
      const perWall = Math.ceil(n / 2);
      const len = Math.max(12, perWall * SLOT_GAP + HALL_PAD_END * 2);
      halls.push({
        index: i,
        chapter: ch,
        caput: ch.caput,
        title: ch.title,
        slug: ch.slug,
        zStart: z,
        zEnd: z + len,
        centerZ: z + len / 2,
        perWall,
        built: false,
        group: null,
        frameRefs: [],   // frame objects owned by this hall
        disposables: []  // per-hall unique geo/mat/tex to dispose
      });
      z += len;
    }
    totalDepth = z;
  }

  // ════════════════════════════════════════════════════════════════
  //  LAZY HALL WINDOW — build current ± HALL_WINDOW, dispose the rest
  // ════════════════════════════════════════════════════════════════
  let ensuring = false;
  async function ensureHallsAround(idx) {
    if (idx === builtWindowCenter || ensuring) return;
    ensuring = true;
    builtWindowCenter = idx;
    const lo = Math.max(0, idx - HALL_WINDOW);
    const hi = Math.min(halls.length - 1, idx + HALL_WINDOW);

    // dispose halls outside the window
    for (let i = 0; i < halls.length; i++) {
      if ((i < lo || i > hi) && halls[i].built) disposeHall(halls[i]);
    }
    // build halls inside the window (nearest first), yielding between each
    const order = [];
    for (let i = lo; i <= hi; i++) order.push(i);
    order.sort((a, b) => Math.abs(a - idx) - Math.abs(b - idx));
    for (const i of order) {
      if (!halls[i].built) {
        buildHall(halls[i]);
        await yieldFrame();
      }
    }
    ensuring = false;
  }

  function buildHall(h) {
    const g = new THREE.Group();
    const len = h.zEnd - h.zStart;
    const cz = h.centerZ;

    // floor
    const floor = panel(SHARED.unitPlane, SHARED.floorMat, HALL_HALF_W * 2, len);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, cz);
    g.add(floor);

    // carpet runner
    const runner = panel(SHARED.unitPlane, SHARED.runnerMat, 2.2, len - 0.5);
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.012, cz);
    g.add(runner);

    // ceiling
    const ceil = panel(SHARED.unitPlane, SHARED.ceilMat, HALL_HALF_W * 2, len);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, WALL_H, cz);
    g.add(ceil);

    // side walls (two-tone: darker lower band, lighter upper) + baseboard trim
    for (const sign of [-1, 1]) {
      const upH = WALL_H - 1.6;
      const up = panel(SHARED.unitPlane, SHARED.wallMat, len, upH);
      up.position.set(sign * HALL_HALF_W, 1.6 + upH / 2, cz);
      up.rotation.y = sign > 0 ? -Math.PI / 2 : Math.PI / 2;
      g.add(up);
      const lo = panel(SHARED.unitPlane, SHARED.wallLoMat, len, 1.6);
      lo.position.set(sign * HALL_HALF_W, 0.8, cz);
      lo.rotation.y = sign > 0 ? -Math.PI / 2 : Math.PI / 2;
      g.add(lo);
      // baseboard trim
      const base = panel(SHARED.unitBox, SHARED.trimMat, 0.12, 0.28, len);
      base.position.set(sign * (HALL_HALF_W - 0.06), 0.16, cz);
      g.add(base);
      // picture-rail gilt line at plate height
      const rail = panel(SHARED.unitBox, SHARED.trimMat, 0.08, 0.08, len);
      rail.position.set(sign * (HALL_HALF_W - 0.05), 4.3, cz);
      g.add(rail);
    }

    // end walls with doorways (first hall gets a solid near wall; last a solid back wall)
    addEndWall(g, h.zStart, h.index === 0);                     // near end
    if (h.index === halls.length - 1) addEndWall(g, h.zEnd, true); // final solid back wall

    // hall plaque above the entrance (unique text texture — disposable)
    addHallPlaque(g, h);

    // faux track lighting: fixture bulbs + additive glow quads (NO real lights)
    const nLights = Math.max(2, Math.round(len / 9));
    for (let l = 0; l < nLights; l++) {
      const lz = h.zStart + (len * (l + 0.5)) / nLights;
      const fix = new THREE.Mesh(SHARED.fixtureSphere, SHARED.fixtureMat);
      fix.position.set(0, WALL_H - 0.9, lz);
      g.add(fix);
      // downward-facing glow quad under each bulb (billboard-ish, static)
      const glow = new THREE.Mesh(SHARED.glowPlane, SHARED.glowMat);
      glow.scale.set(9, 9, 1);
      glow.position.set(0, WALL_H - 2.4, lz);
      glow.rotation.x = -Math.PI / 2 + 0.0001;
      g.add(glow);
    }

    // bench in larger halls
    if (len > 14) {
      const bench = panel(SHARED.unitBox, SHARED.benchMat, 2.4, 0.5, 0.7);
      bench.position.set(0, 0.25, cz);
      g.add(bench);
    }

    // plates
    buildFramesForHall(h, g);

    scene.add(g);
    h.group = g;
    h.built = true;
  }

  function disposeHall(h) {
    if (!h.built) return;
    // remove this hall's frames from the global registry + queues
    for (const f of h.frameRefs) {
      if (f === focusFrame) focusFrame = null;
      const gi = frames.indexOf(f);
      if (gi >= 0) frames.splice(gi, 1);
      const qi = loadQueue.indexOf(f);
      if (qi >= 0) loadQueue.splice(qi, 1);
      if (f.tex) { f.tex.dispose(); f.tex = null; }
      if (f.mat) f.mat.dispose();          // per-frame material is unique
    }
    h.frameRefs.length = 0;
    // dispose per-hall unique resources (plaque texture/material)
    for (const d of h.disposables) { if (d && d.dispose) d.dispose(); }
    h.disposables.length = 0;
    // remove the group (shared geometry/materials are NOT disposed)
    if (h.group) { scene.remove(h.group); h.group = null; }
    h.built = false;
  }

  function addEndWall(g, z, solid) {
    if (solid) {
      const w = panel(SHARED.unitPlane, SHARED.wallMat, HALL_HALF_W * 2, WALL_H);
      w.position.set(0, WALL_H / 2, z);
      g.add(w);
      const wb = panel(SHARED.unitPlane, SHARED.wallMat, HALL_HALF_W * 2, WALL_H);
      wb.position.set(0, WALL_H / 2, z);
      wb.rotation.y = Math.PI;
      g.add(wb);
      return;
    }
    // wall with a central doorway — side panels + lintel, double-sided
    const side = (HALL_HALF_W * 2 - DOOR_W) / 2;
    for (const sgn of [-1, 1]) {
      const px = sgn * (DOOR_W / 2 + side / 2);
      for (const ry of [0, Math.PI]) {
        const p = panel(SHARED.unitPlane, SHARED.wallMat, side, WALL_H);
        p.position.set(px, WALL_H / 2, z);
        p.rotation.y = ry;
        g.add(p);
      }
    }
    // lintel above the door
    for (const ry of [0, Math.PI]) {
      const lintel = panel(SHARED.unitPlane, SHARED.wallMat, DOOR_W, WALL_H - DOOR_H);
      lintel.position.set(0, DOOR_H + (WALL_H - DOOR_H) / 2, z);
      lintel.rotation.y = ry;
      g.add(lintel);
    }
    // gilt door jambs + lintel trim
    for (const sgn of [-1, 1]) {
      const j = panel(SHARED.unitBox, SHARED.trimLitMat, 0.16, DOOR_H, 0.16);
      j.position.set(sgn * DOOR_W / 2, DOOR_H / 2, z);
      g.add(j);
    }
    const top = panel(SHARED.unitBox, SHARED.trimLitMat, DOOR_W + 0.32, 0.16, 0.16);
    top.position.set(0, DOOR_H, z);
    g.add(top);
  }

  function addHallPlaque(g, h) {
    const tex = makeTextTexture("CAPUT " + h.caput, h.title);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: true });
    const plq = new THREE.Mesh(SHARED.unitPlane, mat);
    plq.scale.set(2.6, 0.9, 1);
    plq.position.set(0, DOOR_H + 0.55, h.zStart + 0.06);
    g.add(plq);
    h.disposables.push(tex, mat);
  }

  function buildFramesForHall(h, g) {
    const mons = h.chapter.monsters;
    let leftCount = 0, rightCount = 0;
    for (let k = 0; k < mons.length; k++) {
      const m = mons[k];
      const onLeft = (k % 2 === 0);
      const slot = onLeft ? leftCount++ : rightCount++;
      const z = h.zStart + HALL_PAD_END + slot * SLOT_GAP + SLOT_GAP / 2;
      const x = (onLeft ? -1 : 1) * (HALL_HALF_W - WALL_INSET);
      addFrame(h, g, {
        file: m.file, name: m.name, caput: h.caput, chapterTitle: h.title,
        x, z, faceRight: onLeft
      });
    }
  }

  function addFrame(h, g, o) {
    const group = new THREE.Group();
    // gilt border (shared geometry + shared material)
    const border = new THREE.Mesh(SHARED.frameBorder, SHARED.trimMat);
    group.add(border);
    // plate quad — UNLIT, full brightness. Material is unique per frame
    // (its .map changes as the texture streams in) so it's disposable.
    const mat = new THREE.MeshBasicMaterial({ map: placeholderTex, fog: true });
    const plate = new THREE.Mesh(SHARED.framePlate, mat);
    plate.position.z = 0.075;
    group.add(plate);

    group.position.set(o.x, 2.55, o.z);
    group.rotation.y = o.faceRight ? Math.PI / 2 : -Math.PI / 2;
    g.add(group);

    const f = {
      group, plate, mat,
      file: o.file, name: o.name, caput: o.caput, chapterTitle: o.chapterTitle,
      x: o.x, z: o.z,
      loaded: false, loading: false, tex: null
    };
    frames.push(f);
    h.frameRefs.push(f);
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
    if (loadQueue.length > 1) loadQueue.sort((a, b) =>
      (Math.hypot(a.x - pos.x, a.z - pos.z)) - (Math.hypot(b.x - pos.x, b.z - pos.z)));
    while (activeLoads < MAX_LOADS && loadQueue.length) {
      const f = loadQueue.shift();
      if (Math.hypot(f.x - pos.x, f.z - pos.z) > STREAM_FAR) { f.loading = false; continue; }
      activeLoads++;
      texLoader.load(PLATE_DIR + f.file,
        (tex) => {
          activeLoads--;
          // frame may have been disposed while loading
          if (!f.mat || frames.indexOf(f) < 0) { tex.dispose(); pumpQueue(); return; }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          f.tex = tex;
          f.mat.map = tex;
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
    f.mat.needsUpdate = true;
    f.loaded = false;
  }

  // ════════════════════════════════════════════════════════════════
  //  CANVAS TEXTURES (placeholder + glow + plaques)
  // ════════════════════════════════════════════════════════════════
  function makePlaceholderTexture() {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 180;
    const g = c.getContext("2d");
    g.fillStyle = "#2a2016"; g.fillRect(0, 0, c.width, c.height);
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

  function makeGlowTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(64, 64, 2, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,200,130,0.9)");
    grd.addColorStop(0.35, "rgba(255,170,90,0.35)");
    grd.addColorStop(1, "rgba(255,150,70,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
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
      const dz = (mf * cos - ms * sin) * speed;
      const dx = (mf * sin + ms * cos) * speed;
      tryMove(pos.x + dx, pos.z + dz);
    }
    applyCamera();
    streamTextures();
    updateHallLabel(false);
    updateFocus();

    // lazy hall window follows the player (kicks off async build; safe to call every frame)
    const ci = currentHallIndex();
    if (ci !== builtWindowCenter) ensureHallsAround(ci);
  }

  function tryMove(nx, nz) {
    const margin = 0.5;
    nz = Math.max(0.8, Math.min(totalDepth - 0.8, nz));
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

  // ── Reticle focus (proximity + facing check) ────────────────────
  function updateFocus() {
    let best = null, bestD = 7.5;
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      const dx = f.x - pos.x, dz = f.z - pos.z;
      const d = Math.hypot(dx, dz);
      if (d > bestD) continue;
      const fdx = Math.sin(yaw), fdz = Math.cos(yaw);
      const dot = (dx * fdx + dz * fdz) / (d || 1);
      if (dot < 0.55) continue;
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
    if (zoomIndex < 0 || !frames.length) return;
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
    dom.canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    dom.canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    dom.canvas.addEventListener("touchend", onTouchEnd, false);
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
