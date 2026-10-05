export const STRATA = {
  1: { name: "The Whispering Weald", early: ["bat", "beetle", "moth", "wisp"] },
  2: {
    name: "The Unfinished Loom",
    early: ["sourcap", "loopMoth", "dewThief", "threadMite"],
  },
};
export const ELVES_STORY =
  "The path ends at a tear in the ground. Three small figures kneel beside it, passing a silver thread through places your eyes cannot follow. One pulls; the far bank draws close. They pack their needles when they see you. The smallest points at your grimoire, then at the damaged path ahead. You open the book. They climb inside.";
export const CORRUPTIONS = {
  anger: {
    name: "Anger",
    symbol: "✷",
    text: "At each player-turn start, after Reveal, uncovered Anger forces one eligible north/east/south/west card to activate without choosing an Attunement. Lowest printed damage/Guard strength first (utility: 0); ties use topmost then leftmost space. Costs 1 Channel and the normal card allowance. Attacks target the topmost living enemy; other choices use the first legal target. Fixed or Transmuted elements remain. No eligible card or Channel: nothing happens. Cover to suppress, or Mend immediately.",
  },
  bile: {
    name: "Bile",
    symbol: "◒",
    text: "Moves between spaces without a trail. Arrival spends one remaining activation of the top card. One Bile acts each enemy round: left-edge Poison 2 first, otherwise the leftmost movable Bile moves up/down or diagonally left; otherwise a new glob hits the rightmost eligible card. Machine Elves intercept and remove it, spending one use. Can coexist with another Corruption.",
  },
  hole: {
    repairTurns: 2,
    name: "Memory Hole",
    symbol: "◉",
    text: "This space cannot accept cards. Machine Elves can enter. Mend takes two turns, or one when upgraded.",
  },
  nausea: {
    name: "Nausea",
    symbol: "≈",
    text: "While uncovered, orthogonally adjacent cards deal half damage and generate half Guard (rounded down). Multiple Nauseas do not multiply. Cover this space to suppress it; the Corruption remains underneath.",
  },
  insanity: {
    name: "Insanity",
    symbol: "↻",
    text: "At the start of each player turn while uncovered, lose 1, then 2, then 3 HP, and so on. Cover to suppress and reset to 1. This bypasses defenses.",
  },
  mine: {
    name: "Mind Mine",
    symbol: "✹",
    advanced: true,
    text: "After placement, you get one full player turn to respond; explodes on the following enemy turn. Uncovered: 20 Fire damage through the normal defense chain. Covered: destroys only the top card instead. Covering does not pause the fuse. Machine Elves defuse immediately.",
  },
  hypnosis: {
    repairTurns: 2,
    name: "Hypnosis",
    symbol: "◎",
    advanced: true,
    text: "At the end of the enemy round, the top card spends one remaining use: its damage attacks you, or its Guard protects the source enemy. No Channel cost. Charging cards gain a charge instead. Once-per-turn activation still applies. Machine Elves and utility-only cards cannot be compelled. Displacement onto Hypnosis compels immediately, even after a normal activation, but never twice that enemy round. Mend takes two turns, or one when upgraded.",
  },
};

export function registerStratum2(card, enemy, glossary) {
  card(
    "elves",
    "Machine Elves",
    "Arcane",
    "Ally",
    1,
    3,
    { mend: true },
    "Mend: choose this space or an orthogonally adjacent Corruption. Three uses; one per turn. Most repairs are immediate; Memory Hole and other more powerful Corruptions take two turns (upgraded: one). May be placed anywhere, including Holes. After the final successful repair, Recall to Discard automatically for no Focus. May Recall early for 1 Focus; unfinished repairs are canceled. Intercepts Bile, spending one use to remove it.",
    {
      stratum: 2,
      companion: true,
      recall: 1,
      hp: 4,
      upgrade: {
        gold: 100,
        item: "tools",
        text: "Strong repairs take one turn instead of two. Requires Tools + 100 Gold at a Tavern; consumes the Tools.",
      },
    },
  );
  card(
    "quietStitch",
    "Quiet Stitch",
    "Water",
    "Spell",
    1,
    1,
    { stitch: true },
    "Remove Nausea or Insanity from this space immediately. Single use; Destroyed after activation.",
    {
      stratum: 2,
      rarity: "common",
      destroyAfterActivation: true,
      singleUse: true,
      recall: null,
    },
  );
  const hit = (name, damage, element, extra = {}) => ({
    name,
    damage,
    element,
    ...extra,
  });
  const rest = { name: "Gather the threads", element: "Arcane" };
  const mark = (kind, count = 1) => ({
    name: "Foretell " + CORRUPTIONS[kind].name,
    element: "Arcane",
    markCorruption: kind,
    count,
  });
  const apply = (kind) => ({
    name: CORRUPTIONS[kind].name,
    element: "Arcane",
    applyCorruption: true,
  });
  const add = (
    id,
    name,
    tier,
    element,
    hp,
    movement,
    rotation,
    signature,
    counter,
    extra = {},
  ) =>
    enemy(id, name, tier, element, hp, movement, rotation, signature, counter, {
      stratum: 2,
      ...extra,
    });
  add(
    "sourcap",
    "Sourcap Tender",
    "Mote",
    "Earth",
    28,
    "Stalker",
    [
      { ...apply("nausea"), ...hit("Sickening tap", 6, "Earth") },
      hit("Root lash", 8, "Earth"),
      { ...mark("nausea"), ...hit("Spore tap", 6, "Earth") },
    ],
    "Marks Nausea at battle start and applies it with its first attack. Later marks also attack.",
    "Redirect the warning by placing a card, then cover the resulting Nausea or keep attacks away from it.",
    { corruptionCap: 2, openingCorruption: mark("nausea") },
  );
  add(
    "loopMoth",
    "Loop Moth",
    "Mote",
    "Wind",
    25,
    "Skittish",
    [
      { ...apply("insanity"), ...hit("Frayed wing", 5, "Wind") },
      hit("Looping cut", 8, "Wind"),
      { ...mark("insanity"), ...hit("Unravel thought", 6, "Wind") },
    ],
    "Marks Insanity at battle start and applies it with its first attack. Maximum two active spaces.",
    "A cheap cover stops the escalating loss.",
    { corruptionCap: 2, openingCorruption: mark("insanity") },
  );
  add(
    "dewThief",
    "Dew Thief",
    "Mote",
    "Water",
    30,
    "Skittish",
    [
      hit("Dew needle", 7, "Water"),
      { ...hit("Glass dew", 6, "Water"), guard: 6 },
    ],
    "Alternates a Water needle with a lighter attack that gathers 6 Guard.",
    "Wind cuts through its defense; it no longer pauses to gather dew.",
  );
  add(
    "threadMite",
    "Thread Mite",
    "Mote",
    "Arcane",
    20,
    "Stalker",
    [hit("Snip", 5, "Arcane"), { ...hit("Tangle", 4, "Arcane"), channel: -1 }],
    "Tangle removes one Channel next turn only.",
    "Place efficient defenses before its Channel tax; groups keep attacking.",
    { grouped: true },
  );
  add(
    "frayedHound",
    "Frayed Hound",
    "Mote",
    "Fire",
    40,
    "Hunter",
    [
      hit("Twin fangs", 6, "Fire", { hits: 2 }),
      { name: "Distraction", focus: -1, element: "Fire" },
      hit("Bound", 10, "Fire"),
    ],
    "Two Fire bites, then a Focus tax and one heavy attack.",
    "Water defenses handle the bites; develop during Distraction.",
  );
  add(
    "hollowScribe",
    "Hollow Scribe",
    "Mote",
    "Light",
    34,
    "Sentinel",
    [
      {
        ...mark("hole", 14),
        spread: true,
        ...hit("Erase the page", 5, "Light"),
      },
      { ...apply("hole"), ...hit("Unwrite", 9, "Light") },
      hit("Inkless quill", 9, "Light"),
    ],
    "Telegraphs up to 14 Memory Holes across the grid: one third of its 42 spaces. Maximum 14 active Holes; later casts replace repaired ones.",
    "Placing on a warning redirects it. Plan around the holes, kill the Scribe before the cast, or repair with upgraded Elves.",
    { corruptionCap: 14 },
  );
  add(
    "bellowsGrub",
    "Bellows Grub",
    "Mote",
    "Fire",
    38,
    "Stalker",
    [
      { ...hit("Draw breath", 6, "Fire"), guard: 5 },
      hit("Exhale", 13, "Fire"),
      rest,
    ],
    "A light breath gathers 5 Guard before a heavy exhale and a recovery turn.",
    "Prepare Water Guard before Exhale; build while it recovers.",
  );
  add(
    "looseEcho",
    "Loose Echo",
    "Mote",
    "Chaos",
    32,
    "Stalker",
    [
      hit("First echo", 9, "Chaos"),
      hit("Answer", 9, "Light"),
      { ...hit("Reverberate", 6, "Chaos"), guard: 6 },
    ],
    "Alternates Chaos and Light attacks, then gathers Guard with a softer Chaos echo.",
    "Read each Tell; neutral defense avoids mutual weaknesses.",
  );
  add(
    "spoolkeeper",
    "Spoolkeeper",
    "Eidolon",
    "Arcane",
    85,
    "Stalker",
    [
      { ...mark("nausea", 2), ...hit("Spindle", 9, "Arcane") },
      { ...apply("nausea"), ...hit("Sick stitch", 8, "Arcane") },
      hit("Double stitch", 7, "Arcane", { hits: 2 }),
      { ...hit("Wind the spool", 7, "Arcane"), guard: 6 },
    ],
    "Two Nausea spaces disrupt formations. Maximum two active Corruptions.",
    "Spread your damage, or cover the sick spaces.",
    { corruptionCap: 2 },
  );
  add(
    "borrowedFace",
    "Borrowed Face",
    "Eidolon",
    "Water",
    80,
    "Hunter",
    [
      { ...apply("insanity"), ...hit("Borrowed smile", 9, "Water") },
      { ...hit("Mirror skin", 10, "Water"), guard: 8 },
      { ...mark("insanity", 2), ...hit("Tear", 10, "Water") },
    ],
    "Applies one Insanity with its first attack, then marks two on later cycles while attacking. Maximum three.",
    "Cover early; Wind cuts through its defenses.",
    { corruptionCap: 3, openingCorruption: mark("insanity") },
  );
  add(
    "surveyor",
    "Quiet Surveyor",
    "Eidolon",
    "Earth",
    90,
    "Sentinel",
    [
      { ...mark("hole", 2), ...hit("Survey", 9, "Earth") },
      { ...apply("hole"), ...hit("Measure twice", 8, "Earth", { hits: 2 }) },
      { ...hit("Set the boundary", 9, "Earth"), guard: 8 },
    ],
    "Marks two Memory Holes beside your formations while attacking. Maximum four.",
    "Redirect its marks, route around holes, or upgrade the Elves.",
    { corruptionCap: 4 },
  );
  add(
    "seamstress",
    "Seamstress of Absence",
    "Eidolon",
    "Light",
    110,
    "Stalker",
    [
      {
        ...mark("hole", 2),
        alsoCorruption: "nausea",
        ...hit("Silver needles", 7, "Light", { hits: 2 }),
      },
      { ...apply("hole"), ...hit("Cut the seam", 11, "Light") },
      { ...hit("Fold inward", 7, "Light"), guard: 10 },
      hit("Unravel", 13, "Light"),
    ],
    "Marks two Memory Holes and one Nausea while attacking. Maximum five active Corruptions.",
    "Redirect Hole marks. Cover Nausea; preserve a flexible formation.",
    { corruptionCap: 5 },
  );
  add(
    "censer",
    "Censer Engine",
    "Eidolon",
    "Fire",
    120,
    "Stalker",
    [
      { ...apply("mine"), ...hit("Furnace breath", 8, "Fire") },
      hit("Bellows", 6, "Fire", { hits: 2 }),
      { ...mark("mine", 2), ...hit("Stoke the fuse", 9, "Fire") },
    ],
    "Plants one Mind Mine with its first attack, then marks two while attacking. One full player response turn per fuse; maximum three Mines. Uncovered explosion: 20 Fire; covered: sacrifice the top card.",
    "Use spent cards as covers, or repair early with upgraded Elves.",
    { corruptionCap: 3, openingCorruption: mark("mine") },
  );
  add(
    "borrowedChoir",
    "Choir of Borrowed Hands",
    "Eidolon",
    "Chaos",
    100,
    "Hunter",
    [
      { ...mark("hypnosis", 2), ...hit("Invitation", 7, "Chaos") },
      { ...apply("hypnosis"), ...hit("Borrowed chorus", 7, "Chaos") },
      hit("Marionette hymn", 9, "Chaos"),
    ],
    "Marks up to two useful attack or defense cards while attacking. Hypnosis spends their normal uses on enemy turns and remains until repaired or battle ends. Maximum two active spaces.",
    "Activate the marked card first, Recall it, or let its allowance run out. Clear the space and repair with upgraded Machine Elves; recalling a card does not remove Hypnosis.",
    { corruptionCap: 2 },
  );
  add(
    "blackBile",
    "The Black Bile",
    "Archon",
    "Earth",
    230,
    "Archon",
    [
      { ...mark("nausea", 4), ...hit("Sickening flood", 10, "Earth") },
      { ...apply("nausea"), ...hit("Burning bile", 12, "Fire", { burn: 2 }) },
      hit("Churn", 15, "Earth"),
      hit("Acrid breath", 10, "Fire", { burn: 1 }),
    ],
    "Bile acts every enemy round alongside normal attacks, even during Purify. It moves without a trail and consumes one activation on arrival. Left-edge Bile inflicts Poison 2 and disappears. After four complete cycles, fresh casts throw two globs instead of one; spreading still moves one glob. Nausea spreads four spaces per cast, maximum twelve.",
    "Read Bile's moving warning. Break the route, spend a threatened activation, or intercept with Machine Elves. Bile may share a Nausea space.",
    { corruptionCap: 12, bile: true, bossMode: "stalker" },
  );
  add(
    "bombadier",
    "King Bombadier",
    "Archon",
    "Fire",
    240,
    "Archon",
    [
      { ...apply("mine"), ...hit("Royal bombardment", 10, "Fire") },
      {
        ...mark("mine", 2),
        alsoCorruption: "anger",
        alsoCount: 2,
        ...hit("Excavation", 12, "Arcane"),
      },
      {
        ...apply("hole"),
        name: "Deconstructed Steam",
        element: "Fire",
        sequence: [
          { damage: 8, element: "Fire" },
          { damage: 10, element: "Water" },
          { damage: 12, element: "Wind" },
        ],
        fixedDamage: true,
      },
      {
        ...mark("mine", 2),
        alsoCorruption: "hole",
        alsoCount: 2,
        ...hit("Light the fuses", 12, "Fire"),
      },
    ],
    "Alternates two Memory Holes + two bombs with two Anger spaces + two bombs. The first wave is telegraphed at battle start. Bombs explode for 20 Fire on his next turn: one player turn to respond. Covering sacrifices the top card instead. After four full cycles, both waves cast three bombs instead of two. Machine Elves defuse immediately. Deconstructed Steam hits for 8 Fire, then 10 Water, then 12 Wind.",
    "Defuse or cover the bombs; prepare different elements for each Steam hit. Memory Holes take two turns to Mend, one when upgraded.",
    {
      corruptionCap: 10,
      mineCap: 4,
      mineTurns: 1,
      mineDamage: 20,
      openingCorruption: {
        ...mark("mine", 2),
        alsoCorruption: "hole",
        alsoCount: 2,
      },
      bossMode: "stalker",
    },
  );
  add(
    "trickster",
    "The Trickster",
    "Archon",
    "Chaos",
    220,
    "Archon",
    [
      {
        ...mark("hypnosis", 2),
        ...hit("False face", 15, "Chaos", { fixedDamage: true }),
      },
      {
        ...apply("hypnosis"),
        ...hit("Dazzle", 15, "Light", { fixedDamage: true }),
      },
      {
        ...mark("hole", 2),
        name: "Phase disruption H",
        disrupt: "H",
        element: "Chaos",
      },
      {
        ...apply("hole"),
        ...hit("Anti-elemental", 15, "Arcane", {
          antiElemental: true,
          fixedDamage: true,
        }),
      },
      { name: "Phase disruption V", disrupt: "V", element: "Chaos" },
    ],
    "Creates Hypnosis and Memory Holes (eight active spaces maximum). Phase disruption moves the committed fullest row right two or column down two, wrapping whole stacks. Holes destroy arriving stacks; Hypnosis compels immediately. Anti-elemental counters the unique largest elemental Guard total, including equipment; ties use Arcane.",
    "Read the committed line and landing spaces. Balance elemental Guard before Anti-elemental; its live Tell updates. Ordinary once-per-turn activation does not protect a card forcibly moved onto Hypnosis.",
    { corruptionCap: 8, bossMode: "hunter" },
  );
  add(
    "mendingTutor",
    "Patient Spoolkeeper",
    "Eidolon",
    "Arcane",
    100,
    "Sentinel",
    [rest],
    "A patient presence at the Mending Ground.",
    "Learn how spaces remember.",
    { tutorialOnly: true },
  );
  add(
    "mendingWarden",
    "Patient Spoolkeeper",
    "Eidolon",
    "Arcane",
    100,
    "Sentinel",
    ["nausea", "anger", "hole"].flatMap((kind) => [
      {
        ...mark(kind),
        ...hit(
          "Loose spindle · foretell " + CORRUPTIONS[kind].name,
          7,
          "Arcane",
        ),
        fixedDamage: true,
      },
      apply(kind),
    ]),
    "Alternates a 7 Arcane attack plus a warning, then the warned Corruption without an attack. Rotates Nausea, Anger and Memory Hole. Maximum five Corruptions.",
    "Respond to the marked space before the next enemy turn. Cover or Mend dangerous spaces while keeping an attack ready.",
    {
      tutorialOnly: true,
      corruptionCap: 5,
    },
  );
  for (const def of Object.values(CORRUPTIONS)) glossary[def.name] = def.text;
  glossary["Anti-elemental"] =
    "Trickster attacks the counter to your unique largest elemental Guard total, including Wards and socketed equipment. Tied leaders or only Arcane Guard produce Arcane. The Tell updates as your defenses change.";
  glossary["Phase disruption"] =
    "Trickster moves a committed row right two or column down two, wrapping whole stacks. Holes destroy arriving stacks; Hypnosis compels the top card immediately, even after its normal activation.";
  glossary.Mend =
    "Machine Elves have three uses, one per player turn. Mend this space or one orthogonally adjacent space. Ordinary repairs are immediate; Memory Hole and other more powerful Corruptions take two player-turn starts, or one upgraded. Freeze delays completion. After the final successful repair, Recall to Discard automatically for no Focus. May Recall early for 1 Focus during Placement; unfinished repairs are canceled.";
}
