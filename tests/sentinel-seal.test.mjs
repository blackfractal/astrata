import test from "node:test";
import assert from "node:assert/strict";
import { Game, gridTargets } from "../src/engine.mjs";
import { enemies } from "../src/content.mjs";

function setup() {
  const g = new Game(10);
  g.beginBattle([{ uid: g.uid(), enemy: "sentinel", restless: 0 }]);
  const b = g.s.battle;
  b.grid.forEach((_, i) => { b.grid[i] = []; });
  const placed = [0, 1, 2, 3].map((i) => {
    const c = g.instance(g.newCard("blast"));
    c.placed = i;
    b.grid[i] = [c];
    return c;
  });
  return { g, b, placed, seal: enemies.sentinel.rotation.find((t) => t.name === "Seal") };
}

test("Seal skips spent and Locked cards, then locks the oldest eligible card", () => {
  const { g, b, placed, seal } = setup();
  placed[0].used = 2;
  placed[1].lock = true;
  assert.deepEqual(gridTargets(b, seal), [2]);
  g.gridAttack(seal);
  assert.equal(placed[0].lock, false);
  assert.equal(placed[2].lock, true);
  assert.deepEqual(gridTargets(b, seal), [3]);
});

test("Seal has no fallback when all placed cards are spent or Locked", () => {
  const { g, b, placed, seal } = setup();
  placed.forEach((c, i) => { if (i % 2) c.lock = true; else c.used = 2; });
  assert.deepEqual(gridTargets(b, seal), []);
  const before = structuredClone(b.grid);
  g.gridAttack(seal);
  assert.deepEqual(b.grid, before);
});

test("Seal counts bonus allowance and does not confuse this-turn use with spent", () => {
  const { b, placed, seal } = setup();
  placed[0].used = 2;
  placed[0].extraUses = 1;
  placed[0].lastActivatedTurn = b.turn;
  assert.deepEqual(gridTargets(b, seal), [0]);
});
