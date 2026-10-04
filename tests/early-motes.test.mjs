import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { EARLY_MOTES } from "../src/content.mjs";
test("first four pairs draw only easy single Motes; fifth pair unlocks full deck", () => {
  for (let seed = 1; seed <= 30; seed++) {
    const g = new Game(seed);
    g.resolveTile = () => {};
    g.s.field.queue = Array(10).fill("Mote");
    g.s.enemyDecks.Mote = ["firewolf", "sludge"];
    for (let round = 1; round <= 5; round++) {
      g.s.field.entities = [];
      g.beginRound();
      for (const e of g.s.field.entities.filter((e) => e.enemy)) {
        if (round <= 4) {
          assert.ok(EARLY_MOTES.includes(e.enemy));
          assert.equal(e.count, 1);
        } else assert.ok(["firewolf", "sludge"].includes(e.enemy));
      }
    }
  }
});
test("temporary enemy resource reductions last one turn, stack, clamp, and keep zero-cost placements legal", () => {
  for (const [id, cycle, resource, expected] of [
    ["bat", 1, "revealInsight", 2],
    ["beetle", 1, "focus", 0],
    ["moth", 0, "channel", 1],
  ]) {
    const g = new Game(8);
    g.s.equipment = {};
    g.beginBattle([{ uid: 900, enemy: id, restless: 0 }]);
    const b = g.s.battle;
    b.enemies[0].cycle = cycle;
    const hp = g.s.hp;
    g.endTurn();
    assert.equal(g.s.hp, hp);
    assert.equal(b[resource], expected);
    if (id === "beetle") {
      b.hand.push(g.newCard("clear"));
      assert.ok(g.legal().some((a) => a.type === "place"));
    }
    g.endTurn();
    assert.equal(
      b[resource],
      resource === "revealInsight" ? 4 : resource === "focus" ? 1 : 2,
    );
  }
  const g = new Game(9);
  g.s.equipment = {};
  g.beginBattle(
    [0, 1, 2].map((i) => ({ uid: 900 + i, enemy: "moth", restless: 0 })),
  );
  g.endTurn();
  assert.equal(g.s.battle.channel, 0);
  g.endTurn();
  assert.equal(g.s.battle.channel, 2);
});
test("early deck and queued resource penalty survive old and current save loading", () => {
  const g = new Game(8);
  g.resolveTile = () => {};
  g.s.field.queue = Array(8).fill("Mote");
  g.beginRound();
  const restored = new Game(0, g.save());
  assert.deepEqual(restored.s.enemyDecks, g.s.enemyDecks);
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  g.s.battle.next.focusLoss = 1;
  const raw = structuredClone(g.s);
  raw.version.rules = "1.3.28";
  const loaded = new Game(0, raw);
  loaded.reveal();
  assert.equal(loaded.s.battle.focus, 0);
});
test("map age and Restless preview use actual combat damage and movement exceptions", () => {
  const g = new Game(8);
  g.s.field.round = 9;
  for (const id of ["bat", "sludge", "imp", "hart", "colossus", "choir"]) {
    const e = { uid: 900, enemy: id, born: 3, restless: 2, count: 2 };
    const p = g.fieldEnemyPreview(e);
    assert.equal(p.age, 6);
    assert.equal(p.restless, 2);
    assert.equal(p.count, 2);
    g.beginBattle([e]);
    for (let cycle = 0; cycle < p.rotation.length; cycle++) {
      g.s.battle.enemies[0].cycle = cycle;
      assert.deepEqual(p.rotation[cycle], g.tell(g.s.battle.enemies[0]));
    }
    if (id === "sludge") assert.match(p.movement, /stationary/);
    if (id === "imp") assert.match(p.movement, /directly/);
    if (id === "bat") assert.match(p.movement, /4 spaces/);
  }
  assert.equal(g.fieldEnemyPreview({ enemy: "bat", restless: 2 }).age, null);
});
