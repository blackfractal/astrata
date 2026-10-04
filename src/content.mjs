import { registerStratum2 } from "./strata.mjs";
export const DRUID_COMPANION_STORY =
  "At the forest’s edge, a sapling lifts its roots from the earth and falls into step beside you. It pauses when you pause. When you turn toward the darker trees, it shakes the dew from its leaves and follows. You make room in your grimoire. Neither of you has to enter the Weald alone.";
export const MIND_COLUMNS = 7,
  MIND_ROWS = 6,
  MIND_SIZE = MIND_COLUMNS * MIND_ROWS;
export const VERSION = {
  rules: "2.0.5",
  content: "2.0.6",
  observation: 2,
  actions: 5,
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
export const CARD_BUY_PRICES = Object.freeze({
  common: 100,
  rare: 150,
  legendary: 250,
});
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
  "Attune. Deal 4 damage, +1 per adjacent Blast. After activation, relay its element to adjacent Attune cards until your next turn.",
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
  "Attune. Add 4 Guard, +1 per adjacent Shield, until the enemy turn ends. After activation, relay its element to adjacent Attune cards until your next turn.",
  { attune: true },
);
card(
  "familiar",
  "Familiar",
  "Arcane",
  "Ally",
  1,
  2,
  { conduit: true },
  "6 HP. Conduit: optionally Attune. Until your next turn, defend in that element and count as an adjacent Blast and Shield, giving each +1 damage or Guard. Relay the chosen element to adjacent Attune cards. May intercept attacks.",
  { hp: 6, attune: true },
);
card(
  "clear",
  "Clear Mind",
  "Arcane",
  "Object",
  0,
  2,
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
  { hpDamage: true, growAfterAttack: 1 },
  "4 HP, maximum 10. Attack for current HP, then gain 1 HP per orthogonally adjacent card, up to 10 HP. No passive growth.",
  { hp: 4, hpCap: 10 },
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
  7,
  { damage: 20, burnAll: 2 },
  "Charge 2. When fully charged, spend a separate activation to deal 20 damage to one enemy and Burn 2 to all enemies, then reset to 0. On place: +1 Charge per adjacent Fire card, maximum 2.",
  { charge: 2, onPlaceCharge: true },
);
card(
  "cinder",
  "Cinder Snap",
  "Fire",
  "Spell",
  0,
  2,
  hit(6),
  "Deal 6 damage. Recall costs 3.",
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
  "Deal 8 Chaos damage to a random enemy. Pile: one Channel fires each ball with an available activation for 8 damage. Each firing ball spends one of its own uses; adding a ball never refreshes other balls. Recall the whole pile for 1 Focus per ball before discounts.",
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
  2,
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
  "Begins battle in a random empty space. Gain +1 Focus on your first turn. Cannot be recalled.",
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
  "Charge 1. When fully charged, spend a separate activation to deal 14 damage, then reset to 0.",
  { charge: 1 },
);
card(
  "prism",
  "Prismatic Core",
  "Arcane",
  "Spell",
  2,
  2,
  { damage: 5, prism: true },
  "Deal 5. If all four elements neighbor it: deal 5 of each element instead.",
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
  7,
  { damage: 16 },
  "Charge 3. Charging adds 2 instead of 1 while adjacent to any Water card, including an activated Water attunement. When fully charged, spend a separate activation to deal 16 Earth damage, then reset to 0. Excess charges are lost.",
  { charge: 3, chargeElement: "Water" },
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
  { poison: 2 },
  "Apply Poison 2.",
);
card(
  "solitude",
  "Solitude",
  "Light",
  "Spell",
  1,
  2,
  { damage: 10 },
  "Isolated. Deal 10 damage.",
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
  { adjInsight: 1 },
  "On activation: +1 Insight next turn per orthogonally adjacent card. Counts connected occupied spaces, not covered cards; 0 to 4.",
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
  "bastion",
  "Heartwood Bastion",
  "Earth",
  "Ward",
  2,
  3,
  { ward: 18 },
  "Starts with 0 ward value. Activate: +18 ward value. No isolation required. Tower.",
  { ward: 0, tower: true, rarity: "legendary" },
);
card(
  "eclipse",
  "Eclipse Seed",
  "Chaos",
  "Spell",
  2,
  3,
  { damage: 30, all: true },
  "Charge 2. When fully charged, spend a separate activation to deal 30 to all enemies, then reset to 0.",
  { charge: 2, rarity: "legendary" },
);
card(
  "square",
  "Fourfold Grove",
  "Earth",
  "Spell",
  1,
  2,
  { damage: 6, square: true },
  "Deal 6 damage. Double in an intact 2 by 2 formation.",
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
    gold: ["blast", "shield"].includes(id)
      ? 50
      : ["cinder", "solitude", "thorn", "root"].includes(id)
        ? 120
        : 100,
    bonus: 3,
    text: "The graftkeeper renews its living ink: +3 damage, Guard, healing, or initial Ally HP.",
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
  bonus: 1,
  text: "Wear a Fire-imbued Setting and pay 60 Gold: Burn 2 becomes Burn 3. Fusion still adds Burn 6.",
};
cards.spore.upgrade = {
  gold: 100,
  bonus: 1,
  text: "Poison 2 becomes Poison 3.",
};
cards.rot.upgrade = {
  gold: 100,
  bonus: 0,
  effects: { damage: 3 },
  text: "Add an immediate 3-damage Water hit. Corrode remains 1.",
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
for (const [id, name, effect, worth, short] of [
  [
    "healingSap",
    "Healing Sap",
    { heal: 5 },
    25,
    "Restore 5 HP. Use during your turn in battle or during map movement.",
  ],
  [
    "focusDraught",
    "Focus Draught",
    { focus: 1 },
    35,
    "Gain 1 Focus immediately during Placement. Unspent Focus expires this turn.",
  ],
  [
    "channelDraught",
    "Channel Draught",
    { channel: 1 },
    40,
    "Gain 1 Channel immediately during Activation. Unspent Channel expires this turn.",
  ],
  [
    "insightDew",
    "Insight Dew",
    { draw: 1 },
    25,
    "During Placement, spend 1 immediate Insight to draw 1 card now. Does not return to Reveal or discard your hand.",
  ],
  [
    "starFlask",
    "Star Flask",
    { damage: 6, element: "Arcane" },
    30,
    "During Activation, throw at one enemy for 6 Arcane damage. Does not trigger equipment attacks.",
  ],
])
  item(
    id,
    name,
    "consumable",
    {},
    worth,
    short +
      " Consumed permanently on use. No Channel cost; one consumable per player turn (one per movement round outside battle).",
    { consumable: effect },
  );
item(
  "bronze",
  "Bronze Bracelet",
  "wrist",
  { block: 2 },
  40,
  "Refill 2 Guard each enemy turn. Socketed elements use the attack cycle for Guard: +50% against the element they beat, -50% against their weakness; same element is neutral.",
  { socket: true },
);
item(
  "silver",
  "Silver Bracelet",
  "wrist",
  { block: 4 },
  90,
  "Refill 4 Guard each enemy turn. Socketed elements use the attack cycle for Guard: +50% against the element they beat, -50% against their weakness; same element is neutral.",
  { socket: true },
);
item(
  "gold",
  "Gold Bracelet",
  "wrist",
  { block: 7 },
  190,
  "Refill 7 Guard each enemy turn. Socketed elements use the attack cycle for Guard: +50% against the element they beat, -50% against their weakness; same element is neutral.",
  { socket: true },
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
  200,
  "+1 starting Focus.",
  { socket: true },
);
item(
  "channelRing",
  "Ring of Embers",
  "finger",
  { channel: 1 },
  240,
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
  "At the start of your turn, heal 1 if injured. Sapphire: heal 2. Two healing triggers per battle; full HP does not spend a trigger.",
  { socket: true, synergy: "sapphire", healLimit: 2 },
);
for (const [id, name, element] of [
  ["ruby", "Ruby", "Fire"],
  ["emerald", "Emerald", "Earth"],
  ["topaz", "Topaz", "Wind"],
  ["sapphire", "Sapphire", "Water"],
])
  item(
    id,
    name,
    "gem",
    {},
    45,
    `Imbues a Setting with ${element}. Attacks and Guard gain +50% against ${cycle[element]}, and lose 50% against ${Object.keys(cycle).find((e) => cycle[e] === element)}. Same-element and unrelated matchups are neutral. Round up.`,
    {
      element,
    },
  );
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
    { armor: 2 },
    65,
    `Armor holds 2 Guard each enemy round: up to 3 against ${cycle[element]}, 1 against ${Object.keys(cycle).find((e) => cycle[e] === element)}, 2 otherwise. Guard drains across hits and refills each enemy turn. Free to use or skip. Does not reduce ongoing status damage or supply card attunement.`,
    { element },
  );
item(
  "holyArmor",
  "Holy Armor",
  "torso",
  { heal: 2 },
  110,
  "At the start of your turn, heal 2 if injured. Two healing triggers per battle; full HP does not spend a trigger.",
  { healLimit: 2 },
);
item(
  "stoneArmor",
  "Stone Armor",
  "torso",
  { armor: 1 },
  30,
  "Holds 1 Guard, draining across hits and refilling each enemy turn. Free to use or skip; ongoing status damage bypasses Armor.",
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
  "Choose to reflect an incoming attack. Once per battle; you may skip it and save reflection for a later hit.",
);
item(
  "crown",
  "Sturdy Metal Helmet",
  "head",
  { shield: 2 },
  75,
  "When a card with Shield in its name activates, add +2 Guard. The helmet sends its power to that Shield. Does not supply card attunement.",
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
  "Cursed: forced equip. Holds 2 Guard, draining across hits and refilling each enemy turn; use or skip. Start each battle Corroded 1. At the start of your fifth turn, convert all your Corrode to the same amount of Burn, once per battle, before status damage. Armor does not reduce ongoing status damage.",
  { cursed: true, corrodeToBurnTurn: 5 },
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
  "Keep Bracelet Guard ready for incoming attacks; ongoing status damage bypasses it.",
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
  "Build Guard for the third turn.",
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
    attack("Void fist", 11, "Chaos", { currentElement: true }),
    attack("Void fist", 11, "Chaos", { currentElement: true }),
    effect("Collapse", {
      grid: "column",
      target: "column",
      damagePerEmpty: 5,
      fixedDamage: true,
    }),
    attack("Chaotic Glare", 5, "Random", {
      randomElement: true,
      pierce: true,
      fixedDamage: true,
    }),
  ],
  "Chaotic Glare randomly chooses Fire, Earth, Wind, Water, Chaos or Light, never Arcane, then deals 5 damage in that new element with Pierce (equipment can defend). Collapse destroys the fullest column, then deals 5 Arcane damage per space empty in that column before destruction. These two attacks do not gain cycle or half-HP damage bonuses; Void Fist and defensive matchups follow its current element. Hits matching its current element summon a Mini-Void of that element (once per activation). Each Mini-Void keeps its birth element. At half HP or lower: +3 attack.",
  "Start with Light attacks, then adapt. Collapse trades card loss against damage: spreading protects more cards from destruction, but each empty space in the targeted column adds 5 damage. Filling that column reduces damage at the cost of losing more cards; destroyed defenses cannot absorb the hit.",
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
    attack("Antler", 10, "Fire", { burn: 2 }),
    effect("Brand", { grid: "lock", target: "newest", burn: 2 }),
    effect("Wildfire", { grid: "row", target: "row", burn: 2 }),
    attack("Stampede", 7, "Earth", { hits: 2 }),
  ],
  "Immune to Burn and Poison; Corrode remains effective until Purify. Antler, Brand and Wildfire each inflict Burn 2 on the player. At half HP or lower, adds Burn 1 each enemy turn.",
  "Water attacks and Water defenses counter Antler; Fire defenses counter Stampede.",
  {
    schedule: "Wait 4 rounds, then Hunt.",
    bossMode: "hunter",
    statusImmunities: ["burn", "poison"],
  },
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
    attack("Refrain", 8, "Wind", { hits: 2 }),
    attack("Silence", 2, "Light", {
      grid: "sever",
      target: "connected",
      hits: 3,
      damagePerAlly: 2,
      fixedDamage: true,
    }),
    attack("Chorus", 11, "Water"),
  ],
  "Shatter Hymn destroys the two most valuable complete stacks: combined damage/defense potential, then printed Focus, remaining activations and reading order. Silence Severs the most connected card, then attacks three times for 2 Light damage plus 2 per living Ally card on the grid (including covered Allies), counted once before the first hit; no cycle or half-HP damage bonuses. At half HP or lower gains 8 Guard each Shatter Hymn. On death: Final Note deals 20 Light damage with Cull before victory, bypassing Wards and Shields. Allies, Bracelets and Armor can defend; prepare before the killing blow; this death attack does not scale.",
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
  19,
  "Stalker",
  [
    attack("Root Tap", 3, "Arcane"),
    attack("Root Tap", 3, "Arcane"),
    effect("Gathering Strength", {}),
    attack("Heavy Bough", 30, "Arcane"),
    effect("Recover", {}),
  ],
  "Gathers strength before a 30-damage blow, then rests.",
  "Build a right-to-left route through Shield, Ally, Ward and Bracelet.",
  { tutorialOnly: true, speed: 2 },
);
enemy(
  "tutorialEmber",
  "Ember Mote",
  "Mote",
  "Fire",
  29,
  "Sentinel",
  [
    attack("Ember Puff", 3, "Fire"),
    attack("Brighter Ember", 5, "Fire"),
    effect("Breathe", {}),
  ],
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
    attack("Measured Tap", 12, "Arcane"),
    effect("Lowered Staff", {}),
  ],
  "Pauses, attacks for 12, then rests. Attacks slowly strengthen each cycle.",
  "Use its pauses to place cards; combine Shields, Wards, Allies and equipment to answer its attack.",
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
  Conduit:
    "Familiar activation: choose an adjacent element or remain Arcane. Until the next player turn, defend in that element, relay it to adjacent Attune cards, and provide +1 damage to each adjacent Blast and +1 Guard to each adjacent Shield when they activate. Costs 1 Channel; two uses, once per turn. No attack or Shield Guard is created by Conduit itself. Spent Familiar still supplies the committed effect; Sever or covering stops neighbor connections. Existing Shield Guard is not changed retroactively.",
  Transmute:
    "Change a placed card to the chosen element, overriding Attune until it leaves the grid or is transmuted again. Existing Shield portions keep their elements.",
  Attune:
    "Prepare an activation, then choose an adjacent element or Unattune for Arcane. Choices only preview the card; commit on an enemy or with Activate/double-click. After activation, the card offers its chosen element to adjacent Attune cards until your next turn, even when spent or Guard is depleted. Blink relays its latest activation; Sever and covering prevent connections. Relays reset together each player turn and do not change printed-element conditions. Clicking elsewhere cancels without spending resources. Transmute fixes the placed card to its chosen element instead. Existing Shield portions retain their elements. Defensive attunement follows the attack cycle: +50% Guard against the element it beats, -50% against its weakness; same element is neutral.",
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
    "Guard expires after the enemy turn. Choose which portion absorbs a hit. Attuned Guard uses the same elemental cycle as attacks: +50% forward, -50% backward, rounded up; same element is neutral.",
  Ally: "May intercept when in the attack’s column or closer to the player. Destroyed Allies return next battle.",
  Burn: "Water enemies and Cinder Hart are immune. Damage at turn start; value decreases by one. On the player, bypasses all attack defenses, including Bracelets and Armor.",
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
    "Current / required charges, separate from activation allowance. Each charging activation adds 1 unless the card says otherwise, capped at the requirement, and deals no damage. Once full, a separate paid activation releases the effect and resets Charge to 0. Charging is targetless; only a targeted release selects an enemy. Both steps consume an activation and Channel, once per turn unless Blink. Recall resets Charge.",
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
    "Stored defense that absorbs damage before HP. Each defender keeps its own amount. Shield Guard expires after the enemy turn; Ward value persists; Bracelet and Armor Guard refill each enemy turn. Enemy Guard protects that enemy. Elemental Shield, Bracelet and Armor Guard gain +50% against the element they beat and lose 50% against their weakness, rounded up; same-element, unrelated and Arcane matchups are neutral. Wards remain neutral.",
  Shift:
    "Move a whole placed stack to an eligible empty Mind Grid slot. Locked stacks cannot Shift.",
  Flicker:
    "Negates the next offensive activation against this enemy, then ends. Other targets of that activation can still be affected.",
  Resist:
    "A printed resistance halves damage from its named element, rounded up. It is separate from the elemental cycle.",
  Armor:
    "Select an Armor icon to spend its remaining Guard without Channel, or click the Druid to skip unused defenses. Numeric Armor Guard drains across hits and refills at each enemy turn, like Bracelets. Mirror reflects once per battle. Armor shares the equipment position with Bracelets; using equipment passes grid defenses. Elemental protection: 3 favorable, 1 weak, 2 neutral. Ongoing status damage bypasses it. Healing/movement effects remain passive.",
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
  Consumable:
    "A single-use item, removed permanently when used. Costs no Channel. One per player turn; one per movement round on the map. Phase restrictions still apply.",
  Satchel:
    "Ten shared spaces for loose items, Gems and consumables. Equipped gear and socketed Gems take no spaces. Each item uses one space; copies do not stack.",
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
    "Equipment Guard at the final position before the player. Choosing it passes all grid defenses for this hit. Refills each enemy turn and requires no activation. You may take a hit without using it, preserving the Guard for a later attack. Clicking the Druid also skips unused Armor.",
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
    "No elemental matchup: Arcane attacks, Guard and Armor protection receive no elemental-cycle bonus or penalty.",
  Fire: "Fire burns Earth. Fire attacks, Shield Guard, Bracelet Guard and Armor protection gain +50% against Earth and lose 50% against Water, rounded up. Same-element matchups are neutral. Fire enemies are immune to Poison.",
  Earth:
    "Earth blocks Wind. Earth attacks, Shield Guard, Bracelet Guard and Armor protection gain +50% against Wind and lose 50% against Fire, rounded up. Same-element matchups are neutral.",
  Wind: "Wind dries Water. Wind attacks, Shield Guard, Bracelet Guard and Armor protection gain +50% against Water and lose 50% against Earth, rounded up. Same-element matchups are neutral.",
  Water:
    "Water douses Fire. Water attacks, Shield Guard, Bracelet Guard and Armor protection gain +50% against Fire and lose 50% against Wind, rounded up. Same-element matchups are neutral. Water enemies are immune to Burn.",
  Chaos:
    "Chaos and Light each gain +50% attack damage and Guard against the other, rounded up. Their Allies remain mutually vulnerable to incoming attacks. Same-element matchups are neutral. Chaos enemies are immune to Corrode.",
  Light:
    "Light and Chaos each gain +50% attack damage and Guard against the other, rounded up. Their Allies remain mutually vulnerable to incoming attacks. Same-element matchups are neutral.",
};

// Defeat epigraphs appear only when this enemy delivers the lethal attack.
export const enemyDeathLines = {
  mendingWarden: "The thread slipped. The lesson can begin again.",
  seamstress: "She found a loose thread. It was yours.",
  censer: "The incense rose. The traveler did not.",
  borrowedChoir: "Your hands knew the song before you did.",
  spoolkeeper: "One more stitch, and the pattern was complete.",
  borrowedFace: "It wore your last expression well.",
  surveyor: "There was room for everything except you.",
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

registerStratum2(card, enemy, glossary);
