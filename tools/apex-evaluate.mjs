import fs from "node:fs/promises";
import { apexFixture } from "./apex-fixture.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
import { VERSION } from "../src/content.mjs";
const dir = process.argv[2] || "reports/apex-evaluation";
await fs.mkdir(dir + "/sources", { recursive: true });
for (const file of await fs.readdir("src"))
  if (file.endsWith(".mjs"))
    await fs.copyFile("src/" + file, dir + "/sources/" + file);
const summary = [];
for (const kind of ["ascent", "predator"])
  for (let i = 0; i < 5; i++) {
    const seed = 84001 + i,
      g = apexFixture(seed, kind === "predator" ? 4 : 1),
      policy = new WeightedPolicy(),
      actions = [];
    if (kind === "predator")
      g.act(g.legal().find((a) => a.type === "fightApex"));
    const name = kind + "-" + seed;
    await fs.writeFile(dir + "/" + name + "-initial.json", JSON.stringify(g.s));
    const start = Date.now();
    let error = null;
    try {
      for (let step = 0; step < 12000 && g.s.mode !== "result"; step++) {
        const o = g.observe(),
          decision = policy.choose(o, g.legal());
        if (!decision) throw Error("No decision in " + g.s.mode);
        actions.push({
          step,
          mode: g.s.mode,
          floor: g.s.apex?.floor,
          round: g.s.field.round,
          turn: g.s.battle?.turn,
          hp: g.s.hp,
          action: decision.action,
          reason: decision.reason,
        });
        g.act(decision.action);
      }
    } catch (e) {
      error = e.stack;
    }
    const result = {
      kind,
      seed,
      version: VERSION,
      fixture: g.s.evaluationFixture,
      policy: policy.id,
      outcome: g.s.outcome || g.s.mode,
      floor: g.s.apex?.floor,
      hp: g.s.hp,
      cause: g.s.cause,
      death: g.s.death,
      steps: actions.length,
      elapsedMs: Date.now() - start,
      error,
    };
    summary.push(result);
    await fs.writeFile(
      dir + "/" + name + ".json",
      JSON.stringify({ result, actions, final: g.s }),
    );
    console.log(JSON.stringify(result));
    await fs.writeFile(dir + "/summary.json", JSON.stringify(summary, null, 2));
  }
if (summary.some((r) => r.error || !["win", "loss"].includes(r.outcome)))
  process.exitCode = 1;
