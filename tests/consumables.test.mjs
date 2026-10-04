import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { items } from "../src/content.mjs";
import {
  satchelContents,
  consumableReason,
  SATCHEL_CAPACITY,
} from "../src/consumables.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
function base(enemy = "beetle") {
  const g = new Game(381);
  g.s.inventory = [];
  for (const k in g.s.equipment) g.s.equipment[k] = null;
  g.beginBattle([{ uid: g.uid(), enemy, restless: 0 }]);
  g.s.battle.phase = "place";
  g.s.battle.enemies[0].hp = 99;
  return g;
}
function use(g, x) {
  const a = g.legal().find((a) => a.type === "consume" && a.uid === x.uid);
  assert.ok(a, items[x.id].name);
  g.act(a);
  return a;
}
test("Consumables respect phases, one use across phases, save/resume and next-turn refresh", () => {
  const g = base(),
    b = g.s.battle;
  const focus = g.addItem("focusDraught"),
    channel = g.addItem("channelDraught"),
    draw = g.addItem("insightDew");
  assert.ok(g.legal().some((a) => a.uid === focus.uid && a.type === "consume"));
  assert.match(consumableReason(g.s, channel), /Activation/);
  b.focus = 0;
  use(g, focus);
  assert.equal(b.focus, 1);
  assert.ok(!g.getItem(focus.uid));
  assert.ok(!g.legal().some((a) => a.type === "consume"));
  g.act(g.legal().find((a) => a.type === "activatePhase"));
  assert.ok(!g.legal().some((a) => a.type === "consume"));
  const h = new Game(0, g.s);
  assert.ok(!h.legal().some((a) => a.type === "consume"));
  h.beginTurn();
  assert.equal(h.s.battle.focus, 1);
  h.s.battle.phase = "activate";
  h.s.battle.channel = 0;
  use(h, channel);
  assert.equal(h.s.battle.channel, 1);
  assert.match(consumableReason(h.s, draw), /already used/);
  h.beginTurn();
  assert.equal(h.s.battle.channel, 2);
  assert.equal(h.s.stats.consumablesUsed.length, 2);
});
test("Healing is five HP, never spent at full HP, once per map round and independent of battle allowance", () => {
  const g = base();
  g.s.mode = "field";
  g.s.field.round = 4;
  const first = g.addItem("healingSap"),
    second = g.addItem("healingSap");
  assert.match(consumableReason(g.s, first), /full HP/);
  g.s.hp = 60;
  use(g, first);
  assert.equal(g.s.hp, 65);
  assert.ok(!g.legal().some((a) => a.type === "consume"));
  const h = new Game(0, g.s);
  assert.ok(!h.legal().some((a) => a.type === "consume"));
  h.s.field.round++;
  h.s.hp = 68;
  use(h, second);
  assert.equal(h.s.hp, 70);
  const third = h.addItem("healingSap");
  h.beginBattle([{ uid: 990, enemy: "beetle", restless: 0 }]);
  h.s.hp = 55;
  use(h, third);
  assert.equal(h.s.hp, 60);
  assert.equal(h.s.stats.consumablesUsed[1].healed, 2);
});
test("No consumables during an incoming hit, enemy/reveal phases, rewards or at result", () => {
  const g = base(),
    x = g.addItem("healingSap");
  g.s.hp = 40;
  for (const phase of ["start", "enemy"]) {
    g.s.battle.phase = phase;
    assert.ok(!g.legal().some((a) => a.type === "consume"));
  }
  g.s.battle.phase = "place";
  g.s.battle.reaction = {
    damage: 2,
    element: "Arcane",
    stage: "player",
    intercepted: [],
  };
  assert.ok(!g.legal().some((a) => a.type === "consume"));
  g.s.battle.reaction = null;
  g.s.mode = "result";
  assert.deepEqual(g.legal(), []);
});
test("Insight draws exactly one using the seeded deck, preserves hand/phase and recycles discard", () => {
  const g = base(),
    b = g.s.battle,
    x = g.addItem("insightDew");
  b.hand = [g.newCard("shield")];
  b.deck = [];
  b.discard = [g.newCard("blast")];
  const h = new Game(0, g.s),
    before = b.hand[0].uid;
  g.capturePresentation = true;
  use(g, x);
  use(h, x);
  assert.equal(b.hand.length, 2);
  assert.equal(b.hand[0].uid, before);
  assert.equal(b.hand[1].id, "blast");
  assert.equal(b.phase, "place");
  assert.equal(b.insight, 0);
  assert.equal(b.discard.length, 0);
  assert.deepEqual(g.observe(), h.observe());
  assert.equal(g.s.rng, h.s.rng);
  const frame = g.presentation.find((x) => x.kind === "reveal");
  assert.ok(frame.incremental);
  assert.deepEqual(frame.cards, [b.hand[1].uid]);
  b.turn++;
  const empty = g.addItem("insightDew");
  assert.match(consumableReason(g.s, empty), /No cards/);
});
test("Star Flask targets explicitly, deals six without Ring triggers and retains normal death resolution", () => {
  const g = base(),
    b = g.s.battle,
    x = g.addItem("starFlask"),
    ring = g.addItem("ring");
  g.s.equipment.finger2 = ring.uid;
  b.phase = "activate";
  const e = b.enemies[0];
  e.element = "Arcane";
  g.capturePresentation = true;
  const a = use(g, x);
  assert.equal(a.target, e.uid);
  assert.equal(e.hp, 93);
  assert.notEqual(b.firstAttackTurn, b.turn);
  assert.equal(b.channel, 2);
  assert.ok(
    g.presentation.some(
      (f) => f.kind === "hit" && f.sourceItem === x.uid && f.amount === 6,
    ),
  );
  const h = base("choir"),
    flask = h.addItem("starFlask");
  h.s.battle.phase = "activate";
  h.s.battle.enemies[0].hp = 6;
  use(h, flask);
  assert.equal(h.s.hp, 50);
  assert.equal(h.s.mode, "reward");
});
test("Ten shared Satchel slots exclude equipped gear and every socketed gem, but count separate bottles", () => {
  const g = base();
  g.s.mode = "field";
  g.s.field.entities = [];
  const setting = g.addItem("bronze"),
    gem = g.addItem("ruby");
  setting.gem = gem.uid;
  g.s.equipment.wrist2 = setting.uid;
  for (let n = 0; n < 10; n++) g.addItem("healingSap");
  assert.equal(SATCHEL_CAPACITY, 10);
  assert.equal(satchelContents(g.s).length, 10);
  const a = g.legal().find((a) => a.type === "unequip");
  g.act(a);
  assert.equal(satchelContents(g.s).length, 11);
  assert.ok(!g.legal().some((a) => a.type === "move"));
  const equip = g
    .legal()
    .find((a) => a.type === "equip" && a.item === setting.uid);
  g.act(equip);
  assert.equal(satchelContents(g.s).length, 10);
  assert.ok(g.legal().some((a) => a.type === "move"));
});
test("Full acquisition preserves every item until an explicit discard; legacy overflow survives save/load", () => {
  const g = base();
  g.s.mode = "field";
  g.s.field.entities = [];
  for (let n = 0; n < 10; n++) g.addItem("healingSap");
  const valuable = g.addItem("gold");
  assert.equal(g.s.inventory.length, 11);
  const h = new Game(0, g.s);
  assert.equal(h.s.inventory.length, 11);
  const discard = h
    .legal()
    .find((a) => a.type === "discardItem" && a.uid !== valuable.uid);
  h.act(discard);
  assert.equal(h.s.inventory.length, 10);
  assert.ok(h.getItem(valuable.uid));
  assert.ok(!h.getItem(discard.uid));
});
test("Cursed objects and cursed socket holders cannot be discarded to evade the Healer", () => {
  const g = base();
  g.s.mode = "field";
  g.s.field.entities = [];
  const setting = g.addItem("bronze"),
    curse = g.addItem("curseGem");
  setting.gem = curse.uid;
  g.addItem("curseRing");
  for (const x of [setting, curse])
    assert.ok(
      !g.legal().some((a) => a.type === "discardItem" && a.uid === x.uid),
    );
});
test("Every normal Tavern offers two distinct consumables, uses posted prices, and supports sales", () => {
  const g = base();
  g.s.gold = 500;
  g.openTavern();
  const stock = g.s.shop.stock.filter((id) => items[id]?.consumable);
  assert.equal(stock.length, 2);
  assert.equal(new Set(stock).size, 2);
  for (const id of stock) {
    const buy = g
        .legal()
        .find((a) => a.type === "buy" && g.s.shop.stock[a.index] === id),
      before = g.s.gold;
    g.act(buy);
    assert.equal(before - g.s.gold, items[id].worth);
    const inst = g.s.inventory.find((x) => x.id === id),
      sell = g.legal().find((a) => a.type === "sell" && a.uid === inst.uid);
    assert.ok(sell);
    g.act(sell);
    assert.ok(!g.getItem(inst.uid));
  }
});
test("AI values finite supplies and can finish an enemy using a legal Flask action", () => {
  const g = base(),
    b = g.s.battle,
    x = g.addItem("starFlask");
  b.phase = "activate";
  b.channel = 0;
  b.grid = b.grid.map(() => []);
  b.enemies[0].hp = 5;
  b.enemies[0].element = "Arcane";
  const p = new WeightedPolicy(),
    a = p.choose(g.observe(), g.legal()).action;
  assert.equal(a.type, "consume");
  g.act(a);
  assert.equal(g.s.mode, "reward");
});

test("Legacy overflow cannot interrupt or deadlock a pending enemy hit", () => {
  const g = base();
  for (let n = 0; n < 11; n++) g.addItem("healingSap");
  const b = g.s.battle;
  b.phase = "enemy";
  b.reaction = {
    damage: 2,
    element: "Arcane",
    stage: "ward",
    intercepted: [],
    column: 7,
    name: "saved hit",
  };
  assert.ok(g.legal().some((a) => a.type === "skipEquipment"));
  assert.ok(!g.legal().some((a) => a.type === "discardItem"));
  g.act(g.legal().find((a) => a.type === "skipEquipment"));
  assert.equal(g.s.hp, 68);
});
test("Normal Continue restores the whole battle checkpoint, including potion inventory and HP together", () => {
  const g = new Game(91);
  g.s.hp = 50;
  const x = g.addItem("healingSap");
  g.beginBattle([{ uid: 800, enemy: "beetle", restless: 0 }]);
  const startHp = g.s.hp;
  use(g, x);
  assert.equal(g.s.hp, startHp + 5);
  const h = new Game(0, g.save());
  assert.equal(h.s.hp, startHp);
  assert.ok(h.getItem(x.uid));
  assert.notEqual(h.s.battle.consumableTurn, h.s.battle.turn);
});
test("A full Satchel may consume legal healing to make room instead of discarding it", () => {
  const g = base();
  g.s.mode = "field";
  g.s.hp = 60;
  for (let n = 0; n < 11; n++) g.addItem("healingSap");
  use(g, g.s.inventory[0]);
  assert.equal(g.s.hp, 65);
  assert.equal(g.s.inventory.length, 10);
  assert.ok(g.legal().some((a) => a.type === "move"));
});
