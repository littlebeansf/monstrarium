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
    "It is ordered into chapters — the phobias and afflictions of the mind, the passions and sorrows of the heart, the vices and their answering virtues, and the myths of the Greeks, the Japanese, the Egyptians, the Norse, the peoples of India, and the Slavs. Each chapter opens with its own sign, and the studies that follow share its nature.",
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
      { id: "phobia-ablutophobia", name: "Ablutophobia", file: "phobia-ablutophobia.webp" },
      { id: "phobia-acrophobia", name: "Acrophobia", file: "phobia-acrophobia.webp" },
      { id: "phobia-aerophobia", name: "Aerophobia", file: "phobia-aerophobia.webp" },
      { id: "phobia-agoraphobia", name: "Agoraphobia", file: "phobia-agoraphobia.webp" },
      { id: "phobia-apeirophobia", name: "Apeirophobia", file: "phobia-apeirophobia.webp" },
      { id: "phobia-aracnophobia", name: "Aracnophobia", file: "phobia-aracnophobia.webp" },
      { id: "phobia-arithmophobia", name: "Arithmophobia", file: "phobia-arithmophobia.webp" },
      { id: "phobia-astraphobia", name: "Astraphobia", file: "phobia-astraphobia.webp" },
      { id: "phobia-athazagoraphobia", name: "Athazagoraphobia", file: "phobia-athazagoraphobia.webp" },
      { id: "phobia-bathophobia", name: "Bathophobia", file: "phobia-bathophobia.webp" },
      { id: "phobia-cherophobia", name: "Cherophobia", file: "phobia-cherophobia.webp" },
      { id: "phobia-claustrophobia", name: "Claustrophobia", file: "phobia-claustrophobia.webp" },
      { id: "phobia-coulrophobia", name: "Coulrophobia", file: "phobia-coulrophobia.webp" },
      { id: "phobia-cynophobia", name: "Cynophobia", file: "phobia-cynophobia.webp" },
      { id: "phobia-decidophobia", name: "Decidophobia", file: "phobia-decidophobia.webp" },
      { id: "phobia-eisoptrophobia", name: "Eisoptrophobia", file: "phobia-eisoptrophobia.webp" },
      { id: "phobia-emetophobia", name: "Emetophobia", file: "phobia-emetophobia.webp" },
      { id: "phobia-entomophobia", name: "Entomophobia", file: "phobia-entomophobia.webp" },
      { id: "phobia-ergophobia", name: "Ergophobia", file: "phobia-ergophobia.webp" },
      { id: "phobia-glossophobia", name: "Glossophobia", file: "phobia-glossophobia.webp" },
      { id: "phobia-hemophobia", name: "Hemophobia", file: "phobia-hemophobia.webp" },
      { id: "phobia-hexakosioihexekontahexaphobia", name: "Hexakosioihexekontahexaphobia", file: "phobia-hexakosioihexekontahexaphobia.webp" },
      { id: "phobia-hippopotomonstrosesquippedaliophobia", name: "Hippopotomonstrosesquippedaliophobia", file: "phobia-hippopotomonstrosesquippedaliophobia.webp" },
      { id: "phobia-linonophobia", name: "Linonophobia", file: "phobia-linonophobia.webp" },
      { id: "phobia-megalophobia", name: "Megalophobia", file: "phobia-megalophobia.webp" },
      { id: "phobia-mysophobia", name: "Mysophobia", file: "phobia-mysophobia.webp" },
      { id: "phobia-necrophobia", name: "Necrophobia", file: "phobia-necrophobia.webp" },
      { id: "phobia-nuctophobia", name: "Nuctophobia", file: "phobia-nuctophobia.webp" },
      { id: "phobia-ophidiophobia", name: "Ophidiophobia", file: "phobia-ophidiophobia.webp" },
      { id: "phobia-optophobia", name: "Optophobia", file: "phobia-optophobia.webp" },
      { id: "phobia-phobophobia", name: "Phobophobia", file: "phobia-phobophobia.webp" },
      { id: "phobia-plutophobia", name: "Plutophobia", file: "phobia-plutophobia.webp" },
      { id: "phobia-pogonophobia", name: "Pogonophobia", file: "phobia-pogonophobia.webp" },
      { id: "phobia-pyrophobia", name: "Pyrophobia", file: "phobia-pyrophobia.webp" },
      { id: "phobia-somniphobia", name: "Somniphobia", file: "phobia-somniphobia.webp" },
      { id: "phobia-technophobia", name: "Technophobia", file: "phobia-technophobia.webp" },
      { id: "phobia-thanatophobia", name: "Thanatophobia", file: "phobia-thanatophobia.webp" },
      { id: "phobia-tripophobia", name: "Tripophobia", file: "phobia-tripophobia.webp" },
      { id: "phobia-trypanophobia", name: "Trypanophobia", file: "phobia-trypanophobia.webp" },
      { id: "phobia-xenophobia", name: "Xenophobia", file: "phobia-xenophobia.webp" }
    ]
  },
  {
    caput: "II",
    title: "Afflictions",
    slug: "afflictions",
    divider: "assets/chapters/chapter-afflictions.webp",
    monsters: [
      { id: "afflictions-adhd", name: "ADHD", file: "afflictions-adhd.webp" },
      { id: "afflictions-anorexia", name: "Anorexia", file: "afflictions-anorexia.webp" },
      { id: "afflictions-anxiety", name: "Anxiety", file: "afflictions-anxiety.webp" },
      { id: "afflictions-bipolardisorder", name: "Bipolar Disorder", file: "afflictions-bipolardisorder.webp" },
      { id: "afflictions-bulimia", name: "Bulimia", file: "afflictions-bulimia.webp" },
      { id: "afflictions-catatonia", name: "Catatonia", file: "afflictions-catatonia.webp" },
      { id: "afflictions-depression", name: "Depression", file: "afflictions-depression.webp" },
      { id: "afflictions-dermatillomania", name: "Dermatillomania", file: "afflictions-dermatillomania.webp" },
      { id: "afflictions-dysthymia", name: "Dysthymia", file: "afflictions-dysthymia.webp" },
      { id: "afflictions-hypochondria", name: "Hypochondria", file: "afflictions-hypochondria.webp" },
      { id: "afflictions-insomnia", name: "Insomnia", file: "afflictions-insomnia.webp" },
      { id: "afflictions-kleptomania", name: "Kleptomania", file: "afflictions-kleptomania.webp" },
      { id: "afflictions-mania", name: "Mania", file: "afflictions-mania.webp" },
      { id: "afflictions-narcolepsy", name: "Narcolepsy", file: "afflictions-narcolepsy.webp" },
      { id: "afflictions-ocd", name: "OCD", file: "afflictions-ocd.webp" },
      { id: "afflictions-onychophagia", name: "Onychophagia", file: "afflictions-onychophagia.webp" },
      { id: "afflictions-panic-disorder", name: "Panic Disorder", file: "afflictions-panic-disorder.webp" },
      { id: "afflictions-paranoia", name: "Paranoia", file: "afflictions-paranoia.webp" },
      { id: "afflictions-ptsd", name: "PTSD", file: "afflictions-ptsd.webp" },
      { id: "afflictions-pyromania", name: "Pyromania", file: "afflictions-pyromania.webp" },
      { id: "afflictions-schizoprenia", name: "Schizophrenia", file: "afflictions-schizoprenia.webp" },
      { id: "afflictions-seasonal-affective-disorder", name: "Seasonal Affective Disorder", file: "afflictions-seasonal-affective-disorder.webp" },
      { id: "afflictions-somatization", name: "Somatization", file: "afflictions-somatization.webp" },
      { id: "afflictions-trichotillomania", name: "Trichotillomania", file: "afflictions-trichotillomania.webp" }
    ]
  },
  {
    caput: "III",
    title: "Delusions & Disorders",
    slug: "delusions",
    divider: "assets/chapters/chapter-delusions.webp",
    monsters: [
      { id: "delusions-adele-syndrome", name: "Adele Syndrome", file: "delusions-adele-syndrome.webp" },
      { id: "delusions-alice-in-wonderland-syndrome", name: "Alice In Wonderland Syndrome", file: "delusions-alice-in-wonderland-syndrome.webp" },
      { id: "delusions-aliendhandsyndrome", name: "Alien Hand Syndrome", file: "delusions-aliendhandsyndrome.webp" },
      { id: "delusions-anton-syndrome", name: "Anton Syndrome", file: "delusions-anton-syndrome.webp" },
      { id: "delusions-aspergers-syndrome", name: "Asperger's Syndrome", file: "delusions-aspergers-syndrome.webp" },
      { id: "delusions-bad-trip", name: "Bad Trip", file: "delusions-bad-trip.webp" },
      { id: "delusions-body-dismorphia", name: "Body Dysmorphia", file: "delusions-body-dismorphia.webp" },
      { id: "delusions-body-integrity-dysphoria", name: "Body Integrity Dysphoria", file: "delusions-body-integrity-dysphoria.webp" },
      { id: "delusions-borderline", name: "Borderline", file: "delusions-borderline.webp" },
      { id: "delusions-bradypsychia", name: "Bradypsychia", file: "delusions-bradypsychia.webp" },
      { id: "delusions-burnout-syndrome", name: "Burnout Syndrome", file: "delusions-burnout-syndrome.webp" },
      { id: "delusions-capgras-syndrome", name: "Capgras Syndrome", file: "delusions-capgras-syndrome.webp" },
      { id: "delusions-charles-bonnet-syndrome", name: "Charles Bonnet Syndrome", file: "delusions-charles-bonnet-syndrome.webp" },
      { id: "delusions-clinical-lycanthropy", name: "Clinical Lycanthropy", file: "delusions-clinical-lycanthropy.webp" },
      { id: "delusions-cotards-syndrome", name: "Cotard's Syndrome", file: "delusions-cotards-syndrome.webp" },
      { id: "delusions-depersonalisation", name: "Depersonalisation", file: "delusions-depersonalisation.webp" },
      { id: "delusions-depersonalization-derealization-disorder", name: "Depersonalization Derealization Disorder", file: "delusions-depersonalization-derealization-disorder.webp" },
      { id: "delusions-dissociative-identity-disorder", name: "Dissociative Identity Disorder", file: "delusions-dissociative-identity-disorder.webp" },
      { id: "delusions-dunning-kruger-effect", name: "Dunning-Kruger Effect", file: "delusions-dunning-kruger-effect.webp" },
      { id: "delusions-erotomania", name: "Erotomania", file: "delusions-erotomania.webp" },
      { id: "delusions-folie-a-deux", name: "Folie à Deux", file: "delusions-folie-a-deux.webp" },
      { id: "delusions-fregulidelusion", name: "Fregoli Delusion", file: "delusions-fregulidelusion.webp" },
      { id: "delusions-hypnagogia", name: "Hypnagogia", file: "delusions-hypnagogia.webp" },
      { id: "delusions-hypnic-jerks", name: "Hypnic Jerks", file: "delusions-hypnic-jerks.webp" },
      { id: "delusions-jamais-vu", name: "Jamais Vu", file: "delusions-jamais-vu.webp" },
      { id: "delusions-jerusalem-syndrome", name: "Jerusalem Syndrome", file: "delusions-jerusalem-syndrome.webp" },
      { id: "delusions-lucid-dream", name: "Lucid Dream", file: "delusions-lucid-dream.webp" },
      { id: "delusions-misophonia", name: "Misophonia", file: "delusions-misophonia.webp" },
      { id: "delusions-munchausen-syndrome", name: "Münchausen Syndrome", file: "delusions-munchausen-syndrome.webp" },
      { id: "delusions-out-of-body-experience", name: "Out of Body Experience", file: "delusions-out-of-body-experience.webp" },
      { id: "delusions-pareidolia", name: "Pareidolia", file: "delusions-pareidolia.webp" },
      { id: "delusions-persecutory-delusion", name: "Persecutory Delusion", file: "delusions-persecutory-delusion.webp" },
      { id: "delusions-peter-pan-syndrome", name: "Peter Pan Syndrome", file: "delusions-peter-pan-syndrome.webp" },
      { id: "delusions-savant-syndrome", name: "Savant Syndrome", file: "delusions-savant-syndrome.webp" },
      { id: "delusions-schizoaffective-disorder", name: "Schizoaffective Disorder", file: "delusions-schizoaffective-disorder.webp" },
      { id: "delusions-sleep-paralysis", name: "Sleep Paralysis", file: "delusions-sleep-paralysis.webp" },
      { id: "delusions-somatoparaphrenia", name: "Somatoparaphrenia", file: "delusions-somatoparaphrenia.webp" },
      { id: "delusions-somnambulon", name: "Somnambulon", file: "delusions-somnambulon.webp" },
      { id: "delusions-stockholm-syndrome", name: "Stockholm Syndrome", file: "delusions-stockholm-syndrome.webp" },
      { id: "delusions-synesthesia", name: "Synesthesia", file: "delusions-synesthesia.webp" },
      { id: "delusions-tachypsychia", name: "Tachypsychia", file: "delusions-tachypsychia.webp" },
      { id: "delusions-time-dilation", name: "Time Dilation", file: "delusions-time-dilation.webp" },
      { id: "delusions-tom-jerry-syndrome", name: "Tom & Jerry Syndrome", file: "delusions-tom-jerry-syndrome.webp" },
      { id: "delusions-tourette", name: "Tourette", file: "delusions-tourette.webp" },
      { id: "delusions-truman-show-delusion", name: "Truman Show Delusion", file: "delusions-truman-show-delusion.webp" },
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
      { id: "passions-ambition", name: "Ambition", file: "passions-ambition.webp" },
      { id: "passions-desire", name: "Desire", file: "passions-desire.webp" },
      { id: "passions-ecstasy", name: "Ecstasy", file: "passions-ecstasy.webp" },
      { id: "passions-ecstatic-release", name: "Ecstatic Release", file: "passions-ecstatic-release.webp" },
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
      { id: "sorrows-apathy", name: "Apathy", file: "sorrows-apathy.webp" },
      { id: "sorrows-dematerialisation", name: "Dematerialisation", file: "sorrows-dematerialisation.webp" },
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
      { id: "self-deja-vu", name: "Déjà Vu", file: "self-deja-vu.webp" },
      { id: "self-ego", name: "Ego", file: "self-ego.webp" },
      { id: "self-fata-morgana", name: "Fata Morgana", file: "self-fata-morgana.webp" },
      { id: "self-flashbacks", name: "Flashbacks", file: "self-flashbacks.webp" },
      { id: "self-identity", name: "Identity", file: "self-identity.webp" },
      { id: "self-ikigai", name: "Ikigai", file: "self-ikigai.webp" },
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
      { id: "vices-baal", name: "Baal", file: "vices-baal.webp" },
      { id: "vices-envy", name: "Envy", file: "vices-envy.webp" },
      { id: "vices-gluttony", name: "Gluttony", file: "vices-gluttony.webp" },
      { id: "vices-greed", name: "Greed", file: "vices-greed.webp" },
      { id: "vices-leviathan", name: "Leviathan", file: "vices-leviathan.webp" },
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
      { id: "greek-hades", name: "Hades", file: "greek-hades.webp" },
      { id: "greek-hephaestus", name: "Hephaestus", file: "greek-hephaestus.webp" },
      { id: "greek-hera", name: "Hera", file: "greek-hera.webp" },
      { id: "greek-hermes", name: "Hermes", file: "greek-hermes.webp" },
      { id: "greek-poseidon", name: "Poseidon", file: "greek-poseidon.webp" },
      { id: "greek-zeus", name: "Zeus", file: "greek-zeus.webp" },
      { id: "greek-harpies", name: "Harpies", file: "greek-harpies.webp" },
      { id: "greek-hydra", name: "Hydra", file: "greek-hydra.webp" },
      { id: "greek-typhon", name: "Typhon", file: "greek-typhon.webp" }
    ]
  },
  {
    caput: "X",
    title: "Japanese Yokai",
    slug: "japanese",
    divider: "assets/chapters/chapter-japanese.webp",
    monsters: [
      { id: "japanese-abumiguchi", name: "Abumiguchi", file: "japanese-abumiguchi.webp" },
      { id: "japanese-abura-sumashi", name: "Abura-Sumashi", file: "japanese-abura-sumashi.webp" },
      { id: "japanese-akaname", name: "Akaname", file: "japanese-akaname.webp" },
      { id: "japanese-amazake-baba", name: "Amazake-Baba", file: "japanese-amazake-baba.webp" },
      { id: "japanese-ashiarai-yashiki", name: "Ashiarai Yashiki", file: "japanese-ashiarai-yashiki.webp" },
      { id: "japanese-azukiarai", name: "Azukiarai", file: "japanese-azukiarai.webp" },
      { id: "japanese-bake-kujira", name: "Bake-Kujira", file: "japanese-bake-kujira.webp" },
      { id: "japanese-bake-zori", name: "Bake-zori", file: "japanese-bake-zori.webp" },
      { id: "japanese-bunbuku-chagama", name: "Bunbuku Chagama", file: "japanese-bunbuku-chagama.webp" },
      { id: "japanese-chochin-obake", name: "Chochin-obake", file: "japanese-chochin-obake.webp" },
      { id: "japanese-hitotsume-kozo", name: "Hitotsume-kozo", file: "japanese-hitotsume-kozo.webp" },
      { id: "japanese-jinmenju", name: "Jinmenju", file: "japanese-jinmenju.webp" },
      { id: "japanese-kappa", name: "Kappa", file: "japanese-kappa.webp" },
      { id: "japanese-keukegen", name: "Keukegen", file: "japanese-keukegen.webp" },
      { id: "japanese-kitsune", name: "Kitsune", file: "japanese-kitsune.webp" },
      { id: "japanese-kotobuki", name: "Kotobuki", file: "japanese-kotobuki.webp" },
      { id: "japanese-mokumokuren", name: "Mokumokuren", file: "japanese-mokumokuren.webp" },
      { id: "japanese-namazu", name: "Namazu", file: "japanese-namazu.webp" },
      { id: "japanese-nurarihyon", name: "Nurarihyon", file: "japanese-nurarihyon.webp" },
      { id: "japanese-nurikabe", name: "Nurikabe", file: "japanese-nurikabe.webp" },
      { id: "japanese-omukade", name: "Omukade", file: "japanese-omukade.webp" },
      { id: "japanese-oni", name: "Oni", file: "japanese-oni.webp" },
      { id: "japanese-oni-hitokuchi", name: "Oni Hitokuchi", file: "japanese-oni-hitokuchi.webp" },
      { id: "japanese-ryomensukuna", name: "Ryomen Sukuna", file: "japanese-ryomensukuna.webp" },
      { id: "japanese-sandman", name: "Sandman", file: "japanese-sandman.webp" },
      { id: "japanese-sarugami", name: "Sarugami", file: "japanese-sarugami.webp" },
      { id: "japanese-satori", name: "Satori", file: "japanese-satori.webp" },
      { id: "japanese-sazae-oni", name: "Sazae-oni", file: "japanese-sazae-oni.webp" },
      { id: "japanese-shikigami", name: "Shikigami", file: "japanese-shikigami.webp" },
      { id: "japanese-shirime", name: "Shirime", file: "japanese-shirime.webp" },
      { id: "japanese-tanuki", name: "Tanuki", file: "japanese-tanuki.webp" },
      { id: "japanese-tanukoro", name: "Tanukoro", file: "japanese-tanukoro.webp" },
      { id: "japanese-tengen", name: "Tengen", file: "japanese-tengen.webp" },
      { id: "japanese-tenjoname", name: "Tenjoname", file: "japanese-tenjoname.webp" },
      { id: "japanese-tofu-kozo", name: "Tofu-Kozo", file: "japanese-tofu-kozo.webp" },
      { id: "japanese-wanyudo", name: "Wanyudo", file: "japanese-wanyudo.webp" },
      { id: "japanese-yatagarasu", name: "Yatagarasu", file: "japanese-yatagarasu.webp" },
      { id: "japanese-yokai", name: "Yokai", file: "japanese-yokai.webp" },
      { id: "japanese-yuki-onna", name: "Yuki-onna", file: "japanese-yuki-onna.webp" }
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
      { id: "egyptian-hathor", name: "Hathor", file: "egyptian-hathor.webp" },
      { id: "egyptian-horus", name: "Horus", file: "egyptian-horus.webp" },
      { id: "egyptian-isis", name: "Isis", file: "egyptian-isis.webp" },
      { id: "egyptian-osiris", name: "Osiris", file: "egyptian-osiris.webp" },
      { id: "egyptian-ra", name: "Ra", file: "egyptian-ra.webp" },
      { id: "egyptian-set", name: "Set", file: "egyptian-set.webp" },
      { id: "egyptian-thoth", name: "Thoth", file: "egyptian-thoth.webp" }
    ]
  },
  {
    caput: "XII",
    title: "Nordic Mythology",
    slug: "nordic",
    divider: "assets/chapters/chapter-nordic.webp",
    monsters: [
      { id: "nordic-baldur", name: "Baldur", file: "nordic-baldur.webp" },
      { id: "nordic-bragi", name: "Bragi", file: "nordic-bragi.webp" },
      { id: "nordic-dagr", name: "Dagr", file: "nordic-dagr.webp" },
      { id: "nordic-eir", name: "Eir", file: "nordic-eir.webp" },
      { id: "nordic-freyja", name: "Freyja", file: "nordic-freyja.webp" },
      { id: "nordic-freyr", name: "Freyr", file: "nordic-freyr.webp" },
      { id: "nordic-frigg", name: "Frigg", file: "nordic-frigg.webp" },
      { id: "nordic-heimdall", name: "Heimdall", file: "nordic-heimdall.webp" },
      { id: "nordic-hel", name: "Hel", file: "nordic-hel.webp" },
      { id: "nordic-idunn", name: "Idunn", file: "nordic-idunn.webp" },
      { id: "nordic-loki", name: "Loki", file: "nordic-loki.webp" },
      { id: "nordic-njord", name: "Njord", file: "nordic-njord.webp" },
      { id: "nordic-odin", name: "Odin", file: "nordic-odin.webp" },
      { id: "nordic-thor", name: "Thor", file: "nordic-thor.webp" },
      { id: "nordic-tyr", name: "Tyr", file: "nordic-tyr.webp" },
      { id: "nordic-andhrimnir", name: "Andhrímnir", file: "nordic-andhrimnir.webp" },
      { id: "nordic-audumbla", name: "Audumbla", file: "nordic-audumbla.webp" },
      { id: "nordic-buri", name: "Buri", file: "nordic-buri.webp" },
      { id: "nordic-huldra", name: "Huldra", file: "nordic-huldra.webp" },
      { id: "nordic-jormungandr", name: "Jörmungandr", file: "nordic-jormungandr.webp" },
      { id: "nordic-valkyries", name: "Valkyries", file: "nordic-valkyries.webp" },
      { id: "nordic-ragnarok", name: "Ragnarök", file: "nordic-ragnarok.webp" },
      { id: "nordic-yggdrasil", name: "Yggdrasil", file: "nordic-yggdrasil.webp" }
    ]
  },
  {
    caput: "XIII",
    title: "Indian Mythology",
    slug: "indian",
    divider: "assets/chapters/chapter-indian.webp",
    monsters: [
      { id: "indian-brahma", name: "Brahma", file: "indian-brahma.webp" },
      { id: "indian-durga-kali", name: "Durga & Kali", file: "indian-durga-kali.webp" },
      { id: "indian-ganesha", name: "Ganesha", file: "indian-ganesha.webp" },
      { id: "indian-hanuman", name: "Hanuman", file: "indian-hanuman.webp" },
      { id: "indian-indra", name: "Indra", file: "indian-indra.webp" },
      { id: "indian-lakshmi", name: "Lakshmi", file: "indian-lakshmi.webp" },
      { id: "indian-murugan", name: "Murugan", file: "indian-murugan.webp" },
      { id: "indian-parvati", name: "Parvati", file: "indian-parvati.webp" },
      { id: "indian-sarasvati", name: "Sarasvati", file: "indian-sarasvati.webp" },
      { id: "indian-shiva", name: "Shiva", file: "indian-shiva.webp" },
      { id: "indian-vishnu", name: "Vishnu", file: "indian-vishnu.webp" }
    ]
  },
  {
    caput: "XIV",
    title: "Slavic Folklore",
    slug: "slavic",
    divider: "assets/chapters/chapter-slavic.webp",
    monsters: [
      { id: "slavic-alkonost", name: "Alkonost", file: "slavic-alkonost.webp" },
      { id: "slavic-baba-yaga", name: "Baba Yaga", file: "slavic-baba-yaga.webp" },
      { id: "slavic-bannik", name: "Bannik", file: "slavic-bannik.webp" },
      { id: "slavic-chort", name: "Chort", file: "slavic-chort.webp" },
      { id: "slavic-domovoi", name: "Domovoi", file: "slavic-domovoi.webp" },
      { id: "slavic-gamayun", name: "Gamayun", file: "slavic-gamayun.webp" },
      { id: "slavic-kikimora", name: "Kikimora", file: "slavic-kikimora.webp" },
      { id: "slavic-koschei", name: "Koschei the Deathless", file: "slavic-koschei.webp" },
      { id: "slavic-leshy", name: "Leshy", file: "slavic-leshy.webp" },
      { id: "slavic-likho", name: "Likho", file: "slavic-likho.webp" },
      { id: "slavic-polevik", name: "Polevik", file: "slavic-polevik.webp" },
      { id: "slavic-poludnitsa", name: "Poludnitsa", file: "slavic-poludnitsa.webp" },
      { id: "slavic-rusalka", name: "Rusalka", file: "slavic-rusalka.webp" },
      { id: "slavic-sirin", name: "Sirin", file: "slavic-sirin.webp" },
      { id: "slavic-strzyga", name: "Strzyga", file: "slavic-strzyga.webp" },
      { id: "slavic-vila", name: "Vila", file: "slavic-vila.webp" },
      { id: "slavic-vodyanoy", name: "Vodyanoy", file: "slavic-vodyanoy.webp" },
      { id: "slavic-zmey", name: "Zmey", file: "slavic-zmey.webp" }
    ]
  },
  {
    caput: "XV",
    title: "Miscellanea",
    slug: "miscellaneous",
    divider: "assets/chapters/chapter-miscellaneous.webp",
    monsters: [
      { id: "miscellaneous-ahuizotl", name: "Ahuizotl", file: "miscellaneous-ahuizotl.webp" },
      { id: "miscellaneous-akkorokamui", name: "Akkorokamui", file: "miscellaneous-akkorokamui.webp" },
      { id: "miscellaneous-annunaki", name: "Annunaki", file: "miscellaneous-annunaki.webp" },
      { id: "miscellaneous-azeban", name: "Azeban", file: "miscellaneous-azeban.webp" },
      { id: "miscellaneous-badb", name: "Badb", file: "miscellaneous-badb.webp" },
      { id: "miscellaneous-banshee", name: "Banshee", file: "miscellaneous-banshee.webp" },
      { id: "miscellaneous-basilisk", name: "Basilisk", file: "miscellaneous-basilisk.webp" },
      { id: "miscellaneous-bonnacon", name: "Bonnacon", file: "miscellaneous-bonnacon.webp" },
      { id: "miscellaneous-bunyip", name: "Bunyip", file: "miscellaneous-bunyip.webp" },
      { id: "miscellaneous-chupacabra", name: "Chupacabra", file: "miscellaneous-chupacabra.webp" },
      { id: "miscellaneous-cinnamon-bird", name: "Cinnamon Bird", file: "miscellaneous-cinnamon-bird.webp" },
      { id: "miscellaneous-cockatrice", name: "Cockatrice", file: "miscellaneous-cockatrice.webp" },
      { id: "miscellaneous-ghoul", name: "Ghoul", file: "miscellaneous-ghoul.webp" },
      { id: "miscellaneous-goblins", name: "Goblins", file: "miscellaneous-goblins.webp" },
      { id: "miscellaneous-golem", name: "Golem", file: "miscellaneous-golem.webp" },
      { id: "miscellaneous-gryphus", name: "Gryphus", file: "miscellaneous-gryphus.webp" },
      { id: "miscellaneous-hidebehind", name: "Hidebehind", file: "miscellaneous-hidebehind.webp" },
      { id: "miscellaneous-hodag", name: "Hodag", file: "miscellaneous-hodag.webp" },
      { id: "miscellaneous-hoop-snake", name: "Hoop Snake", file: "miscellaneous-hoop-snake.webp" },
      { id: "miscellaneous-jackalope", name: "Jackalope", file: "miscellaneous-jackalope.webp" },
      { id: "miscellaneous-jingwei", name: "Jingwei", file: "miscellaneous-jingwei.webp" },
      { id: "miscellaneous-kelpie", name: "Kelpie", file: "miscellaneous-kelpie.webp" },
      { id: "miscellaneous-kumiho", name: "Kumiho", file: "miscellaneous-kumiho.webp" },
      { id: "miscellaneous-leprechaun", name: "Leprechaun", file: "miscellaneous-leprechaun.webp" },
      { id: "miscellaneous-moon-rabbit", name: "Moon Rabbit", file: "miscellaneous-moon-rabbit.webp" },
      { id: "miscellaneous-nuckelavee", name: "Nuckelavee", file: "miscellaneous-nuckelavee.webp" },
      { id: "miscellaneous-olgoi-khorkhoi", name: "Olgoi-Khorkhoi", file: "miscellaneous-olgoi-khorkhoi.webp" },
      { id: "miscellaneous-pazuzu", name: "Pazuzu", file: "miscellaneous-pazuzu.webp" },
      { id: "miscellaneous-sheep-eating-tree", name: "Sheep-Eating Tree", file: "miscellaneous-sheep-eating-tree.webp" },
      { id: "miscellaneous-sigbin", name: "Sigbin", file: "miscellaneous-sigbin.webp" },
      { id: "miscellaneous-squonk", name: "Squonk", file: "miscellaneous-squonk.webp" },
      { id: "miscellaneous-sun-wukong", name: "Sun Wukong", file: "miscellaneous-sun-wukong.webp" },
      { id: "miscellaneous-tatzelwurm", name: "Tatzelwurm", file: "miscellaneous-tatzelwurm.webp" },
      { id: "miscellaneous-dragon-king", name: "The Dragon King", file: "miscellaneous-dragon-king.webp" },
      { id: "miscellaneous-apocalyps-riders", name: "The Four Riders of the Apocalypse", file: "miscellaneous-apocalyps-riders.webp" },
      { id: "miscellaneous-tilberi", name: "Tilberi", file: "miscellaneous-tilberi.webp" },
      { id: "miscellaneous-unicorn", name: "Unicorn", file: "miscellaneous-unicorn.webp" },
      { id: "miscellaneous-vanara", name: "Vanara", file: "miscellaneous-vanara.webp" },
      { id: "miscellaneous-vegetable-lamb-of-tartary", name: "Vegetable Lamb of Tartary", file: "miscellaneous-vegetable-lamb-of-tartary.webp" },
      { id: "miscellaneous-wendigo", name: "Wendigo", file: "miscellaneous-wendigo.webp" },
      { id: "miscellaneous-wisakedjak", name: "Wisakedjak", file: "miscellaneous-wisakedjak.webp" },
      { id: "miscellaneous-wolpertinger", name: "Wolpertinger", file: "miscellaneous-wolpertinger.webp" },
      { id: "miscellaneous-wuchowsen", name: "Wuchowsen", file: "miscellaneous-wuchowsen.webp" }
    ]
  }
];

// Flatten to the legacy MONSTERS array. Each plate carries its chapter
// index (for any code that still references it).
const MONSTERS = CHAPTERS.flatMap((ch, ci) =>
  ch.monsters.map(m => ({ ...m, chapter: ci }))
);
