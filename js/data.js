// ── THE MONSTRARIUM ──────────────────────────────────────────────
// Monstrarium of Representation — concepts, emotions, and disorders
// given form. Lore transcribed from the original illustrated plates.
//
// ORDER MATTERS: plates are paired onto facing pages (left ↔ right)
// so that OPPOSITES share a spread — Pride/Humility, Greed/Generosity,
// Love/Hate, Mania/Depression, and so on. The renderer inserts a blank
// after the intro so consecutive entries (0,1)(2,3)(4,5)… each fall on
// one spread. Keep entries grouped two-by-two as the comments mark.
// ─────────────────────────────────────────────────────────────────

// Generic, count-agnostic front matter (shown on the opening page).
const FRONT_MATTER = {
  title: "Of Representation",
  // Latin echo from the cover banner: "the unknown is not the non-existent"
  motto: "Ignota non est inexistens",
  paragraphs: [
    "This codex gathers creatures that wear no single shape, for each is an idea made flesh — a sin, a feeling, a turning of the mind given form, name, and anatomy.",
    "They are bound here in facing pairs, so that each may be read against its opposite: pride against humility, craving against measure, love against hate. To set two truths side by side is to see the shape of both.",
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

// Each adjacent pair below = one facing spread (LEFT ↔ RIGHT).
const MONSTERS = [
  // ── The Seven Sins, set against their virtues ────────────────
  // Pride ↔ Humility
  { id: "pride", name: "Vesperion", title: "The Gilded Adherent",
    subject: "Pride", category: "sin" },
  { id: "humilioris", name: "Humilioris", title: "The Low-Bowed Presence",
    subject: "Humility", category: "virtue" },

  // Greed ↔ Generosity
  { id: "greed", name: "Avaranthos", title: "The Gilded Clinger",
    subject: "Greed", category: "sin" },
  { id: "magnanvia", name: "Magnanvia", title: "The Gilded Giver",
    subject: "Generosity", category: "virtue" },

  // Lust ↔ Abstinence
  { id: "lust", name: "Volurien", title: "The Sighing Allure",
    subject: "Lust", category: "sin" },
  { id: "austerochrys", name: "Austerochrys", title: "The Vowbound Custodian",
    subject: "Abstinence", category: "virtue" },

  // Gluttony ↔ Abstemiousness
  { id: "gluttony", name: "Voresculpt", title: "The Ever-Sated",
    subject: "Gluttony", category: "sin" },
  { id: "sobrielleth", name: "Sobrielleth", title: "The Measured Veil",
    subject: "Abstemiousness", category: "virtue" },

  // Wrath ↔ Sloth (the two remaining sins — fire against stillness)
  { id: "wrath", name: "Vharzul", title: "The Embered Warden",
    subject: "Wrath", category: "sin" },
  { id: "sloth", name: "Sluth", title: "The Mired Dreamer",
    subject: "Sloth", category: "sin" },

  // ── The Heart, set against itself ────────────────────────────
  // Love ↔ Hate
  { id: "amorvessel", name: "Amorvessel", title: "The Heartbound Apparition",
    subject: "Love", category: "emotion" },
  { id: "abhorrentia", name: "Abhorrentia", title: "The Loathing Incarnate",
    subject: "Hate", category: "emotion" },

  // Mania ↔ Depression
  { id: "mania", name: "Mania", title: "The Fractured Reveler",
    subject: "Unrestrained Exaltation", category: "emotion" },
  { id: "melanchion", name: "Melanchion", title: "The Gloam-Weight",
    subject: "Depression", category: "emotion" },

  // ── The Mind & the Self ──────────────────────────────────────
  // Ego ↔ Conscience
  { id: "egotheion", name: "Egotheion", title: "The Self-Crowned",
    subject: "Ego", category: "self" },
  { id: "conscience", name: "Conscience", title: "The Wakeful Arbiter",
    subject: "the Inner Witness", category: "self" },

  // Envy ↔ Ikigai (covetous lack ↔ reason for being)
  { id: "envy", name: "Invidura", title: "The Mirror-Watcher",
    subject: "Envy", category: "sin" },
  { id: "ikigai", name: "Ikigai", title: "The Purpose-Bound",
    subject: "Reason for Being", category: "self" },

  // Nostalgia ↔ Weltschmerz (longing for the past ↔ world-weariness)
  { id: "nostalgia", name: "Nostalgia", title: "The Remembered One",
    subject: "Longing for What Was", category: "memory" },
  { id: "weltschmerz", name: "Weltschmerz", title: "The World-Weary Seer",
    subject: "Existential Sorrow", category: "memory" },

  // Anxiety ↔ Sorrow (dread of what may come ↔ grief for what was lost)
  { id: "anxietas", name: "Anxietas", title: "The Whisperwound",
    subject: "Anxiety", category: "affliction" },
  { id: "lachrymor", name: "Lachrymor", title: "The Weeping Reliquary",
    subject: "Sorrow", category: "emotion" },

  // ── The Afflictions ──────────────────────────────────────────
  // Paranoia ↔ Addiction
  { id: "occhianox", name: "Occhianox", title: "The Watcher in the Periphery",
    subject: "Paranoia", category: "affliction" },
  { id: "atroxium", name: "Atroxium", title: "The Gilded Craving",
    subject: "Addiction", category: "affliction" },

  // Bipolarity ↔ Schizophrenia
  { id: "dualioris", name: "Dualioris", title: "The Oscillating Aspect",
    subject: "Bipolarity", category: "affliction" },
  { id: "phrenozia", name: "Phrenozia", title: "The Fractured Receiver",
    subject: "Schizophrenia", category: "affliction" },

  // Lingering Trauma ↔ Self-Undoing
  { id: "postrima", name: "Postrima", title: "The Echo-Wreathed",
    subject: "Lingering Trauma", category: "affliction" },
  { id: "abyssor", name: "Abyssor", title: "The Quiet Collapse",
    subject: "Self-Undoing", category: "affliction" },

  // ── Disorders of Perception ──────────────────────────────────
  // Body Dysmorphia ↔ Alice-in-Wonderland Syndrome (the warped self ↔ the warped world)
  { id: "malanthrope", name: "Malanthrope", title: "The Distorted Self",
    subject: "Body Dysmorphia", category: "affliction" },
  { id: "distortura", name: "Distortura", title: "The Shifting Metric",
    subject: "Alice in Wonderland Syndrome", category: "affliction" },

  // Irrational Terror ↔ Trypophobia (the phobias)
  { id: "aracnophobia", name: "Aracnophobia", title: "The Webward Sovereign",
    subject: "Irrational Terror", category: "affliction" },
  { id: "porothalys", name: "Porothalys", title: "The Thousand-Pored Seer",
    subject: "Trypophobia", category: "affliction" },

  // Agoraphobia ↔ Yokai (fear of the open world ↔ the shifting-faced spirit)
  { id: "claustharen", name: "Claustharen", title: "The Threshold-Reluctant",
    subject: "Agoraphobia", category: "affliction" },
  { id: "yorigami", name: "Yorigami", title: "The Mask-Woven",
    subject: "a Yokai of Borrowed Selves", category: "myth" },

  // ── The Mythic ───────────────────────────────────────────────
  // Sukuna ↔ Leshy (sovereign of imbalance ↔ warden of the wild)
  { id: "sukuna", name: "Ryomen Sukuna", title: "The Eight-Faced Sovereign",
    subject: "Imbalance", category: "myth" },
  { id: "leshy", name: "Leshy", title: "The Greenwarden",
    subject: "Wild Places and Forgotten Paths", category: "myth" },

  // Kappalos — Warder of Boundaries (the closer; pairs with a blank leaf)
  { id: "kappalos", name: "Kappalos", title: "The Basin-Warder",
    subject: "Boundaries", category: "myth" }
];
