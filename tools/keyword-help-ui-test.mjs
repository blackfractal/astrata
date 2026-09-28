import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.15", checks: [], errors: [] };
const g = new Game(8);
g.s.equipment = {};
g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
const b = g.s.battle;
b.phase = "activate";
b.hand = [];
b.grid[0] = [g.instance(g.newCard("corner"))];
b.grid[0][0].lock = true;
b.grid[3] = [g.instance(g.newCard("shield"))];
b.grid[3][0].freeze = b.turn + 1;
b.grid[3][0].sever = true;
b.grid[5] = [g.instance(g.newCard("familiar"))];
b.enemies[0].hp = b.enemies[0].maxHp = 100;
b.enemies[0].element = "Arcane";
assert.ok(g.legal().some((a) => a.type === "activate" && a.slot === 0));
b.phase = "place";
assert.ok(!g.legal().some((a) => a.type === "recall" && a.slot === 0));
b.phase = "activate";
const profile = path.resolve(".tmp/keyword-help-" + Date.now());
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
const page = await app.firstWindow();
page.on("pageerror", (e) => report.errors.push(e.message));
async function hover(selector, pattern) {
  await page.locator(selector).first().hover();
  await page.locator("#hover-help:visible").waitFor();
  assert.match(await page.locator("#hover-help").textContent(), pattern);
}
try {
  await page.locator('[data-ui="continue"]').click();
  await hover(
    '[data-slot="0"] [data-card-status="Lock"]',
    /cannot be Recalled or Shifted.*CAN still activate/,
  );
  await fs.mkdir("reports/screenshots/keyword-help", { recursive: true });
  await page.screenshot({
    path: "reports/screenshots/keyword-help/locked.png",
  });
  await page.locator('[data-slot="0"] [data-card-status="Lock"]').click();
  await hover('#modal .card-facts [data-keyword="Lock"]', /CAN still activate/);
  await hover('#modal [data-keyword="Cornerstone"]', /grid corner/);
  await page.locator(".dialog-close").click();
  await hover('[data-slot="3"] [data-card-status="Freeze"]', /cannot activate/);
  await hover('[data-slot="3"] [data-card-status="Sever"]', /no adjacency/);
  await hover('.ally-health [data-keyword="HP"]', /Health points/);
  await page.locator("#hover-help").waitFor({ state: "hidden", timeout: 5500 });
  report.checks.push(
    "Locked/Frozen/Severed status labels and full card details explain their distinct rules; Ally HP hovers; help fades after four seconds.",
  );
  await page.locator('[data-activate-slot="0"]').click();
  await page.locator('[data-enemy-uid="900"]').click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  assert.match(
    await page.locator('[data-enemy-uid="900"]').textContent(),
    /91 \/ 100 HP/,
  );
  await hover(
    '[data-slot="0"] [data-card-status="Lock"]',
    /CAN still activate/,
  );
  assert.equal(
    await page
      .locator('[data-activate-slot="0"]')
      .getAttribute("aria-disabled"),
    "true",
  );
  report.checks.push(
    "Locked Corner Flame remains activatable, deals 9 damage, then obeys once-per-turn; click-to-inspect and targeting work through keyword wrappers.",
  );
  for (const menu of ["grimoire", "inventory", "pause"]) {
    await page.locator(`[data-ui="${menu}"]`).click();
    if (menu !== "pause") await page.locator("#modal .key").first().waitFor();
    await page.locator(".dialog-close").click();
  }
  report.checks.push("Top-level dialogs receive shared keyword annotations.");
  const fixture = await page.evaluate(async () => {
    const { glossary } = await import("./src/content.mjs");
    const { annotateKeywords } = await import("./src/keywords.mjs");
    const words = [
      ...Object.keys(glossary),
      "Locked",
      "Frozen",
      "Severed",
      "ATTUNEMENT",
      "Siphons",
      "Piercing",
      "Single-use",
    ];
    const root = document.createElement("section");
    root.id = "keyword-fixture";
    root.style.cssText =
      "position:fixed;inset:20px;z-index:80;background:#102217;overflow:auto";
    for (const word of words) {
      const p = document.createElement("p");
      p.textContent = word;
      root.append(p);
    }
    const original = root.textContent;
    document.body.append(root);
    await new Promise((r) => setTimeout(r, 100));
    const missing = [...root.children]
      .filter((p) => p.querySelectorAll("[data-keyword]").length !== 1)
      .map((p) => p.textContent);
    const count = root.querySelectorAll(".key").length;
    annotateKeywords(root);
    annotateKeywords(root);
    const intact =
      original === root.textContent &&
      count === root.querySelectorAll(".key").length &&
      !root.querySelector(".key .key");
    const p = document.createElement("p");
    p.id = "dynamic-keyword";
    p.textContent = "Unlockedness <script> Locked";
    root.append(p);
    await new Promise((r) => setTimeout(r, 100));
    const safe =
      !p.querySelector("script") && p.querySelectorAll(".key").length === 1;
    p.textContent = "Frozen";
    await new Promise((r) => setTimeout(r, 100));
    return {
      missing,
      intact,
      safe,
      dynamic: p.querySelector("[data-keyword]")?.dataset.keyword,
      count,
    };
  });
  assert.deepEqual(fixture.missing, []);
  assert.equal(fixture.intact, true);
  assert.equal(fixture.safe, true);
  assert.equal(fixture.dynamic, "Freeze");
  await hover('#dynamic-keyword [data-keyword="Freeze"]', /cannot activate/);
  await page.evaluate(() =>
    document.querySelector("#keyword-fixture").remove(),
  );
  assert.equal(await page.locator(".key .key").count(), 0);
  report.checks.push(
    `${fixture.count} glossary terms/aliases annotated, original text and safe markup preserved, dynamic replacement observed, repeated scans do not nest wrappers.`,
  );
  assert.deepEqual(report.errors, []);
  await fs.writeFile(
    "reports/keyword-help-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await app.close();
}
