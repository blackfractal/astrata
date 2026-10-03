import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const slots = (g) =>
  g.s.battle.grid.flatMap((s, i) =>
    s.some((c) => c.id === "rite") ? [i] : [],
  );
function setup(seed, n = 1) {
  const g = new Game(seed);
  for (let i = 0; i < n; i++) g.s.deck.push(g.newCard("rite"));
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  return g;
}
test("Opening Rite positions and following random state reproduce from the same seed", () => {
  const a = setup(74, 4),
    b = setup(74, 4);
  assert.deepEqual(a.s, b.s);
  assert.equal(slots(a).length, 4);
  assert.equal(a.s.battle.focus, 5);
  assert.ok(!a.s.battle.deck.some((c) => c.id === "rite"));
  assert.ok(!a.s.battle.hand.some((c) => c.id === "rite"));
  a.beginTurn();
  assert.equal(a.s.battle.focus, 1);
});
test("Opening Rite can occupy every space, including corners and interior, without collisions", () => {
  const covered = new Set();
  for (let seed = 1; seed <= 256; seed++) {
    const g = setup(seed, 4);
    const found = slots(g);
    assert.equal(found.length, 4);
    for (const i of found) covered.add(i);
  }
  assert.equal(covered.size, 42);
});
test("saved battles retain placed Rites rather than rerolling, including previous-version saves", () => {
  const g = setup(45, 3),
    save = g.save(),
    h = new Game(0, save);
  assert.deepEqual(slots(h), slots(g));
  assert.deepEqual(h.save(), save);
  const legacy = structuredClone(g.s);
  legacy.version.rules = "1.3.41";
  delete legacy.checkpoint;
  const rite = legacy.battle.grid.flat().filter((c) => c.id === "rite");
  legacy.battle.grid = legacy.battle.grid.map(() => []);
  rite.forEach((c, i) => (legacy.battle.grid[i] = [c]));
  const resumed = new Game(0, legacy);
  assert.deepEqual(slots(resumed), [0, 1, 2]);
  assert.equal(resumed.s.battle.focus, 4);
});
test("a full board of starting Rites never overlaps or crashes; excess copies remain drawable", () => {
  const g = setup(4, 43);
  assert.equal(slots(g).length, 42);
  assert.equal(g.s.battle.focus, 43);
  assert.equal(
    [...g.s.battle.deck, ...g.s.battle.hand].filter((c) => c.id === "rite")
      .length,
    1,
  );
});
