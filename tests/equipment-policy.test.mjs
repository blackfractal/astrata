import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
import { items } from "../src/content.mjs";

const policy = new WeightedPolicy();
function field() {
  const g = new Game(123);
  g.s.mode = "field";
  g.s.field.stage = "player";
  g.s.field.entities = [];
  return g;
}
function own(g, id, gem = null) {
  const x = { uid: g.uid(), id, gem };
  g.s.inventory.push(x);
  return x;
}
function choose(g) {
  return policy.choose(g.observe(), g.legal()).action;
}

test("every current beneficial wearable is equipped into an empty slot before moving", () => {
  for (const d of Object.values(items).filter(
    (d) => d.slot !== "gem" && !d.cursed,
  )) {
    const g = field();
    g.s.inventory = [];
    for (const slot in g.s.equipment) g.s.equipment[slot] = null;
    const x = own(g, d.id);
    const a = choose(g);
    assert.equal(a.type, "equip", d.name);
    assert.equal(a.item, x.uid, d.name);
    g.act(a);
    assert.ok(Object.values(g.s.equipment).includes(x.uid));
    assert.notEqual(
      choose(g).type,
      "equip",
      "do not shuffle equipped gear between slots",
    );
  }
});

test("Mirror Armor and helmet are both equipped in Tavern before leaving", () => {
  const g = field();
  g.openTavern();
  g.s.gold = 0;
  const armor = own(g, "mirrorArmor"),
    helmet = own(g, "crown");
  for (let i = 0; i < 2; i++) {
    const a = choose(g);
    assert.equal(a.type, "equip");
    g.act(a);
  }
  assert.equal(g.s.equipment.torso, armor.uid);
  assert.equal(g.s.equipment.head, helmet.uid);
  g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
  assert.equal(g.bonuses().shield, 2);
  assert.ok(g.equipped().some((x) => x.definition.effect.reflect));
});

test("do not prefer cursed gear or overlook a socket when comparing occupied slots", () => {
  const g = field();
  for (const id of ["curseRing", "curseArmor", "curseNeck"]) {
    const x = own(g, id);
    for (const a of g
      .legal()
      .filter((a) => a.type === "equip" && a.item === x.uid))
      assert.ok(policy.score(g.observe(), a)[0] < 0, id);
  }
  // Two occupied wrists: replacing either gemmed Bronze with bare Silver loses Channel.
  g.s.inventory = [];
  for (const slot in g.s.equipment) g.s.equipment[slot] = null;
  for (const slot of ["wrist1", "wrist2"]) {
    const gem = own(g, "channelGem"),
      bracelet = own(g, "bronze", gem.uid);
    g.s.equipment[slot] = bracelet.uid;
  }
  const silver = own(g, "silver");
  const choices = g
    .legal()
    .filter((a) => a.type === "equip" && a.item === silver.uid);
  assert.equal(choices.length, 2);
  for (const a of choices) assert.ok(policy.score(g.observe(), a)[0] < 0);
});

test("recall and Dew synergy count; shield bonus depends on owning Shields", () => {
  const g = field(),
    gem = own(g, "sapphire"),
    neck = own(g, "dewNeck");
  const o = g.observe();
  assert.ok(policy.gearValue(items.recallGem.effect, o) > 0);
  assert.ok(
    policy.itemValue({ ...neck, gem: gem.uid }, o) > policy.itemValue(neck, o),
  );
  assert.ok(policy.itemValue({ id: "crown" }, o) > 0);
  o.deck = o.deck.filter((c) => c.id !== "shield");
  assert.equal(policy.itemValue({ id: "crown" }, o), 0);
  assert.ok(
    policy.gearValue({ damage: 2 }) >
      policy.gearValue({ damage: 2, firstAttackOnly: true }),
  );
  assert.ok(policy.gearValue({ movement: -1 }) < 0);
});

test("socketing an owned cursed Garnet suppresses its Poison rather than adding a new curse penalty", () => {
  const g = field();
  g.openTavern();
  const garnet = own(g, "curseGem");
  const a = g.legal().find((a) => a.type === "socket" && a.gem === garnet.uid);
  assert.ok(a);
  assert.ok(policy.score(g.observe(), a)[0] > 0);
  g.act(a);
  g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
  assert.equal(g.s.status.poison, 0);
});

test("unknown effects and choices remain legal fallbacks without mutating observation", () => {
  const g = field(),
    o = g.observe(),
    before = JSON.stringify(o);
  const a = {
    type: "futureEquipmentAction",
    effects: { novel: true },
    costs: {},
  };
  assert.equal(policy.choose(o, [a]).action, a);
  assert.ok(Number.isFinite(policy.gearValue({ novel: true }, o)));
  assert.equal(JSON.stringify(o), before);
});
