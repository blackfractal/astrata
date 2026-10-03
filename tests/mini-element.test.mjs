import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { ELEMENTS, enemies } from "../src/content.mjs";
function base(element = "Fire") {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "colossus", restless: 0 }]);
  g.s.battle.phase = "activate";
  g.s.battle.enemies[0].element = element;
  g.s.hp = g.s.maxHp = 999;
  return g;
}
const minis = (g) => g.s.battle.enemies.filter((e) => e.id === "mini");
for (const element of ELEMENTS)
  test(`${element} form summons only on matching hits, once per activation`, () => {
    const g = base(element),
      e = g.s.battle.enemies[0];
    for (const other of ELEMENTS.filter((x) => x !== element))
      g.damageEnemy(e, 1, other, {});
    assert.equal(minis(g).length, 0);
    const context = {},
      hp = e.hp;
    g.damageEnemy(e, 4, element, context);
    assert.equal(e.hp, hp - 4);
    g.damageEnemy(e, 1, element, context);
    assert.equal(minis(g).length, 1);
    const mini = minis(g)[0];
    assert.equal(mini.hp, 11);
    assert.equal(mini.element, element);
    assert.equal(g.tell(mini).element, element);
    assert.equal(g.tell(mini).damage, 2);
    mini.cycle = 1;
    assert.equal(g.tell(mini).element, element);
    assert.equal(g.tell(mini).damage, 3);
    g.damageEnemy(e, 1, element, {});
    assert.equal(minis(g).length, 2);
  });
test("Fire example: Water +50%, Earth half, Fire normal and creates a Fire Mini-Void", () => {
  const g = base(),
    e = g.s.battle.enemies[0],
    hp = e.hp;
  g.damageEnemy(e, 4, "Water", {});
  assert.equal(e.hp, hp - 6);
  assert.equal(minis(g).length, 0);
  g.damageEnemy(e, 4, "Earth", {});
  assert.equal(e.hp, hp - 8);
  assert.equal(minis(g).length, 0);
  g.damageEnemy(e, 4, "Fire", {});
  assert.equal(e.hp, hp - 12);
  assert.equal(minis(g)[0].element, "Fire");
  const mini = minis(g)[0];
  g.damageEnemy(mini, 4, "Water", {});
  assert.equal(mini.hp, 5);
  assert.equal(minis(g).length, 1);
});
test("Existing summons retain their elements after a real Glare and through save/resume", () => {
  const g = base(),
    b = g.s.battle,
    e = b.enemies[0];
  g.damageEnemy(e, 1, "Fire", {});
  e.cycle = 3;
  const pick = g.pick.bind(g);
  g.pick = () => "Water";
  g.act(g.legal().find((a) => a.type === "endTurn"));
  g.pick = pick;
  assert.equal(e.element, "Water");
  assert.equal(minis(g)[0].element, "Fire");
  assert.equal(g.s.hp, 992); // Glare hits for five; existing Fire summon then attacks for two.
  g.damageEnemy(e, 1, "Fire", {});
  assert.equal(minis(g).length, 1);
  g.damageEnemy(e, 1, "Water", {});
  assert.equal(minis(g).length, 2);
  g.s.version = { ...g.s.version, rules: "1.3.15" };
  const h = new Game(0, g.s);
  assert.deepEqual(
    minis(h).map((e) => e.element),
    ["Fire", "Water"],
  );
  assert.deepEqual(
    minis(h).map((e) => h.tell(e).element),
    ["Fire", "Water"],
  );
  const live = h.observe().battle.enemies.filter((e) => e.id === "mini");
  assert.deepEqual(
    live.map((e) => e.rotation.map((t) => t.element)),
    [
      ["Fire", "Fire"],
      ["Water", "Water"],
    ],
  );
  assert.equal(enemies.mini.element, "Chaos");
});
test("A matching equipment bonus can summon after a nonmatching card hit", () => {
  const g = base(),
    b = g.s.battle;
  const ring = g.s.inventory.find((x) => x.id === "ring");
  ring.gem = g.addItem("ruby").uid;
  g.s.equipment.finger1 = ring.uid;
  b.grid[0] = [g.instance(g.newCard("blast"))];
  g.act(g.legal().find((a) => a.type === "activate"));
  assert.equal(minis(g).length, 1);
  assert.equal(minis(g)[0].element, "Fire");
});
test("Matching killing blow leaves its summon to fight before victory", () => {
  const g = base(),
    b = g.s.battle;
  b.enemies[0].hp = 1;
  b.grid[0] = [g.instance(g.newCard("blast"))];
  Object.assign(b.grid[0][0], { element: "Fire", transmuted: true });
  g.act(g.legal().find((a) => a.type === "activate"));
  assert.equal(g.s.mode, "battle");
  assert.equal(minis(g).length, 1);
  assert.equal(g.observe().battle.enemies[0].element, "Fire");
});
