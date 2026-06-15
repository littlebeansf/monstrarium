# The Monstrarium — A Bestiary of the Seven

An interactive, page-turning bestiary in the style of an illustrated Witcher codex.
Seven creatures, each the embodiment of a deadly sin, presented as full illustrated
plates inside a leather-bound book you can leaf through.

## Features

- **Realistic 3D page-curl** — drag a corner, click the page edges, or use the arrow keys / ← → to turn leaves.
- **Ornate leather cover & title page** that open into the codex.
- **One full plate per page** — every monster shown at full detail, with a tap-to-zoom lightbox.
- **In-art ember glow** — as each plate settles, a subtle sin-tinted aura blooms from within, honouring the original artwork.
- **Procedural ambient atmosphere** — a low dark-ambient drone and parchment page-rustle, generated live with the Web Audio API (toggle on/off, no audio files).
- **Drifting dust motes & candle-dark vignette** for mood.
- **Fully responsive** — two-page spread on desktop, single full plate on phones.
- **Accessible** — keyboard navigation, alt text, and `prefers-reduced-motion` support.

## The Seven

| № | Name | Sin |
|---|------|-----|
| I | Vesperion | Pride |
| II | Avaranthos | Greed |
| III | Volurien | Lust |
| IV | Invidura | Envy |
| V | Voresculpt | Gluttony |
| VI | Vharzul | Wrath |
| VII | Sluth | Sloth |

## Run locally

It is a static site — open `index.html`, or serve the folder:

```bash
python3 -m http.server 8099
# then visit http://localhost:8099
```

## Structure

```
index.html
css/style.css      — parchment aesthetic, cover, 3D book stage, responsive
js/data.js         — monster names, titles, and lore (from the plates)
js/audio.js        — procedural drone + page-rustle (Web Audio)
js/book.js         — page building, 3D turn, drag, lightbox, navigation
assets/plates/     — optimised WebP plates + thumbnails
```

Built with hand-written HTML, CSS, and vanilla JavaScript. No build step, no dependencies.
