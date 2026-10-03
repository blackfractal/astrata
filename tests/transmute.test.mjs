import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
function setup(id = "blast") {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 20;
  for (const [name, i] of [
    ["transmute", 9],
    [id, 6],
    ["thorn", 5],
  ])
    b.grid[i] = [g.instance(g.newCard(name))];
  b.grid[5][0].element = "Fire";
  b.enemies[0].element = "Fire";
  b.enemies[0].hp = b.enemies[0].maxHp = 100;
  return g;
}
const act = (g, slot, extra = {}) => {
  const a = g
    .legal()
    .find(
      (a) =>
        a.type === "activate" &&
        a.slot === slot &&
        Object.entries(extra).every(([k, v]) => a[k] === v),
    );
  assert.ok(a);
  g.act(a);
};
test("Transmute overrides Blast Attune and deals Water weakness damage despite a Fire neighbor", () => {
  const g = setup();
  act(g, 9, { cardTarget: 6, newElement: "Water" });
  assert.equal(g.s.battle.grid[6][0].element, "Water");
  assert.deepEqual(
    [
      ...new Set(
        g
          .legal()
          .filter((a) => a.type === "activate" && a.slot === 6)
          .map((a) => a.element),
      ),
    ],
    ["Water"],
  );
  act(g, 6);
  assert.equal(g.s.battle.enemies[0].hp, 94);
});
test("Transmuted Shield creates Water block without changing an existing Fire portion", () => {
  const g = setup("shield");
  act(g, 6, { element: "Fire" });
  assert.equal(g.s.battle.shields[0].element, "Fire");
  act(g, 9, { cardTarget: 6, newElement: "Water" });
  g.s.battle.turn++;
  act(g, 6);
  assert.deepEqual(
    g.s.battle.shields.map((p) => p.element),
    ["Fire", "Water"],
  );
});
test("Transmute persists across live state reload, supports explicit Arcane, and resets on fresh placement", () => {
  const g = setup();
  act(g, 9, { cardTarget: 6, newElement: "Water" });
  const h = new Game(0, JSON.parse(JSON.stringify(g.s)));
  assert.equal(
    h.legal().find((a) => a.type === "activate" && a.slot === 6).element,
    "Water",
  );
  h.s.battle.turn++;
  act(h, 9, { cardTarget: 6, newElement: "Arcane" });
  assert.equal(
    h.legal().find((a) => a.type === "activate" && a.slot === 6).element,
    "Arcane",
  );
  h.s.battle.grid[6] = [h.instance(h.s.battle.grid[6][0])];
  assert.equal(
    h
      .legal()
      .find(
        (a) => a.type === "activate" && a.slot === 6 && a.element === "Fire",
      ).element,
    "Fire",
  );
});
test("Legacy changed-element cards activate with their existing element", () => {
  const g = setup();
  g.s.battle.grid[6][0].element = "Water";
  delete g.s.battle.grid[6][0].transmuted;
  act(g, 6);
  assert.equal(g.s.battle.enemies[0].hp, 94);
});
