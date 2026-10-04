import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const excludedRewards = ["blast", "shield", "familiar", "clear", "sapling"];
test("card rewards exclude starting cards except Focus Energy; decks and shops retain them", () => {
  for (let seed = 1; seed <= 100; seed++) {
    const g = new Game(seed);
    for (const stratum of [1, 2])
      for (const rare of [false, true]) {
        g.s.stratum = stratum;
        const offer = g.offer(rare);
        assert.equal(offer.length, 3);
        assert.equal(new Set(offer).size, 3);
        assert.ok(offer.every((id) => !excludedRewards.includes(id)));
      }
    assert.ok(g.pool("common", true).some((c) => c.id === "focus"));
    for (const id of excludedRewards) {
      assert.ok(g.s.deck.some((c) => c.id === id));
      assert.ok(g.pool().some((c) => c.id === id));
    }
  }
});
test("old pending rewards replace only the banned entries, deterministically and without rerolling", () => {
  for (const offer of [
    ["blast", "shield", "cinder"],
    ["sapling", "familiar", "focus"],
    ["clear", "focus", "water"],
  ]) {
    const old = new Game(4).save();
    old.version = { ...old.version, rules: "1.3.0" };
    old.mode = "reward";
    old.reward = {
      cards: offer,
      gem: null,
      setting: null,
    };
    const a = new Game(0, old),
      b = new Game(0, old);
    assert.deepEqual(a.s, b.s);
    assert.equal(a.s.rng, old.rng);
    for (let i = 0; i < offer.length; i++)
      if (!excludedRewards.includes(offer[i]))
        assert.equal(a.s.reward.cards[i], offer[i]);
    assert.equal(new Set(a.s.reward.cards).size, 3);
    assert.ok(
      a
        .legal()
        .filter((x) => x.type === "rewardCard")
        .every((x) => !excludedRewards.includes(x.id)),
    );
    assert.deepEqual(new Game(0, a.save()).s, a.s);
    assert.deepEqual(a.s.deck, old.deck);
  }
});
test("Reveal presentation captures the drawn order without changing game state or RNG", () => {
  const a = new Game(6),
    b = new Game(6);
  b.capturePresentation = true;
  for (const g of [a, b])
    g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
  assert.deepEqual(a.s, b.s);
  const frame = b.presentation.find((x) => x.kind === "reveal");
  assert.ok(frame);
  assert.deepEqual(
    frame.cards,
    a.s.battle.hand.map((x) => x.uid),
  );
  assert.deepEqual(frame.state.battle.hand, a.observe().battle.hand);
});

test("pure next-turn economy Objects place for zero Focus and still cost Channel", () => {
  const g = new Game(7);
  g.s.inventory = [];
  for (const k of Object.keys(g.s.equipment)) g.s.equipment[k] = null;
  g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
  const b = g.s.battle;
  b.hand = ["clear", "rain", "tide"].map((id) => g.newCard(id));
  b.focus = 0;
  for (let slot = 0; slot < 3; slot++) {
    const uid = b.hand[0].uid;
    g.act(
      g
        .legal()
        .find((a) => a.type === "place" && a.uid === uid && a.slot === slot),
    );
  }
  assert.equal(b.focus, 0);
  g.act(g.legal().find((a) => a.type === "activatePhase"));
  b.channel = 3;
  for (let slot = 0; slot < 3; slot++) {
    const before = b.channel;
    g.act(g.legal().find((a) => a.type === "activate" && a.slot === slot));
    assert.equal(b.channel, before - 1);
  }
  assert.equal(b.focus, 0);
  g.endTurn();
  assert.equal(b.focus, 3);
  assert.equal(b.revealInsight, 7); // Clear +2; Tide has one adjacent occupied space (+1).
  assert.equal(b.insight, 0);
});
