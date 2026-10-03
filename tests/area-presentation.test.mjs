import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
function setup(id = "storm", count = 4) {
  const g = new Game(8);
  g.beginBattle(
    Array.from({ length: count }, (_, i) => ({
      uid: 900 + i,
      enemy: "beetle",
      restless: 0,
    })),
  );
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 10;
  b.hand = [];
  for (const e of b.enemies) {
    e.element = "Arcane";
    e.hp = e.maxHp = 100;
  }
  b.grid[10] = [g.instance(g.newCard(id))];
  return g;
}
function activate(g) {
  g.act(g.legal().find((a) => a.type === "activate" && a.slot === 10));
}
test("area presentation shares a batch across targets, retains Ring sequence and cannot alter state", () => {
  const g = setup(),
    control = setup();
  g.capturePresentation = true;
  activate(g);
  activate(control);
  assert.deepEqual(g.s, control.s);
  const hits = g.presentation.filter((f) => f.kind === "hit");
  assert.deepEqual(
    hits.map((f) => f.uid),
    [900, 900, 901, 902, 903],
  );
  assert.equal(new Set(hits.map((f) => f.parallelGroup)).size, 1);
  assert.ok(hits.every((f) => f.parallelGroup != null && f.sourceSlot === 10));
  assert.ok(hits[1].sourceItem != null);
  assert.deepEqual(
    g.s.battle.enemies.map((e) => e.hp),
    [91, 93, 93, 93],
  );
});
test("area batches preserve guard, Flicker, kills and single-target animations stay ungrouped", () => {
  const g = setup();
  g.capturePresentation = true;
  g.s.battle.enemies[0].flicker = true;
  g.s.battle.enemies[1].guard = 3;
  g.s.battle.enemies[2].hp = 5;
  activate(g);
  const hits = g.presentation.filter((f) => f.kind === "hit");
  assert.deepEqual(
    hits.map((f) => f.uid),
    [901, 902, 903],
  );
  assert.deepEqual(
    hits.map((f) => f.amount),
    [4, 7, 7],
  );
  assert.equal(hits[1].dead, true);
  const single = setup("water");
  single.capturePresentation = true;
  activate(single);
  assert.ok(single.presentation.every((f) => f.parallelGroup == null));
});
test("Kiln fires its single hit before a simultaneous area Burn batch, including immune targets", () => {
  const g = setup("kiln");
  g.capturePresentation = true;
  g.s.battle.grid[10][0].charge = 2;
  g.s.battle.enemies[1].element = "Water";
  activate(g);
  const hits = g.presentation.filter((f) => f.kind === "hit"),
    statuses = g.presentation.filter((f) => f.kind === "status");
  assert.ok(hits.every((f) => f.parallelGroup == null));
  assert.equal(statuses.length, 4);
  assert.ok(
    statuses.every((f) => f.parallelGroup != null && f.sourceSlot === 10),
  );
  assert.equal(new Set(statuses.map((f) => f.parallelGroup)).size, 1);
  assert.equal(statuses[1].immune, true);
});
