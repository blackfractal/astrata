import test from "node:test";
import assert from "node:assert/strict";
import { Game, gridTargets, stackValue } from "../src/engine.mjs";
import { enemies } from "../src/content.mjs";
function setup(id = "choir") {
  const g = new Game(19);
  g.s.equipment = {};
  g.s.hp = g.s.maxHp = 999;
  g.beginBattle([{ uid: 900, enemy: id, restless: 0 }]);
  const e = g.s.battle.enemies[0];
  e.hp = e.maxHp = 1000;
  e.element = "Earth";
  g.pick = (pool) =>
    Array.isArray(pool) && pool.includes("Earth") ? "Earth" : pool[0];
  g.capturePresentation = true;
  return g;
}
function end(g) {
  g.s.battle.phase = "activate";
  g.endTurn();
  for (let n = 0; g.s.mode === "battle" && g.s.battle.reaction && n < 20; n++) {
    const a = g.legal().find((a) => a.type === "skipEquipment");
    assert.ok(a);
    g.act(a);
  }
}
function put(g, id, i) {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[i].push(c);
  return c;
}
for (const id of ["hart", "colossus", "choir"])
  test(`${id} inserts one visible Purify turn at the cycle boundary, preserves scaling and resumes`, () => {
    const g = setup(id),
      e = g.s.battle.enemies[0];
    e.cycle = 2;
    e.status = { burn: 5, poison: 3, corrode: 1 };
    end(g);
    assert.equal(e.cycle, 3);
    assert.ok(!e.purifyPending);
    end(g);
    assert.equal(e.cycle, 4);
    assert.equal(g.tell(e).name, "Purify");
    assert.deepEqual(g.observe().battle.telegraphs, []);
    const before = structuredClone(g.s),
      h = new Game(0, before);
    h.observe();
    h.legal();
    assert.deepEqual(g.s, before);
    assert.equal(h.tell(h.s.battle.enemies[0]).name, "Purify");
    e.status.poison += 2; // Includes statuses added during the telegraphed player turn.
    const hp = e.hp,
      playerHp = g.s.hp,
      tick = e.status.burn + e.status.poison + e.status.corrode;
    end(g);
    assert.equal(e.hp, hp - tick); // Existing status tick happens before cleansing.
    assert.equal(g.s.hp, playerHp);
    assert.equal(e.cycle, 4);
    assert.deepEqual(e.status, { burn: 0, poison: 0, corrode: 0 });
    assert.equal(e.purifyPending, false);
    assert.equal(g.tell(e).name, enemies[id].rotation[0].name);
    if (g.tell(e).damage)
      assert.equal(g.tell(e).damage, enemies[id].rotation[0].damage + 1);
    assert.ok(
      g.presentation.some(
        (f) => f.kind === "status" && f.name.startsWith("Purify"),
      ),
    );
    end(g);
    assert.equal(e.cycle, 5);
    assert.ok(!e.purifyPending);
  });
test("Clean cycle boundaries skip Purify; late statuses wait for the next complete cycle; Motes and Eidolons never Purify", () => {
  const g = setup(),
    e = g.s.battle.enemies[0];
  e.cycle = 3;
  end(g);
  assert.ok(!e.purifyPending);
  e.status.poison = 2;
  assert.equal(g.tell(e).name, "Shatter Hymn");
  for (let n = 0; n < 4; n++) end(g);
  assert.equal(g.tell(e).name, "Purify");
  for (const id of ["bat", "mason", "mini"]) {
    const h = setup(id),
      foe = h.s.battle.enemies[0];
    foe.cycle = enemies[id].rotation.length - 1;
    foe.status.poison = 2;
    end(h);
    assert.ok(!foe.purifyPending);
    assert.notEqual(h.tell(foe).name, "Purify");
  }
});
test("Queued Purify stays committed if Burn expires, clears only damage statuses and retains old saves", () => {
  const g = setup(),
    e = g.s.battle.enemies[0];
  e.cycle = 3;
  e.status.burn = 2;
  end(g);
  assert.equal(g.tell(e).name, "Purify");
  e.guard = 7;
  e.status.custom = 4;
  end(g);
  assert.equal(e.cycle, 4);
  assert.equal(e.guard, 7);
  assert.equal(e.status.custom, 4);
  const old = structuredClone(g.s);
  old.version.rules = "1.3.30";
  delete old.battle.enemies[0].purifyPending;
  assert.equal(
    new Game(0, old).tell(old.battle.enemies[0]).name,
    "Shatter Hymn",
  );
});
test("Lethal status before Purify still triggers Choir Final Note instead of cleansing or healing", () => {
  const g = setup(),
    e = g.s.battle.enemies[0];
  e.purifyPending = true;
  e.cycle = 4;
  e.hp = 1;
  e.status.poison = 2;
  const hp = g.s.hp;
  end(g);
  assert.equal(g.s.hp, hp - 20);
  assert.ok(!g.presentation.some((f) => f.name?.startsWith("Purify")));
});
test("Hymn targets charged damage and banked Ward defense over expensive utility, then live-retargets", () => {
  const g = setup(),
    b = g.s.battle;
  const ward = put(g, "ward", 0);
  ward.ward = 35;
  ward.used = 2;
  const kiln = put(g, "kiln", 4);
  put(g, "seed", 8);
  put(g, "conduit", 12);
  put(g, "magnify", 12);
  assert.deepEqual(gridTargets(b, g.tell(b.enemies[0])), [0, 4]);
  assert.equal(stackValue(b, 4).power, 20); // Charge does not hide eventual power.
  kiln.used = 6;
  kiln.charge = 0; // Cannot reach the threshold with one use left.
  assert.deepEqual(gridTargets(b, g.tell(b.enemies[0])), [0, 8]);
  ward.ward = 0;
  assert.deepEqual(gridTargets(b, g.tell(b.enemies[0])), [8, 12]);
  const forecast = g.gridTelegraphs()[0].targets;
  const doomed = forecast.flatMap((i) => b.grid[i].map((c) => c.uid));
  g.gridAttack(g.tell(b.enemies[0]));
  assert.deepEqual(
    b.destroyed.map((c) => c.uid),
    doomed,
  );
});
test("Wild Conduit nets one Channel, and one Fire neighbor leaves Kiln two one-Channel activations from firing", () => {
  const g = setup("beetle"),
    b = g.s.battle;
  put(g, "ignis", 0);
  b.hand = [g.newCard("kiln")];
  b.focus = 2;
  g.act(g.legal().find((a) => a.type === "place" && a.slot === 1));
  const kiln = b.grid[1][0];
  assert.equal(kiln.charge, 1);
  assert.equal(g.allowance(kiln, 1), 7);
  put(g, "conduit", 5);
  b.phase = "activate";
  b.channel = 2;
  g.act(g.legal().find((a) => a.type === "activate" && a.slot === 5));
  assert.equal(b.channel, 3);
  const charge = g.legal().find((a) => a.type === "activate" && a.slot === 1);
  assert.equal(charge.target, null);
  g.act(charge);
  assert.equal(kiln.charge, 2);
  assert.equal(b.channel, 2);
  b.turn++;
  const hp = b.enemies[0].hp;
  b.enemies[0].element = "Arcane";
  g.act(g.legal().find((a) => a.type === "activate" && a.slot === 1));
  assert.equal(b.enemies[0].hp, hp - 20);
  assert.equal(b.enemies[0].status.burn, 2);
  assert.equal(kiln.used, 2);
});
