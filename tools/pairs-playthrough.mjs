import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const profile = path.resolve(".tmp/pairs-playthrough-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(
  path.join(profile, "save.json"),
  JSON.stringify(new Game(825184).s),
);
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, height: 800, fast: true }),
);
const app = await electron.launch({
  executablePath: path.resolve("release/Astrata/Astrata.exe"),
  args: ["--user-data-dir=" + profile],
});
const errors = [];
const start = Date.now();
try {
  const page = await app.firstWindow();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.locator('[data-ui="continue"]').click();
  await page
    .getByRole("button", { name: "Druid · Growth and pattern", exact: true })
    .click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  await page.getByRole("button", { name: /into Bracelet/ }).click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  await page
    .getByRole("button", { name: "Enter the Ashen Weald", exact: true })
    .click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  await page.locator('[data-ui="botToggle"]').first().click();
  await page.waitForSelector('[data-ui="results"]', { timeout: 240000 });
  const outcome = await page.locator("h1").textContent();
  await page.screenshot({ path: "reports/screenshots/pairs/win.png" });
  assert.match(outcome, /Complete/);
  await page.locator('[data-ui="results"]').click();
  await page.screenshot({
    path: "reports/screenshots/pairs/results.png",
    fullPage: true,
  });
  const history = JSON.parse(
    await fs.readFile(path.join(profile, "history.json"), "utf8"),
  );
  assert.equal(history.length, 1);
  assert.equal(history[0].outcome, "win");
  assert.equal(history[0].seed, 825184);
  await page.locator('[data-ui="home"]').click();
  assert.equal(await page.locator('[data-ui="continue"]').count(), 0);
  await page.locator('[data-ui="history"]').click();
  assert.equal(await page.locator("[data-history]").count(), 1);
  assert.equal(errors.length, 0);
  const report = {
    rules: "1.3.0",
    seed: 825184,
    outcome,
    errors,
    wallMs: Date.now() - start,
    method:
      "Packaged executable, untouched seeded initial class-selection save, ordinary graphical choices then built-in Watch AI through full Stratum 1; no mid-run state injection or altered damage",
    hp: history[0].hp,
    rounds: history[0].field.round,
    historyVerified: true,
    finishedSaveDeleted: true,
  };
  await fs.writeFile(
    "reports/pairs-playthrough.json",
    JSON.stringify(report, null, 2),
  );
  console.log(report);
} finally {
  await app.close();
}
