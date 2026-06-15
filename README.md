# Monstrarium of Representation

An interactive, page-turning codex in the style of an illustrated Witcher bestiary.
A collection of concepts, emotions, and disorders given form — each an idea made
flesh, presented as a full illustrated plate inside a book you can leaf through.

## Features

- **Realistic 3D page-curl** — drag a page corner, click the page edges, or use the
  arrow keys / ← → to turn leaves.
- **Real painted cover & back** — the codex opens from its own front-cover art and
  closes on its back-cover art.
- **One full plate per page** — every representation shown at full detail, sized to
  be read without zooming.
- **Side pagination** — the turn arrows flank the book left and right so the book can
  be as large as possible, tuned for a desktop reading experience.
- **Generic foreword & afterword** — the opening and closing pages read as a living
  codex, independent of how many plates it holds.
- **In-style closing ornament** — a drawn ring-and-compass mark in the same ink as the
  plates marks the *Finis*.
- **Procedural ambient atmosphere** — a low dark-ambient drone and parchment
  page-rustle, generated live with the Web Audio API (toggle on/off, no audio files).
- **Drifting dust motes & candle-dark vignette** for mood.
- **Accessible** — keyboard navigation, alt text, and `prefers-reduced-motion` support.

## The Plates

| № | Name | Representation |
|---|------|----------------|
| I | Vesperion | Pride |
| II | Avaranthos | Greed |
| III | Volurien | Lust |
| IV | Invidura | Envy |
| V | Voresculpt | Gluttony |
| VI | Vharzul | Wrath |
| VII | Sluth | Sloth |
| VIII | Egotheion | Ego |
| IX | Conscience | The Inner Witness |
| X | Ikigai | Reason for Being |
| XI | Anxietas | Anxiety |
| XII | Occhianox | Paranoia |
| XIII | Atroxium | Addiction |
| XIV | Dualioris | Bipolarity |
| XV | Phrenozia | Schizophrenia |
| XVI | Postrima | Lingering Trauma |
| XVII | Aracnophobia | Irrational Terror |
| XVIII | Abyssor | Self-Undoing |
| XIX | Nostalgia | Longing for What Was |

Plus the painted front and back cover.

## Run locally

It is a static site — open `index.html`, or serve the folder:

```bash
python3 -m http.server 8099
# then visit http://localhost:8099
```

## Structure

```
index.html
css/style.css      — parchment aesthetic, real cover art, 3D book stage, side pagination
js/data.js         — monster names, titles, subjects + generic front/back matter
js/audio.js        — procedural drone + page-rustle (Web Audio)
js/book.js         — page building, 3D turn, drag-corner, side navigation
assets/book/       — real front (cover.webp) and back (back.webp) cover art
assets/plates/     — optimised WebP plates
```

Built with hand-written HTML, CSS, and vanilla JavaScript. No build step, no dependencies.
