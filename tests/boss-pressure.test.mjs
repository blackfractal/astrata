import test from "node:test";
import assert from "node:assert/strict";
import { Game, gridTargets } from "../src/engine.mjs";
import { MIND_COLUMNS, MIND_ROWS } from "../src/content.mjs";
function setup(id, cycle) {
  const g = new Game(84);
  g.s.equipment = {};
  g.s.hp = g.s.maxHp = 999;
  g.beginBattle([{ uid: 900, enemy: id, restless: 0 }]);
  const b = g.s.battle;
  b.grid = b.grid.map(() => []);
  b.phase = "activate";
  b.enemies[0].cycle = cycle;
  g.capturePresentation = true;
  return g;
}
function put(g, id, slot) {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[slot].push(c);
  return c;
}
function run(g) {
  const b = g.s.battle;
  b.phase = "enemy";
  b.jobs = [{ kind: "enemyAction", uid: 900 }];
  g.pump();
}
function pass(g) {
  const frames = [...(g.presentation || [])];
  while (g.s.battle.reaction) {
    const a = g.legal().find((a) => a.type === "skipEquipment");
    assert.ok(a);
    g.act(a);
    frames.push(...(g.presentation || []));
  }
  return frames;
}
test("Collapse counts empty spaces, not missing cards, snapshots before destruction, and removes defenses before impact", () => {
  const g = setup("colossus", 2),
    b = g.s.battle;
  const ward = put(g, "ward", 3);
  ward.ward = 20;
  const shield = put(g, "shield", 10);
  put(g, "blast", 10);
  put(g, "familiar", 17);
  // An exposed Shield in the doomed column has active block; another safe Ward remains.
  b.grid[10].reverse();
  b.shields = [
    { uid: 800, slot: 10, owner: shield.uid, block: 20, element: "Arcane" },
  ];
  put(g, "ward", 2).ward = 1;
  let t = g.tell(b.enemies[0]);
  assert.equal(t.emptySpaces, 3);
  assert.equal(t.damage, 15);
  assert.equal(g.observe().battle.telegraphs[0].damage, 15);
  run(g);
  assert.equal(b.reaction.damage, 15);
  assert.equal(b.reaction.element, "Arcane");
  assert.equal(b.destroyed.length, 4);
  assert.deepEqual(
    g.defenseChoices().wards.map((x) => x.i),
    [2],
  );
  assert.equal(g.defenseChoices().shields.length, 0);
  assert.equal(g.defenseChoices().allies.length, 0);
  const incoming = g.presentation.findIndex((f) => f.kind === "incoming");
  assert.ok(incoming > 0);
  const collapse = g.presentation
    .slice(0, incoming)
    .find((f) => f.kind === "gridDestruction");
  assert.deepEqual(collapse.targets, [3, 10, 17]);
  assert.deepEqual(collapse.empty, [24, 31, 38]);
  assert.ok(collapse.state.battle.grid[3].length === 0);
  const h = new Game(0, g.s);
  pass(g);
  pass(h);
  assert.equal(g.s.hp, 984);
  assert.equal(h.s.hp, g.s.hp);
  assert.deepEqual(h.s.battle.grid, g.s.battle.grid);
});
test("Collapse live preview retargets, handles full/empty columns and uses no randomness", () => {
  const g = setup("colossus", 2),
    b = g.s.battle;
  const before = g.s.rng;
  assert.equal(g.tell(b.enemies[0]).damage, 30);
  assert.deepEqual(
    g.observe().battle.telegraphs[0].spaces,
    [0, 7, 14, 21, 28, 35],
  );
  for (let r = 0; r < MIND_ROWS; r++) put(g, "blast", r * MIND_COLUMNS + 1);
  assert.equal(g.tell(b.enemies[0]).damage, 0);
  run(g);
  assert.equal(b.destroyed.length, 6);
  assert.equal(g.s.hp, 999);
  assert.ok(!g.presentation.some((f) => f.kind === "incoming"));
  b.enemies[0].cycle = 2;
  b.phase = "activate";
  put(g, "blast", 2);
  put(g, "blast", 2);
  put(g, "blast", 3);
  put(g, "blast", 10);
  let t = g.tell(b.enemies[0]);
  assert.equal(t.collapsedColumn, 2);
  assert.equal(t.damage, 25);
  b.grid[2].pop();
  t = g.tell(b.enemies[0]);
  assert.equal(t.collapsedColumn, 3);
  assert.equal(t.damage, 20);
  assert.equal(g.s.rng, before);
});

test("Collapse starts at its column and never permits defenses behind its origin or latest impact", () => {
  const g = setup("colossus", 2),
    b = g.s.battle;
  for (const slot of [3, 10, 17]) put(g, "blast", slot);
  put(g, "ward", 1).ward = 2;
  put(g, "ward", 5).ward = 20;
  put(g, "familiar", 0);
  put(g, "familiar", 6);
  const left = put(g, "shield", 2),
    right = put(g, "shield", 4);
  b.shields = [left, right].map((c, n) => ({
    uid: 800 + n,
    slot: n ? 4 : 2,
    owner: c.uid,
    block: 4,
    element: "Arcane",
  }));
  b.bracelets = [{ uid: 802, block: 2, element: "Arcane", name: "Bracelet" }];
  run(g);
  assert.equal(b.reaction.column, 3);
  for (const game of [g, new Game(g.s.seed, structuredClone(g.s))]) {
    const choices = game.defenseChoices();
    assert.deepEqual(
      choices.wards.map((x) => x.i),
      [1],
    );
    assert.deepEqual(
      choices.shields.map((x) => x.slot),
      [2],
    );
    assert.deepEqual(
      choices.allies.map((x) => x.i),
      [0],
    );
    assert.equal(choices.bracelets.length, 1);
    // Old builds saved the outer edge as the initial frontier.
    game.s.battle.reaction.column = 6;
    assert.deepEqual(
      game.defenseChoices().shields.map((x) => x.slot),
      [2],
    );
    game.s.battle.reaction.column = 1;
    assert.deepEqual(game.defenseChoices().shields, []);
  }
});
test("Glare attacks in its newly chosen element, bypasses all grid defenses, and permits equipment", () => {
  const g = setup("colossus", 3),
    b = g.s.battle;
  put(g, "ward", 6).ward = 50;
  put(g, "familiar", 5);
  const shield = put(g, "shield", 4);
  b.shields = [
    { uid: 800, slot: 4, owner: shield.uid, block: 20, element: "Arcane" },
  ];
  b.bracelets = [{ uid: 801, block: 2, element: "Arcane", name: "Bracelet" }];
  g.pick = () => "Fire";
  run(g);
  assert.equal(b.enemies[0].element, "Fire");
  assert.equal(b.reaction.element, "Fire");
  assert.equal(b.reaction.damage, 5);
  assert.equal(b.reaction.pierce, true);
  const choices = g.defenseChoices();
  for (const k of ["wards", "shields", "allies"])
    assert.deepEqual(choices[k], []);
  assert.equal(choices.bracelets.length, 1);
  assert.equal(
    g.presentation.find((f) => f.kind === "incoming").element,
    "Fire",
  );
  g.act(g.legal().find((a) => a.type === "bracelet"));
  assert.equal(g.s.hp, 996);
  assert.equal(b.grid[6][0].ward, 50);
});
test("Wildfire destroys its row then applies Burn 2, including on an empty grid", () => {
  for (const populated of [false, true]) {
    const g = setup("hart", 2);
    if (populated) {
      put(g, "blast", 0);
      put(g, "shield", 1);
    }
    run(g);
    assert.equal(g.s.status.burn, 2);
    assert.equal(g.s.battle.destroyed.length, populated ? 2 : 0);
    const frames = g.presentation;
    const burn = frames.findIndex((f) => f.statusEffect === "burn");
    assert.ok(burn >= 0);
    assert.ok(frames.slice(burn + 1).every((f) => !f.dead));
  }
});
test("Silence uses 2 + 2 per living board Ally per hit, counts covered Allies and snapshots all three hits", () => {
  for (const count of [0, 1, 2, 3]) {
    const g = setup("choir", 2),
      b = g.s.battle;
    for (let i = 0; i < count; i++) put(g, "familiar", i);
    const expected = 2 + 2 * count;
    assert.equal(g.tell(b.enemies[0]).damage, expected);
    const target = gridTargets(b, g.tell(b.enemies[0]))[0];
    run(g);
    const frames = pass(g);
    assert.equal(g.s.hp, 999 - 3 * expected);
    assert.equal(frames.filter((f) => f.kind === "incoming").length, 3);
    if (count) assert.ok(b.grid[target].at(-1).sever);
  }
  const g = setup("choir", 2),
    b = g.s.battle;
  const ally = put(g, "familiar", 0);
  put(g, "blast", 0);
  put(g, "familiar", 2).hp = 0;
  put(g, "familiar", 1);
  assert.equal(g.tell(b.enemies[0]).allyCount, 2);
  run(g);
  assert.equal(b.reaction.damage, 6);
  assert.ok(b.grid[1].at(-1).sever);
  // Board changes after the first hit cannot rewrite the already committed volley.
  g.destroyCard(0, ally.uid);
  const frames = pass(g);
  assert.equal(g.s.hp, 981);
  assert.deepEqual(
    frames.filter((f) => f.kind === "incoming").map((f) => f.amount),
    [6, 6, 6],
  );
});
test("New attacks keep exact formulas under cycle, Restless, buffs and half HP; legacy saves and Field inspection work", () => {
  for (const [id, cycle, damage] of [
    ["colossus", 2, 30],
    ["colossus", 3, 5],
    ["choir", 2, 2],
  ]) {
    const g = setup(id, cycle),
      e = g.s.battle.enemies[0];
    e.cycle += 20;
    e.restless = 5;
    e.buff = 7;
    e.hp = 1;
    assert.equal(g.tell(e).damage, damage);
    g.s.version.rules = "1.3.44";
    const h = new Game(0, g.s);
    assert.equal(h.tell(h.s.battle.enemies[0]).damage, damage);
  }
  const g = new Game(85);
  for (const id of ["colossus", "choir"]) {
    const tell = g.tell({
      id,
      cycle: 2,
      element: "Chaos",
      buff: 0,
      hp: 100,
      maxHp: 100,
    });
    assert.ok(Number.isFinite(tell.damage));
  }
});

test("Boss animation capture preserves exact combat state and RNG for all three destruction moves", () => {
  for (const [id, cycle, visual] of [
    ["hart", 2, "wildfire"],
    ["colossus", 2, "collapse"],
    ["choir", 0, "hymn"],
  ]) {
    const g = setup(id, cycle);
    put(g, "blast", 0);
    put(g, "blast", 7);
    put(g, "blast", 8);
    const h = new Game(0, g.s);
    h.s = structuredClone(g.s); // Compare capture only, not load-time checkpoint normalization.
    h.capturePresentation = false;
    run(g);
    run(h);
    assert.deepEqual(g.s, h.s);
    const frame = g.presentation.find((f) => f.kind === "gridDestruction");
    assert.equal(frame.visual, visual);
    assert.ok(frame.targets.length);
    for (const slot of frame.targets)
      assert.deepEqual(frame.state.battle.grid[slot], []);
    if (id === "hart")
      assert.equal(
        g.presentation.find((f) => f.statusEffect === "burn").gridSourceSlot,
        7,
      );
    pass(g);
    pass(h);
    assert.deepEqual(g.s, h.s);
  }
});
