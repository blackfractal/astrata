import test from "node:test";
import assert from "node:assert/strict";
import { Game, attachedBurn } from "../src/engine.mjs";

function setup(id = "water") {
  const g = new Game(79);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.grid = b.grid.map(() => []);
  Object.assign(b, { phase: "place", focus: 10, channel: 20, turn: 2 });
  b.enemies[0].hp = b.enemies[0].maxHp = 500;
  b.enemies[0].element = "Arcane";
  const host = g.instance(g.newCard(id));
  b.grid[8] = [host];
  return { g, b, host };
}
function act(g, type, p = () => true) {
  const a = g.legal().find((a) => a.type === type && p(a));
  assert.ok(a, `legal ${type}`);
  g.act(a);
  return a;
}
function attach(g, upgrade = false) {
  const c = g.newCard("heat");
  c.upgrade = upgrade;
  g.s.battle.hand.push(c);
  act(g, "place", (a) => a.uid === c.uid && a.slot === 8);
  return g.s.battle.grid[8].find((x) => x.uid === c.uid);
}
function attack(g) {
  const b = g.s.battle;
  b.phase = "activate";
  const a = act(g, "activate", (a) => a.slot === 8);
  b.turn++;
  return a;
}

test("Heat meld preserves host and spends only first two attack uses, including upgraded Burn", () => {
  const { g, b, host } = setup("thorn");
  const heat = attach(g, true);
  assert.equal(b.grid[8].at(-1), host);
  assert.equal(heat.attachedTo, host.uid);
  assert.equal(g.allowance(host, 8), 3);
  assert.equal(g.recallCost(b.grid[8]), 1);
  assert.equal(attachedBurn(b, host, 8), 3);
  for (let n = 1; n <= 3; n++) {
    const a = attack(g);
    assert.equal(a.effects.heatBurn, n <= 2 ? 3 : 0);
    assert.equal(heat.used, Math.min(2, n));
    assert.equal(b.enemies[0].status.burn, Math.min(2, n) * 3);
  }
  assert.equal(b.enemies[0].hp, 488);
});
test("Heat can meld to Earth Allies, Water or Wind attacks, including transmuted attacks; rejects utilities and other elements", () => {
  for (const id of ["sapling", "water", "gust"]) {
    const { g, host } = setup(id);
    attach(g);
    assert.equal(g.s.battle.grid[8].at(-1), host);
  }
  for (const id of ["clear", "shield", "ignis", "blast"]) {
    const { g, b } = setup(id);
    b.hand = [g.newCard("heat")];
    assert.equal(
      g.legal().some((a) => a.type === "place" && a.slot === 8),
      false,
    );
  }
  const { g, host } = setup("blast");
  host.element = "Wind";
  host.transmuted = true;
  attach(g);
  attack(g);
  assert.equal(g.s.battle.enemies[0].status.burn, 2);
});
test("Charging does not spend Heat; an area attack spends one use and burns each target", () => {
  const { g, b, host } = setup("seed");
  const heat = attach(g);
  for (let n = 0; n < 3; n++) {
    assert.equal(attack(g).effects.heatBurn, 0);
    assert.equal(heat.used, 0);
  }
  attack(g);
  assert.equal(heat.used, 1);
  assert.equal(b.enemies[0].status.burn, 2);
  const area = setup("storm");
  area.b.enemies.push({ ...structuredClone(area.b.enemies[0]), uid: 901 });
  const h = attach(area.g);
  attack(area.g);
  assert.equal(h.used, 1);
  assert.deepEqual(
    area.b.enemies.map((e) => e.status.burn),
    [2, 2],
  );
});
test("Immune or Flickering target still consumes a Heat attack use; no extra Burn6", () => {
  for (const mode of ["immune", "flicker"]) {
    const { g, b } = setup();
    const h = attach(g);
    if (mode === "immune") b.enemies[0].element = "Water";
    else b.enemies[0].flicker = true;
    attack(g);
    assert.equal(h.used, 1);
    assert.equal(b.enemies[0].status.burn, 0);
  }
  const { g, b } = setup();
  attach(g);
  attack(g);
  assert.equal(b.enemies[0].status.burn, 2);
});
test("Heat recall resets separate cards, destruction follows host, saves preserve spent attachment uses", () => {
  const { g, b, host } = setup();
  const heat = attach(g);
  attack(g);
  const copy = new Game(0, structuredClone(g.s));
  assert.equal(copy.s.battle.grid[8][0].used, 1);
  assert.equal(copy.s.battle.grid[8][0].attachedTo, host.uid);
  g.destroyCard(8, host.uid);
  assert.deepEqual(
    new Set(b.destroyed.map((c) => c.uid)),
    new Set([host.uid, heat.uid]),
  );
  const other = setup();
  const h = attach(other.g);
  const focus = other.b.focus;
  act(other.g, "recall", (a) => a.slot === 8);
  assert.equal(other.b.focus, focus - 1);
  assert.equal(other.b.discard.length, 2);
  assert.ok(other.b.discard.every((c) => c.attachedTo == null));
  assert.equal(
    other.g.instance(other.b.discard.find((c) => c.uid === h.uid)).used,
    0,
  );
});
test("Separate Heat copies each supply two uses and old Fusion saves migrate below their host", () => {
  const { g, b, host } = setup();
  const a = attach(g),
    c = attach(g);
  attack(g);
  assert.equal(b.enemies[0].status.burn, 4);
  assert.equal(a.used, 1);
  assert.equal(c.used, 1);
  const legacy = setup();
  const heat = legacy.g.instance(legacy.g.newCard("heat"));
  heat.used = 1;
  legacy.b.grid[8].push(heat);
  legacy.g.s.version = { ...legacy.g.s.version, rules: "2.1.12" };
  const loaded = new Game(0, structuredClone(legacy.g.s));
  assert.equal(loaded.s.battle.grid[8].at(-1).uid, legacy.host.uid);
  assert.equal(loaded.s.battle.grid[8][0].attachedTo, legacy.host.uid);
  assert.equal(loaded.s.battle.grid[8][0].used, 1);
});
