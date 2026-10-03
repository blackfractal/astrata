import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { startTutorial, TUTORIAL } from "../src/tutorial.mjs";
function field() {
  const g = new Game(19);
  g.s.field.entities = [];
  Object.assign(g.s.field, {
    x: 5,
    y: 5,
    moves: 2,
    stage: "player",
    round: 10,
    spawned: 32,
    queue: [],
  });
  g.s.mode = "field";
  g.capturePresentation = true;
  return g;
}
function skip(g) {
  for (let n = 0; g.s.battle.reaction && n < 20; n++)
    g.act(g.legal().find((a) => a.type === "skipEquipment"));
}
test("Movement contact grants one opening enemy turn to the whole encounter before first Reveal", () => {
  const g = field();
  g.s.field.entities = [
    { uid: 900, enemy: "wolf", x: 4, y: 5, restless: 0 },
    { uid: 901, enemy: "firewolf", x: 3, y: 5, restless: 0 },
  ];
  g.endMovement();
  const b = g.s.battle;
  assert.equal(b.enemyFirst, true);
  assert.equal(b.turn, 0);
  assert.equal(b.hand.length, 0);
  assert.ok(b.reaction);
  assert.ok(
    g
      .legal()
      .every(
        (a) =>
          !["place", "activate", "activatePhase", "endTurn"].includes(a.type),
      ),
  );
  assert.ok(!g.presentation.some((f) => f.kind === "reveal"));
  const first = g.presentation.findIndex((f) => f.kind === "incoming");
  assert.ok(first > g.presentation.findLastIndex((f) => f.kind === "move"));
  const h = new Game(0, g.save());
  skip(g);
  skip(h);
  assert.equal(b.turn, 1);
  assert.deepEqual(
    b.enemies.map((e) => e.cycle),
    [1, 1],
  );
  assert.equal(b.hand.length, 4);
  assert.equal(h.s.hp, g.s.hp);
  assert.equal(h.s.battle.turn, 1);
  assert.equal(h.s.rng, g.s.rng);
});
test("Player movement, direct encounters and spawning onto a player retain player-first initiative", () => {
  const g = field();
  g.s.field.entities = [{ uid: 900, enemy: "wolf", x: 6, y: 5, restless: 0 }];
  g.act(g.legal().find((a) => a.type === "move" && a.x === 6 && a.y === 5));
  assert.equal(g.s.battle.enemyFirst, false);
  assert.equal(g.s.battle.turn, 1);
  assert.equal(g.s.battle.enemies[0].cycle, 0);
  assert.equal(g.s.hp, 70);
  const h = field();
  h.s.field.entities = [{ uid: 900, enemy: "wolf", x: 5, y: 5, restless: 0 }];
  h.resolveTile();
  assert.equal(h.s.battle.enemies[0].cycle, 0);
});
test("Enemy-first opening can be a utility move; opening statuses and Rite still prepare first player turn once", () => {
  const g = field();
  g.s.deck.push(g.newCard("rite"));
  g.beginBattle([{ uid: 900, enemy: "tutorialWarden", restless: 0 }], {
    enemyFirst: true,
  });
  assert.equal(g.s.battle.turn, 1);
  assert.equal(g.s.battle.enemies[0].cycle, 1);
  assert.equal(g.s.battle.focus, 2);
  assert.equal(g.s.battle.hand.length, 4);
  assert.equal(g.s.hp, 70);
  const h = field();
  h.s.hp = 1;
  h.s.equipment = {};
  h.beginBattle([{ uid: 900, enemy: "wolf", restless: 0 }], {
    enemyFirst: true,
  });
  assert.equal(h.s.outcome, "loss");
  assert.equal(h.s.hp, 0);
  assert.ok(!h.presentation.some((f) => f.kind === "reveal"));
  assert.equal(h.s.checkpoint, undefined);
});
test("Older mid-Rootling tutorials restart only that changed encounter and remain completable", () => {
  const g = startTutorial(new Game(TUTORIAL.seed));
  while (g.s.tutorial.lesson !== "route-ward") g.act(g.legal()[0]);
  const saved = g.save();
  saved.tutorial.version = 6;
  delete saved.battle.enemyFirst;
  const h = new Game(0, saved);
  assert.equal(h.s.tutorial.lesson, "caught");
  assert.equal(h.s.battle.turn, 0);
  assert.equal(h.s.battle.reaction.damage, 3);
  assert.equal(h.s.battle.enemyFirst, true);
  for (let n = 0; n < 140 && h.s.tutorial.lesson !== "independent"; n++) {
    assert.ok(h.legal().length, h.s.tutorial.lesson);
    h.act(h.legal()[0]);
  }
  assert.equal(h.s.tutorial.lesson, "independent");
  assert.equal(h.s.hp, 70);
});
