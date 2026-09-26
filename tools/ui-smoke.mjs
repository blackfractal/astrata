import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
const app = await electron.launch({
  executablePath: path.resolve("release/Astrata/Astrata.exe"),
  args: [
    "--user-data-dir=" + path.resolve(".tmp/qa-human-controls-" + Date.now()),
  ],
  timeout: 30000,
});
const page = await app.firstWindow();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.waitForSelector('[data-ui="new"]');
await page.locator('[data-ui="settings"]').click();
await page.locator("#resolution").selectOption("1280,800");
await page.locator('[data-ui="applySettings"]').click();
await page.locator('[data-ui="new"]').click();
await page.keyboard.press("Enter");
await page.getByRole("button", { name: /into Bracelet/ }).click();
await page.keyboard.press("Enter");
let n = 0;
while (!(await page.locator(".mind").count()) && n++ < 150) {
  await page.locator('[data-ui="botStep"]').first().click();
}
if (!(await page.locator(".mind").count())) throw Error("No battle reached");
let placed = false;
for (const c of await page.locator("[data-hand]").all()) {
  await c.click();
  if (await page.locator(".slot.valid").count()) {
    await page.locator(".slot.valid").first().click();
    placed = true;
    break;
  }
}
if (!placed) throw Error("Could not place a card with mouse controls");
await page
  .getByRole("button", { name: "Begin activation", exact: true })
  .click();
let activated = false;
for (const slot of await page.locator(".slot:not(.empty)").all()) {
  await slot.click();
  const choice = page.locator(".sidebar [data-action]");
  if (await choice.count()) {
    await choice.first().click();
    activated = true;
    break;
  }
}
await page.screenshot({
  path: "reports/screenshots/10-final-battle-controls.png",
});
const missing = await page
  .locator("img")
  .evaluateAll((imgs) =>
    imgs.filter((i) => !i.complete || !i.naturalWidth).map((i) => i.src),
  );
const viewport = await page.evaluate(() => ({
  width: innerWidth,
  height: innerHeight,
  scroll: document.documentElement.scrollHeight,
}));
console.log({ placed, activated, missing, errors, viewport });
await fs.writeFile(
  "reports/manual-controls-verification.json",
  JSON.stringify({ placed, activated, missing, errors, viewport }, null, 2),
);
await app.close();
if (missing.length || errors.length) throw Error("Visual smoke test failed");
