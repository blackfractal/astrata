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

test("selling a socketed Gem clears its Setting, pays only for the Gem and survives reload", () => {
  const g = new Game(8);
  g.openTavern();
  const setting = g.getItem(g.s.equipment.wrist2),
    gem = g.addItem("sapphire");
  setting.gem = gem.uid;
  const before = g.s.gold;
  const sale = g.legal().find((a) => a.type === "sell" && a.uid === gem.uid);
  assert.ok(sale);
  g.act(sale);
  assert.equal(setting.gem, null);
  assert.equal(g.s.equipment.wrist2, setting.uid);
  assert.ok(!g.getItem(gem.uid));
  assert.equal(g.s.gold, before + sale.value);
  assert.throws(() => g.act(sale), /Illegal action/);
  const restored = new Game(0, g.s);
  assert.equal(restored.getItem(setting.uid).gem, null);
  assert.ok(!restored.getItem(gem.uid));
});

test("selling equipped or spare Settings preserves their exact Gem, including Cursed Gems", () => {
  for (const equipped of [true, false])
    for (const id of ["sapphire", "curseGem"]) {
      const g = new Game(8);
      g.openTavern();
      const setting = equipped
        ? g.getItem(g.s.equipment.wrist2)
        : g.addItem("bronze");
      const gem = g.addItem(id);
      setting.gem = gem.uid;
      const before = g.s.gold;
      const sale = g
        .legal()
        .find((a) => a.type === "sell" && a.uid === setting.uid);
      g.act(sale);
      assert.ok(!g.getItem(setting.uid));
      assert.equal(g.getItem(gem.uid).id, id);
      assert.equal(g.s.inventory.filter((x) => x.uid === gem.uid).length, 1);
      assert.ok(!g.s.inventory.some((x) => x.gem === gem.uid));
      assert.ok(!Object.values(g.s.equipment).includes(setting.uid));
      assert.equal(g.s.gold, before + sale.value);
    }
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
