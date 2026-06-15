// ── THE MONSTRARIUM ──────────────────────────────────────────────
// Monstrarium of Representation — concepts, emotions, and disorders
// given form. Lore transcribed from the original illustrated plates.
// ─────────────────────────────────────────────────────────────────

// Generic, count-agnostic front matter (shown on the opening page).
const FRONT_MATTER = {
  title: "Of Representation",
  // Latin echo from the cover banner: "the unknown is not the non-existent"
  motto: "Ignota non est inexistens",
  paragraphs: [
    "This codex gathers creatures that wear no single shape, for each is an idea made flesh — a sin, a feeling, a turning of the mind given form, name, and anatomy.",
    "They do not hunt the body. They court what lives behind it: longing and dread, memory and craving, the quiet collapse and the bright purpose. To draw a thing is to begin to know it; to name it is the first ward against it.",
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

const MONSTERS = [
  // ── The Seven Sins ───────────────────────────────────────────
  {
    id: "pride", name: "Vesperion", title: "The Gilded Adherent",
    subject: "Pride", category: "sin"
  },
  {
    id: "greed", name: "Avaranthos", title: "The Gilded Clinger",
    subject: "Greed", category: "sin"
  },
  {
    id: "lust", name: "Volurien", title: "The Sighing Allure",
    subject: "Lust", category: "sin"
  },
  {
    id: "envy", name: "Invidura", title: "The Mirror-Watcher",
    subject: "Envy", category: "sin"
  },
  {
    id: "gluttony", name: "Voresculpt", title: "The Ever-Sated",
    subject: "Gluttony", category: "sin"
  },
  {
    id: "wrath", name: "Vharzul", title: "The Embered Warden",
    subject: "Wrath", category: "sin"
  },
  {
    id: "sloth", name: "Sluth", title: "The Mired Dreamer",
    subject: "Sloth", category: "sin"
  },

  // ── The Mind & the Self ──────────────────────────────────────
  {
    id: "egotheion", name: "Egotheion", title: "The Self-Crowned",
    subject: "Ego", category: "self"
  },
  {
    id: "conscience", name: "Conscience", title: "The Wakeful Arbiter",
    subject: "the Inner Witness", category: "self"
  },
  {
    id: "ikigai", name: "Ikigai", title: "The Purpose-Bound",
    subject: "Reason for Being", category: "self"
  },

  // ── The Afflictions ──────────────────────────────────────────
  {
    id: "anxietas", name: "Anxietas", title: "The Whisperwound",
    subject: "Anxiety", category: "affliction"
  },
  {
    id: "occhianox", name: "Occhianox", title: "The Watcher in the Periphery",
    subject: "Paranoia", category: "affliction"
  },
  {
    id: "atroxium", name: "Atroxium", title: "The Gilded Craving",
    subject: "Addiction", category: "affliction"
  },
  {
    id: "dualioris", name: "Dualioris", title: "The Oscillating Aspect",
    subject: "Bipolarity", category: "affliction"
  },
  {
    id: "phrenozia", name: "Phrenozia", title: "The Fractured Receiver",
    subject: "Schizophrenia", category: "affliction"
  },
  {
    id: "postrima", name: "Postrima", title: "The Echo-Wreathed",
    subject: "Lingering Trauma", category: "affliction"
  },
  {
    id: "aracnophobia", name: "Aracnophobia", title: "The Webward Sovereign",
    subject: "Irrational Terror", category: "affliction"
  },
  {
    id: "abyssor", name: "Abyssor", title: "The Quiet Collapse",
    subject: "Self-Undoing", category: "affliction"
  },

  // ── Memory ───────────────────────────────────────────────────
  {
    id: "nostalgia", name: "Nostalgia", title: "The Remembered One",
    subject: "Longing for What Was", category: "memory"
  }
];
