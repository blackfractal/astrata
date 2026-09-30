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
