import test from "node:test";
import assert from "node:assert/strict";
import { Game, cardPower } from "../src/engine.mjs";
import { attackPreview } from "../src/combat-preview.mjs";
import { upgradeHelp } from "../src/battle-feedback.mjs";
import { cards } from "../src/content.mjs";
function setup() {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  g.s.battle.phase = "activate";
  g.s.battle.enemies[0].hp = 100;
  return g;
}
function put(g, id, i) {
  return (g.s.battle.grid[i] = [g.instance(g.newCard(id))])[0];
}
test("live power follows neighbors, Sever, row elements, HP, upgrades and snapshot identity", () => {
  const g = setup(),
    b = g.s.battle,
    c = put(g, "thorn", 8);
  assert.equal(cardPower(b, c, 8), 4);
  put(g, "blast", 7);
  put(g, "blast", 9);
  assert.equal(cardPower(b, c, 8), 8);
  b.grid[9][0].sever = true;
  assert.equal(cardPower(b, c, 8), 6);
  c.sever = true;
  assert.equal(cardPower(b, c, 8), 4);
  c.sever = false;
  c.upgrade = true;
  assert.equal(cardPower(b, c, 8), 9);
  const row = put(g, "ignis", 14);
  const fire = put(g, "corner", 18);
  assert.equal(cardPower(b, row, 14), 7);
  fire.element = "Water";
  assert.equal(cardPower(b, row, 14), 5);
  const ally = put(g, "sapling", 15);
  ally.hp = 17;
  assert.equal(cardPower(b, ally, 15), 17);
  const snapshot = structuredClone(b);
  assert.equal(cardPower(snapshot, structuredClone(c), 8), g.cardPower(c, 8));
});
test("target preview matches actual single-card hits without changing state, RNG or costs", () => {
  for (const config of [
    { element: "Wind" },
    { element: "Fire" },
    { element: "Arcane" },
    { element: "Wind", resist: "Earth" },
    { element: "Arcane", guard: 3 },
    { element: "Arcane", flicker: true },
    { element: "Arcane", wisp: true },
  ]) {
    const g = setup(),
      b = g.s.battle,
      c = put(g, "thorn", 8),
      e = b.enemies[0];
    Object.assign(e, config);
    put(g, "blast", 7);
    const before = JSON.stringify(g.s),
      preview = attackPreview(b, c, 8, e);
    assert.equal(JSON.stringify(g.s), before);
    const hp = e.hp;
    g.act(g.legal().find((a) => a.type === "activate" && a.slot === 8));
    assert.equal(hp - e.hp, preview.hpLoss, JSON.stringify(config));
  }
});
test("attuned attack previews selected element; charging and random attacks make no false forecast", () => {
  const g = setup(),
    b = g.s.battle,
    c = put(g, "blast", 0),
    e = b.enemies[0];
  e.element = "Earth";
  assert.equal(attackPreview(b, c, 0, e, "Fire").damage, 6);
  assert.equal(attackPreview(b, c, 0, e, "Wind").damage, 2);
  const kiln = put(g, "kiln", 1);
  assert.equal(attackPreview(b, kiln, 1, e), null);
  kiln.charge = 2;
  assert.equal(attackPreview(b, kiln, 1, e).damage, 30);
  assert.match(upgradeHelp(cards.blast), /Damage 4 → 7/);
  assert.match(upgradeHelp(cards.shield), /Shield 4 → 7/);
  assert.match(upgradeHelp(cards.sapling), /Initial HP/);
});
