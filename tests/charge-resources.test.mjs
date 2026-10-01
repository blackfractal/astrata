import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards } from "../src/content.mjs";
function setup() {
  const g = new Game(33);
  g.s.equipment = {};
  g.beginBattle([
    { uid: 900, enemy: "beetle", restless: 0 },
    { uid: 901, enemy: "beetle", restless: 0 },
  ]);
  return g;
}
function put(g, id, i) {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[i] = [c];
  return c;
}
function action(g, i) {
  return g.legal().filter((a) => a.type === "activate" && a.slot === i);
}
test("Insight is spent after Reveal; the refill is captured before enemies act and cannot reopen player phases", () => {
  const g = setup(),
    b = g.s.battle;
  assert.equal(b.insight, 0);
  assert.equal(b.revealInsight, 4);
  assert.equal(b.hand.length, 4);
  g.s.equipment.wrist1 = g.s.inventory.find((x) => x.id === "bronze").uid;
  b.focus = 0;
  b.channel = 0;
  g.capturePresentation = true;
  g.endTurn();
  const frame = g.presentation.find((x) => x.kind === "resources");
  assert.ok(frame);
  assert.deepEqual(
    [
      frame.state.battle.insight,
      frame.state.battle.focus,
      frame.state.battle.channel,
    ],
    [4, 1, 2],
  );
  assert.ok(
    g.presentation.indexOf(frame) <
      g.presentation.findIndex((x) => x.kind === "incoming"),
  );
  assert.equal(b.phase, "enemy");
  assert.ok(!g.legal().some((a) => ["place", "activate"].includes(a.type)));
});
test("refill respects gear, permanent and delayed bonuses, and enemy Insight changes apply at Reveal", () => {
  const g = setup(),
    b = g.s.battle;
  g.addItem("channelRing");
  g.s.equipment.finger1 = g.s.inventory.at(-1).uid;
  b.permanent.focus = 1;
  b.next = { focus: 2, insight: 3 };
  b.enemies = b.enemies.slice(0, 1);
  b.enemies[0].id = "bat";
  b.enemies[0].cycle = 1;
  g.capturePresentation = true;
  g.endTurn();
  const refreshed = g.presentation.find((x) => x.kind === "resources").state
    .battle;
  assert.deepEqual(
    [refreshed.insight, refreshed.focus, refreshed.channel],
    [7, 4, 3],
  );
  assert.equal(b.revealInsight, 5);
  assert.deepEqual([b.insight, b.focus, b.channel], [0, 4, 3]);
  assert.deepEqual(b.next, { focus: 0, insight: 0 });
});
test("empty or short draws finish with zero Insight, including legacy completed Reveal saves", () => {
  const g = setup(),
    b = g.s.battle;
  b.deck = [];
  b.discard = [];
  b.next.insight = 3;
  g.reveal();
  assert.equal(b.hand.length, 0);
  assert.equal(b.insight, 0);
  assert.equal(b.revealInsight, 7);
  b.insight = 4;
  delete b.revealInsight;
  g.s.version = { ...g.s.version, rules: "1.3.9" };
  const restored = new Game(0, g.s);
  assert.equal(restored.s.battle.insight, 0);
  assert.equal(restored.s.battle.revealInsight, 4);
});
test("every charged card builds charge without an enemy target or premature effects", () => {
  for (const d of Object.values(cards).filter((c) => c.charge)) {
    const g = setup(),
      b = g.s.battle,
      c = put(g, d.id, 0);
    b.phase = "activate";
    b.channel = 5;
    const a = action(g, 0);
    assert.equal(a.length, 1, d.name);
    assert.equal(a[0].target, null, d.name);
    assert.equal(a[0].effects.charging, true);
    const hp = b.enemies.map((e) => e.hp);
    g.act(a[0]);
    assert.equal(c.charge, 1);
    assert.deepEqual(
      b.enemies.map((e) => e.hp),
      hp,
    );
    assert.ok(b.enemies.every((e) => e.status.burn === 0));
    assert.equal(b.channel, 4);
    assert.equal(action(g, 0).length, 0);
  }
});
test("Kiln releases 20 on only the chosen enemy and Burn 2 on all enemies on its third activation", () => {
  const g = setup(),
    b = g.s.battle,
    c = put(g, "kiln", 0);
  b.phase = "activate";
  b.channel = 6;
  for (const e of b.enemies) {
    e.hp = 100;
    e.element = "Arcane";
  }
  for (let n = 0; n < 2; n++) {
    g.act(action(g, 0)[0]);
    b.turn++;
  }
  const choices = action(g, 0);
  assert.equal(choices.length, 2);
  assert.ok(choices.every((a) => a.target != null && !a.effects.charging));
  g.act(choices.find((a) => a.target === 901));
  assert.deepEqual(
    b.enemies.map((e) => e.hp),
    [100, 80],
  );
  assert.deepEqual(
    b.enemies.map((e) => e.status.burn),
    [2, 2],
  );
  assert.equal(c.charge, 0);
  assert.equal(c.used, 3);
  assert.equal(b.channel, 3);
});
test("Kiln on-place Fire charges can make the first activation a targeted release; Burn still reaches others after a kill", () => {
  const g = setup(),
    b = g.s.battle;
  put(g, "ignis", 0);
  put(g, "heat", 2);
  const c = g.newCard("kiln");
  b.hand = [c];
  b.focus = 2;
  g.act(g.legal().find((a) => a.type === "place" && a.slot === 1));
  assert.equal(b.grid[1][0].charge, 2);
  b.enemies[0].hp = 10;
  g.act(g.legal().find((a) => a.type === "activatePhase"));
  g.act(action(g, 1).find((a) => a.target === 900));
  assert.ok(b.enemies[0].hp <= 0);
  assert.equal(b.enemies[1].status.burn, 2);
});
test("Flicker blocks Kiln only for the negating enemy, including its secondary Burn", () => {
  const g = setup(),
    b = g.s.battle,
    c = put(g, "kiln", 0);
  c.charge = 2;
  b.phase = "activate";
  b.enemies[0].flicker = true;
  g.act(action(g, 0).find((a) => a.target === 900));
  assert.equal(b.enemies[0].hp, 21);
  assert.equal(b.enemies[0].status.burn, 0);
  assert.equal(b.enemies[1].status.burn, 2);
});
