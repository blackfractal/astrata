import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
function base(armor) {
  const g = new Game(8);
  g.s.equipment = {};
  if (armor) g.s.equipment.torso = g.addItem(armor).uid;
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "enemy";
  b.jobs = [];
  b.bracelets = [
    { uid: 901, name: "First", block: 2, element: "Arcane" },
    { uid: 902, name: "Second", block: 3, element: "Arcane" },
  ];
  return g;
}
function hit(g, damage = 6, extra = {}) {
  g.s.battle.jobs = [
    {
      kind: "hit",
      source: 900,
      name: "Test hit",
      damage,
      element: "Arcane",
      ...extra,
    },
  ];
  g.pump();
}
const act = (g, type) => g.act(g.legal().find((a) => a.type === type));
test("Skip item block preserves both portions, damages HP, and can block the next hit", () => {
  const g = base(),
    b = g.s.battle,
    hp = g.s.hp;
  hit(g);
  assert.equal(b.reaction.stage, "bracelet");
  act(g, "skipEquipment");
  assert.equal(g.s.hp, hp - 6);
  assert.deepEqual(
    b.bracelets.map((x) => x.block),
    [2, 3],
  );
  assert.equal(b.reaction, null);
  assert.ok(!g.legal().some((a) => a.type === "skipEquipment"));
  hit(g, 2);
  act(g, "bracelet");
  assert.equal(g.s.hp, hp - 6);
  assert.deepEqual(
    b.bracelets.map((x) => x.block),
    [0, 3],
  );
});
test("Can block partially then skip the other item; ordinary armor still reduces damage", () => {
  const g = base("curseArmor"),
    b = g.s.battle,
    hp = g.s.hp;
  hit(g);
  act(g, "bracelet");
  assert.equal(b.reaction.damage, 4);
  act(g, "skipEquipment");
  assert.equal(g.s.hp, hp - 2);
  assert.deepEqual(
    b.bracelets.map((x) => x.block),
    [0, 3],
  );
});
test("Skipping is per hit, survives save/load, and still applies on-hit statuses", () => {
  const g = base();
  hit(g, 3, { burn: 2 });
  g.s.battle.jobs.push({
    kind: "hit",
    source: 900,
    name: "Second hit",
    damage: 4,
    element: "Arcane",
  });
  const saved = structuredClone(g.s);
  saved.version.rules = "1.3.21";
  const h = new Game(0, saved),
    hp = h.s.hp;
  act(h, "skipEquipment");
  assert.equal(h.s.hp, hp - 3);
  assert.equal(h.s.status.burn, 2);
  assert.equal(h.s.battle.reaction.name, "Second hit");
  assert.equal(h.s.battle.reaction.stage, "bracelet");
  act(h, "bracelet");
  act(h, "bracelet");
  assert.equal(h.s.hp, hp - 3);
  assert.deepEqual(
    saved.battle.bracelets.map((x) => x.block),
    [2, 3],
  );
});
test("Skip can be lethal and AI still prefers usable block", () => {
  const g = base();
  g.s.hp = 1;
  hit(g, 6);
  const p = new WeightedPolicy();
  assert.equal(p.choose(g.observe(), g.legal()).action.type, "bracelet");
  act(g, "skipEquipment");
  assert.equal(g.s.hp, 0);
  assert.equal(g.s.mode, "result");
  assert.equal(g.s.outcome, "loss");
});
