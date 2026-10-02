import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { Game } from "../src/engine.mjs";
import { startTutorial, TUTORIAL, TUTORIAL_STEPS } from "../src/tutorial.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
import { enemies } from "../src/content.mjs";
const { recordTutorial } = createRequire(import.meta.url)(
  "../tutorial-profile.cjs",
);
const begin = () => startTutorial(new Game(TUTORIAL.seed));
function walk(g, until = "independent", capture = () => {}) {
  for (let n = 0; n < 140 && g.s.tutorial.lesson !== until; n++) {
    capture(g);
    const a = g.legal()[0];
    assert.ok(a, `stuck at ${g.s.tutorial.lesson}`);
    const illegal = g
      .baseLegal()
      .find((x) => !g.legal().some((y) => y.key === x.key));
    if (illegal) assert.throws(() => g.act(illegal), /Illegal/);
    g.act(a);
  }
  assert.equal(g.s.tutorial.lesson, until);
  return g;
}
test("Every guided lesson is legal, deterministic and preserves actual costs, inventory and combat math", () => {
  const checkpoints = {};
  const g = walk(begin(), "independent", (g) => {
    checkpoints[g.s.tutorial.lesson] = structuredClone(g.s);
  });
  assert.equal(checkpoints["gold-gained"].gold, 200);
  assert.equal(checkpoints["focus-empty"].battle.focus, 0);
  assert.equal(checkpoints["shield-expiry"].battle.shields.length, 0);
  assert.equal(checkpoints["bracelet-block1"].battle.reaction.damage, 1);
  assert.equal(checkpoints["ward-persists"].battle.grid[16][0].ward, 17);
  assert.deepEqual(
    ["route-ally", "route-block", "route-ward", "route-bracelet"].map(
      (k) => checkpoints[k].battle.reaction.damage,
    ),
    [30, 26, 22, 5],
  );
  assert.equal(checkpoints["route-done"].hp, 67);
  assert.equal(checkpoints["cycle"].hp, 66);
  assert.equal(g.s.hp, 70);
  assert.equal(
    g.s.inventory.find((x) => x.id === "bronze").gem,
    g.s.inventory.find((x) => x.id === "sapphire").uid,
  );
  assert.equal(
    g.s.inventory.find((x) => x.uid === g.s.equipment.head).id,
    "crown",
  );
  assert.equal(g.s.deck.filter((c) => c.id === "blast" && c.upgrade).length, 1);
  assert.equal(g.s.revealedArchon, "hart");
  assert.ok(g.s.tutorial.finalStart);
  assert.deepEqual(g.s, walk(begin()).s);
  const chase = checkpoints["caught"];
  assert.equal(chase.battle.enemies[0].id, "tutorialRootling");
  assert.deepEqual([chase.field.x, chase.field.y], [9, 4]);
});
test("Exact-step save/resume works at every guided decision and preserves legal choices without checkpoint nesting", () => {
  let g = begin();
  for (let n = 0; n < TUTORIAL_STEPS.length - 1; n++) {
    const h = new Game(0, g.save());
    assert.equal(h.s.tutorial.lesson, g.s.tutorial.lesson);
    assert.deepEqual(h.legal(), g.legal());
    assert.equal(h.s.checkpoint, undefined);
    const a = g.legal()[0];
    assert.ok(a, g.s.tutorial.lesson);
    g.act(a);
    h.act(a);
    assert.deepEqual(h.observe(), g.observe());
    g = h;
  }
  assert.equal(g.s.tutorial.lesson, "independent");
});
test("Independent Eidolon is beatable with real legal choices, marks tutorial only, and supports a genuine retry after loss", () => {
  const g = walk(begin()),
    p = new WeightedPolicy();
  assert.ok(g.legal().length > 1);
  g.s.hp = 1;
  g.s.battle.enemies[0].cycle = 1;
  g.endTurn();
  while (g.s.battle.reaction)
    g.act(g.legal().find((a) => a.type === "skipEquipment"));
  assert.equal(g.s.mode, "result");
  assert.equal(g.s.outcome, "loss");
  assert.equal(g.s.tutorial.completed, false);
  g.act(g.legal().find((a) => a.type === "tutorialRetry"));
  assert.equal(g.s.hp, 70);
  assert.equal(g.s.battle.turn, 1);
  for (let n = 0; n < 400 && g.s.mode !== "result"; n++) {
    const a = p.choose(g.observe(), g.legal());
    assert.ok(a);
    g.act(a.action);
  }
  assert.equal(g.s.outcome, "win");
  assert.equal(g.s.tutorial.completed, true);
  assert.equal(g.observe().tutorial.id, "stratum1");
});
test("Tutorial content stays outside normal enemy decks and spawn refills", () => {
  const tutorial = Object.values(enemies)
    .filter((e) => e.tutorialOnly)
    .map((e) => e.id);
  for (let seed = 1; seed <= 30; seed++) {
    const g = new Game(seed);
    for (const deck of Object.values(g.s.enemyDecks))
      assert.ok(deck.every((id) => !tutorial.includes(id)));
    for (let round = 0; round < 16; round++) {
      g.s.mode = "field";
      g.beginRound();
      assert.ok(g.s.field.entities.every((e) => !tutorial.includes(e.enemy)));
      g.s.field.entities = [];
    }
  }
});
test("Tutorial starts and completions are durable, idempotent and never credited for abandoned or lost attempts", () => {
  const g = begin();
  let stats = recordTutorial({}, g.s, "start", "one", "a");
  stats = recordTutorial(stats, g.s, "start", "one", "b");
  assert.equal(stats.stratum1.starts.length, 1);
  stats = recordTutorial(
    stats,
    { ...g.s, outcome: "loss" },
    "complete",
    "one",
    "c",
  );
  assert.equal(stats.stratum1.firstCompletedAt, null);
  stats = recordTutorial(
    stats,
    { ...g.s, tutorial: { ...g.s.tutorial, completed: true }, outcome: "win" },
    "complete",
    "one",
    "d",
  );
  stats = recordTutorial(
    stats,
    { ...g.s, tutorial: { ...g.s.tutorial, completed: true }, outcome: "win" },
    "complete",
    "one",
    "e",
  );
  assert.equal(stats.stratum1.completions.length, 1);
  assert.equal(stats.stratum1.firstCompletedAt, "d");
  assert.deepEqual(
    recordTutorial(stats, { outcome: "win" }, "complete", "normal"),
    stats,
  );
});
