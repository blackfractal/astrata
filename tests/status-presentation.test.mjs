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

test("battle curses record their actual equipment source before typed player ticks and Reveal", () => {
  const g = new Game(8);
  g.s.equipment = {};
  g.s.equipment = { finger1: null, torso: null };
  const ring = g.addItem("curseRing"),
    armor = g.addItem("curseArmor");
  g.addItem("curseGem");
  g.capturePresentation = true;
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const casts = g.presentation.filter((f) => f.kind === "status");
  assert.equal(
    casts.find((f) => f.statusEffect === "burn").sourceItem,
    ring.uid,
  );
  assert.equal(
    casts.find((f) => f.statusEffect === "corrode").sourceItem,
    armor.uid,
  );
  assert.ok(
    casts.every(
      (f) =>
        f.target === "player" &&
        Number.isFinite(f.state.battle.focus) &&
        f.state.hp === 70,
    ),
  );
  const ticks = g.presentation.filter((f) => f.statusTick);
  assert.deepEqual(
    ticks.map((f) => f.statusTick),
    ["burn", "poison", "corrode"],
  );
  assert.ok(ticks.every((f) => f.pathFrom === null && f.target === "player"));
  assert.equal(g.s.hp, 67);
  assert.deepEqual(g.s.status, { burn: 0, poison: 1, corrode: 2 });
  assert.equal(g.presentation.at(-1).kind, "reveal");
});

test("enemy applications target the player or the actual oldest Ally", () => {
  for (const ally of [false, true]) {
    const g = base(),
      b = g.s.battle;
    b.enemies[0].id = "sludge";
    b.enemies[0].cycle = 2;
    if (ally) b.grid[6] = [g.instance(g.newCard("familiar"))];
    b.jobs = [{ kind: "enemyAction", uid: 900 }];
    g.pump();
    const f = g.presentation.find((f) => f.statusEffect === "corrode");
    assert.equal(f.source, 900);
    assert.equal(f.target, ally ? "card" : "player");
    assert.equal(f.slot, ally ? 6 : null);
    assert.equal((ally ? b.grid[6][0] : g.s).status.corrode, 1);
  }
});

test("status attached to an enemy hit retains its source even when blocked", () => {
  const g = base(),
    b = g.s.battle;
  b.reaction = { name: "Sip", damage: 0, poison: 1, source: 900 };
  g.finishHit();
  const f = g.presentation.find((f) => f.statusEffect === "poison");
  assert.equal(f.source, 900);
  assert.equal(f.target, "player");
  assert.equal(g.s.status.poison, 1);
});

test("legacy pending player status jobs receive typed stationary effects", () => {
  const g = base(),
    b = g.s.battle;
  b.jobs = [
    {
      kind: "hit",
      statusHit: true,
      name: "corrode",
      element: "Arcane",
      damage: 2,
    },
  ];
  g.pump();
  const f = g.presentation.find((f) => f.kind === "hit");
  assert.equal(f.statusTick, "corrode");
  assert.equal(f.pathFrom, null);
  assert.equal(g.s.hp, 68);
});
