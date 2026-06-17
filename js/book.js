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
  // front cover → opening page (intro) → [chapter divider → its plates]…
  // → colophon → back cover.
  //
  // SPREAD GEOMETRY: faces are paired into leaves two-at-a-time, and a
  // visible spread shows faces(2k+1) on the LEFT and faces(2k+2) on the
  // RIGHT. So a face on an ODD index sits on the left page; an EVEN index
  // sits on the right page. We use this to force every chapter divider
  // onto a LEFT page, so it greets the reader as the chapter opens.
  const faces = [];
  const pushFace = (f) => faces.push(f);
  const padToLeft = () => { if (faces.length % 2 === 0) pushFace({ type: "blank" }); };  // next push lands on odd index (left)
  const padToRight = () => { if (faces.length % 2 !== 0) pushFace({ type: "blank" }); }; // next push lands on even index (right)

  pushFace({ type: "cover" });   // index 0 — closed cover sits on the right
  pushFace({ type: "intro" });   // index 1 — opening page on the left of the first spread
  padToRight();                  // keep the intro's facing page clear, then begin chapters

  let plateNo = 0;               // running plate number across the whole book (folios I, II, III …)
  // While building, remember which face index each plate landed on, so the
  // gallery can later jump straight to the spread that shows it.
  const plateFaceIndex = {};     // monster.id -> face index
  (typeof CHAPTERS !== "undefined" ? CHAPTERS : []).forEach((ch) => {
    if (ch.divider) {
      padToLeft();               // divider must land on a LEFT page
      pushFace({ type: "chapter", chapter: ch });
    }
    ch.monsters.forEach((m) => {
      plateFaceIndex[m.id] = faces.length; // index this face will occupy
      pushFace({ type: "plate", monster: m, index: plateNo });
      plateNo++;
    });
  });

  // Don't strand the colophon: make sure the last plate has a facing page.
  if (faces.length % 2 !== 0) pushFace({ type: "blank" });
  pushFace({ type: "colophon" });
  // The back cover must be the BACK face of the final leaf so that turning the
  // last page CLOSES the book — a true mirror of the opening flip. We pad with
  // a blank front so the back cover lands face-up on the left, covering the
  // stack, exactly like the front cover sits closed on the right at the start.
  if (faces.length % 2 !== 0) pushFace({ type: "blank" }); // keep colophon paired
  pushFace({ type: "blank" }); // front of the closing leaf
  pushFace({ type: "back" });  // back of the closing leaf (the closed back cover)

  // pair faces into physical leaves (2 faces per sheet)
  if (faces.length % 2 !== 0) pushFace({ type: "blank" });
  const leaves = [];
  for (let i = 0; i < faces.length; i += 2) leaves.push({ front: faces[i], back: faces[i + 1] });
  const totalLeaves = leaves.length;
  // The final leaf carries the back cover on its back face, so it DOES flip.
  const maxLeaf = totalLeaves;

  function roman(n) {
    const map = [["M",1000],["CM",900],["D",500],["CD",400],["C",100],["XC",90],["L",50],["XL",40],["X",10],["IX",9],["V",5],["IV",4],["I",1]];
    let out = ""; map.forEach(([s,v]) => { while (n >= v) { out += s; n -= v; } });
    return out;
  }

  // ── Render a face's inner HTML ──────────────────────────────────
  function renderFace(face) {
    if (!face || face.type === "blank") return `<div class="paper"></div>`;

    // Heavy full-bleed art (cover/back/dividers/plates) is mounted lazily via
    // DOM windowing: we emit data-src here and only set the real src on the
    // <img> when its leaf is near the current spread (see mountWindow). This
    // caps the number of live, decoded, GPU-backed images to a small window
    // instead of holding all ~114 full-res images at once — the fix for the
    // desktop GPU exhaustion and the mobile out-of-memory reload loop.
    if (face.type === "cover") {
      return `<div class="art-face art-face--cover">
        <img class="art-img" data-src="assets/book/cover.webp" alt="Monstrarium of Representation — front cover" draggable="false" />
      </div>`;
    }
    if (face.type === "back") {
      return `<div class="art-face art-face--back">
        <img class="art-img" data-src="assets/book/back.webp" alt="Monstrarium of Representation — back cover" draggable="false" />
      </div>`;
    }

    if (face.type === "chapter") {
      const ch = face.chapter;
      // The divider art already carries its own "Caput" label, title and motto,
      // so we render it full-bleed like a plate — no overlaid text needed.
      return `<div class="art-face art-face--chapter">
        <img class="art-img" data-src="${ch.divider}" alt="Caput ${ch.caput} — ${ch.title}" draggable="false" />
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
      // Every plate is a complete illustration carrying its own title and lore,
      // so we render it full-bleed (no overlaid folio caption). The loupe still
      // works via the data-zoom hook.
      const src = `assets/plates/${m.file}`;
      return `<div class="plate plate--full" data-zoom="${src}">
        <div class="plate__img-wrap">
          <img class="plate__img" data-src="${src}" alt="${m.name}" draggable="false" />
        </div>
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

  // ── DOM windowing — the core performance fix ────────────────────
  // We never hold all ~114 full-res plate images live at once. Each heavy
  // <img> carries its file in data-src; we set the real src only on leaves
  // inside a sliding window around the current spread, and unset it (freeing
  // the decoded bitmap + its compositor layer) once a leaf scrolls far out of
  // view. We also promote ONLY the few leaves in/near the window to their own
  // GPU layer via the .near class, instead of forcing all 64 leaves onto the
  // compositor with a blanket will-change. Together these cap GPU memory and
  // decoded-image memory to a small, constant budget regardless of book size.
  //
  // WINDOW must be wide enough that, mid-turn, the turning leaf and the leaf
  // it reveals on either side are already decoded (no flash of blank parchment).
  const WINDOW = 3;          // leaves of slack on each side of the current spread
  // Each page element holds two faces (front + back). A leaf at index i becomes
  // visible across the spreads currentLeaf = i and currentLeaf = i+1, so we key
  // the window off proximity to currentLeaf.
  function mountWindow() {
    const lo = currentLeaf - WINDOW;
    const hi = currentLeaf + WINDOW;
    pageEls.forEach((p, i) => {
      const near = i >= lo && i <= hi;
      // promote only nearby leaves to their own compositor layer
      p.classList.toggle("near", near);
      // mount/unmount the heavy images for this leaf
      p.querySelectorAll("img[data-src]").forEach((img) => {
        if (near) {
          if (img.getAttribute("src") !== img.dataset.src) img.src = img.dataset.src;
        } else if (img.getAttribute("src")) {
          // release the decoded bitmap so the browser can reclaim memory
          img.removeAttribute("src");
        }
      });
    });
  }

  // ── Page-jump dots ──────────────────────────────────
  // A fixed "to cover" marker, one dot per reading spread (chapter openers
  // shown as gilt diamonds), then a fixed "to back" marker. A spread at
  // currentLeaf = c shows faces[2c-1] (left) + faces[2c] (right); c runs from
  // 1 to maxLeaf-1. Closed cover is c=0, closed back cover is c=maxLeaf.
  const pager = document.getElementById("pager");
  const pagerButtons = []; // { leaf, el, start, end }  (start/end = chapter span in leaves)
  const SVG_COVER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 4 12l7 7"/><path d="M19 5l-7 7 7 7"/></svg>';
  const SVG_BACK  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 5l7 7-7 7"/><path d="M5 5l7 7-7 7"/></svg>';

  function makeDot(opts) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = opts.cls;
    b.dataset.leaf = String(opts.leaf);
    b.setAttribute("aria-label", opts.label);
    if (opts.tip) b.setAttribute("data-label", opts.tip);
    if (opts.html) b.innerHTML = opts.html;
    b.addEventListener("click", (e) => { e.stopPropagation(); goToLeaf(opts.leaf); });
    pager.appendChild(b);
    pagerButtons.push({ leaf: opts.leaf, el: b, start: opts.start, end: opts.end });
    return b;
  }

  function buildPager() {
    if (!pager) return;
    pager.innerHTML = "";
    pagerButtons.length = 0;
    // Locate every chapter-cover spread (the currentLeaf where the divider is
    // the left page), in reading order.
    const chapterLeaves = [];
    for (let c = 1; c <= maxLeaf - 1; c++) {
      const left = faces[2 * c - 1];
      if (left && left.type === "chapter") chapterLeaves.push({ leaf: c, ch: left.chapter });
    }
    // fixed start marker → closed cover
    makeDot({ cls: "pager__end", leaf: 0, label: "Go to the cover", tip: "Cover", html: SVG_COVER, start: 0, end: 0 });
    const sepA = document.createElement("div"); sepA.className = "pager__sep"; pager.appendChild(sepA);
    // ONE gilt diamond per chapter; with ~100 plates a dot-per-spread run would
    // be far too long, so only chapters are shown. Each dot's active span runs
    // to just before the next chapter, so reading inside a chapter keeps it lit.
    chapterLeaves.forEach((cl, i) => {
      const next = chapterLeaves[i + 1];
      const end = next ? next.leaf - 1 : maxLeaf - 1;
      makeDot({ cls: "pager__dot pager__dot--chapter", leaf: cl.leaf,
                label: `Caput ${cl.ch.caput} — ${cl.ch.title}`,
                tip: `Caput ${cl.ch.caput} · ${cl.ch.title}`,
                start: cl.leaf, end });
    });
    const sepB = document.createElement("div"); sepB.className = "pager__sep"; pager.appendChild(sepB);
    // fixed end marker → closed back cover
    makeDot({ cls: "pager__end", leaf: maxLeaf, label: "Go to the back", tip: "Back", html: SVG_BACK, start: maxLeaf, end: maxLeaf });
  }

  function updatePagerActive() {
    pagerButtons.forEach((b) => {
      // End markers light only on the exact closed cover/back; chapter dots
      // light across their whole span so the current chapter stays indicated.
      const within = (b.start != null && b.end != null)
        ? (currentLeaf >= b.start && currentLeaf <= b.end)
        : (currentLeaf === b.leaf);
      b.el.classList.toggle("is-active", within);
    });
  }

  buildPager();

  // ── State ────────────────────────────────────────────────────────────────────
  let currentLeaf = 0;   // number of leaves already flipped
  let animating = false;

  // Stack the leaves in depth so faces never share a plane (kills z-fighting
  // that produced the "fanned pages" glitch mid-turn). Unturned leaves lean a
  // hair toward the viewer on the right; turned leaves stack on the left.
  const DEPTH = 0.6; // px per leaf

  // Compute the resting transform + z-index for leaf i at a given currentLeaf,
  // WITHOUT touching the DOM. The turn animation reuses this so a leaf lands on
  // EXACTLY its resting depth — no post-turn re-stack snap (the old "shake" on
  // the page that had just settled).
  function restingFor(i, cur) {
    const flipped = i < cur;
    if (flipped) {
      const d = (cur - i) * DEPTH;
      return { flipped, z: i, transform: `translateZ(${-d}px) rotateY(-180deg)` };
    }
    const d = (i - cur) * DEPTH;
    return { flipped, z: totalLeaves - i, transform: `translateZ(${-d}px) rotateY(0deg)` };
  }

  function applyResting() {
    pageEls.forEach((p, i) => {
      // The leaf currently mid-turn owns its own transform/z; leave it alone so
      // we never yank it while it is animating or the instant it settles.
      if (p.classList.contains("is-turning")) return;
      const r = restingFor(i, currentLeaf);
      p.classList.toggle("flipped", r.flipped);
      p.style.zIndex = r.z;
      p.style.transform = r.transform;
    });
  }

  function updateChrome() {
    applyResting();
    mountWindow();

    prevBtn.disabled = currentLeaf === 0;
    nextBtn.disabled = currentLeaf >= maxLeaf;

    const closed = currentLeaf === 0;
    const atBack = currentLeaf >= maxLeaf;
    book.classList.toggle("closed", closed);
    book.classList.toggle("at-back", atBack);

    updatePagerActive();
  }

  // ── Turn logic ──────────────────────────────────────────────────
  const TURN_MS = reduceMotion ? 20 : 1000;

  function turnNext() {
    if (animating || currentLeaf >= maxLeaf) return;
    animating = true;
    book.classList.add("turning");
    const idx = currentLeaf;
    const p = pageEls[idx];
    const next = currentLeaf + 1;
    // Where this leaf will REST once turned (its depth at the new currentLeaf).
    const dest = restingFor(idx, next).transform;
    p.classList.add("is-turning");
    p.style.transition = "none";
    p.style.zIndex = 999;
    // start from rest then animate straight to the resting flipped depth, so
    // there is no post-settle snap.
    requestAnimationFrame(() => {
      p.style.transition = "";
      p.classList.add("flipped");
      p.style.transform = dest;
    });
    Atmos.sfx("rustle");
    setTimeout(() => {
      currentLeaf++;
      // restack everyone else first (this leaf is skipped while is-turning),
      // then release it — it is already on its resting transform, so nothing moves.
      updateChrome();
      p.style.zIndex = restingFor(idx, currentLeaf).z;
      p.classList.remove("is-turning");
      book.classList.remove("turning");
      animating = false;
      hideHint();
    }, TURN_MS);
  }

  function turnPrev() {
    if (animating || currentLeaf <= 0) return;
    animating = true;
    book.classList.add("turning");
    const idx = currentLeaf - 1;
    const p = pageEls[idx];
    const prev = currentLeaf - 1;
    // Where this leaf rests once turned back (un-flipped) at the new currentLeaf.
    const dest = restingFor(idx, prev).transform;
    p.classList.add("is-turning");
    p.style.transition = "none";
    p.style.zIndex = 999;
    requestAnimationFrame(() => {
      p.style.transition = "";
      p.classList.remove("flipped");
      p.style.transform = dest;
    });
    Atmos.sfx("rustle");
    setTimeout(() => {
      currentLeaf--;
      updateChrome();
      p.style.zIndex = restingFor(idx, currentLeaf).z;
      p.classList.remove("is-turning");
      book.classList.remove("turning");
      animating = false;
    }, TURN_MS);
  }

  // ── Direct jump to any leaf (used by the page-jump dots) ─────────
  // For an adjacent step we reuse the animated turn so it feels continuous;
  // for a longer jump we re-stack instantly (no z-fighting from many
  // simultaneous 1s flips) and update the chrome.
  function goToLeaf(target) {
    if (animating) return;
    target = Math.max(0, Math.min(maxLeaf, target));
    if (target === currentLeaf) return;
    if (target === currentLeaf + 1) { turnNext(); return; }
    if (target === currentLeaf - 1) { turnPrev(); return; }
    currentLeaf = target;
    Atmos.sfx("rustle");
    updateChrome();
    hideHint();
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
    // Escape closes the gallery if it is open
    if (e.key === "Escape" && galleryEl.classList.contains("on")) { closeGallery(); return; }
    // ignore page-turn keys while the gallery is open
    if (galleryEl.classList.contains("on")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") turnNext();
    else if (e.key === "ArrowLeft" || e.key === "PageUp") turnPrev();
  });

  // ── Gallery — every plate in one grand grid ─────────────────────
  // The spread at currentLeaf = c shows faces[2c-1] (left) and faces[2c]
  // (right). So a plate at face index f is visible at the spread
  // c = ceil(f / 2). Clicking a thumbnail closes the gallery and turns the
  // book to that spread.
  function leafForFaceIndex(f) {
    return Math.max(1, Math.min(maxLeaf - 1, Math.ceil(f / 2)));
  }

  const galleryEl = document.getElementById("gallery");
  const galleryScroll = document.getElementById("galleryScroll");
  const galleryBtn = document.getElementById("galleryBtn");
  const galleryClose = document.getElementById("galleryClose");
  const gallerySearch = document.getElementById("gallerySearch");
  const gallerySearchClear = document.getElementById("gallerySearchClear");
  const galleryChips = document.getElementById("galleryChips");
  const galleryEmpty = document.getElementById("galleryEmpty");
  let galleryBuilt = false;
  let activeChapter = "all"; // "all" or a chapter index (as string)
  let searchTerm = "";

  function buildGallery() {
    if (galleryBuilt || !galleryScroll) return;
    const chapters = (typeof CHAPTERS !== "undefined" ? CHAPTERS : []);
    const html = chapters.map((ch, ci) => {
      const items = ch.monsters.map((m) => {
        const src = `assets/plates/${m.file}`;
        const leaf = leafForFaceIndex(plateFaceIndex[m.id]);
        return `<button class="gcard" type="button" data-leaf="${leaf}" data-name="${(m.name || "").toLowerCase()}" data-chapter="${ci}" aria-label="Open ${m.name}">
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
    // wire each card to jump the book to its spread, then close
    galleryScroll.querySelectorAll(".gcard").forEach((card) => {
      card.addEventListener("click", () => {
        const leaf = parseInt(card.dataset.leaf, 10);
        closeGallery();
        // jump after the close transition starts so the book is visible
        requestAnimationFrame(() => goToLeaf(leaf));
      });
    });
    galleryBuilt = true;
  }

  // Build the chapter filter chips: an "All" chip plus one per chapter.
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

  // Show/hide cards by name match + active chapter; hide empty sections;
  // show the empty-state when nothing matches.
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

  // ── Preload every plate, then reveal ────────────────────────────
  // We warm the browser image cache for ALL art up front (behind the loading
  // veil). DOM windowing still controls how many images are mounted/composited
  // at once, but because every file is already decoded in cache, when a turn
  // mounts a nearby leaf's <img> it is an instant cache hit — no decode work,
  // no flash, no shake. A longer one-time load buys perfectly smooth turns.
  function collectImageUrls() {
    const urls = new Set(["assets/book/cover.webp", "assets/book/back.webp"]);
    (typeof CHAPTERS !== "undefined" ? CHAPTERS : []).forEach((ch) => {
      if (ch.divider) urls.add(ch.divider);
      ch.monsters.forEach((m) => urls.add(`assets/plates/${m.file}`));
    });
    return [...urls];
  }

  function preloadAll(urls, onProgress) {
    let done = 0;
    const total = urls.length || 1;
    return Promise.all(urls.map((u) => new Promise((resolve) => {
      const img = new Image();
      const finish = () => { done++; onProgress(done / total); resolve(); };
      // decode() guarantees the bitmap is ready, not just the bytes; fall back
      // to load/error events for older browsers.
      img.onload = () => { (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(finish); };
      img.onerror = finish;
      img.src = u;
    })));
  }

  function revealBook() {
    updateChrome();
    const loader = document.getElementById("loader");
    if (loader) {
      // one more frame so the first spread has painted under the veil
      requestAnimationFrame(() => requestAnimationFrame(() => loader.classList.add("done")));
    }
  }

  (function init() {
    // Build the first window's transforms immediately so the (hidden) book is
    // laid out, then preload everything before lifting the veil.
    updateChrome();
    const loaderFill = document.getElementById("loaderFill");
    const urls = collectImageUrls();
    // Safety: never trap the reader behind the veil if a file stalls.
    const safety = setTimeout(revealBook, 12000);
    preloadAll(urls, (frac) => {
      if (loaderFill) loaderFill.style.width = Math.round(frac * 100) + "%";
    }).then(() => { clearTimeout(safety); revealBook(); });
  })();
})();
