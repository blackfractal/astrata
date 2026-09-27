import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";

function setup(specs) {
  const g = new Game(9);
  g.s.mode = "field";
  Object.assign(g.s.field, {
    round: 17,
    spawned: 32,
    queue: [],
    x: 5,
    y: 5,
    moves: 2,
    stage: "player",
    entities: specs.map(([enemy, x, y, restless = 0], i) => ({
      uid: 900 + i,
      enemy,
      x,
      y,
      restless,
      born: 1,
      count: 1,
    })),
  });
  g.capturePresentation = true;
  return g;
}

test("a Restless Bat stops at first contact while subsequent enemies finish before one battle", () => {
  const g = setup([
    ["bat", 4, 5, 3],
    ["bat", 0, 0],
    ["imp", 8, 5],
  ]);
  let roll = 0;
  g.rand = () => [0.9, 0.5][roll++ % 2];
  g.endMovement();
  assert.deepEqual(
    g.s.field.entities.map((e) => [e.x, e.y]),
    [
      [5, 5],
      [2, 0],
      [5, 5],
    ],
  );
  assert.deepEqual(
    g.s.battle.enemies.map((e) => e.entityUid),
    [900, 902],
  );
  const moves = g.presentation.filter((e) => e.kind === "move");
  assert.equal(moves.filter((e) => e.uid === 900).length, 1);
  assert.ok(moves.every((e) => e.state.mode === "field"));
  assert.equal(g.presentation.at(-1).kind, "reveal");
  assert.equal(moves.at(-1).uid, 902);
  assert.ok(
    moves.slice(1).every((frame) => {
      const bat = frame.state.field.entities.find((e) => e.uid === 900);
      return bat.x === 5 && bat.y === 5;
    }),
  );
});

test("Pack arrivals remain on the player through later pack triggers and their normal moves", () => {
  const g = setup([
    ["wolf", 4, 5],
    ["firewolf", 3, 5],
    ["undead", 0, 5],
    ["bat", 0, 0],
  ]);
  let roll = 0;
  g.rand = () => [0.9, 0.5][roll++ % 2];
  g.endMovement();
  assert.deepEqual(
    g.s.battle.enemies.map((e) => e.entityUid),
    [900, 901, 902],
  );
  const moves = g.presentation.filter((e) => e.kind === "move");
  assert.deepEqual(
    [900, 901, 902].map((uid) => moves.filter((e) => e.uid === uid).length),
    [1, 2, 5],
  );
  assert.equal(moves.at(-1).uid, 903);
  for (const uid of [900, 901, 902]) {
    const arrival = moves.findIndex(
      (e) => e.uid === uid && e.to.x === 5 && e.to.y === 5,
    );
    assert.ok(arrival >= 0);
    assert.ok(moves.slice(arrival + 1).every((e) => e.uid !== uid));
  }
});

test("diagonal contact also stops a Wanderer and presentation capture leaves rules unchanged", () => {
  const a = setup([["bat", 4, 4, 2]]),
    b = setup([["bat", 4, 4, 2]]);
  a.capturePresentation = false;
  for (const g of [a, b]) {
    g.rand = () => 0.9;
    g.endMovement();
  }
  assert.deepEqual(a.s, b.s);
  assert.equal(b.presentation.filter((e) => e.kind === "move").length, 1);
  assert.equal(b.s.mode, "battle");
});

test("rules 1.3.2 saves load with the stop-on-player rule", () => {
  const old = setup([["bat", 4, 5]]).save();
  old.version = { ...old.version, rules: "1.3.2" };
  const g = new Game(0, old);
  let roll = 0;
  g.rand = () => [0.9, 0.5][roll++ % 2];
  g.endMovement();
  assert.equal(g.s.mode, "battle");
  assert.equal(g.s.field.entities[0].x, 5);
});
