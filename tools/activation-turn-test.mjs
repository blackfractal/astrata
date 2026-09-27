import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { VERSION } from "../src/content.mjs";
const g = new Game(10);
g.s.equipment = {};
g.s.inventory = [];
g.beginBattle([{ uid: g.uid(), enemy: "colossus", restless: 0 }]);
const b = g.s.battle;
b.grid[0] = [g.instance(g.newCard("blast"))];
b.hand = [];
b.phase = "activate";
b.channel = 2;
const profile = path.resolve(".tmp/activation-turn-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, height: 800, fast: true }),
);
const report = {
  version: VERSION,
  method:
    "Explicit packaged battle fixture with one Blast and surplus Channel, through two player turns",
  checks: [],
  errors: [],
};
const app = await electron.launch({
  executablePath: path.resolve("release/Astrata/Astrata.exe"),
  args: ["--user-data-dir=" + profile],
});
try {
  const page = await app.firstWindow();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.locator('[data-ui="continue"]').click();
  const button = page.locator('[data-activate-slot="0"]');
  await button.click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  assert.equal(await button.getAttribute("aria-disabled"), "true");
  assert.equal(
    await page.locator(".resources > span").nth(2).locator("b").textContent(),
    "1",
  );
  assert.match(
    await page.locator('[data-slot="0"] .nums').textContent(),
    /1\/2 acts.*Used this turn/,
  );
  const end = page.getByRole("button", { name: "End turn", exact: true });
  assert.ok(await end.evaluate((el) => el.classList.contains("next-choice")));
  await button.click({ force: true });
  assert.equal(
    await page.locator(".resources > span").nth(2).locator("b").textContent(),
    "1",
  );
  await fs.mkdir("reports/screenshots/activation-turn", { recursive: true });
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: "reports/screenshots/activation-turn/used-this-turn.png",
  });
  await page.locator('[data-slot="0"] .name').click();
  assert.match(
    await page.locator("#modal .card-facts").textContent(),
    /Per turnOnce/,
  );
  assert.equal(
    await page.locator("#modal [data-full-activate]").isDisabled(),
    true,
  );
  await page.keyboard.press("Escape");
  await end.click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  await page
    .getByRole("button", { name: "Begin activation", exact: true })
    .click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  assert.equal(await button.getAttribute("aria-disabled"), "false");
  assert.match(
    await page.locator('[data-slot="0"] .nums').textContent(),
    /1\/2 acts/,
  );
  await button.click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  assert.match(
    await page.locator('[data-slot="0"] .nums').textContent(),
    /0\/2 acts/,
  );
  assert.equal(await button.getAttribute("aria-disabled"), "true");
  report.checks.push(
    "Activation disables after one use despite remaining Channel and total allowance",
    "Used this turn is visible and Enemy arrow pulses",
    "Repeated click spends no further Channel",
    "Detail popup states once per turn and disables activation",
    "Next turn restores availability without restoring total uses",
    "Second-turn activation exhausts Blast's total two uses",
  );
  assert.deepEqual(report.errors, []);
} finally {
  await app.close();
}
await fs.writeFile(
  "reports/activation-turn-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
