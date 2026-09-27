import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { VERSION } from "../src/content.mjs";
test("base Channel is two and refreshes each battle turn without changing card limits", () => {
  const g = new Game(1);
  g.s.inventory = [];
  for (const k of Object.keys(g.s.equipment)) g.s.equipment[k] = null;
  g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
  assert.equal(g.s.battle.channel, 2);
  g.s.battle.channel = 0;
  g.endTurn();
  assert.equal(g.s.battle.channel, 2);
});
test("a full pair lands before collision resolution and produces unique independent battle targets", () => {
  const g = new Game(3);
  Object.assign(g.s.field, {
    round: 10,
    spawned: 20,
    x: 6,
    y: 6,
    queue: ["Mote", "Mote", "Gold", "Gold", "Gold", "Gold", "Gold", "Gold"],
  });
  g.s.enemyDecks.Mote = ["bat", "bat"];
  g.rand = () => 0.5;
  g.beginRound();
  assert.equal(g.s.field.spawned, 22);
  assert.equal(g.s.mode, "battle");
  assert.equal(g.s.field.entities.length, 2);
  assert.equal(g.s.battle.enemies.length, 6);
  assert.equal(new Set(g.s.battle.enemies.map((e) => e.uid)).size, 6);
  const [a, b] = g.s.battle.enemies;
  a.hp = 0;
  a.status.burn = 3;
  assert.equal(b.hp, 10);
  assert.equal(b.status.burn, 0);
  g.checkBattle();
  assert.equal(g.s.mode, "battle");
  for (const e of g.s.battle.enemies) e.hp = 0;
  g.checkBattle();
  assert.equal(g.s.mode, "reward");
  assert.equal(g.s.field.entities.length, 0);
  assert.equal(g.s.gold, 108);
});
test("group sizes progress with spawn round and are limited to authored types", () => {
  const g = new Game(4);
  for (const id of ["bat", "beetle", "ashling"]) {
    g.rand = () => 0;
    assert.equal(g.groupSize(id, 4), 1);
    assert.equal(g.groupSize(id, 5), 1);
    assert.equal(g.groupSize(id, 11), 2);
    g.rand = () => 0.999;
    assert.equal(g.groupSize(id, 4), 1);
    assert.equal(g.groupSize(id, 10), 2);
    assert.equal(g.groupSize(id, 16), 3);
  }
  for (const id of ["wolf", "hart", "dervish"])
    assert.equal(g.groupSize(id, 16), 1);
});
test("preview refill does not cause Restlessness; every four spawned pairs does", () => {
  const g = new Game(9);
  g.s.mode = "field";
  Object.assign(g.s.field, {
    round: 2,
    spawned: 4,
    x: 0,
    y: 0,
    queue: Array(8).fill("Gold"),
    entities: [
      {
        uid: g.uid(),
        enemy: "bat",
        count: 3,
        x: 9,
        y: 9,
        restless: 0,
        born: 1,
      },
    ],
  });
  g.rand = () => 0.5;
  g.beginRound();
  assert.equal(g.s.field.entities[0].restless, 0);
  g.beginRound();
  assert.equal(g.s.field.entities[0].restless, 1);
  g.batch();
  g.batch();
  assert.equal(g.s.field.entities[0].restless, 1);
  g.beginRound();
  assert.equal(g.s.field.entities[0].restless, 1);
});
test("legacy single-spawn saves preserve revealed entries and existing enemies when migrating to pairs", () => {
  const saved = new Game(3).save();
  saved.version = { ...VERSION, rules: "1.2.1" };
  delete saved.field.spawnWidth;
  Object.assign(saved.field, {
    spawned: 4,
    queue: ["Gold", "Item", "Mote", "Tavern"],
    entities: [{ uid: 1000, enemy: "bat", x: 1, y: 1, restless: 2 }],
  });
  const a = new Game(0, saved),
    b = new Game(0, saved);
  assert.deepEqual(a.s, b.s);
  assert.equal(a.s.field.spawned, 8);
  assert.deepEqual(
    a.s.field.queue.filter((_, i) => i % 2),
    saved.field.queue,
  );
  assert.deepEqual(a.s.field.entities, saved.field.entities);
  assert.deepEqual(new Game(0, a.save()).s, a.s);
});
test("group membership, target UIDs and preview survive battle restart without rerolling", () => {
  const g = new Game(12);
  const entity = {
    uid: g.uid(),
    enemy: "bat",
    count: 3,
    restless: 1,
    x: 5,
    y: 5,
  };
  g.s.field.entities = [entity];
  g.beginBattle([entity]);
  const saved = g.save(),
    loaded = new Game(0, saved);
  assert.deepEqual(loaded.s.battle.enemies, g.s.battle.enemies);
  assert.deepEqual(loaded.legal(), g.legal());
  assert.equal(loaded.s.rng, g.s.rng);
});
