import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const g = new Game(99);
g.s.gold = 500;
g.openTavern();
const profile = path.resolve(".tmp/store-check-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, height: 800, fast: true }),
);
const app = await electron.launch({
  executablePath: path.resolve("node_modules/electron/dist/electron.exe"),
  args: [".", "--user-data-dir=" + profile],
});
const errors = [];
try {
  const page = await app.firstWindow();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.locator('[data-ui="continue"]').click();
  await page.locator("[data-stock-view]").first().click();
  assert.ok(await page.locator("#modal .full-art").count());
  assert.ok(await page.locator("#modal [data-action]").count());
  await page.locator("[data-close]").click();
  await page.locator('[data-market-tab="sell"]').click();
  assert.ok(await page.locator("[data-owned-view]").count());
  await page.locator("[data-owned-view]").first().click();
  assert.ok(await page.locator("#modal .full-art").count());
  await page.locator("[data-close]").click();
  await page
    .getByText("Grimoire · one removal per Tavern", { exact: true })
    .click();
  assert.ok(await page.locator("[data-owned-card]").count());
  await page
    .getByRole("button", { name: /^Remove .*40 Gold$/ })
    .first()
    .click();
  await page
    .getByText("Grimoire · one removal per Tavern", { exact: true })
    .click();
  assert.equal(
    await page.getByRole("button", { name: /^Remove .*40 Gold$/ }).count(),
    0,
  );
  await page.screenshot({
    path: "reports/screenshots/polish/store-sell-remove.png",
    fullPage: true,
  });
  assert.equal(errors.length, 0);
  console.log(
    "Store View/Buy, owned View/Sell, card catalog and one-removal limit verified.",
  );
  await fs.writeFile(
    "reports/store-verification.json",
    JSON.stringify(
      {
        errors,
        viewBuy: true,
        viewSell: true,
        cardCatalog: true,
        oneRemoval: true,
      },
      null,
      2,
    ),
  );
} finally {
  await app.close();
}
