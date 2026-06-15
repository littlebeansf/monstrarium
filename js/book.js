/* ═══════════════════════════════════════════════════════════════
   The Monstrarium — book engine
   Realistic 3D page-curl, single full plate per page.
═══════════════════════════════════════════════════════════════ */

(() => {
  const book = document.getElementById("book");
  const stage = document.getElementById("stage");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const navTitle = document.getElementById("navTitle");
  const navProgress = document.getElementById("navProgress");
  const hint = document.getElementById("hint");
  const soundBtn = document.getElementById("soundBtn");
  const fsBtn = document.getElementById("fsBtn");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── SVG sigils keyed by monster.sigil ──────────────────────────
  const SIGILS = {
    crown: `<svg viewBox="0 0 48 48"><path class="sg-stroke" stroke-width="1.6" d="M8 34h32M10 34l-2-16 8 8 8-14 8 14 8-8-2 16"/><circle class="sg-fill" cx="8" cy="16" r="2"/><circle class="sg-fill" cx="24" cy="10" r="2"/><circle class="sg-fill" cx="40" cy="16" r="2"/></svg>`,
    coin: `<svg viewBox="0 0 48 48"><circle class="sg-stroke" stroke-width="1.6" cx="24" cy="24" r="15"/><circle class="sg-stroke" stroke-width="1" cx="24" cy="24" r="11"/><path class="sg-stroke" stroke-width="1.6" d="M24 16v16M19 20h7a3 3 0 010 6h-6M26 28h-7"/></svg>`,
    heart: `<svg viewBox="0 0 48 48"><path class="sg-stroke" stroke-width="1.6" d="M24 38C10 28 8 19 14 14c4-3.5 8-1 10 3 2-4 6-6.5 10-3 6 5 4 14-10 24z"/><path class="sg-stroke" stroke-width="1" d="M24 20v10"/></svg>`,
    eye: `<svg viewBox="0 0 48 48"><path class="sg-stroke" stroke-width="1.6" d="M6 24c6-9 30-9 36 0-6 9-30 9-36 0z"/><circle class="sg-stroke" stroke-width="1.6" cx="24" cy="24" r="6"/><circle class="sg-fill" cx="24" cy="24" r="2.5"/><path class="sg-stroke" stroke-width="1" d="M24 6v4M24 38v4M6 8l3 4M42 8l-3 4"/></svg>`,
    chalice: `<svg viewBox="0 0 48 48"><path class="sg-stroke" stroke-width="1.6" d="M14 10h20c0 9-4 14-10 14S14 19 14 10z"/><path class="sg-stroke" stroke-width="1.6" d="M24 24v10M16 38h16M20 38c0-3 8-3 8 0"/><circle class="sg-fill" cx="24" cy="14" r="2"/></svg>`,
    flame: `<svg viewBox="0 0 48 48"><path class="sg-stroke" stroke-width="1.6" d="M24 6c2 8 10 10 10 19a10 10 0 11-20 0c0-5 3-7 4-11 2 3 4 3 4 6 0-6-2-9-2-14z"/></svg>`,
    hourglass: `<svg viewBox="0 0 48 48"><path class="sg-stroke" stroke-width="1.6" d="M14 8h20M14 40h20M16 8c0 9 8 12 8 16 0-4 8-7 8-16M16 40c0-9 8-12 8-16 0 4 8 7 8 16"/></svg>`
  };

  // ── Build the page list ────────────────────────────────────────
  // Page model: sheets stack. Each sheet = front face + back face.
  // We flatten into "leaves"; each leaf is one .page with front/back.
  // Sequence of FACES (reading order):
  //   0: cover-front (leaf0 front)
  //   1: intro       (leaf0 back is intro? ) -> we build explicit list
  // Simpler: build an ordered list of faces, pair them into leaves.

  const faces = [];
  // front cover
  faces.push({ type: "cover" });
  // intro
  faces.push({ type: "intro" });
  // contents
  faces.push({ type: "contents" });
  // one face per monster plate
  MONSTERS.forEach((m, i) => faces.push({ type: "plate", monster: m, index: i }));
  // closing colophon
  faces.push({ type: "colophon" });

  // pair faces into leaves (2 faces per leaf). Pad to even.
  if (faces.length % 2 !== 0) faces.push({ type: "blank" });
  const leaves = [];
  for (let i = 0; i < faces.length; i += 2) {
    leaves.push({ front: faces[i], back: faces[i + 1] });
  }
  const totalLeaves = leaves.length;
  // If the very last face is blank padding, its leaf's back carries no content.
  // Cap forward turning so the final readable spread (colophon on the right)
  // is the deepest view, never an empty back page.
  const lastFaceBlank = faces[faces.length - 1].type === "blank";
  const maxLeaf = lastFaceBlank ? totalLeaves - 1 : totalLeaves;

  // ── Render a single face's inner HTML ──────────────────────────
  function renderFace(face, side) {
    if (!face || face.type === "blank") return `<div class="paper"></div>`;

    if (face.type === "cover") {
      return `<div class="cover-face">
        <svg class="cover-corner tl" viewBox="0 0 46 46"><path stroke-width="1.4" d="M6 40V14C6 9 9 6 14 6h26"/><path stroke-width="1.4" d="M12 40V18c0-3 2-6 6-6h22"/></svg>
        <svg class="cover-corner tr" viewBox="0 0 46 46"><path stroke-width="1.4" d="M6 40V14C6 9 9 6 14 6h26"/><path stroke-width="1.4" d="M12 40V18c0-3 2-6 6-6h22"/></svg>
        <svg class="cover-corner bl" viewBox="0 0 46 46"><path stroke-width="1.4" d="M6 40V14C6 9 9 6 14 6h26"/><path stroke-width="1.4" d="M12 40V18c0-3 2-6 6-6h22"/></svg>
        <svg class="cover-corner br" viewBox="0 0 46 46"><path stroke-width="1.4" d="M6 40V14C6 9 9 6 14 6h26"/><path stroke-width="1.4" d="M12 40V18c0-3 2-6 6-6h22"/></svg>
        <div class="cover-inner"></div>
        <div class="cover-content">
          <div class="cover-kicker">Liber Bestiarum</div>
          <h1 class="cover-title">The<br>Monstrarium</h1>
          <div class="cover-sub">A Bestiary of the Seven</div>
          <svg class="cover-emblem" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" stroke-width="1.2"/>
            <circle cx="60" cy="60" r="44" stroke-width="0.8"/>
            <path stroke-width="1.4" d="M60 18 L70 50 L104 50 L76 70 L86 102 L60 82 L34 102 L44 70 L16 50 L50 50 Z"/>
            <circle cx="60" cy="56" r="9" stroke-width="1.4"/>
            <circle cx="60" cy="56" r="3" fill="#c9a14a" stroke="none"/>
          </svg>
        </div>
        <div class="cover-open-hint">Open the codex</div>
      </div>`;
    }

    if (face.type === "intro") {
      return `<div class="paper"></div><div class="page-pad intro">
        <h1>Of the Seven</h1>
        <div class="intro-rule"></div>
        <p><span class="drop">T</span>his codex gathers seven creatures recorded by chroniclers across drowned valleys, gilded vaults, and feast-halls gone to rot. Each is no beast of tooth and claw, but a sin given flesh — a hunger that wears a crown.</p>
        <p>They do not hunt the body. They court the soul: through vanity and want, longing and comparison, excess, anger, and the sweet surrender of rest. To name them is the first ward against them.</p>
        <p>Turn each leaf with care. Look long, but do not kneel.</p>
        <div class="intro-foot">&#10070;&nbsp;&nbsp;Look upon them. Do not become them.&nbsp;&nbsp;&#10070;</div>
      </div>`;
    }

    if (face.type === "contents") {
      const items = MONSTERS.map((m, i) => `
        <li>
          <button class="toc-link" data-goto="${i}">
            <span class="toc-num">${roman(i + 1)}</span>
            <img class="toc-thumb" src="assets/plates/thumbs/${m.id}.webp" alt="" loading="lazy" />
            <span class="toc-body">
              <span class="toc-name">${m.name}</span><br>
              <span class="toc-sin">embodiment of ${m.sin}</span>
            </span>
          </button>
        </li>`).join("");
      return `<div class="paper"></div><div class="page-pad contents">
        <h2>The Index</h2>
        <p class="sub">Seven leaves, seven hungers</p>
        <ul class="toc">${items}</ul>
      </div>`;
    }

    if (face.type === "plate") {
      const m = face.monster;
      const folio = `${roman(face.index + 1)} &middot; ${m.name} &middot; embodiment of ${m.sin}`;
      return `<div class="plate" style="--seal:${m.accent};--seal-glow:${m.glow}">
        <div class="plate__img-wrap" data-zoom="${m.id}" data-cap="${m.name} — ${m.title}">
          <img class="plate__img" src="assets/plates/${m.id}.webp" alt="${m.name}, ${m.title}, embodiment of ${m.sin}" loading="lazy" />
          <div class="plate__zoom"><svg viewBox="0 0 24 24" width="16" height="16"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 15.5L20 20M8 10.5h5M10.5 8v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div>
        </div>
        <div class="plate__aura" aria-hidden="true"></div>
        <div class="plate__frame"></div>
        <div class="plate__folio">${folio}</div>
      </div>`;
    }

    if (face.type === "colophon") {
      return `<div class="paper"></div><div class="page-pad intro" style="justify-content:center;text-align:center">
        <svg class="cover-emblem" style="margin-bottom:10px" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" stroke="#7a1f17" stroke-width="1.2" fill="none"/><path d="M60 22 L68 52 L100 52 L74 70 L82 100 L60 82 L38 100 L46 70 L20 52 L52 52 Z" stroke="#7a1f17" stroke-width="1.2" fill="none"/></svg>
        <h1 style="font-size:30px;color:#7a1f17">Finis</h1>
        <div class="intro-rule" style="margin:14px auto 18px"></div>
        <p>Here the codex ends, though the Seven do not. They wait in mirrors and feast-halls, in still water and unhurried marshes, in every quiet that follows praise.</p>
        <p style="font-style:italic">Close the book. Guard your heart.</p>
      </div>`;
    }
    return `<div class="paper"></div>`;
  }

  // ── Build leaves into DOM ──────────────────────────────────────
  leaves.forEach((leaf, idx) => {
    const page = document.createElement("div");
    page.className = "page";
    // stacking: first leaf on top initially; we manage z-index dynamically
    page.dataset.leaf = idx;
    page.innerHTML = `
      <div class="face face--front">${renderFace(leaf.front, "front")}<div class="spine-shade"></div><div class="page-gradient"></div></div>
      <div class="face face--back">${renderFace(leaf.back, "back")}<div class="spine-shade"></div><div class="page-gradient"></div></div>
    `;
    book.appendChild(page);
  });
  const pageEls = Array.from(book.querySelectorAll(".page"));

  // ── State ──────────────────────────────────────────────────────
  // currentLeaf = number of leaves already flipped (0 = closed cover)
  let currentLeaf = 0;
  let animating = false;

  function roman(n) {
    const map = [["X",10],["IX",9],["V",5],["IV",4],["I",1]];
    let out = ""; map.forEach(([s,v]) => { while (n >= v) { out += s; n -= v; } });
    return out;
  }

  // Map a flipped face to a "reading position" for nav text.
  function updateChrome() {
    // z-index: unflipped pages stack with first on top; flipped pages reverse
    pageEls.forEach((p, i) => {
      if (i < currentLeaf) {
        p.classList.add("flipped");
        p.style.zIndex = i; // flipped: lower leaves underneath
      } else {
        p.classList.remove("flipped");
        p.style.zIndex = totalLeaves - i;
      }
    });

    prevBtn.disabled = currentLeaf === 0;
    nextBtn.disabled = currentLeaf >= maxLeaf;

    // centre the book when fully closed (cover showing); otherwise offset so
    // the turned page rests on the left without clipping off-screen
    book.classList.toggle("closed", currentLeaf === 0);
    // book tilt only while a content spread is open (not on closed cover)
    book.classList.toggle("tilt", currentLeaf > 0 && currentLeaf <= maxLeaf && !reduceMotion);

    // determine the right-hand visible face = front of leaf[currentLeaf]
    let label = "The Monstrarium", prog = "";
    if (currentLeaf === 0) {
      label = "The Monstrarium"; prog = "Closed \u00b7 open the codex";
    } else if (currentLeaf >= totalLeaves) {
      label = "Finis"; prog = "The codex is closed";
    } else if (faces[currentLeaf * 2] && faces[currentLeaf * 2].type === "colophon") {
      label = "Finis"; prog = "Afterword";
    } else {
      const face = faces[currentLeaf * 2]; // front face of the leaf now on top of unflipped stack
      if (face.type === "plate") {
        label = face.monster.name;
        prog = `${roman(face.index + 1)} of ${MONSTERS.length} \u00b7 embodiment of ${face.monster.sin}`;
        litSigil(currentLeaf);
      } else if (face.type === "intro") { label = "Of the Seven"; prog = "Foreword"; }
      else if (face.type === "contents") { label = "The Index"; prog = "Contents"; }
      else if (face.type === "colophon") { label = "Finis"; prog = "Afterword"; }
    }
    navTitle.textContent = label;
    navProgress.textContent = prog;
  }

  // trigger sigil bloom on the visible plate of the given leaf
  function litSigil(leafIdx) {
    const p = pageEls[leafIdx];
    if (!p) return;
    const plate = p.querySelector(".face--front .plate");
    if (plate && !reduceMotion) {
      plate.classList.remove("lit");
      void plate.offsetWidth; // reflow to restart animation
      plate.classList.add("lit");
    }
  }

  // ── Turn logic ─────────────────────────────────────────────────
  function turnNext() {
    if (animating || currentLeaf >= maxLeaf) return;
    animating = true;
    const p = pageEls[currentLeaf];
    const isCover = currentLeaf === 0;
    p.classList.add("turning");
    p.classList.add("flipped");
    p.style.zIndex = 999; // bring above during flip
    Atmos.sfx(isCover ? "thud" : "rustle");
    setTimeout(() => {
      p.classList.remove("turning");
      currentLeaf++;
      animating = false;
      updateChrome();
      hideHint();
    }, reduceMotion ? 20 : 950);
  }

  function turnPrev() {
    if (animating || currentLeaf <= 0) return;
    animating = true;
    const p = pageEls[currentLeaf - 1];
    const isCover = currentLeaf - 1 === 0;
    p.classList.add("turning");
    p.style.zIndex = 999;
    p.classList.remove("flipped");
    Atmos.sfx(isCover ? "thud" : "rustle");
    setTimeout(() => {
      p.classList.remove("turning");
      currentLeaf--;
      animating = false;
      updateChrome();
    }, reduceMotion ? 20 : 950);
  }

  function gotoMonster(monsterIndex) {
    // find the leaf whose FRONT face is this plate
    const targetFaceIndex = faces.findIndex(f => f.type === "plate" && f.index === monsterIndex);
    const targetLeaf = Math.floor(targetFaceIndex / 2);
    // plate faces are always fronts (even index) by our construction
    if (animating) return;
    // jump: set flipped states without per-leaf animation but with a quick fade
    book.style.transition = "opacity 250ms ease";
    book.style.opacity = "0.0";
    setTimeout(() => {
      currentLeaf = targetLeaf;
      updateChrome();
      book.style.opacity = "1";
      Atmos.sfx("rustle");
      setTimeout(() => { book.style.transition = ""; }, 260);
    }, 250);
  }

  // ── Click zones on the book (left third = prev, right third = next) ──
  book.addEventListener("click", (e) => {
    const tocBtn = e.target.closest("[data-goto]");
    if (tocBtn) { gotoMonster(parseInt(tocBtn.dataset.goto, 10)); return; }
    const zoom = e.target.closest("[data-zoom]");
    if (zoom) { openLightbox(zoom.dataset.zoom, zoom.dataset.cap); return; }
    if (animating) return;
    const rect = book.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (currentLeaf === 0) { turnNext(); return; } // cover: click anywhere opens
    if (x < rect.width * 0.34) turnPrev();
    else if (x > rect.width * 0.66) turnNext();
  });

  // ── Drag-corner page peel ──────────────────────────────────────
  let drag = null;
  function pointerDown(e) {
    if (animating) return;
    const rect = book.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    // engage drag only near right edge (next) or left edge (prev)
    const nearRight = x > rect.width * 0.62;
    const nearLeft = x < rect.width * 0.38;
    if (nearRight && currentLeaf < maxLeaf) {
      drag = { dir: "next", startX: x, rect, page: pageEls[currentLeaf] };
    } else if (nearLeft && currentLeaf > 0) {
      drag = { dir: "prev", startX: x, rect, page: pageEls[currentLeaf - 1] };
    } else return;
    drag.page.style.transition = "none";
    drag.page.style.zIndex = 999;
    drag.page.classList.add("turning");
  }
  function pointerMove(e) {
    if (!drag) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - drag.rect.left;
    let frac;
    if (drag.dir === "next") {
      frac = Math.min(Math.max((drag.startX - x) / drag.rect.width, 0), 1);
      drag.page.style.transform = `rotateY(${-180 * frac}deg)`;
    } else {
      // prev page starts flipped (-180), drag toward 0
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
    const commit = (d.frac || 0) > 0.32;
    d.page.classList.remove("turning");
    if (commit) {
      if (d.dir === "next") turnNext(); else turnPrev();
    } else {
      // snap back
      updateChrome();
    }
  }
  book.addEventListener("mousedown", pointerDown);
  window.addEventListener("mousemove", pointerMove);
  window.addEventListener("mouseup", pointerUp);
  book.addEventListener("touchstart", pointerDown, { passive: true });
  book.addEventListener("touchmove", pointerMove, { passive: false });
  book.addEventListener("touchend", pointerUp);

  // ── Buttons & keyboard ─────────────────────────────────────────
  nextBtn.addEventListener("click", turnNext);
  prevBtn.addEventListener("click", turnPrev);
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "PageDown") { turnNext(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { turnPrev(); }
    else if (e.key === "Escape") closeLightbox();
  });

  // ── Lightbox ───────────────────────────────────────────────────
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCap = document.getElementById("lbCap");
  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target === lbImg) closeLightbox(); });
  function openLightbox(id, cap) {
    lbImg.src = `assets/plates/${id}.webp`;
    lbImg.alt = cap;
    lbCap.textContent = cap;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
  }
  function closeLightbox() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
  }

  // ── Sound + fullscreen ─────────────────────────────────────────
  soundBtn.addEventListener("click", () => {
    const on = Atmos.toggleDrone();
    soundBtn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  fsBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  // ── Hint ───────────────────────────────────────────────────────
  let hintHidden = false;
  function hideHint() { if (!hintHidden) { hint.classList.add("hidden"); hintHidden = true; } }
  setTimeout(hideHint, 7000);

  // ── Responsive sizing: fit page to viewport, keep 0.707 ratio ──
  function sizeBook() {
    const ratio = 1492 / 1054; // h/w ≈ 1.4156
    const mobile = window.innerWidth <= 760;
    const availH = window.innerHeight - (mobile ? 210 : 200);
    let w;
    if (mobile) {
      // single centred page fills available width
      w = Math.min(window.innerWidth - 28, 460);
    } else {
      // open book needs room for the active page PLUS the turned page on the
      // left → budget two page-widths horizontally.
      w = Math.min((window.innerWidth - 60) / 2, 470);
    }
    if (w * ratio > availH) w = availH / ratio;
    document.documentElement.style.setProperty("--page-w", `${Math.round(w)}px`);
    document.documentElement.style.setProperty("--page-h", `${Math.round(w * ratio)}px`);
  }
  window.addEventListener("resize", sizeBook);
  sizeBook();

  // ── Dust motes ─────────────────────────────────────────────────
  if (!reduceMotion) {
    const layer = document.getElementById("dustLayer");
    const N = window.innerWidth < 600 ? 14 : 26;
    for (let i = 0; i < N; i++) {
      const d = document.createElement("div");
      d.className = "dust";
      d.style.left = Math.random() * 100 + "vw";
      d.style.top = (60 + Math.random() * 50) + "vh";
      const dur = 14 + Math.random() * 22;
      d.style.animationDuration = dur + "s";
      d.style.animationDelay = -Math.random() * dur + "s";
      const s = 1 + Math.random() * 2.5;
      d.style.width = d.style.height = s + "px";
      layer.appendChild(d);
    }
  }

  // ── Init ───────────────────────────────────────────────────────
  updateChrome();
})();
