import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const profile = path.resolve(".tmp/corruption-retarget-" + Date.now());
await fs.mkdir(profile, { recursive: true });
const g = new Game(83);
g.s.stratum = 2;
g.beginBattle([{ uid: g.uid(), enemy: "seamstress", restless: 0 }]);
const b = g.s.battle;
b.corruptions = {};
b.enemies[0].corruptionPlan = [{ slot: 8, kind: "hole" }];
b.hand = [g.newCard("shield")];
b.focus = 1;
g.s.uiMeta = { runId: "retarget", elapsed: 0 };
await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
await fs.writeFile(
  profile + "/settings.json",
  JSON.stringify({ width: 1280, fast: true }),
);
const app = await electron.launch({
  executablePath: path.resolve("release/Astrata/Astrata.exe"),
  args: ["--user-data-dir=" + profile],
});
const report = { checks: [], errors: [] };
try {
  const p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  await p.locator('[data-slot="8"].corruption-mark').waitFor();
  await p
    .locator('[data-hand="' + b.hand[0].uid + '"]')
    .dragTo(p.locator('[data-slot="8"]'));
  await p.waitForFunction(
    () =>
      !document.querySelector('[data-slot="8"].corruption-mark') &&
      document.querySelector(".corruption-mark"),
  );
  const marks = await p
    .locator(".corruption-mark")
    .evaluateAll((els) => els.map((el) => Number(el.dataset.slot)));
  assert.equal(marks.length, 1);
  assert.notEqual(marks[0], 8);
  await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
  assert.equal(await p.locator('[data-slot="8"] .name').count(), 1);
  assert.match(
    await p
      .locator(".corruption-mark .corruption-foretell")
      .getAttribute("data-tooltip"),
    /Memory Hole/,
  );
  await fs.mkdir("reports/screenshots/loom", { recursive: true });
  await p.screenshot({ path: "reports/screenshots/loom/retarget.png" });
  report.checks.push(
    "Dragging Shield onto marked space removes old warning and shows the replacement before advancing phase.",
  );
  assert.deepEqual(report.errors, []);
} finally {
  await app.close();
}
await fs.writeFile(
  "reports/corruption-retarget-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
