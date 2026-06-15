/* ═══════════════════════════════════════════════════════════════
   The Monstrarium — book engine (v2)
   Real cover & back art · single full plate per leaf · side pagination.
═══════════════════════════════════════════════════════════════ */

(() => {
  const book = document.getElementById("book");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const navTitle = document.getElementById("navTitle");
  const navProgress = document.getElementById("navProgress");
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
      return `<div class="plate">
        <div class="plate__img-wrap">
          <img class="plate__img" src="assets/plates/${m.id}.webp" alt="${m.name}, ${m.title}, embodiment of ${m.subject}" />
        </div>
        <div class="plate__folio">${folio}</div>
      </div>`;
    }

    if (face.type === "colophon") {
      const paras = COLOPHON.paragraphs.map(p => `<p>${p}</p>`).join("");
      return `<div class="paper"></div><div class="page-pad colophon">
        <div class="colophon-mark" aria-hidden="true">
          <!-- in-style drawn ornament: concentric ring + faint compass star, ink line -->
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
      <div class="face face--front">${renderFace(leaf.front)}<div class="spine-shade"></div></div>
      <div class="face face--back">${renderFace(leaf.back)}<div class="spine-shade"></div></div>
    `;
    book.appendChild(page);
  });
  const pageEls = Array.from(book.querySelectorAll(".page"));

  // ── State ───────────────────────────────────────────────────────
  let currentLeaf = 0;   // number of leaves already flipped
  let animating = false;

  function updateChrome() {
    pageEls.forEach((p, i) => {
      if (i < currentLeaf) { p.classList.add("flipped"); p.style.zIndex = i; }
      else { p.classList.remove("flipped"); p.style.zIndex = totalLeaves - i; }
    });

    prevBtn.disabled = currentLeaf === 0;
    nextBtn.disabled = currentLeaf >= maxLeaf;

    book.classList.toggle("closed", currentLeaf === 0);
    book.classList.toggle("at-back", currentLeaf >= maxLeaf);

    // label = the right-hand visible face (front of the top unflipped leaf).
    // at the final spread the right face is the back cover, so prefer the
    // colophon on the left of that spread for a graceful "Finis".
    let label = "Monstrarium", prog = "of Representation";
    let face = faces[currentLeaf * 2];
    if (face && (face.type === "back" || face.type === "blank")) {
      const left = faces[currentLeaf * 2 - 1];
      if (left) face = left;
    }
    if (currentLeaf === 0) { label = "Monstrarium"; prog = "of Representation"; }
    else if (face && face.type === "plate") {
      label = face.monster.name;
      prog = `${roman(face.index + 1)} of ${MONSTERS.length} \u00b7 embodiment of ${face.monster.subject}`;
    }
    else if (face && face.type === "intro") { label = "Of Representation"; prog = "Foreword"; }
    else if (face && face.type === "colophon") { label = "Finis"; prog = "Afterword"; }
    else if (face && (face.type === "back" || face.type === "blank")) { label = "Finis"; prog = ""; }
    navTitle.textContent = label;
    navProgress.textContent = prog;
  }

  // ── Turn logic ──────────────────────────────────────────────────
  const TURN_MS = reduceMotion ? 20 : 950;

  function turnNext() {
    if (animating || currentLeaf >= maxLeaf) return;
    animating = true;
    const p = pageEls[currentLeaf];
    p.style.zIndex = 999;
    p.classList.add("flipped");
    Atmos.sfx("rustle");
    setTimeout(() => { currentLeaf++; animating = false; updateChrome(); hideHint(); }, TURN_MS);
  }
  function turnPrev() {
    if (animating || currentLeaf <= 0) return;
    animating = true;
    const p = pageEls[currentLeaf - 1];
    p.style.zIndex = 999;
    p.classList.remove("flipped");
    Atmos.sfx("rustle");
    setTimeout(() => { currentLeaf--; animating = false; updateChrome(); }, TURN_MS);
  }

  // ── Click zones on the book (left half = prev, right half = next) ──
  book.addEventListener("click", (e) => {
    if (animating) return;
    const rect = book.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // anywhere on the right turns forward (covers the cover too); left turns back
    if (currentLeaf === 0) { turnNext(); return; }
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
    const nearRight = x > rect.width * 0.55;
    const nearLeft = x < rect.width * 0.45;
    if (nearRight && currentLeaf < maxLeaf) drag = { dir: "next", startX: x, rect, page: pageEls[currentLeaf] };
    else if (nearLeft && currentLeaf > 0) drag = { dir: "prev", startX: x, rect, page: pageEls[currentLeaf - 1] };
    else return;
    drag.page.style.transition = "none";
    drag.page.style.zIndex = 999;
  }
  function pointerMove(e) {
    if (!drag) return;
    const { x } = getXY(e);
    let frac;
    if (drag.dir === "next") {
      frac = Math.min(Math.max((drag.startX - x) / drag.rect.width, 0), 1);
      drag.page.style.transform = `rotateY(${-180 * frac}deg)`;
    } else {
      frac = Math.min(Math.max((x - drag.startX) / drag.rect.width, 0), 1);
      drag.page.style.transform = `rotateY(${-180 + 180 * frac}deg)`;
    }
    drag.frac = frac;
    if (e.cancelable) e.preventDefault();
  }
  function pointerUp() {
    if (!drag) return;
    const d = drag; drag = null;
    d.page.style.transition = "";
    d.page.style.transform = "";
    if ((d.frac || 0) > 0.3) { if (d.dir === "next") turnNext(); else turnPrev(); }
    else updateChrome();
  }
  book.addEventListener("mousedown", pointerDown);
  window.addEventListener("mousemove", pointerMove);
  window.addEventListener("mouseup", pointerUp);
  book.addEventListener("touchstart", pointerDown, { passive: true });
  book.addEventListener("touchmove", pointerMove, { passive: false });
  book.addEventListener("touchend", pointerUp);

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
  setTimeout(hideHint, 6500);

  // ── Responsive sizing — make the book as large as possible ──────
  function sizeBook() {
    const ratio = 1492 / 1054; // h/w
    const mobile = window.innerWidth <= 820;
    // reserve room for the side arrows on desktop (~150px) and vertical chrome
    const chromeV = mobile ? 150 : 120;
    const sideReserve = mobile ? 24 : 170; // arrows sit outside the page on desktop
    const availH = window.innerHeight - chromeV;
    let w;
    if (mobile) {
      w = Math.min(window.innerWidth - sideReserve, 560);
    } else {
      // two-page spread budget: active page + turned page on the left
      w = Math.min((window.innerWidth - sideReserve) / 2, 560);
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
