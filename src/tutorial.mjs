import { cards, items, enemies } from "./content.mjs";
export const TUTORIAL = {
  id: "stratum1",
  version: 1,
  name: "The First Clearing",
  seed: 11001,
};
const steps = [];
const note = (id, title, text, focus = "", setup = null) =>
  steps.push({ id, title, text, focus, setup, kind: "note" });
const action = (
  id,
  title,
  text,
  match,
  focus = "",
  gesture = null,
  setup = null,
) =>
  steps.push({ id, title, text, match, focus, gesture, setup, kind: "action" });
const ui = (id, title, text, control, focus) =>
  steps.push({ id, title, text, control, focus, kind: "ui" });
const place = (id, card, slot, text, gesture = null) =>
  action(
    id,
    "Placement · " + cards[card].name,
    text,
    { type: "place", card, slot },
    "",
    gesture,
  );
const activate = (id, slot, text, element) =>
  action(id, "Activation", text, {
    type: "activate",
    slot,
    ...(element ? { element } : {}),
  });
const phase = (id) =>
  action(
    id,
    "Advance to Activation",
    "Your placement is finished. Press the arrow from Placement to Activation. Focus returns next round; this phase uses Channel.",
    { type: "activatePhase" },
  );
const end = (
  id,
  text = "Press the arrow to Enemy. Watch the Tell resolve before making your defense choice.",
) => action(id, "Let the enemy act", text, { type: "endTurn" });
const defend = (id, type, slot, text) =>
  action(id, "Choose your defense", text, {
    type,
    ...(slot == null ? {} : { slot }),
  });
const move = (id, x, y, text) =>
  action(id, "Follow the path", text, { type: "move", x, y });
const reward = (id, card, text) =>
  action(id, "Choose your reward", text, { type: "rewardCard", id: card });
const back = (id) =>
  action(
    id,
    "Back to the Clearing",
    "Return to the overworld. Your cards recover their allowances between battles.",
    { type: "continueReward" },
  );
note(
  "welcome",
  "The First Clearing",
  "A quiet grove to learn the journey. Each lesson waits for you. Read the glowing callout, then click Continue. You can pause or return to Start at any time.",
  ".field",
  "gold",
);
note(
  "gold",
  "A glint among the leaves",
  "Gold has appeared to your right. The eight arrow buttons move one space in the direction they point. Diagonal moves cost one space too.",
  ".direction-pad",
);
move("gold-move", 6, 5, "Click the glowing east arrow to move onto the Gold.");
note(
  "gold-gained",
  "Gold collected",
  "Your Gold increased by 200. These coins will pay for the Tavern lessons later. Ordinary journeys offer smaller, variable caches.",
  "header .gold",
  "ring",
);
move("item-move", 7, 5, "An item has appeared one space east. Move to it.");
action(
  "ring-take",
  "An item is yours to inspect",
  "Take the Rootbound Ring. In ordinary journeys you may leave an item behind.",
  { type: "takeItem", index: 0 },
);
ui(
  "inventory-open",
  "Your belongings",
  "Click Inventory. Items you wear appear in Equipped; everything else stays in the Satchel.",
  "inventory",
  '[data-ui="inventory"]',
);
action(
  "ring-equip",
  "Equip the Ring",
  "Drag the Rootbound Ring from the Satchel to your right finger. You may also inspect it and choose Equip. It adds a separate 2-damage hit to your first attack each turn.",
  { type: "equip", itemId: "ring", slot: "finger2" },
  '.satchel, [data-equip-slot="finger2"]',
);
note(
  "gear-ready",
  "Ready for the road",
  "The Ring is now Equipped, not in the Satchel. During player movement you can equip and unequip items. Gems are different: socket them only at a Tavern.",
  '[data-equip-slot="finger2"]',
  "mote",
);
move(
  "mote-move",
  8,
  5,
  "A Mosswing waits to the east. The arrow moves directly onto it. Clicking the enemy itself normally opens its details.",
);
note(
  "reveal",
  "Insight reveals your choices",
  "Watch the four cards dealt from your Grimoire. Insight starts at 4 and falls to 0 as Reveal finishes. It controls how many cards you see, not how many you may place.",
  ".resources > span:nth-child(1), .hand",
);
ui(
  "grimoire-open",
  "Your Grimoire",
  "Open the Grimoire to see your deck. Undrawn cards remain there; discarded cards recycle when it empties.",
  "grimoire",
  '[data-ui="grimoire"]',
);
note(
  "focus",
  "Focus places cards",
  "Focus starts at 1. This Shield costs 1 Focus to place. Drag it from your revealed hand to the outlined space; the card stays there between rounds.",
  ".resources > span:nth-child(2), .hand",
);
place(
  "shield-place",
  "shield",
  18,
  "Drag a Shield onto the outlined space. Keyboard: focus the Shield, press Enter, close its details, then Enter on the marked space.",
  "drag-place",
);
note(
  "focus-empty",
  "Focus is spent",
  "Focus is now 0, so no more cost-1 cards can be placed. Do not worry: it returns to 1 next round. The phase arrows move only forward.",
  ".resources > span:nth-child(2)",
);
phase("first-phase");
note(
  "tell3",
  "Read the Tell",
  "Mosswing is about to deal 3 Arcane damage. A Shield activation costs 1 Channel and creates 4 block for this turn. Channel starts at 2.",
  ".enemy .tell, .resources > span:nth-child(3)",
);
activate(
  "shield-activate",
  18,
  "Click Activate on your Shield to prepare 4 block.",
);
end("first-enemy");
defend(
  "shield-block3",
  "block",
  18,
  "Click your glowing Shield to absorb the 3-damage attack.",
);
note(
  "shield-expiry",
  "The card stays; its block expires",
  "The attack was blocked. Unused Shield block disappears at round end, but the card remains. Activate it again to make fresh block. This Shield has one use left; keep an eye on Channel and each card’s allowance.",
  '[data-slot="18"], .resources',
);
place(
  "blast-place",
  "blast",
  22,
  "Place a Blast on the outlined space. Your refreshed Focus pays for it.",
);
phase("second-phase");
activate(
  "second-shield",
  18,
  "Prepare the Shield again. The next enemy attack deals 5, so its 4 block will need help from your Bracelet.",
);
activate(
  "first-blast",
  22,
  "Attack by dragging Blast onto Mosswing, or double-click its Activate button to hit the top enemy. Blast deals 4; your Ring adds a separate 2.",
);
end("second-enemy");
defend(
  "shield-block5",
  "block",
  18,
  "Click Shield: it stops 4 of the 5 damage. The remaining attack continues toward you.",
);
defend(
  "bracelet-block1",
  "bracelet",
  null,
  "Click your right Bracelet. It blocks the last 1 damage without spending Channel. Its 2 block refills each enemy round.",
);
place(
  "synergy-place",
  "blast",
  23,
  "Place a second Blast immediately beside the first, on the outlined space.",
);
note(
  "synergy",
  "Neighbors can change a card",
  "The connecting line shows a real interaction. Each adjacent Blast adds +1 damage, so each now shows 5. Inspect card details to learn which neighbors, patterns and stacks matter.",
  '[data-slot="22"], [data-slot="23"]',
);
phase("third-phase");
activate(
  "synergy-kill",
  23,
  "Activate the new Blast against Mosswing. Its 5 damage and the Ring’s first-hit 2 will finish this fight.",
);
reward(
  "ward-reward",
  "ward",
  "Choose Ward. This reward goes into your Grimoire, and we will use it in the next fight.",
);
back("first-back");
note(
  "pursuit",
  "An item beyond your reach",
  "An item lies northeast, but a Rootling is approaching. Move toward the item, then watch the enemy follow one space at a time and stop on your space.",
  ".field, .direction-pad",
  "pursuit",
);
move(
  "pursuit-move",
  9,
  4,
  "Take the northeast step toward the distant item. This uses your last movement; the Rootling then gets its turn.",
);
note(
  "caught",
  "Enemies move too",
  "The Rootling moved onto your space and started a battle. On ordinary maps, inspect enemy movement and age before deciding where to go.",
  ".enemy",
);
place(
  "ward-place",
  "ward",
  16,
  "Place Ward in the marked space nearer to you. It starts with 10 stored block. Isolated means it needs empty neighboring spaces to activate.",
);
phase("ward-phase");
activate(
  "ward-activate",
  16,
  "Activate Ward to add 10 more block: it now stores 20. Unlike Shield, that stock will persist across rounds.",
);
end("ward-enemy");
defend("ward-block", "ward", 16, "Choose Ward to absorb the 3-damage attack.");
note(
  "ward-persists",
  "17 block remains",
  "Ward kept its remaining 17 block into this round. You do not have to activate it every turn. When depleted, it cannot protect you further.",
  '[data-slot="16"]',
);
place(
  "sapling-place",
  "sapling",
  20,
  "Place Sapling on the far-right marked space. Allies have HP, can attack, and may intercept incoming attacks.",
);
phase("sapling-phase");
activate(
  "sapling-attack",
  20,
  "Activate Sapling to attack with its current 4 HP. Your Ring adds 2. It can still defend even though it has attacked this turn.",
);
end(
  "rootling-rest",
  "Rootling spends this move Gathering Strength. Advance and use the breathing room to prepare your defense.",
);
place(
  "route-shield",
  "shield",
  18,
  "Place Shield between Sapling on the right and Ward on the left. This is the route the next attack will take.",
);
phase("route-phase");
activate(
  "route-shield-activate",
  18,
  "Activate Shield to create 4 block between your Ally and Ward.",
);
activate(
  "route-sapling-attack",
  20,
  "Use Sapling’s second attack. It spends its final attack allowance, but its remaining HP can still intercept damage.",
);
note(
  "route",
  "Block from right to left",
  "Rootling is winding up a 30-damage attack. Choose Sapling, then Shield, then Ward, then Bracelet. Once the attack passes a column, cards farther right cannot defend it. In normal play you may skip a defense or click your Druid to take the hit.",
  '.enemy .tell, [data-slot="20"], [data-slot="18"], [data-slot="16"]',
);
end("route-enemy");
defend(
  "route-ally",
  "intercept",
  20,
  "Click Sapling. Its 4 HP absorb 4 damage. It dies and enters Destroyed until the next battle. Watch the remaining 26 damage stop here.",
);
defend(
  "route-block",
  "block",
  18,
  "Click Shield. Its 4 block stop 4 more damage. The remaining 22 continue leftward.",
);
defend(
  "route-ward",
  "ward",
  16,
  "Click Ward. Its stored 17 block absorb 17, leaving 5 damage.",
);
defend(
  "route-bracelet",
  "bracelet",
  null,
  "Click your Bracelet. It stops 2, then the final 3 automatically reach the Druid because no defenses remain.",
);
note(
  "route-done",
  "Every layer matters",
  "You took only 3 of the original 30 damage. Each hit showed the actual HP or block lost. The attack never moved backward toward the enemy.",
  ".battle-player, header .hp",
);
place(
  "rootling-blast",
  "blast",
  22,
  "Place Blast on the marked space to finish the weakened Rootling.",
);
phase("rootling-phase");
activate(
  "rootling-kill",
  22,
  "Blast and your Ring deal the remaining 6 damage. Destroyed Allies will be available again next battle.",
);
reward(
  "water-reward",
  "water",
  "Take Water Blast. It will help with the upcoming lesson about elements.",
);
back("rootling-back");
note(
  "gem-road",
  "Return to the item",
  "The way is clear. Continue northeast toward the item you saw before the chase.",
  ".field",
  "gem-road",
);
move("gem-step", 10, 3, "Move northeast, one step closer to the item.");
move("gem-move", 10, 2, "Move north onto the item.");
action(
  "gem-take",
  "A Sapphire",
  "Take the Sapphire. Gems imbue Settings such as Bracelets and Rings; they are not worn by themselves.",
  { type: "takeItem", index: 0 },
);
note(
  "gem-save",
  "Save it for the Tavern",
  "You may equip ordinary items during map movement, but Gems may be socketed or removed only at a Tavern. We will save this Sapphire for your Bracelet.",
  '[data-ui="inventory"]',
);
note(
  "curses",
  "Read before you take",
  "Some objects are Cursed; some cards are Hexes. Their drawbacks can persist between battles. Inspect their text before taking them. A visiting Tavern Healer can remove them, sometimes for Gold, HP or a sacrifice.",
  '[data-ui="grimoire"], [data-ui="inventory"]',
  "ember",
);
move(
  "ember-move",
  9,
  2,
  "Move west onto the Ember Mote to explore elemental matchups.",
);
note(
  "elements",
  "Fire meets Water",
  "This enemy is Fire. Water attacks deal +50% damage to Fire, rounded up; Earth attacks deal half. Arcane stays neutral. The enemy’s Tell also shows the element of its attack.",
  ".enemy",
);
place("water-place", "water", 22, "Place Water Blast on the marked space.");
phase("water-phase");
activate(
  "water-attack",
  22,
  "Water Blast’s 7 becomes 11 against Fire. Your unsocketed Ring adds a neutral 2. Drag over the enemy to see the elemental preview.",
);
end("ember-enemy");
defend(
  "ember-bracelet",
  "bracelet",
  null,
  "Your unsocketed Bracelet blocks 2 of the 3 Fire damage; the last 1 reaches you. A Fire-imbued defense is strongest against Fire. Water defense is strongest against Water, even though Water attacks beat Fire.",
);
place(
  "attune-place",
  "blast",
  23,
  "Place Blast beside Water Blast. An adjacent elemental card gives Blast an Attunement choice.",
);
phase("attune-phase");
activate(
  "attune-attack",
  23,
  "Activate Blast as Water against the Fire enemy. Its 4 becomes 6; your Ring supplies the final 2.",
  "Water",
);
action(
  "element-back",
  "Back to the path",
  "Return to the Field after seeing the enemy defeated.",
  { type: "continueReward" },
);
note(
  "cycle",
  "Remember the cycle",
  "Fire burns Earth. Earth blocks Wind. Wind dries Water. Water douses Fire. Chaos swallows Light; Light overwhelms Chaos. The verbs describe attack advantage. Both Chaos and Light are strong against each other.",
  ".field",
  "tavern",
);
move(
  "tavern-move",
  8,
  2,
  "Move west into the Lantern Rest. You have enough Gold for every lesson.",
);
ui(
  "scribe",
  "Visit the Scribe",
  "Click the Scribe in the Tavern. Upgrades strengthen a specific card, and their costs are shown before purchase.",
  "tavern:grimoire",
  '[data-tavern="grimoire"]',
);
action(
  "upgrade",
  "Upgrade Blast",
  "Choose the highlighted Blast upgrade. Its printed damage rises from 4 to 7.",
  { type: "upgrade", card: "blast" },
);
ui(
  "market",
  "Visit the Market",
  "Click the Market. You can View an item before you Buy it.",
  "tavern:market",
  '[data-tavern="market"]',
);
ui(
  "market-equipment",
  "Choose Equipment",
  "Open the Equipment tab to see the helmet for sale.",
  "market:Equipment",
  '[data-market-category="Equipment"]',
);
action(
  "helmet-buy",
  "Buy the helmet",
  "Buy the Sturdy Metal Helmet for 75 Gold. It adds +2 to the block produced by your Shields.",
  { type: "buy", itemId: "crown" },
);
ui(
  "jeweler",
  "Visit the Jeweler",
  "Click the Jeweler for your equipment and Gem sockets.",
  "tavern:equipment",
  '[data-tavern="equipment"]',
);
action(
  "helmet-equip",
  "Wear the helmet",
  "Drag the helmet into your head slot, or inspect it and choose Equip.",
  { type: "equip", itemId: "crown", slot: "head" },
  '.satchel, [data-equip-slot="head"]',
);
action(
  "socket",
  "Imbue the Bracelet",
  "Drag the Sapphire into the Bracelet’s Gem socket, or inspect the Gem and choose the Bracelet. Your Bracelet now has Water defense.",
  { type: "socket", itemId: "bronze", gemId: "sapphire" },
  '.satchel, [data-equip-slot="wrist2"]',
);
ui(
  "traveler",
  "Hear the rumors",
  "Click the Traveler to hear gossip about the Archon.",
  "tavern:gossip",
  '[data-tavern="gossip"]',
);
action(
  "gossip",
  "Learn what lies ahead",
  "Pay 15 Gold for gossip. It reveals Cinder Hart, the Archon of this lesson’s imagined onward journey. You will not fight that boss in the tutorial.",
  { type: "gossip" },
);
ui(
  "innkeeper",
  "Rest at the inn",
  "Click the Innkeeper. The earlier damage gives you a reason to recover.",
  "tavern:rest",
  '[data-tavern="rest"]',
);
action("rest", "Recover HP", "Spend 20 Gold to recover up to 20 HP.", {
  type: "heal",
});
ui(
  "healer",
  "Meet the Healer",
  "Click the Healer. This visitor treats Hexes and Cursed equipment, separately from ordinary paid card removal.",
  "tavern:healer",
  '[data-tavern="healer"]',
);
note(
  "healer-help",
  "A different price for every affliction",
  "You have no Hexes or Curses to remove. In a normal journey, read the treatment: it may require Gold, HP, an Ally or an item. Ordinary card removal is limited to one per Tavern; Hex treatment is separate.",
  ".tavern-service",
);
action(
  "leave-tavern",
  "One final challenge",
  "Leave the Tavern. Your final encounter is a gentle Eidolon, the Patient Warden.",
  { type: "leave" },
);
note(
  "final-intro",
  "The Patient Warden",
  "You are on your own for this fight. Inspect its Tell, place your cards, watch your resources, and choose how to defend. It alternates pauses with modest attacks. Optional tooltips remain available.",
  ".field",
  "final",
);
move(
  "final-move",
  7,
  2,
  "Move west to challenge the Patient Warden. Defeating it completes The First Clearing.",
);
steps.push({
  id: "independent",
  kind: "free",
  title: "Your turn to decide",
  text: "Use what you have learned. Read the Tell, spend Focus and Channel, and defend from right to left. Defeat the Patient Warden to finish the tutorial.",
  focus: "",
});
export const TUTORIAL_STEPS = steps;
export function tutorialGuide(g) {
  const t = g.s.tutorial;
  return t && !t.completed
    ? {
        ...steps[t.step],
        index: t.step,
        total: steps.length,
        name: TUTORIAL.name,
      }
    : null;
}
const item = (g, id) => g.s.inventory.find((x) => x.id === id);
function matches(g, a, m) {
  return Object.entries(m).every(([k, v]) => {
    if (k === "card")
      return (
        (
          g.s.battle?.hand.find((c) => c.uid === a.uid) ||
          g.s.deck.find((c) => c.uid === a.uid)
        )?.id === v
      );
    if (k === "itemId")
      return a.type === "buy"
        ? g.s.shop.stock[a.index] === v
        : item(g, v)?.uid === (a.item ?? a.uid);
    if (k === "gemId") return item(g, v)?.uid === a.gem;
    return a[k] === v;
  });
}
export function tutorialActions(g, raw) {
  const t = g.s.tutorial,
    step = steps[t?.step];
  if (!t) return raw;
  if (g.s.mode === "result")
    return g.s.outcome === "loss" && t.finalStart
      ? [
          {
            type: "tutorialRetry",
            label: "Retry the Warden",
            key: '["tutorialRetry"]',
            effects: { progress: 1 },
            costs: {},
          },
        ]
      : [];
  if (step.kind === "free") return raw;
  if (step.kind === "action")
    return raw
      .filter((a) => matches(g, a, step.match))
      .slice(
        0,
        step.match.type === "place" || step.match.type === "upgrade"
          ? 1
          : undefined,
      );
  const type = step.kind === "ui" ? "tutorialUI" : "tutorialNext";
  return [
    {
      type,
      step: step.id,
      control: step.control,
      label: step.kind === "ui" ? step.title : "Continue lesson",
      key: JSON.stringify([type, { step: step.id }]),
      effects: { progress: 1 },
      costs: {},
    },
  ];
}
function spawn(g, type, x, y, extra = {}) {
  g.s.field.entities.push({
    uid: g.uid(),
    type,
    x,
    y,
    born: g.s.field.round,
    restless: 0,
    ...extra,
  });
}
function enter(g) {
  const t = g.s.tutorial,
    step = steps[t.step],
    f = g.s.field;
  if (!step) throw Error("Unknown tutorial step");
  t.lesson = step.id;
  switch (step.setup) {
    case "gold":
      spawn(g, "Gold", 6, 5, { value: 200 });
      break;
    case "ring":
      spawn(g, "Item", 7, 5, { item: "ring" });
      break;
    case "mote":
      spawn(g, "Mote", 8, 5, { enemy: "tutorialMosswing", count: 1 });
      break;
    case "pursuit":
      spawn(g, "Item", 10, 2, { item: "sapphire" });
      spawn(g, "Mote", 8, 6, { enemy: "tutorialRootling", count: 1 });
      f.moves = 1;
      break;
    case "gem-road":
      f.moves = 2;
      break;
    case "ember":
      spawn(g, "Mote", 9, 2, { enemy: "tutorialEmber", count: 1 });
      break;
    case "tavern":
      spawn(g, "Tavern", 8, 2);
      break;
    case "final":
      spawn(g, "Eidolon", 7, 2, { enemy: "tutorialWarden", count: 1 });
      break;
  }
}
export function startTutorial(g) {
  const s = g.s;
  s.tutorial = {
    ...TUTORIAL,
    step: 0,
    lesson: "welcome",
    fight: 0,
    completed: false,
  };
  s.mode = "field";
  s.archon = "hart";
  s.revealedArchon = null;
  s.gold = 0;
  s.inventory = s.inventory.filter((x) => x.id === "bronze");
  for (const k of Object.keys(s.equipment))
    if (k !== "wrist2") s.equipment[k] = null;
  s.deck = [
    ...Array(4).fill("shield"),
    ...Array(4).fill("blast"),
    "sapling",
    "clear",
  ].map((id) => g.newCard(id));
  Object.assign(s.field, {
    round: 1,
    spawned: 0,
    queue: [],
    entities: [],
    x: 5,
    y: 5,
    moves: 2,
    stage: "player",
  });
  s.stats.itemsGained = ["Bronze Bracelet"];
  enter(g);
  return g;
}
export function tutorialAfter(g, a) {
  const t = g.s.tutorial;
  if (!t) return;
  if (a.type === "tutorialRetry") {
    const saved = t.finalStart;
    g.s.battle = structuredClone(saved.battle);
    g.s.hp = saved.hp;
    g.s.status = { burn: 0, poison: 0, corrode: 0 };
    g.s.mode = "battle";
    delete g.s.outcome;
    delete g.s.death;
    delete g.s.cause;
    g.s.stats.encounters.push({
      round: g.s.field.round,
      enemies: [enemies.tutorialWarden.name],
      outcome: "in progress",
      hpStart: g.s.hp,
    });
    t.completed = false;
    t.step = steps.length - 1;
    t.lesson = "independent";
    t.retries = (t.retries || 0) + 1;
    return;
  }
  if (steps[t.step].kind === "free" || t.completed) return;
  t.step++;
  enter(g);
}
export function tutorialBattle(g, entities) {
  if (!g.s.tutorial) return;
  g.s.tutorial.fight =
    {
      tutorialMosswing: 1,
      tutorialRootling: 2,
      tutorialEmber: 3,
      tutorialWarden: 4,
    }[entities[0].enemy] || 0;
}
export function tutorialBattleReady(g) {
  const t = g.s.tutorial;
  if (t?.fight === 4)
    t.finalStart = { battle: structuredClone(g.s.battle), hp: g.s.hp };
}
export function tutorialDrawIndex(g, n) {
  const b = g.s.battle,
    t = g.s.tutorial;
  const plans = {
    1: {
      1: ["shield", "shield", "shield", "shield"],
      2: ["blast", "blast", "blast", "blast"],
      3: ["sapling", "clear", "blast", "blast"],
    },
    2: {
      1: ["ward", "blast", "blast", "clear"],
      2: ["sapling", "blast", "blast", "shield"],
      3: ["shield", "shield", "shield", "blast"],
      4: ["blast"],
    },
    3: { 1: ["water", "shield", "shield", "shield"], 2: ["blast"] },
  };
  const id = plans[t.fight]?.[b.turn]?.[n];
  const i = b.deck.findIndex((c) => c.id === id);
  return i < 0 ? 0 : i;
}
export function tutorialReward(g) {
  const t = g.s.tutorial;
  if (!t) return false;
  if (t.fight === 4) {
    t.completed = true;
    g.finish(true, "The First Clearing complete");
    return true;
  }
  g.s.reward = {
    cards: t.fight === 1 ? ["ward"] : t.fight === 2 ? ["water"] : null,
    gem: false,
    setting: false,
    boss: false,
  };
  return false;
}
export function tutorialTavern(g) {
  if (!g.s.tutorial) return;
  g.s.shop = {
    stock: ["crown"],
    healer: true,
    healerPrice: 35,
    hexPrice: { kind: "gold", gold: 35, hp: 0 },
    healUsed: false,
    removeUsed: false,
  };
}
