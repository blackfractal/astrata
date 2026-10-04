import { WeightedPolicy } from "../src/policy.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { Game, cardPower } from "../src/engine.mjs";
import { cards, enemies } from "../src/content.mjs";
import {
  prepareCorruption,
  applyCorruptions,
  corruptionRound,
  canEnter,
  startRepairs,
} from "../src/corruptions.mjs";
import { startLoomTutorial, LOOM_STEPS } from "../src/loom-tutorial.mjs";
const arena = (id = "mendingTutor") => {
  const g = new Game(83);
  g.s.stratum = 2;
  g.beginBattle([{ uid: g.uid(), enemy: id, restless: 0 }]);
  g.s.battle.corruptions = {};
  return g;
};
const place = (g, id, i, upgrade = false) => {
  const c = g.instance(g.newCard(id, upgrade));
  g.s.battle.grid[i] = [c];
  return c;
};
const q = (g, i, kind, extra = {}) =>
  (g.s.battle.corruptions[i] = {
    kind,
    uid: g.uid(),
    source: g.s.battle.enemies[0].uid,
    value: 1,
    remaining: 3,
    createdTurn: g.s.battle.turn,
    ...extra,
  });
const action = (g, type, p = {}) => {
  const a = g
    .legal()
    .find(
      (a) => a.type === type && Object.entries(p).every(([k, v]) => a[k] === v),
    );
  assert.ok(a, "missing " + type + " " + JSON.stringify(p));
  g.act(a);
};
const round = (g) => {
  g.endTurn();
  while (g.s.mode === "battle" && g.s.battle.reaction)
    action(g, "skipEquipment");
};
test("Stratum 1 excludes all Loom enemies, cards, companions and drops", () => {
  for (let seed = 1; seed < 30; seed++) {
    const g = new Game(seed);
    assert.equal(enemies[g.s.archon].stratum, undefined);
    assert.ok(
      g.s.itemDeck.every(
        (id) =>
          !id.startsWith("card:") || (cards[id.slice(5)].stratum || 1) === 1,
      ),
    );
    assert.ok(g.pool("common").every((c) => !c.stratum));
    for (let i = 0; i < 16; i++) {
      g.s.field.entities = [];
      g.beginRound();
      assert.ok(
        g.s.field.entities.every((e) => !e.enemy || !enemies[e.enemy].stratum),
      );
    }
  }
});
test("Stratum transition retains HP/deck/equipment, grants one companion, full Tavern then new field", () => {
  const g = new Game(3);
  g.s.hp = 31;
  g.addCard("grove");
  const eq = structuredClone(g.s.equipment);
  g.enterStratum2();
  assert.equal(g.s.hp, 31);
  assert.deepEqual(g.s.equipment, eq);
  assert.ok(g.s.deck.some((c) => c.id === "grove"));
  assert.equal(g.s.deck.filter((c) => c.id === "elves").length, 1);
  assert.equal(g.s.field.spawned, 0);
  assert.equal(g.s.shop.healer, true);
  action(g, "leave");
  assert.equal(g.s.mode, "loomIntro");
  action(g, "enterLoom");
  assert.equal(g.s.field.spawned, 2);
  assert.ok(
    g.s.field.entities.every((e) => !e.enemy || enemies[e.enemy].stratum === 2),
  );
  assert.equal(
    g.pool().some((c) => c.id === "quietStitch"),
    true,
  );
});
test("Memory Hole blocks ordinary placement and Shift; only upgraded Elves can enter", () => {
  const g = arena(),
    b = g.s.battle;
  q(g, 8, "hole");
  const normal = g.newCard("blast"),
    elf = g.newCard("elves"),
    up = g.newCard("elves", true);
  assert.equal(canEnter(b, normal, 8), false);
  assert.equal(canEnter(b, elf, 8), false);
  assert.equal(canEnter(b, up, 8), true);
  assert.equal(canEnter(b, elf, 9), false);
  b.hand = [normal, elf, up];
  b.focus = 10;
  assert.deepEqual(
    g
      .legal()
      .filter((a) => a.type === "place" && a.slot === 8)
      .map((a) => a.uid),
    [up.uid],
  );
});
test("Nausea halves live damage and newly generated Guard; cover/recall switches it immediately", () => {
  const g = arena(),
    b = g.s.battle,
    c = place(g, "blast", 8),
    shield = place(g, "shield", 2),
    ward = place(g, "ward", 14);
  q(g, 7, "nausea");
  q(g, 1, "nausea");
  assert.equal(cardPower(b, c, 8), 2);
  assert.equal(g.shieldPower(shield, 2), 2);
  place(g, "clear", 7);
  place(g, "clear", 1);
  assert.equal(cardPower(b, c, 8), 4);
  assert.equal(g.shieldPower(shield, 2), 4);
  b.grid[7] = [];
  g.applyCard(ward, 14, null, "Arcane");
  assert.equal(ward.ward, 5);
});
test("Mend waits, survives reload, repairs and discards; dead Elves do not repair", () => {
  const g = arena(),
    b = g.s.battle;
  q(g, 8, "nausea");
  const c = place(g, "elves", 8);
  b.phase = "activate";
  action(g, "activate", { slot: 8 });
  assert.ok(b.corruptions[8]);
  assert.equal(c.used, 1);
  const loaded = new Game(0, g.s);
  round(loaded);
  assert.equal(loaded.s.battle.corruptions[8], undefined);
  assert.ok(
    [
      ...loaded.s.battle.hand,
      ...loaded.s.battle.deck,
      ...loaded.s.battle.discard,
    ].some((x) => x.uid === c.uid),
  );
  const d = arena();
  q(d, 8, "nausea");
  const dead = place(d, "elves", 8);
  d.s.battle.phase = "activate";
  action(d, "activate", { slot: 8 });
  d.destroyCard(8, dead.uid);
  round(d);
  assert.ok(d.s.battle.corruptions[8]);
  assert.ok(d.s.battle.destroyed.some((x) => x.uid === dead.uid));
});
test("Freeze delays repairs; repaired Elves cannot be covered or shifted while working", () => {
  const g = arena(),
    b = g.s.battle;
  q(g, 8, "nausea");
  const c = place(g, "elves", 8);
  b.phase = "activate";
  action(g, "activate", { slot: 8 });
  c.freeze = b.turn + 1;
  assert.equal(canEnter(b, g.newCard("plasma"), 8), false);
  round(g);
  assert.ok(b.corruptions[8]);
  round(g);
  assert.equal(b.corruptions[8], undefined);
});
test("Insanity escalates, resets when covered, and lethal loss floors HP", () => {
  const g = arena(),
    b = g.s.battle;
  q(g, 8, "insanity");
  startRepairs(g);
  assert.equal(g.s.hp, 69);
  startRepairs(g);
  assert.equal(g.s.hp, 67);
  place(g, "shield", 8);
  startRepairs(g);
  assert.equal(b.corruptions[8].value, 1);
  b.grid[8] = [];
  startRepairs(g);
  assert.equal(g.s.hp, 66);
  g.s.hp = 1;
  startRepairs(g);
  assert.equal(g.s.mode, "result");
  assert.equal(g.s.hp, 0);
});
test("Mine gives three full response turns and destroys only top card when covered", () => {
  const g = arena(),
    b = g.s.battle;
  q(g, 8, "mine");
  corruptionRound(g);
  assert.equal(b.corruptions[8].remaining, 3);
  const under = place(g, "plasma", 8);
  b.grid[8].push(g.instance(g.newCard("plasma")));
  for (let n = 0; n < 2; n++) {
    b.turn++;
    corruptionRound(g);
    assert.ok(b.corruptions[8]);
  }
  b.turn++;
  corruptionRound(g);
  assert.equal(b.corruptions[8], undefined);
  assert.equal(b.grid[8].length, 1);
  assert.equal(b.grid[8][0].uid, under.uid);
  assert.equal(g.s.hp, 70);
});
test("Uncovered Mine queues 18 Arcane through ordinary defenses", () => {
  const g = arena(),
    b = g.s.battle;
  q(g, 8, "mine", { remaining: 1, createdTurn: 0 });
  b.jobs = [];
  b.bracelets = [
    { uid: g.s.inventory[0].uid, block: 2, element: "Arcane", name: "Bronze" },
  ];
  corruptionRound(g);
  g.pump();
  assert.equal(b.reaction.damage, 18);
  assert.equal(b.reaction.pierce, undefined);
});
test("Hypnosis spends normal allowance, obeys once per turn, charges without release, and can grant enemy Guard", () => {
  const g = arena(),
    b = g.s.battle,
    c = place(g, "blast", 8);
  q(g, 8, "hypnosis");
  b.jobs = [];
  corruptionRound(g);
  assert.equal(c.used, 1);
  assert.equal(b.jobs[0].damage, 4);
  corruptionRound(g);
  assert.equal(c.used, 1);
  b.turn++;
  const kiln = place(g, "kiln", 8);
  b.jobs = [];
  corruptionRound(g);
  assert.equal(kiln.charge, 1);
  assert.equal(b.jobs.length, 0);
  const shield = place(g, "shield", 8);
  corruptionRound(g);
  assert.equal(b.enemies[0].guard, 4);
});
test("Telegraphs persist fixed spaces across reload and occupied Hole marks fizzle without retargeting", () => {
  const g = arena("seamstress"),
    b = g.s.battle,
    e = b.enemies[0];
  prepareCorruption(g, e, { markCorruption: "hole" });
  const mark = structuredClone(e.corruptionPlan);
  const loaded = new Game(0, g.s);
  assert.deepEqual(loaded.s.battle.enemies[0].corruptionPlan, mark);
  place(g, "shield", mark[0].slot);
  applyCorruptions(g, e);
  assert.equal(Object.keys(b.corruptions).length, 0);
});
test("Enemy corruption caps prevent filling the entire grid; removal frees capacity", () => {
  const g = arena("sourcap"),
    e = g.s.battle.enemies[0];
  for (let n = 0; n < 10; n++) {
    prepareCorruption(g, e, { markCorruption: "nausea" });
    applyCorruptions(g, e);
  }
  assert.equal(Object.keys(g.s.battle.corruptions).length, 1);
});
test("Each boss has a signature Corruption, while several motes never corrupt", () => {
  const bosses = Object.values(enemies).filter(
    (e) => e.stratum === 2 && e.tier === "Archon",
  );
  assert.equal(bosses.length, 3);
  assert.equal(
    new Set(
      bosses.flatMap((e) =>
        e.rotation.map((t) => t.markCorruption).filter(Boolean),
      ),
    ).size,
    3,
  );
  assert.ok(
    Object.values(enemies).filter(
      (e) =>
        e.stratum === 2 &&
        e.tier === "Mote" &&
        !e.tutorialOnly &&
        !e.rotation.some((t) => t.markCorruption),
    ).length >= 4,
  );
});
test("All new boss rotations resolve legally, including Purify and corruption jobs", () => {
  for (const id of ["seamstress", "censer", "borrowedChoir"]) {
    const g = arena(id);
    g.s.hp = 1000;
    g.s.maxHp = 1000;
    place(g, "blast", 8);
    for (let i = 0; i < 12; i++) {
      round(g);
      assert.equal(g.s.mode, "battle");
      assert.ok(g.legal().length);
    }
  }
});
test("Entire deterministic Loom tutorial survives reload at every step and completes", () => {
  let g = startLoomTutorial(new Game(22002));
  let count = 0;
  while (g.s.mode !== "result" && count++ < 400) {
    g = new Game(0, g.s);
    assert.ok(g.legal().length, g.s.tutorial.lesson);
    g.act(
      g.s.tutorial.lesson === "independent"
        ? new WeightedPolicy().choose(g.observe(), g.legal()).action
        : g.legal()[0],
    );
  }
  assert.equal(g.s.outcome, "win");
  assert.ok(count >= LOOM_STEPS.length);
  assert.equal(g.s.tutorial.completed, true);
});
test("Version 1.3.50 saves load as Stratum 1 without Corruptions or Elves", () => {
  const g = arena();
  delete g.s.stratum;
  delete g.s.battle.corruptions;
  g.s.version.rules = "1.3.50";
  const loaded = new Game(0, g.s);
  assert.equal(loaded.s.stratum, 1);
  assert.deepEqual(loaded.s.battle.corruptions, {});
});
test("Companion challenge disqualification persists after use and replacement", () => {
  const g = new Game(1);
  g.enterStratum2();
  g.beginBattle([{ uid: g.uid(), enemy: "mendingTutor" }]);
  const b = g.s.battle;
  q(g, 8, "nausea");
  b.hand = [g.s.deck.find((c) => c.id === "elves")];
  action(g, "place", { slot: 8 });
  assert.equal(g.s.stats.withoutMenders.disqualified, "Machine Elves used");
  const loaded = new Game(0, g.save());
  assert.ok(loaded.s.stats.withoutMenders.disqualified);
});
test("Second Archon reward resolves to Stratum 2 victory after legendary, Gem and Setting", () => {
  const g = arena("censer");
  g.s.battle.enemies[0].hp = 0;
  g.checkBattle();
  for (const type of [
    "rewardCard",
    "rewardGem",
    "rewardSetting",
    "continueReward",
  ])
    action(g, type);
  assert.equal(g.s.mode, "result");
  assert.equal(g.s.outcome, "win");
  assert.ok(g.s.stats.strataCompleted.includes(2));
});
