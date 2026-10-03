import test from "node:test";
import assert from "node:assert/strict";
import {
  Game,
  attunementElements,
  defensiveElement,
  matchingNeighbors,
  conduitActive,
} from "../src/engine.mjs";
import { boardConnections } from "../src/board-interactions.mjs";
function setup() {
  const g = new Game(4);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 20;
  b.hand = [];
  b.enemies[0].hp = b.enemies[0].maxHp = 100;
  b.enemies[0].element = "Arcane";
  const put = (id, i) => (b.grid[i] = [g.instance(g.newCard(id))])[0];
  const activate = (i, element = "Arcane") => {
    const a = g
      .legal()
      .find(
        (a) => a.type === "activate" && a.slot === i && a.element === element,
      );
    assert.ok(a, `${i} ${element}`);
    g.act(a);
  };
  return { g, b, put, activate };
}
test("Conduit costs one Channel, has two uses, and grants no attack or block itself", () => {
  const { g, b, put, activate } = setup();
  const f = put("familiar", 9);
  put("blast", 10);
  put("shield", 16);
  assert.equal(f.hp, 6);
  assert.equal(matchingNeighbors(b, b.grid[10][0], 10), 0);
  activate(9);
  assert.equal(b.channel, 19);
  assert.equal(f.used, 1);
  assert.equal(b.enemies[0].hp, 100);
  assert.equal(b.shields.length, 0);
  assert.equal(matchingNeighbors(b, b.grid[10][0], 10), 1);
  assert.ok(!g.legal().some((a) => a.type === "activate" && a.slot === 9));
  g.beginTurn();
  b.phase = "activate";
  b.channel = 20;
  activate(9);
  assert.equal(f.used, 2);
  assert.ok(conduitActive(b, f));
  activate(10);
  activate(16);
  assert.equal(b.enemies[0].hp, 95);
  assert.equal(b.shields[0].block, 5);
  g.beginTurn();
  b.phase = "activate";
  assert.ok(!g.legal().some((a) => a.type === "activate" && a.slot === 9));
  assert.equal(matchingNeighbors(b, b.grid[10][0], 10), 0);
});
test("committed elements relay through spent Conduit and expire together, including defense", () => {
  const { g, b, put, activate } = setup();
  put("thorn", 7);
  put("shield", 8);
  const f = put("familiar", 9);
  put("blast", 10);
  put("shield", 16);
  const choices = (i) => attunementElements(b, b.grid[i][0], i);
  assert.deepEqual(choices(9), ["Arcane"]);
  activate(8, "Earth");
  assert.deepEqual(choices(9), ["Arcane", "Earth"]);
  f.used = 1;
  activate(9, "Earth");
  assert.equal(defensiveElement(b, f), "Earth");
  assert.deepEqual(choices(10), ["Arcane", "Earth"]);
  assert.ok(
    boardConnections(b).some(
      (l) => l.from === 9 && l.to === 10 && l.type === "synergy",
    ),
  );
  assert.ok(
    boardConnections(b).some(
      (l) => l.from === 9 && l.to === 16 && l.type === "attune",
    ),
  );
  const saved = structuredClone(g.s);
  delete saved.checkpoint;
  const h = new Game(0, saved);
  assert.equal(defensiveElement(h.s.battle, h.s.battle.grid[9][0]), "Earth");
  const before = JSON.stringify(g.s);
  g.legal();
  g.observe();
  boardConnections(b);
  assert.equal(JSON.stringify(g.s), before);
  g.beginTurn();
  assert.equal(defensiveElement(b, f), "Arcane");
  assert.deepEqual(choices(10), ["Arcane"]);
});
test("chosen defensive element changes actual interception damage in either direction", () => {
  for (const [element, hp, left] of [
    ["Earth", 3, 0],
    ["Water", 0, 3],
  ]) {
    const { g, b, put, activate } = setup();
    put("kiln", 8);
    const f = put("familiar", 9);
    activate(9, "Fire");
    b.phase = "enemy";
    b.jobs = [{ kind: "hit", damage: 6, element, source: 900, name: "Test" }];
    g.pump();
    const a = g.legal().find((a) => a.type === "intercept" && a.slot === 9);
    assert.equal(a.effects.element, "Fire");
    g.act(a);
    assert.equal(f.hp, hp);
    if (left) assert.equal(g.s.hp, 70 - left);
  }
});
test("Sever and covering suppress Conduit bonuses and relays, preserving committed block and defensive element", () => {
  const { g, b, put, activate } = setup();
  put("kiln", 8);
  const f = put("familiar", 9);
  const s = put("shield", 10);
  const blast = put("blast", 16);
  activate(9, "Fire");
  activate(10, "Fire");
  assert.equal(b.shields[0].block, 5);
  f.sever = true;
  assert.equal(matchingNeighbors(b, blast, 16), 0);
  assert.equal(defensiveElement(b, f), "Fire");
  assert.deepEqual(attunementElements(b, blast, 16), ["Arcane"]);
  f.sever = false;
  b.grid[9].push(g.instance(g.newCard("clear")));
  assert.equal(matchingNeighbors(b, blast, 16), 0);
  b.grid[9].pop();
  assert.equal(matchingNeighbors(b, blast, 16), 1);
  b.grid[9] = [];
  assert.equal(b.shields[0].block, 5);
  assert.equal(b.shields[0].element, "Fire");
});
test("each Conduit contributes once, links in either direction, and Transmute persists after expiry", () => {
  const { g, b, put, activate } = setup();
  const a = put("familiar", 8),
    z = put("familiar", 10),
    s = put("shield", 9);
  put("blast", 15);
  a.element = "Water";
  a.transmuted = true;
  activate(8, "Water");
  activate(10);
  assert.equal(matchingNeighbors(b, s, 9), 2);
  const links = boardConnections(b).filter(
    (l) => l.to === 9 && l.type === "synergy",
  );
  assert.deepEqual(
    links.map((l) => l.from).sort((a, b) => a - b),
    [8, 10],
  );
  activate(9, "Water");
  assert.equal(b.shields[0].block, 6);
  g.beginTurn();
  assert.equal(defensiveElement(b, a), "Water");
  assert.equal(matchingNeighbors(b, s, 9), 0);
});
