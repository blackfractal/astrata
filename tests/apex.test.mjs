import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { enemies, VERSION } from "../src/content.mjs";
import {
  enterApexFloor,
  apexComplete,
  apexStats,
  apexMovement,
} from "../src/apex.mjs";
import { discover, emptyCollection } from "../src/archive-profile.mjs";
import { livingIdeons, spawnIdeon } from "../src/ideons.mjs";
const act = (g, type, p = {}) => {
  const a = g
    .legal()
    .find(
      (a) => a.type === type && Object.entries(p).every(([k, v]) => a[k] === v),
    );
  assert.ok(a, type);
  g.act(a);
};
function floor(n = 1, seed = 441) {
  const g = new Game(seed);
  g.s.stratum = 4;
  enterApexFloor(g, n);
  return g;
}
function round4(g) {
  while (g.s.field.round < 4) {
    g.s.field.entities = [];
    g.beginRound();
  }
  return g.s.field.entities.filter((e) => e.type === "Archon");
}
function win(g) {
  for (const e of g.s.battle.enemies) e.hp = 0;
  g.checkBattle();
  for (let n = 0; n < 30 && g.s.mode === "battle"; n++) {
    g.pump();
    if (g.s.battle.reaction) act(g, "skipEquipment");
  }
  assert.equal(g.s.mode, "reward");
}
function rewards(g) {
  for (let n = 0; n < 30 && g.s.mode === "reward"; n++) {
    const a = g
      .legal()
      .find((a) =>
        ["rewardCard", "leaveRewardItem", "continueReward"].includes(a.type),
      );
    assert.ok(a);
    g.act(a);
  }
}

test("S3 victory reward leads through full transition Tavern and Apex introduction, without another companion", () => {
  const g = new Game(81);
  g.s.stratum = 3;
  g.s.equipment = {};
  g.beginBattle([{ uid: g.uid(), enemy: "refractionCannon", restless: 0 }]);
  win(g);
  for (const t of [
    "rewardCard",
    "rewardGem",
    "rewardSetting",
    "continueReward",
  ])
    act(g, t);
  assert.equal(g.s.mode, "tavern");
  assert.equal(g.s.shop.afterStratum, 3);
  assert.equal(g.s.stratum, 4);
  const count = g.s.deck.length;
  act(g, "leave");
  assert.equal(g.s.mode, "apexIntro");
  act(g, "enterApex");
  assert.equal(g.s.deck.length, count);
  assert.equal(g.s.field.size, 11);
  assert.equal(g.s.field.x, 5);
  assert.equal(g.s.field.round, 1);
});
test("all four floors enter center, shrink and reset local rounds; summit has no movement or spawning", () => {
  const g = floor();
  for (let n = 1; n <= 4; n++) {
    enterApexFloor(g, n);
    assert.equal(g.s.field.size, [11, 9, 7, 5][n - 1]);
    assert.equal(g.s.field.x, (g.s.field.size - 1) / 2);
    assert.equal(g.s.field.y, g.s.field.x);
  }
  assert.equal(g.s.field.round, 0);
  assert.deepEqual(g.s.field.entities, []);
  assert.ok(g.legal().some((a) => a.type === "fightApex"));
  assert.ok(!g.legal().some((a) => ["move", "wait"].includes(a.type)));
  act(g, "fightApex");
  assert.equal(g.s.battle.enemies[0].id, "apex");
  assert.equal(g.s.battle.enemies[0].hp, 640);
});
test("pair four replaces both slots with distinct corresponding Archons at fixed marked spaces", () => {
  for (let n = 1; n <= 3; n++) {
    const g = floor(n);
    const archons = round4(g),
      c = (g.s.field.size - 1) / 2;
    assert.equal(archons.length, 2);
    assert.notEqual(archons[0].enemy, archons[1].enemy);
    assert.deepEqual(
      archons.map((e) => [e.x, e.y]),
      [
        [c - 2, c - 2],
        [c + 2, c - 2],
      ],
    );
    assert.ok(archons.every((e) => (enemies[e.enemy].stratum || 1) === n));
    assert.equal(g.s.field.spawned, 8);
  }
});
test("floor three starts Tavern plus ordinary spawn and offers full services with 50/50 rest", () => {
  const g = floor(3);
  assert.equal(g.s.field.entities[0].type, "Tavern");
  assert.notEqual(g.s.field.entities[1].type, "Tavern");
  g.openTavern();
  g.s.hp = 10;
  g.s.gold = 50;
  assert.ok(g.s.shop.healer);
  const heal = g.legal().find((a) => a.type === "heal");
  assert.equal(heal.costs.gold, 50);
  assert.equal(heal.effects.heal, 50);
  g.act(heal);
  assert.equal(g.s.hp, 60);
});
test("S4 Motes never flee; Wanderers have one-space base movement; S3 Archons retain stats", () => {
  for (const d of Object.values(enemies).filter((d) => d.tier === "Mote")) {
    const m = apexMovement(d, { apexMap: true });
    assert.ok(["Hunter", "Stalker", "Wanderer"].includes(m.movement));
    if (m.movement === "Wanderer") assert.equal(m.speed, 1);
  }
  for (const id of ["mindHive", "cnidarian", "refractionCannon"])
    assert.deepEqual(apexStats(enemies[id], { apexMap: true, apexFloor: 3 }), {
      hp: enemies[id].hp,
      damageBonus: 0,
    });
  assert.ok(
    apexStats(enemies.hart, { apexMap: true, apexFloor: 1 }).hp >
      enemies.hart.hp,
  );
});
test("Archons are stationary through round seven and hunt together only after round eight movement", () => {
  const g = floor(),
    aa = round4(g);
  g.s.field.entities = aa;
  const positions = aa.map((e) => [e.x, e.y]);
  g.s.field.round = 6;
  g.endMovement();
  assert.equal(g.s.mode, "field");
  assert.deepEqual(
    aa.map((e) => [e.x, e.y]),
    positions,
  );
  g.s.field.entities = aa;
  g.s.field.round = 8;
  g.s.hp = 500;
  g.s.maxHp = 500;
  assert.equal(g.s.mode, "field");
  g.endMovement();
  assert.equal(g.s.mode, "battle");
  assert.deepEqual(
    g.s.battle.enemies.map((e) => e.id),
    aa.map((e) => e.enemy),
  );
  assert.equal(g.s.field.spawned, 10, "no ninth pair");
});
test("map enemies can join deadline hunt; entire encounter must die before ascent", () => {
  const g = floor();
  const aa = round4(g);
  const imp = {
    uid: g.uid(),
    enemy: "imp",
    type: "Mote",
    x: g.s.field.x,
    y: g.s.field.y + 1,
    born: 4,
    restless: 0,
    apexMap: true,
    apexFloor: 1,
  };
  g.s.apex.required.push({ uid: imp.uid, enemy: "imp", floor: 1, count: 1 });
  g.s.field.entities = [...aa, imp];
  g.s.field.round = 8;
  g.s.hp = g.s.maxHp = 1000;
  g.endMovement();
  while (g.s.battle.reaction) act(g, "skipEquipment");
  assert.equal(g.s.battle.enemies.length, 3);
  for (const e of g.s.battle.enemies) if (e.tier === "Archon") e.hp = 0;
  g.checkBattle();
  g.pump();
  while (g.s.battle.reaction) act(g, "skipEquipment");
  assert.equal(g.s.mode, "battle");
  assert.equal(g.s.apex.floor, 1);
  win(g);
  assert.ok(g.s.apex.defeated.includes(imp.uid));
  rewards(g);
  assert.equal(g.s.apex.floor, 2);
});
test("first victory reveals central stairs; voluntary entry abandons survivor and disqualifies full clear", () => {
  const g = floor(),
    aa = round4(g);
  g.s.field.entities = aa;
  g.s.field.x = aa[0].x;
  g.s.field.y = aa[0].y;
  g.s.field.moves = 2;
  g.s.hp = 500;
  g.beginBattle([aa[0]]);
  win(g);
  assert.ok(
    g.s.field.entities.some(
      (e) => e.type === "Ascend" && e.x === 5 && e.y === 5,
    ),
  );
  rewards(g);
  assert.equal(g.s.apex.floor, 1);
  g.s.field.x = 4;
  g.s.field.y = 4;
  g.s.field.moves = 1;
  act(g, "move", { x: 5, y: 5 });
  assert.equal(g.s.apex.floor, 2);
  assert.equal(apexComplete(g.s), false);
});
test("second voluntary victory forces ascent before round eight, after both reward offers if paired", () => {
  const g = floor(),
    aa = round4(g);
  g.s.field.entities = aa;
  g.s.hp = g.s.maxHp = 500;
  g.beginBattle(aa);
  win(g);
  assert.equal(g.s.reward.extraOffers.length, 1);
  assert.equal(g.s.apex.floor, 1);
  rewards(g);
  assert.equal(g.s.apex.floor, 2);
  assert.equal(g.s.field.round, 1);
});
test("event-only enemies do not enter full-clear ledger; all six map Archons and map Motes are required", () => {
  const g = floor();
  g.s.apex.required = [];
  g.s.apex.defeated = [];
  for (let n = 1; n <= 3; n++) {
    enterApexFloor(g, n);
    round4(g);
  }
  const required = g.s.apex.required.map((e) => e.uid);
  g.s.apex.defeated = [...required];
  assert.ok(apexComplete(g.s));
  const eventUid = g.uid();
  g.beginBattle([{ uid: eventUid, enemy: "bat", restless: 0 }]);
  win(g);
  assert.ok(!g.s.apex.defeated.includes(eventUid));
  assert.ok(apexComplete(g.s));
  g.s.apex.defeated.pop();
  assert.ok(!apexComplete(g.s));
});
test("final victory grants completed S4 and durable I Stand Alone only with a complete ledger", () => {
  const g = floor();
  for (let n = 1; n <= 3; n++) {
    enterApexFloor(g, n);
    round4(g);
  }
  g.s.apex.defeated = g.s.apex.required.map((e) => e.uid);
  enterApexFloor(g, 4);
  act(g, "fightApex");
  win(g);
  rewards(g);
  assert.equal(g.s.outcome, "win");
  assert.equal(g.s.stats.iStandAlone, true);
  assert.ok(g.s.stats.strataCompleted.includes(4));
  const c = discover(emptyCollection(), g.s);
  assert.ok(c.achievements["defeat-apex"]);
  assert.ok(c.achievements["i-stand-alone"]);
});
test("Apex save/load retains layout, deadline, ledger, scaled HP and reward offers without RNG changes", () => {
  const g = floor(2),
    aa = round4(g);
  g.s.field.entities = aa;
  g.s.hp = g.s.maxHp = 500;
  g.beginBattle(aa);
  const hp = g.s.battle.enemies.map((e) => e.hp);
  const loaded = new Game(0, g.save());
  assert.deepEqual(
    loaded.s.battle.enemies.map((e) => e.hp),
    hp,
  );
  assert.deepEqual(loaded.s.apex, g.s.apex);
  win(g);
  const saved = g.save(),
    again = new Game(0, saved);
  assert.deepEqual(again.s.reward, saved.reward);
  assert.equal(again.s.rng, saved.rng);
});
test("each existing Archon pair can initialize, command and survive a save/load without double-commanding Ideons", () => {
  for (const ids of [
    ["hart", "colossus"],
    ["hart", "choir"],
    ["colossus", "choir"],
    ["blackBile", "bombadier"],
    ["blackBile", "trickster"],
    ["bombadier", "trickster"],
    ["mindHive", "cnidarian"],
    ["mindHive", "refractionCannon"],
    ["cnidarian", "refractionCannon"],
  ]) {
    const n = enemies[ids[0]].stratum || 1,
      g = floor(n);
    g.s.hp = g.s.maxHp = 10000;
    g.s.equipment = {};
    g.beginBattle(
      ids.map((enemy) => ({
        uid: g.uid(),
        enemy,
        restless: 0,
        apexMap: true,
        apexFloor: n,
      })),
      { enemyFirst: true },
    );
    while (g.s.battle.reaction) act(g, "skipEquipment");
    for (let turn = 0; turn < 8; turn++) {
      g.endTurn();
      while (g.s.battle.reaction) act(g, "skipEquipment");
    }
    assert.equal(g.s.mode, "battle");
    assert.ok(g.s.battle.enemies.every((e) => Number.isFinite(e.hp)));
    const saved = g.save(),
      loaded = new Game(0, saved);
    assert.equal(loaded.s.rng, saved.rng);
    if (ids.includes("mindHive")) assert.equal(g.s.battle.enemyFirst, false);
  }
});
test("Predator has readable destruction warnings, bounded owned Ideons, Purify commands and explicit damage scaling", () => {
  const g = floor(4);
  g.s.hp = g.s.maxHp = 10000;
  g.s.equipment = {};
  act(g, "fightApex");
  const b = g.s.battle,
    e = b.enemies[0];
  assert.equal(g.tell(e).damage, 24);
  e.cycle = 6;
  assert.equal(g.tell(e).damage, 27);
  e.hp = 320;
  assert.equal(g.tell(e).damage, 31);
  e.cycle = 1;
  b.grid[10] = [g.instance(g.newCard("ward"))];
  assert.ok(g.gridTelegraphs().some((t) => t.targets.includes(10)));
  e.purifyPending = true;
  assert.equal(g.tell(e).commandIdeons, true);
  e.purifyPending = false;
  for (let i = 0; i < 18; i++) {
    g.endTurn();
    while (b.reaction) act(g, "skipEquipment");
    assert.ok(livingIdeons(b).filter((x) => x.owner === e.uid).length <= 6);
  }
  assert.ok(Object.keys(b.corruptions).length > 0);
  assert.ok(b.destroyed.length > 0);
});
test("movement actions and enemy steps remain inside each smaller floor", () => {
  for (let n = 2; n <= 3; n++) {
    const g = floor(n);
    g.s.field.x = g.s.field.y = g.s.field.size - 1;
    assert.ok(
      g
        .legal()
        .filter((a) => a.type === "move")
        .every((a) => a.x < g.s.field.size && a.y < g.s.field.size),
    );
  }
});

test("Rift Boar uses native Apex stats and can spawn only in the Apex", () => {
  const d = enemies.riftBoar;
  assert.equal(d.stratum, 4);
  assert.equal(d.tier, "Eidolon");
  for (let n = 1; n <= 3; n++) {
    assert.deepEqual(apexStats(d, { apexMap: true, apexFloor: n }), {
      hp: 135,
      damageBonus: 0,
    });
    const g = floor(n);
    g.s.field.queue = ["Eidolon", "Gold"];
    g.s.enemyDecks.Eidolon = ["riftBoar"];
    g.beginRound();
    assert.ok(g.s.field.entities.some((e) => e.enemy === "riftBoar"));
    g.beginBattle([
      { uid: g.uid(), enemy: "riftBoar", apexMap: true, apexFloor: n },
    ]);
    const e = g.s.battle.enemies[0];
    assert.equal(e.hp, 135);
    assert.equal(g.tell(e).damage, 18);
    e.cycle = 1;
    assert.deepEqual(
      g.tell(e).sequence.map((h) => h.damage),
      [12, 12],
    );
    e.cycle = 2;
    assert.equal(g.tell(e).pierce, true);
    assert.equal(g.tell(e).damage, 22);
  }
});

test("Rift Chimera is a native Apex Eidolon with a three-element breath", () => {
  const g = floor(),
    d = enemies.riftChimera;
  assert.equal(d.stratum, 4);
  assert.equal(d.tier, "Eidolon");
  assert.equal(d.flying, true);
  assert.deepEqual(apexStats(d, { apexMap: true, apexFloor: 1 }), {
    hp: 145,
    damageBonus: 0,
  });
  g.beginBattle([
    { uid: g.uid(), enemy: d.id, restless: 0, apexMap: true, apexFloor: 1 },
  ]);
  const e = g.s.battle.enemies[0];
  e.cycle = 1;
  assert.deepEqual(g.tell(e).sequence, [
    { damage: 9, element: "Fire" },
    { damage: 9, element: "Earth" },
    { damage: 9, element: "Chaos" },
  ]);
});
