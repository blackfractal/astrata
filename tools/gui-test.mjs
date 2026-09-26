import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
await fs.mkdir("reports/screenshots", { recursive: true });
const executablePath = path.resolve("release/Astrata/Astrata.exe"),
  args = ["--user-data-dir=" + path.resolve(".tmp/qa-profile-v2")];
let app = await electron.launch({ executablePath, args, timeout: 30000 }),
  page = await app.firstWindow();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.waitForSelector('[data-ui="new"]');
await page.screenshot({ path: "reports/screenshots/01-start.png" });
await page.locator('[data-ui="settings"]').click();
await page.locator("#resolution").selectOption("1280,800");
await page.locator('[data-ui="applySettings"]').click();
const reports = [];
let victory = false,
  saveVerified = false;
for (let attempt = 1; attempt <= 4 && !victory; attempt++) {
  await page.locator('[data-ui="new"]').click();
  if (await page.locator('[data-ui="newConfirmed"]').count())
    await page.locator('[data-ui="newConfirmed"]').click();
  await page
    .getByRole("button", { name: "Druid · Growth and pattern", exact: true })
    .click();
  await page.getByRole("button", { name: /into Bracelet/ }).click();
  await page
    .getByRole("button", { name: "Enter the Ashen Weald", exact: true })
    .click();
  if (attempt === 1) {
    await page.screenshot({ path: "reports/screenshots/02-first-field.png" });
    await page.locator('[data-ui="inventory"]').click();
    await page.screenshot({ path: "reports/screenshots/06-inventory.png" });
    await page.locator("[data-close]").first().click();
    await page.locator('[data-ui="grimoire"]').click();
    await page.screenshot({ path: "reports/screenshots/07-grimoire.png" });
    await page.locator("[data-close]").first().click();
  }
  await page.locator('[data-ui="botToggle"]').first().click();
  let captured = false;
  for (let i = 0; i < 200; i++) {
    if ((await page.locator(".mind").count()) && !captured) {
      await page.locator('[data-ui="botToggle"]').first().click();
      await page.screenshot({
        path: `reports/screenshots/03-battle-${attempt}.png`,
      });
      captured = true;
      if (!saveVerified) {
        await page.keyboard.press("Escape");
        await page.locator('[data-ui="quit"]').click();
        await app.process().once("exit", () => {});
        await app.close().catch(() => {});
        app = await electron.launch({ executablePath, args, timeout: 30000 });
        page = await app.firstWindow();
        page.on("pageerror", (e) => errors.push(e.message));
        await page.waitForSelector('[data-ui="continue"]');
        await page.locator('[data-ui="continue"]').click();
        await page.waitForSelector(".mind");
        const text = await page.locator(".section-head").first().textContent();
        if (!text.includes("Turn 1"))
          throw Error("Battle did not restart at turn 1");
        await page.screenshot({
          path: "reports/screenshots/08-battle-resumed.png",
        });
        saveVerified = true;
      }
      await page.locator('[data-ui="botToggle"]').first().click();
    }
    if (await page.locator('[data-ui="results"]').count()) break;
    await page.waitForTimeout(750);
  }
  const outcome = await page.locator("h1").textContent();
  await page.screenshot({
    path: `reports/screenshots/04-outcome-${attempt}.png`,
  });
  await page.locator('[data-ui="results"]').click();
  const result = await page.locator(".result").textContent();
  await page.screenshot({
    path: `reports/screenshots/05-results-${attempt}.png`,
    fullPage: true,
  });
  reports.push({ attempt, outcome, result });
  console.log("GRAPHICAL RUN", attempt, outcome, result.slice(0, 200));
  victory = outcome.includes("Complete");
  await page.locator('[data-ui="home"]').click();
  if (await page.locator('[data-ui="continue"]').count())
    throw Error("Finished save was not removed");
}
await page.locator('[data-ui="history"]').click();
await page.screenshot({ path: "reports/screenshots/09-run-history.png" });
await fs.writeFile(
  "reports/gui-verification.json",
  JSON.stringify(
    {
      executablePath,
      method:
        "Packaged Electron executable launched and operated through graphical Playwright controls; native OS helper unavailable",
      saveVerified,
      victory,
      errors,
      runs: reports,
    },
    null,
    2,
  ),
);
await app.close();
if (!victory || errors.length)
  throw Error("Graphical verification did not pass");
