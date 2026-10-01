import test from "node:test";
import assert from "node:assert/strict";
import { Game, gridTargets } from "../src/engine.mjs";
function base(id, cycle) {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: id, restless: 0 }]);
  const b = g.s.battle;
  b.phase = "place";
  b.hand = [];
  b.focus = 10;
  b.enemies[0].cycle = cycle;
  return g;
}
function put(g, i, n = 1) {
  g.s.battle.grid[i] = Array.from({ length: n }, () =>
    g.instance(g.newCard("blast")),
  );
}
function act(g, type, predicate = () => true) {
  const a = g.legal().find((a) => a.type === type && predicate(a));
  assert.ok(a, type);
  g.act(a);
}
for (const [id, cycle, occupied, initial, after] of [
  ["hart", 2, [0, 1, 7, 8], [0, 1], [7, 8]],
  ["colossus", 2, [0, 1, 7, 8], [0, 7], [1, 8]],
  ["choir", 0, [0, 1, 7, 8], [0, 1], [8, 1]],
])
  test(`${id} preview breaks ties deterministically, retargets after Recall, and matches actual destruction`, () => {
    const g = base(id, cycle),
      b = g.s.battle;
    for (const i of occupied) put(g, i);
    assert.deepEqual(g.observe().battle.telegraphs[0].targets, initial);
    act(g, "recall", (a) => a.slot === 0);
    const preview = g.observe().battle.telegraphs[0];
    assert.deepEqual(preview.targets, after);
    const threatened = preview.targets
      .flatMap((i) => b.grid[i].map((c) => c.uid))
      .sort();
    act(g, "activatePhase");
    assert.deepEqual(g.observe().battle.telegraphs[0].targets, after);
    act(g, "endTurn");
    assert.deepEqual(b.destroyed.map((c) => c.uid).sort(), threatened);
    assert.deepEqual(g.observe().battle.telegraphs, []);
  });
test("Line previews count covered cards and outline empty cells along the threatened line", () => {
  const g = base("hart", 2);
  put(g, 0);
  put(g, 1);
  put(g, 7, 3);
  let t = g.observe().battle.telegraphs[0];
  assert.deepEqual(t.targets, [7]);
  assert.deepEqual(t.spaces, [7, 8, 9, 10, 11, 12, 13]);
  assert.equal(t.cards, 3);
  g.s.battle.enemies[0].id = "colossus";
  t = g.observe().battle.telegraphs[0];
  assert.deepEqual(t.targets, [0, 7]);
  assert.deepEqual(t.spaces, [0, 7, 14, 21, 28, 35]);
  assert.equal(t.cards, 4);
});
test("Choir counts covered combat value and selects two distinct stacks with reading-order ties", () => {
  const g = base("choir", 0);
  put(g, 4);
  put(g, 7);
  put(g, 19, 2);
  assert.deepEqual(g.observe().battle.telegraphs[0].targets, [19, 4]);
  put(g, 4, 2);
  assert.deepEqual(g.observe().battle.telegraphs[0].targets, [4, 19]);
});
test("Empty board, normal moves, enemy resolution and reaction windows have no danger markings", () => {
  const g = base("hart", 2),
    b = g.s.battle;
  assert.deepEqual(g.observe().battle.telegraphs[0].spaces, []);
  assert.equal(g.observe().battle.telegraphs[0].cards, 0);
  put(g, 0);
  b.enemies[0].cycle = 0;
  assert.deepEqual(g.observe().battle.telegraphs, []);
  b.enemies[0].cycle = 2;
  b.phase = "enemy";
  assert.deepEqual(g.observe().battle.telegraphs, []);
  b.phase = "activate";
  b.reaction = { name: "hit" };
  assert.deepEqual(g.observe().battle.telegraphs, []);
});
test("Multiple bosses have independent live forecasts; observations do not mutate state or RNG", () => {
  const g = base("hart", 2),
    b = g.s.battle;
  b.enemies.push({
    ...structuredClone(b.enemies[0]),
    id: "choir",
    uid: 901,
    cycle: 0,
  });
  put(g, 0);
  put(g, 6, 2);
  const state = structuredClone(g.s);
  assert.equal(g.observe().battle.telegraphs.length, 2);
  assert.equal(g.observe().battle.telegraphs.length, 2);
  assert.deepEqual(g.s, state);
  const h = new Game(0, g.s);
  assert.deepEqual(
    h.observe().battle.telegraphs,
    g.observe().battle.telegraphs,
  );
});
test("Shared targeting retains other grid effects' newest and connected tie rules", () => {
  const g = base("choir", 2),
    b = g.s.battle;
  put(g, 0);
  put(g, 1);
  put(g, 7);
  assert.deepEqual(gridTargets(b, { target: "newest" }), [7]);
  assert.deepEqual(gridTargets(b, { target: "connected" }), [0]);
  b.grid[0][0].sever = true;
  assert.deepEqual(gridTargets(b, { target: "connected" }), [0]); // all three isolated, reading-order tie
});

test("Choir prioritizes defense over height, excludes spent output, and handles fewer than two stacks", () => {
  const g = base("choir", 0),
    b = g.s.battle;
  b.grid[0] = [
    g.instance(g.newCard("clear")),
    g.instance(g.newCard("clear")),
    g.instance(g.newCard("clear")),
  ];
  b.grid[1] = [g.instance(g.newCard("shield"))];
  b.grid[7] = [g.instance(g.newCard("ward"))];
  b.grid[8] = [g.instance(g.newCard("shield"))];
  b.grid[1][0].used = 2;
  const tell = g.tell(b.enemies[0]);
  assert.deepEqual(gridTargets(b, tell), [7, 8]);
  const targets = gridTargets(b, tell).flatMap((i) =>
    b.grid[i].map((c) => c.uid),
  );
  g.gridAttack(tell);
  assert.deepEqual(
    b.destroyed.map((c) => c.uid),
    targets,
  );
  b.grid[0] = [];
  assert.deepEqual(gridTargets(b, tell), [1]);
  b.grid[1] = [];
  assert.deepEqual(gridTargets(b, tell), []);
});
