import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
function base(element = "Arcane") {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([
    { uid: 900, enemy: "beetle", restless: 0 },
    { uid: 901, enemy: "beetle", restless: 0 },
  ]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 10;
  b.enemies.forEach((e) => {
    e.element = element;
    e.hp = e.maxHp = 200;
  });
  g.capturePresentation = true;
  return g;
}
for (const [id, status, immune] of [
  ["spore", "poison", "Fire"],
  ["heat", "burn", "Water"],
  ["rot", "corrode", "Chaos"],
])
  test(`${status} cast emits one explicit source-to-target status frame, including immunity`, () => {
    for (const element of ["Arcane", immune]) {
      const g = base(element);
      g.s.battle.grid[6] = [g.instance(g.newCard(id))];
      g.act(
        g
          .legal()
          .find(
            (a) => a.type === "activate" && a.slot === 6 && a.target === 900,
          ),
      );
      const frames = g.presentation.filter((f) => f.statusEffect === status);
      assert.equal(frames.length, 1);
      assert.equal(frames[0].sourceSlot, 6);
      assert.equal(frames[0].uid, 900);
      assert.equal(!!frames[0].immune, element === immune);
      assert.equal(
        g.s.battle.enemies[0].status[status] > 0,
        element !== immune,
      );
    }
  });
test("Kiln area Burn emits one impact per target; status ticks carry their type", () => {
  const g = base(),
    b = g.s.battle,
    c = g.instance(g.newCard("kiln"));
  c.charge = 2;
  b.grid[6] = [c];
  g.act(
    g
      .legal()
      .find((a) => a.type === "activate" && a.slot === 6 && a.target === 900),
  );
  const frames = g.presentation.filter((f) => f.statusEffect === "burn");
  assert.deepEqual(
    frames.map((f) => f.uid),
    [900, 901],
  );
  assert.ok(frames.every((f) => f.sourceSlot === 6));
  g.presentation = [];
  b.jobs = [
    { kind: "enemyStatus", uid: 900, status: "poison", damage: 3 },
    { kind: "enemyStatus", uid: 900, status: "corrode", damage: 1 },
  ];
  g.pump();
  assert.deepEqual(
    g.presentation.filter((f) => f.statusTick).map((f) => f.statusTick),
    ["poison", "corrode"],
  );
});
