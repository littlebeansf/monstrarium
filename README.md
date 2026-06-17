# Monstrarium of Representation

An interactive, page-turning codex in the style of an illustrated Witcher bestiary.
A collection of concepts, emotions, afflictions, and old myths given form — each an
idea made flesh, presented as a full illustrated plate inside a book you can leaf
through.

## Features

- **Realistic 3D page-curl** — drag a page corner, click the page edges, or use the
  arrow keys / ← → to turn leaves.
- **Real painted cover & back** — the codex opens from its own front-cover art and
  closes on its back-cover art.
- **One full plate per page** — every representation is a complete illustration that
  carries its own title and lore, rendered full-bleed and sized to read without zooming.
- **Illustrated chapter dividers** — each *Caput* opens on its own full-page sign, which
  always lands on the LEFT of a spread so it greets you as the chapter begins.
- **Side pagination** — the turn arrows flank the book left and right so it can be as
  large as possible, tuned for a desktop reading experience.
- **Chapter navigator** — a gilt navigator beneath the book with a fixed marker to leap
  back to the cover, one gilt diamond per chapter (hover for the *Caput* name), and a
  fixed marker to jump to the back cover. The chapter you are currently reading is
  highlighted as you turn.
- **Generic foreword & afterword** — the opening and closing pages read as a living
  codex, independent of how many plates it holds.
- **In-style closing ornament** — a drawn ring-and-compass mark in the same ink as the
  plates marks the *Finis*.
- **Procedural ambient atmosphere** — a low dark-ambient drone and parchment
  page-rustle, generated live with the Web Audio API (toggle on/off, no audio files).
- **Drifting dust motes & candle-dark vignette** for mood.
- **Accessible** — keyboard navigation, alt text, and `prefers-reduced-motion` support.

## Chapters & Plates

The codex is divided into **13 chapters** (Caput I–XIII) holding **99 plates** in total.
Each chapter opens with its own full-page divider, followed by the studies that share
its nature. Every plate's title and subject are part of the painted illustration itself.

| № | Caput | Plates |
|---|-------|--------|
| I | Phobias | 10 |
| II | Afflictions | 7 |
| III | Delusions & Disorders | 14 |
| IV | Passions | 6 |
| V | Sorrows | 6 |
| VI | The Self | 7 |
| VII | Vices | 7 |
| VIII | Virtues | 8 |
| IX | Greek Mythology | 13 |
| X | Japanese Yokai | 10 |
| XI | Egyptian Mythology | 4 |
| XII | Slavic Folklore | 6 |
| XIII | Miscellanea | 1 |

### Caput I · Phobias
Agoraphobia · Apeirophobia · Aracnophobia · Athazagoraphobia · Cherophobia ·
Nuctophobia · Phobophobia · Somniphobia · Thanatophobia · Tripophobia

### Caput II · Afflictions
Anxiety · Bipolar Disorder · Depression · Mania · Paranoia · PTSD · Schizophrenia

### Caput III · Delusions & Disorders
Alice in Wonderland Syndrome · Alien Hand Syndrome · Body Dysmorphia ·
Body Integrity Dysphoria · Bradypsychia · Capgras Syndrome · Clinical Lycanthropy ·
Cotard's Syndrome · Dissociative Identity Disorder ·
Depersonalization–Derealization Disorder · Fregoli Delusion · Somatoparaphrenia ·
Tachypsychia · Visual Snow Syndrome

### Caput IV · Passions
Addiction · Desire · Hate · Jealousy · Love · Obsession

### Caput V · Sorrows
Grief · Loneliness · Nostalgia · Regret · Sorrow · Weltschmerz

### Caput VI · The Self
Conscience · Ego · Identity · Overdose · Psychosis · Shame · Suicide

### Caput VII · Vices
Envy · Gluttony · Greed · Lust · Pride · Sloth · Wrath

### Caput VIII · Virtues
Abstinence · Chastity · Diligence · Generosity · Humility · Kindness · Patience ·
Temperance

### Caput IX · Greek Mythology
Aphrodite · Apollo · Artemis · Athena · Demeter · Dionysus · Gryphus · Hades ·
Hephaestus · Hera · Hermes · Poseidon · Zeus

### Caput X · Japanese Yokai
Akaname · Azukiarai · Bake-Kujira · Ikigai · Jinmenju · Kappa · Nurikabe ·
Ryomen Sukuna · Shikigami · Yokai

### Caput XI · Egyptian Mythology
Amun · Anubis · Horus · Ra

### Caput XII · Slavic Folklore
Baba Yaga · Bannik · Domovoi · Leshy · Likho · Rusalka

### Caput XIII · Miscellanea
The Four Riders of the Apocalypse

Plus the painted front and back cover, and the 13 chapter dividers.

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
js/data.js         — chapters, plate names + files, and generic front/back matter
js/audio.js        — procedural drone + page-rustle (Web Audio)
js/book.js         — page building, 3D turn, drag-corner, side navigation, chapter navigator
assets/book/       — real front (cover.webp) and back (back.webp) cover art
assets/chapters/   — the 13 chapter-divider plates (chapter-<slug>.webp)
assets/plates/     — optimised WebP plates, one per representation
```

Built with hand-written HTML, CSS, and vanilla JavaScript. No build step, no dependencies.
