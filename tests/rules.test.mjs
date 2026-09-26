import test from "node:test";
import assert from "node:assert/strict";
import { Game, offense, blockHit } from "../src/engine.mjs";
import { cards, enemies } from "../src/content.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
function battle(id = "colossus") {
  const g = new Game(917231);
  g.s.field.round = 1;
  g.beginBattle([{ uid: g.uid(), enemy: id, restless: 0 }]);
  g.s.battle.bracelets = [];
  return g;
}
function put(g, id, i, changes = {}) {
  const c = g.instance(g.newCard(id));
  Object.assign(c, changes);
  g.s.battle.grid[i].push(c);
  return c;
}
function hit(g, n, extra = {}) {
  g.s.battle.reaction = {
    damage: n,
    element: "Arcane",
    stage: "ward",
    intercepted: [],
    name: "test",
    ...extra,
  };
  g.advanceHit();
}
const act = (g, type, predicate = () => true) => {
  const a = g.legal().find((a) => a.type === type && predicate(a));
  assert.ok(a, "expected legal " + type);
  g.act(a);
};
test("offense follows forward/backward cycles, Chaos/Light, rounding", () => {
  assert.equal(offense(5, "Fire", "Earth"), 8);
  assert.equal(offense(5, "Fire", "Water"), 3);
  assert.equal(offense(5, "Chaos", "Light"), 8);
  assert.equal(offense(5, "Light", "Chaos"), 8);
  assert.equal(offense(5, "Arcane", "Earth"), 5);
});
test("elemental block converts leftovers back per portion", () => {
  assert.deepEqual(blockHit(5, "Fire", 4, "Fire"), { remaining: 0, block: 3 });
  assert.deepEqual(blockHit(5, "Fire", 8, "Water"), { remaining: 5, block: 0 });
});
test("Ward FIFO and exhausted activations remain independent", () => {
  const g = battle(),
    a = put(g, "ward", 0, { ward: 3, used: 3 }),
    b = put(g, "ward", 4, { ward: 10 });
  hit(g, 12);
  assert.equal(a.ward, 0);
  assert.equal(b.ward, 1);
  assert.equal(g.s.hp, 65);
});
test("covered Wards inert unless top explicitly permits", () => {
  const g = battle(),
    w = put(g, "ward", 0);
  put(g, "palimpsest", 0);
  hit(g, 4);
  assert.equal(w.ward, 10);
  assert.equal(g.s.hp, 61);
  const h = battle(),
    v = put(h, "ward", 0);
  put(h, "lattice", 0);
  hit(h, 12);
  assert.equal(v.ward, 0);
  assert.equal(h.s.battle.grid[0][1].ward, 6);
});
test("Shield portions are compulsory choices before Allies", () => {
  const g = battle();
  const c = put(g, "shield", 0);
  put(g, "familiar", 1);
  g.s.battle.shields = [
    { uid: 1000, owner: c.uid, slot: 0, block: 5, element: "Fire" },
    { uid: 1001, owner: c.uid, slot: 0, block: 5, element: "Water" },
  ];
  hit(g, 8, { element: "Water" });
  assert.ok(g.legal().every((x) => x.type === "block"));
  act(g, "block", (a) => a.uid === 1000);
  assert.equal(g.s.battle.reaction.damage, 5);
  act(g, "block");
  assert.equal(g.s.battle.reaction, null);
  assert.equal(g.s.battle.shields[1].block, 2);
});
test("Ally interception spills excess; Guardian swallows it", () => {
  const g = battle();
  put(g, "familiar", 0);
  hit(g, 10);
  act(g, "intercept");
  assert.equal(g.s.hp, 61);
  assert.equal(g.s.battle.destroyed.length, 1);
  const h = battle();
  put(h, "guardian", 0);
  hit(h, 20);
  act(h, "intercept");
  assert.equal(h.s.hp, 65);
});
test("Taunt forces the latest taunting Ally", () => {
  const g = battle();
  put(g, "familiar", 0);
  const c = put(g, "golem", 1, { taunt: true });
  hit(g, 5);
  assert.equal(c.hp, 11);
  assert.equal(g.s.battle.reaction, null);
});
test("Pierce and player status bypass grid but meet Bracelet and Armor", () => {
  const g = battle();
  const w = put(g, "ward", 0);
  put(g, "familiar", 1);
  g.s.battle.bracelets = [{ uid: 900, block: 3, element: "Arcane" }];
  hit(g, 7, { stage: "bracelet", pierce: true });
  act(g, "bracelet");
  assert.equal(w.ward, 10);
  assert.equal(g.s.hp, 61);
});
test("Recall restores activations, Charge, and Ward on subsequent placement", () => {
  const g = battle(),
    c = put(g, "kiln", 0, { used: 2, charge: 2 });
  g.s.battle.focus = 10;
  act(g, "recall");
  const recalled = g.s.battle.discard.find((x) => x.uid === c.uid);
  const fresh = g.instance(recalled);
  assert.equal(fresh.used, 0);
  assert.equal(fresh.charge, 0);
  put(g, "familiar", 1);
  assert.equal(g.recallCost(g.s.battle.grid[1]), null);
});
test("locked stack cannot Recall, Sever satisfies Isolated", () => {
  const g = battle(),
    c = put(g, "ward", 0, { lock: true, sever: true });
  put(g, "blast", 1);
  assert.equal(g.recallCost(g.s.battle.grid[0]), null);
  assert.ok(g.condition(c, 0));
});
test("activation gains never reopen placement; Focus goes to next turn", () => {
  const g = battle(),
    c = put(g, "rain", 0);
  g.s.battle.phase = "activate";
  g.s.battle.channel = 1;
  act(g, "activate");
  assert.equal(g.s.battle.phase, "activate");
  assert.equal(g.s.battle.next.focus, 2);
  assert.ok(!g.legal().some((a) => a.type === "place"));
});
test("enemy statuses add and follow their independent tick schedules", () => {
  const g = battle("bat"),
    e = g.s.battle.enemies[0];
  e.hp = 100;
  e.status = { burn: 3, poison: 2, corrode: 1 };
  g.endTurn();
  while (g.s.battle.reaction) act(g, g.legal()[0].type);
  assert.deepEqual(e.status, { burn: 2, poison: 2, corrode: 2 });
  assert.equal(e.hp, 94);
});
test("victory clears player statuses, Curse reapplies next battle", () => {
  const g = battle("bat");
  g.addItem("curseRing");
  g.s.status = { burn: 4, poison: 3, corrode: 2 };
  g.s.battle.enemies[0].hp = 0;
  g.checkBattle();
  assert.deepEqual(g.s.status, { burn: 0, poison: 0, corrode: 0 });
  g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
  assert.equal(g.s.stats.damageTaken, 1);
});
test("fullest column ties use reading order, whole stacks destroyed", () => {
  const g = battle();
  put(g, "blast", 0);
  put(g, "plasma", 0);
  put(g, "blast", 1);
  put(g, "blast", 6);
  g.gridAttack({ name: "Collapse", grid: "column" });
  assert.equal(g.s.battle.grid[0].length, 0);
  assert.equal(g.s.battle.grid[1].length, 1);
  assert.equal(g.s.battle.destroyed.length, 2);
});
test("Pack arrival chains before the single enemy-phase encounter", () => {
  const g = new Game(77);
  g.s.mode = "field";
  g.s.field = {
    round: 3,
    spawned: 5,
    queue: ["Gold"],
    x: 5,
    y: 5,
    moves: 0,
    stage: "player",
    entities: [
      { uid: 900, enemy: "wolf", x: 3, y: 5, restless: 0, born: 1 },
      { uid: 901, enemy: "firewolf", x: 1, y: 5, restless: 0, born: 1 },
      { uid: 902, enemy: "undead", x: 0, y: 5, restless: 0, born: 1 },
    ],
  };
  g.endMovement();
  assert.equal(g.s.mode, "battle");
  assert.equal(g.s.battle.enemies.length, 3);
});
test("enemy battles on player entry are immediate", () => {
  const g = new Game(6);
  g.s.mode = "field";
  g.s.field.entities = [{ uid: 900, enemy: "wolf", x: 6, y: 5, restless: 0 }];
  act(g, "move", (a) => a.x === 6 && a.y === 5);
  assert.equal(g.s.mode, "battle");
  assert.equal(g.s.field.moves, 0);
});
test("Archons cannot evade past sixth Field round", () => {
  for (const id of ["hart", "choir", "colossus"]) {
    const g = new Game(1);
    g.s.mode = "field";
    g.s.field = {
      round: 21,
      spawned: 16,
      queue: [],
      x: 10,
      y: 10,
      moves: 0,
      stage: "player",
      entities: [
        {
          uid: 999,
          enemy: id,
          type: "Archon",
          x: 0,
          y: 0,
          restless: 0,
          born: 16,
        },
      ],
    };
    g.endMovement();
    assert.equal(g.s.mode, "battle", id);
  }
});
test("battle saves restart the same opening and random state", () => {
  const g = battle(),
    initial = g.save();
  act(g, "activatePhase");
  const restored = new Game(0, g.save());
  assert.deepEqual(restored.save(), initial);
  assert.equal(restored.s.battle.phase, "place");
});
test("public observation hides random state, future decks and Archon", () => {
  const g = new Game(99),
    o = g.observe();
  for (const key of [
    "rng",
    "seed",
    "enemyDecks",
    "eventDeck",
    "itemDeck",
    "checkpoint",
  ])
    assert.ok(!(key in o));
  assert.equal(o.archon, null);
});
test("unfamiliar actions stay selectable, policy survives changed rule numbers", () => {
  const g = battle();
  const p = new WeightedPolicy();
  const a = {
    key: "novel",
    type: "newMechanic",
    effects: { growth: 4 },
    costs: {},
  };
  assert.equal(p.choose(g.observe(), [a]).action, a);
  const observation = g.observe();
  observation.bonuses.channel = 7;
  assert.ok(
    g
      .legal()
      .some((x) => x.key === p.choose(observation, g.legal()).action.key),
  );
});
test("seed plus choices replay identically through a full run", () => {
  const a = new Game(41001),
    b = new Game(41001),
    p = new WeightedPolicy();
  for (let n = 0; n < 2000 && a.s.mode !== "result"; n++) {
    const d = p.choose(a.observe(), a.legal());
    assert.ok(d);
    a.act(d.action);
    b.act(d.action.key);
  }
  assert.equal(a.s.mode, "result");
  assert.deepEqual(a.s, b.s);
});
test("Plasma pile produces the documented 10+12+14+16 before gear", () => {
  const g = battle();
  g.s.equipment = {};
  const b = g.s.battle;
  b.enemies[0].id = "bat";
  b.enemies[0].element = "Arcane";
  b.enemies[0].hp = 1000;
  b.enemies[0].maxHp = 1000;
  for (let i = 0; i < 4; i++) put(g, "plasma", 0);
  b.phase = "activate";
  act(g, "activate");
  assert.equal(b.enemies[0].hp, 948);
  assert.ok(b.grid[0].every((c) => c.used === 1));
});
test("Fusion spends the covered Spell allowance; top spent never exposes it", () => {
  const g = battle();
  g.s.equipment = {};
  const under = put(g, "water", 0),
    heat = put(g, "heat", 0);
  g.s.battle.phase = "activate";
  g.s.battle.channel = 3;
  act(g, "activate");
  assert.equal(under.used, 1);
  assert.equal(g.s.battle.enemies[0].status.burn, 8);
  act(g, "activate");
  assert.equal(heat.used, 2);
  assert.ok(!g.legal().some((a) => a.type === "activate" && a.slot === 0));
});
test("Undertow leaves unrecallable Focus Energy covered with its battle bonus intact", () => {
  const g = battle();
  put(g, "focus", 0);
  g.s.battle.phase = "activate";
  act(g, "activate");
  g.s.battle.phase = "place";
  g.s.battle.focus = 1;
  g.s.battle.hand = [g.newCard("undertow")];
  act(g, "place", (a) => a.slot === 0);
  assert.equal(g.s.battle.grid[0].length, 2);
  assert.equal(g.s.battle.permanent.focus, 1);
});
test("Shift carries a full stack; Transmute changes future Attune choices", () => {
  const g = battle();
  put(g, "plasma", 0);
  put(g, "plasma", 0);
  put(g, "quicksilver", 4);
  put(g, "transmute", 9);
  put(g, "blast", 7);
  g.s.battle.phase = "activate";
  g.s.battle.channel = 3;
  act(
    g,
    "activate",
    (a) => a.slot === 4 && a.cardTarget === 0 && a.destination === 6,
  );
  assert.equal(g.s.battle.grid[6].length, 2);
  act(
    g,
    "activate",
    (a) => a.slot === 9 && a.cardTarget === 6 && a.newElement === "Water",
  );
  assert.ok(
    g
      .legal()
      .some(
        (a) => a.type === "activate" && a.slot === 7 && a.element === "Water",
      ),
  );
});
test("Consecutive Tower doubles matching level, including a covered Pile level", () => {
  const g = battle();
  g.s.equipment = {};
  put(g, "ward", 0);
  const mag = put(g, "magnify", 0);
  const p = put(g, "plasma", 4);
  const upper = put(g, "plasma", 4);
  g.s.battle.phase = "activate";
  g.s.battle.channel = 4;
  act(g, "activate", (a) => a.slot === 0);
  g.s.battle.turn++;
  act(g, "activate", (a) => a.slot === 0);
  assert.ok(mag.magnified);
  assert.equal(g.cardPower(upper, 4), 20);
  assert.equal(g.cardPower(p, 4), 10);
});
test("upgraded Sapling gets initial HP once, not bonus damage twice", () => {
  const g = battle();
  const c = g.instance(g.newCard("sapling", true));
  g.s.battle.grid[0].push(c);
  assert.equal(c.hp, 7);
  assert.equal(g.cardPower(c, 0), 7);
});
test("item choice pauses before enemy movement when Armor carry limit is reached", () => {
  const g = new Game(7);
  g.s.mode = "item";
  for (const id of ["fireArmor", "waterArmor", "earthArmor"]) g.addItem(id);
  g.s.itemOffer = ["windArmor"];
  g.s.field.moves = 0;
  g.s.field.round = 5;
  act(g, "takeItem");
  assert.equal(g.s.field.round, 5);
  assert.equal(g.s.pendingArmor, "windArmor");
  act(g, "declineArmor");
  assert.equal(g.s.field.round, 6);
});
test("Gem restrictions, mandatory cursed equipment, and socket legality", () => {
  const g = new Game(7);
  const gold = g.addItem("gold"),
    gem = g.addItem("channelGem");
  g.openTavern();
  assert.ok(
    !g
      .legal()
      .some(
        (a) => a.type === "socket" && a.uid === gold.uid && a.gem === gem.uid,
      ),
  );
  const curse = g.addItem("curseRing");
  const slot = Object.keys(g.s.equipment).find(
    (k) => g.s.equipment[k] === curse.uid,
  );
  assert.ok(slot);
  assert.ok(!g.legal().some((a) => a.type === "equip" && a.slot === slot));
});

test("repeated mid-battle save and resume always restarts the same battle opening", () => {
  const g = battle(),
    opening = g.save();
  act(g, "activatePhase");
  const restored = new Game(0, g.save());
  act(restored, "activatePhase");
  assert.deepEqual(restored.save(), opening);
});
