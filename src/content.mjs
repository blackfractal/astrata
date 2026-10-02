export const MIND_COLUMNS = 7,
  MIND_ROWS = 6,
  MIND_SIZE = MIND_COLUMNS * MIND_ROWS;
export const VERSION = {
  rules: "1.3.32",
  content: "1.1.32",
  observation: 1,
  actions: 1,
};
export const ENEMY_STATUS_IMMUNITY = {
  Water: "burn",
  Fire: "poison",
  Chaos: "corrode",
};
export const ELEMENTS = [
  "Arcane",
  "Fire",
  "Earth",
  "Wind",
  "Water",
  "Chaos",
  "Light",
];
export const cycle = {
  Fire: "Earth",
  Earth: "Wind",
  Wind: "Water",
  Water: "Fire",
  Chaos: "Light",
  Light: "Chaos",
};
export const cards = {};
function card(
  id,
  name,
  element,
  type,
  focus,
  limit,
  effects,
  text,
  extra = {},
) {
  cards[id] = {
    id,
    name,
    element,
    type,
    focus,
    limit,
    channel: 1,
    recall: type === "Ally" ? null : 1,
    effects,
    text,
    rarity: "common",
    ...extra,
  };
  if (effects.heal || effects.allyHeal) {
    Object.assign(cards[id], {
      rarity: "rare",
      offerWeight: 1,
      limit: 1,
      recall: null,
      singleUse: true,
      destroyAfterActivation: true,
      text:
        text +
        " Single use; Destroyed after activation. Cannot Recall or gain extra uses. Returns next battle.",
    });
  }
}
const hit = (n) => ({ damage: n });
card(
  "blast",
  "Blast",
  "Arcane",
  "Spell",
  1,
  2,
  { damage: 4, matchingDamage: 1 },
  "Attune. Deal 4 damage, +1 per adjacent Blast.",
  { attune: true },
);
card(
  "shield",
  "Shield",
  "Arcane",
  "Object",
  1,
  2,
  { shield: 4, matchingShield: 1 },
  "Attune. Add 4 block, +1 per adjacent Shield, until the enemy turn ends.",
  { attune: true },
);
card(
  "familiar",
  "Familiar",
  "Arcane",
  "Ally",
  1,
  0,
  {},
  "6 HP. May intercept attacks.",
  { hp: 6 },
);
card(
  "clear",
  "Clear Mind",
  "Arcane",
  "Object",
  0,
  1,
  { insight: 2 },
  "+2 Insight next turn.",
);
card(
  "focus",
  "Focus Energy",
  "Arcane",
  "Object",
  1,
  1,
  { focusPermanent: 1 },
  "+1 Focus for this battle. Cannot Recall.",
  { recall: null },
);
card(
  "sapling",
  "Sapling",
  "Earth",
  "Ally",
  1,
  2,
  { hpDamage: true },
  "Deal damage equal to HP. Each player turn: +1 HP per neighbor.",
  { hp: 4, growth: true },
);
card(
  "ignis",
  "Ignis Spark",
  "Fire",
  "Spell",
  1,
  3,
  { damage: 5, row: 2 },
  "Deal 5 damage, +2 per other Fire card in this row.",
);
card("water", "Water Blast", "Water", "Spell", 1, 2, hit(7), "Deal 7 damage.");
card(
  "gust",
  "Gust",
  "Wind",
  "Spell",
  1,
  2,
  { damage: 6, killChannel: 1 },
  "Deal 6 damage. On kill, +1 Channel this turn.",
);
card(
  "discord",
  "Discordia Pulse",
  "Chaos",
  "Spell",
  1,
  1,
  { randomDamage: 12 },
  "Deal 1d12 damage to a random enemy.",
);
card(
  "heat",
  "Heat",
  "Fire",
  "Spell",
  1,
  2,
  { burn: 2 },
  "Burn 2. Stack on a Water/Earth Spell: also activate it and add Burn 6.",
  { stack: "fusion" },
);
card(
  "kiln",
  "Kiln",
  "Fire",
  "Spell",
  2,
  4,
  { damage: 20, burnAll: 2 },
  "Charge 3: deal 20 to one enemy and apply Burn 2 to all enemies. Charging needs no target; choose an enemy only when firing. On place: +1 Charge per Fire neighbor.",
  { charge: 3, onPlaceCharge: true },
);
card(
  "cinder",
  "Cinder Snap",
  "Fire",
  "Spell",
  0,
  2,
  hit(8),
  "Deal 8 damage. Recall costs 3.",
  { recall: 3 },
);
card(
  "plasma",
  "Plasma Ball",
  "Chaos",
  "Spell",
  1,
  2,
  { damage: 8 },
  "Pile: fire every live ball, each successive ball deals +2 damage to a random enemy.",
  { stack: "pile" },
);
card(
  "palimpsest",
  "Palimpsest",
  "Arcane",
  "Spell",
  1,
  2,
  hit(4),
  "Stack on anything. Covered cards inert. Recall entire slot for 1.",
  { stack: "supersede", recallWhole: 1 },
);
card(
  "undertow",
  "Undertow",
  "Water",
  "Spell",
  1,
  1,
  hit(4),
  "Stack on anything. On place: Recall eligible covered cards for free.",
  { stack: "recall" },
);
card(
  "aqua",
  "Aqua Veil",
  "Water",
  "Ally",
  1,
  1,
  { allyHeal: 4 },
  "7 HP. Heal an adjacent Ally 4 HP.",
  { hp: 7 },
);
card(
  "terra",
  "Terra Guard",
  "Earth",
  "Ally",
  1,
  2,
  hit(3),
  "8 HP. If placed Bonded to Earth, 12 HP. Deal 3.",
  { hp: 8, bondHP: 4 },
);
card(
  "golem",
  "Stone Golem",
  "Earth",
  "Ally",
  2,
  1,
  { taunt: true, selfGrowth: 6, tauntRound: true },
  "10 HP. Activate: grow +6 current and maximum HP; gain Taunt until the end of this enemy phase. Growth remains while placed.",
  { hp: 10 },
);
card(
  "guardian",
  "Energy Guardian",
  "Arcane",
  "Ally",
  2,
  0,
  {},
  "10 HP. Swallows all excess from the hit that destroys it.",
  { hp: 10, swallow: true },
);
card(
  "ward",
  "Ward",
  "Arcane",
  "Ward",
  1,
  2,
  { ward: 10 },
  "Isolated. Starts with 0 ward value. Activate: +10. Absorbs incoming damage when chosen.",
  { ward: 0, condition: "isolated", tower: true },
);
card(
  "magnify",
  "Magnifying Glass Tower",
  "Arcane",
  "Object",
  2,
  3,
  { magnify: true },
  "Stack on a Tower. At level 2+: activate on two consecutive turns; damage at this level in other slots doubles.",
  { tower: true, stack: "tower" },
);
card(
  "resonance",
  "Resonance",
  "Arcane",
  "Object",
  1,
  1,
  { channel: 1 },
  "Isolated. Gain 1 Channel this turn. Costs 0 Channel. Single use; cannot gain extra uses or Recall. Destroyed at the end of the player turn, even unused.",
  {
    condition: "isolated",
    channel: 0,
    recall: null,
    singleUse: true,
    expiresAtTurnEnd: true,
  },
);
card(
  "keystone",
  "Keystone",
  "Arcane",
  "Object",
  3,
  0,
  {},
  "Cornerstone. While exposed in a corner, cards in this row and column have +1 activation allowance.",
  { condition: "corner", keystone: true },
);
card(
  "rite",
  "Opening Rite",
  "Arcane",
  "Object",
  1,
  0,
  {},
  "Begins battle placed. Gain +1 Focus on your first turn. Cannot be recalled.",
  { opening: true, recall: null, unrecallable: true },
);
card(
  "transmute",
  "Transmute",
  "Arcane",
  "Spell",
  1,
  2,
  { transmute: true },
  "Change one placed card to any element.",
);
card(
  "quicksilver",
  "Quicksilver",
  "Arcane",
  "Spell",
  1,
  3,
  { shift: true },
  "Shift a slot. If now beside its own element, +1 Focus next turn.",
);
card(
  "surge",
  "Arcane Surge",
  "Arcane",
  "Spell",
  1,
  2,
  hit(14),
  "Charge 2: deal 14 damage.",
  { charge: 2 },
);
card(
  "prism",
  "Prismatic Core",
  "Arcane",
  "Spell",
  2,
  2,
  { damage: 4, prism: true },
  "Deal 4. If all four elements neighbor it: deal 4 of each element instead.",
  { rarity: "rare" },
);
card(
  "soothe",
  "Soothe",
  "Water",
  "Spell",
  1,
  2,
  { heal: 4, cleanse: true },
  "Heal 4 HP. Clear Burn, Poison and Corrode.",
);
card(
  "thorn",
  "Thorn Choir",
  "Earth",
  "Spell",
  1,
  3,
  { damage: 4, adj: 2 },
  "Deal 4 damage, +2 per neighbor.",
);
card(
  "bloom",
  "Bloomcall",
  "Light",
  "Spell",
  1,
  2,
  { heal: 3, adjHeal: 2 },
  "Heal 3 HP, +2 per neighbor.",
);
card(
  "root",
  "Root Lance",
  "Earth",
  "Spell",
  1,
  2,
  { damage: 8 },
  "Bonded (Earth). Deal 8.",
  { condition: "Earth" },
);
card(
  "ember",
  "Ember Nest",
  "Fire",
  "Ally",
  1,
  2,
  { burn: 3 },
  "5 HP. Apply Burn 3.",
  { hp: 5 },
);
card(
  "moth",
  "Glass Moth",
  "Wind",
  "Ally",
  0,
  1,
  { damage: 4 },
  "3 HP. Deal 4 damage. Can be Recalled.",
  { hp: 3, recall: 2 },
);
card(
  "rain",
  "Rain Lantern",
  "Water",
  "Object",
  0,
  2,
  { focus: 2 },
  "+2 Focus next turn.",
);
card(
  "seed",
  "Patient Seed",
  "Earth",
  "Spell",
  1,
  4,
  { damage: 20 },
  "Charge 3: deal 20 damage.",
  { charge: 3 },
);
card(
  "storm",
  "Storm Canopy",
  "Wind",
  "Spell",
  2,
  2,
  { damage: 7, all: true },
  "Deal 7 to all enemies.",
  { rarity: "rare" },
);
card(
  "rot",
  "Slow Rot",
  "Water",
  "Spell",
  1,
  2,
  { corrode: 1 },
  "Apply Corrode 1.",
);
card(
  "spore",
  "Bitter Spore",
  "Earth",
  "Spell",
  1,
  2,
  { poison: 3 },
  "Apply Poison 3.",
);
card(
  "solitude",
  "Solitude",
  "Light",
  "Spell",
  1,
  2,
  { damage: 11 },
  "Isolated. Deal 11 damage.",
  { condition: "isolated" },
);
card(
  "corner",
  "Corner Flame",
  "Fire",
  "Spell",
  1,
  3,
  { damage: 9 },
  "Cornerstone. Deal 9 damage.",
  { condition: "corner" },
);
card(
  "lattice",
  "Living Lattice",
  "Earth",
  "Ward",
  1,
  2,
  { ward: 8 },
  "Starts with 0 ward value. Activate: +8. Stack on a Tower; covered Wards still absorb.",
  { ward: 0, tower: true, stack: "tower", coveredWards: true },
);
card(
  "conduit",
  "Wild Conduit",
  "Wind",
  "Object",
  1,
  2,
  { channel: 2 },
  "Gain 2 Channel this turn (net +1 after this activation).",
  { rarity: "rare" },
);
card(
  "tide",
  "Tide Memory",
  "Water",
  "Object",
  0,
  2,
  { insight: 3 },
  "+3 Insight next turn.",
);
card(
  "sun",
  "Sunfruit",
  "Light",
  "Ally",
  2,
  3,
  { heal: 5 },
  "12 HP. Heal 5 HP.",
  { hp: 12, rarity: "rare" },
);
card(
  "grove",
  "Grove Titan",
  "Earth",
  "Ally",
  3,
  3,
  { hpDamage: true },
  "20 HP. Deal current HP as damage. +1 HP per neighbor each turn.",
  { hp: 20, growth: true, rarity: "legendary" },
);
card(
  "eclipse",
  "Eclipse Seed",
  "Chaos",
  "Spell",
  2,
  3,
  { damage: 30, all: true },
  "Charge 3: deal 30 to all enemies.",
  { charge: 3, rarity: "legendary" },
);
card(
  "square",
  "Fourfold Grove",
  "Earth",
  "Spell",
  1,
  2,
  { damage: 6, square: true },
  "Deal 6 damage. Double in an intact 2 by 2 block.",
  { rarity: "rare" },
);
card(
  "clean",
  "Unbinding Dew",
  "Water",
  "Spell",
  1,
  2,
  { unbind: true, heal: 2 },
  "Clear Lock, Freeze and Sever from all grid cards. Heal 2.",
);
card(
  "bone",
  "Bone Lock",
  "Arcane",
  "Hex",
  2,
  0,
  {},
  "While in discard: halve Focus, minimum 1. Isolated.",
  { condition: "isolated" },
);
card(
  "milky",
  "Milky Eyes",
  "Arcane",
  "Hex",
  99,
  0,
  {},
  "When revealed: next placement this turn costs +1 Focus.",
  { unplaceable: true },
);
card(
  "itch",
  "Burning Itch",
  "Fire",
  "Hex",
  2,
  -1,
  { relief: 5 },
  "Lose 1 HP each player turn. Activate to suppress for 5 turns.",
);
card(
  "rust",
  "Rust Memory",
  "Arcane",
  "Hex",
  2,
  1,
  { reliefRust: true },
  "Battle start: Corrode 1. Activate to clear Corrode.",
);
card(
  "fog",
  "Fog of Names",
  "Arcane",
  "Hex",
  2,
  0,
  {},
  "In discard: -1 Insight (minimum 1).",
);
for (const id of [
  "blast",
  "shield",
  "sapling",
  "ignis",
  "water",
  "gust",
  "heat",
  "cinder",
  "thorn",
  "bloom",
  "root",
  "seed",
  "storm",
  "rot",
  "spore",
  "solitude",
]) {
  cards[id].upgrade = {
    gold: 35 + cards[id].focus * 15,
    bonus: 3,
    text: "The graftkeeper renews its living ink: +3 damage, block, healing, or initial Ally HP.",
  };
}
cards.sapling.upgrade = {
  hp: 8,
  bonus: 3,
  text: "Offer 8 HP to feed the roots: +3 initial HP.",
};
cards.heat.upgrade = {
  gold: 60,
  element: "Fire",
  bonus: 3,
  text: "Wear a Fire-imbued Setting and pay 60 Gold: +3 Burn.",
};
cards.storm.upgrade = {
  sacrifice: true,
  bonus: 3,
  text: "Destroy another rare card as a wind offering: +3 damage.",
};
export const starter = [
  "blast",
  "blast",
  "blast",
  "blast",
  "shield",
  "shield",
  "shield",
  "shield",
  "familiar",
  "clear",
  "focus",
  "sapling",
];
export const items = {};
function item(id, name, slot, effect, worth, text, extra = {}) {
  items[id] = { id, name, slot, effect, worth, text, ...extra };
}
item(
  "bronze",
  "Bronze Bracelet",
  "wrist",
  { block: 2 },
  40,
  "Refill 2 block each enemy turn.",
  { socket: true },
);
item(
  "silver",
  "Silver Bracelet",
  "wrist",
  { block: 5 },
  90,
  "Refill 5 block each enemy turn.",
  { socket: true },
);
item(
  "gold",
  "Gold Bracelet",
  "wrist",
  { block: 10 },
  190,
  "Refill 10 block each enemy turn.",
  { socket: true, forbid: ["channelGem"] },
);
item(
  "ring",
  "Rootbound Ring",
  "finger",
  { damage: 2, firstAttackOnly: true },
  40,
  "Once per player turn, after your first damaging attack activation: a separate 2-damage hit on its first target, imbued with the socketed element. A negated attack spends the trigger. Charge-building and status-only activations do not.",
  { socket: true },
);
item(
  "focusRing",
  "Ring of Patience",
  "finger",
  { focus: 1 },
  100,
  "+1 starting Focus.",
  { socket: true },
);
item(
  "channelRing",
  "Ring of Embers",
  "finger",
  { channel: 1 },
  120,
  "+1 starting Channel.",
  { socket: true },
);
item(
  "necklace",
  "Lantern Necklace",
  "neck",
  { insight: 1 },
  65,
  "+1 starting Insight.",
  { socket: true },
);
item(
  "dewNeck",
  "Necklace of Dew",
  "neck",
  { heal: 1 },
  90,
  "Heal 1 at player-turn start. Sapphire: heal 2.",
  { socket: true, synergy: "sapphire" },
);
for (const [id, name, element] of [
  ["ruby", "Ruby", "Fire"],
  ["emerald", "Emerald", "Earth"],
  ["topaz", "Topaz", "Wind"],
  ["sapphire", "Sapphire", "Water"],
])
  item(id, name, "gem", {}, 45, `Imbues a Setting with ${element}.`, {
    element,
  });
for (const [id, name, effect] of [
  ["focusGem", "Amber Thought", { focus: 1 }],
  ["channelGem", "Storm Opal", { channel: 1 }],
  ["insightGem", "Clear Quartz", { insight: 2 }],
  ["strideGem", "Wayfarer Pearl", { movement: 1 }],
  ["recallGem", "Memory Agate", { recall: 1 }],
])
  item(
    id,
    name,
    "gem",
    effect,
    100,
    "While socketed: " +
      Object.entries(effect)
        .map(([k, v]) => `+${v} ${k}`)
        .join(",") +
      ".",
  );
for (const element of ["Fire", "Water", "Earth", "Wind"])
  item(
    element.toLowerCase() + "Armor",
    element + " Armor",
    "torso",
    { resist: element },
    65,
    "Halve " + element + " damage from enemy attacks to the player.",
  );
item(
  "holyArmor",
  "Holy Armor",
  "torso",
  { heal: 2 },
  110,
  "Heal 2 at each player-turn start.",
);
item(
  "stoneArmor",
  "Stone Armor",
  "torso",
  { armor: 1 },
  60,
  "Reduce damage from each enemy attack by 1.",
);
item(
  "quickArmor",
  "Quicksilver Armor",
  "torso",
  { movement: 1 },
  80,
  "+1 Field movement.",
);
item(
  "mirrorArmor",
  "Mirror Armor",
  "torso",
  { reflect: true },
  110,
  "Reflect the first attack reaching the player each battle.",
);
item(
  "crown",
  "Sturdy Metal Helmet",
  "head",
  { shield: 2 },
  75,
  "Cards with Shield in their name add +2 block.",
);
item(
  "thornCrown",
  "Crown of Thorns",
  "head",
  { damage: 1 },
  90,
  "After each damaging card effect: a separate 1 Arcane damage.",
);
item(
  "sightCrown",
  "Mothlight Crown",
  "head",
  { insight: 1 },
  70,
  "+1 starting Insight.",
);
item(
  "curseRing",
  "Ring of the Ash Oath",
  "finger",
  { burn: 1 },
  70,
  "Cursed: forced equip. Each battle starts with Burn 1.",
  { socket: true, cursed: true },
);
item(
  "curseArmor",
  "Husk Armor",
  "torso",
  { armor: 2, corrode: 1 },
  90,
  "Cursed: forced equip. Reduce damage from each enemy attack by 2; start each battle Corroded 1.",
  { cursed: true },
);
item(
  "curseGem",
  "Weeping Garnet",
  "gem",
  { poison: 1 },
  60,
  "Cursed: if not socketed, each battle starts with Poison 1.",
  { cursed: true },
);
item(
  "curseNeck",
  "Lead Psalm",
  "neck",
  { movement: -1 },
  60,
  "Cursed: forced equip. -1 Field movement (minimum 1).",
  { socket: true, cursed: true },
);
const attack = (name, damage, element = "Arcane", extra = {}) => ({
  name,
  damage,
  element,
  ...extra,
});
const effect = (name, extra) => ({ name, element: "Arcane", ...extra });
export const EARLY_MOTES = ["bat", "beetle", "moth", "wisp"];
export const enemies = {};
function enemy(
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
) {
  enemies[id] = {
    id,
    name,
    tier,
    element,
    hp,
    movement,
    rotation,
    signature:
      signature +
      (tier === "Archon"
        ? " At the end of each full move cycle, if afflicted by Burn, Poison or Corrode, spends its next move on Purify to clear all three, then resumes its cycle."
        : ""),
    counter,
    nemesis: "Slow decks",
    grouped: ["bat", "beetle", "ashling"].includes(id),
    ...extra,
  };
}
enemy(
  "bat",
  "Bat",
  "Mote",
  "Wind",
  15,
  "Wanderer",
  [
    attack("Flit", 4, "Wind"),
    effect("Screech", { insight: -2 }),
    attack("Wingbeat", 4, "Wind"),
  ],
  "Screech deals no damage; reveal two fewer cards next turn only.",
  "Use the quiet turn to prepare your board.",
);
enemy(
  "sludge",
  "Sludge",
  "Mote",
  "Water",
  18,
  "Sentinel",
  [
    attack("Slap", 6, "Water"),
    attack("Slap", 6, "Water"),
    effect("Corrosive drip", { corrode: 1, allyStatus: true }),
  ],
  "Corrodes the oldest Ally or player.",
  "Burst damage avoids growing corrosion.",
  { herald: true },
);
enemy(
  "wolf",
  "Wolf",
  "Mote",
  "Earth",
  17,
  "Stalker",
  [
    attack("Claw", 5, "Earth"),
    effect("Howl", { howl: 2 }),
    attack("Bite", 10, "Earth"),
  ],
  "Calls every Wolf when it reaches you.",
  "Meet it before the pack gathers.",
  { speed: 2, pack: "Wolf" },
);
enemy(
  "firewolf",
  "Fire Wolf",
  "Mote",
  "Fire",
  17,
  "Stalker",
  [attack("Claw", 5, "Fire"), attack("Fire Bite", 10, "Fire", { burn: 2 })],
  "Burn persists past interception.",
  "Water offense and Fire defense.",
  { speed: 2, pack: "Wolf" },
);
enemy(
  "wisp",
  "Spark-Wisp",
  "Mote",
  "Fire",
  11,
  "Skittish",
  [attack("Spark", 3, "Fire"), effect("Flicker", { flicker: true })],
  "Wastes the next attack activation.",
  "Use an inexpensive attack to break Flicker.",
);
enemy(
  "beetle",
  "Bell Beetle",
  "Mote",
  "Earth",
  21,
  "Wanderer",
  [
    attack("Chime", 4, "Earth"),
    effect("Dulling Chime", { focus: -1 }),
    attack("Crack", 6, "Earth"),
  ],
  "Dulling Chime deals no damage; lose 1 Focus next turn only.",
  "Fire breaks its shell quickly.",
  { herald: true },
);
enemy(
  "leech",
  "Ink Leech",
  "Mote",
  "Water",
  20,
  "Stalker",
  [
    attack("Sip", 3, "Water", { poison: 1 }),
    effect("Siphon", { grid: "siphon", target: "newest" }),
    attack("Feed", 5, "Water"),
  ],
  "Siphons the newest card.",
  "Place a spent utility card last.",
  { speed: 1 },
);
enemy(
  "moth",
  "Veil Moth",
  "Mote",
  "Light",
  14,
  "Skittish",
  [effect("Dazzle", { channel: -1 }), attack("Dust", 4, "Light")],
  "Dazzle deals no damage; lose 1 Channel next turn only.",
  "Build your board during its non-attacking turn.",
);
enemy(
  "imp",
  "Needle Imp",
  "Mote",
  "Chaos",
  18,
  "Hunter",
  [
    attack("Needle", 3, "Chaos", { pierce: true }),
    attack("Three pricks", 2, "Chaos", { hits: 3 }),
  ],
  "Piercing attacks skip grid defenses.",
  "Use equipment and fast offense.",
);
enemy(
  "lichen",
  "Lichen Eye",
  "Mote",
  "Earth",
  23,
  "Sentinel",
  [
    effect("Gaze", { grid: "sever", target: "connected" }),
    attack("Vine", 5, "Earth"),
  ],
  "Cuts adjacency from your busiest slot.",
  "Build a second cluster.",
  { nemesis: "Druid" },
);
enemy(
  "eel",
  "Glass Eel",
  "Mote",
  "Water",
  15,
  "Wanderer",
  [attack("Current", 3, "Water", { hits: 2 }), effect("Coil", { guard: 3 })],
  "Small repeated hits consume shields.",
  "Armor is efficient against little hits.",
);
enemy(
  "ashling",
  "Ashling",
  "Mote",
  "Fire",
  18,
  "Stalker",
  [effect("Ash breath", { burn: 2 }), attack("Coal", 5, "Fire")],
  "Opens with Burn.",
  "Keep Bracelet block for the status.",
  { speed: 1 },
);
enemy(
  "dervish",
  "Dervish Hunter",
  "Eidolon",
  "Wind",
  53,
  "Hunter",
  [
    attack("Slice", 8, "Wind"),
    attack("Slice", 8, "Wind"),
    attack("Whirl", 5, "Wind", { hits: 3 }),
  ],
  "An unavoidable hunter with multi-hit Whirl.",
  "Build block for the third turn.",
  { herald: true },
);
enemy(
  "shard",
  "Shard-Walker",
  "Eidolon",
  "Earth",
  44,
  "Stalker",
  [
    attack("Shard", 9, "Earth"),
    effect("Reflective Shield", { flicker: true }),
    attack("Lance", 12, "Earth", { pierce: true }),
  ],
  "Negates the first attack activation after its shield.",
  "Break the shield with a small spell.",
  { speed: 3, nemesis: "Sorcerer" },
);
enemy(
  "undead",
  "Undead Fire Wolf",
  "Eidolon",
  "Fire",
  50,
  "Stalker",
  [
    attack("Bite", 7, "Fire"),
    effect("Bone Lock", { grid: "lock", target: "newest", count: 2 }),
    attack("Cull", 9, "Fire", { cull: true, weakest: true }),
    effect("Sever", { grid: "sever", target: "connected" }),
  ],
  "Resists Fire, Locks and Severs.",
  "Use Water and keep a spare cluster.",
  { speed: 3, pack: "Wolf", resist: "Fire", nemesis: "Alchemist / Druid" },
);
enemy(
  "sentinel",
  "Dark Sentinel",
  "Eidolon",
  "Chaos",
  56,
  "Sentinel",
  [
    attack("Bell toll", 7, "Chaos"),
    effect("Seal", { grid: "lock", target: "oldest" }),
    attack("Judgment", 10, "Light"),
  ],
  "Pins your oldest slot.",
  "Avoid filling the grid with utility.",
  { herald: true },
);
enemy(
  "weaver",
  "Pale Weaver",
  "Eidolon",
  "Light",
  45,
  "Stalker",
  [
    effect("Unweave", { grid: "sever", target: "connected" }),
    attack("Silk", 6, "Light", { hits: 2 }),
    effect("Winter thread", { grid: "freeze", target: "tallest" }),
  ],
  "Punishes both clusters and tall stacks.",
  "Maintain independent threats.",
  { speed: 2, nemesis: "Druid" },
);
enemy(
  "elemental",
  "Elemental Wisp",
  "Eidolon",
  "Arcane",
  42,
  "Skittish",
  [
    attack("Prismatic lash", 8, "Fire"),
    effect("Flicker", { flicker: true }),
    attack("Cold lash", 9, "Water"),
  ],
  "Half Arcane damage; double elemental damage.",
  "Attune Blast next to any elemental card.",
  { wisp: true },
);
enemy(
  "mason",
  "Hollow Mason",
  "Eidolon",
  "Earth",
  60,
  "Wanderer",
  [
    attack("Hammer", 7, "Earth"),
    effect("Demolition", { grid: "destroy", target: "tallest" }),
    attack("Fall", 10, "Earth"),
  ],
  "Destroys the tallest complete slot.",
  "Sacrifice a cheap stack as a decoy.",
);
enemy(
  "colossus",
  "Void-Colossus",
  "Archon",
  "Chaos",
  173,
  "Archon",
  [
    attack("Void fist", 10, "Chaos", { currentElement: true }),
    attack("Void fist", 10, "Chaos", { currentElement: true }),
    effect("Collapse", { grid: "column", target: "column" }),
    effect("Chaotic Glare", { randomElement: true }),
  ],
  "Chaotic Glare randomly changes its element, including Arcane; Void Fist and defensive matchups follow its current element. Hits matching its current element summon a Mini-Void of that element (once per activation). Each Mini-Void keeps its birth element. At half HP or lower: +3 attack.",
  "Start with Light attacks, then adapt to its new element. Disperse cards across columns.",
  {
    schedule: "Wait 3 rounds, then pursue 3, 4, then Hunt.",
    bossMode: "sentinel",
  },
);
enemy(
  "hart",
  "The Cinder Hart",
  "Archon",
  "Fire",
  153,
  "Archon",
  [
    attack("Antler", 9, "Fire"),
    effect("Brand", { grid: "lock", target: "newest", burn: 2 }),
    effect("Wildfire", { grid: "row", target: "row" }),
    attack("Stampede", 6, "Earth", { hits: 2 }),
  ],
  "Below half HP adds Burn 1 each enemy turn.",
  "Water spells and a Fire Bracelet buy time.",
  { schedule: "Wait 4 rounds, then Hunt.", bossMode: "hunter" },
);
enemy(
  "choir",
  "The Glass Choir",
  "Archon",
  "Wind",
  159,
  "Archon",
  [
    effect("Shatter Hymn", { grid: "destroy", target: "valuable", count: 2 }),
    attack("Refrain", 7, "Wind", { hits: 2 }),
    effect("Silence", { grid: "sever", target: "connected" }),
    attack("Chorus", 10, "Water"),
  ],
  "Shatter Hymn destroys the two most valuable complete stacks: combined damage/defense potential, then printed Focus, remaining activations and reading order. At half HP or lower gains 8 Guard each Shatter Hymn. On death: Final Note deals 20 Light damage with Cull before victory, bypassing Wards and Shields. Allies, Bracelets and Armor can defend; prepare before the killing blow; this death attack does not scale.",
  "Recall threatened stacks and use Earth attacks. Prepare for Wind and Water attacks, then use Allies and equipment to survive Final Note on death.",
  {
    schedule: "Pursue 0, 1, 2, 3, 4; Hunt on round 6.",
    bossMode: "pursuit",
    onDeath: attack("Final Note", 20, "Light", { cull: true }),
  },
);
enemy(
  "mini",
  "Mini-Void",
  "Mote",
  "Chaos",
  11,
  "Sentinel",
  [
    attack("Gnaw", 2, "Chaos", { currentElement: true }),
    attack("Gnaw", 3, "Chaos", { currentElement: true }),
  ],
  "Summoned when a hit matches Void-Colossus's current element. Keeps that element for all attacks and defensive matchups, even after the Colossus changes.",
  "Counter this Mini-Void's own element; later Chaotic Glares do not change it.",
  { summonOnly: true },
);
// Authored tutorial encounters never enter normal spawning pools.
enemy(
  "tutorialMosswing",
  "Mosswing",
  "Mote",
  "Arcane",
  13,
  "Sentinel",
  [
    attack("Soft Wing", 3, "Arcane"),
    attack("Wingbeat", 5, "Arcane"),
    effect("Rest", {}),
  ],
  "A patient first opponent: 3 damage, then 5, then a pause.",
  "Prepare Shield, then combine Shield with Bracelet.",
  { tutorialOnly: true },
);
enemy(
  "tutorialRootling",
  "Rootling",
  "Mote",
  "Arcane",
  18,
  "Stalker",
  [
    attack("Root Tap", 3, "Arcane"),
    effect("Gathering Strength", {}),
    attack("Heavy Bough", 30, "Arcane"),
    effect("Recover", {}),
  ],
  "Gathers strength before a 30-damage blow, then rests.",
  "Build a right-to-left route through Ally, Shield, Ward and Bracelet.",
  { tutorialOnly: true, speed: 2 },
);
enemy(
  "tutorialEmber",
  "Ember Mote",
  "Mote",
  "Fire",
  21,
  "Sentinel",
  [attack("Ember Puff", 3, "Fire"), effect("Breathe", {})],
  "A Fire enemy; Poison cannot affect it.",
  "Water attacks exploit its weakness.",
  { tutorialOnly: true },
);
enemy(
  "tutorialWarden",
  "The Patient Warden",
  "Eidolon",
  "Earth",
  32,
  "Sentinel",
  [
    effect("Patient Vigil", {}),
    attack("Measured Tap", 5, "Arcane"),
    effect("Lowered Staff", {}),
  ],
  "Pauses, makes one modest attack, then rests. Attacks slowly strengthen each cycle.",
  "Use its pauses to place cards; Shield and Bracelet answer its attack.",
  { tutorialOnly: true },
);

export const events = [
  {
    id: "spring",
    name: "The Warm Spring",
    text: "Gold light gathers where the pale roots part. The water smells of rain.",
    choices: [
      { label: "Drink · recover 12 HP", heal: 12 },
      { label: "Bottle the rain · gain Rain Lantern", card: "rain" },
    ],
  },
  {
    id: "swamp",
    name: "The Bitter Crossing",
    text: "The path has become a shallow black mire. Somewhere beyond it, a bell rings.",
    choices: [
      { label: "Cross · lose 5 HP, gain 35 Gold", hp: -5, gold: 35 },
      {
        label: "Burn a path · gain Burning Itch and 70 Gold",
        card: "itch",
        gold: 70,
      },
    ],
  },
  {
    id: "trader",
    name: "The Lantern Trader",
    text: "A woman with silver-thread gloves offers a living seed for your metal.",
    choices: [
      {
        label: "Trade a Bracelet for Grove Titan",
        trade: { kind: "item", slot: "wrist", label: "Bracelet" },
        card: "grove",
      },
      { label: "Keep your belongings" },
    ],
  },
  {
    id: "helmet",
    name: "The Empty Watch",
    text: "A helmet rests on a stone post. Its visor watches a road that no longer exists.",
    choices: [
      { label: "Take the helmet", item: "crown" },
      { label: "Leave it" },
    ],
  },
  {
    id: "oath",
    name: "The Ash Oath",
    text: "A ring lies inside a warm handprint. Beyond the trees, a small shrine answers its glimmer.",
    choices: [
      {
        label:
          "Take the oath · cursed ring and 100 Gold; next Event offers release",
        item: "curseRing",
        gold: 100,
        quest: true,
      },
      { label: "Pass quietly" },
    ],
  },
  {
    id: "shrine",
    name: "The Unwritten Shrine",
    text: "A shallow bowl holds a reflection of your hands without their burdens.",
    choices: [
      { label: "Offer 10 HP · remove Curses and Hexes", hp: -10, clean: true },
      { label: "Keep your strength · heal 4 HP", heal: 4 },
    ],
  },
  {
    id: "ambush",
    name: "A Bell Without Wind",
    text: "You touch the bell. The answering chime comes from teeth in the mist.",
    choices: [{ label: "Face the Bell Beetle", fight: "beetle" }],
  },
  {
    id: "graft",
    name: "The Graftkeeper",
    text: "An old keeper tends spells like fruit. Their ink-stained palms are gentle.",
    choices: [
      {
        label: "Pay 25 Gold · receive Wild Conduit",
        cost: 25,
        card: "conduit",
      },
      { label: "Accept a cutting · receive Thorn Choir", card: "thorn" },
    ],
  },
  {
    id: "dew",
    name: "Dew on the Threshold",
    text: "Tiny lights settle over your shoulders. For a moment the forest is still.",
    choices: [
      { label: "Rest · recover 10 HP", heal: 10 },
      { label: "Follow the lights · gain a Sapphire", item: "sapphire" },
    ],
  },
  {
    id: "mirror",
    name: "The Tarnished Mirror",
    text: "Your reflection carries a staff of lightning. It offers to exchange a thought.",
    choices: [
      {
        label: "Accept · gain Arcane Surge and Milky Eyes",
        card: "surge",
        hex: "milky",
      },
      { label: "Turn away" },
    ],
  },
  {
    id: "merchant",
    name: "The Lost Satchel",
    text: "A clasp shaped like a sleeping moth opens without resistance.",
    choices: [
      { label: "Take 40 Gold", gold: 40 },
      { label: "Take an Amber Thought", item: "focusGem" },
    ],
  },
  {
    id: "healer",
    name: "A Kindness in the Rain",
    text: "A traveler offers to wash the bitter ink from your book.",
    choices: [
      { label: "Remove all Hexes", cleanHex: true },
      { label: "Share supper · recover 8 HP", heal: 8 },
    ],
  },
];
export const locations = [
  {
    id: "field",
    name: "The Whispering Weald",
    prompt:
      "an aerial view of a mysterious forest clearing, pale twisted roots, jade pools, ancient paths, ember lights, no grid, no letters",
  },
  {
    id: "mind",
    name: "The Mind Grid",
    prompt:
      "an ancient obsidian ritual table with pale root engravings, dark jade surface, candlelit brass, no grid, no letters",
  },
  {
    id: "tavern",
    name: "The Lantern Rest",
    prompt:
      "a warm hidden fantasy tavern inside a hollow ancient tree, brass lanterns, amber hearth, welcoming chairs, no people, no text",
  },
  {
    id: "druid",
    name: "Druid",
    prompt:
      "a mysterious druid traveler in moss green robes, antler wood staff, pale seed glowing in their hand, full portrait in an ashen forest",
  },
];
export const glossary = {
  Transmute:
    "Change a placed card to the chosen element, overriding Attune until it leaves the grid or is transmuted again. Existing Shield portions keep their elements.",
  Attune:
    "On activation choose an adjacent element, or Arcane if none is available. Transmute fixes the placed card to its chosen element instead. Existing Shield portions retain their elements.",
  Focus: "Placement and Recall budget. Unspent Focus is lost.",
  Channel:
    "Activation budget. Each card activates once per turn unless it has Blink. Unspent Channel is lost.",
  Blink:
    "May activate repeatedly this turn, paying Channel each time and respecting total activation allowance.",
  Insight:
    "Reveal budget. Counts down as cards turn face up and is zero after Reveal. Refills for the next turn when you end your turn.",
  Recall:
    "During placement pay Focus to put the slot into discard. Activations reset on reuse. Allies usually cannot Recall.",
  Spent:
    "No activations remain. Still occupies a slot. A Ward can still absorb its remaining value.",
  Ward: "Starts at 0; activate to build persistent defense. Chosen by clicking its card. Attacks can only move to the same column or closer to the player. Covered Wards do not absorb unless the top card permits it.",
  Shield:
    "Block expires after the enemy turn. Choose which portion absorbs a hit.",
  Ally: "May intercept when in the attack’s column or closer to the player. Destroyed Allies return next battle.",
  Burn: "Water enemies are immune. Damage at turn start; value decreases by one. On the player, bypasses all attack defenses, including Bracelets and Armor.",
  Poison:
    "Fire enemies are immune. Constant damage at turn start. On the player, bypasses all attack defenses, including Bracelets and Armor.",
  Corrode:
    "Chaos enemies are immune. Damage at turn start; value increases by one. On the player, bypasses all attack defenses, including Bracelets and Armor.",
  Lock: "Locked cards cannot be Recalled or Shifted. They CAN still activate and can be covered by a legal stack. Lock does not disable abilities.",
  Freeze:
    "Frozen cards cannot activate. The effect lasts through the indicated turn; it does not prevent another card from covering them.",
  Sever: "Ignores and contributes no adjacency or patterns.",
  Stack:
    "Place onto a compatible occupied slot. Top card determines covered functionality.",
  Purify:
    "After a full move cycle, an afflicted boss spends its next move clearing all its Burn, Poison and Corrode. Status damage still ticks before this move; then the normal cycle resumes. Purify does not heal HP or advance cycle scaling.",
  Charge:
    "Builds through paid activations, once per turn unless Blink permits more. Charging needs no enemy target; choose a target only when the effect fires at its threshold. Recall resets Charge.",
  Herald: "Defeat to reveal this Stratum’s Archon.",
  Restless: "+1 movement and attack per batch survived.",
  Pierce: "Skips Wards, Shields and Allies. Equipment still protects.",
  Cull: "Bypasses Wards and Shields. Allies can intercept; Bracelets and Armor still apply.",
  Taunt:
    "The most recently taunting reachable Ally must intercept before ordinary defense choices. Stone Golem's Taunt expires after the coming enemy phase.",
  Isolated: "No orthogonal neighbors; Sever also satisfies this.",
  Cornerstone: "Only functions in a grid corner.",
  Bonded: "Requires a neighbor of the printed element.",
  Tower: "All Wards and designated Objects. Supports Tower stacks.",
  Siphon:
    "Consumes one remaining activation allowance from the affected card. It does not activate that card or spend your Channel.",
  Newest:
    "The most recently placed exposed card. Ties use grid order, from top left.",
  Oldest:
    "The earliest placed exposed card. Ties use grid order, from top left.",
  "Most Connected":
    "The exposed card with the most orthogonal neighbors; Sever removes adjacency. Ties use grid order, from top left.",
  Tallest: "The stack with the most cards. Ties use grid order, from top left.",
  Weakest: "The eligible Ally with the lowest current HP.",
  Guard:
    "An enemy defense pool that absorbs damage before its HP. The displayed amount is what remains.",
  Shift:
    "Move a whole placed stack to an eligible empty Mind Grid slot. Locked stacks cannot Shift.",
  Flicker:
    "Negates the next offensive activation against this enemy, then ends. Other targets of that activation can still be affected.",
  Resist:
    "A printed resistance halves damage from its named element, rounded up. It is separate from the elemental cycle.",
  Block:
    "Temporary defense from Shields or Bracelets. Each portion keeps its element and remaining block; Shield block expires after the enemy turn, Bracelet block refills each enemy turn.",
  Armor:
    "Equipment that protects only the player, after grid defenses and Bracelets. Its printed effect determines the protection.",
  Hex: "A harmful card in your Grimoire. Its printed text explains when it applies. Tavern Hex treatment is separate from ordinary card removal.",
  Curse:
    "A harmful item effect. Cursed equipment may be forced into a slot and cannot be freely removed; its treatment has a printed cost.",
  Destroyed:
    "Cards in this pile are unavailable for the rest of the battle and return next battle. This is different from permanent card removal or sacrifice.",
  Discard:
    "Cards waiting to return to the Grimoire after its remaining cards have been drawn.",
  Grimoire:
    "Your deck. Cards are drawn randomly from its remaining cards; when empty, the discard pile is recycled.",
  Reveal:
    "The first player phase: draw cards using Insight. It advances automatically to Placement when Reveal finishes.",
  Placement:
    "Spend Focus to place cards or Recall eligible stacks. Finish this phase with the arrow to Activation; phases do not go backward.",
  Activation:
    "Spend a card's printed Channel cost to use it. Each card normally activates once per turn, within its total activation allowance.",
  "Activation allowance":
    "The total uses remaining for this placed card. This is separate from the once-per-turn limit. Recall normally resets uses; single-use cards cannot gain extra uses.",
  "Single use":
    "Only one activation for this card, with no extra uses. Its text says when it is Destroyed; Destroyed cards return next battle.",
  Adjacent:
    "The four orthogonal neighbors: above, below, left and right. Diagonals do not count; Sever disables adjacency.",
  "Mind Grid":
    "The 7-by-6 battlefield where you arrange and activate cards. Covered cards function only as their top card allows.",
  Pile: "A stacking rule that can activate eligible matching cards beneath the top card. Each card still respects its own activation limits.",
  Fusion:
    "A stacking rule that can also activate an eligible covered card. The top card's text states which cards and extra effects qualify.",
  Supersede:
    "A stacking rule that leaves covered cards inactive unless the top card says otherwise.",
  Consecutive:
    "Activated on consecutive player turns. The card's text states the benefit; Magnifying Glass Tower requires two such turns.",
  Spell:
    "A card with its printed activation effect and limits. It stays on the grid unless an effect, Recall or destruction removes it.",
  Object:
    "A card that remains on the grid and provides its printed activated or passive effect.",
  HP: "Health points. At zero an Ally is Destroyed, an enemy is defeated, or the player's run ends. Player HP persists between battles.",
  Gold: "Currency collected on the Field and through rewards. Spend it at Taverns on purchases, upgrades and services.",
  Gem: "An item whose effect works while socketed into a Setting. Elemental Gems imbue that Setting; other Gems grant their printed bonuses.",
  Socket:
    "A Setting's Gem slot. Gems can be inserted or removed only at a Tavern.",
  Setting:
    "A Necklace, Bracelet or Ring with its own printed effect and one Gem socket.",
  Bracelet:
    "Equipment block at the final position before the player. Choosing it passes all grid defenses for this hit. Refills each enemy turn and requires no activation. You may take a hit without using it, preserving the block for a later attack; passive Armor still applies.",
  Ring: "Equipment with a printed effect and a Gem socket. Rootbound Ring adds one separate hit on your first damaging activation each player turn.",
  Necklace: "Equipment with a printed effect and a Gem socket.",
  Crown: "Head equipment with a printed effect and no Gem socket.",
  Tavern:
    "A place for recovery, shopping, upgrades, card removal and Gem socketing. Ordinary paid card removal is once per visit; Hex treatment is separate.",
  Mote: "An ordinary enemy encounter. Some icons contain a group of enemies.",
  Eidolon:
    "An elite enemy with a stronger rotation and richer rewards than a Mote.",
  Archon:
    "The Stratum's gatekeeper. Defeat the Stratum 1 Archon to complete this build's journey.",
  Stratum:
    "One Field journey ending with an Archon battle. This build contains Stratum 1.",
  Tell: "An enemy's announced next action. Inspect it to plan for damage, element and other effects.",
  Hunter:
    "A Field movement pattern that moves directly onto the player when it pursues. Archon grace periods still apply.",
  Stalker:
    "A Field enemy that moves toward the player at its printed speed, stopping when it reaches them.",
  Wanderer:
    "A Field enemy that chooses a random direction for its movement, stopping when it reaches the player.",
  Sentinel:
    "A Field enemy that normally stays in place. Archons can begin moving when their grace period ends.",
  Skittish:
    "A Field enemy that moves away from the player. Catching one grants richer rewards.",
  "Pack Movement":
    "When a matching pack member arrives on the player, other pack members move toward the player too. Arriving enemies remain there until the battle begins.",
  Arcane:
    "No elemental matchup: Arcane damage receives no elemental-cycle bonus or penalty.",
  Fire: "Fire deals +50% damage to Earth and -50% to Water, rounded up. Fire defense has its own Shield/equipment rules. Fire enemies are immune to Poison.",
  Earth:
    "Earth deals +50% damage to Wind and -50% to Fire, rounded up. Earth defense has its own Shield/equipment rules.",
  Wind: "Wind deals +50% damage to Water and -50% to Earth, rounded up. Wind defense has its own Shield/equipment rules.",
  Water:
    "Water deals +50% damage to Fire and -50% to Wind, rounded up. Water defense has its own Shield/equipment rules. Water enemies are immune to Burn.",
  Chaos:
    "Chaos and Light each deal +50% damage to the other, rounded up; they sit outside the four-element cycle. Chaos enemies are immune to Corrode.",
  Light:
    "Light and Chaos each deal +50% damage to the other, rounded up; they sit outside the four-element cycle.",
};

// Defeat epigraphs appear only when this enemy delivers the lethal attack.
export const enemyDeathLines = {
  tutorialWarden: "Even a patient teacher can end a lesson.",
  choir: "They sang of destruction, then delivered it.",
  hart: "The forest bowed before its antlers. You did not bow quickly enough.",
  colossus: "You stared into the void. It took that personally.",
  dervish: "You found the rhythm. The last beat found you.",
  shard: "Every shard had a point. One made it through.",
  undead: "It had already cheated death. You were less fortunate.",
  sentinel: "The bell tolled once. The verdict needed no explanation.",
  weaver: "You were planning your next move. It was finishing your shroud.",
  elemental: "So many colors. Such a brief rainbow.",
  mason: "It called this a renovation. You were a load-bearing traveler.",
};
