import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { items, cards, events } from "../src/content.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
function pickup(id, moves = 2) {
  const g = new Game(23);
  g.s.mode = "field";
  g.s.field.round = 2;
  g.s.field.moves = moves;
  g.s.itemDeck = [id];
  g.s.field.entities = [{ uid: g.uid(), type: "Item", x: 5, y: 5 }];
  g.resolveTile();
  return g;
}
const cursed = Object.keys(items).find(
  (id) => items[id].cursed && items[id].slot !== "gem",
);
test("declining a cursed pickup has no ownership or curse effects and cannot be repeated", () => {
  const g = pickup(cursed);
  const before = structuredClone({
    inventory: g.s.inventory,
    equipment: g.s.equipment,
    deck: g.s.deck,
    hp: g.s.hp,
    rng: g.s.rng,
    stats: g.s.stats,
  });
  g.act(g.legal().find((a) => a.type === "leaveItem"));
  for (const key of Object.keys(before))
    assert.deepEqual(g.s[key], before[key]);
  assert.equal(g.s.mode, "field");
  assert.equal(g.s.itemOffer, undefined);
  assert.equal(g.s.field.entities.length, 0);
  assert.ok(!g.legal().some((a) => ["leaveItem", "takeItem"].includes(a.type)));
  g.resolveTile();
  assert.equal(g.s.mode, "field");
});
test("collecting a cursed pickup still adds it and applies forced equipment", () => {
  const g = pickup(cursed);
  g.act(g.legal().find((a) => a.type === "takeItem"));
  const owned = g.s.inventory.find((x) => x.id === cursed);
  assert.ok(owned);
  assert.ok(Object.values(g.s.equipment).includes(owned.uid));
  assert.equal(g.s.itemOffer, undefined);
});
test("declining consumes the pickup, resolves other tile contents, and advances the forfeited movement phase normally", () => {
  const a = pickup("bronze", 0),
    b = new Game(0, a.save());
  for (const g of [a, b])
    g.s.field.entities.push({
      uid: g.uid(),
      type: "Gold",
      value: 20,
      x: 5,
      y: 5,
    });
  a.act(a.legal().find((x) => x.type === "leaveItem"));
  b.act(b.legal().find((x) => x.type === "takeItem"));
  assert.equal(a.s.gold, 20);
  assert.ok(a.s.field.round > 2);
  const withoutIds = (field) => ({
    ...field,
    entities: field.entities.map(({ uid, ...entity }) => entity),
  });
  assert.deepEqual(withoutIds(a.s.field), withoutIds(b.s.field));
  assert.equal(a.s.rng, b.s.rng);
});
test("old pending pickups load with a stable decline choice, including Item Deck Hexes", () => {
  const hex = Object.keys(cards).find((id) => cards[id].type === "Hex");
  const old = pickup("card:" + hex).save();
  old.version = { ...old.version, rules: "1.2.0" };
  const g = new Game(0, old);
  assert.deepEqual(g.s.itemOffer, old.itemOffer);
  const before = structuredClone(g.s.deck);
  g.act(g.legal().find((a) => a.type === "leaveItem"));
  assert.deepEqual(g.s.deck, before);
});
test("AI can refuse a cursed pickup while authored Event item outcomes remain mandatory", () => {
  const g = pickup(cursed);
  assert.equal(
    new WeightedPolicy().choose(g.observe(), g.legal()).action.type,
    "leaveItem",
  );
  const e = events.find((e) => e.choices.some((c) => c.item && !c.cost));
  const index = e.choices.findIndex((c) => c.item && !c.cost);
  g.s.mode = "event";
  g.s.event = e.id;
  assert.ok(!g.legal().some((a) => a.type === "leaveItem"));
  g.act(g.legal().find((a) => a.type === "eventChoice" && a.index === index));
  assert.ok(g.s.inventory.some((x) => x.id === e.choices[index].item));
});
