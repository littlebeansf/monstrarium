/* ═══════════════════════════════════════════════════════════════
   Monstrarium of Representation — book engine (v4, windowed)
   ───────────────────────────────────────────────────────────────
   A scalable two-page spread engine.

   WHY THIS REWRITE: the old engine stacked EVERY physical leaf in the
   DOM at once, each an absolutely-positioned, 3D-transformed element
   with its own image and `will-change`. With ~100 plates that is ~60
   GPU-promoted layers holding ~60 full-res images simultaneously —
   which exhausts the compositor (white / half / mis-ordered pages) and
   never scales. There were also z-index races between many leaves all
   carrying a front+back face on a single shared spine.

   THE NEW MODEL:
   • The book is a flat array of single-sided PAGES (not front/back leaves).
   • A "spread" is derived from ONE integer `spread`:
       spread 0           → closed book, cover centred (single page).
       spread 1 … last-1  → pages[2s-1] on the LEFT, pages[2s] on the RIGHT.
       spread last        → back cover centred (single page).
     Because the spread is always recomputed from one index, the page
     ORDER can never drift.
   • We only ever put the CURRENT spread's two pages in the DOM, plus —
     during a turn — ONE flipping page on top. Max ~3 page nodes, max ~3
     decoded images, at any instant. Adding 1000 pages costs nothing.
   • Exactly one element rotates per turn → no z-fighting, no backface
     compositing failures, no half-pages.

   The page DESIGN (parchment, gilt, plates, intro/colophon, gallery,
   loupe, pager, sound, HUD) is unchanged — only the turn MECHANISM and
   the DOM windowing are new.
═══════════════════════════════════════════════════════════════ */

(() => {
  const book    = document.getElementById("book");
  const stage   = document.getElementById("stage");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const reader  = document.getElementById("reader");
  const hint    = document.getElementById("hint");
  const soundBtn = document.getElementById("soundBtn");
  const fsBtn    = document.getElementById("fsBtn");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Build the ordered list of single-sided PAGES ────────────────
  // cover → intro → [chapter divider (LEFT) → its plates two-per-spread]…
  // → colophon → back cover.
  //
  // SPREAD GEOMETRY: page index 0 is the cover. Reading spreads pair
  // pages (1,2), (3,4), (5,6)… so an ODD index sits on the LEFT, an EVEN
  // index on the RIGHT. We pad with blanks so every chapter divider lands
  // on an ODD (left) index and nothing important is stranded.
  const pages = [];
  const push = (p) => pages.push(p);
  // ensure the NEXT pushed page lands on an odd (LEFT) index
  const padToLeft  = () => { if (pages.length % 2 === 0) push({ type: "blank" }); };

  push({ type: "cover" });   // 0 — the closed cover (right-hand, single)
  push({ type: "intro" });   // 1 — opening page, left of the first spread

  let plateNo = 0;
  const plateFirstPage = {};  // monster.id -> the page index it occupies
  (typeof CHAPTERS !== "undefined" ? CHAPTERS : []).forEach((ch) => {
    if (ch.divider) {
      padToLeft();                           // divider on a LEFT page
      push({ type: "chapter", chapter: ch });
    }
    ch.monsters.forEach((m) => {
      plateFirstPage[m.id] = pages.length;
      push({ type: "plate", monster: m, index: plateNo });
      plateNo++;
    });
  });

  // Give the colophon a left page of its own spread, then the back cover
  // gets its own final spread so the closing turn mirrors the opening one.
  padToLeft();
  push({ type: "colophon" });
  if (pages.length % 2 !== 0) push({ type: "blank" }); // pair the colophon
  push({ type: "back" });                              // back cover, centred single

  const PAGE_COUNT = pages.length;
  // spread index runs 0 (cover) … LAST (back). Reading spread s shows
  // pages[2s-1] (left) and pages[2s] (right).
  const LAST_SPREAD = Math.ceil((PAGE_COUNT - 1) / 2);

  function roman(n) {
    const map = [["M",1000],["CM",900],["D",500],["CD",400],["C",100],["XC",90],["L",50],["XL",40],["X",10],["IX",9],["V",5],["IV",4],["I",1]];
    let out = ""; map.forEach(([s,v]) => { while (n >= v) { out += s; n -= v; } });
    return out;
  }

  // ── Render a page's inner HTML ──────────────────────────────────
  function renderPage(page) {
    if (!page || page.type === "blank") return `<div class="paper"></div>`;

    if (page.type === "cover") {
      return `<div class="art-face art-face--cover">
        <img class="art-img" src="assets/book/cover.webp" alt="Monstrarium of Representation — front cover" draggable="false" />
      </div>`;
    }
    if (page.type === "back") {
      return `<div class="art-face art-face--back">
        <img class="art-img" src="assets/book/back.webp" alt="Monstrarium of Representation — back cover" draggable="false" />
      </div>`;
    }
    if (page.type === "chapter") {
      const ch = page.chapter;
      return `<div class="art-face art-face--chapter">
        <img class="art-img" src="${ch.divider}" alt="Caput ${ch.caput} — ${ch.title}" draggable="false" />
      </div>`;
    }
    if (page.type === "intro") {
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
    if (page.type === "plate") {
      const m = page.monster;
      const src = `assets/plates/${m.file}`;
      return `<div class="plate plate--full" data-zoom="${src}">
        <div class="plate__img-wrap">
          <img class="plate__img" src="${src}" alt="${m.name}" draggable="false" decoding="async" />
        </div>
      </div>`;
    }
    if (page.type === "colophon") {
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

  // Build a positioned page node. side: "left" | "right".
  function makePageEl(idx, side) {
    const el = document.createElement("div");
    el.className = `pg pg--${side}`;
    el.dataset.idx = String(idx);
    const inner = (idx >= 0 && idx < PAGE_COUNT) ? renderPage(pages[idx]) : `<div class="paper"></div>`;
    el.innerHTML = `<div class="pg__face">${inner}<div class="pg__spine"></div></div>`;
    return el;
  }

  // ── Spread state ───────────────────────────────────────────────
  let spread = 0;          // 0 = closed cover; LAST_SPREAD = back cover
  let animating = false;

  // MOBILE shows ONE page at a time, so it walks the flat page array directly
  // (every page is reachable — no left-hand pages get skipped). We skip blank
  // pad pages so mobile readers never land on an empty leaf.
  let mpage = 0;           // current page index in mobile mode
  function isBlank(i) { return !pages[i] || pages[i].type === "blank"; }
  function nextReal(i, dir) {
    let j = i + dir;
    while (j > 0 && j < PAGE_COUNT - 1 && isBlank(j)) j += dir; // never strand on a blank (but cover/back are reachable)
    return Math.max(0, Math.min(PAGE_COUNT - 1, j));
  }
  // keep the two models loosely in sync when switching orientation
  function spreadToPage(s) {
    if (s <= 0) return 0;
    if (s >= LAST_SPREAD) return PAGE_COUNT - 1;
    const li = leftIndexOf(s);
    return isBlank(li) ? rightIndexOf(s) : li;
  }
  function pageToSpread(p) {
    if (p <= 0) return 0;
    if (p >= PAGE_COUNT - 1) return LAST_SPREAD;
    return Math.max(1, Math.min(LAST_SPREAD - 1, Math.ceil(p / 2)));
  }

  // Which page indices are showing as the static left & right of a spread.
  function leftIndexOf(s)  { return s <= 0 ? -1 : 2 * s - 1; }
  function rightIndexOf(s) {
    if (s <= 0) return 0;                  // closed: cover sits on the (centred) right
    if (s >= LAST_SPREAD) return -1;       // back cover handled as the left single
    return 2 * s;
  }
  // The book is "single page" (centred, no spine offset) on the cover and
  // the back-cover spreads, and ALWAYS single on mobile.
  function isSinglePage(s) {
    return s <= 0 || s >= LAST_SPREAD || isMobile();
  }
  function isMobile() { return window.innerWidth <= 820; }

  // ── Render the current (static) spread ─────────────────────────
  // Only the visible spread's pages live in the DOM. On mobile we show a
  // single page (the right page of the spread, or the cover/back).
  function renderSpread() {
    book.innerHTML = "";
    const single = isSinglePage(spread);
    book.classList.toggle("book--single", single);

    if (spread <= 0) {
      // closed: cover, centred
      book.appendChild(makePageEl(0, "single"));
    } else if (spread >= LAST_SPREAD) {
      // closed at back: back cover, centred
      book.appendChild(makePageEl(PAGE_COUNT - 1, "single"));
    } else if (isMobile()) {
      // mobile: show the ONE current page (page-by-page model)
      book.appendChild(makePageEl(mpage, "single"));
    } else {
      book.appendChild(makePageEl(leftIndexOf(spread), "left"));
      book.appendChild(makePageEl(rightIndexOf(spread), "right"));
    }
    bindReaders();
    updateChrome();
  }

  function updateChrome() {
    if (isMobile()) {
      prevBtn.disabled = mpage <= 0;
      nextBtn.disabled = mpage >= PAGE_COUNT - 1;
      book.classList.toggle("closed", mpage <= 0);
      book.classList.toggle("at-back", mpage >= PAGE_COUNT - 1);
    } else {
      prevBtn.disabled = spread <= 0;
      nextBtn.disabled = spread >= LAST_SPREAD;
      book.classList.toggle("closed", spread <= 0);
      book.classList.toggle("at-back", spread >= LAST_SPREAD);
    }
    updatePagerActive();
  }

  // ── The turn ────────────────────────────────────────────────────
  // Exactly ONE flipping page is added above the static spread. It has two
  // faces: the OUTGOING side (what's currently visible on the side that
  // turns) and the INCOMING side (revealed as it lands). Rotating just this
  // one element means no z-index races and no backface failures.
  const TURN_MS = reduceMotion ? 16 : 720;

  // On mobile we cross-fade single pages instead of a 3D swing over empty
  // space (which looked like a page lifting into nothing).
  function turn(dir) {
    if (animating) return;

    if (isMobile()) {
      if (dir > 0 && mpage >= PAGE_COUNT - 1) return;
      if (dir < 0 && mpage <= 0) return;
      animating = true;
      Atmos && Atmos.sfx && Atmos.sfx("rustle");
      mobileTurn(dir, nextReal(mpage, dir));
      return;
    }

    if (dir > 0 && spread >= LAST_SPREAD) return;
    if (dir < 0 && spread <= 0) return;
    animating = true;
    Atmos && Atmos.sfx && Atmos.sfx("rustle");
    desktopTurn(dir, spread + dir);
  }

  function desktopTurn(dir, target) {
    // Decode the destination artwork BEFORE we build anything. Neighbouring
    // spreads are pre-warmed (see warmNeighbours + the post-turn warming), so
    // for a normal forward/back turn this resolves on the SAME frame and the
    // swing starts with no perceptible lag. Only an un-warmed jump pays a few
    // ms of decode — and that is far better than a brown flash.
    preloadSpread(target).then(() => desktopTurnNow(dir, target));
  }

  function desktopTurnNow(dir, target) {
    // Determine which page rotates and on which hinge.
    // NEXT: the RIGHT page of the current spread swings to the LEFT (hinge
    //   = spine on its left edge). Outgoing face = pages[rightIndexOf(cur)];
    //   incoming face (its back) = the LEFT page of the TARGET spread.
    // PREV: the LEFT page of the current spread swings to the RIGHT (hinge
    //   = spine on its right edge). Outgoing face = pages[leftIndexOf(cur)];
    //   incoming face = the RIGHT page of the TARGET spread.
    const single = isSinglePage(spread);
    const targetSingle = isSinglePage(target);

    const flip = document.createElement("div");
    flip.className = "flip " + (dir > 0 ? "flip--next" : "flip--prev");

    let frontIdx, backIdx;
    if (dir > 0) {
      // opening the cover (single → spread) OR normal next
      frontIdx = single ? 0 : rightIndexOf(spread);
      backIdx  = leftIndexOf(target);
    } else {
      // closing toward cover OR normal prev
      frontIdx = single ? (PAGE_COUNT - 1) : leftIndexOf(spread);
      backIdx  = rightIndexOf(target);
    }

    flip.innerHTML =
      `<div class="flip__face flip__face--front">${renderInnerFor(frontIdx)}<div class="pg__spine"></div></div>` +
      `<div class="flip__face flip__face--back">${renderInnerFor(backIdx)}<div class="pg__spine pg__spine--r"></div></div>`;

    // Destination images are already decoded, so painting the bed now cannot
    // flash. Reveal the destination spread UNDERNEATH, then lay the flip on
    // top showing the outgoing side, then animate.
    spread = target;
    renderSpreadStaticOnly();        // paint the new resting spread beneath
    book.appendChild(flip);

    // start position
    flip.style.transition = "none";
    flip.style.transform = (dir > 0) ? "rotateY(0deg)" : "rotateY(180deg)";
    // force reflow then animate to the resting angle
    void flip.offsetWidth;
    requestAnimationFrame(() => {
      flip.style.transition = `transform ${TURN_MS}ms var(--page-turn)`;
      flip.classList.add("is-turning");
      flip.style.transform = (dir > 0) ? "rotateY(-180deg)" : "rotateY(0deg)";
    });

    const done = () => {
      flip.remove();
      animating = false;
      renderSpread();    // full re-render binds loupe + final chrome
      hideHint();
      warmNeighbours(target);   // keep the NEXT turn flash-free
    };
    flip.addEventListener("transitionend", done, { once: true });
    setTimeout(done, TURN_MS + 120); // safety net if transitionend is missed
  }

  // Decode the spreads on either side of `s` so the next turn is instant.
  function warmNeighbours(s) {
    if (s + 1 <= LAST_SPREAD) preloadSpread(s + 1);
    if (s - 1 >= 0) preloadSpread(s - 1);
  }

  // Paint just the static left/right of the CURRENT spread (no loupe binding,
  // no flip) — used as the bed under a turning page.
  function renderSpreadStaticOnly() {
    book.innerHTML = "";
    const single = isSinglePage(spread);
    book.classList.toggle("book--single", single);
    if (spread <= 0) { book.appendChild(makePageEl(0, "single")); }
    else if (spread >= LAST_SPREAD) { book.appendChild(makePageEl(PAGE_COUNT - 1, "single")); }
    else {
      book.appendChild(makePageEl(leftIndexOf(spread), "left"));
      book.appendChild(makePageEl(rightIndexOf(spread), "right"));
    }
  }

  function renderInnerFor(idx) {
    return (idx >= 0 && idx < PAGE_COUNT) ? renderPage(pages[idx]) : `<div class="paper"></div>`;
  }

  // ── Image preloading ────────────────────────────────────────────
  // Return the artwork URL for a page index (null for text/blank pages).
  function imgUrlFor(idx) {
    if (idx < 0 || idx >= PAGE_COUNT) return null;
    const p = pages[idx];
    if (!p) return null;
    if (p.type === "cover")   return "assets/book/cover.webp";
    if (p.type === "back")    return "assets/book/back.webp";
    if (p.type === "chapter") return p.chapter.divider;
    if (p.type === "plate")   return `assets/plates/${p.monster.file}`;
    return null;
  }

  const _decoded = new Set();  // URLs already decoded once
  // Resolve when the image bitmap is ready to paint without a flash.
  // Resolves immediately for cached/text pages; never rejects (we don't want
  // a decode hiccup to stall a turn).
  function preloadImg(url) {
    if (!url || _decoded.has(url)) return Promise.resolve();
    return new Promise((resolve) => {
      const im = new Image();
      im.src = url;
      const ok = () => { _decoded.add(url); resolve(); };
      if (im.decode) {
        im.decode().then(ok).catch(ok);
      } else {
        im.onload = ok; im.onerror = ok;
      }
    });
  }
  // Preload every artwork image for a spread's two beds.
  function preloadSpread(s) {
    const urls = [];
    if (s <= 0) urls.push(imgUrlFor(0));
    else if (s >= LAST_SPREAD) urls.push(imgUrlFor(PAGE_COUNT - 1));
    else { urls.push(imgUrlFor(leftIndexOf(s))); urls.push(imgUrlFor(rightIndexOf(s))); }
    return Promise.all(urls.map(preloadImg));
  }

  function mobileTurn(dir, targetPage) {
    // Decode the incoming page first so the cross-fade reveals a finished
    // bitmap, not a bare parchment panel. Pre-warmed neighbours make this
    // resolve on the same frame in normal paging.
    const url = imgUrlFor(targetPage);
    preloadImg(url).then(() => mobileTurnNow(dir, targetPage));
  }

  function mobileTurnNow(dir, targetPage) {
    // Cross-fade + slight slide. One page out, one page in.
    const outEl = book.firstElementChild;
    mpage = targetPage;
    spread = pageToSpread(mpage); // keep pager + spread model in sync
    renderSpread();              // paints the new single page + chrome
    const inEl = book.firstElementChild;
    if (outEl) {
      // re-add the outgoing page on top to fade it out
      outEl.classList.add("pg--leaving", dir > 0 ? "pg--leaving-next" : "pg--leaving-prev");
      book.appendChild(outEl);
    }
    if (inEl) {
      inEl.classList.add("pg--entering", dir > 0 ? "pg--entering-next" : "pg--entering-prev");
      requestAnimationFrame(() => {
        inEl.classList.remove("pg--entering", "pg--entering-next", "pg--entering-prev");
      });
    }
    setTimeout(() => {
      if (outEl && outEl.parentNode) outEl.remove();
      animating = false;
      hideHint();
      // Warm the next/prev real pages for instant subsequent turns.
      preloadImg(imgUrlFor(nextReal(mpage, +1)));
      preloadImg(imgUrlFor(nextReal(mpage, -1)));
    }, TURN_MS);
  }

  // ── Direct jump to any spread (page-jump dots / gallery) ─────────
  function goToSpread(target) {
    if (animating) return;
    target = Math.max(0, Math.min(LAST_SPREAD, target));
    if (isMobile()) {
      // translate the spread target into a page and jump there
      const targetPage = spreadToPage(target);
      if (targetPage === mpage) return;
      // Decode before painting so the jumped-to page never flashes parchment.
      preloadImg(imgUrlFor(targetPage)).then(() => {
        mpage = targetPage;
        spread = pageToSpread(mpage);
        Atmos && Atmos.sfx && Atmos.sfx("rustle");
        renderSpread();
        hideHint();
        preloadImg(imgUrlFor(nextReal(mpage, +1)));
        preloadImg(imgUrlFor(nextReal(mpage, -1)));
      });
      return;
    }
    if (target === spread) return;
    if (target === spread + 1) { turn(1); return; }
    if (target === spread - 1) { turn(-1); return; }
    // Decode the destination spread before painting it for a flash-free jump.
    preloadSpread(target).then(() => {
      spread = target;
      Atmos && Atmos.sfx && Atmos.sfx("rustle");
      renderSpread();
      hideHint();
      warmNeighbours(target);
    });
  }

  function turnNext() { turn(1); }
  function turnPrev() { turn(-1); }

  // ── Click zones (left half = prev, right half = next) ────────────
  book.addEventListener("click", (e) => {
    if (animating) return;
    const rect = book.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (spread <= 0) { turnNext(); return; }
    if (spread >= LAST_SPREAD) { turnPrev(); return; }
    if (x < rect.width * 0.42) turnPrev();
    else if (x > rect.width * 0.58) turnNext();
  });

  // ── Drag-to-turn (peel) ─────────────────────────────────────────
  // Lightweight: we only track direction + commit threshold; the actual
  // swing is the standard animated turn. This keeps the gesture from
  // racing the windowed re-render.
  let drag = null;
  function getX(e) {
    const t = e.touches ? e.touches[0] : e;
    const rect = book.getBoundingClientRect();
    return { x: t.clientX - rect.left, rect };
  }
  function pointerDown(e) {
    if (animating) return;
    const { x, rect } = getX(e);
    const nearRight = x > rect.width * 0.6;
    const nearLeft  = x < rect.width * 0.4;
    if (nearRight && spread < LAST_SPREAD) drag = { dir: 1, startX: x, w: rect.width, moved: 0 };
    else if (nearLeft && spread > 0)       drag = { dir: -1, startX: x, w: rect.width, moved: 0 };
  }
  function pointerMove(e) {
    if (!drag) return;
    const { x } = getX(e);
    drag.moved = (drag.dir > 0) ? (drag.startX - x) : (x - drag.startX);
    if (e.cancelable && Math.abs(drag.moved) > 6) e.preventDefault();
  }
  function pointerUp() {
    if (!drag) return;
    const d = drag; drag = null;
    if (d.moved > d.w * 0.18) { (d.dir > 0) ? turnNext() : turnPrev(); }
  }
  book.addEventListener("mousedown", pointerDown);
  window.addEventListener("mousemove", pointerMove);
  window.addEventListener("mouseup", pointerUp);
  book.addEventListener("touchstart", pointerDown, { passive: true });
  book.addEventListener("touchmove", pointerMove, { passive: false });
  book.addEventListener("touchend", pointerUp);

  // ── Reading magnifier (loupe) ───────────────────────────────────
  const ZOOM = 2.7;
  let readerSrc = null;
  function hideReader() { reader.classList.remove("on"); reader.style.backgroundImage = ""; readerSrc = null; }

  function onPlateMove(e) {
    if (animating || drag || isMobile()) { hideReader(); return; }
    const wrap = e.currentTarget;
    const plate = wrap.closest(".plate");
    if (!plate) return;
    const src = plate.dataset.zoom;
    const r = wrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    if (px < 0 || px > 1 || py < 0 || py > 1) { hideReader(); return; }

    if (src !== readerSrc) { reader.style.backgroundImage = `url("${src}")`; readerSrc = src; }
    const onLeftHalf = e.clientX < window.innerWidth / 2;
    reader.classList.toggle("reader--right", onLeftHalf);
    reader.classList.toggle("reader--left", !onLeftHalf);

    const pw = reader.offsetWidth, ph = reader.offsetHeight;
    const bgH = ph * ZOOM;
    const bgW = bgH * (r.width / r.height);
    const cx = px * bgW, cy = py * bgH;
    let posX = pw / 2 - cx, posY = ph / 2 - cy;
    posX = Math.min(0, Math.max(pw - bgW, posX));
    posY = Math.min(0, Math.max(ph - bgH, posY));
    reader.style.backgroundSize = `${bgW}px ${bgH}px`;
    reader.style.backgroundPosition = `${posX}px ${posY}px`;
    reader.classList.add("on");
  }
  function bindReaders() {
    book.querySelectorAll(".plate").forEach((plate) => {
      const wrap = plate.querySelector(".plate__img-wrap");
      if (!wrap) return;
      wrap.addEventListener("mousemove", onPlateMove);
      wrap.addEventListener("mouseenter", onPlateMove);
      wrap.addEventListener("mouseleave", hideReader);
    });
  }
  book.addEventListener("mousedown", hideReader);

  // ── Buttons & keyboard ──────────────────────────────────────────
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); turnNext(); });
  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); turnPrev(); });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && galleryEl.classList.contains("on")) { closeGallery(); return; }
    if (galleryEl.classList.contains("on")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") turnNext();
    else if (e.key === "ArrowLeft" || e.key === "PageUp") turnPrev();
  });

  // ── Page-jump dots ──────────────────────────────────────────────
  const pager = document.getElementById("pager");
  const pagerButtons = [];
  const SVG_COVER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 4 12l7 7"/><path d="M19 5l-7 7 7 7"/></svg>';
  const SVG_BACK  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 5l7 7-7 7"/><path d="M5 5l7 7-7 7"/></svg>';

  function makeDot(opts) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = opts.cls;
    b.dataset.spread = String(opts.spread);
    b.setAttribute("aria-label", opts.label);
    if (opts.tip) b.setAttribute("data-label", opts.tip);
    if (opts.html) b.innerHTML = opts.html;
    b.addEventListener("click", (e) => { e.stopPropagation(); goToSpread(opts.spread); });
    pager.appendChild(b);
    pagerButtons.push({ spread: opts.spread, el: b, start: opts.start, end: opts.end });
    return b;
  }
  function spreadOfPage(idx) {
    // reading spread that shows page idx on either side
    return Math.max(1, Math.min(LAST_SPREAD - 1, Math.ceil(idx / 2)));
  }
  function buildPager() {
    if (!pager) return;
    pager.innerHTML = "";
    pagerButtons.length = 0;
    const chapterSpreads = [];
    for (let s = 1; s <= LAST_SPREAD - 1; s++) {
      const left = pages[leftIndexOf(s)];
      if (left && left.type === "chapter") chapterSpreads.push({ spread: s, ch: left.chapter });
    }
    makeDot({ cls: "pager__end", spread: 0, label: "Go to the cover", tip: "Cover", html: SVG_COVER, start: 0, end: 0 });
    const sepA = document.createElement("div"); sepA.className = "pager__sep"; pager.appendChild(sepA);
    chapterSpreads.forEach((cs, i) => {
      const next = chapterSpreads[i + 1];
      const end = next ? next.spread - 1 : LAST_SPREAD - 1;
      makeDot({ cls: "pager__dot pager__dot--chapter", spread: cs.spread,
                label: `Caput ${cs.ch.caput} — ${cs.ch.title}`,
                tip: `Caput ${cs.ch.caput} · ${cs.ch.title}`,
                start: cs.spread, end });
    });
    const sepB = document.createElement("div"); sepB.className = "pager__sep"; pager.appendChild(sepB);
    makeDot({ cls: "pager__end", spread: LAST_SPREAD, label: "Go to the back", tip: "Back", html: SVG_BACK, start: LAST_SPREAD, end: LAST_SPREAD });
  }
  function updatePagerActive() {
    pagerButtons.forEach((b) => {
      const within = (b.start != null && b.end != null)
        ? (spread >= b.start && spread <= b.end)
        : (spread === b.spread);
      b.el.classList.toggle("is-active", within);
    });
  }
  buildPager();

  // ── Gallery ─────────────────────────────────────────────────────
  const galleryEl = document.getElementById("gallery");
  const galleryScroll = document.getElementById("galleryScroll");
  const galleryBtn = document.getElementById("galleryBtn");
  const galleryClose = document.getElementById("galleryClose");
  const gallerySearch = document.getElementById("gallerySearch");
  const gallerySearchClear = document.getElementById("gallerySearchClear");
  const galleryChips = document.getElementById("galleryChips");
  const galleryEmpty = document.getElementById("galleryEmpty");
  let galleryBuilt = false;
  let activeChapter = "all";
  let searchTerm = "";

  function buildGallery() {
    if (galleryBuilt || !galleryScroll) return;
    const chapters = (typeof CHAPTERS !== "undefined" ? CHAPTERS : []);
    const html = chapters.map((ch, ci) => {
      const items = ch.monsters.map((m) => {
        const src = `assets/plates/${m.file}`;
        const sp = spreadOfPage(plateFirstPage[m.id]);
        return `<button class="gcard" type="button" data-spread="${sp}" data-name="${(m.name || "").toLowerCase()}" data-chapter="${ci}" aria-label="Open ${m.name}">
          <span class="gcard__frame">
            <img class="gcard__img" src="${src}" alt="${m.name}" loading="lazy" decoding="async" draggable="false" />
          </span>
          <span class="gcard__name">${m.name}</span>
        </button>`;
      }).join("");
      return `<section class="gsection" data-chapter="${ci}">
        <header class="gsection__head">
          <span class="gsection__caput">Caput ${ch.caput}</span>
          <span class="gsection__title">${ch.title}</span>
          <span class="gsection__rule"></span>
        </header>
        <div class="ggrid">${items}</div>
      </section>`;
    }).join("");
    galleryScroll.innerHTML = html;
    buildChips(chapters);
    galleryScroll.querySelectorAll(".gcard").forEach((card) => {
      card.addEventListener("click", () => {
        const sp = parseInt(card.dataset.spread, 10);
        closeGallery();
        requestAnimationFrame(() => goToSpread(sp));
      });
    });
    galleryBuilt = true;
  }
  function buildChips(chapters) {
    if (!galleryChips) return;
    const chips = [`<button class="gchip on" type="button" data-chapter="all" aria-pressed="true">All</button>`]
      .concat(chapters.map((ch, ci) =>
        `<button class="gchip" type="button" data-chapter="${ci}" aria-pressed="false">${ch.title}</button>`
      ));
    galleryChips.innerHTML = chips.join("");
    galleryChips.querySelectorAll(".gchip").forEach((chip) => {
      chip.addEventListener("click", () => {
        activeChapter = chip.dataset.chapter;
        galleryChips.querySelectorAll(".gchip").forEach((c) => {
          const on = c === chip;
          c.classList.toggle("on", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        applyGalleryFilter();
      });
    });
  }
  function applyGalleryFilter() {
    if (!galleryScroll) return;
    const term = searchTerm.trim().toLowerCase();
    let totalVisible = 0;
    galleryScroll.querySelectorAll(".gsection").forEach((section) => {
      const inChapter = activeChapter === "all" || section.dataset.chapter === activeChapter;
      let sectionVisible = 0;
      section.querySelectorAll(".gcard").forEach((card) => {
        const nameMatch = !term || (card.dataset.name || "").indexOf(term) !== -1;
        const show = inChapter && nameMatch;
        card.hidden = !show;
        if (show) sectionVisible++;
      });
      section.hidden = sectionVisible === 0;
      totalVisible += sectionVisible;
    });
    if (galleryEmpty) galleryEmpty.hidden = totalVisible !== 0;
  }
  if (gallerySearch) {
    gallerySearch.addEventListener("input", () => {
      searchTerm = gallerySearch.value || "";
      if (gallerySearchClear) gallerySearchClear.hidden = searchTerm.length === 0;
      applyGalleryFilter();
    });
  }
  if (gallerySearchClear) {
    gallerySearchClear.addEventListener("click", () => {
      searchTerm = "";
      if (gallerySearch) gallerySearch.value = "";
      gallerySearchClear.hidden = true;
      applyGalleryFilter();
      gallerySearch && gallerySearch.focus();
    });
  }
  function openGallery() {
    buildGallery();
    galleryEl.classList.add("on");
    galleryEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-open");
    hideHint();
  }
  function closeGallery() {
    galleryEl.classList.remove("on");
    galleryEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-open");
  }
  function toggleGallery() {
    if (galleryEl.classList.contains("on")) closeGallery(); else openGallery();
  }
  if (galleryBtn) galleryBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleGallery(); });
  if (galleryClose) galleryClose.addEventListener("click", (e) => { e.stopPropagation(); closeGallery(); });

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

  // ── Responsive sizing ───────────────────────────────────────────
  function sizeBook() {
    const ratio = 1492 / 1054;
    const mobile = isMobile();
    const chromeV = mobile ? 150 : 120;
    const sideReserve = mobile ? 24 : 180;
    const availH = window.innerHeight - chromeV;
    let w;
    if (mobile) w = Math.min(window.innerWidth - sideReserve, 560);
    else        w = Math.min((window.innerWidth - sideReserve) / 2, 600);
    if (w * ratio > availH) w = availH / ratio;
    w = Math.max(w, 240);
    document.documentElement.style.setProperty("--page-w", `${Math.round(w)}px`);
    document.documentElement.style.setProperty("--page-h", `${Math.round(w * ratio)}px`);
  }

  // Re-render on resize, and re-render when crossing the mobile/desktop line
  // so the single/two-page layout switches cleanly.
  let wasMobile = isMobile();
  window.addEventListener("resize", () => {
    sizeBook();
    const nowMobile = isMobile();
    if (nowMobile !== wasMobile) {
      // sync the two navigation models across the orientation change
      if (nowMobile) mpage = spreadToPage(spread);
      else spread = pageToSpread(mpage);
      wasMobile = nowMobile;
      if (!animating) renderSpread();
    }
  });
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

  // ── First paint ─────────────────────────────────────────────────
  renderSpread();
  // Warm the cover's neighbour (intro spread / first page) so the very first
  // turn is already flash-free.
  if (isMobile()) {
    preloadImg(imgUrlFor(nextReal(mpage, +1)));
  } else {
    warmNeighbours(spread);
  }
})();
