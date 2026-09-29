import test from "node:test";
import assert from "node:assert/strict";
import { Game, attunementElements } from "../src/engine.mjs";
import { cardInteraction } from "../src/board-interactions.mjs";
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
  assert.deepEqual(attunementElements(b, c, 8), ["Water", "Fire"]);
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
  g.act(g.legal().find((a) => a.type === "activate" && a.slot === 8));
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
test("Blast cast tint lasts only this turn and never offers its cast element to neighbors", () => {
  const g = base(),
    b = g.s.battle,
    c = put(g, "blast", 8),
    other = put(g, "shield", 15);
  put(g, "rain", 7);
  g.act(g.legal().find((a) => a.type === "activate" && a.slot === 8));
  assert.equal(c.element, "Arcane");
  assert.deepEqual(cardInteraction(b, c, 8).colors, ["Water"]);
  assert.deepEqual(attunementElements(b, other, 15), ["Arcane"]);
  b.turn++;
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
  g.act(g.legal().find((a) => a.type === "activate" && a.slot === 8));
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
