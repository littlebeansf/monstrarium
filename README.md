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

## Chapters & Plates

The codex is divided into illustrated **chapters** (Caput I, II, III…). Each chapter
opens with its own full-page divider plate — which always lands on the LEFT of a spread
so it greets you as the chapter begins — followed by the studies that share its nature.
Plate folios are numbered continuously across the whole book (I–XXXVII).

### Caput I · Phobia
| № | Name | Representation |
|---|------|----------------|
| I | Aracnophobia | Irrational Terror |
| II | Porothalys | Trypophobia |
| III | Claustharen | Agoraphobia |

### Caput II · Sins
| № | Name | Representation |
|---|------|----------------|
| IV | Vesperion | Pride |
| V | Humilioris | Humility |
| VI | Avaranthos | Greed |
| VII | Magnanvia | Generosity |
| VIII | Volurien | Lust |
| IX | Austerochrys | Abstinence |
| X | Voresculpt | Gluttony |
| XI | Sobrielleth | Abstemiousness |
| XII | Vharzul | Wrath |
| XIII | Sluth | Sloth |
| XIV | Invidura | Envy |

### Caput III · Disorders
| № | Name | Representation |
|---|------|----------------|
| XV | Mania | Unrestrained Exaltation |
| XVI | Melanchion | Depression |
| XVII | Dualioris | Bipolarity |
| XVIII | Phrenozia | Schizophrenia |
| XIX | Occhianox | Paranoia |
| XX | Atroxium | Addiction |
| XXI | Anxietas | Anxiety |
| XXII | Postrima | Lingering Trauma |
| XXIII | Abyssor | Self-Undoing |
| XXIV | Malanthrope | Body Dysmorphia |
| XXV | Distortura | Alice in Wonderland Syndrome |

### Caput IV · Mythos & Legends
| № | Name | Representation |
|---|------|----------------|
| XXVI | Yorigami | a Yokai of Borrowed Selves |
| XXVII | Ryomen Sukuna | Imbalance |
| XXVIII | Leshy | Wild Places and Forgotten Paths |
| XXIX | Kappalos | Boundaries |

### Caput V · Emotions
| № | Name | Representation |
|---|------|----------------|
| XXX | Amorvessel | Love |
| XXXI | Abhorrentia | Hate |
| XXXII | Egotheion | Ego |
| XXXIII | Conscience | the Inner Witness |
| XXXIV | Ikigai | Reason for Being |
| XXXV | Nostalgia | Longing for What Was |
| XXXVI | Weltschmerz | Existential Sorrow |
| XXXVII | Lachrymor | Sorrow |

Plus the painted front and back cover, and five chapter dividers.

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
