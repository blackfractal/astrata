import test from "node:test";
import assert from "node:assert/strict";
import { Game, allyHit } from "../src/engine.mjs";
function setup(elements, damage = 6, attack = "Fire") {
  const g = new Game(19);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "firewolf", restless: 0 }]);
  const b = g.s.battle;
  b.jobs = [];
  elements.forEach(([element, hp, id = "familiar"], i) => {
    const c = g.instance(g.newCard(id));
    c.element = element;
    c.hp = hp;
    b.grid[i * 7] = [c];
  });
  b.reaction = {
    damage,
    element: attack,
    stage: "ally",
    intercepted: [],
    name: "Spillover fixture",
    source: 900,
  };
  return g;
}
test("weakness bonus is absorbed first and never becomes player damage", () => {
  const g = setup([["Earth", 2]]);
  g.intercept(0);
  assert.equal(g.s.hp, 64);
  assert.equal(g.s.battle.destroyed.length, 1);
  const h = setup([["Earth", 4]]);
  h.intercept(0);
  assert.equal(h.s.hp, 65);
});
test("successive weak Allies share only the remaining weakness bonus, including after save/load", () => {
  let g = setup([
    ["Earth", 2],
    ["Earth", 2],
  ]);
  g.intercept(0);
  assert.equal(g.s.battle.reaction.damage, 6);
  assert.equal(g.s.battle.reaction.weaknessBonus, 1);
  g = new Game(0, g.s);
  g.intercept(7);
  assert.equal(g.s.hp, 65);
  const h = setup([
    ["Earth", 3],
    ["Earth", 2],
  ]);
  h.intercept(0);
  assert.equal(h.s.battle.reaction.weaknessBonus, 0);
  h.intercept(7);
  assert.equal(h.s.hp, 66);
});
test("weak to resistant drops the old bonus and converts resistance overflow back to base", () => {
  const g = setup([
    ["Earth", 2],
    ["Water", 2],
  ]);
  g.intercept(0);
  g.intercept(7);
  assert.equal(g.s.hp, 68);
  const h = setup([
    ["Earth", 2],
    ["Wind", 2],
  ]);
  h.intercept(0);
  h.intercept(7);
  assert.equal(h.s.hp, 66);
});
test("resistant to weak applies the new weakness to remaining base only", () => {
  const g = setup([
    ["Water", 2],
    ["Earth", 2],
  ]);
  g.intercept(0);
  assert.equal(g.s.battle.reaction.damage, 2);
  assert.equal(g.s.battle.reaction.weaknessBonus, 0);
  g.intercept(7);
  assert.equal(g.s.hp, 69);
});
test("odd damage resistance rounds locally and never increases the incoming base", () => {
  for (let base = 1; base <= 25; base++)
    for (let hp = 1; hp <= 20; hp++) {
      const hit = allyHit({ damage: base, element: "Fire" }, "Water", hp);
      assert.equal(hit.damage, Math.ceil(base / 2));
      assert.equal(
        hit.remaining,
        Math.min(base, 2 * Math.max(0, Math.ceil(base / 2) - hp)),
      );
      assert.ok(hit.remaining <= base);
    }
  const g = setup([["Water", 2]], 5);
  g.intercept(0);
  assert.equal(g.s.hp, 68);
});
test("surviving Allies and Guardian swallow finish the hit, Chaos/Light remain mutually weak", () => {
  const g = setup([["Earth", 10]]);
  g.intercept(0);
  assert.equal(g.s.battle.grid[0][0].hp, 1);
  assert.equal(g.s.hp, 70);
  const h = setup([["Earth", 2, "guardian"]]);
  h.intercept(0);
  assert.equal(h.s.hp, 70);
  for (const [attack, defender] of [
    ["Chaos", "Light"],
    ["Light", "Chaos"],
  ]) {
    const k = setup([[defender, 2]], 6, attack);
    k.intercept(0);
    assert.equal(k.s.hp, 64);
  }
});
test("leftover bonus is discarded before equipment, while Bracelet and Armor still apply", () => {
  const g = setup([["Earth", 2]]);
  g.addItem("fireArmor");
  g.s.equipment.torso = g.s.inventory.at(-1).uid;
  g.s.battle.bracelets = [
    { uid: 1000, block: 2, element: "Arcane", name: "Test Bracelet" },
  ];
  g.intercept(0);
  assert.equal(g.s.battle.reaction.stage, "bracelet");
  assert.equal(g.s.battle.reaction.weaknessBonus, 0);
  g.act(g.legal().find((a) => a.type === "bracelet"));
  assert.equal(g.s.hp, 68);
});
test("each hit gets fresh weakness and automatic Taunt uses the same handoff calculation", () => {
  const g = setup([
    ["Earth", 2],
    ["Water", 2],
  ]);
  g.s.battle.grid[0][0].taunt = true;
  g.advanceHit();
  assert.equal(g.s.battle.reaction.damage, 6);
  g.intercept(7);
  assert.equal(g.s.hp, 68);
  const b = g.s.battle,
    c = g.instance(g.newCard("familiar"));
  c.element = "Earth";
  c.hp = 2;
  b.grid[0] = [c];
  b.reaction = {
    damage: 6,
    element: "Fire",
    stage: "ally",
    intercepted: [],
    name: "Second hit",
  };
  g.intercept(0);
  assert.equal(g.s.hp, 62);
});
