export const VERSION = {
  rules: "1.2.0",
  content: "1.0.0",
  observation: 1,
  actions: 1,
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
}
const hit = (n) => ({ damage: n });
card(
  "blast",
  "Blast",
  "Arcane",
  "Spell",
  1,
  2,
  hit(5),
  "Attune. Deal 5 damage.",
  { attune: true },
);
card(
  "shield",
  "Shield",
  "Arcane",
  "Object",
  1,
  -1,
  { shield: 5 },
  "Attune. Add 5 block until the enemy turn ends.",
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
  1,
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
  { damage: 25 },
  "Charge 3: deal 25. On place: +1 Charge per Fire neighbor.",
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
  { damage: 10 },
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
  { taunt: true },
  "16 HP. Taunt: must intercept after Wards and Shields.",
  { hp: 16 },
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
  3,
  { ward: 10 },
  "Isolated. On place: 10 ward value. Activate: +10. Absorbs oldest first.",
  { ward: 10, condition: "isolated", tower: true },
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
  2,
  2,
  { channel: 1 },
  "Isolated. Gain 1 Channel this turn.",
  { condition: "isolated" },
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
  "Begins battle placed. On place: +1 Focus this turn.",
  { onPlaceFocus: 1, opening: true },
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
  1,
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
  "On place: 8 ward value. +8 ward value. Stack on a Tower; covered Wards still absorb.",
  { ward: 8, tower: true, stack: "tower", coveredWards: true },
);
card(
  "conduit",
  "Wild Conduit",
  "Wind",
  "Object",
  1,
  2,
  { channel: 3 },
  "Gain 3 Channel this turn.",
  { rarity: "rare" },
);
card(
  "tide",
  "Tide Memory",
  "Water",
  "Object",
  1,
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
  { block: 3 },
  40,
  "Refill 3 block each enemy turn.",
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
  { damage: 1 },
  40,
  "After a damaging activation: a separate 1-damage hit, imbued with the socketed element.",
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
    "Halve " + element + " damage to the player.",
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
  "Reduce every hit to the player by 1.",
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
  "Cursed: forced equip. Reduce hits by 2; start each battle Corroded 1.",
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
    signature,
    counter,
    nemesis: "Slow decks",
    ...extra,
  };
}
enemy(
  "bat",
  "Bat",
  "Mote",
  "Wind",
  8,
  "Wanderer",
  [
    attack("Flit", 4, "Wind"),
    attack("Wingbeat", 4, "Wind"),
    effect("Screech", { insight: -1 }),
  ],
  "Shrinks the next reveal.",
  "Finish it before Screech.",
);
enemy(
  "sludge",
  "Sludge",
  "Mote",
  "Water",
  10,
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
  9,
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
  9,
  "Stalker",
  [attack("Claw", 5, "Fire"), attack("Fire Bite", 10, "Fire", { burn: 4 })],
  "Burn persists past interception.",
  "Water offense and Fire defense.",
  { speed: 2, pack: "Wolf" },
);
enemy(
  "wisp",
  "Spark-Wisp",
  "Mote",
  "Fire",
  6,
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
  12,
  "Wanderer",
  [
    attack("Chime", 4, "Earth"),
    effect("Harden", { guard: 5 }),
    attack("Crack", 6, "Earth"),
  ],
  "Gains a small shell.",
  "Fire breaks its shell quickly.",
  { herald: true },
);
enemy(
  "leech",
  "Ink Leech",
  "Mote",
  "Water",
  11,
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
  7,
  "Skittish",
  [
    effect("Dazzle", { grid: "freeze", target: "newest" }),
    attack("Dust", 4, "Light"),
  ],
  "Freezes the newest card for a turn.",
  "Spread your usable activations.",
);
enemy(
  "imp",
  "Needle Imp",
  "Mote",
  "Chaos",
  10,
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
  13,
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
  8,
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
  10,
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
  30,
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
  25,
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
  28,
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
  32,
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
  26,
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
  24,
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
  34,
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
  100,
  "Archon",
  [
    attack("Void fist", 10, "Chaos"),
    attack("Void fist", 10, "Chaos"),
    effect("Collapse", { grid: "column", target: "column" }),
  ],
  "Chaos hits summon a Mini-Void (once per activation). Below half HP: +3 attack.",
  "Use Light, and disperse cards across columns.",
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
  88,
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
  92,
  "Archon",
  [
    effect("Shatter hymn", { grid: "destroy", target: "tallest" }),
    attack("Refrain", 7, "Wind", { hits: 2 }),
    effect("Silence", { grid: "sever", target: "connected" }),
    attack("Final note", 12, "Light"),
  ],
  "Below half HP gains a shield every cycle.",
  "Short stacks and Earth attacks are safest.",
  { schedule: "Pursue 0, 1, 2, 3, 4; Hunt on round 6.", bossMode: "pursuit" },
);
enemy(
  "mini",
  "Mini-Void",
  "Mote",
  "Chaos",
  6,
  "Sentinel",
  [attack("Gnaw", 2, "Chaos"), attack("Gnaw", 3, "Chaos")],
  "Summoned by Chaos striking Void-Colossus.",
  "Change your attack element.",
  { summonOnly: true },
);
export const events = [
  {
    id: "spring",
    name: "The Warm Spring",
    text: "Gold light gathers where the pale roots part. The water smells of rain.",
    choices: [
      { label: "Drink · recover 12 HP", heal: 12 },
      { label: "Bottle a memory · gain a card", card: "soothe" },
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
        tradeWrist: true,
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
    name: "The Ashen Weald",
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
  Attune:
    "On activation choose an adjacent element. Existing Shield portions retain their elements.",
  Focus: "Placement and Recall budget. Unspent Focus is lost.",
  Channel: "Activation budget. Unspent Channel is lost.",
  Insight: "Cards revealed at the start of your turn.",
  Recall:
    "During placement pay Focus to put the slot into discard. Activations reset on reuse. Allies usually cannot Recall.",
  Spent:
    "No activations remain. Still occupies a slot. A Ward can still absorb its remaining value.",
  Ward: "Persistent automatic defense, oldest first. Covered Wards do not absorb unless the top card permits it.",
  Shield:
    "Block expires after the enemy turn. Choose which portion absorbs a hit.",
  Ally: "May intercept after Wards and Shields. Destroyed Allies return next battle.",
  Burn: "Damage at turn start; value decreases by one.",
  Poison: "Constant damage at turn start.",
  Corrode: "Damage at turn start; value increases by one.",
  Lock: "Cannot Recall or Shift; can activate or be covered.",
  Freeze: "Cannot activate until the indicated turn.",
  Sever: "Ignores and contributes no adjacency or patterns.",
  Stack:
    "Place onto a compatible occupied slot. Top card determines covered functionality.",
  Charge:
    "Accumulates per activation, releases at the printed threshold. Recall resets it.",
  Herald: "Defeat to reveal this Stratum’s Archon.",
  Restless: "+1 movement and attack per batch survived.",
  Pierce: "Skips Wards, Shields and Allies. Equipment still protects.",
  Cull: "Skips Wards and Shields.",
  Taunt: "The most recently taunting Ally must intercept.",
  Isolated: "No orthogonal neighbors; Sever also satisfies this.",
  Cornerstone: "Only functions in a grid corner.",
  Bonded: "Requires a neighbor of the printed element.",
  Tower: "All Wards and designated Objects. Supports Tower stacks.",
};
