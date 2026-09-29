import test from "node:test";
import assert from "node:assert/strict";
import { Game, enemyStatusImmunity } from "../src/engine.mjs";
import { ELEMENTS, ENEMY_STATUS_IMMUNITY } from "../src/content.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
function base(element = "Earth", id = "beetle") {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([
    { uid: 900, enemy: id, restless: 0 },
    { uid: 901, enemy: "beetle", restless: 0 },
  ]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 10;
  b.hand = [];
  g.s.hp = g.s.maxHp = 999;
  b.enemies.forEach((e) => {
    e.hp = e.maxHp = 200;
    e.element = element;
  });
  g.capturePresentation = true;
  return g;
}
const put = (g, id, i = 0) => {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[i] = [c];
  return c;
};
const activate = (g, slot = 0, target = 900) =>
  g.act(
    g
      .legal()
      .find(
        (a) => a.type === "activate" && a.slot === slot && a.target === target,
      ),
  );
for (const [id, status, element] of [
  ["heat", "burn", "Water"],
  ["spore", "poison", "Fire"],
  ["rot", "corrode", "Chaos"],
])
  test(`${element} blocks ${status} from actual ${id} activation, with cost and immune feedback`, () => {
    const g = base(element);
    put(g, id);
    activate(g);
    assert.equal(g.s.battle.enemies[0].status[status], 0);
    assert.equal(g.s.battle.channel, 9);
    assert.ok(
      g.presentation.some(
        (f) =>
          f.name === "Immune to " + status[0].toUpperCase() + status.slice(1),
      ),
    );
    assert.match(g.s.log.join(" "), /immune/);
  });
test("Only the three specified element/status pairs are immune; other applications stack", () => {
  for (const element of ELEMENTS)
    for (const status of ["burn", "poison", "corrode"]) {
      const g = base(element),
        e = g.s.battle.enemies[0];
      g.applyEnemyStatus(e, status, 2);
      g.applyEnemyStatus(e, status, 3);
      assert.equal(
        e.status[status],
        ENEMY_STATUS_IMMUNITY[element] === status ? 0 : 5,
      );
    }
});
test("Kiln still damages a Water target but its area Burn skips only Water enemies", () => {
  const g = base("Water"),
    b = g.s.battle,
    c = put(g, "kiln");
  c.charge = 2;
  b.enemies[1].element = "Earth";
  activate(g);
  assert.equal(b.enemies[0].hp, 185);
  assert.deepEqual(
    b.enemies.map((e) => e.status.burn),
    [0, 2],
  );
});
test("Heat fusion bonus cannot burn Water; its covered spell still resolves", () => {
  const g = base("Water"),
    b = g.s.battle;
  put(g, "thorn");
  b.grid[0].push(g.instance(g.newCard("heat")));
  activate(g);
  assert.equal(b.enemies[0].status.burn, 0);
  assert.ok(b.grid[0][0].used > 0);
  assert.ok(b.enemies[0].hp < 200);
});
test("Immune statuses never tick; other statuses retain their normal progression", () => {
  for (const element of ["Water", "Fire", "Chaos"]) {
    const g = base(element),
      e = g.s.battle.enemies[0];
    e.status = { burn: 3, poison: 3, corrode: 3 };
    g.endTurn();
    assert.equal(e.hp, 194);
    const expected = { burn: 2, poison: 3, corrode: 4 };
    expected[enemyStatusImmunity(e)] = 0;
    assert.deepEqual(e.status, expected);
  }
});
test("Glare uses current-form immunity, clears existing status immediately, and does not restore it", () => {
  for (const element of ["Water", "Fire", "Chaos"]) {
    const g = base("Earth", "colossus"),
      b = g.s.battle,
      e = b.enemies[0];
    e.status = { burn: 2, poison: 2, corrode: 2 };
    e.cycle = 3;
    g.pick = () => element;
    b.jobs = [{ kind: "enemyAction", uid: e.uid }];
    g.pump();
    const key = enemyStatusImmunity(e);
    assert.equal(e.status[key], 0);
    assert.equal(g.observe().battle.enemies[0].statusImmunity, key);
    e.cycle = 3;
    g.pick = () => "Arcane";
    b.jobs = [{ kind: "enemyAction", uid: e.uid }];
    g.pump();
    assert.equal(e.status[key], 0);
    assert.equal(g.applyEnemyStatus(e, key, 3), true);
    assert.equal(e.status[key], 3);
  }
});
test("Legacy saves and battle checkpoints clear impossible statuses without changing the input", () => {
  const g = base("Water"),
    b = g.s.battle;
  b.enemies[0].status.burn = 9;
  g.s.checkpoint = structuredClone({ ...g.s, checkpoint: undefined });
  g.s.version = { ...g.s.version, rules: "1.3.20" };
  const snapshot = structuredClone(g.s),
    h = new Game(0, g.s);
  assert.equal(h.s.battle.enemies[0].status.burn, 0);
  assert.equal(h.s.checkpoint.battle.enemies[0].status.burn, 0);
  assert.deepEqual(g.s, snapshot);
});
test("AI prefers a susceptible status target over an immune one", () => {
  const g = base("Fire"),
    b = g.s.battle;
  put(g, "spore");
  b.enemies[1].element = "Earth";
  const p = new WeightedPolicy(),
    actions = g.legal().filter((a) => a.type === "activate");
  assert.equal(p.choose(g.observe(), actions).action.target, 901);
});
