import test from "node:test";
import assert from "node:assert/strict";
import {
  Game,
  adjacent,
  corner,
  gridTargets,
  cardPower,
} from "../src/engine.mjs";
import { MIND_COLUMNS, MIND_ROWS, MIND_SIZE } from "../src/content.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
function base() {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  g.s.battle.enemies[0].hp = 100;
  return g;
}
function put(g, id, i) {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[i].push(c);
  return c;
}
function act(g, type, p = () => true) {
  const a = g.legal().find((a) => a.type === type && p(a));
  assert.ok(a, type);
  g.act(a);
}
test("7×6 has 42 distinct slots and symmetric orthogonal neighbors without edge wrapping", () => {
  assert.deepEqual([MIND_COLUMNS, MIND_ROWS, MIND_SIZE], [7, 6, 42]);
  const g = base();
  assert.equal(g.observe().battle.grid.length, 42);
  assert.equal(g.s.battle.columns, 7);
  assert.equal(g.s.battle.rows, 6);
  assert.deepEqual(adjacent(0), [1, 7]);
  assert.deepEqual(adjacent(6), [5, 13]);
  assert.deepEqual(adjacent(35), [36, 28]);
  assert.deepEqual(adjacent(41), [40, 34]);
  assert.deepEqual(
    Array.from({ length: 42 }, (_, i) => i).filter(corner),
    [0, 6, 35, 41],
  );
  for (let i = 0; i < 42; i++)
    for (const j of adjacent(i)) {
      assert.ok(j >= 0 && j < 42);
      assert.ok(adjacent(j).includes(i));
      assert.equal(
        Math.abs((i % 7) - (j % 7)) +
          Math.abs(Math.floor(i / 7) - Math.floor(j / 7)),
        1,
      );
    }
});
test("placement, activation, and Recall reach the final slot", () => {
  const g = base(),
    b = g.s.battle;
  b.hand = [g.newCard("clear")];
  b.phase = "place";
  assert.equal(g.legal().filter((a) => a.type === "place").length, 42);
  act(g, "place", (a) => a.slot === 41);
  assert.equal(b.grid[41][0].id, "clear");
  act(g, "activatePhase");
  act(g, "activate", (a) => a.slot === 41);
  assert.equal(b.grid[41][0].used, 1);
  b.phase = "place";
  b.focus = 5;
  act(g, "recall", (a) => a.slot === 41);
  assert.equal(b.grid[41].length, 0);
});
test("far-edge Shield matching/attunement and Ally growth/statuses use new neighbors", () => {
  const g = base(),
    b = g.s.battle;
  put(g, "shield", 39);
  put(g, "shield", 40);
  put(g, "rain", 41);
  b.phase = "activate";
  act(g, "activate", (a) => a.slot === 40);
  assert.equal(b.shields[0].block, 5);
  assert.equal(b.shields[0].element, "Water");
  const ally = put(g, "sapling", 35);
  put(g, "blast", 36);
  ally.status.poison = 2;
  const hp = ally.hp;
  g.beginTurn();
  assert.equal(ally.hp, hp + 1 - 2);
});
test("bottom-right 2×2 formation doubles once, respects Sever and cannot cross a row boundary", () => {
  const g = base(),
    b = g.s.battle,
    c = put(g, "square", 41);
  for (const i of [33, 34, 40]) put(g, "shield", i);
  assert.equal(cardPower(b, c, 41), 12);
  b.grid[33][0].sever = true;
  assert.equal(cardPower(b, c, 41), 6);
  b.grid = Array.from({ length: 42 }, () => []);
  const edge = put(g, "square", 7);
  for (const i of [6, 13, 14]) put(g, "shield", i);
  assert.equal(cardPower(b, edge, 7), 6);
});
test("sixth-row bonuses, corner Keystone and last-slot Towers use expanded geometry", () => {
  const g = base(),
    b = g.s.battle,
    c = put(g, "ignis", 35);
  put(g, "corner", 36);
  put(g, "corner", 41);
  put(g, "corner", 34);
  assert.equal(cardPower(b, c, 35), 9);
  b.grid[41] = [];
  put(g, "keystone", 41);
  assert.equal(g.allowance(c, 35), 4);
  const off = put(g, "blast", 4);
  assert.equal(g.allowance(off, 4), 2);
  b.grid[41] = [];
  put(g, "ward", 41);
  const tower = put(g, "magnify", 41);
  tower.magnified = true;
  put(g, "plasma", 0);
  const upper = put(g, "plasma", 0);
  assert.equal(cardPower(b, upper, 0), 20);
});
test("boss line selection and telegraphs include the last row and column, all stacks counted", () => {
  const g = base(),
    b = g.s.battle;
  for (const i of [35, 40, 41]) put(g, "blast", i);
  put(g, "plasma", 41);
  assert.deepEqual(gridTargets(b, { grid: "row" }), [35, 40, 41]);
  Object.assign(b.enemies[0], { id: "hart", cycle: 2 });
  assert.deepEqual(g.gridTelegraphs()[0].spaces, [35, 36, 37, 38, 39, 40, 41]);
  g.gridAttack({ grid: "row", name: "Test row" });
  assert.equal(b.destroyed.length, 4);
  for (const i of [6, 34, 41]) put(g, "blast", i);
  Object.assign(b.enemies[0], { id: "colossus", cycle: 2 });
  assert.deepEqual(g.gridTelegraphs()[0].spaces, [6, 13, 20, 27, 34, 41]);
  assert.deepEqual(gridTargets(b, { grid: "column" }), [6, 34, 41]);
});
test("legacy 5×4 saves migrate coordinates, whole stacks, Shield owners and checkpoints without mutating input", () => {
  const g = base(),
    b = g.s.battle;
  b.grid = Array.from({ length: 20 }, () => []);
  delete b.columns;
  delete b.rows;
  const shield = put(g, "shield", 19);
  put(g, "plasma", 6);
  put(g, "plasma", 6);
  b.shields = [
    { uid: 999, slot: 19, owner: shield.uid, block: 5, element: "Water" },
  ];
  g.s.version = { ...g.s.version, rules: "1.3.16" };
  delete g.s.checkpoint;
  g.s.checkpoint = structuredClone(g.s);
  const saved = structuredClone(g.s),
    h = new Game(0, g.s);
  assert.deepEqual(g.s, saved);
  assert.equal(h.s.battle.grid[25][0].uid, shield.uid);
  assert.equal(h.s.battle.grid[8].length, 2);
  assert.equal(h.s.battle.shields[0].slot, 25);
  assert.equal(h.s.battle.shields[0].owner, shield.uid);
  assert.equal(h.s.battle.grid[41].length, 0);
  assert.equal(h.save().battle.grid.length, 42);
  assert.equal(h.save().battle.shields[0].slot, 25);
  assert.equal(h.s.rng, saved.rng);
  const again = new Game(0, h.save());
  assert.equal(again.s.battle.grid[25][0].uid, shield.uid);
});
test("AI placement recognizes new corner locations and stays on legal engine actions", () => {
  const g = base(),
    b = g.s.battle;
  b.hand = [g.newCard("corner")];
  b.focus = 3;
  b.phase = "place";
  put(g, "shield", 0);
  const legal = g.legal().filter((a) => a.type === "place");
  const decision = new WeightedPolicy().choose(g.observe(), legal);
  assert.ok([6, 35, 41].includes(decision.action.slot));
  g.act(decision.action);
});
