import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards, enemies } from "../src/content.mjs";
function victory(enemy = "hart", seed = 91) {
  const g = new Game(seed);
  g.s.stratum = enemies[enemy].stratum || 1;
  g.s.equipment = {};
  g.s.field.round = 16;
  g.beginBattle([{ uid: g.uid(), enemy, restless: 0 }]);
  g.s.battle.enemies[0].hp = 0;
  g.checkBattle();
  if (g.s.mode === "battle") {
    g.pump();
    while (g.s.battle.reaction)
      g.act(g.legal().find((a) => a.type === "takeHit"));
  }
  return g;
}
function mixedOffer(offer) {
  assert.equal(offer.length, 3);
  assert.equal(new Set(offer).size, 3);
  assert.deepEqual(
    offer.map((id) => cards[id].rarity),
    ["legendary", "rare", "rare"],
  );
}

test("all six Archons offer one Legendary and two Rares; either rarity may be selected", () => {
  for (const boss of [
    "hart",
    "colossus",
    "choir",
    "blackBile",
    "bombadier",
    "trickster",
  ]) {
    for (const choice of [0, 1, 2]) {
      const g = victory(boss);
      assert.equal(g.s.mode, "reward");
      assert.equal(g.s.reward.boss, true);
      mixedOffer(g.s.reward.cards);
      assert.ok(g.legal().every((a) => a.type === "rewardCard"));
      const before = g.s.deck.length,
        chosen = g.s.reward.cards[choice];
      g.act(g.legal().find((a) => a.id === chosen));
      assert.equal(g.s.deck.length, before + 1);
      assert.equal(g.s.deck.at(-1).id, chosen);
      assert.equal(g.s.reward.cards, null);
      g.act(g.legal().find((a) => a.type === "rewardGem"));
      g.act(g.legal().find((a) => a.type === "rewardSetting"));
      g.act(g.legal().find((a) => a.type === "continueReward"));
      assert.equal(g.s.stratum, 2);
      if (enemies[boss].stratum === 2) assert.equal(g.s.mode, "result");
      else {
        assert.equal(g.s.mode, "tavern");
        assert.ok(g.s.shop.healer);
      }
    }
  }
});
test("mixed boss offers use seed, survive observation/load and migrate pending old offers once", () => {
  const a = victory(),
    b = victory();
  assert.deepEqual(a.s.reward, b.s.reward);
  const rng = a.s.rng,
    offer = [...a.s.reward.cards];
  a.observe();
  a.legal();
  a.normalizeRewards();
  const loaded = new Game(0, a.save());
  assert.deepEqual(loaded.s.reward.cards, offer);
  assert.equal(loaded.s.rng, rng);
  const old = a.save();
  old.version = { ...old.version, rules: "1.3.43" };
  for (const previous of [
    ["storm", "prism", "magnify"],
    ["grove", "eclipse", "bastion"],
  ]) {
    old.reward.cards = previous;
    const c = new Game(0, old),
      d = new Game(0, old);
    assert.deepEqual(c.s.reward, d.s.reward);
    mixedOffer(c.s.reward.cards);
    const e = new Game(0, c.save());
    assert.equal(e.s.rng, c.s.rng);
    assert.deepEqual(e.s.reward, c.s.reward);
  }
  old.reward.cards = null;
  const settled = new Game(0, old);
  assert.equal(
    settled.s.reward.cards,
    null,
    "no duplicate reward after choice was already settled",
  );
});
test("ordinary Mote and Eidolon rewards still allow skipping and retain their rarity rules", () => {
  for (const enemy of ["beetle", "dervish"]) {
    const g = victory(enemy);
    assert.ok(g.legal().some((a) => a.type === "skipReward"));
    assert.equal(g.s.reward.cards.length, 3);
    assert.ok(g.s.reward.cards.every((id) => cards[id].rarity !== "legendary"));
  }
});
test("Heartwood Bastion begins at one and can activate beside cards, stores Earth Ward and exhausts after three uses", () => {
  const g = new Game(92);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "place";
  b.focus = 2;
  b.hand = [g.newCard("bastion")];
  b.grid[9] = [g.instance(g.newCard("clear"))];
  g.act(g.legal().find((a) => a.type === "place" && a.slot === 10));
  const c = b.grid[10][0];
  assert.equal(c.ward, 1);
  assert.equal(c.element, "Earth");
  assert.equal(b.focus, 0);
  b.phase = "activate";
  b.channel = 3;
  for (let n = 1; n <= 3; n++) {
    g.act(g.legal().find((a) => a.type === "activate" && a.slot === 10));
    assert.equal(c.ward, 1 + n * 18);
    assert.ok(!g.legal().some((a) => a.type === "activate" && a.slot === 10));
    b.turn++;
  }
  assert.equal(g.allowance(c, 10), 0);
  assert.equal(c.ward, 55);
  assert.equal(cards.bastion.construct, true);
});
