import test from "node:test";
import assert from "node:assert/strict";
import {
  Game,
  enemyDamage,
  gridNeighbors,
  attunementElements,
} from "../src/engine.mjs";
import { cards, enemies } from "../src/content.mjs";
import {
  spawnIdeon,
  livingIdeons,
  commandIdeon,
  protectedOwner,
  cannonPlan,
  ideonActivationReason,
} from "../src/ideons.mjs";
import { fieldStep, makeBarriers, enemyStep } from "../src/depths-field.mjs";
const arena = (id = "glassBrood") => {
  const g = new Game(331);
  g.s.stratum = 3;
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: id, restless: 0 }]);
  delete g.s.checkpoint;
  g.presentation = [];
  g.s.battle.focus = 20;
  g.s.battle.channel = 20;
  return g;
};
const put = (g, id, i) => {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[i] = [c];
  return c;
};
const act = (g, type, match = {}) => {
  const a = g
    .legal()
    .find(
      (a) =>
        a.type === type && Object.entries(match).every(([k, v]) => a[k] === v),
    );
  assert.ok(a, JSON.stringify({ type, ...match }));
  g.act(a);
  return a;
};
const settle = (g) => {
  for (let n = 0; n < 100 && g.s.mode === "battle" && g.s.battle.reaction; n++)
    act(g, "skipEquipment");
};

test("field inspection can preview every S3 Archon without a battle", () => {
  const g = new Game(810);
  g.enterStratum2(3);
  for (const enemy of ["mindHive", "cnidarian", "refractionCannon"])
    assert.ok(
      g.fieldEnemyPreview({ uid: 777, enemy, x: 5, y: 5, born: 1, restless: 0 })
        .rotation.length,
    );
});
test("Concord requires a foundation and releases one wave per distinct source element", () => {
  const g = arena(),
    b = g.s.battle;
  b.phase = "activate";
  const c = put(g, "concord", 10);
  put(g, "cinder", 9);
  put(g, "water", 11);
  assert.ok(!g.legal().some((a) => a.type === "activate" && a.slot === 10));
  put(g, "sapling", 3);
  b.enemies[0].hp = b.enemies[0].maxHp = 1000;
  b.enemies[0].element = "Arcane";
  const e = spawnIdeon(g, b.enemies[0], "binder", { slot: 27 });
  e.hp = e.maxHp = 1000;
  e.element = "Arcane";
  act(g, "activate", { slot: 10 });
  assert.equal(b.enemies[0].hp, 970);
  assert.equal(e.hp, 970);
  assert.equal(c.used, 1);
  assert.equal(b.channel, 17);
});
test("Second Spring restores spent combat uses without refreshing the turn or depleted Ward", () => {
  const g = arena(),
    b = g.s.battle;
  b.phase = "activate";
  put(g, "secondSpring", 10);
  const blast = put(g, "blast", 20);
  blast.used = 2;
  blast.lastActivatedTurn = b.turn;
  const ward = put(g, "ward", 0);
  ward.used = 2;
  ward.ward = 0;
  ward.zeroWard = true;
  const focus = put(g, "focus", 3);
  focus.used = 2;
  act(g, "activate", { slot: 10 });
  assert.equal(g.allowance(blast, 20), 2);
  assert.equal(g.allowance(ward, 0), 2);
  assert.equal(ward.zeroWard, true);
  assert.equal(focus.extraUses, undefined);
  assert.ok(
    !g.legal().some((a) => a.type === "activate" && [0, 20].includes(a.slot)),
  );
  assert.equal(b.grid[10].length, 0);
});

test("S2 rewards enter the transition Tavern, Guide is granted only at Depths entry", () => {
  const g = arena("bombadier");
  g.s.stratum = 2;
  g.s.battle.enemies[0].hp = 0;
  g.checkBattle();
  for (const t of [
    "rewardCard",
    "rewardGem",
    "rewardSetting",
    "continueReward",
  ])
    act(g, t);
  assert.equal(g.s.stratum, 3);
  assert.equal(g.s.mode, "tavern");
  assert.equal(g.s.shop.afterStratum, 2);
  assert.equal(
    g.s.deck.some((c) => c.id === "lucidGuide"),
    false,
  );
  assert.equal(
    g.s.shop.stock.filter(
      (id) => id.startsWith("card:") && cards[id.slice(5)].stratum === 3,
    ).length >= 2,
    true,
  );
  act(g, "leave");
  assert.equal(g.s.mode, "depthsIntro");
  act(g, "enterDepths");
  assert.equal(g.s.mode, "field");
  assert.equal(g.s.deck.filter((c) => c.id === "lucidGuide").length, 1);
  assert.ok(g.s.field.barriers.length);
});
test("Ideons require empty legal spaces, but cannon bullets explicitly cover cards", () => {
  const g = arena(),
    b = g.s.battle,
    o = b.enemies[0];
  for (let i = 0; i < 42; i++) put(g, "blast", i);
  assert.equal(spawnIdeon(g, o, "runner"), null);
  assert.ok(
    spawnIdeon(g, o, "bullet", { slot: 6, field: "element", element: "Fire" }),
  );
  b.phase = "activate";
  assert.equal(
    g.legal().some((a) => a.type === "activate" && a.slot === 6),
    false,
  );
  b.phase = "place";
  assert.equal(
    g.legal().some((a) => a.type === "recall" && a.slot === 6),
    false,
  );
});
test("Needle can attack any Ideon and does double damage, including distant columns", () => {
  const g = arena(),
    b = g.s.battle,
    c = put(g, "lucidNeedle", 41),
    e = spawnIdeon(g, b.enemies[0], "burrower", { slot: 0 });
  b.phase = "activate";
  act(g, "activate", { slot: 41, target: e.uid });
  assert.equal(e.hp, 4);
  assert.equal(c.used, 1);
});
test("all-enemy attacks hit Ideons, guardian protects only its own owner", () => {
  const g = arena(),
    b = g.s.battle;
  const guard = spawnIdeon(g, b.enemies[0], "guardian", { slot: 6 });
  b.enemies.push({ ...b.enemies[0], uid: 901, hp: 48 });
  const other = b.enemies[1];
  put(g, "eclipse", 0).charge = 2;
  b.phase = "activate";
  const hp = b.enemies[0].hp;
  act(g, "activate", { slot: 0 });
  assert.equal(b.enemies[0].hp, hp);
  assert.ok(other.hp < 48);
  assert.ok(guard.hp < guard.maxHp);
  assert.equal(protectedOwner(b, 901), false);
});
test("Ideons do not supply adjacency or attunement; owner death clears only its children", () => {
  const g = arena(),
    b = g.s.battle,
    c = put(g, "shield", 0);
  spawnIdeon(g, b.enemies[0], "runner", { slot: 1 });
  assert.deepEqual(gridNeighbors(b, 0), []);
  assert.deepEqual(attunementElements(b, c, 0), ["Arcane"]);
  b.enemies.push({ ...b.enemies[0], uid: 901, hp: 48 });
  spawnIdeon(g, b.enemies[1], "runner", { slot: 2 });
  b.enemies[0].hp = 0;
  g.checkBattle();
  assert.equal(b.ideons.length, 1);
  assert.equal(b.ideons[0].owner, 901);
});
test("Ideon statuses tick, elemental immunities apply and guardians are Arcane-vulnerable", () => {
  const g = arena(),
    b = g.s.battle,
    e = spawnIdeon(g, b.enemies[0], "guardian", { slot: 6 });
  assert.equal(enemyDamage(10, "Arcane", e), 15);
  assert.equal(enemyDamage(10, "Fire", e), 5);
  g.applyEnemyStatus(e, "poison", 3);
  g.endTurn();
  settle(g);
  assert.equal(e.hp, 19);
  const leech = spawnIdeon(g, b.enemies[0], "leech", { slot: 5 });
  assert.equal(g.applyEnemyStatus(leech, "burn", 2), false);
});
test("Ideon attack originates at its column; same-column defenses allowed, farther right excluded", () => {
  const g = arena(),
    b = g.s.battle;
  for (const i of [1, 3, 5]) {
    const c = put(g, "ward", i);
    c.ward = 10;
  }
  b.jobs = [
    {
      kind: "hit",
      name: "Intrusion",
      damage: 8,
      element: "Arcane",
      source: 900,
      gridSourceSlot: 3,
    },
  ];
  g.pump();
  assert.deepEqual(
    g.defenseChoices().wards.map((x) => x.i),
    [1, 3],
  );
});
test("Scouring Gale is a rightward row beam with one ordinary enemy hit", () => {
  const g = arena(),
    b = g.s.battle,
    o = b.enemies[0];
  put(g, "scouringGale", 2);
  const right = spawnIdeon(g, o, "runner", { slot: 5 }),
    left = spawnIdeon(g, o, "runner", { slot: 1 }),
    other = spawnIdeon(g, o, "runner", { slot: 12 });
  b.phase = "activate";
  act(g, "activate", { slot: 2, target: o.uid });
  assert.equal(right.hp, 2);
  assert.equal(left.hp, 10);
  assert.equal(other.hp, 10);
  assert.equal(o.hp, 44);
});
test("Guide moves and attacks as one activation, then a different card consumes its mark", () => {
  const g = arena(),
    b = g.s.battle;
  const guide = put(g, "lucidGuide", 0),
    e = spawnIdeon(g, b.enemies[0], "burrower", { slot: 2 });
  put(g, "lucidNeedle", 14);
  b.phase = "activate";
  act(g, "activate", { slot: 0, destination: 1, target: e.uid });
  assert.equal(b.grid[1][0].uid, guide.uid);
  assert.equal(e.hp, 11);
  assert.equal(e.mark.bonus, 3);
  act(g, "activate", { slot: 14, target: e.uid });
  assert.equal(e.hp <= 0, true);
});
test("Refraction fields obey source element, disable covered defense, and destroy only after activation", () => {
  const g = arena(),
    b = g.s.battle;
  const shield = put(g, "shield", 5);
  put(g, "heat", 4);
  const bullet = spawnIdeon(g, b.enemies[0], "bullet", {
    slot: 6,
    field: "element",
    element: "Fire",
  });
  b.phase = "activate";
  assert.equal(
    ideonActivationReason(b, 5, "Arcane"),
    "Refraction requires Fire",
  );
  assert.ok(g.legal().some((a) => a.slot === 5 && a.element === "Fire"));
  assert.ok(!g.legal().some((a) => a.slot === 5 && a.element === "Arcane"));
  bullet.field = "destroy";
  act(g, "activate", { slot: 5, element: "Fire" });
  assert.ok(b.destroyed.some((c) => c.uid === shield.uid));
});
test("shared fields follow card identity when cards move and Guide marks ignore equipment", () => {
  const g = arena(),
    b = g.s.battle;
  const card = put(g, "shield", 5);
  const bullet = spawnIdeon(g, b.enemies[0], "bullet", {
    slot: 6,
    field: "shared",
  });
  bullet.fieldUsedTurn = b.turn;
  bullet.fieldUsedCard = card.uid;
  assert.equal(ideonActivationReason(b, 5, "Arcane"), null);
  put(g, "shield", 5);
  assert.equal(
    ideonActivationReason(b, 5, "Arcane"),
    "Another card used this field this turn",
  );
  const victim = spawnIdeon(g, b.enemies[0], "burrower", { slot: 20 });
  victim.mark = { card: 123, bonus: 3 };
  g.damageEnemy(victim, 1, "Arcane", {}, 0);
  assert.equal(victim.hp, 15);
  assert.ok(victim.mark);
  g.damageEnemy(victim, 1, "Arcane", { card: card.uid });
  assert.equal(victim.hp, 11);
  assert.equal(victim.mark, undefined);
});

test("Cannon parity reaches odd and even targets and ordinary launch plans avoid field overlap", () => {
  for (const slot of [3, 4, 5, 6]) {
    const g = arena("refractionCannon"),
      b = g.s.battle;
    put(g, "grove", slot);
    const plan = cannonPlan(g, b.enemies[0], { destructionShot: false });
    assert.equal(plan.slot % 2, slot % 2);
    assert.equal(plan.element, "Fire");
    const e = spawnIdeon(g, b.enemies[0], "bullet", plan);
    assert.equal(e.slot, plan.slot);
    for (let n = 0; n < 3 && e.slot !== slot; n++) commandIdeon(g, e.uid);
    assert.equal(e.slot, slot);
  }
});
test("Cnidarian replacement tier grows by deaths and owner cleanup causes no replacement", () => {
  const g = arena("cnidarian"),
    b = g.s.battle,
    o = b.enemies[0];
  for (let n = 0; n < 4; n++) {
    let e = livingIdeons(b).find((e) => e.kind === "tentacle");
    if (!e) e = spawnIdeon(g, o, "tentacle");
    e.hp = 0;
    g.checkBattle();
  }
  assert.equal(o.tentacleKills, 4);
  assert.equal(o.pendingTentacles, 5);
  o.hp = 0;
  g.checkBattle();
  assert.equal(b.ideons.length, 0);
  assert.equal(o.pendingTentacles, 5);
});
test("Hive ignores damage/status and countdown reaches victory even on a full grid", () => {
  const g = arena("mindHive"),
    b = g.s.battle,
    o = b.enemies[0];
  g.s.hp = 1000;
  for (let i = 0; i < 42; i++) put(g, "blast", i);
  g.damageEnemy(o, 100, "Fire", {});
  assert.equal(o.hp, 15);
  g.applyEnemyStatus(o, "corrode", 5);
  assert.equal(o.status.corrode, 0);
  for (let n = 0; n < 15; n++) {
    g.endTurn();
    settle(g);
  }
  assert.equal(g.s.mode, "reward");
  assert.equal(o.hp, 0);
  assert.equal(b.ideons.length, 0);
});
test("barriers stop both sides, forbid corner cutting, permit explicit flight and preserve paths", () => {
  const f = { x: 5, y: 5, barriers: makeBarriers() };
  assert.equal(fieldStep(f, 1, 2, 2, 2), false);
  assert.equal(fieldStep(f, 1, 1, 2, 0), false);
  assert.equal(fieldStep(f, 1, 2, 2, 2, true), true);
  const e = { x: 1, y: 2 };
  for (let n = 0; n < 30 && (e.x !== 5 || e.y !== 5); n++) {
    const p = enemyStep(f, e, e.x + 1, e.y + 1, { movement: "Hunter" }, true);
    assert.ok(p);
    Object.assign(e, p);
  }
  assert.deepEqual(e, { x: 5, y: 5 });
});
test("S3 live saves preserve Ideons, field state and deterministic subsequent actions", () => {
  const a = arena("refractionCannon");
  put(a, "grove", 4);
  a.endTurn();
  settle(a);
  delete a.s.checkpoint;
  const b = new Game(0, structuredClone(a.s));
  assert.deepEqual(a.observe(), b.observe());
  const key = a.legal().find((x) => x.type === "activatePhase").key;
  a.act(key);
  b.act(key);
  assert.deepEqual(a.observe(), b.observe());
});
