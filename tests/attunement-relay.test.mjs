import test from "node:test";
import assert from "node:assert/strict";
import {
  Game,
  attunementElements,
  attunementSourceElement,
  blockHit,
} from "../src/engine.mjs";
import { cards, items } from "../src/content.mjs";
import {
  boardConnections,
  cardInteraction,
} from "../src/board-interactions.mjs";
function setup() {
  const g = new Game(4);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 20;
  b.hand = [];
  b.enemies[0].hp = b.enemies[0].maxHp = 100;
  return g;
}
function put(g, id, i) {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[i] = [c];
  return c;
}
function activate(g, i, element) {
  const a = g
    .legal()
    .find(
      (a) => a.type === "activate" && a.slot === i && a.element === element,
    );
  assert.ok(a);
  g.act(a);
}
const choices = (g, i) =>
  attunementElements(g.s.battle, g.s.battle.grid[i].at(-1), i);
test("committed Shield to Blast to Shield chain survives spent allowance and block depletion, then expires together", () => {
  const g = setup(),
    b = g.s.battle;
  put(g, "thorn", 7);
  const a = put(g, "shield", 8);
  put(g, "blast", 9);
  put(g, "shield", 10);
  assert.deepEqual(choices(g, 9), ["Arcane"]);
  assert.deepEqual(choices(g, 10), ["Arcane"]);
  const snapshot = JSON.stringify(g.s);
  g.legal();
  g.observe();
  boardConnections(b);
  assert.equal(JSON.stringify(g.s), snapshot);
  a.used = 1;
  activate(g, 8, "Earth");
  assert.equal(a.used, 2);
  b.shields[0].block = 0;
  assert.deepEqual(choices(g, 9), ["Arcane", "Earth"]);
  assert.ok(
    boardConnections(b).some(
      (l) =>
        l.from === 8 &&
        l.to === 9 &&
        l.element === "Earth" &&
        l.type === "attune",
    ),
  );
  activate(g, 9, "Earth");
  assert.deepEqual(choices(g, 10), ["Arcane", "Earth"]);
  activate(g, 10, "Earth");
  b.grid[7] = [];
  assert.deepEqual(choices(g, 9), ["Arcane", "Earth"]);
  const h = new Game(0, g.s);
  assert.deepEqual(choices(h, 9), ["Arcane", "Earth"]);
  h.s.battle.phase = "enemy";
  assert.equal(
    attunementSourceElement(h.s.battle, h.s.battle.grid[8][0]),
    "Earth",
  );
  h.beginTurn();
  for (const i of [8, 9, 10]) {
    assert.deepEqual(choices(h, i), ["Arcane"]);
    assert.equal(h.s.battle.grid[i][0].element, "Arcane");
  }
});
test("Sever and covering suppress relays; frozen and spent sources retain them; recalled cards start fresh", () => {
  const g = setup(),
    b = g.s.battle;
  put(g, "rain", 7);
  const a = put(g, "blast", 8);
  put(g, "shield", 9);
  activate(g, 8, "Water");
  a.freeze = b.turn + 1;
  assert.deepEqual(choices(g, 9), ["Arcane", "Water"]);
  a.sever = true;
  assert.deepEqual(choices(g, 9), ["Arcane"]);
  a.sever = false;
  b.grid[8].push(g.instance(g.newCard("shield")));
  assert.deepEqual(choices(g, 9), ["Arcane"]);
  b.grid[8].pop();
  assert.deepEqual(choices(g, 9), ["Arcane", "Water"]);
  b.grid[9][0].sever = true;
  assert.deepEqual(choices(g, 9), ["Arcane"]);
  b.grid[9][0].sever = false;
  b.grid[8] = [g.instance(a)];
  assert.deepEqual(choices(g, 9), ["Arcane"]);
});
test("Blink relays its latest activation while existing Shield portions keep earlier elements", () => {
  const prior = cards.shield.blink;
  cards.shield.blink = true;
  try {
    for (const nextElement of ["Water", "Arcane"]) {
      const g = setup(),
        b = g.s.battle;
      put(g, "thorn", 7);
      const a = put(g, "shield", 8);
      put(g, "rain", 1);
      put(g, "blast", 9);
      activate(g, 8, "Earth");
      activate(g, 8, nextElement);
      assert.deepEqual(
        choices(g, 9),
        nextElement === "Arcane" ? ["Arcane"] : ["Arcane", nextElement],
      );
      assert.deepEqual(
        b.shields.map((p) => p.element),
        ["Earth", nextElement],
      );
      assert.equal(cardInteraction(b, a, 8).cast, nextElement);
      assert.deepEqual(cardInteraction(b, a, 8).colors, ["Earth", nextElement]);
    }
  } finally {
    cards.shield.blink = prior;
  }
});
test("Transmute overrides a relay immediately and remains a source on later turns", () => {
  const g = setup(),
    b = g.s.battle;
  put(g, "thorn", 7);
  const a = put(g, "shield", 8);
  put(g, "blast", 9);
  put(g, "transmute", 20);
  activate(g, 8, "Earth");
  const trans = g
    .legal()
    .find(
      (a) =>
        a.type === "activate" &&
        a.slot === 20 &&
        a.cardTarget === 8 &&
        a.newElement === "Water",
    );
  assert.ok(trans);
  g.act(trans);
  assert.deepEqual(choices(g, 9), ["Arcane", "Water"]);
  assert.equal(b.shields[0].element, "Earth");
  g.beginTurn();
  assert.deepEqual(choices(g, 9), ["Arcane", "Water"]);
  assert.equal(a.element, "Water");
});
test("Bracelet refills are Bronze2 Silver4 Gold7, with shared elemental conversion and saved partial block", () => {
  for (const [id, value] of [
    ["bronze", 2],
    ["silver", 4],
    ["gold", 7],
  ]) {
    const g = setup(),
      b = g.s.battle,
      x = g.addItem(id);
    g.s.equipment.wrist2 = x.uid;
    g.endTurn();
    assert.equal(b.bracelets[0].block, value);
    assert.equal(items[id].effect.block, value);
    g.act(g.legal().find((a) => a.type === "bracelet"));
    const remainder = b.bracelets[0].block;
    const h = new Game(0, g.s);
    assert.equal(h.s.battle.bracelets[0].block, remainder);
    h.endTurn();
    assert.equal(h.s.battle.bracelets[0].block, value);
  }
  assert.equal(blockHit(7, "Fire", 20, "Earth").remaining, 9);
  assert.equal(blockHit(7, "Fire", 20, "Water").remaining, 16);
  assert.equal(blockHit(7, "Fire", 20, "Fire").remaining, 13);
});
