import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
const bot = new WeightedPolicy(),
  states = {};
for (
  let seed = 825183;
  seed < 825203 && (!states.field || !states.battle);
  seed++
) {
  const g = new Game(seed);
  for (let n = 0; n < 2000 && g.s.mode !== "result"; n++) {
    if (
      g.s.mode === "field" &&
      g.s.field.entities.some((e) => e.count > 1) &&
      g.s.field.queue.length === 8 &&
      !states.field
    )
      states.field = structuredClone(g.s);
    if (
      g.s.mode === "battle" &&
      g.s.battle.enemies.some((e) => e.id === "bat" && e.count === 3) &&
      !states.battle
    )
      states.battle = structuredClone(g.s);
    g.act(bot.choose(g.observe(), g.legal()).action);
  }
}
const report = {
  rules: "1.3.0",
  method:
    "Snapshots reached by the baseline policy from seeds 825183 onward, then opened through the packaged Continue UI",
  seeds: Object.fromEntries(
    Object.entries(states).map(([mode, state]) => [mode, state.seed]),
  ),
  checks: [],
  errors: [],
};
await fs.mkdir("reports/screenshots/pairs", { recursive: true });
for (const mode of ["field", "battle"]) {
  assert.ok(states[mode]);
  const profile = path.resolve(".tmp/pairs-" + mode + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(
    path.join(profile, "save.json"),
    JSON.stringify(states[mode]),
  );
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
    if (mode === "field") {
      assert.equal(await page.locator(".spawn-pair").count(), 4);
      const pairs = await page.locator(".spawn-pair > span").allTextContents();
      assert.deepEqual(
        pairs,
        Array.from({ length: 4 }, (_, i) =>
          states.field.field.queue.slice(i * 2, i * 2 + 2).join(" + "),
        ),
      );
      const entity = states.field.field.entities.find((e) => e.count > 1);
      const cell = page.locator(`[data-cell="${entity.y * 11 + entity.x}"]`);
      assert.ok(
        Number(await cell.locator(".count").textContent()) >= entity.count,
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollHeight <= innerHeight + 1,
        ),
      );
      report.checks.push(
        "Four ordered pairs exactly match public preview; grouped Field icon displays its count",
      );
    } else {
      assert.equal(await page.locator(".enemy-line .enemy").count(), 3);
      assert.equal(
        await page
          .locator(".resources > span")
          .nth(2)
          .locator("b")
          .textContent(),
        "2",
      );
      const ids = await page
        .locator(".enemy-line .enemy")
        .evaluateAll((xs) => xs.map((x) => x.dataset.enemyUid));
      assert.equal(new Set(ids).size, 3);
      await page.locator(".enemy-line .enemy").nth(1).click();
      await page
        .locator("#modal")
        .getByRole("heading", { name: "Bat 2", exact: true })
        .waitFor();
      await page.keyboard.press("Escape");
      report.checks.push(
        "Bat icon expands to three separately identified enemies; 2 Channel displayed; inspection opens the selected member",
      );
    }
    await page.mouse.move(0, 0);
    await page.screenshot({
      path: `reports/screenshots/pairs/${mode}.png`,
      fullPage: true,
    });
    const missing = await page
      .locator("img")
      .evaluateAll((xs) =>
        xs.filter((x) => !x.complete || !x.naturalWidth).map((x) => x.src),
      );
    assert.deepEqual(missing, []);
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/pairs-ui-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
