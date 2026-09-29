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
    c = put(g, "shield", 6);
  put(g, "rain", 5);
  put(g, "thorn", 7, "Fire");
  assert.deepEqual(attunementElements(b, c, 6), ["Water", "Fire"]);
  assert.deepEqual(
    [
      ...new Set(
        g
          .legal()
          .filter((a) => a.type === "activate" && a.slot === 6)
          .map((a) => a.element),
      ),
    ],
    attunementElements(b, c, 6),
  );
  let m = cardInteraction(b, c, 6);
  assert.deepEqual(m.providers, [5, 7]);
  assert.deepEqual(m.colors, ["Arcane"]);
  c.transmuted = true;
  c.element = "Earth";
  m = cardInteraction(b, c, 6);
  assert.deepEqual(m.providers, []);
  assert.deepEqual(m.colors, ["Earth"]);
  assert.deepEqual(m.choices, ["Earth"]);
});
test("Shield colors follow remaining portions, preserve mixed elements and exclude covered/inactive owners", () => {
  const g = base(),
    b = g.s.battle,
    c = put(g, "shield", 6);
  put(g, "rain", 5);
  g.act(g.legal().find((a) => a.type === "activate" && a.slot === 6));
  assert.equal(c.lastActivationElement, "Water");
  assert.deepEqual(cardInteraction(b, c, 6).colors, ["Water"]);
  b.shields.push({
    uid: 991,
    slot: 6,
    owner: c.uid,
    block: 3,
    element: "Fire",
  });
  assert.deepEqual(cardInteraction(b, c, 6).colors, ["Water", "Fire"]);
  c.transmuted = true;
  c.element = "Earth";
  const m = cardInteraction(b, c, 6);
  assert.deepEqual(m.colors, ["Earth"]);
  assert.deepEqual(
    m.portions.map((p) => p.element),
    ["Water", "Fire"],
  );
  b.shields[0].block = 0;
  assert.deepEqual(
    cardInteraction(b, c, 6).portions.map((p) => p.element),
    ["Fire"],
  );
  put(g, "ward", 6);
  assert.equal(cardInteraction(b, c, 6), null);
  assert.deepEqual(cardInteraction(b, b.grid[6][0], 6).portions, []);
});
test("Blast cast tint lasts only this turn and never offers its cast element to neighbors", () => {
  const g = base(),
    b = g.s.battle,
    c = put(g, "blast", 6),
    other = put(g, "shield", 11);
  put(g, "rain", 5);
  g.act(g.legal().find((a) => a.type === "activate" && a.slot === 6));
  assert.equal(c.element, "Arcane");
  assert.deepEqual(cardInteraction(b, c, 6).colors, ["Water"]);
  assert.deepEqual(attunementElements(b, other, 11), ["Arcane"]);
  b.turn++;
  assert.deepEqual(cardInteraction(b, c, 6).colors, ["Arcane"]);
  const fresh = g.instance(c);
  assert.equal(fresh.lastActivationElement, null);
});
test("Matching links and badges follow live adjacency, including Sever and covered cards", () => {
  const g = base(),
    b = g.s.battle;
  for (const i of [5, 6, 7]) put(g, "blast", i);
  assert.deepEqual(
    [5, 6, 7].map((i) => cardInteraction(b, b.grid[i][0], i).bonus),
    [1, 2, 1],
  );
  b.grid[6][0].sever = true;
  assert.deepEqual(
    [5, 6, 7].map((i) => cardInteraction(b, b.grid[i][0], i).bonus),
    [0, 0, 0],
  );
  b.grid[6][0].sever = false;
  b.grid[6].push(g.instance(g.newCard("ward")));
  assert.equal(cardInteraction(b, b.grid[5][0], 5).bonus, 0);
  put(g, "shield", 0);
  put(g, "shield", 1);
  assert.equal(cardInteraction(b, b.grid[0][0], 0).bonusType, "block");
});
test("Visuals don't recalculate stored block after adjacency changes, and are read only", () => {
  const g = base(),
    b = g.s.battle,
    c = put(g, "shield", 6);
  put(g, "shield", 7);
  g.act(g.legal().find((a) => a.type === "activate" && a.slot === 6));
  assert.equal(b.shields[0].block, 5);
  b.grid[7] = [];
  const saved = structuredClone(g.s);
  const m = cardInteraction(b, c, 6);
  assert.equal(m.bonus, 0);
  assert.equal(m.portions[0].block, 5);
  assert.deepEqual(g.s, saved);
  const h = new Game(0, g.s);
  assert.equal(
    cardInteraction(h.s.battle, h.s.battle.grid[6][0], 6).portions[0].block,
    5,
  );
});
