import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { discover, emptyCollection } from "../src/archive-profile.mjs";

const choose = (g, type) => {
  const a = g.legal().find((a) => a.type === type);
  assert.ok(a, type);
  g.act(a);
};

test("Between-Strata Traveler takes a voluntary gift once, with no material reward or gossip", () => {
  let g = new Game(72);
  g.enterStratum2();
  g.s.gold = 15;
  assert.ok(!g.legal().some((a) => a.type === "gossip"));
  const before = structuredClone({
    hp: g.s.hp,
    deck: g.s.deck,
    inventory: g.s.inventory,
    rng: g.s.rng,
  });
  choose(g, "giveTraveler");
  assert.equal(g.s.gold, 0);
  assert.deepEqual(
    { hp: g.s.hp, deck: g.s.deck, inventory: g.s.inventory, rng: g.s.rng },
    before,
  );
  assert.equal(g.s.revealedArchon, undefined);
  assert.equal(g.s.stats.travelerDonations.length, 1);
  assert.equal(g.s.stats.travelerDonations[0].afterStratum, 1);
  g = new Game(0, g.save());
  g.s.gold = 100;
  assert.ok(
    !g
      .legal()
      .some((a) =>
        ["giveTraveler", "declineTraveler", "gossip"].includes(a.type),
      ),
  );
  // Even rebuilding the same intermission cannot count a second donation.
  g.openTavern({ afterStratum: 1 });
  assert.ok(!g.legal().some((a) => a.type === "giveTraveler"));
});

test("Declining and insufficient Gold work; old pending intermission saves adopt donation, field Taverns keep gossip", () => {
  let g = new Game(9);
  g.enterStratum2();
  delete g.s.shop.afterStratum;
  g.s.version = { ...g.s.version, rules: "2.1.4" };
  g = new Game(0, g.save());
  g.s.gold = 14;
  assert.ok(!g.legal().some((a) => a.type === "giveTraveler"));
  const rng = g.s.rng;
  choose(g, "declineTraveler");
  assert.equal(g.s.gold, 14);
  assert.equal(g.s.rng, rng);
  assert.equal(g.s.stats.travelerDonations, undefined);
  g = new Game(0, g.save());
  g.s.gold = 100;
  assert.ok(!g.legal().some((a) => a.type === "giveTraveler"));
  delete g.s.loomIntro;
  g.openTavern();
  assert.ok(g.legal().some((a) => a.type === "gossip"));
  assert.ok(!g.legal().some((a) => a.type === "giveTraveler"));
});

test("Kindness needs donations at three distinct intermissions in one normal run and remains earned", () => {
  const c = emptyCollection(),
    g = new Game(30);
  g.s.gold = 100;
  for (const afterStratum of [1, 2, 3]) {
    g.openTavern({ afterStratum });
    choose(g, "giveTraveler");
    discover(c, g.s, "visit" + afterStratum);
    assert.equal(!!c.achievements["traveler-kindness"], afterStratum === 3);
  }
  discover(c, g.s, "later");
  assert.equal(c.achievements["traveler-kindness"].earnedAt, "visit3");
  const separate = emptyCollection();
  for (const afterStratum of [1, 2, 3])
    discover(separate, {
      stats: { travelerDonations: [{ afterStratum, gold: 15 }] },
    });
  assert.equal(separate.achievements["traveler-kindness"], undefined);
  for (const donations of [
    [
      { afterStratum: 1, gold: 15 },
      { afterStratum: 1, gold: 15 },
      { afterStratum: 1, gold: 15 },
    ],
    [
      { afterStratum: 1, gold: 15 },
      { afterStratum: 2, gold: 0 },
      { afterStratum: 3, gold: 15 },
    ],
  ])
    discover(separate, { stats: { travelerDonations: donations } });
  assert.equal(separate.achievements["traveler-kindness"], undefined);
  discover(separate, { ...g.s, tutorial: { id: "stratum2" } });
  assert.equal(separate.achievements["traveler-kindness"], undefined);
});
