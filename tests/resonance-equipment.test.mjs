import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { items } from "../src/content.mjs";
function battle() {
  const g = new Game(7);
  g.s.deck.push(g.newCard("resonance"));
  g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
  const c = g.instance(g.newCard("resonance"));
  g.s.battle.grid[2] = [c];
  return { g, c, b: g.s.battle };
}
test("Resonance converts zero Channel into one exactly once, and cannot Recall or gain uses", () => {
  const { g, c, b } = battle();
  b.focus = 10;
  assert.ok(!g.legal().some((a) => a.type === "recall" && a.slot === 2));
  b.grid[0] = [g.instance(g.newCard("keystone"))];
  assert.equal(g.allowance(c, 2), 1);
  b.phase = "activate";
  b.channel = 0;
  const a = g.legal().find((a) => a.type === "activate" && a.slot === 2);
  assert.equal(a.costs.channel, 0);
  g.act(a);
  assert.equal(b.channel, 1);
  assert.equal(g.allowance(c, 2), 0);
  assert.ok(!g.legal().some((a) => a.type === "activate" && a.slot === 2));
  g.endTurn();
  assert.ok(b.destroyed.some((x) => x.uid === c.uid));
  assert.ok(!b.grid.flat().some((x) => x.uid === c.uid));
  assert.ok(g.s.deck.some((x) => x.id === "resonance"));
});
test("unused, covered Resonance expires without destroying the covering card", () => {
  const { g, c, b } = battle();
  const cover = g.instance(g.newCard("blast"));
  b.grid[2].push(cover);
  g.endTurn();
  assert.ok(b.destroyed.some((x) => x.uid === c.uid));
  assert.deepEqual(
    b.grid[2].map((x) => x.uid),
    [cover.uid],
  );
});
test("unequip and re-equip retain ownership, socketed Gems, and movement allowance", () => {
  const g = new Game(8);
  g.s.mode = "field";
  g.s.field.stage = "player";
  const slot = "wrist2",
    uid = g.s.equipment[slot],
    gear = g.getItem(uid);
  const gem = g.s.inventory.find((x) => items[x.id].slot === "gem");
  gear.gem = gem.uid;
  const moves = g.s.field.moves,
    count = g.s.inventory.length;
  g.act(g.legal().find((a) => a.type === "unequip" && a.slot === slot));
  assert.equal(g.s.equipment[slot], null);
  assert.equal(g.s.inventory.length, count);
  assert.equal(gear.gem, gem.uid);
  assert.equal(g.s.field.moves, moves);
  g.act(
    g
      .legal()
      .find((a) => a.type === "equip" && a.item === uid && a.slot === slot),
  );
  assert.equal(g.s.equipment[slot], uid);
  g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
  assert.ok(!g.legal().some((a) => ["equip", "unequip"].includes(a.type)));
});
test("Cursed equipment cannot be dragged out through the unequip action", () => {
  const g = new Game(8);
  g.s.mode = "field";
  const id = Object.keys(items).find(
    (id) => items[id].cursed && items[id].slot !== "gem",
  );
  const item = g.addItem(id);
  assert.ok(Object.values(g.s.equipment).includes(item.uid));
  assert.ok(
    !g.legal().some((a) => a.type === "unequip" && a.item === item.uid),
  );
  g.openTavern();
  assert.ok(
    !g.legal().some((a) => a.type === "unequip" && a.item === item.uid),
  );
});
