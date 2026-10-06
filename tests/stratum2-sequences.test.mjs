import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { enemies } from "../src/content.mjs";

const cases = [
  [
    "dewThief",
    0,
    [
      [4, "Water"],
      [3, "Wind"],
    ],
  ],
  [
    "threadMite",
    0,
    [
      [3, "Earth"],
      [2, "Wind"],
    ],
  ],
  [
    "frayedHound",
    0,
    [
      [6, "Fire"],
      [6, "Wind"],
    ],
  ],
  [
    "bellowsGrub",
    1,
    [
      [7, "Fire"],
      [6, "Wind"],
    ],
  ],
  [
    "looseEcho",
    1,
    [
      [5, "Light"],
      [4, "Chaos"],
    ],
  ],
];
function arena(id, cycle) {
  const g = new Game(83);
  g.s.stratum = 2;
  g.s.hp = g.s.maxHp = 1000;
  g.beginBattle([{ uid: g.uid(), enemy: id, restless: 0 }]);
  g.s.battle.enemies[0].cycle = cycle;
  return g;
}
const pass = (g) => g.act(g.legal().find((a) => a.type === "skipEquipment"));
test("Every normal Loom enemy has an opening Corruption warning or a mixed-element move", () => {
  for (const d of Object.values(enemies).filter(
    (d) => d.stratum === 2 && !d.tutorialOnly,
  )) {
    assert.ok(
      d.openingCorruption ||
        d.rotation[0].markCorruption ||
        d.rotation.some(
          (t) => new Set(t.sequence?.map((h) => h.element)).size >= 2,
        ),
      d.name,
    );
  }
});
test("Mixed Mote attacks resolve in advertised order, including after an exact-state reload", () => {
  for (const [id, cycle, expected] of cases) {
    const original = arena(id, cycle);
    const saved = structuredClone(original.s);
    saved.version.rules = "2.1.9";
    const g = new Game(0, saved);
    const e = g.s.battle.enemies[0];
    assert.equal(e.cycle, cycle);
    assert.deepEqual(
      g.tell(e).sequence.map((h) => [h.damage, h.element]),
      expected,
    );
    g.endTurn();
    const hits = [];
    while (g.s.battle.reaction) {
      const h = g.s.battle.reaction;
      hits.push([h.damage, h.element]);
      assert.ok(hits.length <= 2);
      pass(g);
    }
    assert.deepEqual(hits, expected, id);
    assert.equal(g.s.hp, 1000 - expected.reduce((n, [d]) => n + d, 0));
  }
});
test("Mixed Mote hits scale individually with age, cycle and buffs without mutating content", () => {
  for (const [id, cycle, expected] of cases) {
    const g = arena(id, cycle),
      e = g.s.battle.enemies[0];
    e.cycle += enemies[id].rotation.length * 2;
    e.restless = 3;
    e.buff = 1;
    assert.deepEqual(
      g.tell(e).sequence.map((h) => [h.damage, h.element]),
      expected.map(([d, el]) => [d + 6, el]),
    );
    assert.deepEqual(
      enemies[id].rotation[cycle].sequence.map((h) => [h.damage, h.element]),
      expected,
    );
  }
});
test("Equipment Guard spent on the first element is unavailable against the second", () => {
  const g = arena("dewThief", 0),
    b = g.s.battle;
  const backup = g.addItem("silver");
  g.s.equipment.wristL = backup.uid;
  b.bracelets.push({
    uid: backup.uid,
    name: "Backup",
    block: 4,
    element: "Arcane",
  });
  g.endTurn();
  const first = g.legal().find((a) => a.type === "bracelet");
  g.act(first);
  assert.equal(b.bracelets[0].block, 0);
  pass(g);
  assert.equal(b.reaction.element, "Wind");
  assert.ok(
    !g.legal().some((a) => a.type === "bracelet" && a.uid === first.uid),
  );
  pass(g);
  assert.equal(g.s.hp, 995);
});
