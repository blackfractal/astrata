import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { Game } from "../src/engine.mjs";
const profile = path.resolve(".tmp/run-archive-ui-" + Date.now());
await fs.mkdir(profile, { recursive: true });
const old = [];
for (let i = 0; i < 12; i++) {
  const g = new Game(i + 1);
  g.finish(false, "History fixture");
  old.push({ ...g.observe(), runId: "old-" + i, realTimeMs: 1000 });
}
await fs.writeFile(path.join(profile, "history.json"), JSON.stringify(old));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, fast: true }),
);
const report = { package: "1.3.28", checks: [], errors: [] };
const app = await electron.launch({
  executablePath: path.resolve("release/Astrata/Astrata.exe"),
  args: ["--user-data-dir=" + profile],
});
const p = await app.firstWindow();
p.on("pageerror", (e) => report.errors.push(e.message));
const read = async (f) =>
  JSON.parse(await fs.readFile(path.join(profile, f), "utf8"));
try {
  await p.locator('[data-ui="history"]').click();
  assert.equal(await p.locator("[data-history]").count(), 12);
  assert.equal((await fs.readdir(path.join(profile, "runs"))).length, 12);
  assert.equal(
    (await read("runs/old-0/metadata.json")).versions[0].package,
    null,
  );
  await p.locator(".dialog-close").click();
  await p.locator('[data-ui="new"]').click();
  let save = await read("save.json"),
    id = save.uiMeta.runId;
  await p.locator("[data-action]").first().click();
  await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
  const events = (
    await fs.readFile(path.join(profile, "runs", id, "events.jsonl"), "utf8")
  )
    .trim()
    .split("\n")
    .map(JSON.parse);
  assert.equal(events[0].kind, "start");
  assert.equal(events[1].action.type, "chooseClass");
  assert.equal(events[1].controller.kind, "human");
  await p.locator('[data-ui="pause"]').click();
  await p.locator('[data-ui="abandon"]').click();
  await p.locator('[data-ui="abandonConfirmed"]').click();
  await p.locator('[data-ui="new"]').waitFor();
  assert.equal(
    (await read("runs/" + id + "/metadata.json")).status,
    "forfeited",
  );
  assert.equal(
    gunzipSync(
      await fs.readFile(path.join(profile, "runs", id, "events.jsonl.gz")),
    )
      .toString()
      .trim()
      .split("\n").length,
    3,
  );
  // Actual IPC result path: additive history, stable version and idempotent retries.
  const result = { ...old[0], runId: "new-result" };
  await p.evaluate(async (result) => {
    await window.desktop.result(result);
    await window.desktop.result(result);
  }, result);
  const history = await read("history.json");
  assert.equal(history.length, 13);
  assert.deepEqual(history.slice(0, 12), JSON.parse(JSON.stringify(old)));
  assert.equal(history.at(-1).packageVersion, "1.3.28");
  await p.locator('[data-ui="history"]').click();
  assert.equal(await p.locator("[data-history]").count(), 13);
  await p.locator('[data-history="12"]').click();
  assert.match(await p.locator(".result-title").textContent(), /Build 1.3.28/);
  report.checks.push(
    "Twelve preexisting completed results retained/imported; full history list accessible; missing historical package remains unknown.",
    "Actual New Game and human class choice create structured incremental records; Abandon removes Continue save but keeps compressed archive.",
    "Actual result IPC retains all prior results, adds package version and deduplicates repeated finalization; version visible in history details.",
  );
  assert.deepEqual(report.errors, []);
  await fs.writeFile(
    "reports/run-archive-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await app.close();
}
