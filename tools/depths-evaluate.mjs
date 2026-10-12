import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { depthsFixture } from "./depths-fixture.mjs";
import { Game } from "../src/engine.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
import { VERSION } from "../src/content.mjs";
import { runRecord } from "../src/run-record.mjs";
const { createArchive } = createRequire(import.meta.url)("../run-archive.cjs");
const dir = "reports/depths-evaluation";
await fs.mkdir(dir, { recursive: true });
const names = (await fs.readdir("src")).filter((n) => n.endsWith(".mjs"));
const sources = Object.fromEntries(
  await Promise.all(
    names.map(async (n) => [n, await fs.readFile("src/" + n, "utf8")]),
  ),
);
const archive = createArchive(dir, {
  packageVersion: "3.0.0",
  sources,
  source: "headless",
});
const summary = [];
for (const scenario of [
  "mindHive",
  "cnidarian",
  "refractionCannon",
  "glassBrood",
  "nerveWeaver",
  "paleGrazer",
  "echoPolyp",
  "blindSeer",
  "hollowDrifter",
  "kindlyHunger",
  "knotkeeper",
  "borrowedOracle",
  ...Array.from({ length: 5 }, (_, i) => "run-" + i),
]) {
  const seed =
      73001 + (scenario.startsWith("run") ? Number(scenario.slice(4)) : 0),
    g = depthsFixture(seed, scenario.startsWith("run") ? null : scenario),
    policy = new WeightedPolicy();
  const initial = g.save(),
    decisions = [],
    rounds = [];
  const runId = "depths-" + scenario + "-" + Date.now();
  let last = "",
    maxIdeons = 0,
    step = 0;
  archive.record(
    runRecord(g, runId, "start", {
      policy: policy.id,
      weights: policy.weights,
    }),
  );
  for (
    ;
    step < 12000 &&
    !["result", ...(scenario.startsWith("run") ? [] : ["reward"])].includes(
      g.s.mode,
    );
    step++
  ) {
    const o = g.observe(),
      legal = g.legal(),
      decision = policy.choose(o, legal);
    if (!decision)
      throw Error("No legal decision: " + scenario + " " + g.s.mode);
    const key = [o.mode, o.field.round, o.battle?.turn].join(":");
    if (key !== last) {
      rounds.push({
        mode: o.mode,
        round: o.field.round,
        turn: o.battle?.turn,
        hp: o.hp,
        enemies: o.battle?.enemies.map((e) => ({ id: e.id, hp: e.hp })),
        ideons: o.battle?.ideons?.length || 0,
      });
      last = key;
    }
    maxIdeons = Math.max(maxIdeons, o.battle?.ideons?.length || 0);
    decisions.push(decision.action.key);
    g.act(decision.action);
    archive.record(
      runRecord(g, runId, "decision", {
        action: decision.action,
        controller: {
          kind: "ai",
          policy: policy.id,
          weights: policy.weights,
          reason: decision.reason,
        },
      }),
    );
  }
  if (step >= 12000) throw Error("Policy stalled: " + scenario);
  const replay = new Game(0, initial);
  for (const key of decisions) replay.act(key);
  const hash = (s) =>
    createHash("sha256").update(JSON.stringify(s)).digest("hex");
  if (hash(replay.save()) !== hash(g.save()))
    throw Error("Replay differs: " + scenario);
  const result = {
    scenario,
    seed,
    version: VERSION,
    fixture: g.s.evaluationFixture,
    policy: policy.id,
    outcome: g.s.mode === "reward" ? "victory" : g.s.outcome,
    mode: g.s.mode,
    hp: g.s.hp,
    steps: step,
    turn: g.s.battle?.turn,
    round: g.s.field.round,
    maxIdeons,
    damageTaken: g.s.stats.damageTaken,
    replayVerified: true,
    runId,
  };
  await fs.writeFile(
    dir + "/" + scenario + ".json",
    JSON.stringify(
      { result, initial, decisions, rounds, final: g.save() },
      null,
      2,
    ),
  );
  summary.push(result);
  console.log(JSON.stringify(result));
}
await fs.writeFile(dir + "/summary.json", JSON.stringify(summary, null, 2));
