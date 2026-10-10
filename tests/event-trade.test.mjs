import test from "node:test";
import assert from "node:assert/strict";
import { Game, tradeAssets } from "../src/engine.mjs";
import { events, items } from "../src/content.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
function fixture() {
  const g = new Game(8);
  g.s.mode = "event";
  g.s.event = "trader";
  g.s.field.stage = "player";
  g.s.field.moves = 2;
  g.s.field.entities = [];
  return g;
}
const trades = (g) =>
  g.legal().filter((a) => a.type === "eventChoice" && a.index === 0);
test("Trader exposes exact equipped and spare Bracelet copies and selecting one consumes only that instance", () => {
  const g = fixture(),
    starter = g.s.equipment.wrist2,
    spare = g.addItem("bronze"),
    silver = g.addItem("silver");
  g.s.equipment.wrist1 = silver.uid;
  assert.deepEqual(
    trades(g).map((a) => a.tradeItem),
    [starter, spare.uid, silver.uid],
  );
  const otherGear = structuredClone(g.s.equipment),
    gold = g.s.gold,
    hp = g.s.hp,
    moves = g.s.field.moves;
  const a = trades(g).find((a) => a.tradeItem === spare.uid);
  g.act(a);
  assert.ok(!g.getItem(spare.uid));
  assert.ok(g.getItem(starter));
  assert.ok(g.getItem(silver.uid));
  assert.deepEqual(g.s.equipment, otherGear);
  assert.equal(g.s.deck.filter((c) => c.id === "grove").length, 1);
  assert.equal(g.s.gold, gold);
  assert.equal(g.s.hp, hp);
  assert.equal(g.s.field.moves, moves);
  assert.throws(() => g.act(a), /Illegal action/);
});
test("Equipped trade clears its slot and surrenders its socketed Gem", () => {
  const g = fixture(),
    uid = g.s.equipment.wrist2,
    gem = g.addItem("sapphire");
  g.getItem(uid).gem = gem.uid;
  g.act(trades(g).find((a) => a.tradeItem === uid));
  assert.equal(g.s.equipment.wrist2, null);
  assert.ok(!g.getItem(gem.uid));
  assert.ok(!g.s.inventory.some((x) => x.gem === gem.uid));
});
test("A saved spare fitted Bracelet trades its exact Gem, preserving loose duplicates", () => {
  const g = fixture(),
    spare = g.addItem("bronze"),
    fitted = g.addItem("ruby"),
    loose = g.addItem("ruby");
  spare.gem = fitted.uid;
  const h = new Game(0, g.save());
  const a = trades(h).find((a) => a.tradeItem === spare.uid);
  assert.match(a.label, /with Ruby/);
  h.act(a);
  assert.ok(!h.getItem(spare.uid));
  assert.ok(!h.getItem(fitted.uid));
  assert.ok(h.getItem(loose.uid));
  assert.ok(h.getItem(h.s.equipment.wrist2));
  const reloaded = new Game(0, h.save());
  assert.ok(!reloaded.getItem(fitted.uid));
  assert.equal(reloaded.s.deck.filter((c) => c.id === "grove").length, 1);
});
test("A Cursed fitted Gem prevents trading the Setting as a removal loophole", () => {
  const g = fixture(),
    uid = g.s.equipment.wrist2;
  items.testCursedGem = { ...items.ruby, id: "testCursedGem", cursed: true };
  try {
    const gem = g.addItem("testCursedGem");
    g.getItem(uid).gem = gem.uid;
    assert.ok(!trades(g).some((a) => a.tradeItem === uid));
    assert.equal(
      tradeAssets(g.s, { kind: "item", slot: "wrist" })[0].eligible,
      false,
    );
  } finally {
    delete items.testCursedGem;
  }
});
test("Satchel-only Bracelets qualify, keep belongings changes no ownership, observations enumerate without mutation", () => {
  const g = fixture();
  g.s.equipment.wrist2 = null;
  const snapshot = structuredClone(g.s);
  assert.equal(trades(g).length, 1);
  assert.ok(
    tradeAssets(g.s, events.find((e) => e.id === "trader").choices[0].trade)
      .length,
  );
  assert.deepEqual(g.s, snapshot);
  g.act(g.legal().find((a) => a.index === 1));
  assert.deepEqual(g.s.inventory, snapshot.inventory);
  assert.deepEqual(g.s.deck, snapshot.deck);
});
test("Wrong item, ambiguous old trade action, missing asset and Cursed Bracelet are rejected", () => {
  const g = fixture(),
    ring = g.s.equipment.finger2;
  assert.throws(
    () => g.act({ type: "eventChoice", index: 0 }),
    /Illegal action/,
  );
  assert.throws(
    () => g.act({ type: "eventChoice", index: 0, tradeItem: ring }),
    /Illegal action/,
  );
  items.testCursed = { ...items.bronze, id: "testCursed", cursed: true };
  try {
    const c = g.addItem("testCursed");
    assert.ok(!trades(g).some((a) => a.tradeItem === c.uid));
    assert.equal(
      tradeAssets(g.s, { kind: "item", slot: "wrist" }).find(
        (x) => x.uid === c.uid,
      ).eligible,
      false,
    );
  } finally {
    for (const x of [...g.s.inventory])
      if (x.id === "testCursed") g.removeItem(x.uid);
    delete items.testCursed;
  }
  const a = trades(g)[0];
  g.removeItem(a.tradeItem);
  assert.throws(() => g.act(a), /Illegal action/);
});
test("Generic card-for-item exchange removes selected upgraded copy, saves and AI retain concrete choices", () => {
  const e = {
    id: "testTrade",
    name: "Trade",
    choices: [
      {
        label: "Card for Sapphire",
        trade: { kind: "card", id: "blast", label: "Blast" },
        item: "sapphire",
      },
      { label: "Keep" },
    ],
  };
  events.push(e);
  try {
    const g = fixture();
    g.s.event = e.id;
    const copies = g.s.deck.filter((x) => x.id === "blast");
    copies[1].upgrade = true;
    const h = new Game(0, g.save()),
      a = trades(h).find((a) => a.tradeCard === copies[1].uid),
      decision = new WeightedPolicy().choose(h.observe(), h.legal());
    assert.ok(h.legal().some((x) => x.key === decision.action.key));
    h.act(a);
    assert.ok(!h.s.deck.some((x) => x.uid === copies[1].uid));
    assert.ok(h.s.deck.some((x) => x.uid === copies[0].uid));
    assert.ok(h.s.inventory.some((x) => x.id === "sapphire"));
  } finally {
    events.pop();
  }
});
test("AI trade score recognizes the particular Bracelet being surrendered", () => {
  const g = fixture();
  g.addItem("gold");
  const p = new WeightedPolicy();
  const choice = p.choose(g.observe(), trades(g));
  assert.equal(choice.action.tradeItem, g.s.equipment.wrist2);
});
