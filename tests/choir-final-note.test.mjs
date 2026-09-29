import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { enemies } from "../src/content.mjs";
function base(ids = ["choir"]) {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle(ids.map((enemy, i) => ({ uid: 900 + i, enemy, restless: 0 })));
  const b = g.s.battle;
  b.phase = "activate";
  b.hand = [];
  b.grid[0] = [g.instance(g.newCard("blast"))];
  b.enemies.forEach((e) => (e.hp = 1));
  g.capturePresentation = true;
  return g;
}
function act(g, type, predicate = () => true) {
  const a = g.legal().find((a) => a.type === type && predicate(a));
  assert.ok(a, type);
  g.act(a);
}
const notes = (g) =>
  g.presentation.filter(
    (f) => f.kind === "incoming" && f.name === "Final Note",
  );
test("Chorus replaces turn four and Final Note is explicitly warned", () => {
  const g = base(),
    e = g.s.battle.enemies[0];
  e.hp = e.maxHp;
  e.cycle = 3;
  assert.equal(g.tell(e).name, "Chorus");
  assert.equal(g.tell(e).element, "Water");
  assert.equal(g.tell(e).damage, 10);
  assert.match(enemies.choir.signature, /On death: Final Note deals 20 Light/);
});
test("Killing blow resolves fixed Light 20 before rewards, then disintegrates", () => {
  const g = base(),
    b = g.s.battle,
    e = b.enemies[0];
  e.cycle = 40;
  e.restless = 9;
  e.buff = 9;
  g.s.hp = 21;
  const gold = g.s.gold;
  act(g, "activate");
  assert.equal(g.s.mode, "reward");
  assert.equal(g.s.hp, 1);
  assert.equal(g.s.gold, gold + 120);
  assert.equal(notes(g).length, 1);
  assert.equal(notes(g)[0].amount, 20);
  assert.equal(notes(g)[0].element, "Light");
  assert.equal(notes(g)[0].state.mode, "battle");
  assert.equal(notes(g)[0].state.battle.enemies[0].hp, 0);
  const playerHit = g.presentation.findIndex(
    (f) => f.kind === "hit" && f.target === "player",
  );
  const death = g.presentation.findIndex((f) => f.kind === "death");
  assert.ok(death > playerHit);
  assert.equal(
    g.presentation.find((f) => f.kind === "hit" && f.target === "enemy").dead,
    false,
  );
  assert.equal(b.enemies[0].deathResolved, true);
  g.checkBattle();
  assert.equal(notes(g).length, 1);
});
test("Mutual death loses with no rewards and zero-HP hit snapshot", () => {
  const g = base(),
    gold = g.s.gold;
  g.s.hp = 20;
  act(g, "activate");
  assert.equal(g.s.outcome, "loss");
  assert.equal(g.s.cause, "Final Note");
  assert.equal(g.s.hp, 0);
  assert.equal(g.s.gold, gold);
  assert.equal(g.s.reward, undefined);
  assert.equal(g.s.stats.encounters.at(-1).outcome, "loss");
  assert.equal(g.presentation.find((f) => f.target === "player").state.hp, 0);
});
test("Cull skips intact Wards and Shields, permits Ally/equipment defense, and resumes once", () => {
  let g = base();
  const b = g.s.battle;
  const ward = g.instance(g.newCard("ward"));
  ward.ward = 2;
  const shield = g.instance(g.newCard("shield"));
  const ally = g.instance(g.newCard("golem"));
  ally.hp = 2;
  b.grid[3] = [ward];
  b.grid[4] = [shield];
  b.grid[5] = [ally];
  b.shields = [
    { uid: 910, owner: shield.uid, slot: 4, block: 2, element: "Arcane" },
  ];
  b.bracelets = [{ uid: 911, block: 1, element: "Arcane", name: "Bracelet" }];
  g.s.equipment.torso = g.addItem("stoneArmor").uid;
  const hp = g.s.hp,
    gold = g.s.gold;
  act(g, "activate");
  assert.equal(g.s.mode, "battle");
  assert.equal(g.s.gold, gold);
  assert.equal(b.reaction.stage, "ally");
  assert.equal(ward.ward, 2);
  assert.equal(b.shields[0].block, 2);
  assert.ok(g.legal().some((a) => a.type === "intercept"));
  assert.ok(!g.legal().some((a) => a.type === "block"));
  g = new Game(0, g.s);
  act(g, "intercept");
  act(g, "bracelet");
  assert.equal(g.s.mode, "reward");
  assert.equal(g.s.hp, hp - 16); // 20 - Ally2 - Bracelet1 - Armor1; Ward/Shield bypassed
  assert.equal(g.s.battle.bracelets[0].block, 0);
  assert.equal(g.s.log.filter((x) => x.includes("dies: Final Note")).length, 1);
});
test("Enemy status kill triggers Final Note before its queued attack or next turn", () => {
  const g = base(),
    b = g.s.battle;
  b.enemies[0].status.burn = 1;
  const hp = g.s.hp;
  act(g, "endTurn");
  assert.equal(g.s.mode, "reward");
  assert.equal(g.s.hp, hp - 20);
  assert.equal(notes(g).length, 1);
  assert.equal(b.turn, 1);
  assert.equal(g.presentation.filter((f) => f.kind === "incoming").length, 1);
});
test("Reflection kill triggers Final Note; spent mirror cannot reflect it again", () => {
  const g = base(),
    b = g.s.battle;
  g.s.equipment.torso = g.addItem("mirrorArmor").uid;
  b.enemies[0].cycle = 1;
  const hp = g.s.hp;
  act(g, "endTurn");
  assert.equal(g.s.mode, "reward");
  assert.equal(g.s.hp, hp - 20);
  assert.equal(notes(g).length, 1);
});
test("Equipment killing blow triggers Final Note", () => {
  const g = base();
  g.s.equipment.finger1 = g.s.inventory.find((x) => x.id === "ring").uid;
  g.s.battle.enemies[0].hp = 5;
  act(g, "activate");
  assert.equal(g.s.mode, "reward");
  assert.equal(notes(g).length, 1);
});
test("Area kill of two Choirs resolves each death attack once before victory", () => {
  const g = base(["choir", "choir"]),
    b = g.s.battle;
  b.grid[0] = [g.instance(g.newCard("storm"))];
  const hp = g.s.hp;
  act(g, "activate");
  assert.equal(g.s.mode, "reward");
  assert.equal(g.s.hp, hp - 40);
  assert.equal(notes(g).length, 2);
});
test("Choir death with another enemy alive resolves Final Note and allows battle to continue", () => {
  const g = base(["choir", "beetle"]);
  g.s.battle.enemies[1].hp = 21;
  act(g, "activate", (a) => a.target === g.s.battle.enemies[0].uid);
  assert.equal(g.s.mode, "battle");
  assert.equal(g.s.battle.reaction, null);
  assert.ok(g.legal().some((a) => a.type === "endTurn"));
  assert.deepEqual(
    g.observe().battle.enemies.map((e) => e.id),
    ["beetle"],
  );
});
test("Recent saves load and use current Choir warnings and rotation", () => {
  for (const rules of ["1.3.10", "1.3.11", "1.3.12", "1.3.13"]) {
    const g = base();
    g.s.version = { ...g.s.version, rules };
    g.s.battle.enemies[0].signature = "Old description";
    delete g.s.battle.enemies[0].onDeath;
    const h = new Game(0, g.s),
      e = h.observe().battle.enemies[0];
    assert.match(e.signature, /Final Note/);
    assert.equal(e.rotation[3].name, "Chorus");
    act(h, "activate");
    assert.equal(h.s.hp, 45);
  }
});
