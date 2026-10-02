import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { Game } from "../src/engine.mjs";
import { startTutorial, TUTORIAL } from "../src/tutorial.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
import { runRecord } from "../src/run-record.mjs";
const { createArchive } = createRequire(import.meta.url)("../run-archive.cjs");
const packageVersion = JSON.parse(
  await fs.readFile("package.json", "utf8"),
).version;
const sources = Object.fromEntries(
  await Promise.all(
    [
      "engine.mjs",
      "content.mjs",
      "tutorial.mjs",
      "policy.mjs",
      "death.mjs",
    ].map(async (n) => [n, await fs.readFile("src/" + n, "utf8")]),
  ),
);
const dir = "reports/tutorial-evaluation",
  archive = createArchive(dir, {
    packageVersion,
    sources,
    source: "headless-tutorial",
  });
const g = startTutorial(new Game(TUTORIAL.seed)),
  policy = new WeightedPolicy(),
  runId = randomUUID(),
  steps = [];
g.capturePresentation = true;
archive.record(runRecord(g, runId, "start"));
for (let i = 0; i < 500 && g.s.mode !== "result"; i++) {
  const lesson = g.s.tutorial.lesson,
    action =
      lesson === "independent"
        ? policy.choose(g.observe(), g.legal())?.action
        : g.legal()[0];
  if (!action) throw Error("No action: " + lesson);
  steps.push({
    lesson,
    action,
    hp: g.s.hp,
    gold: g.s.gold,
    remainingDamage: g.s.battle?.reaction?.damage,
  });
  g.act(action);
  archive.record(
    runRecord(g, runId, "decision", {
      action,
      controller: {
        kind: lesson === "independent" ? "ai" : "scripted-tutorial",
        policy: policy.id,
      },
    }),
  );
}
if (g.s.outcome !== "win") throw Error("Tutorial did not finish");
archive.result({ ...g.observe(), runId, packageVersion, policy: policy.id });
await fs.writeFile(
  dir + "/summary.json",
  JSON.stringify(
    {
      packageVersion,
      version: g.s.version,
      runId,
      outcome: g.s.outcome,
      steps,
      hp: g.s.hp,
      encounters: g.s.stats.encounters,
    },
    null,
    2,
  ),
);
console.log("Tutorial complete", steps.length, "decisions", g.s.hp, "HP");
