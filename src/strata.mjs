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
  hole: {
    name: "Memory Hole",
    symbol: "◉",
    advanced: true,
    text: "This space cannot accept cards. Upgraded Machine Elves are the exception: place them here and Mend to repair it.",
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
    text: "Explodes after three full player turns. Uncovered: 18 Arcane damage through the normal defense chain. Covered: destroys only the top card instead. Covering does not pause the fuse.",
  },
  hypnosis: {
    name: "Hypnosis",
    symbol: "◎",
    advanced: true,
    text: "At the end of the enemy round, the top card spends one remaining use: its damage attacks you, or its Guard protects the source enemy. No Channel cost. Charging cards gain a charge instead. Once-per-turn activation still applies. Machine Elves and utility-only cards cannot be compelled.",
  },
};

export function registerStratum2(card, enemy, glossary) {
  card(
    "elves",
    "Machine Elves",
    "Arcane",
    "Ally",
    1,
    1,
    { mend: true },
    "Mend: repair the Corruption beneath this card at the start of your next turn, then return to discard. Must survive. Repairs Nausea and Insanity; upgraded, also Memory Hole, Mind Mine and Hypnosis. Place only on a repairable Corruption.",
    {
      stratum: 2,
      companion: true,
      hp: 4,
      upgrade: {
        gold: 100,
        text: "Also repairs Memory Hole, Mind Mine and Hypnosis. Can enter Memory Holes.",
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
    "Archon",
    "Light",
    190,
    "Archon",
    [
      {
        ...mark("hole", 2),
        alsoCorruption: "nausea",
        ...hit("Silver needles", 9, "Light", { hits: 2 }),
      },
      { ...apply("hole"), ...hit("Cut the seam", 13, "Light") },
      { ...hit("Fold inward", 9, "Light"), guard: 10 },
      hit("Unravel", 15, "Light"),
    ],
    "Marks two Memory Holes and one Nausea while attacking. Maximum five active Corruptions.",
    "Redirect Hole marks. Cover Nausea; preserve a flexible formation.",
    { corruptionCap: 5, bossMode: "stalker" },
  );
  add(
    "censer",
    "Censer Engine",
    "Archon",
    "Fire",
    210,
    "Archon",
    [
      { ...apply("mine"), ...hit("Furnace breath", 10, "Fire") },
      hit("Bellows", 8, "Fire", { hits: 2 }),
      { ...mark("mine", 2), ...hit("Stoke the fuse", 11, "Fire") },
    ],
    "Plants one Mind Mine with its first attack, then marks two while attacking. Three full response turns per fuse; maximum three Mines. Uncovered explosion: 18 Arcane; covered: sacrifice the top card.",
    "Use spent cards as covers, or repair early with upgraded Elves.",
    { corruptionCap: 3, bossMode: "stalker", openingCorruption: mark("mine") },
  );
  add(
    "borrowedChoir",
    "Choir of Borrowed Hands",
    "Archon",
    "Chaos",
    180,
    "Archon",
    [
      { ...mark("hypnosis", 2), ...hit("Invitation", 9, "Chaos") },
      { ...apply("hypnosis"), ...hit("Borrowed chorus", 9, "Chaos") },
      hit("Marionette hymn", 11, "Chaos"),
    ],
    "Marks up to two useful attack or defense cards while attacking. Hypnosis spends their normal uses on enemy turns and remains until repaired or battle ends. Maximum two active spaces.",
    "Activate the marked card first, Recall it, or let its allowance run out. Clear the space and repair with upgraded Machine Elves; recalling a card does not remove Hypnosis.",
    { corruptionCap: 2, bossMode: "hunter" },
  );
  add(
    "mendingTutor",
    "Patient Spool",
    "Mote",
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
    40,
    "Sentinel",
    [
      rest,
      hit("Loose spindle", 5, "Arcane"),
      mark("nausea"),
      apply("nausea"),
      rest,
    ],
    "A gentle final practice: one Nausea space, with pauses between attacks.",
    "Cover the space or Mend; keep an attack ready.",
    { tutorialOnly: true, corruptionCap: 1 },
  );
  for (const def of Object.values(CORRUPTIONS)) glossary[def.name] = def.text;
  glossary.Mend =
    "Machine Elves spend one activation, survive through the enemy round, then repair their space and return to discard at the next player turn. Freeze delays completion.";
}
