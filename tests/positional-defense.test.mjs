import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
function setup() {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "enemy";
  b.jobs = [];
  return g;
}
function put(g, id, slot, value = 2) {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[slot] = [c];
  if (id === "ward") c.ward = value;
  if (id === "familiar") {
    c.hp = value;
    c.element = "Arcane";
  }
  if (id === "shield")
    g.s.battle.shields.push({
      uid: g.uid(),
      slot,
      owner: c.uid,
      block: value,
      element: "Arcane",
    });
  return c;
}
function hit(g, extra = {}) {
  g.s.battle.jobs.push({
    kind: "hit",
    damage: 20,
    element: "Arcane",
    source: 900,
    name: "Test",
    ...extra,
  });
  g.pump();
}
function act(g, type, slot) {
  const a = g
    .legal()
    .find((a) => a.type === type && (slot == null || a.slot === slot));
  assert.ok(a, `${type} ${slot}`);
  g.act(a);
}
const slots = (g) =>
  g
    .legal()
    .filter((a) => a.slot != null)
    .map((a) => a.slot)
    .sort((a, b) => a - b);
test("any defense type can be first; column five excludes six/seven but allows same column and left", () => {
  const g = setup();
  put(g, "shield", 4);
  put(g, "ward", 5);
  put(g, "familiar", 6);
  put(g, "ward", 11);
  put(g, "familiar", 2);
  hit(g);
  assert.deepEqual(slots(g), [2, 4, 5, 6, 11]);
  assert.equal(g.s.battle.grid[5][0].ward, 2);
  const stale = g.legal().find((a) => a.slot === 5);
  act(g, "block", 4);
  assert.deepEqual(slots(g), [2, 11]);
  assert.equal(g.s.battle.reaction.column, 4);
  assert.throws(() => g.act(stale), /legal|invalid/i);
  act(g, "ward", 11);
  assert.deepEqual(slots(g), [2]);
  act(g, "intercept", 2);
  assert.equal(g.s.hp, 56);
  assert.equal(g.s.battle.grid[5][0].ward, 2);
  assert.equal(g.s.battle.grid[6][0].hp, 2);
});
test("Ally then Shield then Ward is legal right-to-left; each hit resets its position", () => {
  const g = setup();
  put(g, "familiar", 6);
  put(g, "shield", 4);
  put(g, "ward", 2, 10);
  hit(g, { damage: 12 });
  act(g, "intercept", 6);
  act(g, "block", 4);
  act(g, "ward", 2);
  assert.equal(g.s.hp, 70);
  assert.equal(g.s.battle.grid[2][0].ward, 2);
  put(g, "ward", 6, 3);
  hit(g, { damage: 1 });
  assert.ok(slots(g).includes(6));
  act(g, "ward", 6);
  assert.equal(g.s.hp, 70);
});
test("equipment can be chosen first and closes the grid; Take hit preserves every unused defense", () => {
  const g = setup();
  put(g, "ward", 6);
  put(g, "shield", 4);
  put(g, "familiar", 2);
  g.s.battle.bracelets = [
    { uid: 999, block: 2, element: "Arcane", name: "Bracelet" },
    { uid: 998, block: 2, element: "Arcane", name: "Other" },
  ];
  hit(g, { damage: 8 });
  act(g, "bracelet");
  assert.deepEqual(slots(g), []);
  assert.equal(g.s.battle.reaction.column, -1);
  act(g, "skipEquipment");
  assert.equal(g.s.hp, 64);
  assert.equal(g.s.battle.grid[6][0].ward, 2);
  assert.equal(g.s.battle.shields[0].block, 2);
  assert.equal(g.s.battle.bracelets[1].block, 2);
  hit(g, { damage: 1 });
  act(g, "skipEquipment");
  assert.equal(g.s.hp, 63);
  assert.equal(g.s.battle.grid[2][0].hp, 2);
});
test("save/load preserves position, and previous-version lastNode infers the same restrictions", () => {
  const g = setup();
  put(g, "shield", 4);
  put(g, "ward", 6);
  put(g, "ward", 2);
  hit(g);
  act(g, "block", 4);
  for (const legacy of [false, true]) {
    const saved = structuredClone(g.s);
    if (legacy) {
      saved.version.rules = "1.3.24";
      delete saved.battle.reaction.column;
      saved.battle.reaction.stage = "shield";
    }
    const h = new Game(0, saved);
    assert.deepEqual(slots(h), [2]);
    act(h, "ward", 2);
    assert.equal(h.s.hp, 54);
  }
});
test("Pierce/Cull/status bypasses and reachable Taunt/weakest remain explicit exceptions", () => {
  for (const kind of ["pierce", "cull", "statusHit"]) {
    const g = setup();
    put(g, "ward", 6);
    put(g, "shield", 5);
    put(g, "familiar", 4);
    hit(g, { [kind]: true, damage: 1 });
    assert.deepEqual(slots(g), kind === "cull" ? [4] : []);
  }
  const g = setup();
  put(g, "ward", 6);
  put(g, "familiar", 4, 3).taunt = true;
  put(g, "shield", 5);
  hit(g, { damage: 6 });
  assert.equal(g.s.hp, 67);
  assert.equal(g.s.battle.grid[6][0].ward, 2);
  const h = setup();
  put(h, "familiar", 6, 2);
  put(h, "familiar", 4, 1);
  hit(h, { damage: 5, weakest: true });
  assert.equal(h.s.hp, 66);
  assert.equal(h.s.battle.grid[6][0].hp, 2);
});
test("mixed Shield portions stay independently selectable at the same location", () => {
  const g = setup();
  const c = put(g, "shield", 4);
  g.s.battle.shields.push({
    uid: 999,
    slot: 4,
    owner: c.uid,
    block: 3,
    element: "Fire",
  });
  put(g, "ward", 2);
  hit(g);
  assert.equal(g.legal().filter((a) => a.type === "block").length, 2);
  act(g, "block", 4);
  assert.equal(g.legal().filter((a) => a.type === "block").length, 1);
});
test("AI recognizes Wards and prefers the farther defender when absorption is equal", () => {
  const g = setup();
  put(g, "ward", 6);
  put(g, "ward", 2);
  hit(g, { damage: 2 });
  const decision = new WeightedPolicy().choose(g.observe(), g.legal());
  assert.equal(decision.action.type, "ward");
  assert.equal(decision.action.slot, 6);
});
