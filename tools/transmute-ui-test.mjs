import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const g = new Game(8);
g.s.equipment = {};
g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
const b = g.s.battle;
b.phase = "activate";
b.channel = 10;
b.hand = [];
for (const [id, i] of [
  ["transmute", 9],
  ["blast", 6],
  ["thorn", 5],
])
  b.grid[i] = [g.instance(g.newCard(id))];
b.grid[5][0].element = "Fire";
b.enemies[0].element = "Fire";
b.enemies[0].hp = b.enemies[0].maxHp = 100;
const profile = path.resolve(".tmp/transmute-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, fast: true }),
);
const app = await electron.launch({
  executablePath: path.resolve("release/Astrata/Astrata.exe"),
  args: ["--user-data-dir=" + profile],
});
const page = await app.firstWindow();
const report = { package: "1.3.19", rules: "1.3.11", checks: [], errors: [] };
page.on("pageerror", (e) => report.errors.push(e.message));
const settle = () =>
  page.waitForFunction(() => !document.querySelector(".presentation-bar"));
try {
  await page.locator('[data-ui="continue"]').click();
  await page.locator('[data-activate-slot="9"]').click();
  await page.locator('[data-slot="6"].target-option').click();
  await page
    .locator(".target-elements")
    .getByRole("button", { name: "Water", exact: true })
    .click();
  await settle();
  assert.equal(
    await page.locator('[data-slot="6"] .name').textContent(),
    "Water Blast",
  );
  await page.locator('[data-slot="6"]').click();
  assert.match(
    await page.locator(".card-detail .eyebrow").textContent(),
    /Water · Spell/,
  );
  assert.match(
    await page.locator(".card-facts").textContent(),
    /Transmuted: Water \(replaces Attune\)/,
  );
  await fs.mkdir("reports/screenshots/transmute", { recursive: true });
  await page.screenshot({
    path: "reports/screenshots/transmute/water-details.png",
  });
  await page.locator(".dialog-close").click();
  await page.locator('[data-activate-slot="6"]').dblclick();
  await settle();
  assert.match(
    await page.locator('[data-enemy-uid="900"]').textContent(),
    /94 \/ 100 HP/,
  );
  await page.screenshot({
    path: "reports/screenshots/transmute/water-hit.png",
  });
  report.checks.push(
    "Actual on-board Transmute → Blast → Water updates the grid name and full details, overrides a Fire neighbor, and the sole-target double click deals 6 Water damage to Fire instead of 4 Arcane.",
  );
  assert.deepEqual(report.errors, []);
  await fs.writeFile(
    "reports/transmute-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await app.close();
}
