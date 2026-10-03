import test from "node:test";
import assert from "node:assert/strict";
import { Game, blockHit } from "../src/engine.mjs";
function setup() {
  const g = new Game(3);
  g.s.inventory = [];
  for (const k of Object.keys(g.s.equipment)) g.s.equipment[k] = null;
  g.beginBattle([{ uid: g.uid(), enemy: "beetle", restless: 0 }]);
  return g;
}
function put(g, id, slot) {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[slot].push(c);
  return c;
}
test("a row of three matching Blasts or Shields has +1/+2/+1, with symmetric pair bonuses", () => {
  for (const id of ["blast", "shield"]) {
    const g = setup();
    const cs = [0, 1, 2].map((i) => put(g, id, i));
    const power = id === "blast" ? "cardPower" : "shieldPower";
    assert.deepEqual(
      cs.map((c, i) => g[power](c, i)),
      [5, 6, 5],
    );
    g.s.battle.grid[2] = [];
    assert.equal(g[power](cs[0], 0), 5);
    assert.equal(g[power](cs[1], 1), 5);
  }
});
test("matching bonuses exclude diagonals, row wrapping, covered cards, and Sever but include exposed spent neighbors", () => {
  const g = setup(),
    a = put(g, "blast", 6);
  put(g, "blast", 7);
  put(g, "blast", 12);
  assert.equal(g.cardPower(a, 6), 4);
  const b = put(g, "blast", 13);
  b.used = 2;
  assert.equal(g.cardPower(a, 6), 5);
  b.sever = true;
  assert.equal(g.cardPower(a, 6), 4);
  b.sever = false;
  put(g, "heat", 13);
  assert.equal(g.cardPower(a, 6), 4);
  put(g, "heat", 6);
  assert.equal(g.matchingNeighbors(a, 6), 0);
});
test("matching Blast damage is included before elemental multipliers and reflected in legal actions", () => {
  const g = setup(),
    b = g.s.battle,
    a = put(g, "blast", 0);
  put(g, "blast", 1);
  b.phase = "activate";
  assert.equal(
    g.legal().find((x) => x.type === "activate" && x.slot === 0).effects.damage,
    5,
  );
  const enemy = b.enemies[0];
  g.applyCard(a, 0, enemy.uid, "Fire", {}, {});
  assert.equal(enemy.hp, 13);
});
test("Shield previews and stored block include adjacency at activation time, with ordinary attuned defense", () => {
  const g = setup(),
    b = g.s.battle,
    a = put(g, "shield", 0);
  put(g, "shield", 1);
  b.phase = "activate";
  assert.equal(
    g.legal().find((x) => x.type === "activate" && x.slot === 0).effects.shield,
    5,
  );
  g.applyCard(a, 0, null, "Fire", {}, {});
  assert.equal(b.shields[0].block, 5);
  b.grid[1] = [];
  assert.equal(g.shieldPower(a, 0), 4);
  assert.equal(b.shields[0].block, 5);
  assert.equal(blockHit(b.shields[0].block, "Fire", 10, "Earth").remaining, 2);
});
