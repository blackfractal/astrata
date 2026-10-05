import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { items } from "../src/content.mjs";
import { satchelContents } from "../src/consumables.mjs";
const act = (g, type, props = {}) => {
  const a = g
    .legal()
    .find(
      (a) =>
        a.type === type && Object.entries(props).every(([k, v]) => a[k] === v),
    );
  assert.ok(a, type);
  g.act(a);
};
test("Loom supplies are two distinct potions and Tools; Weald remains three potions", () => {
  for (let seed = 1; seed <= 30; seed++) {
    const g = new Game(seed);
    g.enterStratum2();
    act(g, "leave");
    act(g, "enterLoom");
    const xs = g.s.field.entities.filter((e) => e.fieldSupply);
    assert.equal(xs.length, 3);
    assert.equal(xs.filter((e) => items[e.item].consumable).length, 2);
    assert.equal(xs.filter((e) => e.item === "tools").length, 1);
    assert.ok(xs.some((e) => e.item === "healingSap"));
    assert.equal(new Set(xs.map((e) => `${e.x},${e.y}`)).size, 3);
    const loaded = new Game(0, g.save());
    assert.deepEqual(loaded.s.field.entities, g.s.field.entities);
    const first = new Game(seed);
    first.beginRound();
    assert.ok(
      first.s.field.entities
        .filter((e) => e.fieldSupply)
        .every((e) => items[e.item].consumable),
    );
    assert.ok(!first.s.itemDeck.includes("tools"));
    assert.ok(!g.s.itemDeck.includes("tools"));
  }
});
test("Tools occupy a Satchel slot, cannot equip or drink, and one copy plus 100 Gold upgrades one Elves", () => {
  const g = new Game(6);
  g.s.stratum = 2;
  g.openTavern();
  const c = g.addCard("elves"),
    other = g.addCard("elves");
  g.s.gold = 1000;
  assert.ok(!g.legal().some((a) => a.type === "upgrade" && a.uid === c.uid));
  const count = satchelContents(g.s).length,
    tool = g.addItem("tools");
  assert.equal(satchelContents(g.s).length, count + 1);
  assert.ok(
    !g
      .legal()
      .some(
        (a) =>
          ["equip", "useConsumable"].includes(a.type) && a.item === tool.uid,
      ),
  );
  g.s.gold = 99;
  assert.ok(!g.legal().some((a) => a.type === "upgrade" && a.uid === c.uid));
  g.s.gold = 100;
  const h = new Game(0, g.save());
  act(h, "upgrade", { uid: c.uid });
  assert.equal(h.s.gold, 0);
  assert.ok(h.s.deck.find((x) => x.uid === c.uid).upgrade);
  assert.ok(!h.s.deck.find((x) => x.uid === other.uid).upgrade);
  assert.ok(!h.s.inventory.some((x) => x.id === "tools"));
  assert.equal(satchelContents(h.s).length, count);
  assert.equal(h.s.stats.upgradeMaterials.at(-1).itemUid, tool.uid);
  h.s.gold = 1000;
  assert.ok(
    !h.legal().some((a) => a.type === "upgrade" && a.uid === other.uid),
  );
  assert.ok(!h.s.shop.stock.includes("tools"));
});
test("Tools pickup respects full Satchel and can be left for later", () => {
  const g = new Game(7);
  g.s.mode = "field";
  g.s.stratum = 2;
  g.s.field.entities = [];
  g.s.field.moves = 0;
  while (satchelContents(g.s).length < 12) g.addItem("focusDraught");
  const f = g.s.field;
  const e = {
    uid: g.uid(),
    type: "Item",
    item: "tools",
    fieldSupply: true,
    x: f.x,
    y: f.y,
    born: 0,
  };
  f.entities.push(e);
  g.resolveTile();
  assert.ok(!g.legal().some((a) => a.type === "usePickup"));
  act(g, "leaveItem");
  assert.ok(f.entities.some((x) => x.uid === e.uid));
});
test("Additional Machine Elves occur naturally in Loom card rewards, unupgraded, but not Weald or shops", () => {
  let offered = false;
  for (let seed = 1; seed <= 80; seed++) {
    const g = new Game(seed);
    assert.ok(!g.pool("common", true).some((c) => c.id === "elves"));
    g.s.stratum = 2;
    assert.ok(g.pool("common", true).some((c) => c.id === "elves"));
    const offer = g.offer();
    if (offer.includes("elves")) offered = true;
    g.openTavern();
    assert.ok(!g.s.shop.stock.includes("card:elves"));
  }
  assert.ok(offered);
  const g = new Game(32);
  g.s.stratum = 2;
  g.beginBattle([{ uid: g.uid(), enemy: "mendingWarden" }]);
  g.s.battle.enemies[0].hp = 0;
  g.checkBattle();
  g.s.reward.cards = ["elves", "water", "heat"];
  act(g, "rewardCard", { id: "elves" });
  const c = g.s.deck.find((c) => c.id === "elves");
  assert.ok(c);
  assert.equal(c.upgrade, false);
});
