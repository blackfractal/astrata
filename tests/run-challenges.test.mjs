import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { enterApexFloor } from "../src/apex.mjs";
import {
  discover,
  emptyCollection,
  achievements,
} from "../src/archive-profile.mjs";

function fixture() {
  const g = new Game(651);
  g.beginBattle([{ uid: g.uid(), enemy: "beetle", restless: 0 }]);
  g.s.battle.focus = 10;
  g.s.battle.hand = [];
  return g;
}
function act(g, type, filter = () => true) {
  const a = g.legal().find((a) => a.type === type && filter(a));
  assert.ok(a, `Missing ${type}`);
  g.act(a);
}
function place(g, id, slot, upgrade = 0) {
  const c = g.newCard(id);
  c.upgrade = upgrade;
  g.s.battle.hand.push(c);
  act(g, "place", (a) => a.uid === c.uid && a.slot === slot);
  return c;
}
function completed(g) {
  g.s.stratum = 4;
  g.finish(true);
  return discover(emptyCollection(), g.s).achievements;
}
test("Ordinary S4 wins award independent Miser and Diet challenges; ownership and discards are allowed", () => {
  const g = fixture();
  g.s.battle.hand = [g.newCard("blast"), g.newCard("shield")];
  g.addItem("healingSap");
  act(g, "activatePhase");
  const earned = completed(g);
  for (const id of ["blast-miser", "shield-miser", "strict-diet", "masochist"])
    assert.ok(earned[id]);
});
test("Placing an upgraded or recolored starter disqualifies only its own Miser; Water Blast is allowed", () => {
  const g = fixture();
  place(g, "water", 0);
  place(g, "blast", 2, 1);
  g.s.battle.grid[2][0].element = "Water";
  act(g, "recall", (a) => a.slot === 2);
  const earned = completed(g);
  assert.equal(earned["blast-miser"], undefined);
  assert.ok(earned["shield-miser"] && earned["strict-diet"]);
  const h = fixture();
  place(h, "shield", 0, 1);
  const second = completed(h);
  assert.ok(second["blast-miser"]);
  assert.equal(second["shield-miser"], undefined);
});
test("Placement and consumption evidence survives exact saves and battle restarts", () => {
  const g = fixture();
  place(g, "shield", 0);
  const supply = g.addItem("focusDraught");
  act(g, "consume", (a) => a.uid === supply.uid);
  for (const state of [g.s, g.s.checkpoint]) {
    const h = new Game(0, structuredClone(state));
    assert.equal(h.s.stats.runChallenges.placements.shield, 1);
    assert.equal(h.s.stats.runChallenges.consumablesUsed, 1);
    const earned = completed(h);
    assert.ok(earned["blast-miser"]);
    assert.equal(earned["shield-miser"], undefined);
    assert.equal(earned["strict-diet"], undefined);
  }
});
test("Inspiration's free placement counts, as does drinking directly from a pickup", () => {
  const g = fixture(),
    c = g.newCard("blast");
  g.s.battle.deck = [c];
  g.s.battle.focus = 0;
  const potion = g.addItem("wildInspiration");
  act(g, "consume", (a) => a.uid === potion.uid);
  act(g, "place", (a) => a.slot === 0);
  assert.equal(g.s.stats.runChallenges.placements.blast, 1);
  const earned = completed(g);
  assert.equal(earned["blast-miser"], undefined);
  assert.equal(earned["strict-diet"], undefined);
  const h = fixture();
  h.s.mode = "item";
  h.s.hp -= 5;
  h.s.itemOffer = ["healingSap"];
  h.s.field.entities = [];
  act(h, "usePickup");
  assert.equal(h.s.stats.runChallenges.consumablesUsed, 1);
  assert.equal(completed(h)["strict-diet"], undefined);
});
test("Losses, tutorials, earlier-Stratum wins and untracked legacy runs never award full-run challenges", () => {
  const base = new Game(41).s;
  for (const extra of [
    { outcome: "loss", stratum: 4 },
    { outcome: "win", stratum: 3 },
    { outcome: "win", stratum: 4, tutorial: { id: "stratum1" } },
    { outcome: "win", stratum: 4, stats: {} },
  ]) {
    const earned = discover(emptyCollection(), {
      ...structuredClone(base),
      ...extra,
    }).achievements;
    for (const id of [
      "blast-miser",
      "shield-miser",
      "strict-diet",
      "masochist",
      "sedentary-lifestyle",
    ])
      assert.equal(earned[id], undefined);
  }
  const legacy = fixture();
  delete legacy.s.stats.runChallenges;
  place(legacy, "water", 0);
  assert.equal(legacy.s.stats.runChallenges.trackedFromStart, false);
  const earned = completed(legacy);
  assert.equal(earned["blast-miser"], undefined);
  assert.equal(earned["shield-miser"], undefined);
  assert.equal(earned["strict-diet"], undefined);
});
test("Exactly four achievements conceal their conditions; every other active achievement explains its goal", () => {
  const secret = [
    "calm-apex",
    "i-stand-alone",
    "calm-astrata",
    "traveler-kindness",
  ];
  for (const a of achievements.filter((a) => !a.retired)) {
    assert.equal(
      a.description === "??????????????????",
      secret.includes(a.id),
      a.id,
    );
    assert.ok(a.description.length > 0);
  }
});
test("Masochist allows every inter-Stratum Tavern but excludes map visits, even without purchases", () => {
  const g = new Game(51);
  for (const afterStratum of [1, 2, 3]) g.openTavern({ afterStratum });
  assert.equal(g.s.stats.runChallenges.spawnedTavernsVisited, 0);
  assert.ok(completed(g).masochist);
  for (const stratum of [1, 4]) {
    const h = new Game(51);
    h.s.stratum = stratum;
    h.s.field.entities = [
      { uid: h.uid(), type: "Tavern", x: h.s.field.x, y: h.s.field.y },
    ];
    h.resolveTile();
    assert.equal(h.s.mode, "tavern");
    assert.equal(h.s.stats.runChallenges.spawnedTavernsVisited, 1);
    const resumed = new Game(0, structuredClone(h.s));
    assert.equal(completed(resumed).masochist, undefined);
  }
});
test("Sedentary Lifestyle counts individual steps, includes diagonals, and has a strict 19-step maximum", () => {
  for (const steps of [19, 20]) {
    const g = new Game(152),
      f = g.s.field;
    g.s.mode = "field";
    f.entities = [];
    f.moves = 100;
    const start = { x: f.x, y: f.y };
    for (let n = 0; n < steps; n++) {
      const x = start.x + (n % 2 === 0 ? 1 : 0),
        y = start.y + (n % 2 === 0 ? 1 : 0);
      act(g, "move", (a) => a.x === x && a.y === y);
    }
    assert.equal(g.s.stats.runChallenges.movement, steps);
    const h = new Game(0, structuredClone(g.s));
    assert.equal(!!completed(h)["sedentary-lifestyle"], steps < 20);
  }
});
test("Automatic Apex ascent and waiting do not add movement; the step onto stairs counts once", () => {
  const g = new Game(153);
  g.s.stratum = 4;
  enterApexFloor(g, 1);
  const f = g.s.field;
  f.entities = [{ uid: g.uid(), type: "Ascend", x: f.x + 1, y: f.y }];
  act(g, "move", (a) => a.x === f.x + 1 && a.y === f.y);
  assert.equal(g.s.apex.floor, 2);
  assert.equal(g.s.stats.runChallenges.movement, 1);
  act(g, "wait");
  assert.equal(g.s.stats.runChallenges.movement, 1);
});
test("Elemental Purity allows Arcane plus at most one other printed element in the final deck", () => {
  const cases = [
    [["blast", "shield", "elves", "lucidGuide"], true],
    [["water", "undertow", "rain"], true],
    [["blast", "sapling"], true],
    [["blast", "shield", "water", "rain"], true],
    [["water", "sapling"], false],
    [["blast", "water", "sapling"], false],
    [["blast", "unknown-card"], false],
    [[], false],
    [["unknown-card"], false],
  ];
  for (const [ids, eligible] of cases) {
    const deck = ids.map((id, uid) => ({
      id,
      uid,
      element: "Fire",
      upgrade: 1,
    }));
    const earned = discover(emptyCollection(), {
      outcome: "win",
      stratum: 4,
      deck,
      stats: {},
    }).achievements;
    assert.equal(!!earned["elemental-purity"], eligible, ids.join(","));
  }
  for (const extra of [
    { outcome: "loss" },
    { stratum: 3 },
    { tutorial: { id: "stratum1" } },
  ])
    assert.equal(
      discover(emptyCollection(), {
        outcome: "win",
        stratum: 4,
        deck: [{ id: "blast" }],
        stats: {},
        ...extra,
      }).achievements["elemental-purity"],
      undefined,
    );
});
test("Pop Goes the Weasel counts only a single full-HP Archon hit in a surviving encounter", () => {
  for (const scenario of [
    "single",
    "multiple",
    "wounded",
    "guarded",
    "mote",
    "status",
  ]) {
    const g = new Game(89);
    g.s.equipment = {};
    g.beginBattle([
      { uid: g.uid(), enemy: scenario === "mote" ? "beetle" : "hart" },
    ]);
    const e = g.s.battle.enemies[0];
    if (scenario === "wounded") e.hp--;
    if (scenario === "guarded") e.guard = 1;
    if (scenario === "status") {
      e.hp = 0; // Status/timer path does not record a direct damage hit.
    } else if (scenario === "multiple") {
      g.damageEnemy(e, Math.ceil(e.maxHp / 2), "Arcane", { card: 501 });
      g.damageEnemy(e, Math.ceil(e.maxHp / 2), "Arcane", { card: 501 });
    } else g.damageEnemy(e, e.maxHp, "Arcane", { card: 501 });
    g.checkBattle();
    const earned = discover(emptyCollection(), g.s).achievements;
    assert.equal(
      !!earned["pop-goes-the-weasel"],
      scenario === "single",
      scenario,
    );
  }
  const g = new Game(90);
  g.s.equipment = {};
  g.s.hp = 1;
  g.beginBattle([{ uid: g.uid(), enemy: "choir" }]);
  const e = g.s.battle.enemies[0];
  g.damageEnemy(e, e.maxHp, "Arcane", { card: 501 });
  g.checkBattle();
  g.pump();
  for (let n = 0; n < 10 && g.s.mode === "battle"; n++) {
    const skip = g.legal().find((a) => a.type === "skipEquipment");
    if (skip) g.act(skip);
    else g.pump();
  }
  assert.equal(g.s.outcome, "loss");
  assert.equal(
    discover(emptyCollection(), g.s).achievements["pop-goes-the-weasel"],
    undefined,
  );
});
test("Constructed Resonant Grove + Transmute + Fury Sap setup one-hits base Black Bile", () => {
  const g = new Game(91);
  g.s.stratum = 2;
  g.s.equipment = {};
  g.beginBattle([{ uid: g.uid(), enemy: "blackBile", restless: 0 }]);
  const b = g.s.battle;
  b.grid = b.grid.map(() => []);
  b.phase = "activate";
  b.channel = 3;
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 5; x++)
      b.grid[y * 7 + x] = [g.instance(g.newCard("sapling"))];
  const grove = g.instance(g.newCard("square"));
  b.grid[4] = [grove];
  b.grid[5] = [g.instance(g.newCard("transmute"))];
  const transmute = g
    .legal()
    .find(
      (a) =>
        a.type === "activate" &&
        a.slot === 5 &&
        a.newElement === "Fire" &&
        a.cardTarget === 4,
    );
  assert.ok(transmute, "Adjacent Transmute to Fire is legal");
  g.act(transmute);
  assert.equal(g.cardPower(grove, 4), 102);
  const fury = g.addItem("furySap");
  act(g, "consume", (a) => a.uid === fury.uid);
  act(g, "activate", (a) => a.slot === 4);
  const record = g.s.stats.encounters.at(-1).oneHitArchons?.[0];
  assert.equal(record.maxHp, 276);
  assert.equal(record.damage, 306);
  assert.ok(
    discover(emptyCollection(), g.s).achievements["pop-goes-the-weasel"],
  );
});
