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
    c = put(g, "thorn", 6);
  assert.equal(cardPower(b, c, 6), 4);
  put(g, "shield", 5);
  put(g, "shield", 7);
  assert.equal(cardPower(b, c, 6), 8);
  b.grid[7][0].sever = true;
  assert.equal(cardPower(b, c, 6), 6);
  c.sever = true;
  assert.equal(cardPower(b, c, 6), 4);
  c.sever = false;
  c.upgrade = true;
  assert.equal(cardPower(b, c, 6), 9);
  const row = put(g, "ignis", 10);
  const fire = put(g, "corner", 14);
  assert.equal(cardPower(b, row, 10), 7);
  fire.element = "Water";
  assert.equal(cardPower(b, row, 10), 5);
  const ally = put(g, "sapling", 11);
  ally.hp = 17;
  assert.equal(cardPower(b, ally, 11), 17);
  const snapshot = structuredClone(b);
  assert.equal(cardPower(snapshot, structuredClone(c), 6), g.cardPower(c, 6));
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
      c = put(g, "thorn", 6),
      e = b.enemies[0];
    Object.assign(e, config);
    put(g, "shield", 5);
    const before = JSON.stringify(g.s),
      preview = attackPreview(b, c, 6, e);
    assert.equal(JSON.stringify(g.s), before);
    const hp = e.hp;
    g.act(g.legal().find((a) => a.type === "activate" && a.slot === 6));
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
  assert.equal(attackPreview(b, kiln, 1, e).damage, 45);
  assert.match(upgradeHelp(cards.blast), /Damage 4 → 7/);
  assert.match(upgradeHelp(cards.shield), /Shield 4 → 7/);
  assert.match(upgradeHelp(cards.sapling), /Initial HP/);
});
