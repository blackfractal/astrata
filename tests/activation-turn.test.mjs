import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards } from "../src/content.mjs";
function setup(id = "blast") {
  const g = new Game(10);
  g.s.equipment = {};
  g.s.inventory = [];
  g.beginBattle([{ uid: g.uid(), enemy: "colossus", restless: 0 }]);
  const b = g.s.battle,
    c = g.instance(g.newCard(id));
  b.grid[0] = [c];
  b.phase = "activate";
  b.channel = 4;
  return { g, b, c };
}
function action(g, slot = 0) {
  return g.legal().find((a) => a.type === "activate" && a.slot === slot);
}
test("ordinary cards reject repeated activation despite Channel and remaining total allowance", () => {
  const { g, b, c } = setup();
  const a = action(g);
  g.act(a);
  assert.equal(b.channel, 3);
  assert.equal(g.allowance(c, 0), 1);
  assert.equal(c.lastActivatedTurn, b.turn);
  assert.equal(action(g), undefined);
  const snapshot = structuredClone(g.s);
  assert.throws(() => g.act(a), /Illegal action/);
  assert.deepEqual(g.s, snapshot);
  g.endTurn();
  b.phase = "activate";
  assert.ok(action(g));
  assert.equal(c.used, 1);
  g.act(action(g));
  assert.equal(c.used, 2);
  g.endTurn();
  b.phase = "activate";
  assert.equal(action(g), undefined);
});
test("Shield has two total activations, once per turn, then is spent until recalled", () => {
  const { g, b, c } = setup("shield");
  g.act(action(g));
  assert.equal(g.allowance(c, 0), 1);
  assert.equal(action(g), undefined);
  g.beginTurn();
  b.phase = "activate";
  assert.ok(action(g));
  assert.equal(c.used, 1);
  g.act(action(g));
  assert.equal(g.allowance(c, 0), 0);
  g.beginTurn();
  b.phase = "activate";
  assert.equal(action(g), undefined);
  const fresh = g.instance(c);
  assert.equal(fresh.used, 0);
  assert.equal(g.allowance(fresh, 0), 2);
});
test("Blink permits paid repeats while respecting allowance and Channel", () => {
  cards.testblink = {
    ...cards.blast,
    id: "testblink",
    blink: true,
    text: "Blink. Deal 5 damage.",
  };
  try {
    const { g, b, c } = setup("testblink");
    b.channel = 1;
    g.act(action(g));
    assert.equal(b.channel, 0);
    assert.equal(action(g), undefined);
    b.channel = 1;
    assert.ok(action(g));
    g.act(action(g));
    assert.equal(c.used, 2);
    assert.equal(b.channel, 0);
    b.channel = 4;
    assert.equal(action(g), undefined);
  } finally {
    delete cards.testblink;
  }
});
test("Melding another Plasma cannot refresh the host's per-turn opportunity", () => {
  const { g, b, c } = setup("plasma");
  b.enemies[0].element = "Arcane";
  g.act(action(g));
  b.phase = "place";
  b.focus = 1;
  const extra = g.newCard("plasma");
  b.hand = [extra];
  g.act(g.legal().find((a) => a.type === "place" && a.slot === 0));
  assert.equal(b.grid[0].at(-1), c);
  assert.equal(c.used, 1);
  assert.equal(g.allowance(c, 0), 2);
  b.phase = "activate";
  assert.equal(action(g), undefined);
  b.turn++;
  g.act(action(g));
  assert.equal(c.used, 2);
  assert.equal(b.grid[0][0].used, 0);
});

test("moving a used card and restoring its exact state cannot refresh the turn opportunity", () => {
  const { g, b, c } = setup();
  g.act(action(g));
  b.grid[4] = b.grid[0];
  b.grid[0] = [];
  assert.equal(action(g, 4), undefined);
  const restored = new Game(0, structuredClone(g.s));
  assert.equal(action(restored, 4), undefined);
  assert.equal(restored.s.battle.grid[4][0].used, 1);
});
test("Charge-building activation also consumes the turn opportunity", () => {
  const { g, b, c } = setup("kiln");
  g.act(action(g));
  assert.equal(c.charge, 1);
  assert.equal(c.used, 1);
  assert.equal(action(g), undefined);
  g.beginTurn();
  b.phase = "activate";
  g.act(action(g));
  assert.equal(c.charge, 2);
  assert.equal(c.used, 2);
});
