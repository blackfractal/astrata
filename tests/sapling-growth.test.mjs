import test from "node:test";
import assert from "node:assert/strict";
import { Game, activationGrowth } from "../src/engine.mjs";
import { boardConnections } from "../src/board-interactions.mjs";

function setup(upgrade = false) {
  const g = new Game(41);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 20;
  b.enemies[0].hp = b.enemies[0].maxHp = 100;
  const put = (id, i, up = false) =>
    (b.grid[i] = [g.instance(g.newCard(id, up))]);
  put("sapling", 16, upgrade);
  const c = b.grid[16][0];
  const attack = () =>
    g.act(g.legal().find((a) => a.type === "activate" && a.slot === 16));
  return { g, b, c, put, attack };
}

test("Sapling attacks first, then grows from any adjacent card, with no passive growth", () => {
  const { g, b, c, put, attack } = setup();
  put("clear", 9);
  put("shield", 15);
  put("shield", 17);
  b.grid[15][0].used = 2; // Spent providers still count.
  g.capturePresentation = true;
  assert.equal(c.maxHp, 10);
  assert.equal(activationGrowth(b, c, 16), 3);
  attack();
  assert.equal(b.enemies[0].hp, 96);
  assert.equal(c.hp, 7);
  assert.equal(c.used, 1);
  const hit = g.presentation.findIndex(
    (f) => f.kind === "hit" && f.target === "enemy",
  );
  const grow = g.presentation.findIndex((f) => f.growth === 3);
  assert.ok(hit >= 0 && grow > hit);
  assert.equal(g.presentation[hit].state.battle.grid[16][0].hp, 4);
  assert.equal(g.presentation[grow].state.battle.grid[16][0].hp, 7);
  assert.ok(!g.legal().some((a) => a.type === "activate" && a.slot === 16));
  g.beginTurn();
  assert.equal(c.hp, 7);
  b.phase = "activate";
  attack();
  assert.equal(b.enemies[0].hp, 89);
  assert.equal(c.hp, 10);
  assert.equal(c.used, 2);
  g.beginTurn();
  assert.equal(c.hp, 10);
  b.phase = "activate";
  assert.ok(!g.legal().some((a) => a.type === "activate" && a.slot === 16));
});

test("growth uses exposed orthogonal spaces once, respecting Sever and the cap", () => {
  const { b, c, put } = setup();
  put("clear", 9);
  put("shield", 15);
  put("familiar", 17);
  put("blast", 23);
  put("shield", 8); // diagonal does not count
  b.grid[9].unshift({ ...b.grid[9][0], uid: 999 }); // covered card not an extra neighbor
  assert.equal(activationGrowth(b, c, 16), 4);
  b.grid[15][0].sever = true;
  assert.equal(activationGrowth(b, c, 16), 3);
  c.sever = true;
  assert.equal(activationGrowth(b, c, 16), 0);
  c.sever = false;
  c.hp = 9;
  assert.equal(activationGrowth(b, c, 16), 1);
  c.hp = 10;
  assert.equal(activationGrowth(b, c, 16), 0);
});

test("Flicker wastes growth too, while a blocked or killing attack still resolves before growth", () => {
  for (const type of ["flicker", "guard", "kill"]) {
    const { g, b, c, put, attack } = setup();
    put("clear", 9);
    if (type === "flicker") b.enemies[0].flicker = true;
    if (type === "guard") b.enemies[0].guard = 10;
    if (type === "kill") b.enemies[0].hp = 1;
    attack();
    assert.equal(c.hp, type === "flicker" ? 4 : 5, type);
    assert.equal(c.used, 1, type);
    if (type === "kill") assert.equal(g.s.mode, "reward");
  }
});

test("Sapling's hard cap applies to healing and upgrades, and to legacy saves/checkpoints", () => {
  const { g, b, c, put } = setup(true);
  assert.equal(c.hp, 7);
  assert.equal(c.maxHp, 10);
  put("aqua", 9);
  g.applyCard(b.grid[9][0], 9, null, "Water", { cardTarget: 16 });
  assert.equal(c.hp, 10);
  assert.equal(c.maxHp, 10);
  c.hp = 25;
  c.maxHp = 25;
  const saved = structuredClone(g.s);
  saved.version.rules = "1.3.39";
  saved.checkpoint = structuredClone(saved);
  const loaded = new Game(0, saved);
  assert.equal(loaded.s.battle.grid[16][0].hp, 10);
  assert.equal(loaded.s.checkpoint.battle.grid[16][0].hp, 10);
  c.hp = 3;
  const wounded = new Game(0, structuredClone(g.s));
  assert.equal(wounded.s.battle.grid[16][0].hp, 3);
  assert.equal(wounded.s.battle.grid[16][0].maxHp, 10);
});

test("growth links exist only while an activation can still grant HP; Grove Titan remains passive", () => {
  const { g, b, c, put } = setup();
  put("clear", 9);
  const links = () =>
    boardConnections(b).filter(
      (l) => l.to === 16 && l.reason === "Growth after attack",
    );
  assert.equal(links().length, 1);
  c.used = 2;
  assert.equal(links().length, 0);
  c.used = 0;
  c.hp = 10;
  assert.equal(links().length, 0);
  put("grove", 35);
  put("shield", 36);
  g.beginTurn();
  assert.equal(b.grid[35][0].hp, 21);
  assert.equal(c.hp, 10);
});

test("exact-state reload preserves post-attack growth and cannot grant a second activation that turn", () => {
  const { g, b, put, attack } = setup();
  put("clear", 9);
  attack();
  const saved = structuredClone(g.s);
  delete saved.checkpoint;
  const resumed = new Game(0, saved);
  assert.equal(resumed.s.battle.grid[16][0].hp, 5);
  assert.ok(
    !resumed.legal().some((a) => a.type === "activate" && a.slot === 16),
  );
  g.beginTurn();
  resumed.beginTurn();
  const actual = structuredClone(resumed.s),
    expected = structuredClone(g.s);
  delete actual.checkpoint;
  delete expected.checkpoint;
  assert.deepEqual(actual, expected);
  assert.equal(b.grid[16][0].hp, 5);
});
