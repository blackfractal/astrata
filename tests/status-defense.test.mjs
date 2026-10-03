import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
function base(armor = "curseArmor") {
  const g = new Game(8);
  g.s.equipment = {};
  const item = g.addItem(armor);
  g.s.equipment.torso = item.uid;
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  g.s.battle.phase = "activate";
  return g;
}
function hit(g, damage, statusHit = false, element = "Arcane") {
  g.s.battle.jobs = [
    { kind: "hit", damage, statusHit, element, source: 900, name: "Test hit" },
  ];
  g.pump();
  if (!g.s.battle.bracelets.some((x) => x.block > 0)) {
    const armor = g.legal().find((a) => a.type === "armor");
    if (armor) g.act(armor);
  }
}
test("Husk Corrode hurts on the opening turn, then grows through leftover bracelet block", () => {
  const g = base();
  assert.equal(g.s.hp, 69);
  assert.equal(g.s.status.corrode, 2);
  const b = g.s.battle;
  b.bracelets = [{ uid: 901, block: 2, element: "Arcane" }];
  g.beginTurn();
  assert.equal(g.s.hp, 67);
  assert.equal(g.s.status.corrode, 3);
  assert.equal(b.bracelets[0].block, 2);
  assert.equal(b.reaction, null);
});
for (const status of ["burn", "poison", "corrode"])
  test(`${status} bypasses all attack defenses without consuming them`, () => {
    const g = base(),
      b = g.s.battle;
    Object.assign(g.s.status, { burn: 0, poison: 0, corrode: 0, [status]: 3 });
    const ward = g.instance(g.newCard("ward"));
    const ally = g.instance(g.newCard("golem"));
    b.grid[0] = [ward];
    b.grid[1] = [ally];
    b.bracelets = [{ uid: 901, block: 10, element: "Arcane" }];
    const hp = g.s.hp,
      wardValue = ward.ward,
      allyHp = ally.hp;
    g.capturePresentation = true;
    g.beginTurn();
    assert.equal(g.s.hp, hp - 3);
    assert.equal(b.bracelets[0].block, 10);
    assert.equal(ward.ward, wardValue);
    assert.equal(ally.hp, allyHp);
    assert.equal(b.reaction, null);
    assert.equal(
      g.s.status[status],
      status === "burn" ? 2 : status === "corrode" ? 4 : 3,
    );
    const frame = g.presentation.find(
      (f) => f.kind === "hit" && f.target === "player",
    );
    assert.equal(frame.amount, 3);
    assert.equal(frame.armor, undefined);
  });
test("Husk has only two total block across enemy attacks before its next refill", () => {
  const g = base(),
    hp = g.s.hp;
  hit(g, 6);
  hit(g, 6);
  hit(g, 6);
  hit(g, 1);
  assert.equal(g.s.hp, hp - 17);
  assert.equal(g.s.battle.armorBlock, 0);
});
test("Bracelet block can precede selected armor for enemy attacks", () => {
  const g = base(),
    hp = g.s.hp,
    b = g.s.battle;
  b.bracelets = [{ uid: 901, block: 2, element: "Arcane" }];
  hit(g, 6);
  assert.equal(g.s.hp, hp);
  g.act(g.legal().find((a) => a.type === "bracelet"));
  g.act(g.legal().find((a) => a.type === "armor"));
  assert.equal(g.s.hp, hp - 2);
  assert.equal(b.bracelets[0].block, 0);
});
test("Elemental armor and reflection apply only to attacks, not ongoing statuses", () => {
  const g = base("fireArmor"),
    hp = g.s.hp;
  hit(g, 6, true, "Fire");
  assert.equal(g.s.hp, hp - 6);
  hit(g, 6, false, "Fire");
  assert.equal(g.s.hp, hp - 10);
  const h = base("mirrorArmor"),
    b = h.s.battle,
    enemyHp = b.enemies[0].hp;
  hit(h, 2, true);
  assert.equal(b.mirror, false);
  assert.equal(b.enemies[0].hp, enemyHp);
  const beforeAttack = h.s.hp;
  hit(h, 2);
  assert.equal(h.s.hp, beforeAttack);
  assert.equal(b.enemies[0].hp, enemyHp - 2);
});
