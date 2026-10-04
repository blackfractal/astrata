import { fieldEntitiesAt } from "../src/field-display.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { items } from "../src/content.mjs";
import { startTutorial, TUTORIAL } from "../src/tutorial.mjs";
import { satchelContents } from "../src/consumables.mjs";
import { discover, emptyCollection } from "../src/archive-profile.mjs";
const act = (g, type) => {
  const a = g.legal().find((x) => x.type === type);
  assert.ok(a, type);
  g.act(a);
};
function field() {
  const g = new Game(800);
  Object.assign(g.s.field, {
    round: 8,
    spawned: 32,
    stage: "player",
    entities: [],
    moves: 0,
    x: 5,
    y: 5,
  });
  g.s.mode = "field";
  g.s.hp = 50;
  g.s.inventory = [];
  for (const k in g.s.equipment) g.s.equipment[k] = null;
  return g;
}
function supply(g, id = "healingSap") {
  const e = {
    uid: g.uid(),
    type: "Item",
    item: id,
    fieldSupply: true,
    x: 5,
    y: 5,
    born: 1,
  };
  g.s.field.entities.push(e);
  return e;
}
test("three seeded distinct supplies, including healing, start away from player/pair in spread directions", () => {
  for (let seed = 1; seed <= 80; seed++) {
    const g = new Game(seed);
    g.beginRound();
    const f = g.s.field,
      xs = f.entities.filter((e) => e.fieldSupply),
      pair = f.entities.filter((e) => !e.fieldSupply);
    assert.equal(xs.length, 3);
    assert.equal(new Set(xs.map((e) => e.item)).size, 3);
    assert.ok(xs.some((e) => e.item === "healingSap"));
    assert.ok(xs.every((e) => items[e.item].consumable));
    assert.equal(f.spawned, 2);
    assert.equal(pair.length, 2);
    const dist = (e) => Math.max(Math.abs(e.x - 5), Math.abs(e.y - 5));
    assert.ok(xs.some((e) => dist(e) >= 2 && dist(e) <= 3));
    assert.equal(xs.filter((e) => dist(e) >= 4).length, 2);
    assert.equal(
      new Set(
        xs.map((e) => Math.round(Math.atan2(e.y - 5, e.x - 5) / (Math.PI / 4))),
      ).size,
      3,
    );
    assert.ok(xs.every((e) => !pair.some((p) => p.x === e.x && p.y === e.y)));
    assert.ok(!g.s.inventory.some((i) => items[i.id].consumable));
    const h = new Game(seed);
    h.beginRound();
    assert.deepEqual(g.s, h.s);
  }
});
test("supplies persist without decay or respawn across rounds and old saves are not populated retroactively", () => {
  const g = new Game(9);
  g.beginRound();
  const xs = structuredClone(g.s.field.entities.filter((e) => e.fieldSupply));
  g.s.field.entities = g.s.field.entities.filter((e) => e.fieldSupply);
  g.s.field.spawned = 32;
  for (let i = 0; i < 8; i++) g.beginRound();
  assert.deepEqual(g.s.field.entities, xs);
  const h = new Game(0, g.save());
  assert.deepEqual(h.s.field.entities, xs);
  h.beginRound();
  assert.equal(h.s.field.entities.length, 3);
  const old = field();
  delete old.s.field.suppliesScattered;
  const migrated = new Game(0, old.save());
  migrated.beginRound();
  assert.equal(migrated.s.field.entities.length, 0);
});
test("direct healing works with ten loose items, records one use, caps HP, and is unavailable at full HP", () => {
  const g = field();
  for (let i = 0; i < 10; i++) g.addItem("focusDraught");
  g.s.hp = 68;
  supply(g);
  g.resolveTile();
  const h = new Game(0, g.save());
  act(h, "usePickup");
  assert.equal(h.s.hp, 70);
  assert.equal(satchelContents(h.s).length, 10);
  assert.equal(h.s.stats.consumablesUsed.at(-1).healed, 2);
  assert.equal(h.s.stats.consumablesUsed.at(-1).source, "fieldPickup");
  assert.equal(h.s.field.entities.length, 0);
  const full = field();
  full.s.hp = 70;
  supply(full);
  full.resolveTile();
  assert.ok(!full.legal().some((a) => a.type === "usePickup"));
  const used = field();
  supply(used);
  used.s.field.consumableRound = 8;
  used.resolveTile();
  assert.ok(!used.legal().some((a) => a.type === "usePickup"));
  const other = field();
  supply(other, "channelDraught");
  other.resolveTile();
  assert.ok(!other.legal().some((a) => a.type === "usePickup"));
});
test("leave here retains exact bottle and permits a later revisit, without immediate reopening", () => {
  const g = field(),
    e = supply(g);
  g.resolveTile();
  act(g, "leaveItem");
  assert.equal(g.s.mode, "field");
  assert.deepEqual(g.s.field.entities[0], e);
  assert.equal(g.s.field.round, 9);
  const h = new Game(0, g.save());
  h.act(h.legal().find((a) => a.type === "move" && a.x === 6 && a.y === 5));
  h.act(h.legal().find((a) => a.type === "move" && a.x === 5 && a.y === 5));
  assert.equal(h.s.mode, "item");
  assert.equal(h.s.itemSource.uid, e.uid);
  act(h, "usePickup");
  assert.equal(h.s.hp, 55);
  assert.equal(h.s.field.entities.length, 0);
});
test("collecting into a full Satchel pauses movement until space is chosen; direct use needs no such choice", () => {
  const g = field();
  for (let i = 0; i < 10; i++) g.addItem("focusDraught");
  supply(g);
  g.resolveTile();
  act(g, "takeItem");
  assert.equal(g.s.field.round, 8);
  assert.equal(g.s.pendingPickupResolution, true);
  assert.equal(satchelContents(g.s).length, 11);
  assert.ok(
    g
      .legal()
      .every((a) =>
        ["discardItem", "consume", "equip", "unequip"].includes(a.type),
      ),
  );
  act(g, "consume");
  assert.equal(g.s.hp, 55);
  assert.equal(g.s.field.round, 9);
  assert.ok(!g.s.pendingPickupResolution);
  assert.equal(satchelContents(g.s).length, 10);
});
test("enemies on a supply tile fight first and inspection evidence discovers only visible supplies", () => {
  const g = field(),
    e = supply(g);
  g.s.field.entities.push({
    uid: g.uid(),
    type: "Mote",
    enemy: "beetle",
    x: 5,
    y: 5,
    restless: 0,
    born: 1,
    count: 1,
  });
  const c = emptyCollection();
  discover(c, g.s);
  assert.ok(c.equipment.healingSap);
  assert.ok(!c.equipment.starFlask);
  g.resolveTile(true);
  assert.equal(g.s.mode, "battle");
  assert.ok(g.s.field.entities.some((x) => x.uid === e.uid));
  assert.ok(!g.legal().some((a) => a.type === "usePickup"));
});
test("tutorial supplies are visible from start and collected through the authored route; legacy healing resumes", () => {
  const g = startTutorial(new Game(TUTORIAL.seed));
  assert.equal(g.s.field.entities.filter((e) => e.fieldSupply).length, 3);
  assert.ok(!g.s.inventory.some((x) => items[x.id].consumable));
  while (g.s.tutorial.lesson !== "consume-healing") act(g, g.legal()[0].type);
  assert.ok(g.s.inventory.some((x) => x.id === "healingSap"));
  const old = structuredClone(g.s);
  old.tutorial.version = 8;
  for (const id of ["insightDew", "focusDraught", "channelDraught"])
    old.inventory.push({ uid: 1000 + old.inventory.length, id, gem: null });
  const h = new Game(0, old);
  act(h, "consume");
  assert.equal(h.s.tutorial.lesson, "gem-road");
  while (g.s.tutorial.lesson !== "independent") {
    assert.ok(g.legal().length, g.s.tutorial.lesson);
    g.act(g.legal()[0]);
  }
  assert.ok(g.s.stats.itemsGained.includes("Channel Draught"));
  assert.equal(g.s.field.entities.filter((e) => e.fieldSupply).length, 0);
});

test("visible supplies outrank other loot but never hide enemies or Archons", () => {
  const f = {
    entities: [
      { uid: 1, type: "Gold", x: 5, y: 5 },
      { uid: 2, type: "Item", item: "healingSap", x: 5, y: 5 },
      { uid: 3, enemy: "beetle", x: 5, y: 5 },
      { uid: 4, enemy: "colossus", x: 5, y: 5 },
    ],
  };
  assert.deepEqual(
    fieldEntitiesAt(f, 5, 5).map((x) => x.uid),
    [4, 3, 2, 1],
  );
  assert.deepEqual(
    f.entities.map((x) => x.uid),
    [1, 2, 3, 4],
  );
});
