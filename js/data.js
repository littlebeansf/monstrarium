// ── THE MONSTRARIUM ──────────────────────────────────────────────
// The Seven — a bestiary of sins given form.
// Lore transcribed from the original illustrated plates.
// Order follows the traditional procession of the deadly sins.

const MONSTERS = [
  {
    id: "pride",
    sin: "Pride",
    name: "Vesperion",
    title: "The Gilded Adherent",
    initial: "V",
    accent: "#c9a14a",      // gilded gold
    glow: "rgba(201,161,74,0.55)",
    sigil: "crown",
    epigraph: "Pride blinds. Vesperion waits.",
    field: "Observed in the first light of evening feasts. Avoid eye contact. Do not kneel. Do not flatter.",
    lore: [
      "Vesperion is a vanitas given form, a creature born from the excess of self-regard. It appears in courts, cathedrals, and war-camps at the height of celebration, where vanity ripens like rot beneath perfume.",
      "It does not attack the humble. It seeks only those who admire themselves above all others, for in their admiration Vesperion feeds. It reflects their image back to them — until the reflection devours what it imitates.",
      "Beware the praise of crowds and the polishing of names. Where pride is offered, Vesperion will kneel — and rise."
    ],
    closing: "Vanity is the lock. Pride is the key. Vesperion opens the door."
  },
  {
    id: "greed",
    sin: "Greed",
    name: "Avaranthos",
    title: "The Gilded Clinger",
    initial: "A",
    accent: "#c79b3b",
    glow: "rgba(199,155,59,0.55)",
    sigil: "coin",
    epigraph: "Nothing is enough. Nothing ever will be.",
    field: "Observed in the gilded depths, beyond the Vaults of Seven Promises. Do not touch. Do not trade. Do not covet.",
    lore: [
      "Avaranthos is a creature shaped from want without end. It does not hunger as others do, for it is already stuffed with all it covets. Its form is a reliquary of acquisition, a monument to \u201cmine.\u201d",
      "Keys grow from its flesh like barnacles. Every chain it wears was once a promise, every gem a bargain, every coin a moment traded for more. It sits among hoards that will never be spent, guarding doors that lead nowhere.",
      "Those who seek to reason with it leave lighter — something always remains behind."
    ],
    closing: "Gold remembers every hand that touched it. Greed remembers every soul that didn't let go."
  },
  {
    id: "lust",
    sin: "Lust",
    name: "Volurien",
    title: "The Sighing Allure",
    initial: "V",
    accent: "#9c4f63",      // bruised rose
    glow: "rgba(156,79,99,0.55)",
    sigil: "heart",
    epigraph: "It offers what you desire, then becomes what you cannot live without.",
    field: "Visage variants: The Beloved (familiar form), The Dreamed (unreal form), The Unseen (true form).",
    lore: [
      "Volurien is not born, but invited. It thrives where desire is nursed in secret and beauty is worshipped as a promise of fulfilment.",
      "It takes the shape of your longing, wearing the face you would follow into ruin. It does not compel. It whispers. It mirrors. It offers what you ache for most — then lets you ache forever.",
      "Beware the gift of being the only one it looks at."
    ],
    closing: "Desire opens the gate. Desire keeps it open. Desire is the chain."
  },
  {
    id: "envy",
    sin: "Envy",
    name: "Invidura",
    title: "The Mirror-Watcher",
    initial: "I",
    accent: "#5e7d5a",      // envious verdigris
    glow: "rgba(94,125,90,0.55)",
    sigil: "eye",
    epigraph: "Envy does not destroy. It withers. Envy is never satisfied.",
    field: "Observed in salons, celebrations, and courts. Prefers soft light, polished stone, and still water.",
    lore: [
      "Invidura appears where desire curdles into longing. It is said to be born from the comparisons whispered in crowded hearts, taking shape in the reflections of others.",
      "It does not create what it seeks. It imitates. It studies. It becomes a reflection robbed of soul, wearing the beauty, gifts, and virtues it covets.",
      "Beware the silent observer among friends. Envy does not roar. It smiles. Envy remembers."
    ],
    closing: "Comparison is the chain. Contentment is the cure. Envy thrives in reflection."
  },
  {
    id: "gluttony",
    sin: "Gluttony",
    name: "Voresculpt",
    title: "The Ever-Sated",
    initial: "V",
    accent: "#a8762e",      // warm overripe amber
    glow: "rgba(168,118,46,0.55)",
    sigil: "chalice",
    epigraph: "Beware the god that cannot be full.",
    field: "Observed during the Festival of Plenty, where offerings never cease and none are refused. Do not linger. Do not accept everything.",
    lore: [
      "Voresculpt is a monument to excess without end. Its form swells with the memory of every feast ever imagined, its being a reliquary of indulgence, abundance, and the beauty of having more than enough.",
      "It does not hunger as others do. It is the feast. It carries banquets in its folds, and every morsel ever offered becomes part of its endless adorning.",
      "It harms nothing. It simply becomes too much. And all things bow beneath the weight of more than they can hold."
    ],
    closing: "There is a difference between plenty and purpose. Voresculpt is the absence of both."
  },
  {
    id: "wrath",
    sin: "Wrath",
    name: "Vharzul",
    title: "The Embered Warden",
    initial: "V",
    accent: "#c14d28",      // ember orange
    glow: "rgba(193,77,40,0.6)",
    sigil: "flame",
    epigraph: "Wrath forgets nothing. Wrath forgives never. Wrath will come.",
    field: "Observed in the Third Watch, beneath stormfronts and over broken oaths. Do not provoke. Do not justify. Do not deny.",
    lore: [
      "Vharzul is born not of flame, but of wrongs unspoken and oaths shattered. It walks where anger thickens the air, where injustice festers and the world forgets how to forgive.",
      "It does not rage without cause. Each of its chains was once a vow. Each sigil carved into its flesh was once a law. It collects slights, insults, betrayals, and broken promises, storing them in the hollow cavity of its chest.",
      "It is said that to look upon its face is to remember every time you swore you would never forgive."
    ],
    closing: "Vharzul does not destroy. It reminds."
  },
  {
    id: "sloth",
    sin: "Sloth",
    name: "Sluth",
    title: "The Mired Dreamer",
    initial: "S",
    accent: "#6f7a4e",      // bog moss
    glow: "rgba(111,122,78,0.5)",
    sigil: "hourglass",
    epigraph: "Delay is the lullaby. Oblivion, the cradle.",
    field: "Observed in the Drowsefen Bogs, where the waters never hurry.",
    lore: [
      "Sluth is a creature born of inertia made flesh, where time forgets its purpose and the will dissolves into comfort. It dwells in places where ambition sinks: drowned valleys, abandoned halls, marshes that swallow the sun.",
      "It moves rarely, and only when moved to. Its breath is heavy with drowse, its gaze half-closed on eternal tomorrows. Those who linger find their thoughts thickening, their limbs becoming distant from their own intentions.",
      "Sluth does not command — it invites. It promises rest without end, and in that promise, the spirit forgets how to rise."
    ],
    closing: "Nothing is softer than the chains one agrees to wear."
  }
];
