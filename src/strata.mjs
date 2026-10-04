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
      hit("Spore tap", 5, "Earth"),
      mark("nausea"),
      apply("nausea"),
      hit("Root lash", 7, "Earth"),
    ],
    "Telegraphs one Nausea space; covering it restores neighboring cards' power.",
    "Cover the marked space, or keep your attacks away from its neighbors.",
    { corruptionCap: 1 },
  );
  add(
    "loopMoth",
    "Loop Moth",
    "Mote",
    "Wind",
    25,
    "Skittish",
    [hit("Frayed wing", 6, "Wind"), mark("insanity"), apply("insanity"), rest],
    "Telegraphs one Insanity space, which hurts while uncovered.",
    "A cheap cover stops the escalating loss.",
    { corruptionCap: 1 },
  );
  add(
    "dewThief",
    "Dew Thief",
    "Mote",
    "Water",
    30,
    "Skittish",
    [
      hit("Dew needle", 6, "Water"),
      { name: "Glass dew", guard: 6, element: "Water" },
      rest,
    ],
    "Steals a quiet turn to gather 6 Guard.",
    "Build during the pause, then strike with Wind.",
  );
  add(
    "threadMite",
    "Thread Mite",
    "Mote",
    "Arcane",
    20,
    "Stalker",
    [
      hit("Snip", 4, "Arcane"),
      { name: "Tangle", channel: -1, element: "Arcane" },
      rest,
    ],
    "Tangle removes one Channel next turn only.",
    "Use its quiet rounds to place cards.",
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
      hit("Twin fangs", 5, "Fire", { hits: 2 }),
      { name: "Distraction", focus: -1, element: "Fire" },
      hit("Bound", 9, "Fire"),
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
    [mark("hole"), apply("hole"), hit("Unwrite", 8, "Light"), rest],
    "Telegraphs one Memory Hole on an empty space.",
    "Occupying its mark before it resolves prevents the Hole.",
    { corruptionCap: 1 },
  );
  add(
    "bellowsGrub",
    "Bellows Grub",
    "Mote",
    "Fire",
    38,
    "Stalker",
    [{ name: "Draw breath", element: "Fire" }, hit("Exhale", 10, "Fire"), rest],
    "A heavy breath with two turns between attacks.",
    "Prepare Water Guard while it inhales.",
  );
  add(
    "looseEcho",
    "Loose Echo",
    "Mote",
    "Chaos",
    32,
    "Stalker",
    [hit("First echo", 7, "Chaos"), hit("Answer", 7, "Light"), rest],
    "Alternates Chaos and Light attacks before a pause.",
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
      hit("Spindle", 8, "Arcane"),
      mark("nausea", 2),
      apply("nausea"),
      hit("Double stitch", 6, "Arcane", { hits: 2 }),
      rest,
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
      mark("insanity"),
      apply("insanity"),
      hit("Borrowed smile", 9, "Water"),
      { name: "Mirror skin", guard: 8, element: "Water" },
      hit("Tear", 9, "Water"),
    ],
    "Adds Insanity while sheltering behind Guard. Maximum two.",
    "Cover early; Wind cuts through its defenses.",
    { corruptionCap: 2 },
  );
  add(
    "surveyor",
    "Quiet Surveyor",
    "Eidolon",
    "Earth",
    90,
    "Sentinel",
    [
      mark("hole"),
      apply("hole"),
      hit("Measure twice", 7, "Earth", { hits: 2 }),
      rest,
    ],
    "Telegraphs empty spaces for Memory Holes. Maximum two.",
    "Occupy its marks, route around holes, or upgrade the Elves.",
    { corruptionCap: 2 },
  );
  add(
    "seamstress",
    "Seamstress of Absence",
    "Archon",
    "Light",
    190,
    "Archon",
    [
      hit("Silver needles", 8, "Light", { hits: 2 }),
      { ...mark("hole"), alsoCorruption: "nausea" },
      apply("hole"),
      hit("Cut the seam", 12, "Light"),
      { name: "Fold inward", guard: 10, element: "Light" },
    ],
    "Unthreads empty spaces into Memory Holes beside a Nausea mark. Maximum three active Corruptions.",
    "Fill a Hole mark before it resolves. Cover Nausea; preserve a flexible formation.",
    { corruptionCap: 3, bossMode: "stalker" },
  );
  add(
    "censer",
    "Censer Engine",
    "Archon",
    "Fire",
    210,
    "Archon",
    [
      hit("Furnace breath", 9, "Fire"),
      mark("mine"),
      apply("mine"),
      hit("Bellows", 6, "Fire", { hits: 2 }),
      rest,
    ],
    "Plants telegraphed Mind Mines with three full response turns. Maximum two. An uncovered explosion deals 18 Arcane; a cover sacrifices its top card.",
    "Use spent cards as covers, or repair early with upgraded Elves.",
    { corruptionCap: 2, bossMode: "stalker" },
  );
  add(
    "borrowedChoir",
    "Choir of Borrowed Hands",
    "Archon",
    "Chaos",
    180,
    "Archon",
    [
      hit("Invitation", 8, "Chaos"),
      mark("hypnosis"),
      apply("hypnosis"),
      hit("Marionette hymn", 10, "Chaos"),
      {
        name: "Release the strings",
        releaseCorruption: true,
        element: "Chaos",
      },
    ],
    "Hypnosis compels a marked attack or defense card on enemy turns, spending its normal uses. Releases its Corruption at cycle end.",
    "Activate the marked card first, Recall it, or let its allowance run out. Repair with upgraded Elves.",
    { corruptionCap: 1, bossMode: "hunter" },
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
