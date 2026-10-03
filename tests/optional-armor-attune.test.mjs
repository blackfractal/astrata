import test from "node:test";
import assert from "node:assert/strict";
import { Game, attunementElements } from "../src/engine.mjs";
function base(armor = "stoneArmor") {
  const g = new Game(52);
  g.s.equipment = {};
  g.s.equipment.torso = g.addItem(armor).uid;
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  g.s.battle.phase = "activate";
  g.s.battle.bracelets = [];
  g.capturePresentation = true;
  return g;
}
function incoming(g, damage = 8, extra = {}) {
  g.s.battle.jobs = [
    {
      kind: "hit",
      damage,
      element: "Arcane",
      source: 900,
      name: "Test",
      ...extra,
    },
  ];
  g.pump();
}
const act = (g, type) => g.act(g.legal().find((a) => a.type === type));
test("armor is optional, consumes no Channel, drains across hits and refreshes on the next enemy turn", () => {
  const g = base(),
    b = g.s.battle,
    channel = b.channel;
  b.bracelets = [{ uid: 901, block: 2, name: "Bracelet", element: "Arcane" }];
  incoming(g);
  assert.equal(g.s.hp, 70);
  assert.ok(g.legal().some((a) => a.type === "armor"));
  act(g, "armor");
  assert.equal(b.reaction.damage, 7);
  assert.equal(b.reaction.column, -1);
  assert.ok(!g.legal().some((a) => a.type === "armor"));
  assert.equal(b.channel, channel);
  const h = new Game(0, structuredClone(g.s));
  assert.ok(!h.legal().some((a) => a.type === "armor"));
  act(h, "skipEquipment");
  assert.equal(h.s.hp, 63);
  assert.equal(h.s.battle.bracelets[0].block, 2);
  incoming(h, 4);
  assert.ok(!h.legal().some((a) => a.type === "armor"));
  act(h, "bracelet");
  assert.equal(h.s.hp, 61);
  h.endTurn();
  assert.equal(h.s.battle.armorBlock, 1);
  assert.ok(h.legal().some((a) => a.type === "armor"));
});
test("equipment routing permits armor then Bracelet or the reverse; choosing armor passes all grid cards", () => {
  for (const order of [
    ["armor", "bracelet"],
    ["bracelet", "armor"],
  ]) {
    const g = base("earthArmor"),
      b = g.s.battle;
    const ward = g.instance(g.newCard("ward"));
    ward.ward = 10;
    b.grid[0] = [ward];
    b.bracelets = [{ uid: 901, block: 2, name: "Bracelet", element: "Arcane" }];
    incoming(g, 10, { element: "Wind" });
    act(g, order[0]);
    assert.ok(!g.legal().some((a) => a.type === "ward"));
    act(g, order[1]);
    assert.equal(g.s.hp, 65);
    assert.equal(ward.ward, 10);
  }
});
test("clicking through preserves Mirror; choosing Mirror spends it, while statuses never offer armor", () => {
  const g = base("mirrorArmor");
  incoming(g, 2);
  act(g, "skipEquipment");
  assert.equal(g.s.hp, 68);
  assert.equal(g.s.battle.mirror, false);
  const hp = g.s.battle.enemies[0].hp;
  incoming(g, 2);
  act(g, "armor");
  assert.equal(g.s.hp, 68);
  assert.equal(g.s.battle.enemies[0].hp, hp - 2);
  incoming(g, 2);
  assert.equal(g.s.hp, 66);
  assert.ok(!g.legal().some((a) => a.type === "armor"));
  const h = base("fireArmor");
  incoming(h, 3, { statusHit: true, element: "Fire" });
  assert.equal(h.s.hp, 67);
  assert.equal(h.s.battle.reaction, null);
  for (const id of ["holyArmor", "quickArmor"]) {
    const x = base(id);
    incoming(x, 3);
    assert.ok(!x.legal().some((a) => a.type === "armor"));
  }
});
test("helmet bonus is stored at activation, source-attributed once and never retroactive", () => {
  const g = base(),
    b = g.s.battle,
    helmet = g.addItem("crown");
  g.s.equipment.head = helmet.uid;
  const shield = g.instance(g.newCard("shield"));
  b.grid[8] = [shield];
  const fire = g.instance(g.newCard("corner"));
  b.grid[7] = [fire];
  const a = g
    .legal()
    .find(
      (a) => a.type === "activate" && a.slot === 8 && a.element === "Arcane",
    );
  assert.equal(a.effects.shield, 6);
  g.act(a);
  assert.equal(b.shields[0].block, 6);
  assert.equal(b.shields[0].element, "Arcane");
  const frames = g.presentation.filter((f) => f.kind === "shieldBoost");
  assert.equal(frames.length, 1);
  assert.equal(frames[0].sourceItem, helmet.uid);
  assert.equal(frames[0].slot, 8);
  assert.equal(frames[0].amount, 2);
  g.s.equipment.head = null;
  assert.equal(b.shields[0].block, 6);
});
test("Unattune is legal with neighbors, Transmute stays fixed, and current armor/helmets supply no attunement", () => {
  const g = base("waterArmor"),
    b = g.s.battle;
  g.s.equipment.head = g.addItem("crown").uid;
  const shield = g.instance(g.newCard("shield"));
  b.grid[8] = [shield];
  assert.deepEqual(attunementElements(b, shield, 8), ["Arcane"]);
  b.grid[7] = [g.instance(g.newCard("corner"))];
  assert.deepEqual(attunementElements(b, shield, 8), ["Arcane", "Fire"]);
  shield.element = "Water";
  shield.transmuted = true;
  assert.deepEqual(attunementElements(b, shield, 8), ["Water"]);
});

test("Armor retains partial block across hits and saves; skip and status damage do not spend it", () => {
  const g = base("fireArmor");
  incoming(g, 1);
  act(g, "armor");
  assert.equal(g.s.battle.armorBlock, 1);
  assert.equal(g.s.hp, 70);
  const h = new Game(0, g.s);
  incoming(h, 1, { statusHit: true });
  assert.equal(h.s.battle.armorBlock, 1);
  incoming(h, 1);
  act(h, "skipEquipment");
  assert.equal(h.s.battle.armorBlock, 1);
  incoming(h, 6, { element: "Earth" });
  assert.equal(h.legal().find((a) => a.type === "armor").effects.armor, 2);
  act(h, "armor");
  assert.equal(h.s.battle.armorBlock, 0);
  assert.equal(h.s.hp, 64);
  incoming(h, 6, { element: "Earth" });
  assert.equal(h.s.hp, 58);
});
test("multi-hit and multiple-enemy attacks share one Armor pool until next enemy turn", () => {
  const g = base("fireArmor"),
    b = g.s.battle;
  b.enemies[0].hp = b.enemies[0].maxHp = 100;
  b.jobs = [900, 900, 901].map((source) => ({
    kind: "hit",
    damage: 10,
    element: "Earth",
    source,
    name: "Volley",
  }));
  g.pump();
  act(g, "armor");
  assert.equal(g.s.hp, 43);
  assert.equal(b.armorBlock, 0);
  assert.equal(
    g.presentation.filter((f) => f.kind === "defend" && f.item != null).length,
    1,
  );
  g.endTurn();
  assert.equal(b.armorBlock, 2);
  assert.ok(g.legal().some((a) => a.type === "armor"));
});
test("legacy saves initialize Armor once and preserve a known spent current hit", () => {
  for (const spent of [false, true]) {
    const g = base("fireArmor");
    incoming(g, 10);
    delete g.s.battle.armorBlock;
    g.s.version = { ...g.s.version, rules: "1.3.36" };
    g.s.battle.reaction.armorUsed = spent;
    const h = new Game(0, g.s);
    assert.equal(h.s.battle.armorBlock, spent ? 0 : 2);
    assert.equal(
      h.legal().some((a) => a.type === "armor"),
      !spent,
    );
  }
});
