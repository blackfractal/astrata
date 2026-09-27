import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const g = new Game(3);
g.s.inventory = [];
for (const k of Object.keys(g.s.equipment)) g.s.equipment[k] = null;
g.beginBattle([{ uid: g.uid(), enemy: "colossus", restless: 0 }]);
for (const [id, slots] of [
  ["blast", [0, 1, 2]],
  ["shield", [10, 11, 12]],
])
  for (const slot of slots) g.s.battle.grid[slot] = [g.instance(g.newCard(id))];
g.s.battle.hand = [];
g.s.battle.phase = "activate";
const hp = g.s.battle.enemies[0].hp;
const profile = path.resolve(".tmp/adjacency-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, height: 800, fast: true }),
);
const report = {
  rules: "1.3.2",
  content: "1.1.2",
  method:
    "Explicit battle fixture with rows of three Blasts and three Shields, tested in packaged UI",
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
  for (const [slots, label] of [
    [[0, 1, 2], "Deal"],
    [[10, 11, 12], "Shield"],
  ]) {
    for (let i = 0; i < 3; i++)
      assert.equal(
        await page.locator(`[data-activate-slot="${slots[i]}"]`).textContent(),
        `Activate · ${label} ${[6, 7, 6][i]}`,
      );
  }
  await fs.mkdir("reports/screenshots/adjacency", { recursive: true });
  await page.mouse.move(0, 0);
  await page.screenshot({ path: "reports/screenshots/adjacency/bonuses.png" });
  await page.locator('[data-activate-slot="1"]').click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  assert.ok(
    (await page.locator(".enemy-line").textContent()).includes(
      `${hp - 7} / ${hp} HP`,
    ),
  );
  await page.locator('[data-activate-slot="11"]').click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  assert.equal(
    await page.locator(".resources > span").nth(2).locator("b").textContent(),
    "0",
  );
  assert.ok(
    await page
      .getByRole("button", { name: "End turn", exact: true })
      .evaluate((el) => el.classList.contains("next-choice")),
  );
  report.checks.push(
    "Both rows show live 6/7/6 base values",
    "Middle Blast deals 7 actual Arcane damage",
    "Middle Shield activates and both actions spend Channel",
    "Enemy arrow pulses at zero Channel",
  );
  assert.deepEqual(report.errors, []);
} finally {
  await app.close();
}
await fs.writeFile(
  "reports/adjacency-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
