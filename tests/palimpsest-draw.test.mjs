import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";

function fixture() {
  const g = new Game(737);
  g.s.equipment = {};
  g.s.inventory = [];
  g.beginBattle([{ uid: g.uid(), enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  Object.assign(b, { hand: [], deck: [], discard: [], revealedCount: 0, focus: 10 });
  return { g, b };
}
function act(g, type, filter = () => true) {
  const a = g.legal().find(a => a.type === type && filter(a));
  assert.ok(a, `legal ${type}`);
  g.act(a);
}

test("Reveal replaces each drawn Palimpsest without spending additional Insight", () => {
  const { g, b } = fixture();
  b.deck = ["palimpsest", "palimpsest", ...Array(5).fill("blast")].map(id => g.newCard(id));
  b.drawTop = b.deck.map(c => c.uid);
  g.reveal();
  assert.equal(b.revealInsight, 4);
  assert.equal(b.insight, 0);
  assert.equal(b.hand.length, 6);
  assert.equal(b.hand.filter(c => c.id === "blast").length, 4);
  assert.equal(b.revealedCount, 6);
  assert.equal(b.deck.length, 1);
});

test("Palimpsest replacement recycles Discard and terminates with only Palimpsests left", () => {
  const { g, b } = fixture();
  b.deck = [g.newCard("palimpsest")];
  b.discard = [g.newCard("palimpsest")];
  const drawn = g.drawCards(1);
  assert.equal(drawn.length, 2);
  assert.equal(new Set(drawn.map(c => c.uid)).size, 2);
  assert.equal(b.deck.length + b.discard.length, 0);
});

test("Insight Dew triggers replacement draws, updates revealed count and drawn Hex state", () => {
  const { g, b } = fixture();
  const existing = g.newCard("blast");
  b.hand = [existing];
  b.revealedCount = 4;
  b.deck = [g.newCard("palimpsest"), g.newCard("milky")];
  b.drawTop = b.deck.map(c => c.uid);
  const potion = g.addItem("insightDew");
  act(g, "consume", a => a.uid === potion.uid);
  assert.deepEqual(b.hand.map(c => c.id), ["blast", "palimpsest", "milky"]);
  assert.equal(b.hand[0].uid, existing.uid);
  assert.equal(b.revealedCount, 6);
  assert.equal(b.milky, true);
});

test("Inspiration draws trigger Palimpsest but grant free placement only to the selected card", () => {
  for (const id of ["wildInspiration", "perfectInspiration"]) {
    const { g, b } = fixture();
    const pal = g.newCard("palimpsest"), blast = g.newCard("blast");
    b.deck = [pal, blast];
    b.drawTop = [pal.uid, blast.uid];
    const potion = g.addItem(id);
    act(g, "consume", a => a.uid === potion.uid && (a.card == null || a.card === pal.uid));
    assert.deepEqual(b.hand.map(c => c.uid), [pal.uid, blast.uid]);
    assert.equal(b.inspiration.uid, pal.uid);
    assert.equal(b.revealedCount, 2);
  }
});

test("Melding and Undertow return do not trigger Palimpsest draws", () => {
  const { g, b } = fixture();
  const host = g.instance(g.newCard("blast"));
  b.grid[8] = [host];
  const pal = g.newCard("palimpsest"), undertow = g.newCard("undertow");
  const undrawn = g.newCard("shield");
  b.hand = [pal, undertow];
  b.deck = [undrawn];
  act(g, "place", a => a.uid === pal.uid && a.slot === 8);
  assert.deepEqual(b.deck, [undrawn]);
  act(g, "place", a => a.uid === undertow.uid && a.slot === 8);
  assert.deepEqual(new Set(b.hand.map(c => c.uid)), new Set([host.uid, pal.uid]));
  assert.deepEqual(b.deck, [undrawn]);
  assert.equal(b.revealedCount, 0);
});

test("Continue preserves an already drawn Palimpsest without retroactive draws", () => {
  const { g, b } = fixture();
  b.hand = [g.newCard("palimpsest")];
  b.deck = [g.newCard("blast"), g.newCard("shield")];
  const saved = structuredClone(g.s);
  saved.version.rules = "4.0.15";
  const h = new Game(0, saved);
  assert.deepEqual(h.s.battle.hand, b.hand);
  assert.deepEqual(h.s.battle.deck, b.deck);
  assert.equal(h.s.rng, g.s.rng);
});
