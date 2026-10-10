import test from "node:test";
import assert from "node:assert/strict";
import {
  Game,
  cardPower,
  damageBonusNeighbors,
  hasDirectDamageActivation,
} from "../src/engine.mjs";
import { attackPreview } from "../src/combat-preview.mjs";
import { boardConnections } from "../src/board-interactions.mjs";
function setup() {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.grid = b.grid.map(() => []);
  b.phase = "activate";
  b.channel = 10;
  b.enemies[0].hp = b.enemies[0].maxHp = 100;
  const put = (id, slot) => (b.grid[slot] = [g.instance(g.newCard(id))])[0];
  const choir = put("thorn", 8);
  return { g, b, put, choir };
}
test("Choir counts damaging activations, not utility, defense, or status-only neighbors", () => {
  const { b, put, choir } = setup();
  put("transmute", 1);
  put("shield", 7);
  put("clear", 9);
  put("rot", 15);
  assert.equal(cardPower(b, choir, 8), 4);
  assert.deepEqual(damageBonusNeighbors(b, choir, 8), []);
  for (const id of [
    "blast",
    "sapling",
    "grove",
    "kiln",
    "seed",
    "root",
    "thorn",
    "plasma",
  ]) {
    const c = put(id, 7);
    c.used = 99;
    c.lastActivatedTurn = b.turn;
    c.freeze = b.turn + 2;
    assert.ok(hasDirectDamageActivation(c), id);
    assert.equal(cardPower(b, choir, 8), 6, id);
  }
  const rot = put("rot", 7);
  assert.equal(cardPower(b, choir, 8), 4);
  rot.upgrade = true;
  assert.equal(cardPower(b, choir, 8), 6, "upgraded Slow Rot has a direct hit");
});
test("Choir only counts connected orthogonal top cards, once per space", () => {
  const { g, b, put, choir } = setup();
  put("blast", 0);
  put("blast", 1);
  put("plasma", 7);
  put("sapling", 9);
  put("kiln", 15);
  b.grid[7].push(g.instance(g.newCard("plasma")));
  assert.equal(cardPower(b, choir, 8), 12);
  b.grid[9][0].sever = true;
  assert.equal(cardPower(b, choir, 8), 10);
  b.grid[1].push(g.instance(g.newCard("heat")));
  assert.equal(
    cardPower(b, choir, 8),
    8,
    "Heat is status-only and covers the attacker",
  );
  choir.upgrade = true;
  assert.equal(cardPower(b, choir, 8), 11);
  choir.sever = true;
  assert.equal(cardPower(b, choir, 8), 7);
});
test("Choir connection lines distinguish attack support from Shield attunement", () => {
  const { b, put } = setup();
  put("transmute", 1);
  put("shield", 7);
  put("blast", 9);
  put("kiln", 15);
  const links = boardConnections(b);
  assert.deepEqual(
    links
      .filter((l) => l.to === 8 && l.type === "benefit")
      .map((l) => l.from)
      .sort((a, b) => a - b),
    [9, 15],
  );
  assert.ok(
    links.some((l) => l.from === 8 && l.to === 7 && l.type === "attune"),
  );
  assert.ok(!links.some((l) => l.from === 1 && l.to === 8));
});
test("Transmuted Choir preview and actual damage share the restricted count, including resumed saves", () => {
  const { g, b, put, choir } = setup();
  put("transmute", 1);
  put("shield", 7);
  put("blast", 9);
  put("kiln", 15);
  choir.element = "Water";
  choir.transmuted = true;
  b.enemies[0].element = "Fire";
  const snapshot = JSON.stringify(g.s);
  assert.equal(cardPower(b, choir, 8), 8);
  assert.equal(attackPreview(b, choir, 8, b.enemies[0]).hpLoss, 12);
  assert.equal(JSON.stringify(g.s), snapshot);
  const saved = structuredClone(g.s);
  saved.version.rules = "2.1.11";
  const h = new Game(0, saved);
  const a = h.legal().find((a) => a.type === "activate" && a.slot === 8);
  h.act(a);
  assert.equal(h.s.battle.enemies[0].hp, 88);
});
