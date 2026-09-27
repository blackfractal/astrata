import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
function setup() {
  const g = new Game(4);
  g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
  return g;
}
test("Ally health scale tracks upgrades, growth and healing without capping HP", () => {
  const g = setup(),
    b = g.s.battle,
    c = g.instance(g.newCard("sapling", true));
  assert.equal(c.maxHp, 7);
  b.grid[0] = [c];
  b.grid[1] = [g.instance(g.newCard("aqua"))];
  g.beginTurn();
  assert.equal(c.hp, 8);
  assert.equal(c.maxHp, 8);
  c.hp = 3;
  b.phase = "activate";
  g.applyCard(b.grid[1][0], 1, null, "Water", { cardTarget: 0 });
  assert.equal(c.hp, 7);
  assert.equal(c.maxHp, 8);
  g.beginTurn();
  b.phase = "activate";
  b.grid[1][0].used = 0;
  g.applyCard(b.grid[1][0], 1, null, "Water", { cardTarget: 0 });
  assert.equal(c.hp, 12);
  assert.equal(c.maxHp, 12);
  c.hp = 2;
  assert.equal(c.maxHp, 12);
});
test("old Ally saves infer the visible HP scale without changing current HP", () => {
  const g = setup(),
    c = g.instance(g.newCard("sapling", true));
  c.hp = 3;
  delete c.maxHp;
  g.s.battle.grid[0] = [c];
  const loaded = new Game(0, structuredClone(g.s));
  assert.equal(loaded.s.battle.grid[0][0].hp, 3);
  assert.equal(loaded.s.battle.grid[0][0].maxHp, 7);
});
