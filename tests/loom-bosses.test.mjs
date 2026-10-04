import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards, enemies } from "../src/content.mjs";
import { startLoomTutorial } from "../src/loom-tutorial.mjs";
import {
  bilePlan,
  resolveBile,
  refreshBossPlans,
  disrupt,
  antiElement,
} from "../src/loom-bosses.mjs";
import {
  corruptionRound,
  prepareCorruption,
  applyCorruptions,
} from "../src/corruptions.mjs";

const arena = (id = "blackBile") => {
  const g = new Game(31004);
  g.s.stratum = 2;
  g.s.hp = g.s.maxHp = 1000;
  g.beginBattle([{ uid: g.uid(), enemy: id, restless: 0 }]);
  return g;
};
const put = (g, id, i, upgrade = false) => {
  const c = g.instance(g.newCard(id, upgrade));
  g.s.battle.grid[i] = [c];
  return c;
};
const hazard = (g, i, kind, extra = {}) =>
  (g.s.battle.corruptions[i] = {
    kind,
    uid: g.uid(),
    source: g.s.battle.enemies[0].uid,
    ...extra,
  });
const bile = (g, i) => {
  g.s.battle.biles ||= {};
  g.s.battle.biles[i] = {
    kind: "bile",
    uid: g.uid(),
    source: g.s.battle.enemies[0].uid,
  };
};
const act = (g, type, fields = {}) => {
  const a = g
    .legal()
    .find(
      (a) =>
        a.type === type && Object.entries(fields).every(([k, v]) => a[k] === v),
    );
  assert.ok(a, JSON.stringify({ type, fields }));
  g.act(a);
  return a;
};
const resolve = (g) => {
  let n = 0;
  while (g.s.mode === "battle" && g.s.battle.reaction && n++ < 100)
    act(g, "skipEquipment");
  assert.ok(n < 100);
};
const round = (g) => {
  g.endTurn();
  resolve(g);
};

test("New bosses replace the Archon pool; former bosses are weaker Eidolons", () => {
  assert.deepEqual(
    Object.values(enemies)
      .filter((e) => e.stratum === 2 && e.tier === "Archon")
      .map((e) => e.id),
    ["blackBile", "bombadier", "trickster"],
  );
  for (const [id, hp] of [
    ["seamstress", 110],
    ["censer", 120],
    ["borrowedChoir", 100],
  ]) {
    assert.equal(enemies[id].tier, "Eidolon");
    assert.equal(enemies[id].hp, hp);
  }
  const g = arena("censer");
  g.s.battle.enemies[0].hp = 0;
  g.checkBattle();
  assert.equal(g.s.reward.boss, false);
});
test("Legacy assigned Archon migrates without RNG; active old boss keeps a completing reward", () => {
  const g = arena("censer"),
    b = g.s.battle;
  g.s.archon = g.s.revealedArchon = "censer";
  g.s.field.entities = [
    {
      uid: b.enemies[0].entityUid,
      type: "Archon",
      enemy: "censer",
      x: 5,
      y: 5,
    },
  ];
  b.enemies[0].tier = "Archon";
  b.enemies[0].maxHp = 210;
  b.enemies[0].hp = 93;
  g.s.version = { ...g.s.version, rules: "2.0.7" };
  const loaded = new Game(0, structuredClone(g.s));
  assert.equal(loaded.s.archon, "bombadier");
  assert.equal(loaded.s.revealedArchon, "bombadier");
  assert.equal(loaded.s.field.entities[0].enemy, "bombadier");
  assert.equal(loaded.s.rng, g.s.rng);
  assert.equal(loaded.s.battle.enemies[0].id, "censer");
  assert.equal(loaded.s.battle.enemies[0].hp, 93);
  loaded.s.battle.enemies[0].hp = 0;
  loaded.checkBattle();
  assert.equal(loaded.s.reward.boss, true);
});
test("Old guided Mending lesson restarts with new rules; independent lesson can continue", () => {
  for (const independent of [false, true]) {
    const g = startLoomTutorial(new Game(102));
    Object.assign(g.s.tutorial, {
      version: 1,
      lesson: independent ? "independent" : "mend",
      step: independent ? 34 : 10,
    });
    const loaded = new Game(0, structuredClone(g.s));
    assert.equal(loaded.s.tutorial.version, 2);
    assert.equal(
      loaded.s.tutorial.lesson,
      independent ? "independent" : "loom-welcome",
    );
  }
});
test("Bile deterministic spawn, left-diagonal priority, no trail and only arrival drains", () => {
  const g = arena(),
    b = g.s.battle,
    e = b.enemies[0];
  const a = put(g, "blast", 13),
    z = put(g, "shield", 5),
    up = put(g, "blast", 6);
  assert.deepEqual(bilePlan(g, e), { from: null, to: 6 }); // rightmost tie: top row
  resolveBile(g, e);
  assert.equal(up.used, 1);
  assert.deepEqual(bilePlan(g, e), { from: 6, to: 13 }); // directly left isn't allowed
  resolveBile(g, e);
  assert.equal(b.biles[6], undefined);
  assert.equal(a.used, 1);
  assert.deepEqual(bilePlan(g, e), { from: 13, to: 5 });
  resolveBile(g, e);
  assert.equal(z.used, 1);
  assert.equal(a.used, 1);
  assert.deepEqual(Object.keys(b.biles), ["5"]);
});
test("Bile picks leftmost movable glob; blocked globs persist and trigger fresh throws", () => {
  const g = arena(),
    b = g.s.battle,
    e = b.enemies[0];
  bile(g, 10);
  bile(g, 12);
  put(g, "blast", 2);
  put(g, "blast", 4);
  put(g, "blast", 27);
  assert.deepEqual(bilePlan(g, e), { from: 10, to: 2 });
  b.grid[2][0].used = 2;
  b.grid[4][0].used = 2;
  assert.deepEqual(bilePlan(g, e), { from: null, to: 27 });
  resolveBile(g, e);
  assert.equal(Object.keys(b.biles).length, 3);
});
test("Left edge poison outranks all spreading; only that glob disappears", () => {
  const g = arena(),
    b = g.s.battle,
    e = b.enemies[0];
  bile(g, 0);
  bile(g, 7);
  bile(g, 12);
  put(g, "blast", 4);
  resolveBile(g, e);
  assert.equal(g.s.status.poison, 2);
  assert.equal(b.biles[0], undefined);
  assert.ok(b.biles[7]);
  assert.ok(b.biles[12]);
  assert.deepEqual(bilePlan(g, e), { from: 7, to: "player" });
});
test("Bile shares a Corruption space; Elves intercept without a player activation", () => {
  const g = arena(),
    b = g.s.battle,
    e = b.enemies[0];
  bile(g, 13);
  const elf = put(g, "elves", 5);
  hazard(g, 5, "nausea");
  resolveBile(g, e);
  assert.equal(elf.used, 1);
  assert.equal(b.biles[13], undefined);
  assert.equal(b.biles[5], undefined);
  assert.ok(b.corruptions[5]);
  assert.equal(elf.lastActivatedTurn, 0);
});
test("Bile warning changes after legal placement/activation and survives live save reload", () => {
  const g = arena(),
    b = g.s.battle,
    e = b.enemies[0];
  put(g, "blast", 13);
  refreshBossPlans(g);
  assert.equal(e.bilePlan.to, 13);
  b.hand = [g.newCard("blast")];
  b.focus = 10;
  act(g, "place", { slot: 6 });
  assert.equal(e.bilePlan.to, 6);
  const loaded = new Game(0, structuredClone(g.s));
  assert.deepEqual(loaded.s.battle.enemies[0].bilePlan, e.bilePlan);
  assert.equal(loaded.s.rng, g.s.rng);
});
test("Basic Elves place anywhere, repair NESW/self immediately, three uses then discard", () => {
  const g = arena("mendingTutor"),
    b = g.s.battle;
  const c = put(g, "elves", 15);
  hazard(g, 14, "nausea");
  hazard(g, 16, "insanity");
  hazard(g, 22, "mine", { remaining: 3, createdTurn: b.turn });
  hazard(g, 23, "nausea");
  b.phase = "activate";
  b.channel = 10;
  assert.ok(
    !g.legal().some((a) => a.type === "activate" && a.cardTarget === 23),
  );
  act(g, "activate", { slot: 15, cardTarget: 14 });
  assert.equal(b.corruptions[14], undefined);
  assert.equal(c.used, 1);
  assert.ok(b.grid[15].length);
  assert.ok(!g.legal().some((a) => a.type === "activate" && a.slot === 15));
  round(g);
  b.phase = "activate";
  act(g, "activate", { slot: 15, cardTarget: 16 });
  assert.equal(b.corruptions[16], undefined);
  round(g);
  b.phase = "activate";
  act(g, "activate", { slot: 15, cardTarget: 22 });
  assert.equal(b.corruptions[22], undefined);
  assert.equal(b.grid[15].length, 0);
  assert.ok(b.discard.some((x) => x.uid === c.uid));
});
test("Strong adjacent Mend takes two turns, upgraded one; reload preserves committed space", () => {
  for (const upgrade of [false, true]) {
    const g = arena("mendingTutor"),
      b = g.s.battle,
      c = put(g, "elves", 15, upgrade);
    hazard(g, 14, "hole");
    b.phase = "activate";
    act(g, "activate", { slot: 15, cardTarget: 14 });
    assert.ok(b.corruptions[14]);
    assert.equal(c.mending.due, b.turn + (upgrade ? 1 : 2));
    const r = new Game(0, structuredClone(g.s));
    round(r);
    if (!upgrade) {
      assert.ok(r.s.battle.corruptions[14]);
      round(r);
    }
    assert.equal(r.s.battle.corruptions[14], undefined);
    assert.ok(r.s.battle.grid[15].length);
  }
});
test("Bombadier mines give one full turn,20 Fire damage, and basic Elves defuse immediately", () => {
  const g = arena("bombadier"),
    b = g.s.battle,
    e = b.enemies[0];
  assert.equal(e.corruptionPlan.length, 2);
  applyCorruptions(g, e);
  const i = Number(Object.keys(b.corruptions)[0]);
  assert.equal(b.corruptions[i].remaining, 1);
  assert.equal(b.corruptions[i].damage, 20);
  const elf = put(g, "elves", i);
  b.phase = "activate";
  act(g, "activate", { slot: i, cardTarget: i });
  assert.equal(b.corruptions[i], undefined);
  assert.equal(elf.used, 1);
  const j = Number(Object.keys(b.corruptions)[0]);
  corruptionRound(g);
  assert.equal(b.corruptions[j].remaining, 1);
  b.turn++;
  corruptionRound(g);
  assert.equal(b.corruptions[j], undefined);
  assert.equal(b.jobs.find((x) => x.name === "Mind Mine").damage, 20);
  assert.equal(b.jobs.find((x) => x.name === "Mind Mine").element, "Fire");
});
test("Steam preserves ordered independent elements and exact8/10/12 damage", () => {
  const g = arena("bombadier"),
    b = g.s.battle,
    e = b.enemies[0];
  e.cycle = 2;
  e.hp = 1;
  e.buff = 7;
  e.restless = 3;
  const hits = [];
  g.endTurn();
  while (b.reaction) {
    hits.push([b.reaction.damage, b.reaction.element]);
    act(g, "skipEquipment");
  }
  assert.deepEqual(hits, [
    [8, "Fire"],
    [10, "Water"],
    [12, "Wind"],
  ]);
});
test("Phase H commits fullest row, shifts stacks simultaneously, destroys whole stack in Hole", () => {
  const g = arena("trickster"),
    b = g.s.battle,
    e = b.enemies[0];
  e.cycle = 2;
  const a = put(g, "blast", 5),
    z = put(g, "shield", 6);
  b.grid[5].push(g.instance(g.newCard("plasma")));
  hazard(g, 0, "hole");
  refreshBossPlans(g);
  assert.equal(e.phasePlan.line, 0);
  for (let i = 7; i < 14; i++) put(g, "blast", i);
  refreshBossPlans(g);
  assert.equal(e.phasePlan.line, 0);
  const frozen = structuredClone(b.corruptions);
  disrupt(g, e, e.phasePlan);
  assert.equal(b.grid[0].length, 0);
  assert.equal(b.grid[1][0].uid, z.uid);
  assert.ok(b.destroyed.some((c) => c.uid === a.uid));
  assert.equal(b.destroyed.length, 2);
  assert.deepEqual(b.corruptions, frozen);
});
test("Phase V wraps bottom stack two rows; Hypnosis forces spent-this-turn card exactly once", () => {
  const g = arena("trickster"),
    b = g.s.battle,
    e = b.enemies[0];
  e.cycle = 4;
  const c = put(g, "blast", 35);
  c.used = 1;
  c.lastActivatedTurn = b.turn;
  hazard(g, 7, "hypnosis");
  refreshBossPlans(g);
  disrupt(g, e, e.phasePlan);
  assert.equal(b.grid[7][0].uid, c.uid);
  assert.equal(c.used, 2);
  const n = b.jobs.length;
  corruptionRound(g);
  assert.equal(b.jobs.length, n);
  assert.equal(c.used, 2);
  assert.ok(b.jobs.some((j) => j.name.startsWith("Hypnosis")));
});
test("Moved Shield pools follow owner; Hole removes destroyed owners' Guard", () => {
  const g = arena("trickster"),
    b = g.s.battle,
    e = b.enemies[0];
  e.cycle = 2;
  const c = put(g, "shield", 5),
    z = put(g, "shield", 6);
  b.shields = [
    { slot: 5, owner: c.uid, block: 4, element: "Fire" },
    { slot: 6, owner: z.uid, block: 5, element: "Water" },
  ];
  hazard(g, 1, "hole");
  refreshBossPlans(g);
  disrupt(g, e, e.phasePlan);
  assert.equal(b.shields.length, 1);
  assert.equal(b.shields[0].slot, 0);
  assert.equal(b.shields[0].owner, c.uid);
});
test("Anti-elemental counts actual Shield/Ward/equipment Guard, ignores Allies, ties use Arcane", () => {
  const g = arena("trickster"),
    b = g.s.battle,
    e = b.enemies[0];
  e.cycle = 3;
  assert.equal(antiElement(g).element, "Arcane");
  const c = put(g, "shield", 6);
  b.shields = [{ slot: 6, owner: c.uid, block: 5, element: "Fire" }];
  assert.equal(g.tell(e).element, "Water");
  const w = put(g, "ward", 0);
  w.ward = 5;
  w.element = "Water";
  assert.equal(antiElement(g).element, "Arcane");
  w.ward = 6;
  assert.equal(antiElement(g).element, "Wind");
  const ally = put(g, "golem", 8);
  ally.hp = 100;
  assert.equal(antiElement(g).element, "Wind");
  const bracelet = g.addItem("gold"),
    gem = g.addItem("ruby");
  bracelet.gem = gem.uid;
  g.s.equipment.wrist1 = bracelet.uid;
  assert.equal(antiElement(g).element, "Water");
  assert.equal(g.tell(e).damage, 15);
  e.cycle = 13;
  e.hp = 1;
  assert.equal(g.tell(e).damage, 15);
});
test("Anti-elemental ignores covered or destroyed Shield owners", () => {
  const g = arena("trickster"),
    b = g.s.battle,
    c = put(g, "shield", 6);
  b.shields = [{ slot: 6, owner: c.uid, block: 12, element: "Fire" }];
  b.grid[6].push(g.instance(g.newCard("plasma")));
  assert.equal(antiElement(g).element, "Arcane");
  b.grid[6].pop();
  assert.equal(antiElement(g).element, "Water");
  g.destroyCard(6, c.uid);
  assert.equal(antiElement(g).element, "Arcane");
});
test("New boss full cycles and Purify stay legal with seeded reloads", () => {
  for (const id of ["blackBile", "bombadier", "trickster"]) {
    const g = arena(id),
      b = g.s.battle;
    put(g, "bastion", 6);
    put(g, "blast", 12);
    put(g, "shield", 18);
    put(g, "elves", 24);
    b.enemies[0].status.corrode = 1;
    refreshBossPlans(g);
    const r = new Game(0, structuredClone(g.s));
    for (let i = 0; i < 10; i++) {
      round(g);
      round(r);
      assert.deepEqual(
        { ...r.s, checkpoint: null },
        { ...g.s, checkpoint: null },
        id + " round" + i,
      );
    }
  }
});

test("Black Bile escalates only after four completed cycles, forecasts distinct fresh targets, and still spreads once", () => {
  const g = arena(),
    b = g.s.battle,
    e = b.enemies[0];
  b.grid = Array.from({ length: 42 }, () => []);
  const a = put(g, "blast", 6),
    c = put(g, "blast", 20),
    d = put(g, "blast", 34);
  e.cycle = 15;
  assert.deepEqual(bilePlan(g, e), { from: null, to: 6 });
  e.cycle = 16;
  assert.deepEqual(bilePlan(g, e), { from: null, to: 6, additional: [20] });
  resolveBile(g, e);
  assert.equal(a.used, 1);
  assert.equal(c.used, 1);
  assert.equal(d.used, 0);
  put(g, "blast", 12);
  assert.deepEqual(bilePlan(g, e), { from: 6, to: 12 });
  resolveBile(g, e);
  assert.equal(b.biles[6], undefined);
  assert.ok(b.biles[12]);
  assert.ok(b.biles[20]);
  assert.equal(d.used, 0);
});

test("fourth-cycle final Bile action still uses the single-glob forecast", () => {
  const g = arena(),
    b = g.s.battle,
    e = b.enemies[0];
  b.grid = Array.from({ length: 42 }, () => []);
  put(g, "blast", 6);
  put(g, "blast", 20);
  e.cycle = 15;
  b.phase = "activate";
  g.endTurn();
  assert.equal(Object.keys(b.biles).length, 1);
});

test("Bombadier telegraphs three mines for its fifth bombardment, with ordinary caps retained", () => {
  const g = arena("bombadier"),
    b = g.s.battle,
    e = b.enemies[0];
  e.corruptionPlan = [];
  b.corruptions = {};
  e.cycle = 11;
  assert.equal(g.tell(e).count, 2);
  e.cycle = 15;
  assert.equal(g.tell(e).count, 3);
  prepareCorruption(g, e, g.tell(e));
  assert.equal(e.corruptionPlan.length, 3);
  const r = new Game(g.s.seed, structuredClone(g.s));
  assert.equal(r.s.battle.enemies[0].corruptionPlan.length, 3);
});

test("ordinary mines also grant exactly one response turn, preserve covered lower stacks, and emit explosion frames", () => {
  const g = arena("censer"),
    b = g.s.battle,
    e = b.enemies[0];
  g.capturePresentation = true;
  g.presentation = [];
  applyCorruptions(g, e);
  const i = Number(Object.keys(b.corruptions)[0]);
  assert.equal(b.corruptions[i].remaining, 1);
  assert.equal(b.corruptions[i].damage, 20);
  assert.equal(b.corruptions[i].element, "Fire");
  const lower = put(g, "plasma", i);
  const upper = g.instance(g.newCard("plasma"));
  b.grid[i].push(upper);
  corruptionRound(g);
  assert.equal(b.grid[i].length, 2);
  b.turn++;
  corruptionRound(g);
  assert.deepEqual(
    b.grid[i].map((c) => c.uid),
    [lower.uid],
  );
  assert.equal(b.corruptions[i], undefined);
  const fx = g.presentation.find((x) => x.kind === "mineExplosion");
  assert.equal(fx.covered, true);
  assert.equal(fx.slot, i);
  assert.equal(
    b.jobs.some((j) => j.name === "Mind Mine"),
    false,
  );
});

test("existing saved mines retain their explicit fuse and damage element while new casts use current rules", () => {
  const g = arena("bombadier"),
    b = g.s.battle;
  hazard(g, 5, "mine", { remaining: 2, damage: 20, createdTurn: 0 });
  b.turn = 1;
  const r = new Game(g.s.seed, structuredClone(g.s));
  corruptionRound(r);
  assert.equal(r.s.battle.corruptions[5].remaining, 1);
  r.s.battle.turn++;
  corruptionRound(r);
  assert.equal(
    r.s.battle.jobs.find((j) => j.name === "Mind Mine").element,
    "Arcane",
  );
});

test("Bombadier retains room for three late mines even with its full Memory Hole allowance", () => {
  const g = arena("bombadier"),
    b = g.s.battle,
    e = b.enemies[0];
  e.corruptionPlan = [];
  b.corruptions = {};
  b.grid = Array.from({ length: 42 }, () => []);
  for (let i = 0; i < 10; i++) hazard(g, i, "hole");
  e.cycle = 15;
  prepareCorruption(g, e, g.tell(e));
  assert.equal(e.corruptionPlan.length, 3);
  applyCorruptions(g, e);
  assert.equal(
    Object.values(b.corruptions).filter((q) => q.kind === "mine").length,
    3,
  );
});
