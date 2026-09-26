import fs from "node:fs/promises";
import { Game } from "../src/engine.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
import { VERSION } from "../src/content.mjs";
const count = Number(process.argv[2] || 5),
  first = Number(process.argv[3] || 41001),
  dir = process.argv[4] || "reports/evaluation";
await fs.mkdir(dir, { recursive: true });
const summary = [];
for (let i = 0; i < count; i++) {
  const seed = first + i,
    g = new Game(seed),
    policy = new WeightedPolicy(),
    log = [];
  const start = Date.now();
  for (let step = 0; step < 15000 && g.s.mode !== "result"; step++) {
    const o = g.observe(),
      legal = g.legal(),
      decision = policy.choose(o, legal);
    if (!decision)
      throw Error(
        "Nonterminal state without a legal action " + JSON.stringify(o),
      );
    log.push({
      step,
      mode: o.mode,
      round: o.field.round,
      turn: o.battle?.turn,
      hp: o.hp,
      action: decision.action,
      reason: decision.reason,
    });
    g.act(decision.action);
  }
  if (g.s.mode !== "result")
    throw Error("Policy stalled at " + g.s.mode + " seed " + seed);
  const result = {
    seed,
    version: VERSION,
    policy: policy.id,
    weights: policy.weights,
    outcome: g.s.outcome,
    cause: g.s.cause,
    hp: g.s.hp,
    rounds: g.s.field.round,
    steps: g.s.steps,
    elapsedMs: Date.now() - start,
    stats: g.s.stats,
    deck: g.s.deck,
    log,
  };
  await fs.writeFile(
    `${dir}/run-${seed}.json`,
    JSON.stringify(result, null, 2),
  );
  summary.push({ ...result, log: undefined, deck: undefined });
  console.log(
    seed,
    result.outcome,
    result.hp,
    result.rounds,
    result.steps,
    JSON.stringify(result.stats.encounters),
  );
}
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(summary, null, 2));
