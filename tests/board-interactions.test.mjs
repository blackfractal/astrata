import test from "node:test";
import assert from "node:assert/strict";
import {
  Game,
  attunementElements,
  squarePattern,
  cardPower,
} from "../src/engine.mjs";
import {
  cardInteraction,
  boardConnections,
} from "../src/board-interactions.mjs";
function base() {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  g.s.battle.phase = "activate";
  g.s.battle.channel = 10;
  g.s.battle.enemies[0].hp = g.s.battle.enemies[0].maxHp = 100;
  return g;
}
function put(g, id, i, element) {
  const c = g.instance(g.newCard(id));
  if (element) c.element = element;
  g.s.battle.grid[i] = [c];
  return c;
}
test("Displayed attunement options match legal choices; Transmute overrides them", () => {
  const g = base(),
    b = g.s.battle,
    c = put(g, "shield", 8);
  put(g, "rain", 7);
  put(g, "thorn", 9, "Fire");
  assert.deepEqual(attunementElements(b, c, 8), ["Arcane", "Water", "Fire"]);
  assert.deepEqual(
    [
      ...new Set(
        g
          .legal()
          .filter((a) => a.type === "activate" && a.slot === 8)
          .map((a) => a.element),
      ),
    ],
    attunementElements(b, c, 8),
  );
  let m = cardInteraction(b, c, 8);
  assert.deepEqual(m.providers, [7, 9]);
  assert.deepEqual(m.colors, ["Arcane"]);
  c.transmuted = true;
  c.element = "Earth";
  m = cardInteraction(b, c, 8);
  assert.deepEqual(m.providers, []);
  assert.deepEqual(m.colors, ["Earth"]);
  assert.deepEqual(m.choices, ["Earth"]);
});
test("Shield colors follow remaining portions, preserve mixed elements and exclude covered/inactive owners", () => {
  const g = base(),
    b = g.s.battle,
    c = put(g, "shield", 8);
  put(g, "rain", 7);
  g.act(
    g
      .legal()
      .find(
        (a) => a.type === "activate" && a.slot === 8 && a.element === "Water",
      ),
  );
  assert.equal(c.lastActivationElement, "Water");
  assert.deepEqual(cardInteraction(b, c, 8).colors, ["Water"]);
  b.shields.push({
    uid: 991,
    slot: 8,
    owner: c.uid,
    block: 3,
    element: "Fire",
  });
  assert.deepEqual(cardInteraction(b, c, 8).colors, ["Water", "Fire"]);
  c.transmuted = true;
  c.element = "Earth";
  const m = cardInteraction(b, c, 8);
  assert.deepEqual(m.colors, ["Earth"]);
  assert.deepEqual(
    m.portions.map((p) => p.element),
    ["Water", "Fire"],
  );
  b.shields[0].block = 0;
  assert.deepEqual(
    cardInteraction(b, c, 8).portions.map((p) => p.element),
    ["Fire"],
  );
  put(g, "ward", 8);
  assert.equal(cardInteraction(b, c, 8), null);
  assert.deepEqual(cardInteraction(b, b.grid[8][0], 8).portions, []);
});
test("Blast cast tint and offered relay last only this turn", () => {
  const g = base(),
    b = g.s.battle,
    c = put(g, "blast", 8),
    other = put(g, "shield", 15);
  put(g, "rain", 7);
  g.act(
    g
      .legal()
      .find(
        (a) => a.type === "activate" && a.slot === 8 && a.element === "Water",
      ),
  );
  assert.equal(c.element, "Arcane");
  assert.deepEqual(cardInteraction(b, c, 8).colors, ["Water"]);
  assert.deepEqual(attunementElements(b, other, 15), ["Arcane", "Water"]);
  b.turn++;
  assert.deepEqual(attunementElements(b, other, 15), ["Arcane"]);
  assert.deepEqual(cardInteraction(b, c, 8).colors, ["Arcane"]);
  const fresh = g.instance(c);
  assert.equal(fresh.lastActivationElement, null);
});
test("Matching links and badges follow live adjacency, including Sever and covered cards", () => {
  const g = base(),
    b = g.s.battle;
  for (const i of [7, 8, 9]) put(g, "blast", i);
  assert.deepEqual(
    [7, 8, 9].map((i) => cardInteraction(b, b.grid[i][0], i).bonus),
    [1, 2, 1],
  );
  b.grid[8][0].sever = true;
  assert.deepEqual(
    [7, 8, 9].map((i) => cardInteraction(b, b.grid[i][0], i).bonus),
    [0, 0, 0],
  );
  b.grid[8][0].sever = false;
  b.grid[8].push(g.instance(g.newCard("ward")));
  assert.equal(cardInteraction(b, b.grid[7][0], 7).bonus, 0);
  put(g, "shield", 0);
  put(g, "shield", 1);
  assert.equal(cardInteraction(b, b.grid[0][0], 0).bonusType, "block");
});
test("Visuals don't recalculate stored block after adjacency changes, and are read only", () => {
  const g = base(),
    b = g.s.battle,
    c = put(g, "shield", 8);
  put(g, "shield", 9);
  g.act(
    g
      .legal()
      .find(
        (a) => a.type === "activate" && a.slot === 8 && a.element === "Arcane",
      ),
  );
  assert.equal(b.shields[0].block, 5);
  b.grid[9] = [];
  const saved = structuredClone(g.s);
  const m = cardInteraction(b, c, 8);
  assert.equal(m.bonus, 0);
  assert.equal(m.portions[0].block, 5);
  assert.deepEqual(g.s, saved);
  const h = new Game(0, g.s);
  assert.equal(
    cardInteraction(h.s.battle, h.s.battle.grid[8][0], 8).portions[0].block,
    5,
  );
});

test("Fourfold visual block matches damage in every corner, retargets and breaks on Sever", () => {
  for (const i of [8, 9, 15, 16]) {
    const g = base(),
      b = g.s.battle;
    for (const j of [8, 9, 15, 16]) put(g, j === i ? "square" : "shield", j);
    const c = b.grid[i][0];
    assert.deepEqual(cardInteraction(b, c, i).pattern, [8, 9, 15, 16]);
    assert.equal(cardPower(b, c, i), 12);
    b.grid[16][0].sever = true;
    assert.deepEqual(squarePattern(b, c, i), []);
    assert.equal(cardPower(b, c, i), 6);
  }
  const g = base(),
    b = g.s.battle,
    c = put(g, "square", 8);
  for (const j of [7, 9, 14, 15, 16]) put(g, "shield", j);
  assert.deepEqual(squarePattern(b, c, 8), [8, 9, 15, 16]);
  assert.equal(cardPower(b, c, 8), 12);
  b.grid[9] = [];
  assert.deepEqual(cardInteraction(b, c, 8).pattern, [7, 8, 14, 15]);
  b.grid[14] = [];
  assert.deepEqual(squarePattern(b, c, 8), []);
});

test("Opening Rite grants only opening Focus and cannot Recall alone or beneath Palimpsest", () => {
  const g = new Game(8);
  g.s.deck.push(g.newCard("rite"));
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle,
    i = b.grid.findIndex((s) => s.some((c) => c.id === "rite"));
  assert.ok(i >= 0);
  assert.equal(b.focus, 2);
  b.phase = "place";
  b.focus = 10;
  assert.equal(g.recallCost(b.grid[i]), null);
  assert.ok(!g.legal().some((a) => a.type === "recall" && a.slot === i));
  b.grid[i].push(g.instance(g.newCard("palimpsest")));
  assert.equal(g.recallCost(b.grid[i]), null);
  assert.ok(!g.legal().some((a) => a.type === "recall" && a.slot === i));
  const saved = structuredClone(g.s);
  saved.version.rules = "1.3.17";
  const resumed = new Game(0, saved);
  assert.equal(resumed.recallCost(resumed.s.battle.grid[i]), null);
  b.phase = "enemy";
  g.beginTurn();
  assert.equal(b.focus, 1);
});

test("Connections require an effect: no Focus-Blast cable, but spent neighbors can feed live bonuses", () => {
  const g = base(),
    b = g.s.battle,
    focus = put(g, "focus", 8);
  focus.used = 1;
  put(g, "blast", 9);
  assert.deepEqual(boardConnections(b), []);
  const other = put(g, "blast", 10);
  other.used = 2;
  let links = boardConnections(b);
  assert.equal(links.length, 1);
  assert.equal(links[0].from, 10);
  assert.equal(links[0].to, 9);
  assert.equal(links[0].both, false);
  b.grid[9][0].used = 2;
  assert.deepEqual(boardConnections(b), []);
});
test("Real effects connect: Keystone allowance, growth and adjacent damage, without mutating state", () => {
  const g = base(),
    b = g.s.battle,
    c = put(g, "focus", 1);
  c.used = 1;
  put(g, "keystone", 0);
  assert.ok(
    boardConnections(b).some(
      (l) => l.type === "allowance" && l.from === 0 && l.to === 1,
    ),
  );
  b.grid[0] = [];
  const thorn = put(g, "thorn", 8);
  put(g, "sapling", 9);
  assert.ok(
    boardConnections(b).some(
      (l) => l.from === 8 && l.to === 9 && l.reason === "Growth after attack",
    ),
  );
  const snapshot = structuredClone(g.s);
  assert.ok(!boardConnections(b).some((l) => l.from === 1 && l.to === 8));
  assert.ok(boardConnections(b).some((l) => l.from === 9 && l.to === 8));
  assert.deepEqual(g.s, snapshot);
  b.grid[1][0].sever = true;
  assert.ok(!boardConnections(b).some((l) => l.from === 1 || l.to === 1));
});
test("Attune links have a useful recipient; exhausted providers retain their element", () => {
  const g = base(),
    b = g.s.battle,
    s = put(g, "shield", 8),
    rain = put(g, "rain", 7);
  rain.used = 2;
  assert.ok(
    boardConnections(b).some(
      (l) => l.from === 7 && l.to === 8 && l.type === "attune",
    ),
  );
  s.used = 2;
  assert.deepEqual(boardConnections(b), []);
});
