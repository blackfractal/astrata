import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards, enemies, events } from "../src/content.mjs";
const healers = Object.values(cards).filter(
  (c) => c.effects.heal || c.effects.allyHeal,
);
function setup() {
  const g = new Game(43);
  g.s.inventory = [];
  g.s.equipment = {};
  g.beginBattle([{ uid: g.uid(), enemy: "colossus", restless: 0 }]);
  g.s.battle.phase = "activate";
  g.s.battle.channel = 10;
  return g;
}
function put(g, id, i) {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[i].push(c);
  return c;
}

test("every HP-healing card resolves once then goes to Destroyed, even under Keystone", () => {
  assert.equal(healers.length, 5);
  for (const d of healers) {
    const g = setup(),
      b = g.s.battle,
      c = put(g, d.id, 1),
      ally = put(g, "familiar", 2);
    put(g, "keystone", 0);
    g.s.hp = 20;
    ally.hp = 1;
    g.s.status = { burn: 2, poison: 3, corrode: 1 };
    ally.lock = true;
    assert.equal(g.allowance(c, 1), 1);
    assert.equal(g.recallCost(b.grid[1]), null);
    const a = g.legal().find((a) => a.type === "activate" && a.slot === 1);
    assert.ok(a);
    g.act(a);
    assert.equal(
      g.s.hp,
      20 + (d.effects.heal || 0) + (d.effects.adjHeal || 0) * 2,
    );
    assert.equal(ally.hp, 1 + (d.effects.allyHeal || 0));
    if (d.effects.cleanse)
      assert.deepEqual(g.s.status, { burn: 0, poison: 0, corrode: 0 });
    if (d.effects.unbind) assert.equal(ally.lock, false);
    assert.deepEqual(b.grid[1], []);
    assert.equal(b.destroyed.at(-1).uid, c.uid);
    assert.equal(b.channel, 9);
    assert.equal(g.allowance(c, 1), 0);
    assert.ok(!g.legal().some((a) => a.type === "activate" && a.slot === 1));
  }
});

test("healing at full HP still consumes the card; ownership restores it next battle", () => {
  const g = setup(),
    owned = g.newCard("soothe");
  g.s.deck.push(owned);
  const c = g.instance(owned),
    b = g.s.battle;
  b.grid[1] = [c];
  g.act(g.legal().find((a) => a.type === "activate" && a.slot === 1));
  assert.equal(g.s.hp, g.s.maxHp);
  assert.equal(b.destroyed[0].uid, c.uid);
  g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
  const restored = [
    ...g.s.battle.deck,
    ...g.s.battle.hand,
    ...g.s.battle.grid.flat(),
  ].find((x) => x.uid === owned.uid);
  assert.ok(restored);
  assert.equal(g.instance(restored).used, 0);
  assert.equal(g.s.battle.destroyed.length, 0);
});

test("Fusion destroys only the covered healer, preserving Heat and its Burn", () => {
  const g = setup(),
    b = g.s.battle,
    healer = put(g, "soothe", 1),
    heat = put(g, "heat", 1);
  g.s.hp = 20;
  g.act(g.legal().find((a) => a.type === "activate" && a.slot === 1));
  assert.equal(g.s.hp, 24);
  assert.deepEqual(b.grid[1], [heat]);
  assert.equal(b.destroyed[0].uid, healer.uid);
  assert.equal(b.enemies[0].status.burn, 8);
});

test("healing cards are rare, weighted down in rare offers, and scarce in Item Decks", () => {
  const g = new Game(63),
    ids = new Set(healers.map((c) => c.id));
  assert.ok(healers.every((c) => c.rarity === "rare" && c.offerWeight === 1));
  assert.ok(g.pool("common").every((c) => !ids.has(c.id)));
  for (let i = 0; i < 100; i++)
    assert.ok(g.offer().every((id) => !ids.has(id)));
  let heal = 0,
    total = 0;
  for (let i = 0; i < 2000; i++) {
    const offer = g.rareOffer(3);
    assert.equal(new Set(offer).size, 3);
    heal += offer.filter((id) => ids.has(id)).length;
    total += offer.length;
  }
  const regular = g.pool("rare").filter((c) => !ids.has(c.id)).length;
  assert.ok(
    heal / total < (ids.size / (regular + ids.size)) * 0.65,
    `${heal}/${total}`,
  );
  let inDeck = 0;
  for (let i = 1; i <= 200; i++)
    inDeck += new Game(i).s.itemDeck.filter(
      (id) => id.startsWith("card:") && ids.has(id.slice(5)),
    ).length;
  assert.ok(inDeck > 150 && inDeck < 350, `${inDeck}/1000`);
  assert.ok(events.every((e) => e.choices.every((c) => !ids.has(c.card))));
});

test("starter strength and enemy HP match the revised balance, including summons", () => {
  assert.equal(cards.blast.effects.damage, 4);
  assert.equal(cards.shield.effects.shield, 4);
  const before = [
    8, 10, 9, 9, 6, 12, 11, 7, 10, 13, 8, 10, 30, 25, 28, 32, 26, 24, 34, 100,
    88, 92, 6,
  ];
  assert.deepEqual(
    Object.values(enemies)
      .filter((e) => !e.tutorialOnly && (e.stratum || 1) === 1)
      .map((e) => e.hp),
    before.map((h) => Math.ceil(Math.ceil((h * 115) / 100) * 1.5)),
  );
});

test("previous saves retain acquired healing cards and active enemy HP", () => {
  const g = setup();
  g.s.deck.push(g.newCard("soothe"));
  g.s.version = { ...g.s.version, rules: "1.3.6" };
  g.s.battle.enemies[0].hp = 83;
  const loaded = new Game(0, g.s);
  assert.ok(loaded.s.deck.some((c) => c.id === "soothe"));
  assert.equal(loaded.s.battle.enemies[0].hp, 83);
});
