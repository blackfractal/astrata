import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";

const g = new Game(83);
g.s.stratum = 2;
g.beginBattle(["dewThief", "frayedHound", "looseEcho"].map(enemy => ({ uid: g.uid(), enemy, restless: 0 })));
g.s.battle.enemies[2].cycle = 1;
g.s.battle.phase = "activate";
const profile = path.resolve(".tmp/stratum2-sequences-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
await fs.writeFile(profile + "/settings.json", JSON.stringify({ width: 1280, fast: true }));
const app = await electron.launch({
  executablePath: path.resolve("node_modules/electron/dist/electron.exe"),
  args: [path.resolve("."), "--user-data-dir=" + profile],
});
const report = { errors: [], tells: [] };
try {
  const p = await app.firstWindow();
  p.on("pageerror", err => report.errors.push(err.message));
  await p.locator('[data-ui="continue"]').click();
  await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
  for (const [id, expected] of [["dewThief", "4 Water → 3 Wind"], ["frayedHound", "6 Fire → 6 Wind"], ["looseEcho", "5 Light → 4 Chaos"]]) {
    const tell = await p.locator(`[data-enemy="${id}"] .tell`).innerText();
    assert.ok(tell.includes(expected), tell);
    report.tells.push({ id, tell });
  }
  await fs.mkdir("reports/screenshots/stratum2-sequences", { recursive: true });
  await p.screenshot({ path: "reports/screenshots/stratum2-sequences/intents.png" });
  assert.deepEqual(report.errors, []);
  await fs.writeFile("reports/stratum2-sequences-ui-verification.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally { await app.close(); }
