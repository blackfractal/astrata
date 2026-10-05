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
test("Stratum transition grants the companion only on Enter the Unfinished Loom", () => {
  let g = new Game(3);
  g.s.hp = 31;
  g.addCard("grove");
  const eq = structuredClone(g.s.equipment);
  g.enterStratum2();
  assert.equal(g.s.hp, 31);
  assert.deepEqual(g.s.equipment, eq);
  assert.ok(g.s.deck.some((c) => c.id === "grove"));
  assert.equal(g.s.deck.filter((c) => c.id === "elves").length, 0);
  assert.equal(g.s.stats.withoutMenders, undefined);
  assert.equal(g.s.field.spawned, 0);
  assert.equal(g.s.shop.healer, true);
  g = new Game(0, g.save());
  action(g, "leave");
  assert.equal(g.s.mode, "loomIntro");
  g = new Game(0, g.save());
  assert.equal(g.s.deck.filter((c) => c.id === "elves").length, 0);
  action(g, "enterLoom");
  const elves = g.s.deck.filter((c) => c.id === "elves");
  assert.equal(elves.length, 1);
  assert.equal(g.s.stats.withoutMenders.uid, elves[0].uid);
  assert.equal(g.s.stats.withoutMenders.receivedAtStep, g.s.steps);
  g = new Game(0, g.save());
  assert.deepEqual(
    g.s.deck.filter((c) => c.id === "elves"),
    elves,
  );
  assert.ok(!g.legal().some((a) => a.type === "enterLoom"));
  assert.equal(g.s.field.spawned, 2);
  assert.ok(
    g.s.field.entities.every((e) => !e.enemy || enemies[e.enemy].stratum === 2),
  );
  assert.equal(
    g.pool().some((c) => c.id === "quietStitch"),
    true,
  );
});
test("Rest restores 50 HP for 50 Gold between Strata, 20 for 20 at Field Taverns, once per visit", () => {
  for (const transition of [false, true]) {
    let g = new Game(3);
    g.s.hp = 7;
    if (transition) g.enterStratum2();
    else g.openTavern();
    const amount = transition ? 50 : 20;
    g.s.gold = amount - 1;
    assert.ok(!g.legal().some((a) => a.type === "heal"));
    g.s.gold = amount;
    // Existing unspent transition saves use the new offer without a reset.
    const saved = g.save();
    saved.version.rules = "2.1.1";
    g = new Game(0, saved);
    const offer = g.legal().find((a) => a.type === "heal");
    assert.equal(offer.effects.heal, amount);
    assert.equal(offer.costs.gold, amount);
    assert.match(offer.label, new RegExp(`up to ${amount} HP`));
    g.act(offer);
    assert.equal(g.s.hp, 7 + amount);
    assert.equal(g.s.gold, 0);
    g.s.gold = 500;
    g = new Game(0, g.save());
    assert.ok(!g.legal().some((a) => a.type === "heal"));
    g.s.shop.healUsed = false;
    g.s.hp = g.s.maxHp - 3;
    action(g, "heal");
    assert.equal(g.s.hp, g.s.maxHp);
    assert.equal(g.s.gold, 500 - amount);
    assert.ok(!g.legal().some((a) => a.type === "heal"));
    if (transition) {
      action(g, "leave");
      action(g, "enterLoom");
      g.openTavern();
      g.s.hp = 7;
      assert.equal(g.legal().find((a) => a.type === "heal").effects.heal, 20);
    }
  }
});

test("Legacy transition saves defer the exact Elves copy through reload without duplicating acquisition", () => {
  for (const mode of ["tavern", "loomIntro"]) {
    let g = new Game(3);
    g.enterStratum2();
    const elves = g.addCard("elves");
    elves.upgrade = true;
    g.s.stats.withoutMenders = {
      uid: elves.uid,
      receivedAtStep: 0,
      disqualified: null,
    };
    g.s.mode = mode;
    g.s.version = { ...g.s.version, rules: "2.0.2" };
    const rng = g.s.rng;
    const gained = [...g.s.stats.cardsGained];
    g = new Game(0, g.save());
    assert.equal(
      g.s.deck.some((c) => c.id === "elves"),
      false,
    );
    assert.equal(g.s.stats.withoutMenders, undefined);
    assert.equal(g.s.rng, rng);
    g = new Game(0, g.save());
    if (mode === "tavern") action(g, "leave");
    action(g, "enterLoom");
    assert.deepEqual(
      g.s.deck.filter((c) => c.id === "elves"),
      [elves],
    );
    assert.deepEqual(g.s.stats.cardsGained, gained);
    assert.equal(g.s.stats.withoutMenders.disqualified, null);
    assert.equal(g.s.pendingLoomCompanion, undefined);
  }
});

test("Legacy Elves already removed at the Tavern are not resurrected", () => {
  let g = new Game(3);
  g.enterStratum2();
  g.s.stats.withoutMenders = {
    uid: "removed",
    receivedAtStep: 0,
    disqualified: "companion removed",
  };
  g = new Game(0, g.save());
  action(g, "leave");
  action(g, "enterLoom");
  assert.equal(
    g.s.deck.some((c) => c.id === "elves"),
    false,
  );
  assert.equal(g.s.stats.withoutMenders.disqualified, "companion removed");
});

test("Memory Hole blocks ordinary placement and Shift; Machine Elves can enter at either upgrade level", () => {
  const g = arena(),
    b = g.s.battle;
  q(g, 8, "hole");
  const normal = g.newCard("blast"),
    elf = g.newCard("elves"),
    up = g.newCard("elves", true);
  assert.equal(canEnter(b, normal, 8), false);
  assert.equal(canEnter(b, elf, 8), true);
  assert.equal(canEnter(b, up, 8), true);
  assert.equal(canEnter(b, elf, 9), true);
  b.hand = [normal, elf, up];
  b.focus = 10;
  assert.deepEqual(
    g
      .legal()
      .filter((a) => a.type === "place" && a.slot === 8)
      .map((a) => a.uid),
    [elf.uid, up.uid],
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
  assert.equal(ward.ward, 6);
});
test("Mend waits, survives reload, repairs and discards; dead Elves do not repair", () => {
  const g = arena(),
    b = g.s.battle;
  q(g, 8, "hole");
  const c = place(g, "elves", 8, true);
  c.used = 2;
  b.phase = "activate";
  action(g, "activate", { slot: 8 });
  assert.ok(b.corruptions[8]);
  assert.equal(c.used, 3);
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
  q(d, 8, "hole");
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
  q(g, 8, "hole");
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
test("Unchanged telegraphs persist across reload; resolution never silently retargets", () => {
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

test("Covering a Corruption tell immediately relocates only that tell, visibly and deterministically", () => {
  for (const kind of ["hole", "nausea", "insanity", "mine"]) {
    const g = arena("seamstress"),
      b = g.s.battle,
      e = b.enemies[0];
    e.corruptionPlan = [
      { slot: 8, kind },
      { slot: 20, kind: "nausea" },
    ];
    b.hand = [g.newCard("shield"), g.newCard("shield")];
    b.focus = 2;
    g.capturePresentation = true;
    const replay = new Game(0, g.s);
    action(g, "place", { slot: 8 });
    action(replay, "place", { slot: 8 });
    assert.notEqual(e.corruptionPlan[0].slot, 8);
    assert.notEqual(e.corruptionPlan[0].slot, 20);
    assert.equal(b.grid[e.corruptionPlan[0].slot].length, 0);
    assert.equal(e.corruptionPlan[1].slot, 20);
    assert.deepEqual(
      replay.s.battle.enemies[0].corruptionPlan,
      e.corruptionPlan,
    );
    assert.ok(
      g.presentation.some(
        (f) =>
          f.slot === e.corruptionPlan[0].slot &&
          f.name ===
            "Redirected: " +
              {
                hole: "Memory Hole",
                nausea: "Nausea",
                insanity: "Insanity",
                mine: "Mind Mine",
              }[kind],
      ),
    );
    const second = e.corruptionPlan[0].slot;
    action(g, "place", { slot: second });
    assert.notEqual(e.corruptionPlan[0].slot, second);
    const loaded = new Game(0, g.s);
    assert.deepEqual(
      loaded.s.battle.enemies[0].corruptionPlan,
      e.corruptionPlan,
    );
    const final = e.corruptionPlan[0].slot;
    applyCorruptions(g, e);
    assert.equal(b.corruptions[8], undefined);
    assert.equal(b.corruptions[second], undefined);
    assert.equal(b.corruptions[final].kind, kind);
  }
});

test("Full-grid coverage cancels a tell; unrelated placement leaves Hypnosis on its occupied target", () => {
  const g = arena("seamstress"),
    b = g.s.battle,
    e = b.enemies[0];
  for (let i = 0; i < b.grid.length; i++) if (i !== 8) place(g, "blast", i);
  e.corruptionPlan = [
    { slot: 8, kind: "hole" },
    { slot: 9, kind: "hypnosis" },
  ];
  b.hand = [g.newCard("shield")];
  b.focus = 1;
  action(g, "place", { slot: 8 });
  assert.deepEqual(e.corruptionPlan, [{ slot: 9, kind: "hypnosis" }]);
});
test("Enemy corruption caps prevent filling the entire grid; removal frees capacity", () => {
  const g = arena("sourcap"),
    e = g.s.battle.enemies[0];
  for (let n = 0; n < 10; n++) {
    prepareCorruption(g, e, { markCorruption: "nausea" });
    applyCorruptions(g, e);
  }
  assert.equal(Object.keys(g.s.battle.corruptions).length, 2);
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
    4,
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
  for (const id of ["blackBile", "bombadier", "trickster"]) {
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

test("Borrowed Choir keeps Hypnosis across cycles; upgraded Elves repair it", () => {
  const g = arena("borrowedChoir"),
    b = g.s.battle;
  g.s.hp = g.s.maxHp = 1000;
  place(g, "blast", 8);
  place(g, "shield", 10);
  round(g);
  round(g);
  assert.equal(Object.keys(b.corruptions).length, 2);
  const persistent = structuredClone(b.corruptions);
  for (let n = 0; n < 7; n++) round(g);
  assert.deepEqual(b.corruptions, persistent);
  assert.ok(!enemies.borrowedChoir.rotation.some((t) => t.releaseCorruption));
  const slot = Number(Object.keys(persistent)[0]);
  place(g, "elves", slot, true);
  b.phase = "activate";
  action(g, "activate", { slot });
  assert.ok(b.corruptions[slot]);
  round(g);
  assert.equal(b.corruptions[slot], undefined);
  assert.equal(Object.keys(b.corruptions).length, 1);
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
  action(g, "leave");
  action(g, "enterLoom");
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
  const g = arena("bombadier");
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
