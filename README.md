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

The plates are ordered so that **opposites face each other across a single spread** —
Pride faces Humility, Greed faces Generosity, Love faces Hate, Mania faces Depression,
and so on. The closing plates gather a few mythic figures (a yokai, Ryomen Sukuna, the
Leshy, the Kappa) that embody balance and boundaries.

| № | Name | Representation |
|---|------|----------------|
| I | Vesperion | Pride |
| II | Humilioris | Humility |
| III | Avaranthos | Greed |
| IV | Magnanvia | Generosity |
| V | Volurien | Lust |
| VI | Austerochrys | Abstinence |
| VII | Voresculpt | Gluttony |
| VIII | Sobrielleth | Abstemiousness |
| IX | Vharzul | Wrath |
| X | Sluth | Sloth |
| XI | Amorvessel | Love |
| XII | Abhorrentia | Hate |
| XIII | Mania | Unrestrained Exaltation |
| XIV | Melanchion | Depression |
| XV | Egotheion | Ego |
| XVI | Conscience | the Inner Witness |
| XVII | Invidura | Envy |
| XVIII | Ikigai | Reason for Being |
| XIX | Nostalgia | Longing for What Was |
| XX | Weltschmerz | Existential Sorrow |
| XXI | Anxietas | Anxiety |
| XXII | Lachrymor | Sorrow |
| XXIII | Occhianox | Paranoia |
| XXIV | Atroxium | Addiction |
| XXV | Dualioris | Bipolarity |
| XXVI | Phrenozia | Schizophrenia |
| XXVII | Postrima | Lingering Trauma |
| XXVIII | Abyssor | Self-Undoing |
| XXIX | Malanthrope | Body Dysmorphia |
| XXX | Distortura | Alice in Wonderland Syndrome |
| XXXI | Aracnophobia | Irrational Terror |
| XXXII | Porothalys | Trypophobia |
| XXXIII | Claustharen | Agoraphobia |
| XXXIV | Yorigami | a Yokai of Borrowed Selves |
| XXXV | Ryomen Sukuna | Imbalance |
| XXXVI | Leshy | Wild Places and Forgotten Paths |
| XXXVII | Kappalos | Boundaries |

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
