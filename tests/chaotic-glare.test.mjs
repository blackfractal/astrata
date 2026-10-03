import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { enemies } from "../src/content.mjs";
const GLARE_ELEMENTS = ["Fire", "Earth", "Wind", "Water", "Chaos", "Light"];
function base() {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "colossus", restless: 0 }]);
  g.s.battle.phase = "activate";
  g.s.battle.hand = [];
  g.s.hp = g.s.maxHp = 999;
  g.capturePresentation = true;
  return g;
}
function end(g) {
  g.s.battle.phase = "activate";
  g.act(g.legal().find((a) => a.type === "endTurn"));
}
test("Colossus opens with two Chaos fists, Collapse, then piercing Glare", () => {
  const g = base(),
    e = g.s.battle.enemies[0];
  assert.equal(e.element, "Chaos");
  for (const [cycle, name, damage] of [
    [0, "Void fist", 11],
    [1, "Void fist", 11],
    [2, "Collapse", 30],
    [3, "Chaotic Glare", 5],
  ]) {
    e.cycle = cycle;
    assert.equal(g.tell(e).name, name);
    assert.equal(g.tell(e).damage, damage);
  }
  const hp = g.s.hp;
  end(g);
  assert.equal(g.s.hp, hp - 5);
  assert.equal(e.cycle, 4);
  assert.ok(GLARE_ELEMENTS.includes(e.element));
  assert.ok(
    g.presentation.some((f) => f.name === "Chaotic Glare · " + e.element),
  );
});
for (const element of GLARE_ELEMENTS)
  test(`Glare supports ${element}; both fists and live details use it`, () => {
    const g = base(),
      e = g.s.battle.enemies[0];
    e.cycle = 3;
    const originalPick = g.pick.bind(g);
    g.pick = (pool) => {
      assert.deepEqual([...pool].sort(), [...GLARE_ELEMENTS].sort());
      return element;
    };
    end(g);
    g.pick = originalPick;
    assert.equal(e.element, element);
    const live = g.observe().battle.enemies[0];
    assert.equal(live.tell.element, element);
    assert.equal(live.rotation[0].element, element);
    assert.equal(live.rotation[1].element, element);
    for (let i = 0; i < 2; i++) {
      assert.equal(g.tell(e).element, element);
      const hp = g.s.hp;
      end(g);
      assert.equal(g.s.hp, hp - 12);
    }
    assert.equal(g.tell(e).name, "Collapse");
  });
test("Fire form takes Water +50%, Earth half; legacy saved Arcane form remains neutral", () => {
  const g = base(),
    e = g.s.battle.enemies[0];
  for (const [form, incoming, expected] of [
    ["Fire", "Water", 6],
    ["Fire", "Earth", 2],
    ["Arcane", "Water", 4],
    ["Arcane", "Light", 4],
  ]) {
    e.element = form;
    const hp = e.hp;
    g.damageEnemy(e, 4, incoming, {});
    assert.equal(e.hp, hp - expected);
  }
});
test("Matching-element Mini-Void trait follows a change to Fire", () => {
  const g = base(),
    e = g.s.battle.enemies[0];
  e.element = "Fire";
  const context = {};
  g.damageEnemy(e, 1, "Fire", context);
  g.damageEnemy(e, 1, "Fire", context);
  assert.equal(g.s.battle.enemies.filter((e) => e.id === "mini").length, 1);
});
test("Glare selection and later random state survive replay and exact-state resume", () => {
  const g = base();
  g.s.battle.enemies[0].cycle = 3;
  const h = new Game(0, g.s);
  end(g);
  end(h);
  assert.equal(g.s.rng, h.s.rng);
  assert.equal(g.s.battle.enemies[0].element, h.s.battle.enemies[0].element);
  const resumed = new Game(0, g.s);
  assert.equal(
    resumed.tell(resumed.s.battle.enemies[0]).element,
    g.s.battle.enemies[0].element,
  );
  for (let i = 0; i < 4; i++) {
    end(g);
    end(resumed);
  }
  assert.equal(g.s.rng, resumed.s.rng);
  assert.equal(
    g.s.battle.enemies[0].element,
    resumed.s.battle.enemies[0].element,
  );
  assert.equal(enemies.colossus.element, "Chaos");
});
test("Glare tells do not roll the element early, and a previous-version save adopts the fourth move", () => {
  const g = base();
  g.s.version = { ...g.s.version, rules: "1.3.14" };
  const h = new Game(0, g.s),
    e = h.s.battle.enemies[0];
  e.cycle = 3;
  const rng = h.s.rng;
  assert.equal(h.tell(e).name, "Chaotic Glare");
  h.observe();
  h.legal();
  assert.equal(h.s.rng, rng);
  assert.equal(e.element, "Chaos");
  assert.equal(h.observe().battle.enemies[0].rotation.length, 4);
});
