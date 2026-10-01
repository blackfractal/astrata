import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { VERSION } from "../src/content.mjs";
const report = {
  package: JSON.parse(await fs.readFile("package.json", "utf8")).version,
  rules: VERSION.rules,
  checks: [],
  errors: [],
};
const dir = "reports/screenshots/charge-resources";
await fs.mkdir(dir, { recursive: true });
async function open(g, fast = true) {
  const profile = path.resolve(".tmp/charge-resources-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, height: 800, fast }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  const page = await app.firstWindow();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.locator('[data-ui="continue"]').click();
  return { app, page };
}
const settle = (page) =>
  page.waitForFunction(() => !document.querySelector(".presentation-bar"));
const counters = (page) =>
  page.locator(".resources > span > b").allTextContents();
for (const mode of ["normal", "fast", "skip", "reduced"]) {
  const g = new Game(8);
  g.s.mode = "field";
  g.s.equipment = {};
  Object.assign(g.s.field, {
    spawned: 32,
    round: 16,
    queue: [],
    entities: [
      { uid: 900, enemy: "bat", count: 1, x: 6, y: 5, restless: 0, born: 1 },
    ],
  });
  const { app, page } = await open(g, mode === "fast");
  try {
    await page.emulateMedia({
      reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
    });
    await page.evaluate(() => {
      window.insightSamples = [];
      const sample = () => {
        const el = document.querySelector(".resources > span > b");
        if (el) {
          const n = Number(el.textContent);
          if (window.insightSamples.at(-1) !== n) window.insightSamples.push(n);
        }
        requestAnimationFrame(sample);
      };
      sample();
    });
    await page.locator('[data-cell="61"]').click();
    if (
      await page
        .getByRole("button", { name: "Move here · start battle", exact: true })
        .isVisible()
    )
      await page
        .getByRole("button", { name: "Move here · start battle", exact: true })
        .click();
    if (mode === "skip") {
      await page.locator(".deal-card").first().waitFor();
      await page.locator("[data-skip]").click();
    }
    await settle(page);
    assert.deepEqual(await counters(page), ["0", "1", "2"]);
    const samples = await page.evaluate(() => window.insightSamples);
    if (mode === "normal")
      assert.ok(
        [4, 3, 2, 1, 0].every((n) => samples.includes(n)),
        JSON.stringify(samples),
      );
    report.checks.push(
      `${mode} Reveal: final counters 0/1/2; sampled Insight ${samples.join(",")}`,
    );
  } finally {
    await app.close();
  }
}
{
  const g = new Game(8);
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.focus = 0;
  b.channel = 2;
  b.hand = [];
  b.grid[0] = [g.instance(g.newCard("kiln"))];
  b.grid[4] = [g.instance(g.newCard("seed"))];
  const { app, page } = await open(g);
  try {
    for (const i of [0, 4]) {
      assert.match(
        await page.locator(`[data-activate-slot="${i}"]`).textContent(),
        /Charge 1\/3/,
      );
      await page.locator(`[data-activate-slot="${i}"]`).click();
      await settle(page);
      assert.equal(await page.locator(".targeting-bar").count(), 0);
      assert.equal(await page.locator("#modal").isVisible(), false);
    }
    assert.deepEqual(await counters(page), ["0", "0", "0"]);
    await page.screenshot({ path: dir + "/resources-spent.png" });
    await page.getByRole("button", { name: "End turn", exact: true }).click();
    await settle(page);
    assert.deepEqual(await counters(page), ["4", "1", "2"]);
    await page.screenshot({ path: dir + "/resources-refilled.png" });
    report.checks.push(
      "Kiln and Patient Seed charge with one click and no targeting; 0/0/0 becomes 4/1/2 while enemy defense is pending",
    );
  } finally {
    await app.close();
  }
}
{
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([
    { uid: 900, enemy: "beetle", restless: 0 },
    { uid: 901, enemy: "beetle", restless: 0 },
  ]);
  const b = g.s.battle;
  b.phase = "activate";
  b.hand = [];
  b.grid[0] = [g.instance(g.newCard("kiln"))];
  b.grid[0][0].charge = 2;
  for (const e of b.enemies) {
    e.hp = e.maxHp = 100;
    e.element = "Arcane";
  }
  const { app, page } = await open(g);
  try {
    assert.match(
      await page.locator('[data-activate-slot="0"]').textContent(),
      /Deal 30.*Burn 2 to all/,
    );
    await page.locator('[data-activate-slot="0"]').click();
    assert.equal(
      await page.locator('.enemy[data-target-choice="target"]').count(),
      2,
    );
    await page.locator('[data-enemy-uid="901"]').click();
    await settle(page);
    assert.match(
      await page.locator('[data-enemy-uid="900"]').textContent(),
      /100 \/ 100 HP/,
    );
    assert.match(
      await page.locator('[data-enemy-uid="901"]').textContent(),
      /70 \/ 100 HP/,
    );
    for (const uid of [900, 901])
      assert.match(
        await page.locator(`[data-enemy-uid="${uid}"]`).textContent(),
        /burn 2/i,
      );
    await page.screenshot({ path: dir + "/kiln-fired.png" });
    report.checks.push(
      "Charged Kiln requests one target, deals 30 only to that target, and visibly applies Burn 2 to both",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/charge-resources-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
