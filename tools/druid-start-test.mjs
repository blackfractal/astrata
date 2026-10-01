import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { VERSION } from "../src/content.mjs";
const g = new Game(8);
g.s.mode = "field";
g.s.field.entities = [
  { uid: g.uid(), enemy: "bat", x: 6, y: 5, restless: 0, born: 1, count: 1 },
];
const profile = path.resolve(".tmp/druid-start-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, height: 800, fast: false }),
);
const report = {
  version: VERSION,
  method:
    "Unmodified Druid starter deck in explicit Field fixture, ordinary player movement into first battle",
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
  await page.locator('[data-cell="61"]').click();
  if (
    await page
      .getByRole("button", { name: "Move here · start battle", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Move here · start battle", exact: true })
      .click();
  await page.waitForSelector(".deal-card.face-down");
  assert.equal(await page.locator(".deal-card").count(), 4);
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  assert.equal(await page.locator("[data-hand]").count(), 4);
  const resources = await page.locator(".resources > span b").allTextContents();
  assert.deepEqual(resources, ["4", "1", "2"]);
  assert.ok(
    (await page.locator('[data-ui="piles"]').textContent()).includes(
      "Grimoire 8",
    ),
  );
  await fs.mkdir("reports/screenshots/druid-start", { recursive: true });
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: "reports/screenshots/druid-start/opening.png",
  });
  report.checks.push(
    "Four cards deal face down and reveal",
    "Opening resources display Insight 4 / Focus 1 / Channel 2",
    "Four cards in hand and eight remaining in Grimoire",
  );
  assert.deepEqual(report.errors, []);
} finally {
  await app.close();
}
await fs.writeFile(
  "reports/druid-start-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
