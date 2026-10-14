export const GUIDE_STORY =
  "Below the Loom, the stone begins to shine. Something upright waits beside a pool of cold light: a familiar shape, grown tall and watchful. It touches your grimoire, then points to a shadow moving against the light. Not every thought here belongs to you. The Lucid Guide steps into the book.";

export const ideonDefs = {
  larva: {
    name: "Hive Larva",
    element: "Arcane",
    hp: 16,
    damage: 18,
    turnDamage: 0,
    speed: 1,
    behavior: "crawl",
    swap: true,
    text: "Opening swarm only. Moves one space west, swapping player Constructs into its old space. Does no damage while crossing the grid. On its next command after reaching the left edge, strikes for 18 damage of its element and disappears.",
  },
  drone: {
    name: "Drone",
    element: "Arcane",
    hp: 50,
    damage: 5,
    damageGrowth: 5,
    speed: 0,
    behavior: "strike",
    text: "Does not move. Attacks for 5 damage of its element on its first command, then 10, 15, 20 and so on, increasing by 5 each command until killed.",
  },
  runner: {
    name: "Glass Skitter",
    element: "Wind",
    hp: 10,
    damage: 9,
    turnDamage: 1,
    speed: 1,
    behavior: "crawl",
    swap: true,
    text: "Moves one space west, northwest or southwest, randomly choosing a legal space and swapping any player Construct into its old space. Then attacks for 1 damage of its element, even if blocked from moving. At the left edge, instead strikes for 9 damage and disappears. Newly hatched insects wait until the next enemy turn.",
  },
  burrower: {
    name: "Thought Burrower",
    element: "Earth",
    hp: 16,
    damage: 12,
    turnDamage: 1,
    speed: 1,
    behavior: "crawl",
    swap: true,
    text: "Moves left one space, swapping a player Construct into its old space if necessary. Then attacks for 1 damage of its element, even if blocked from moving. At the left edge, instead strikes for 12 damage and disappears. Newly hatched insects wait until the next enemy turn.",
  },
  guardian: {
    name: "Hollow Sentinel",
    element: "Arcane",
    hp: 22,
    damage: 7,
    guardian: true,
    arcaneWeak: true,
    behavior: "strike",
    text: "Protects its owner, including from area damage. Takes half elemental attack damage, but 50% extra Arcane. Commands strike for 7 Arcane.",
  },
  binder: {
    name: "Clinging Thought",
    element: "Chaos",
    hp: 14,
    damage: 6,
    behavior: "strike",
    sticky: true,
    text: "Adjacent cards cannot Recall. Commands strike for 6 Chaos from this space.",
  },
  leech: {
    name: "Glass Leech",
    element: "Water",
    hp: 14,
    behavior: "leech",
    text: "Drains 1 Ward from adjacent Wards whenever you place or activate a card. When commanded, heals its owner with its stored Ward. Killing it loses the reserve.",
  },
  shuttle: {
    name: "Nerve Shuttle",
    element: "Light",
    hp: 16,
    behavior: "swap",
    text: "When commanded, swaps the first two adjacent player stacks. Corruptions stay on their spaces.",
  },
  tentacle: {
    name: "Hunting Tendril",
    element: "Water",
    hp: 18,
    damage: 4,
    behavior: "tentacle",
    text: "Gains 1 attack each owner command. Attacks the weakest Ally directly; without Allies, moves left. At the left edge inflicts Poison 2 each command. Killing tendrils increases their replacements.",
  },
  bullet: {
    name: "Refracted Thought",
    element: "Arcane",
    hp: 18,
    damage: 12,
    speed: 2,
    covers: true,
    behavior: "bullet",
    text: "Moves two spaces left per command. Covers and disables its current space. Emits a radius-1 diamond activation field. On leaving the grid: 12 Pierce damage; only equipment can defend.",
  },
};

export function registerDepths(card, enemy, glossary, events) {
  const extra = { stratum: 3 };
  card(
    "lucidNeedle",
    "Lucid Needle",
    "Arcane",
    "Spell",
    0,
    2,
    { damage: 6, ideonDouble: true },
    "Deal 6 Arcane damage, doubled against Ideons. Recall: 1 Focus.",
    {
      ...extra,
      recall: 1,
      upgrade: {
        gold: 120,
        bonus: 2,
        text: "+2 damage (8; 16 against Ideons).",
      },
    },
  );
  card(
    "scouringGale",
    "Scouring Gale",
    "Wind",
    "Spell",
    1,
    2,
    { damage: 4, beam: 8 },
    "Deal 8 Wind damage to each Ideon to the right in this row, then 4 Wind to one enemy. Friendly cards are unharmed. Recall: 1 Focus.",
    {
      ...extra,
      recall: 1,
      rarity: "rare",
      upgrade: {
        gold: 120,
        bonus: 2,
        text: "+2 damage to the beam and final hit.",
      },
    },
  );
  card(
    "lucidGuide",
    "Lucid Guide",
    "Arcane",
    "Ally",
    1,
    12,
    { guide: true, damage: 5 },
    "Move up to one orthogonal empty space, then deal 5 Arcane to an adjacent Ideon and mark it. The next attack activation from a different card deals +3 damage to it. May move without attacking. Cannot Recall.",
    {
      ...extra,
      companion: true,
      hp: 12,
      recall: null,
      upgrade: {
        gold: 120,
        bonus: 3,
        text: "+3 HP and +3 Ideon attack damage.",
      },
    },
  );
  card(
    "concord",
    "Concord of Seasons",
    "Arcane",
    "Spell",
    4,
    2,
    { damage: 10, all: true, concord: true },
    "Requires three distinct adjacent non-Arcane source elements. Deal 10 damage of each distinct element to all enemies and Ideons (maximum four waves). Recall: 2 Focus.",
    { ...extra, rarity: "legendary", channel: 3, recall: 2 },
  );
  card(
    "secondSpring",
    "Second Spring",
    "Water",
    "Spell",
    3,
    1,
    { secondSpring: true },
    "Restore two uses to up to four spent damage, Shield or Ward cards, strongest first. Does not refill HP, charges or Ward, revive depletion, or allow another activation this turn. Utility-only and single-use cards are excluded. Destroyed after use; cannot Recall.",
    {
      ...extra,
      rarity: "legendary",
      channel: 3,
      recall: null,
      singleUse: true,
      destroyAfterActivation: true,
    },
  );
  const hit = (name, damage, element, more = {}) => ({
    name,
    damage,
    element,
    ...more,
  });
  const summon = (name, kind, count, damage, element, more = {}) =>
    hit(name, damage, element, {
      summonIdeon: kind,
      summonCount: count,
      ...more,
    });
  const command = (name, damage, element, more = {}) =>
    hit(name, damage, element, { commandIdeons: true, ...more });
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
    options = {},
  ) =>
    enemy(id, name, tier, element, hp, movement, rotation, signature, counter, {
      stratum: 3,
      ...options,
    });
  add(
    "glassBrood",
    "Glass Brood",
    "Mote",
    "Wind",
    48,
    "Stalker",
    [
      summon("Lay a thought", "runner", 1, 9, "Wind"),
      command("Scuttle", 12, "Earth"),
    ],
    "Spawns a Glass Skitter, then commands its advance while alternating Wind and Earth attacks.",
    "Remove the skitter before it gets behind your guards.",
  );
  add(
    "nerveWeaver",
    "Nerve Weaver",
    "Mote",
    "Light",
    52,
    "Sentinel",
    [
      summon("Loose nerve", "shuttle", 1, 10, "Light"),
      command("Twitch", 11, "Chaos"),
    ],
    "Creates a Nerve Shuttle that swaps adjacent player stacks on command.",
    "Keep key formations away from the shuttle or kill it before Twitch.",
  );
  add(
    "paleGrazer",
    "Pale Grazer",
    "Mote",
    "Water",
    56,
    "Skittish",
    [
      summon("Drink the stillness", "leech", 1, 10, "Water"),
      command("Return the light", 12, "Wind"),
    ],
    "Glass Leeches drain adjacent Wards as you build and act, then heal the Grazer.",
    "Kill the leech before its owner drinks the reserve.",
  );
  add(
    "echoPolyp",
    "Echo Polyp",
    "Mote",
    "Chaos",
    48,
    "Wanderer",
    [
      hit("Sickening pulse", 10, "Chaos", { applyCorruption: true }),
      hit("Cold echo", 12, "Water", { markCorruption: "nausea", count: 2 }),
    ],
    "Spreads two Nauseas while attacking in Chaos and Water.",
    "Cover Nausea or send the Elves while preparing both elements.",
    {
      corruptionCap: 6,
      openingCorruption: { markCorruption: "nausea", count: 2 },
    },
  );
  add(
    "blindSeer",
    "Blind Seer",
    "Mote",
    "Light",
    54,
    "Stalker",
    [
      hit("Unseeing gaze", 11, "Light", { applyCorruption: true }),
      hit("Splintered sight", 9, "Chaos", {
        markCorruption: "anger",
        count: 2,
      }),
    ],
    "Telegraphs Anger while alternating Light and Chaos attacks.",
    "Cover the marked spaces before your engine wastes Channel.",
    {
      corruptionCap: 6,
      openingCorruption: { markCorruption: "anger", count: 2 },
    },
  );
  add(
    "hollowDrifter",
    "Hollow Drifter",
    "Mote",
    "Earth",
    60,
    "Stalker",
    [
      summon("Hollow shell", "guardian", 1, 8, "Earth"),
      command("Resonant fracture", 13, "Fire"),
    ],
    "A Hollow Sentinel protects it until destroyed. The Drifter flies over map barriers.",
    "Arcane attacks efficiently break the sentinel. Elemental attacks still work.",
    { flying: true },
  );
  add(
    "kindlyHunger",
    "The Kindly Hunger",
    "Eidolon",
    "Water",
    125,
    "Stalker",
    [
      summon("A gentle thirst", "leech", 2, 13, "Water"),
      command("Drink Deep", 16, "Wind"),
      hit("Empty Embrace", 0, "Water", {
        sequence: [
          { damage: 12, element: "Water" },
          { damage: 12, element: "Earth" },
        ],
        markCorruption: "insanity",
        count: 2,
      }),
      hit("Leave nothing", 15, "Chaos", { applyCorruption: true }),
    ],
    "Creates two Ward-draining leeches, commands their healing, then threatens Insanity and mixed-element damage.",
    "Protect stored Ward by removing parasites before developing the engine.",
    { corruptionCap: 6 },
  );
  add(
    "knotkeeper",
    "The Knotkeeper",
    "Eidolon",
    "Chaos",
    135,
    "Hunter",
    [
      summon("Bind the pattern", "binder", 2, 12, "Chaos"),
      summon("Thread the needle", "shuttle", 1, 14, "Light", {
        markCorruption: "hole",
        count: 2,
      }),
      command("Pull tight", 16, "Earth", { applyCorruption: true }),
    ],
    "Binders lock nearby Recall; a Shuttle moves stacks while Memory Holes threaten their landing places.",
    "Kill the Binder or Shuttle before the committed disruption.",
    { corruptionCap: 8 },
  );
  add(
    "borrowedOracle",
    "Borrowed Oracle",
    "Eidolon",
    "Light",
    120,
    "Sentinel",
    [
      summon("Another face", "guardian", 1, 12, "Light", {
        markCorruption: "hypnosis",
        count: 2,
      }),
      command("Your hands remember", 15, "Chaos", { applyCorruption: true }),
      hit("Foreign sensation", 0, "Wind", {
        sequence: [
          { damage: 12, element: "Wind" },
          { damage: 14, element: "Fire" },
        ],
      }),
    ],
    "Protects itself with an Arcane-vulnerable sentinel while Hypnosis turns your cards against you.",
    "Use Arcane to open the owner, and keep the Elves available.",
    { corruptionCap: 6 },
  );
  add(
    "mindHive",
    "The Mind Hive",
    "Archon",
    "Earth",
    15,
    "Archon",
    [
      command("The procession", 0, "Earth", {
        hiveWave: true,
        fixedDamage: true,
      }),
    ],
    "Invulnerable: survive 15 rounds. Starts with eight mixed-element Hive Larvae, plus one per overworld movement round since spawning, across the rightmost three columns (space permitting), spread over all six lanes. Larvae have 16 HP, move west without attacking, then hit for 18 damage and disappear on their next command at the left edge. You act before they move. Each turn commands existing insects, hatches last turn's Mind Eggs, then lays new ones, including beneath cards. Rounds 1–4: 1 egg in the rightmost column; 5–8: 2 in the rightmost two; 9–11: 4 in the rightmost three; 12–13: 6 in the rightmost four; 14: 8 in the rightmost four. Round 15 commands and hatches, then dies. Eggs vary across all seven elements. Uncovered eggs deal 8 of their element; covered eggs remove the whole Construct without damage: recallable cards to Discard, non-recallable cards and their attachments to Destroyed. Both hatch an insect. Every fourth egg contains a stationary 50-HP Drone: attacks for 5, 10, 15 damage and so on. Burrowers move west; Skitters choose west, northwest or southwest. Both then attack for 1 damage of their element, even if blocked from moving; at the left edge they instead attack for 12 or 9 respectively and disappear. All moving insects swap through player cards, moving leftmost first. Newborns first act on the following turn; all vanish when the Hive dies.",
    "Cover eggs with expendable cards to recycle them, or remove eggs with Machine Elves. Prepare for mixed elements. Storm Canopy does not hit Ideons; use targeted attacks, Lucid Guide or Scouring Gale.",
    {
      hive: true,
      bossMode: "stalker",
      statusImmunities: ["burn", "poison", "corrode"],
    },
  );
  add(
    "cnidarian",
    "The Cnidarian",
    "Archon",
    "Water",
    270,
    "Archon",
    [
      command("Stinging veil", 15, "Water", { tentacles: true }),
      command("Nerve bloom", 14, "Light", {
        tentacles: true,
        markCorruption: "nausea",
        count: 2,
      }),
      command("Drown the thought", 0, "Water", {
        tentacles: true,
        applyCorruption: true,
        sequence: [
          { damage: 12, element: "Water" },
          { damage: 12, element: "Chaos" },
        ],
      }),
    ],
    "Begins with three hunting tendrils. They grow +1 attack each command and hunt Allies; without Allies they drift left to inflict Poison 2. Deaths 1–3 replace one-for-one, 4–6 two-for-one, then three-for-one. Replacements arrive after surviving tendrils act.",
    "Race the owner while selectively cutting old tendrils. Killing every tendril makes the brood grow.",
    { bossMode: "stalker", flying: true, corruptionCap: 6 },
  );
  add(
    "refractionCannon",
    "The Refraction Cannon",
    "Archon",
    "Chaos",
    260,
    "Archon",
    [0, 1, 2, 3].map((n) =>
      command(
        n === 3 ? "Terminal refraction" : "Chromatic shot",
        14,
        "Arcane",
        { cannon: true, destructionShot: n === 3, fixedDamage: true },
      ),
    ),
    "Fires three counter-element fields then a destruction field. Every launch also attacks normally for 14. Bullets move two columns left; arrival is 12 Pierce. Covering disables a card. Radius-1 fields restrict activations; destroying the bullet removes its field.",
    "Kill or work around each moving field. Equipment is the only defense against a bullet that reaches you.",
    { bossMode: "sentinel" },
  );
  events.push(
    {
      id: "depthsTribute",
      stratum: 3,
      name: "The Listening Stone",
      text: "A hollow in the crystal repeats your heartbeat. Something inside asks for a memory, a coin, or a wound.",
      choices: [
        { label: "Leave 40 Gold", cost: 40 },
        { label: "Give a little blood", hp: -8 },
        { label: "Refuse the voice", fight: "echoPolyp" },
      ],
    },
    {
      id: "depthsCache",
      stratum: 3,
      name: "A Light in the Chitin",
      text: "A traveler has wedged a lantern inside a discarded shell. Beside it rests a needle of clear thought.",
      choices: [
        {
          label: "Buy Lucid Needle · 100 Gold",
          cost: 100,
          card: "lucidNeedle",
        },
        { label: "Keep walking" },
      ],
    },
    {
      id: "depthsBrood",
      stratum: 3,
      name: "The Divided Passage",
      text: "One tunnel holds a motionless sentinel. In the other, many small feet tap against glass.",
      choices: [
        { label: "Face the Oracle", fight: "borrowedOracle" },
        { label: "Face the brood", fight: "glassBrood", count: 3 },
      ],
    },
  );
  glossary.Ideon =
    "An enemy-owned card inside the Mind Grid. Ordinary attacks can target it; all-enemy attacks include Ideons. It contributes no friendly adjacency or Attunement. All disappear when their owner dies.";
  glossary.Guardian =
    "A guardian Ideon protects its owner, including from area damage, until all its guardians are defeated. It does not protect other enemies or Ideons.";
  glossary.Refraction =
    "A moving Ideon field. The covered card cannot activate, defend or Recall. Neighboring cards must obey the field's activation rule.";
}
