import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const g = new Game(917231);
g.s.field.round = 1;
g.s.inventory = [];
for (const key of Object.keys(g.s.equipment)) g.s.equipment[key] = null;
g.beginBattle([{ uid: g.uid(), enemy: "beetle", restless: 0 }]);
const profile = path.resolve(".tmp/phase-arrows-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.save()));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, height: 800, fast: false }),
);
await fs.mkdir("reports/screenshots/phase-arrows", { recursive: true });
const report = {
  package: "1.2.2",
  rules: "1.2.1",
  fixture:
    "Seeded Bell Beetle battle, equipment removed to let enemy damage resolve without defensive choices",
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
  const activate = page.getByRole("button", {
    name: "Begin activation",
    exact: true,
  });
  const end = page.getByRole("button", { name: "End turn", exact: true });
  assert.equal(
    await page.locator(".phasebar .automatic[data-action]").count(),
    0,
  );
  assert.equal(
    await page.locator(".phasebar .active").textContent(),
    "2 · Placement",
  );
  assert.ok(await activate.isEnabled());
  assert.ok(await end.isDisabled());
  assert.equal(await page.locator(".phasebar button").count(), 2);
  assert.equal(
    await page
      .locator("button")
      .filter({ hasText: /^(Begin activation|End turn)$/ })
      .count(),
    0,
  );
  await page.screenshot({
    path: "reports/screenshots/phase-arrows/placement.png",
  });
  report.checks.push(
    "Automatic Reveal arrow is noninteractive; Placement arrow enabled, End arrow disabled; standalone text buttons removed",
  );
  await activate.click();
  await page.waitForFunction(
    () =>
      document.querySelector(".phasebar .active")?.textContent ===
      "3 · Activation",
  );
  assert.ok(await activate.isDisabled());
  assert.ok(await end.isEnabled());
  assert.ok((await end.getAttribute("class")).includes("next-choice"));
  await page.screenshot({
    path: "reports/screenshots/phase-arrows/activation.png",
  });
  report.checks.push(
    "Clicking forward enters Activation; previous arrow disabled; empty activation phase pulses the End arrow",
  );
  await end.click();
  await page.waitForSelector(".presentation-bar");
  assert.equal(await page.locator(".phasebar button:enabled").count(), 0);
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  assert.equal(
    await page.locator(".phasebar .active").textContent(),
    "2 · Placement",
  );
  await page.getByText("Battle · Turn 2", { exact: true }).waitFor();
  assert.ok(Number(await page.locator("header .hp").textContent()) < g.s.hp);
  report.checks.push(
    "End arrow runs the enemy turn, locks controls during presentation, and automatically reveals into next Placement",
  );
  await activate.focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () =>
      document.querySelector(".phasebar .active")?.textContent ===
      "3 · Activation",
  );
  report.checks.push("Focused phase arrow works with Enter");
  assert.deepEqual(report.errors, []);
} finally {
  await app.close();
}
await fs.writeFile(
  "reports/phase-arrow-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
