import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.10", rules: "1.3.8", checks: [], errors: [] };
const dir = "reports/screenshots/equipment-balance";
await fs.mkdir(dir, { recursive: true });
const g = new Game(8);
g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
const b = g.s.battle;
b.phase = "activate";
b.channel = 2;
b.hand = [];
for (const i of [0, 4]) b.grid[i] = [g.instance(g.newCard("blast"))];
const profile = path.resolve(".tmp/equipment-balance-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, height: 800, fast: true }),
);
const app = await electron.launch({
  executablePath: path.resolve("release/Astrata/Astrata.exe"),
  args: ["--user-data-dir=" + profile],
});
try {
  const page = await app.firstWindow();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.locator('[data-ui="continue"]').click();
  const ring = page.locator('[data-equip-slot="finger1"] .gear-item');
  assert.match(await ring.textContent(), /\+2 ready/);
  await ring.click();
  assert.match(
    await page.locator("#modal").textContent(),
    /first damaging attack activation.*2-damage/s,
  );
  await page.keyboard.press("Escape");
  await page.locator('[data-equip-slot="wrist1"] .gear-item').click();
  assert.match(await page.locator("#modal").textContent(), /Refill 2 block/);
  await page.keyboard.press("Escape");
  const enemy = page.locator('[data-enemy-uid="900"]');
  assert.match(await enemy.textContent(), /21 \/ 21 HP/);
  for (const [i, hp] of [
    [0, 15],
    [4, 11],
  ]) {
    await page.locator(`[data-activate-slot="${i}"]`).click();
    await enemy.click();
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    assert.match(await enemy.textContent(), new RegExp(`${hp} / 21 HP`));
    assert.match(await ring.textContent(), /Spent/);
  }
  const labelBounds = await ring.locator("span").boundingBox();
  const badgeBounds = await ring.locator(".ring-trigger").boundingBox();
  assert.ok(
    badgeBounds.y + badgeBounds.height <= labelBounds.y,
    "Ring status must not overlap its name",
  );
  await page.mouse.move(1800, 80);
  await page.screenshot({ path: dir + "/ring-spent.png" });
  report.checks.push(
    "Bronze description shows 2 block; Ring description shows first attack only; enemy starts at revised 21 HP",
    "First Blast deals 4 + 2, second deals only 4; Ring badge switches Ready to Spent",
  );
  await page.getByRole("button", { name: "End turn", exact: true }).click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  assert.match(
    await page.locator('[data-equip-slot="wrist1"] .block-left').textContent(),
    /2 block/,
  );
  await page.locator(".incoming-attack [data-action]").first().click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  assert.match(await ring.textContent(), /\+2 ready/);
  await page.screenshot({ path: dir + "/ring-refreshed.png" });
  report.checks.push(
    "Bracelet presents 2 block for the enemy attack; Ring refreshes on the next player turn",
  );
  assert.deepEqual(report.errors, []);
  await fs.writeFile(
    "reports/equipment-balance-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await app.close();
}
