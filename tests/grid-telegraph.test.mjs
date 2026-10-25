import test from "node:test";
import assert from "node:assert/strict";
import { Game, gridTargets } from "../src/engine.mjs";
import { applyCorruptions } from "../src/corruptions.mjs";
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
for (const [cycle, expected] of [[5, [19, 4]]])
  test(`Apex destruction move ${cycle} removes its promised number of whole Constructs`, () => {
    const g = base("apex", cycle), b = g.s.battle;
    put(g, 4); put(g, 7); put(g, 19, 2);
    assert.deepEqual(g.observe().battle.telegraphs[0].targets, expected);
    const threatened = expected.flatMap(i => b.grid[i].map(c => c.uid)).sort();
    act(g, "activatePhase");
    act(g, "endTurn");
    assert.deepEqual(b.destroyed.map(c => c.uid).sort(), threatened);
    assert.equal(b.grid[7].length, 1);
    assert.equal(b.grid[19].length, 0);
  });
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

function fullestUnmake(cycle) {
  const g = base("apex", cycle), b = g.s.battle;
  g.s.hp = g.s.maxHp = 1000;
  for (const i of [0, 1, 2]) put(g, i);
  put(g, 24);
  const ward = g.instance(g.newCard("ward")); ward.ward = 40;
  b.grid[24].push(ward);
  b.grid[31] = [g.instance(g.newCard("ward"))];
  return g;
}

for (const [cycle, name, kind, targets] of [
  [3, "Unmake H", "row", [0, 1, 2]],
  [9, "Unmake V", "column", [24, 31]],
  [15, "Unmake H", "row", [0, 1, 2]],
]) test(`${name} cycle ${cycle} selects card count over value and destroys the entire warned line`, () => {
  const g = fullestUnmake(cycle), b = g.s.battle;
  const warning = g.observe().battle.telegraphs[0];
  assert.equal(warning.name, name);
  assert.equal(warning.kind, kind);
  assert.equal(warning.target, "fullest");
  assert.deepEqual(warning.targets, targets);
  assert.equal(warning.spaces.length, kind === "row" ? 7 : 6);
  const threatened = targets.flatMap(i => b.grid[i].map(c => c.uid)).sort();
  act(g, "activatePhase"); act(g, "endTurn");
  assert.deepEqual(b.destroyed.map(c => c.uid).sort(), threatened);
  assert.equal(b.grid[0].length, kind === "row" ? 0 : 1);
  assert.equal(b.grid[24].length, kind === "row" ? 2 : 0);
});

test("Unmake card-count ties use topmost row / leftmost column and empty boards threaten nothing", () => {
  const g = base("apex", 3), e = g.s.battle.enemies[0];
  for (const cycle of [3, 9]) {
    e.cycle = cycle;
    assert.deepEqual(g.gridTelegraphs()[0].targets, []);
  }
  put(g, 8); put(g, 24);
  for (const cycle of [3, 9]) {
    e.cycle = cycle;
    assert.deepEqual(g.gridTelegraphs()[0].targets, [8]);
  }
});

test("Unmake retargets after Recall, preserves its axis on Continue, and Purify does not advance alternation", () => {
  const g = fullestUnmake(9), e = g.s.battle.enemies[0];
  act(g, "recall", a => a.slot === 24);
  assert.deepEqual(g.gridTelegraphs()[0].targets, [0]);
  const h = new Game(0, JSON.parse(JSON.stringify(g.s)));
  assert.deepEqual(h.gridTelegraphs(), g.gridTelegraphs());
  e.purifyPending = true;
  assert.equal(g.tell(e).name, "Purify");
  act(g, "activatePhase"); act(g, "endTurn");
  assert.equal(e.cycle, 9);
  assert.equal(g.tell(e).name, "Unmake V");
});

test("Unmake preserves the warned fullest row when its own Insanity changes the board", () => {
  const g = fullestUnmake(3), b = g.s.battle;
  b.enemies[0].corruptionPlan = [{ slot: 24, kind: "insanity" }];
  const ids = [0, 1, 2].flatMap(i => b.grid[i].map(c => c.uid)).sort();
  act(g, "activatePhase"); act(g, "endTurn");
  assert.deepEqual(b.destroyed.map(c => c.uid).sort(), ids);
  assert.equal(b.grid[31].length, 1);
});

test("Continue finishes a legacy committed Unmake row even when the new cycle would be vertical", () => {
  const g = fullestUnmake(9), b = g.s.battle;
  b.phase = "enemy";
  b.jobs = [{ kind: "enemyAction", uid: b.enemies[0].uid,
    gridPlan: { grid: "row", targets: [24], spaces: [21,22,23,24,25,26,27] } }];
  const h = new Game(0, JSON.parse(JSON.stringify(g.s)));
  h.pump();
  assert.equal(h.s.battle.grid[24].length, 0);
  assert.equal(h.s.battle.grid[31].length, 1);
});

function nauseaWorldEater() {
  const g = base("apex", 5), b = g.s.battle;
  g.s.hp = g.s.maxHp = 1000;
  b.phase = "activate";
  b.grid[0] = [g.instance(g.newCard("grove"))];
  b.grid[0][0].used = 3;
  b.grid[0][0].hp = 1;
  b.grid[10] = [g.instance(g.newCard("prismaticSap"))];
  b.grid[35] = [g.instance(g.newCard("grove"))];
  b.grid[35][0].hp = 100;
  const shield = g.instance(g.newCard("shield"));
  shield.used = 2;
  b.grid[20] = [shield];
  b.shields = [{ uid: g.uid(), slot: 20, owner: shield.uid, block: 7, element: "Water" }];
  b.enemies[0].corruptionPlan = [{ slot: 9, kind: "nausea" }];
  return g;
}

test("World Eater honors committed targets when pending Nausea changes card values", () => {
  const g = nauseaWorldEater(), b = g.s.battle;
  assert.deepEqual(g.observe().battle.telegraphs[0].targets, [35, 10]);
  const changed = new Game(0, structuredClone(g.s));
  applyCorruptions(changed, changed.s.battle.enemies[0]);
  assert.deepEqual(gridTargets(changed.s.battle, changed.tell(changed.s.battle.enemies[0])), [35, 20]);
  const threatened = [b.grid[35][0].uid, b.grid[10][0].uid];
  act(g, "endTurn");
  assert.deepEqual(b.destroyed.map(c => c.uid), threatened);
  assert.equal(b.corruptions[9].kind, "nausea");
  assert.ok(g.legal().some(a => a.type === "block" && a.slot === 20));
});

test("Legacy queued destruction locks before applying its own Corruptions", () => {
  const g = nauseaWorldEater(), b = g.s.battle;
  b.phase = "enemy";
  b.jobs = [{ kind: "enemyAction", uid: b.enemies[0].uid }];
  g.pump();
  assert.equal(b.grid[0].length, 1);
  assert.equal(b.grid[10].length, 0);
  assert.equal(b.grid[20].length, 1);
});

test("End-of-turn expiry cannot redirect a committed row warning", () => {
  const g = base("hart", 2), b = g.s.battle;
  b.grid[0] = [g.instance(g.newCard("resonance"))];
  for (const i of [1, 7, 8]) put(g, i);
  assert.deepEqual(g.observe().battle.telegraphs[0].targets, [0, 1]);
  act(g, "activatePhase");
  act(g, "endTurn");
  assert.equal(b.grid[1].length, 0);
  assert.equal(b.grid[7].length, 1);
  assert.equal(b.grid[8].length, 1);
});

test("Two bosses do not redirect destruction when an earlier boss empties their shared targets", () => {
  const g = base("hart", 2), b = g.s.battle;
  b.enemies.push({ ...structuredClone(b.enemies[0]), id: "choir", uid: 901, cycle: 0 });
  for (const i of [0, 1, 7]) put(g, i);
  assert.deepEqual(g.observe().battle.telegraphs.map(t => t.targets), [[0, 1], [0, 1]]);
  act(g, "activatePhase");
  act(g, "endTurn");
  assert.equal(b.destroyed.length, 2);
  assert.equal(b.grid[7].length, 1);
});

test("Queued targets survive save/Continue and earlier defense spending", () => {
  const g = base("hart", 0), b = g.s.battle;
  g.s.hp = g.s.maxHp = 1000;
  b.enemies.push({ ...structuredClone(b.enemies[0]), id: "choir", uid: 901, cycle: 0 });
  const ward = g.instance(g.newCard("ward")); ward.ward = 2;
  b.grid[0] = [ward];
  b.grid[1] = [g.instance(g.newCard("prismaticSap"))];
  b.grid[2] = [g.instance(g.newCard("familiar"))];
  assert.deepEqual(g.observe().battle.telegraphs[0].targets, [0, 1]);
  act(g, "activatePhase"); act(g, "endTurn");
  assert.deepEqual(b.jobs.find(j => j.uid === 901).gridPlan.targets, [0, 1]);
  const resumed = new Game(0, JSON.parse(JSON.stringify(g.s)));
  for (const game of [g, resumed]) {
    act(game, "ward", a => a.slot === 0);
    while (game.s.battle.reaction) act(game, "skipEquipment");
    assert.equal(game.s.battle.grid[0].length, 0);
    assert.equal(game.s.battle.grid[1].length, 0);
    assert.equal(game.s.battle.grid[2].length, 1);
  }
  assert.deepEqual(resumed.s.battle.grid, g.s.battle.grid);
});

test("Collapse retains its warned column, empty-space damage and visual origins after another boss acts", () => {
  const g = base("hart", 2), b = g.s.battle;
  g.s.hp = g.s.maxHp = 1000;
  g.capturePresentation = true;
  b.enemies.push({ ...structuredClone(b.enemies[0]), id: "colossus", uid: 901, cycle: 2 });
  for (const i of [0, 1, 7]) put(g, i);
  const warning = g.observe().battle.telegraphs[1];
  assert.equal(warning.damage, 20);
  act(g, "activatePhase"); act(g, "endTurn");
  const incoming = g.presentation.find(e => e.kind === "incoming" && e.name === "Collapse");
  assert.equal(incoming.amount, 20);
  const effect = g.presentation.find(e => e.kind === "gridDestruction" && e.visual === "collapse");
  assert.deepEqual(effect.spaces, warning.spaces);
  assert.deepEqual(effect.empty, [14, 21, 28, 35]);
});
