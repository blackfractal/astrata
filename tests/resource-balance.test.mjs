import test from "node:test";
import assert from "node:assert/strict";
import { Game, insightGain, stackValue, cardPower } from "../src/engine.mjs";
import { cards, items } from "../src/content.mjs";
import { boardConnections } from "../src/board-interactions.mjs";
import { attackPreview } from "../src/combat-preview.mjs";
import { upgradeHelp } from "../src/battle-feedback.mjs";
import { statHelp } from "../src/card-upgrade-ui.mjs";
function base() {
  const g = new Game(29);
  g.s.equipment = {};
  g.s.inventory = [];
  g.s.hp = 50;
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  g.s.battle.enemies[0].hp = g.s.battle.enemies[0].maxHp = 999;
  g.s.battle.enemies[0].element = "Arcane";
  g.s.battle.phase = "activate";
  g.s.battle.channel = 20;
  return g;
}
function put(g, id, i = 8, upgrade = false) {
  const owned = g.newCard(id);
  owned.upgrade = upgrade;
  const c = g.instance(owned);
  g.s.battle.grid[i].push(c);
  return c;
}
function act(g, slot = 8) {
  const a = g.legal().find((a) => a.type === "activate" && a.slot === slot);
  assert.ok(a);
  g.act(a);
  return a;
}
function equip(g, id, slot) {
  const x = { uid: g.uid(), id, gem: null };
  g.s.inventory.push(x);
  g.s.equipment[slot] = x.uid;
  return x;
}
test("Tide snapshots 0-4 connected orthogonal neighbors; covers, diagonals and Sever do not add Insight", () => {
  const g = base(),
    b = g.s.battle,
    c = put(g, "tide");
  assert.equal(insightGain(b, c, 8), 0);
  for (const i of [1, 7, 9, 15]) put(g, "blast", i);
  put(g, "shield", 1);
  put(g, "shield", 0);
  assert.equal(insightGain(b, c, 8), 4);
  assert.equal(
    boardConnections(b).filter((l) => l.to === 8 && l.type === "benefit")
      .length,
    4,
  );
  assert.match(statHelp(b, c, 8), /4 insight next turn/);
  const a = act(g);
  assert.equal(a.effects.insight, 4);
  assert.equal(b.next.insight, 4);
  b.grid[9] = [];
  assert.equal(b.next.insight, 4);
  c.sever = true;
  assert.equal(insightGain(b, c, 8), 0);
  c.sever = false;
  b.grid[1].at(-1).sever = true;
  assert.equal(insightGain(b, c, 8), 2);
});

test("Specific status upgrades preserve Corrode 1 and add a direct Water hit; previews and AI effects agree", () => {
  for (const [id, upgrade, status, amount, damage] of [
    ["rot", false, "corrode", 1, 0],
    ["rot", true, "corrode", 1, 3],
    ["spore", false, "poison", 2, 0],
    ["spore", true, "poison", 3, 0],
    ["heat", false, "burn", 2, 0],
    ["heat", true, "burn", 3, 0],
  ]) {
    const g = base(),
      c = put(g, id, 8, upgrade),
      a = act(g);
    assert.equal(g.s.battle.enemies[0].status[status], amount);
    assert.equal(999 - g.s.battle.enemies[0].hp, damage);
    assert.equal(a.effects[status], amount);
    assert.equal(a.effects.damage, damage);
  }
  const g = base(),
    c = put(g, "rot", 8, true),
    e = g.s.battle.enemies[0];
  e.element = "Fire";
  assert.equal(attackPreview(g.s.battle, c, 8, e).damage, 5);
  g.capturePresentation = true;
  act(g);
  assert.equal(e.hp, 994);
  assert.equal(e.status.corrode, 1);
  assert.match(statHelp(g.s.battle, c, 8), /0 base.*3 upgrade/);
  const immune = base();
  put(immune, "rot", 8, true);
  immune.s.battle.enemies[0].element = "Chaos";
  act(immune);
  assert.equal(immune.s.battle.enemies[0].hp, 996);
  assert.equal(immune.s.battle.enemies[0].status.corrode, 0);
  assert.match(upgradeHelp(cards.rot), /3.*Water/);
  assert.match(upgradeHelp(cards.spore), /Poison 2.*3/);
  assert.match(upgradeHelp(cards.heat), /Burn 2.*3/);
  const h = base();
  const host = put(h, "water");
  const heat = put(h, "heat", 8, true);
  heat.attachedTo = host.uid;
  h.s.battle.grid[8] = [heat, host];
  act(h);
  assert.equal(h.s.battle.enemies[0].status.burn, 3); // Upgraded melded Heat, no separate Fusion bonus.
});
test("Healing gear has two persistent triggers each, wastes none at full HP and resets only next battle", () => {
  const g = base(),
    armor = equip(g, "holyArmor", "torso"),
    neck = equip(g, "dewNeck", "neck");
  const gem = { uid: g.uid(), id: "sapphire" };
  g.s.inventory.push(gem);
  neck.gem = gem.uid;
  g.s.hp = g.s.maxHp;
  g.beginTurn();
  assert.deepEqual(g.s.battle.healUses, {});
  g.s.hp = 40;
  g.beginTurn();
  assert.equal(g.s.hp, 44);
  assert.equal(g.s.battle.healUses[armor.uid], 1);
  assert.equal(g.s.battle.healUses[neck.uid], 1);
  const h = new Game(0, g.s);
  h.beginTurn();
  assert.equal(h.s.hp, 48);
  for (let n = 0; n < 8; n++) h.beginTurn();
  assert.equal(h.s.hp, 48);
  assert.equal(h.s.battle.healUses[armor.uid], 2);
  h.beginBattle([{ uid: 901, enemy: "beetle", restless: 0 }]);
  assert.equal(h.s.hp, 52);
  assert.equal(h.s.battle.healUses[armor.uid], 1);
  const legacy = structuredClone(g.s);
  legacy.version.rules = "1.3.47";
  legacy.battle.turn = 7;
  delete legacy.battle.healUses;
  legacy.checkpoint = structuredClone({ ...legacy, checkpoint: undefined });
  const migrated = new Game(0, legacy);
  assert.equal(migrated.s.battle.healUses[armor.uid], 2);
  assert.equal(migrated.s.checkpoint.battle.healUses[neck.uid], 2);
  const hp = migrated.s.hp;
  migrated.beginTurn();
  assert.equal(migrated.s.hp, hp);
});
test("Nearly-full healing spends only the item that actually heals; healing resolves before existing status damage", () => {
  const g = base(),
    neck = equip(g, "dewNeck", "neck"),
    armor = equip(g, "holyArmor", "torso");
  g.s.hp = g.s.maxHp - 1;
  g.beginTurn();
  assert.equal(g.s.hp, g.s.maxHp);
  assert.equal(g.s.battle.healUses[neck.uid], 1);
  assert.equal(g.s.battle.healUses[armor.uid], undefined);
  g.s.hp = 1;
  g.s.status.burn = 2;
  g.beginTurn();
  assert.equal(g.s.hp, 2);
});
test("Husk converts all Corrode once on turn five before ticking; later corrosion remains independent", () => {
  const g = base();
  equip(g, "curseArmor", "torso");
  g.s.hp = g.s.maxHp = 200;
  g.beginBattle([{ uid: 901, enemy: "beetle", restless: 0 }]);
  assert.equal(g.s.hp, 199);
  assert.equal(g.s.status.corrode, 2);
  for (let n = 0; n < 3; n++) g.beginTurn();
  assert.equal(g.s.battle.turn, 4);
  assert.equal(g.s.status.corrode, 5);
  assert.equal(g.s.hp, 190);
  g.s.status.burn = 2;
  g.beginTurn();
  assert.equal(g.s.hp, 183);
  assert.equal(g.s.status.corrode, 0);
  assert.equal(g.s.status.burn, 6);
  assert.ok(g.s.battle.huskConverted);
  const h = new Game(0, g.s);
  h.s.status.corrode = 1;
  h.beginTurn();
  assert.equal(h.s.status.corrode, 2);
  assert.equal(h.s.status.burn, 5);
  assert.equal(h.s.hp, 176);
});
test("Approved equipment prices and actual Solitude damage", () => {
  assert.equal(items.focusRing.worth, 200);
  assert.equal(items.channelRing.worth, 240);
  assert.equal(items.stoneArmor.worth, 30);
  const g = base(),
    c = put(g, "solitude");
  assert.equal(cardPower(g.s.battle, c, 8), 10);
  act(g);
  assert.equal(g.s.battle.enemies[0].hp, 989); // Light versus Arcane is neutral: 10 damage.
});
