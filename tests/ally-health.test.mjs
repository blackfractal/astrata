import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
function setup() {
  const g = new Game(4);
  g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
  return g;
}
test("Uncapped Ally health scale still tracks passive growth and healing", () => {
  const g = setup(),
    b = g.s.battle,
    c = g.instance(g.newCard("grove"));
  b.grid[0] = [c];
  b.grid[1] = [g.instance(g.newCard("aqua"))];
  assert.equal(c.maxHp, 20);
  g.beginTurn();
  assert.equal(c.hp, 21);
  assert.equal(c.maxHp, 21);
  c.hp = 19;
  b.phase = "activate";
  g.applyCard(b.grid[1][0], 1, null, "Water", { cardTarget: 0 });
  assert.equal(c.hp, 23);
  assert.equal(c.maxHp, 23);
  c.hp = 2;
  assert.equal(c.maxHp, 23);
});

test("old Ally saves infer the visible HP scale without changing current HP", () => {
  const g = setup(),
    c = g.instance(g.newCard("sapling", true));
  c.hp = 3;
  delete c.maxHp;
  g.s.battle.grid[0] = [c];
  const loaded = new Game(0, structuredClone(g.s));
  assert.equal(loaded.s.battle.grid[0][0].hp, 3);
  assert.equal(loaded.s.battle.grid[0][0].maxHp, 10);
});
