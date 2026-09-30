import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
function base() {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  g.s.battle.phase = "enemy";
  g.s.battle.jobs = [];
  g.capturePresentation = true;
  return g;
}
const act = (g, type) => g.act(g.legal().find((a) => a.type === type));
test("Arcane30 traverses Ward5, Ally6, Bracelet2, player17 across separate choices and save", () => {
  let g = base(),
    b = g.s.battle;
  const ward = g.instance(g.newCard("ward")),
    ally = g.instance(g.newCard("familiar"));
  ward.ward = 5;
  ally.hp = ally.maxHp = 6;
  b.grid[20] = [ward];
  b.grid[22] = [ally];
  b.bracelets = [{ uid: 999, name: "Bracelet", block: 2, element: "Arcane" }];
  b.jobs = [
    {
      kind: "hit",
      damage: 30,
      element: "Arcane",
      source: 900,
      name: "Huge hit",
    },
  ];
  g.pump();
  assert.equal(b.reaction.stage, "defend");
  act(g, "ward");
  const frames = g.presentation.filter((f) => f.attackPath);
  assert.equal(b.reaction.stage, "defend");
  act(g, "intercept");
  frames.push(...g.presentation.filter((f) => f.attackPath));
  assert.equal(b.grid[22].length, 0);
  assert.deepEqual(b.reaction.lastNode, { kind: "card", slot: 22 });
  const saved = structuredClone(g.s);
  g = new Game(0, saved);
  g.capturePresentation = true;
  b = g.s.battle;
  act(g, "bracelet");
  frames.push(...g.presentation.filter((f) => f.attackPath));
  assert.deepEqual(
    frames.map((f) => f.loss),
    [5, 6, 2, 17],
  );
  assert.deepEqual(
    frames.map((f) => f.pathFrom),
    [
      { kind: "enemy", uid: 900 },
      { kind: "card", slot: 20 },
      { kind: "card", slot: 22 },
      { kind: "item", uid: 999 },
    ],
  );
  assert.deepEqual(
    frames.map((f) => f.pathTo),
    [
      { kind: "card", slot: 20 },
      { kind: "card", slot: 22 },
      { kind: "item", uid: 999 },
      { kind: "player" },
    ],
  );
  assert.deepEqual(
    frames.map((f) => f.remaining),
    [25, 19, 17, 0],
  );
  assert.equal(g.s.hp, 53);
});
test("Elemental block floats actual block spent; weak Ally shows only HP lost and keeps spillover math", () => {
  const g = base(),
    b = g.s.battle,
    c = g.instance(g.newCard("familiar"));
  c.element = "Earth";
  c.hp = 2;
  b.grid[0] = [c];
  b.jobs = [
    { kind: "hit", damage: 6, element: "Fire", source: 900, name: "Fire" },
  ];
  g.pump();
  act(g, "intercept");
  const f = g.presentation.find((f) => f.target === "card");
  assert.equal(f.amount, 9);
  assert.equal(f.loss, 2);
  assert.equal(g.s.hp, 64);
  const h = base(),
    hb = h.s.battle;
  hb.bracelets = [{ uid: 99, name: "Fire", block: 2, element: "Fire" }];
  hb.jobs = [
    { kind: "hit", damage: 6, element: "Fire", source: 900, name: "Fire" },
  ];
  h.pump();
  act(h, "bracelet");
  const block = h.presentation.find((f) => f.kind === "defend");
  assert.equal(block.loss, 2);
  assert.ok(block.amount > block.loss);
});
test("Each hit starts from its own enemy, status has no projectile, lethal player label caps at HP", () => {
  const g = base(),
    b = g.s.battle;
  g.s.hp = 3;
  b.jobs = [
    { kind: "hit", damage: 1, element: "Arcane", source: 900, name: "First" },
    { kind: "hit", damage: 9, element: "Arcane", source: 900, name: "Second" },
  ];
  g.pump();
  const fs = g.presentation.filter((f) => f.attackPath);
  assert.deepEqual(
    fs.map((f) => f.pathFrom),
    [
      { kind: "enemy", uid: 900 },
      { kind: "enemy", uid: 900 },
    ],
  );
  assert.deepEqual(
    fs.map((f) => f.loss),
    [1, 2],
  );
  assert.equal(g.s.hp, 0);
  const h = base();
  h.s.status.burn = 2;
  h.beginTurn();
  const f = h.presentation.find((f) => f.target === "player");
  assert.equal(f.pathFrom, null);
  assert.equal(f.loss, 2);
});
