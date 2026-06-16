/* ═══════════════════════════════════════════════════════════════
   Monstrarium of Representation — book engine (v3)
   Real cover & back art · two-page spread · clean page-turn ·
   per-page folios · hover loupe on plates · proper open/close.
═══════════════════════════════════════════════════════════════ */

(() => {
  const book = document.getElementById("book");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const reader = document.getElementById("reader");
  const hint = document.getElementById("hint");
  const soundBtn = document.getElementById("soundBtn");
  const fsBtn = document.getElementById("fsBtn");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Build the ordered list of faces ────────────────────────────
  // front cover → opening page (generic intro) → plates → colophon → back cover
  const faces = [];
  faces.push({ type: "cover" });
  faces.push({ type: "intro" });
  MONSTERS.forEach((m, i) => faces.push({ type: "plate", monster: m, index: i }));
  faces.push({ type: "colophon" });
  faces.push({ type: "back" });

  // pair faces into physical leaves (2 faces per sheet)
  if (faces.length % 2 !== 0) faces.push({ type: "blank" });
  const leaves = [];
  for (let i = 0; i < faces.length; i += 2) leaves.push({ front: faces[i], back: faces[i + 1] });
  const totalLeaves = leaves.length;
  const lastFaceBlank = faces[faces.length - 1].type === "blank";
  const maxLeaf = lastFaceBlank ? totalLeaves - 1 : totalLeaves;

  function roman(n) {
    const map = [["M",1000],["CM",900],["D",500],["CD",400],["C",100],["XC",90],["L",50],["XL",40],["X",10],["IX",9],["V",5],["IV",4],["I",1]];
    let out = ""; map.forEach(([s,v]) => { while (n >= v) { out += s; n -= v; } });
    return out;
  }

  // ── Render a face's inner HTML ──────────────────────────────────
  function renderFace(face) {
    if (!face || face.type === "blank") return `<div class="paper"></div>`;

    if (face.type === "cover") {
      return `<div class="art-face art-face--cover">
        <img class="art-img" src="assets/book/cover.webp" alt="Monstrarium of Representation — front cover" />
      </div>`;
    }
    if (face.type === "back") {
      return `<div class="art-face art-face--back">
        <img class="art-img" src="assets/book/back.webp" alt="Monstrarium of Representation — back cover" />
      </div>`;
    }

    if (face.type === "intro") {
      const paras = FRONT_MATTER.paragraphs.map((p, i) =>
        i === 0 ? `<p><span class="drop">${p[0]}</span>${p.slice(1)}</p>` : `<p>${p}</p>`
      ).join("");
      return `<div class="paper"></div><div class="page-pad intro">
        <div class="intro-head">
          <div class="intro-kicker">Monstrarium</div>
          <h1>${FRONT_MATTER.title}</h1>
          <div class="intro-motto">${FRONT_MATTER.motto}</div>
        </div>
        <div class="intro-body">${paras}</div>
        <div class="intro-foot"><span class="orn">&#10070;</span>&nbsp;${FRONT_MATTER.foot}&nbsp;<span class="orn">&#10070;</span></div>
      </div>`;
    }

    if (face.type === "plate") {
      const m = face.monster;
      const folio = `${roman(face.index + 1)} &middot; ${m.name} &middot; embodiment of ${m.subject}`;
      const src = `assets/plates/${m.id}.webp`;
      return `<div class="plate" data-zoom="${src}">
        <div class="plate__img-wrap">
          <img class="plate__img" src="${src}" alt="${m.name}, ${m.title}, embodiment of ${m.subject}" draggable="false" />
        </div>
        <div class="plate__folio">${folio}</div>
      </div>`;
    }

    if (face.type === "colophon") {
      const paras = COLOPHON.paragraphs.map(p => `<p>${p}</p>`).join("");
      return `<div class="paper"></div><div class="page-pad colophon">
        <div class="colophon-mark" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="46" class="ink-line"/>
            <circle cx="60" cy="60" r="38" class="ink-line thin"/>
            <path class="ink-line" d="M60 20 L64 56 L100 60 L64 64 L60 100 L56 64 L20 60 L56 56 Z"/>
            <circle cx="60" cy="60" r="5" class="ink-fill"/>
            <path class="ink-line thin" d="M60 14v8M60 98v8M14 60h8M98 60h8"/>
          </svg>
        </div>
        <h1>${COLOPHON.title}</h1>
        <div class="intro-rule"></div>
        <div class="colophon-body">${paras}</div>
        <div class="intro-foot small">${COLOPHON.foot}</div>
      </div>`;
    }
    return `<div class="paper"></div>`;
  }

  // ── Build leaves into the DOM ───────────────────────────────────
  leaves.forEach((leaf, idx) => {
    const page = document.createElement("div");
    page.className = "page";
    page.dataset.leaf = idx;
    page.innerHTML = `
      <div class="face face--front">${renderFace(leaf.front)}<div class="spine-shade"></div><div class="turn-shade turn-shade--front"></div></div>
      <div class="face face--back">${renderFace(leaf.back)}<div class="spine-shade"></div><div class="turn-shade turn-shade--back"></div></div>
    `;
    book.appendChild(page);
  });
  const pageEls = Array.from(book.querySelectorAll(".page"));

  // ── State ───────────────────────────────────────────────────────
  let currentLeaf = 0;   // number of leaves already flipped
  let animating = false;

  // Stack the leaves in depth so faces never share a plane (kills z-fighting
  // that produced the "fanned pages" glitch mid-turn). Unturned leaves lean a
  // hair toward the viewer on the right; turned leaves stack on the left.
  const DEPTH = 0.6; // px per leaf

  function applyResting() {
    pageEls.forEach((p, i) => {
      const flipped = i < currentLeaf;
      p.classList.toggle("flipped", flipped);
      // depth: pages near the spine sit lowest; outer pages lift slightly.
      // turned pages (left) and unturned (right) get separated z translation.
      if (flipped) {
        const d = (currentLeaf - i) * DEPTH;          // further-back turned pages sit deeper
        p.style.zIndex = i;                            // earlier leaves below later turned ones
        p.style.transform = `translateZ(${-d}px) rotateY(-180deg)`;
      } else {
        const d = (i - currentLeaf) * DEPTH;           // further-ahead pages sit deeper
        p.style.zIndex = totalLeaves - i;              // top unturned leaf highest
        p.style.transform = `translateZ(${-d}px) rotateY(0deg)`;
      }
    });
  }

  function updateChrome() {
    applyResting();

    prevBtn.disabled = currentLeaf === 0;
    nextBtn.disabled = currentLeaf >= maxLeaf;

    const closed = currentLeaf === 0;
    const atBack = currentLeaf >= maxLeaf;
    book.classList.toggle("closed", closed);
    book.classList.toggle("at-back", atBack);
  }

  // ── Turn logic ──────────────────────────────────────────────────
  const TURN_MS = reduceMotion ? 20 : 1000;

  function turnNext() {
    if (animating || currentLeaf >= maxLeaf) return;
    animating = true;
    book.classList.add("turning");
    const p = pageEls[currentLeaf];
    p.classList.add("is-turning");
    p.style.transition = "none";
    p.style.zIndex = 999;
    // start from rest then animate to flipped on next frame
    requestAnimationFrame(() => {
      p.style.transition = "";
      p.classList.add("flipped");
      p.style.transform = `translateZ(0px) rotateY(-180deg)`;
    });
    Atmos.sfx("rustle");
    setTimeout(() => {
      currentLeaf++;
      p.classList.remove("is-turning");
      book.classList.remove("turning");
      animating = false;
      updateChrome();
      hideHint();
    }, TURN_MS);
  }

  function turnPrev() {
    if (animating || currentLeaf <= 0) return;
    animating = true;
    book.classList.add("turning");
    const p = pageEls[currentLeaf - 1];
    p.classList.add("is-turning");
    p.style.transition = "none";
    p.style.zIndex = 999;
    requestAnimationFrame(() => {
      p.style.transition = "";
      p.classList.remove("flipped");
      p.style.transform = `translateZ(0px) rotateY(0deg)`;
    });
    Atmos.sfx("rustle");
    setTimeout(() => {
      currentLeaf--;
      p.classList.remove("is-turning");
      book.classList.remove("turning");
      animating = false;
      updateChrome();
    }, TURN_MS);
  }

  // ── Click zones on the book (left half = prev, right half = next) ──
  book.addEventListener("click", (e) => {
    if (animating) return;
    // don't treat a loupe drag-release as a turn
    const rect = book.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (currentLeaf === 0) { turnNext(); return; }
    if (currentLeaf >= maxLeaf) { turnPrev(); return; }
    if (x < rect.width * 0.42) turnPrev();
    else if (x > rect.width * 0.58) turnNext();
  });

  // ── Drag-corner page peel ───────────────────────────────────────
  let drag = null;
  function getXY(e) {
    const t = e.touches ? e.touches[0] : e;
    const rect = book.getBoundingClientRect();
    return { x: t.clientX - rect.left, y: t.clientY - rect.top, rect };
  }
  function pointerDown(e) {
    if (animating) return;
    const { x, rect } = getXY(e);
    const nearRight = x > rect.width * 0.62;
    const nearLeft = x < rect.width * 0.38;
    if (nearRight && currentLeaf < maxLeaf) drag = { dir: "next", startX: x, rect, page: pageEls[currentLeaf] };
    else if (nearLeft && currentLeaf > 0) drag = { dir: "prev", startX: x, rect, page: pageEls[currentLeaf - 1] };
    else return;
    book.classList.add("turning");
    drag.page.classList.add("is-turning");
    drag.page.style.transition = "none";
    drag.page.style.zIndex = 999;
  }
  function pointerMove(e) {
    if (!drag) return;
    const { x } = getXY(e);
    let frac;
    if (drag.dir === "next") {
      frac = Math.min(Math.max((drag.startX - x) / drag.rect.width, 0), 1);
      drag.page.style.transform = `translateZ(0px) rotateY(${-180 * frac}deg)`;
    } else {
      frac = Math.min(Math.max((x - drag.startX) / drag.rect.width, 0), 1);
      drag.page.style.transform = `translateZ(0px) rotateY(${-180 + 180 * frac}deg)`;
    }
    drag.frac = frac;
    if (e.cancelable) e.preventDefault();
  }
  function pointerUp() {
    if (!drag) return;
    const d = drag; drag = null;
    d.page.style.transition = "";
    d.page.classList.remove("is-turning");
    book.classList.remove("turning");
    if ((d.frac || 0) > 0.3) {
      // commit: clear inline transform so the animated turn takes over
      d.page.style.transform = "";
      if (d.dir === "next") turnNext(); else turnPrev();
    } else {
      d.page.style.transform = "";
      updateChrome();
    }
  }
  book.addEventListener("mousedown", pointerDown);
  window.addEventListener("mousemove", pointerMove);
  window.addEventListener("mouseup", pointerUp);
  book.addEventListener("touchstart", pointerDown, { passive: true });
  book.addEventListener("touchmove", pointerMove, { passive: false });
  book.addEventListener("touchend", pointerUp);

  // ── Reading magnifier ──────────────────────────────────────────
  // A large panel anchored to the side opposite the cursor shows the area
  // under the pointer at high zoom. Because the panel is independent of the
  // cursor, every part of a plate — including the extreme left margin — is
  // reachable and never hidden beneath the lens.
  const ZOOM = 2.7;
  let readerSrc = null;

  function hideReader() { reader.classList.remove("on"); reader.style.backgroundImage = ""; readerSrc = null; }

  function onPlateMove(e) {
    if (animating || drag) { hideReader(); return; }
    const wrap = e.currentTarget;
    const plate = wrap.closest(".plate");
    const src = plate.dataset.zoom;
    const r = wrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    if (px < 0 || px > 1 || py < 0 || py > 1) { hideReader(); return; }

    if (src !== readerSrc) { reader.style.backgroundImage = `url("${src}")`; readerSrc = src; }
    // panel jumps to whichever side gives the most room and avoids the cursor
    const onLeftHalf = e.clientX < window.innerWidth / 2;
    reader.classList.toggle("reader--right", onLeftHalf);
    reader.classList.toggle("reader--left", !onLeftHalf);

    // scale the magnified plate to the panel height × zoom, width by image ratio,
    // then position it so the exact point under the cursor lands in the
    // CENTRE of the reader panel. Percentage background-position mis-tracks at
    // the edges, so we compute the offset in pixels instead.
    const pw = reader.offsetWidth;
    const ph = reader.offsetHeight;
    const bgH = ph * ZOOM;
    const bgW = bgH * (r.width / r.height);
    // x/y of the cursor point within the scaled background image (px)
    const cx = px * bgW;
    const cy = py * bgH;
    // shift so that point sits at the panel's centre, clamped to image bounds
    let posX = pw / 2 - cx;
    let posY = ph / 2 - cy;
    posX = Math.min(0, Math.max(pw - bgW, posX));
    posY = Math.min(0, Math.max(ph - bgH, posY));
    reader.style.backgroundSize = `${bgW}px ${bgH}px`;
    reader.style.backgroundPosition = `${posX}px ${posY}px`;
    reader.classList.add("on");
  }

  function bindReader(plate) {
    const wrap = plate.querySelector(".plate__img-wrap");
    wrap.addEventListener("mousemove", onPlateMove);
    wrap.addEventListener("mouseenter", onPlateMove);
    wrap.addEventListener("mouseleave", hideReader);
  }
  book.querySelectorAll(".plate").forEach(bindReader);
  // hide the reader whenever a turn begins
  book.addEventListener("mousedown", hideReader);

  // ── Buttons & keyboard ──────────────────────────────────────────
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); turnNext(); });
  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); turnPrev(); });
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "PageDown") turnNext();
    else if (e.key === "ArrowLeft" || e.key === "PageUp") turnPrev();
  });

  // ── Sound + fullscreen ──────────────────────────────────────────
  soundBtn.addEventListener("click", () => {
    const on = Atmos.toggleDrone();
    soundBtn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  fsBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  // ── Hint ────────────────────────────────────────────────────────
  let hintHidden = false;
  function hideHint() { if (!hintHidden) { hint.classList.add("hidden"); hintHidden = true; } }
  setTimeout(hideHint, 7000);

  // ── Responsive sizing — make the book as large as possible ──────
  function sizeBook() {
    const ratio = 1492 / 1054; // h/w
    const mobile = window.innerWidth <= 820;
    const chromeV = mobile ? 150 : 120;
    const sideReserve = mobile ? 24 : 180;
    const availH = window.innerHeight - chromeV;
    let w;
    if (mobile) {
      w = Math.min(window.innerWidth - sideReserve, 560);
    } else {
      w = Math.min((window.innerWidth - sideReserve) / 2, 600);
    }
    if (w * ratio > availH) w = availH / ratio;
    w = Math.max(w, 240);
    document.documentElement.style.setProperty("--page-w", `${Math.round(w)}px`);
    document.documentElement.style.setProperty("--page-h", `${Math.round(w * ratio)}px`);
  }
  window.addEventListener("resize", sizeBook);
  sizeBook();

  // ── Dust motes ──────────────────────────────────────────────────
  if (!reduceMotion) {
    const layer = document.getElementById("dustLayer");
    const N = window.innerWidth < 700 ? 12 : 24;
    for (let i = 0; i < N; i++) {
      const d = document.createElement("div");
      d.className = "dust";
      d.style.left = Math.random() * 100 + "vw";
      d.style.top = (60 + Math.random() * 50) + "vh";
      const dur = 16 + Math.random() * 24;
      d.style.animationDuration = dur + "s";
      d.style.animationDelay = -Math.random() * dur + "s";
      const s = 1 + Math.random() * 2.4;
      d.style.width = d.style.height = s + "px";
      layer.appendChild(d);
    }
  }

  updateChrome();
})();
