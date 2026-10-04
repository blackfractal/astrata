import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { enemies } from "../src/content.mjs";
import { prepareCorruption, applyCorruptions } from "../src/corruptions.mjs";

const arena = (id, enemyFirst = false) => {
  const g = new Game(83);
  g.s.stratum = 2;
  g.s.hp = g.s.maxHp = 1000;
  g.beginBattle([{ uid: g.uid(), enemy: id, restless: 0 }], { enemyFirst });
  return g;
};
const resolve = (g) => {
  let n = 0;
  while (g.s.battle.reaction && n++ < 100) {
    const a = g.legal().find((a) => a.type === "skipEquipment");
    assert.ok(a, "can accept the incoming attack");
    g.act(a);
  }
  assert.ok(n < 100);
};
const round = (g) => {
  g.endTurn();
  resolve(g);
};

test("Opening Corruptions are visible, deterministic and apply on the first enemy round", () => {
  for (const id of ["sourcap", "loopMoth", "borrowedFace", "censer"]) {
    const g = arena(id),
      e = g.s.battle.enemies[0];
    assert.equal(e.corruptionPlan.length, 1, id);
    assert.equal(Object.keys(g.s.battle.corruptions).length, 0);
    const loaded = new Game(0, structuredClone(g.s));
    assert.deepEqual(
      loaded.s.battle.enemies[0].corruptionPlan,
      e.corruptionPlan,
    );
    round(g);
    round(loaded);
    assert.deepEqual(loaded.s.battle.corruptions, g.s.battle.corruptions);
    assert.equal(Object.keys(g.s.battle.corruptions).length, 1, id);
    assert.ok(g.s.hp < 1000, "Corruption also comes with an attack");
  }
});

test("Enemy-first encounters attack immediately but allow a player turn before opening Corruption", () => {
  for (const id of ["sourcap", "loopMoth", "borrowedFace", "censer"]) {
    const g = arena(id, true);
    resolve(g);
    assert.ok(g.s.hp < 1000);
    assert.equal(g.s.battle.turn, 1);
    assert.equal(Object.keys(g.s.battle.corruptions).length, 0);
    assert.equal(g.s.battle.enemies[0].cycle, 0);
    assert.equal(g.s.battle.enemies[0].corruptionPlan.length, 1);
    round(g);
    assert.equal(Object.keys(g.s.battle.corruptions).length, 1, id);
  }
});

test("Delayed normal Corruptors threaten multiple spaces and attack while marking and applying", () => {
  for (const d of Object.values(enemies).filter(
    (e) => e.stratum === 2 && !e.tutorialOnly,
  )) {
    for (const t of d.rotation) {
      if (t.markCorruption || t.applyCorruption)
        assert.ok(t.damage > 0 || t.sequence?.length || t.disrupt, d.name);
      if (t.markCorruption && !d.openingCorruption)
        assert.ok(t.count >= 2, d.name);
    }
  }
});

test("Hollow Scribe fills a third of the grid, spreads marks, redirects coverage and respects its cap", () => {
  const g = arena("hollowScribe"),
    b = g.s.battle,
    e = b.enemies[0];
  g.capturePresentation = true;
  g.endTurn();
  assert.ok(
    g.presentation.some(
      (f) => f.kind === "corruption" && f.slots?.length === 14,
    ),
  );
  resolve(g);
  assert.equal(e.corruptionPlan.length, 14);
  assert.equal(new Set(e.corruptionPlan.map((p) => p.slot)).size, 14);
  assert.equal(new Set(e.corruptionPlan.map((p) => p.slot % 7)).size, 7);
  assert.equal(
    new Set(e.corruptionPlan.map((p) => Math.floor(p.slot / 7))).size,
    6,
  );
  const first = e.corruptionPlan[0].slot;
  b.hand = [g.newCard("shield")];
  b.focus = 1;
  g.act(g.legal().find((a) => a.type === "place" && a.slot === first));
  assert.equal(e.corruptionPlan.length, 14);
  assert.ok(!e.corruptionPlan.some((p) => p.slot === first));
  round(g);
  assert.equal(Object.keys(b.corruptions).length, 14);
  assert.equal(b.corruptions[first], undefined);
  prepareCorruption(g, e, enemies.hollowScribe.rotation[0]);
  assert.equal(e.corruptionPlan.length, 0);
  delete b.corruptions[Object.keys(b.corruptions)[0]];
  prepareCorruption(g, e, enemies.hollowScribe.rotation[0]);
  assert.equal(e.corruptionPlan.length, 1);
  applyCorruptions(g, e);
  assert.equal(Object.keys(b.corruptions).length, 14);
});

test("Scribe cannot overwrite cards, other Corruptions or another enemy's warnings", () => {
  const g = arena("hollowScribe"),
    b = g.s.battle,
    e = b.enemies[0];
  for (let i = 0; i < 30; i++) b.grid[i] = [g.instance(g.newCard("shield"))];
  b.corruptions[30] = { kind: "nausea", source: "other" };
  b.enemies.push({
    uid: "other",
    hp: 1,
    corruptionPlan: [{ slot: 31, kind: "hole" }],
  });
  prepareCorruption(g, e, enemies.hollowScribe.rotation[0]);
  assert.equal(e.corruptionPlan.length, 10);
  assert.ok(e.corruptionPlan.every((p) => p.slot >= 32));
});

test("Nausea selects empty spaces adjacent to the most cards", () => {
  const g = arena("spoolkeeper"),
    b = g.s.battle,
    e = b.enemies[0];
  for (const i of [1, 7, 9, 15]) b.grid[i] = [g.instance(g.newCard("blast"))];
  prepareCorruption(g, e, enemies.spoolkeeper.rotation[0]);
  assert.equal(e.corruptionPlan[0].slot, 8);
  assert.equal(e.corruptionPlan.length, 2);
  assert.notEqual(e.corruptionPlan[1].slot, 8);
});

test("Old battle rotations migrate without changing committed targets or consuming randomness", () => {
  const g = arena("hollowScribe"),
    b = g.s.battle,
    e = b.enemies[0];
  e.rotation = [
    { name: "Foretell Memory Hole", markCorruption: "hole", count: 1 },
    { name: "Memory Hole", applyCorruption: true },
    { name: "Inkless quill", damage: 8, element: "Light" },
    { name: "Gather the threads", element: "Arcane" },
  ];
  e.cycle = 5;
  e.corruptionCap = 2;
  e.corruptionPlan = [{ slot: 9, kind: "hole" }];
  const rng = g.s.rng;
  const loaded = new Game(0, structuredClone(g.s)),
    le = loaded.s.battle.enemies[0];
  assert.equal(le.cycle, 4);
  assert.equal(le.corruptionCap, 14);
  assert.deepEqual(le.rotation, enemies.hollowScribe.rotation);
  assert.deepEqual(le.corruptionPlan, e.corruptionPlan);
  assert.equal(loaded.s.rng, rng);
  assert.equal(loaded.tell(le).applyCorruption, true);
});
