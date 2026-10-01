import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
test("first pair always lands two king-moves from the starting player, for every spawn type", () => {
  for (let seed = 1; seed <= 100; seed++) {
    const g = new Game(seed);
    g.beginRound();
    assert.equal(g.s.field.entities.length, 2);
    assert.equal(g.s.mode, "field");
    for (const e of g.s.field.entities)
      assert.equal(
        Math.max(Math.abs(e.x - g.s.field.x), Math.abs(e.y - g.s.field.y)),
        2,
      );
  }
});
test("all 16 opening locations are reachable relative to the player; both independent rolls may coincide", () => {
  const points = new Set();
  for (let i = 0; i < 16; i++) {
    const g = new Game(8);
    Object.assign(g.s.field, {
      x: 3,
      y: 6,
      queue: ["Item", "Event", "Gold", "Gold", "Gold", "Gold", "Gold", "Gold"],
    });
    g.batch = () => {}; // Isolate location sampling from spawn-type rejection rolls.
    g.rand = () => (i + 0.5) / 16;
    g.beginRound();
    const [a, b] = g.s.field.entities;
    assert.equal(a.x, b.x);
    assert.equal(a.y, b.y);
    assert.equal(Math.max(Math.abs(a.x - 3), Math.abs(a.y - 6)), 2);
    points.add(`${a.x},${a.y}`);
  }
  assert.equal(points.size, 16);
});
test("later pairs keep Location dice, the Archon stays centered, and old saves preserve existing spawns", () => {
  const g = new Game(8);
  g.resolveTile = () => {};
  Object.assign(g.s.field, {
    spawned: 2,
    round: 1,
    x: 5,
    y: 5,
    queue: ["Item", "Event", "Gold", "Gold", "Gold", "Gold", "Gold", "Gold"],
  });
  g.rand = () => 0.5;
  g.beginRound();
  assert.ok(g.s.field.entities.every((e) => e.x === 6 && e.y === 6));
  Object.assign(g.s.field, {
    spawned: 30,
    round: 15,
    entities: [],
    queue: ["Gold", "Archon"],
  });
  g.beginRound();
  const boss = g.s.field.entities.find((e) => e.type === "Archon");
  assert.equal(boss.x, 5);
  assert.equal(boss.y, 5);
  const old = structuredClone(g.s);
  old.version.rules = "1.3.29";
  assert.deepEqual(new Game(0, old).s.field.entities, old.field.entities);
});
