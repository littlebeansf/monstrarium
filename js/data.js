// ── THE MONSTRARIUM ──────────────────────────────────────────────
// Monstrarium of Representation — concepts, afflictions, passions, and
// the old myths, each given form as a full illustrated plate.
//
// STRUCTURE: the codex is divided into CHAPTERS (Caput I, II, III …).
// Each chapter opens with its own full-page illustrated cover plate,
// which always lands on the LEFT of a spread so it greets the reader
// as the chapter begins. The chapter's plates then follow, two per
// spread. Every plate is a complete illustration carrying its own
// title and lore, so the book renders each one full-bleed.
// ─────────────────────────────────────────────────────────────────

// Generic, count-agnostic front matter (shown on the opening page).
const FRONT_MATTER = {
  title: "Of Representation",
  // Latin echo from the cover banner: "the unknown is not the non-existent"
  motto: "Ignota non est inexistens",
  paragraphs: [
    "This codex gathers creatures that wear no single shape, for each is an idea made flesh — a fear, a vice, a turning of the mind, or an old god given form, name, and anatomy.",
    "It is ordered into chapters — the phobias and afflictions of the mind, the passions and sorrows of the heart, the vices and their answering virtues, and the myths of the Greeks, the Japanese, the Egyptians, and the Slavs. Each chapter opens with its own sign, and the studies that follow share its nature.",
    "However many leaves this book may hold, each is a study of something real but unseen. Turn them slowly. Look long, and do not mistake the drawing for the whole of the thing."
  ],
  foot: "Conceive the form. Let representation endure."
};

// Closing colophon (also generic).
const COLOPHON = {
  title: "Finis",
  paragraphs: [
    "Here the studies rest, though their subjects do not. They wait in mirrors and feast-halls, in still water and crowded thought, in temples and forests, in every quiet that follows feeling.",
    "What is named can be met. What is drawn can be understood. Close the book, and carry the knowing."
  ],
  foot: "Non quod verum est, sed quod apparere potest — hoc est monstrum."
};

// ── CHAPTERS ─────────────────────────────────────────────────────
// Each chapter has a divider/cover plate (assets/chapters/) and an
// ordered list of plates. The renderer (book.js) lays the divider on
// the LEFT page of a spread and flattens every plate into the legacy
// MONSTERS array the engine expects.
const CHAPTERS = [
  {
    caput: "I",
    title: "Phobias",
    slug: "phobia",
    divider: "assets/chapters/chapter-phobia.webp",
    monsters: [
      { id: "phobia-agoraphobia", name: "Agoraphobia", file: "phobia-agoraphobia.webp" },
      { id: "phobia-apeirophobia", name: "Apeirophobia", file: "phobia-apeirophobia.webp" },
      { id: "phobia-aracnophobia", name: "Aracnophobia", file: "phobia-aracnophobia.webp" },
      { id: "phobia-athazagoraphobia", name: "Athazagoraphobia", file: "phobia-athazagoraphobia.webp" },
      { id: "phobia-cherophobia", name: "Cherophobia", file: "phobia-cherophobia.webp" },
      { id: "phobia-nuctophobia", name: "Nuctophobia", file: "phobia-nuctophobia.webp" },
      { id: "phobia-phobophobia", name: "Phobophobia", file: "phobia-phobophobia.webp" },
      { id: "phobia-somniphobia", name: "Somniphobia", file: "phobia-somniphobia.webp" },
      { id: "phobia-thanatophobia", name: "Thanatophobia", file: "phobia-thanatophobia.webp" },
      { id: "phobia-tripophobia", name: "Tripophobia", file: "phobia-tripophobia.webp" }
    ]
  },
  {
    caput: "II",
    title: "Afflictions",
    slug: "afflictions",
    divider: "assets/chapters/chapter-afflictions.webp",
    monsters: [
      { id: "afflictions-anxiety", name: "Anxiety", file: "afflictions-anxiety.webp" },
      { id: "afflictions-bipolardisorder", name: "Bipolar Disorder", file: "afflictions-bipolardisorder.webp" },
      { id: "afflictions-depression", name: "Depression", file: "afflictions-depression.webp" },
      { id: "afflictions-mania", name: "Mania", file: "afflictions-mania.webp" },
      { id: "afflictions-paranoia", name: "Paranoia", file: "afflictions-paranoia.webp" },
      { id: "afflictions-ptsd", name: "PTSD", file: "afflictions-ptsd.webp" },
      { id: "afflictions-schizoprenia", name: "Schizophrenia", file: "afflictions-schizoprenia.webp" }
    ]
  },
  {
    caput: "III",
    title: "Delusions & Disorders",
    slug: "delusions",
    divider: "assets/chapters/chapter-delusions.webp",
    monsters: [
      { id: "delusions-alice-in-wonderland-syndrome", name: "Alice In Wonderland Syndrome", file: "delusions-alice-in-wonderland-syndrome.webp" },
      { id: "delusions-aliendhandsyndrome", name: "Alien Hand Syndrome", file: "delusions-aliendhandsyndrome.webp" },
      { id: "delusions-body-dismorphia", name: "Body Dysmorphia", file: "delusions-body-dismorphia.webp" },
      { id: "delusions-body-integrity-dysphoria", name: "Body Integrity Dysphoria", file: "delusions-body-integrity-dysphoria.webp" },
      { id: "delusions-bradypsychia", name: "Bradypsychia", file: "delusions-bradypsychia.webp" },
      { id: "delusions-capgras-syndrome", name: "Capgras Syndrome", file: "delusions-capgras-syndrome.webp" },
      { id: "delusions-clinical-lycanthropy", name: "Clinical Lycanthropy", file: "delusions-clinical-lycanthropy.webp" },
      { id: "delusions-cotards-syndrome", name: "Cotard's Syndrome", file: "delusions-cotards-syndrome.webp" },
      { id: "delusions-dissociative-identity-disorder", name: "Dissociative Identity Disorder", file: "delusions-dissociative-identity-disorder.webp" },
      { id: "delusions-depersonalization-derealization-disorder", name: "Depersonalization Derealization Disorder", file: "delusions-depersonalization-derealization-disorder.webp" },
      { id: "delusions-fregulidelusion", name: "Fregoli Delusion", file: "delusions-fregulidelusion.webp" },
      { id: "delusions-somatoparaphrenia", name: "Somatoparaphrenia", file: "delusions-somatoparaphrenia.webp" },
      { id: "delusions-tachypsychia", name: "Tachypsychia", file: "delusions-tachypsychia.webp" },
      { id: "delusions-visual-snow-syndrome", name: "Visual Snow Syndrome", file: "delusions-visual-snow-syndrome.webp" }
    ]
  },
  {
    caput: "IV",
    title: "Passions",
    slug: "passions",
    divider: "assets/chapters/chapter-passions.webp",
    monsters: [
      { id: "passions-addiction", name: "Addiction", file: "passions-addiction.webp" },
      { id: "passions-desire", name: "Desire", file: "passions-desire.webp" },
      { id: "passions-hate", name: "Hate", file: "passions-hate.webp" },
      { id: "passions-jealousy", name: "Jealousy", file: "passions-jealousy.webp" },
      { id: "passions-love", name: "Love", file: "passions-love.webp" },
      { id: "passions-obsession", name: "Obsession", file: "passions-obsession.webp" }
    ]
  },
  {
    caput: "V",
    title: "Sorrows",
    slug: "sorrows",
    divider: "assets/chapters/chapter-sorrows.webp",
    monsters: [
      { id: "sorrows-grief", name: "Grief", file: "sorrows-grief.webp" },
      { id: "sorrows-loneliness", name: "Loneliness", file: "sorrows-loneliness.webp" },
      { id: "sorrows-nostalgia", name: "Nostalgia", file: "sorrows-nostalgia.webp" },
      { id: "sorrows-regret", name: "Regret", file: "sorrows-regret.webp" },
      { id: "sorrows-sorrow", name: "Sorrow", file: "sorrows-sorrow.webp" },
      { id: "sorrows-weltschmerz", name: "Weltschmerz", file: "sorrows-weltschmerz.webp" }
    ]
  },
  {
    caput: "VI",
    title: "The Self",
    slug: "self",
    divider: "assets/chapters/chapter-self.webp",
    monsters: [
      { id: "self-conscience", name: "Conscience", file: "self-conscience.webp" },
      { id: "self-ego", name: "Ego", file: "self-ego.webp" },
      { id: "self-identity", name: "Identity", file: "self-identity.webp" },
      { id: "self-overdosis", name: "Overdose", file: "self-overdosis.webp" },
      { id: "self-psychosis", name: "Psychosis", file: "self-psychosis.webp" },
      { id: "self-shame", name: "Shame", file: "self-shame.webp" },
      { id: "self-suicide", name: "Suicide", file: "self-suicide.webp" }
    ]
  },
  {
    caput: "VII",
    title: "Vices",
    slug: "vices",
    divider: "assets/chapters/chapter-vices.webp",
    monsters: [
      { id: "vices-envy", name: "Envy", file: "vices-envy.webp" },
      { id: "vices-gluttony", name: "Gluttony", file: "vices-gluttony.webp" },
      { id: "vices-greed", name: "Greed", file: "vices-greed.webp" },
      { id: "vices-lust", name: "Lust", file: "vices-lust.webp" },
      { id: "vices-pride", name: "Pride", file: "vices-pride.webp" },
      { id: "vices-sloth", name: "Sloth", file: "vices-sloth.webp" },
      { id: "vices-wrath", name: "Wrath", file: "vices-wrath.webp" }
    ]
  },
  {
    caput: "VIII",
    title: "Virtues",
    slug: "virtues",
    divider: "assets/chapters/chapter-virtues.webp",
    monsters: [
      { id: "virtues-abstinence", name: "Abstinence", file: "virtues-abstinence.webp" },
      { id: "virtues-chastity", name: "Chastity", file: "virtues-chastity.webp" },
      { id: "virtues-diligence", name: "Diligence", file: "virtues-diligence.webp" },
      { id: "virtues-generosity", name: "Generosity", file: "virtues-generosity.webp" },
      { id: "virtues-humility", name: "Humility", file: "virtues-humility.webp" },
      { id: "virtues-kindness", name: "Kindness", file: "virtues-kindness.webp" },
      { id: "virtues-patience", name: "Patience", file: "virtues-patience.webp" },
      { id: "virtues-temperance", name: "Temperance", file: "virtues-temperance.webp" }
    ]
  },
  {
    caput: "IX",
    title: "Greek Mythology",
    slug: "greek",
    divider: "assets/chapters/chapter-greek.webp",
    monsters: [
      { id: "greek-aphrodite", name: "Aphrodite", file: "greek-aphrodite.webp" },
      { id: "greek-apollo", name: "Apollo", file: "greek-apollo.webp" },
      { id: "greek-artemis", name: "Artemis", file: "greek-artemis.webp" },
      { id: "greek-athena", name: "Athena", file: "greek-athena.webp" },
      { id: "greek-demeter", name: "Demeter", file: "greek-demeter.webp" },
      { id: "greek-dionysus", name: "Dionysus", file: "greek-dionysus.webp" },
      { id: "greek-gryphus", name: "Gryphus", file: "greek-gryphus.webp" },
      { id: "greek-hades", name: "Hades", file: "greek-hades.webp" },
      { id: "greek-hephaestus", name: "Hephaestus", file: "greek-hephaestus.webp" },
      { id: "greek-hera", name: "Hera", file: "greek-hera.webp" },
      { id: "greek-hermes", name: "Hermes", file: "greek-hermes.webp" },
      { id: "greek-poseidon", name: "Poseidon", file: "greek-poseidon.webp" },
      { id: "greek-zeus", name: "Zeus", file: "greek-zeus.webp" }
    ]
  },
  {
    caput: "X",
    title: "Japanese Yokai",
    slug: "japanese",
    divider: "assets/chapters/chapter-japanese.webp",
    monsters: [
      { id: "japanese-akaname", name: "Akaname", file: "japanese-akaname.webp" },
      { id: "japanese-azukiarai", name: "Azukiarai", file: "japanese-azukiarai.webp" },
      { id: "japanese-bake-kujira", name: "Bake-Kujira", file: "japanese-bake-kujira.webp" },
      { id: "japanese-ikigai", name: "Ikigai", file: "japanese-ikigai.webp" },
      { id: "japanese-jinmenju", name: "Jinmenju", file: "japanese-jinmenju.webp" },
      { id: "japanese-kappa", name: "Kappa", file: "japanese-kappa.webp" },
      { id: "japanese-nurikabe", name: "Nurikabe", file: "japanese-nurikabe.webp" },
      { id: "japanese-ryomensukuna", name: "Ryomen Sukuna", file: "japanese-ryomensukuna.webp" },
      { id: "japanese-shikigami", name: "Shikigami", file: "japanese-shikigami.webp" },
      { id: "japanese-yokai", name: "Yokai", file: "japanese-yokai.webp" }
    ]
  },
  {
    caput: "XI",
    title: "Egyptian Mythology",
    slug: "egyptian",
    divider: "assets/chapters/chapter-egyptian.webp",
    monsters: [
      { id: "egyptian-amun", name: "Amun", file: "egyptian-amun.webp" },
      { id: "egyptian-anubi", name: "Anubis", file: "egyptian-anubi.webp" },
      { id: "egyptian-horus", name: "Horus", file: "egyptian-horus.webp" },
      { id: "egyptian-ra", name: "Ra", file: "egyptian-ra.webp" }
    ]
  },
  {
    caput: "XII",
    title: "Slavic Folklore",
    slug: "slavic",
    divider: "assets/chapters/chapter-slavic.webp",
    monsters: [
      { id: "slavic-baba-yaga", name: "Baba Yaga", file: "slavic-baba-yaga.webp" },
      { id: "slavic-bannik", name: "Bannik", file: "slavic-bannik.webp" },
      { id: "slavic-domovoi", name: "Domovoi", file: "slavic-domovoi.webp" },
      { id: "slavic-leshy", name: "Leshy", file: "slavic-leshy.webp" },
      { id: "slavic-likho", name: "Likho", file: "slavic-likho.webp" },
      { id: "slavic-rusalka", name: "Rusalka", file: "slavic-rusalka.webp" }
    ]
  },
  {
    caput: "XIII",
    title: "Miscellanea",
    slug: "miscellaneous",
    divider: "assets/chapters/chapter-miscellaneous.webp",
    monsters: [
      { id: "miscellaneous-apocalyps-riders", name: "The Four Riders of the Apocalypse", file: "miscellaneous-apocalyps-riders.webp" }
    ]
  }
];

// Flatten to the legacy MONSTERS array. Each plate carries its chapter
// index (for any code that still references it).
const MONSTERS = CHAPTERS.flatMap((ch, ci) =>
  ch.monsters.map(m => ({ ...m, chapter: ci }))
);
