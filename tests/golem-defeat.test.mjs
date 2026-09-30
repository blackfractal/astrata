import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards } from "../src/content.mjs";
function base(count = 1) {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle(
    Array.from({ length: count }, (_, i) => ({
      uid: 900 + i,
      enemy: "beetle",
      restless: 0,
    })),
  );
  g.s.battle.phase = "activate";
  g.s.battle.hand = [];
  return g;
}
const act = (g, type) => {
  const a = g.legal().find((a) => a.type === type);
  assert.ok(a);
  g.act(a);
};
test("Lethal enemy damage records zero HP in the hit snapshot before defeat", () => {
  const g = base();
  g.s.hp = 2;
  g.capturePresentation = true;
  act(g, "endTurn");
  const hit = g.presentation.find(
    (f) => f.kind === "hit" && f.target === "player",
  );
  assert.ok(hit.amount > 2);
  assert.equal(hit.state.hp, 0);
  assert.equal(hit.state.mode, "battle");
  assert.ok(g.presentation.every((f) => f.state.hp >= 0));
  assert.equal(g.s.hp, 0);
  assert.equal(g.s.outcome, "loss");
});
test("Lethal status damage also has zero-HP snapshots", () => {
  const g = base();
  g.s.status.poison = 100;
  g.s.battle.enemies[0].frozen = true;
  g.capturePresentation = true;
  act(g, "endTurn");
  assert.equal(g.s.outcome, "loss");
  assert.ok(g.presentation.every((f) => f.state.hp >= 0));
  assert.equal(
    g.presentation.find(
      (f) => f.kind === "hit" && f.target === "player" && f.amount === 100,
    ).state.hp,
    0,
  );
});
test("Golem grows 10 to 16, intercepts all attacks that round, then keeps growth without Taunt", () => {
  const g = base(2),
    b = g.s.battle,
    c = g.instance(g.newCard("golem"));
  b.grid[0] = [c];
  assert.equal(c.hp, 10);
  act(g, "activate");
  assert.equal(c.hp, 16);
  assert.equal(c.maxHp, 16);
  assert.equal(c.taunt, true);
  assert.equal(b.channel, 1);
  assert.equal(b.destroyed.length, 0);
  act(g, "endTurn");
  assert.equal(g.s.hp, 70);
  assert.equal(c.hp, 8);
  assert.equal(c.maxHp, 16);
  assert.equal(c.taunt, false);
  assert.equal(g.allowance(c, 0), 0);
  // The Beetles' next attack is Crack; Harden would not create a defense choice.
  for (const enemy of b.enemies) enemy.cycle = 2;
  b.phase = "activate";
  act(g, "endTurn");
  assert.ok(g.legal().some((a) => a.type === "skipEquipment"));
});
test("Golem growth adds six when wounded rather than healing to full, and remains a normal Ally", () => {
  const g = base(),
    b = g.s.battle,
    c = g.instance(g.newCard("golem"));
  b.grid[0] = [c];
  c.hp = 3;
  act(g, "activate");
  assert.equal(c.hp, 9);
  assert.equal(c.maxHp, 16);
  assert.equal(b.grid[0][0], c);
  assert.ok(!cards.golem.destroyAfterActivation);
  assert.equal(cards.golem.limit, 1);
});
