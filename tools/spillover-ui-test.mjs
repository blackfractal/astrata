import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.12", rules: "1.3.9", checks: [], errors: [] };
const dir = "reports/screenshots/spillover";
await fs.mkdir(dir, { recursive: true });
for (const [name, second, expected] of [
  ["player", null, 59],
  ["weak", "Earth", 60],
  ["resistant", "Water", 63],
]) {
  const g = new Game(9);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "firewolf", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "enemy";
  b.jobs = [];
  b.hand = [];
  const first = g.instance(g.newCard("sapling"));
  first.hp = 2;
  b.grid[0] = [first];
  if (second) {
    const c = g.instance(g.newCard(second === "Water" ? "aqua" : "sapling"));
    c.hp = 2;
    b.grid[4] = [c];
  }
  b.reaction = {
    damage: 6,
    element: "Fire",
    stage: "ally",
    intercepted: [],
    name: "Fire Bite",
    source: 900,
  };
  const profile = path.resolve(".tmp/spillover-" + name + "-" + Date.now());
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
    await page.locator(".inspect-attack").click();
    assert.match(
      await page.locator("#modal").textContent(),
      /6 base damage continues \+ 1 bonus only against Earth/,
    );
    await page.locator("#modal [data-action]").first().click();
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    if (second) {
      assert.match(
        await page.locator(".incoming-attack").textContent(),
        /6 Fire base damage remaining \+ 1 weakness bonus against Earth/,
      );
      await page.locator(".inspect-attack").click();
      assert.match(
        await page.locator("#modal").textContent(),
        new RegExp(`${65 - expected} base damage continues`),
      );
      await page.screenshot({ path: `${dir}/${name}-preview.png` });
      await page.locator("#modal [data-action]").first().click();
      await page.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
    }
    assert.match(
      await page.locator(".player-portrait").textContent(),
      new RegExp(`${expected}/65 HP`),
    );
    await page.screenshot({ path: `${dir}/${name}-result.png` });
    report.checks.push(
      `6 Fire through 2-HP Earth${second ? " then 2-HP " + second : ""}: preview and actual player damage ${65 - expected}`,
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/spillover-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
