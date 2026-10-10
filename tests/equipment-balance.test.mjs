import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { items } from "../src/content.mjs";
function setup(two = false) {
  const g = new Game(71);
  g.s.equipment.wrist2 = null;
  g.beginBattle([
    { uid: 900, enemy: "beetle", restless: 0 },
    ...(two ? [{ uid: 901, enemy: "beetle", restless: 0 }] : []),
  ]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 20;
  for (const e of b.enemies) {
    e.hp = e.maxHp = 1000;
    e.element = "Arcane";
  }
  return g;
}
function put(g, id, i) {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[i].push(c);
  return c;
}
function activate(g, i) {
  const a = g.legal().find((a) => a.type === "activate" && a.slot === i);
  assert.ok(a);
  g.act(a);
}
test("Rootbound Ring adds two only on the first attack and refreshes each player turn and battle", () => {
  const g = setup(),
    b = g.s.battle,
    e = b.enemies[0];
  put(g, "blast", 0);
  put(g, "blast", 4);
  activate(g, 0);
  assert.equal(e.hp, 994);
  activate(g, 4);
  assert.equal(e.hp, 990);
  const restored = new Game(0, g.s);
  put(restored, "blast", 10);
  activate(restored, 10);
  assert.equal(restored.s.battle.enemies[0].hp, 986);
  g.beginTurn();
  b.phase = "activate";
  activate(g, 0);
  assert.equal(e.hp, 984);
  g.beginBattle([{ uid: 902, enemy: "beetle", restless: 0 }]);
  g.s.battle.phase = "activate";
  put(g, "blast", 0);
  const hp = g.s.battle.enemies[0].hp;
  activate(g, 0);
  assert.equal(g.s.battle.enemies[0].hp, hp - 6);
});
test("Ring fires once across a Plasma pile, an area attack, and a multi-element Prism", () => {
  let g = setup();
  for (let i = 0; i < 4; i++) put(g, "plasma", 0);
  {
    const stack = g.s.battle.grid[0],
      host = stack.at(-1);
    for (const ball of stack.slice(0, -1)) ball.attachedTo = host.uid;
  }
  activate(g, 0);
  assert.equal(g.s.battle.enemies[0].hp, 968);
  g = setup(true);
  put(g, "storm", 0);
  activate(g, 0);
  assert.deepEqual(
    g.s.battle.enemies.map((e) => e.hp),
    [991, 993],
  );
  g = setup();
  put(g, "prism", 8);
  for (const [id, i] of [
    ["ignis", 1],
    ["water", 7],
    ["gust", 9],
    ["thorn", 15],
  ])
    put(g, id, i);
  activate(g, 8);
  assert.equal(g.s.battle.enemies[0].hp, 978);
});
test("Charge building and status-only activations preserve the Ring, including melded Heat", () => {
  const g = setup(),
    b = g.s.battle;
  put(g, "kiln", 0);
  put(g, "heat", 4);
  put(g, "blast", 10);
  activate(g, 0);
  activate(g, 4);
  assert.notEqual(b.firstAttackTurn, b.turn);
  activate(g, 10);
  assert.equal(b.enemies[0].hp, 994);
  const h = setup();
  const host = put(h, "water", 0);
  const heat = h.instance(h.newCard("heat"));
  heat.attachedTo = host.uid;
  h.s.battle.grid[0].unshift(heat);
  activate(h, 0);
  assert.equal(h.s.battle.enemies[0].hp, 991);
  assert.equal(h.s.battle.enemies[0].status.burn, 2);
});
test("Negated, guarded or lethal opening attacks spend the Ring without moving its proc to another target", () => {
  const g = setup(true),
    b = g.s.battle;
  put(g, "storm", 0);
  put(g, "blast", 4);
  b.enemies[0].flicker = true;
  activate(g, 0);
  assert.deepEqual(
    b.enemies.map((e) => e.hp),
    [1000, 993],
  );
  activate(g, 4);
  assert.equal(b.enemies[0].hp, 996);
  const h = setup();
  put(h, "blast", 0);
  put(h, "blast", 4);
  h.s.battle.enemies[0].guard = 10;
  activate(h, 0);
  assert.equal(h.s.battle.enemies[0].guard, 4);
  activate(h, 4);
  assert.equal(h.s.battle.enemies[0].hp, 1000);
  const k = setup(true);
  put(k, "storm", 0);
  k.s.battle.enemies[0].hp = 1;
  activate(k, 0);
  assert.equal(k.s.battle.enemies[1].hp, 993);
  assert.equal(k.s.battle.firstAttackTurn, k.s.battle.turn);
});
test("Ring retains socketed elemental damage; other damage gear keeps its own trigger", () => {
  const g = setup(),
    b = g.s.battle;
  g.addItem("ruby");
  g.getItem(g.s.equipment.finger2).gem = g.s.inventory.at(-1).uid;
  b.enemies[0].element = "Earth";
  put(g, "blast", 0);
  put(g, "blast", 4);
  activate(g, 0);
  assert.equal(b.enemies[0].hp, 993);
  activate(g, 4);
  assert.equal(b.enemies[0].hp, 989);
  const h = setup();
  h.addItem("thornCrown");
  h.s.equipment.head = h.s.inventory.at(-1).uid;
  for (let i = 0; i < 4; i++) put(h, "plasma", 0);
  {
    const stack = h.s.battle.grid[0],
      host = stack.at(-1);
    for (const ball of stack.slice(0, -1)) ball.attachedTo = host.uid;
  }
  activate(h, 0);
  assert.equal(h.s.battle.enemies[0].hp, 967);
});
test("Bronze Bracelet refills two block per enemy turn and starting gem previews match new equipment", () => {
  const g = new Game(12);
  g.act(g.legal()[0]);
  const options = g.legal();
  assert.equal(options.find((a) => a.slot === "wrist2").effects.defense, 2);
  assert.equal(options.find((a) => a.slot === "finger2").effects.damage, 2);
  assert.equal(items.bronze.effect.block, 2);
  assert.equal(items.silver.effect.block, 4);
  assert.equal(items.gold.effect.block, 7);
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  g.s.battle.enemies[0].frozen = true;
  for (let i = 0; i < 2; i++) {
    g.endTurn();
    assert.equal(g.s.battle.bracelets[0].block, 2);
    while (g.s.battle.reaction) {
      const a = g.legal().find((a) => a.type === "bracelet") || g.legal()[0];
      g.act(a);
    }
  }
});
