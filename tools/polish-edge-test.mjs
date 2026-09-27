import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { cards } from "../src/content.mjs";
const checks = [],
  errors = [];
async function open(g, fast = false) {
  const profile = path.resolve(".tmp/polish-edge-" + Date.now());
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
  page.on("pageerror", (e) => errors.push(e.message));
  await page.locator('[data-ui="continue"]').click();
  return { app, page };
}
function battle() {
  const g = new Game(917231);
  g.s.field.round = 1;
  g.beginBattle([{ uid: g.uid(), enemy: "beetle", restless: 0 }]);
  return g;
}
const expensive = Object.values(cards).find(
  (c) => c.focus === 2 && !c.unplaceable,
).id;
{
  const g = battle();
  g.s.battle.focus = 0;
  g.s.battle.hand = [
    g.newCard("cinder"),
    g.newCard("blast"),
    g.newCard(expensive),
  ];
  const { app, page } = await open(g, true);
  try {
    assert.equal(await page.locator("[data-hand].unavailable").count(), 2);
    assert.equal(
      await page.locator('[data-hand][draggable="true"]').count(),
      1,
    );
    const from = page.locator('[data-hand][draggable="true"]'),
      to = page.locator('[data-slot="0"]');
    await from.dragTo(to);
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    assert.equal(
      await page.locator('[data-slot="0"] .name').textContent(),
      cards.cinder.name,
    );
    checks.push(
      "At 0 Focus only the zero-cost card is draggable; drag placement succeeds",
    );
    await page.screenshot({
      path: "reports/screenshots/polish/zero-focus.png",
    });
  } finally {
    await app.close();
  }
}
{
  const g = battle();
  g.s.battle.focus = 1;
  g.s.battle.hand = [g.newCard("blast"), g.newCard(expensive)];
  const { app, page } = await open(g, true);
  try {
    assert.equal(await page.locator("[data-hand].unavailable").count(), 1);
    checks.push(
      "At 1 Focus the 2-Focus card is gray while the 1-Focus card remains available",
    );
  } finally {
    await app.close();
  }
}
{
  const g = battle(),
    b = g.s.battle,
    c = g.instance(g.newCard("blast"));
  b.grid[0] = [c];
  b.phase = "activate";
  b.hand = [];
  b.enemies[0].hp = 1;
  const { app, page } = await open(g, false);
  try {
    const start = Date.now();
    await page.locator('[data-activate-slot="0"]').click();
    await page.waitForSelector(".disintegrating", { timeout: 10000 });
    assert.equal(await page.locator(".reward-rule").count(), 0);
    await page.screenshot({
      path: "reports/screenshots/polish/defeat-animation.png",
    });
    await page.waitForSelector(".reward-rule");
    assert.ok(Date.now() - start > 1500);
    checks.push(
      "Attack, damage and disintegration remain visible before the reward screen",
    );
  } finally {
    await app.close();
  }
}
{
  const g = battle(),
    b = g.s.battle,
    c = g.instance(g.newCard("blast"));
  c.used = 2;
  b.grid[0] = [c];
  b.phase = "activate";
  b.hand = [];
  b.channel = 10;
  const { app, page } = await open(g, true);
  try {
    assert.equal(
      await page
        .locator('[data-activate-slot="0"]')
        .getAttribute("aria-disabled"),
      "true",
    );
    assert.match(
      await page.locator('[data-slot="0"] .nums').textContent(),
      /0\/2/,
    );
    assert.equal(
      await page
        .getByRole("button", { name: "End turn", exact: true })
        .evaluate((el) => el.classList.contains("next-choice")),
      true,
    );
    checks.push(
      "Exhausted allowance stays visible with disabled activation and highlighted End Turn",
    );
  } finally {
    await app.close();
  }
}
{
  const g = new Game(47);
  g.s.mode = "field";
  g.s.field.round = 16;
  g.s.field.spawned = 16;
  g.s.field.moves = 0;
  g.s.field.entities = [
    { uid: g.uid(), enemy: "imp", x: 0, y: 0, restless: 0, born: 1 },
  ];
  const { app, page } = await open(g, false);
  try {
    await page.evaluate(() => {
      window.seenCells = [];
      new MutationObserver(() => {
        const x = document
          .querySelector("[data-token]")
          ?.closest("[data-cell]");
        if (x && !window.seenCells.includes(x.dataset.cell))
          window.seenCells.push(x.dataset.cell);
      }).observe(document.querySelector("#app"), {
        subtree: true,
        childList: true,
      });
    });
    await page
      .getByRole("button", { name: "End movement", exact: true })
      .click();
    await page.waitForSelector(".mind", { timeout: 10000 });
    const seen = await page.evaluate(() => window.seenCells);
    assert.ok(seen.length >= 5, JSON.stringify(seen));
    checks.push(
      "Hunter is shown moving cell-by-cell, including arrival on the player, before battle",
    );
  } finally {
    await app.close();
  }
}
assert.equal(errors.length, 0);
const result = {
  method:
    "Targeted packaged GUI scenarios, including explicit edge-case state fixtures; no claim these fixtures are full playthroughs",
  checks,
  errors,
};
await fs.writeFile(
  "reports/polish-edge-verification.json",
  JSON.stringify(result, null, 2),
);
console.log(result);
