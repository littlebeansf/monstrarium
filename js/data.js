// ── THE MONSTRARIUM ──────────────────────────────────────────────
// Monstrarium of Representation — concepts, emotions, and disorders
// given form. Lore transcribed from the original illustrated plates.
//
// STRUCTURE: the codex is divided into CHAPTERS (Caput I, II, III …).
// Each chapter opens with its own full-page illustrated divider plate,
// which always lands on the LEFT of a spread so it greets the reader as
// the chapter begins. The chapter's monster plates then follow.
//
// Within a chapter, plates flow two-per-spread. We are grouping by
// THEME first; the fine ordering inside each chapter can be retuned
// later once every plate exists.
// ─────────────────────────────────────────────────────────────────

// Generic, count-agnostic front matter (shown on the opening page).
const FRONT_MATTER = {
  title: "Of Representation",
  // Latin echo from the cover banner: "the unknown is not the non-existent"
  motto: "Ignota non est inexistens",
  paragraphs: [
    "This codex gathers creatures that wear no single shape, for each is an idea made flesh — a sin, a feeling, a turning of the mind given form, name, and anatomy.",
    "It is ordered into chapters — the fears, the sins, the disorders, the old myths, and the passions of the heart. Each chapter opens with its own sign, and the studies that follow share its nature.",
    "However many leaves this book may hold, each is a study of something real but unseen. Turn them slowly. Look long, and do not mistake the drawing for the whole of the thing."
  ],
  foot: "Conceive the form. Let representation endure."
};

// Closing colophon (also generic).
const COLOPHON = {
  title: "Finis",
  paragraphs: [
    "Here the studies rest, though their subjects do not. They wait in mirrors and feast-halls, in still water and crowded thought, in every quiet that follows feeling.",
    "What is named can be met. What is drawn can be understood. Close the book, and carry the knowing."
  ],
  foot: "Non quod verum est, sed quod apparere potest — hoc est monstrum."
};

// ── CHAPTERS ─────────────────────────────────────────────────────
// Each chapter has a divider plate (image in assets/chapters/) and an
// ordered list of monster plates. A chapter with `divider: null` has
// no divider art yet — its plates simply follow on (used for Emotions,
// whose cover the author is still preparing).
//
// The renderer (book.js) reads CHAPTERS, lays out the dividers on the
// left page of a spread, and flattens every monster into the same
// `MONSTERS` array the rest of the engine expects.
const CHAPTERS = [
  {
    caput: "I",
    title: "Phobia",
    divider: "assets/chapters/chapter-1-phobia.webp",
    monsters: [
      { id: "aracnophobia", name: "Aracnophobia", title: "The Webward Sovereign",
        subject: "Irrational Terror", category: "phobia" },
      { id: "porothalys", name: "Porothalys", title: "The Thousand-Pored Seer",
        subject: "Trypophobia", category: "phobia" },
      { id: "claustharen", name: "Claustharen", title: "The Threshold-Reluctant",
        subject: "Agoraphobia", category: "phobia" }
    ]
  },
  {
    caput: "II",
    title: "Sins",
    divider: "assets/chapters/chapter-2-sins.webp",
    // The seven deadly sins, each set against its answering virtue.
    monsters: [
      { id: "pride", name: "Vesperion", title: "The Gilded Adherent",
        subject: "Pride", category: "sin" },
      { id: "humilioris", name: "Humilioris", title: "The Low-Bowed Presence",
        subject: "Humility", category: "virtue" },
      { id: "greed", name: "Avaranthos", title: "The Gilded Clinger",
        subject: "Greed", category: "sin" },
      { id: "magnanvia", name: "Magnanvia", title: "The Gilded Giver",
        subject: "Generosity", category: "virtue" },
      { id: "lust", name: "Volurien", title: "The Sighing Allure",
        subject: "Lust", category: "sin" },
      { id: "austerochrys", name: "Austerochrys", title: "The Vowbound Custodian",
        subject: "Abstinence", category: "virtue" },
      { id: "gluttony", name: "Voresculpt", title: "The Ever-Sated",
        subject: "Gluttony", category: "sin" },
      { id: "sobrielleth", name: "Sobrielleth", title: "The Measured Veil",
        subject: "Abstemiousness", category: "virtue" },
      { id: "wrath", name: "Vharzul", title: "The Embered Warden",
        subject: "Wrath", category: "sin" },
      { id: "sloth", name: "Sluth", title: "The Mired Dreamer",
        subject: "Sloth", category: "sin" },
      { id: "envy", name: "Invidura", title: "The Mirror-Watcher",
        subject: "Envy", category: "sin" }
    ]
  },
  {
    caput: "III",
    title: "Disorders",
    divider: "assets/chapters/chapter-3-disorders.webp",
    monsters: [
      { id: "mania", name: "Mania", title: "The Fractured Reveler",
        subject: "Unrestrained Exaltation", category: "disorder" },
      { id: "melanchion", name: "Melanchion", title: "The Gloam-Weight",
        subject: "Depression", category: "disorder" },
      { id: "dualioris", name: "Dualioris", title: "The Oscillating Aspect",
        subject: "Bipolarity", category: "disorder" },
      { id: "phrenozia", name: "Phrenozia", title: "The Fractured Receiver",
        subject: "Schizophrenia", category: "disorder" },
      { id: "occhianox", name: "Occhianox", title: "The Watcher in the Periphery",
        subject: "Paranoia", category: "disorder" },
      { id: "atroxium", name: "Atroxium", title: "The Gilded Craving",
        subject: "Addiction", category: "disorder" },
      { id: "anxietas", name: "Anxietas", title: "The Whisperwound",
        subject: "Anxiety", category: "disorder" },
      { id: "postrima", name: "Postrima", title: "The Echo-Wreathed",
        subject: "Lingering Trauma", category: "disorder" },
      { id: "abyssor", name: "Abyssor", title: "The Quiet Collapse",
        subject: "Self-Undoing", category: "disorder" },
      { id: "malanthrope", name: "Malanthrope", title: "The Distorted Self",
        subject: "Body Dysmorphia", category: "disorder" },
      { id: "distortura", name: "Distortura", title: "The Shifting Metric",
        subject: "Alice in Wonderland Syndrome", category: "disorder" }
    ]
  },
  {
    caput: "IV",
    title: "Mythos & Legends",
    divider: "assets/chapters/chapter-4-mythos.webp",
    monsters: [
      { id: "yorigami", name: "Yorigami", title: "The Mask-Woven",
        subject: "a Yokai of Borrowed Selves", category: "myth" },
      { id: "sukuna", name: "Ryomen Sukuna", title: "The Eight-Faced Sovereign",
        subject: "Imbalance", category: "myth" },
      { id: "leshy", name: "Leshy", title: "The Greenwarden",
        subject: "Wild Places and Forgotten Paths", category: "myth" },
      { id: "kappalos", name: "Kappalos", title: "The Basin-Warder",
        subject: "Boundaries", category: "myth" }
    ]
  },
  {
    // Emotions — placed last, with its own divider plate.
    caput: "V",
    title: "Emotions",
    divider: "assets/chapters/chapter-5-emotions.webp",
    monsters: [
      { id: "amorvessel", name: "Amorvessel", title: "The Heartbound Apparition",
        subject: "Love", category: "emotion" },
      { id: "abhorrentia", name: "Abhorrentia", title: "The Loathing Incarnate",
        subject: "Hate", category: "emotion" },
      { id: "egotheion", name: "Egotheion", title: "The Self-Crowned",
        subject: "Ego", category: "emotion" },
      { id: "conscience", name: "Conscience", title: "The Wakeful Arbiter",
        subject: "the Inner Witness", category: "emotion" },
      { id: "ikigai", name: "Ikigai", title: "The Purpose-Bound",
        subject: "Reason for Being", category: "emotion" },
      { id: "nostalgia", name: "Nostalgia", title: "The Remembered One",
        subject: "Longing for What Was", category: "emotion" },
      { id: "weltschmerz", name: "Weltschmerz", title: "The World-Weary Seer",
        subject: "Existential Sorrow", category: "emotion" },
      { id: "lachrymor", name: "Lachrymor", title: "The Weeping Reliquary",
        subject: "Sorrow", category: "emotion" }
    ]
  }
];

// Flatten to the legacy MONSTERS array (kept for any code that still
// references it). Each monster carries its chapter index for the folio.
const MONSTERS = CHAPTERS.flatMap((ch, ci) =>
  ch.monsters.map(m => ({ ...m, chapter: ci }))
);
