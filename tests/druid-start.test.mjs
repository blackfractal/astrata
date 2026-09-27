import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";

test("Druid opens each battle with four revealed cards, one Focus, two Channel and its 12-card starter", () => {
  const g = new Game(9);
  g.s.inventory = [];
  for (const slot of Object.keys(g.s.equipment)) g.s.equipment[slot] = null;
  const ids = g.s.deck.map((c) => c.id);
  assert.equal(ids.length, 12);
  assert.equal(ids.filter((id) => id === "blast").length, 4);
  assert.equal(ids.filter((id) => id === "shield").length, 4);
  for (const id of ["familiar", "clear", "focus", "sapling"])
    assert.equal(ids.filter((x) => x === id).length, 1);
  for (let battle = 0; battle < 2; battle++) {
    g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
    const b = g.s.battle;
    assert.deepEqual([b.insight, b.focus, b.channel], [4, 1, 2]);
    assert.equal(b.hand.length, 4);
    assert.equal(b.deck.length, 8);
    b.channel = 0;
    b.focus = 0;
    g.endTurn();
    assert.deepEqual([b.insight, b.focus, b.channel], [4, 1, 2]);
    assert.equal(b.hand.length, 4);
  }
});

test("loading an older run preserves its edited deck and applies base Insight at the next Reveal", () => {
  const original = new Game(9);
  original.s.deck.splice(
    original.s.deck.findIndex((c) => c.id === "shield"),
    1,
  );
  const saved = original.save();
  saved.version = { ...saved.version, rules: "1.3.4" };
  const loaded = new Game(0, saved);
  assert.deepEqual(loaded.s.deck, saved.deck);
  loaded.beginBattle([{ uid: loaded.uid(), enemy: "bat", restless: 0 }]);
  assert.equal(loaded.s.battle.hand.length, 4);
});
