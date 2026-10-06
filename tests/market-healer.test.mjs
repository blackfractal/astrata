import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
test("cursed removal requires a present healer and payment; ordinary sales remain available", () => {
  const g = new Game(8);
  g.s.gold = 500;
  g.openTavern();
  const curse = g.addItem("curseRing"),
    ordinary = g.addItem("bronze");
  g.addCard("rust");
  g.s.shop.healer = false;
  assert.ok(!g.legal().some((a) => a.type === "sell" && a.uid === curse.uid));
  assert.ok(!g.legal().some((a) => a.type === "removeHex"));
  assert.ok(g.legal().some((a) => a.type === "sell" && a.uid === ordinary.uid));
  g.s.shop.healer = true;
  const remove = g
    .legal()
    .find((a) => a.type === "sell" && a.uid === curse.uid);
  assert.ok(remove);
  g.s.shop.healer = false;
  assert.throws(() => g.act(remove), /Illegal action/);
  g.s.shop.healer = true;
  g.act(remove);
  assert.equal(g.s.gold, 465);
  assert.ok(!g.getItem(curse.uid));
  assert.equal(g.s.shop.removeUsed, false);
});
test("old restricted stock cannot be bought and previous saves still load", () => {
  const g = new Game(8);
  g.s.gold = 500;
  g.openTavern();
  g.s.shop.stock = ["curseRing", "card:rust", "bronze"];
  assert.deepEqual(
    g
      .legal()
      .filter((a) => a.type === "buy")
      .map((a) => a.index),
    [2],
  );
  for (const rules of ["1.3.26", "1.3.27"]) {
    const old = structuredClone(g.s);
    old.version.rules = rules;
    assert.equal(new Game(0, old).s.mode, "tavern");
  }
});

test("fitted gems cannot sell separately; paired sales remove both owned items and survive reload", () => {
  for (const equipped of [true, false]) {
    const g = new Game(8);
    g.openTavern();
    const setting = equipped
      ? g.getItem(g.s.equipment.wrist2)
      : g.addItem("bronze");
    const gem = g.addItem("sapphire");
    setting.gem = gem.uid;
    assert.ok(!g.legal().some((a) => a.type === "sell" && a.uid === gem.uid));
    const before = g.s.gold;
    const sale = g
      .legal()
      .find((a) => a.type === "sell" && a.uid === setting.uid);
    assert.equal(sale.value, 42); // Bronze40/2 + floor(Sapphire45/2).
    g.act(sale);
    assert.ok(!g.getItem(setting.uid));
    assert.ok(!g.getItem(gem.uid));
    assert.ok(!Object.values(g.s.equipment).includes(setting.uid));
    assert.equal(g.s.gold, before + sale.value);
    assert.deepEqual(g.s.stats.sales.slice(-2), ["bronze", "sapphire"]);
    assert.throws(() => g.act(sale), /Illegal action/);
    const r = new Game(0, structuredClone(g.s));
    assert.ok(!r.getItem(setting.uid) && !r.getItem(gem.uid));
  }
});

test("a fitted cursed gem prevents selling the pair to evade the Healer", () => {
  const g = new Game(8);
  g.openTavern();
  const setting = g.addItem("bronze"),
    gem = g.addItem("curseGem");
  setting.gem = gem.uid;
  g.s.gold = 100;
  assert.ok(!g.legal().some((a) => a.type === "sell" && a.uid === setting.uid));
});

test("socketed Cursed Gems require a paid Healer removal, leaving their Setting intact", () => {
  const g = new Game(8);
  g.openTavern();
  g.s.gold = 500;
  const setting = g.getItem(g.s.equipment.wrist2),
    gem = g.addItem("curseGem");
  setting.gem = gem.uid;
  g.s.shop.healer = false;
  assert.ok(!g.legal().some((a) => a.type === "sell" && a.uid === gem.uid));
  g.s.shop.healer = true;
  const treatment = g
    .legal()
    .find((a) => a.type === "sell" && a.uid === gem.uid);
  assert.equal(treatment.effects.cursed, true);
  g.act(treatment);
  assert.equal(g.s.gold, 500 - treatment.value);
  assert.equal(setting.gem, null);
  assert.ok(g.getItem(setting.uid));
  assert.ok(!g.getItem(gem.uid));
  assert.equal(g.s.shop.removeUsed, false);
});
