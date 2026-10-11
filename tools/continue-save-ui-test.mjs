import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";

// Only read the original profile; all UI writes go to a disposable copy.
const original = path.join(process.env.APPDATA, "astrata", "save.json");
const bytes = await fs.readFile(original);
const saved = JSON.parse(bytes);
const expected = new Game(0, saved).s;
const profile = path.resolve(`.tmp/continue-compatibility-${Date.now()}`);
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), bytes);
await fs.writeFile(path.join(profile, "settings.json"), JSON.stringify({ width: 1280, fast: true }));
const report = { oldVersion: saved.version, mode: saved.mode, errors: [] };
const app = await electron.launch({
  executablePath: path.resolve("release/Astrata/Astrata.exe"),
  cwd: path.resolve("release/Astrata"),
  args: ["--user-data-dir=" + profile],
});
try {
  const p = await app.firstWindow();
  p.on("pageerror", e => report.errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  await p.locator('[data-ui="continue"]').waitFor({ state: "detached" });
  if (saved.mode === "battle") await p.locator('[data-slot="0"]').waitFor();
  const updated = JSON.parse(await fs.readFile(path.join(profile, "save.json"), "utf8"));
  const resumed = JSON.parse(await fs.readFile(path.join(profile, "runs", updated.uiMeta.runId, "latest.json"), "utf8"));
  for (const key of ["hp", "gold", "rng", "mode", "stratum"])
    assert.deepEqual(resumed[key], expected[key], key);
  assert.deepEqual(resumed.battle, expected.battle);
  assert.deepEqual(report.errors, []);
  report.newVersion = resumed.version;
  report.hp = resumed.hp;
  report.turn = resumed.battle?.turn;
  report.enemies = resumed.battle?.enemies.map(e => e.name);
  report.continueWorks = true;
} finally {
  await app.close();
  assert.deepEqual(await fs.readFile(original), bytes, "Original save unchanged");
  report.originalSaveUnchanged = true;
  await fs.writeFile("reports/continue-save-ui-verification.json", JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify(report));
