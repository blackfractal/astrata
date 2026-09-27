import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = {
  package: "1.3.9",
  rules: "1.3.7",
  checks: [],
  errors: [],
  method:
    "Explicit packaged battle fixtures using real click and drag interactions",
};
await fs.mkdir("reports/screenshots/balance", { recursive: true });
function fixture() {
  const g = new Game(8);
  g.s.inventory = [];
  g.s.equipment = {};
  g.beginBattle([
    { uid: 900, enemy: "wolf", restless: 0 },
    { uid: 901, enemy: "firewolf", restless: 0 },
  ]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 2;
  b.hand = [];
  for (const [id, i] of [
    ["blast", 0],
    ["cinder", 1],
    ["water", 5],
    ["familiar", 10],
    ["sapling", 14],
  ])
    b.grid[i] = [g.instance(g.newCard(id))];
  b.grid[10][0].hp = 2;
  b.grid[14][0].hp = 5;
  b.grid[14][0].maxHp = 10;
  return g;
}
async function open(g) {
  const profile = path.resolve(".tmp/balance-" + Date.now());
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
  await page.locator('[data-ui="continue"]').click();
  return { app, page };
}
for (const mode of ["click", "drag"]) {
  const { app, page } = await open(fixture());
  try {
    const source = page.locator('[data-slot="0"]'),
      fire = page.locator('[data-slot="1"]'),
      target = page.locator('[data-enemy-uid="900"]');
    const health = page.locator('[data-slot="10"] .ally-health');
    const nameBounds = await page
        .locator('[data-slot="10"] .name')
        .boundingBox(),
      healthBounds = await health.boundingBox();
    assert.ok(
      nameBounds.y + nameBounds.height <= healthBounds.y + 1,
      "Health bar must not cover the Ally name",
    );
    assert.equal(await health.getAttribute("aria-valuenow"), "2");
    assert.equal(await health.getAttribute("aria-valuemax"), "6");
    assert.equal(
      await page
        .locator('[data-slot="14"] .ally-health')
        .getAttribute("aria-valuemax"),
      "10",
    );
    if (mode === "click") {
      await page.locator('[data-activate-slot="0"]').click();
      assert.equal(await page.locator("#modal").isVisible(), false);
      assert.equal(
        await page.locator('.slot[data-target-choice="element"]').count(),
        2,
      );
      await page.screenshot({
        path: "reports/screenshots/balance/attunement.png",
      });
      // Invalid click must neither inspect nor spend resources.
      await page.locator('[data-slot="10"]').click();
      assert.equal(await page.locator("#modal").isVisible(), false);
      assert.equal(
        await page
          .locator(".resources > span")
          .nth(2)
          .locator("b")
          .textContent(),
        "2",
      );
      await page.keyboard.press("Escape");
      assert.equal(await page.locator(".targeting-bar").count(), 0);
      assert.equal(await page.locator("#modal").isVisible(), false);
      await page.locator('[data-activate-slot="0"]').click();
      await fire.click();
      assert.equal(
        await page.locator('.enemy[data-target-choice="target"]').count(),
        2,
      );
      await page.screenshot({
        path: "reports/screenshots/balance/enemies.png",
      });
      await target.click();
    } else {
      await source.dragTo(fire);
      assert.equal(
        await page.locator('.enemy[data-target-choice="target"]').count(),
        2,
      );
      await source.dragTo(target);
    }
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    assert.match(await target.textContent(), /5 \/ 11 HP/);
    assert.match(
      await page.locator('[data-enemy-uid="901"]').textContent(),
      /11 \/ 11 HP/,
    );
    assert.equal(
      await page.locator(".resources > span").nth(2).locator("b").textContent(),
      "1",
    );
    assert.equal(await page.locator(".targeting-bar").count(), 0);
    assert.equal(await page.locator("#modal").isVisible(), false);
    assert.equal(
      await page
        .locator('[data-activate-slot="0"]')
        .getAttribute("aria-disabled"),
      "true",
    );
    report.checks.push(
      mode +
        ": choose Fire from an adjacent card, choose the correct enemy, spend one Channel, respect once-per-turn, no choice modal",
    );
  } finally {
    await app.close();
  }
}
{
  const g = fixture(),
    b = g.s.battle;
  b.grid[0] = [g.instance(g.newCard("aqua"))];
  b.grid[1] = [g.instance(g.newCard("familiar"))];
  b.grid[1][0].hp = 2;
  b.grid[5] = [g.instance(g.newCard("familiar"))];
  b.grid[5][0].hp = 3;
  const { app, page } = await open(g);
  try {
    await page.locator('[data-activate-slot="0"]').click();
    assert.equal(
      await page.locator('[data-target-choice="cardTarget"]').count(),
      2,
    );
    await page.locator('[data-slot="1"]').click();
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    assert.equal(
      await page
        .locator('[data-slot="1"] .ally-health')
        .getAttribute("aria-valuenow"),
      "6",
    );
    assert.equal(
      await page
        .locator('[data-slot="5"] .ally-health')
        .getAttribute("aria-valuenow"),
      "3",
    );
    assert.equal(await page.locator('[data-slot="0"] .name').count(), 0);
    assert.match(
      await page.locator('[data-ui="piles"]').textContent(),
      /Destroyed 1/,
    );
    await page.screenshot({
      path: "reports/screenshots/balance/healed-and-destroyed.png",
    });
    report.checks.push(
      "Healing card disappears into Destroyed immediately after the selected Ally recovers HP",
      "Healing selects the highlighted Ally directly and updates its life bar",
    );
  } finally {
    await app.close();
  }
}
{
  const g = fixture();
  g.s.battle.grid[0] = [g.instance(g.newCard("quicksilver"))];
  const { app, page } = await open(g);
  try {
    await page.locator('[data-activate-slot="0"]').click();
    await page.locator('[data-slot="10"]').click();
    assert.ok(
      await page
        .locator('[data-slot="11"]')
        .evaluate((el) => el.classList.contains("target-option")),
    );
    await page.locator('[data-slot="11"]').click();
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    assert.equal(
      await page.locator('[data-slot="10"] .ally-health').count(),
      0,
    );
    assert.equal(
      await page
        .locator('[data-slot="11"] .ally-health')
        .getAttribute("aria-valuenow"),
      "2",
    );
    report.checks.push(
      "Shift selects a card then a highlighted destination without a modal",
    );
  } finally {
    await app.close();
  }
}
{
  const g = fixture(),
    b = g.s.battle;
  b.grid[0] = [g.instance(g.newCard("transmute"))];
  b.grid[6] = [g.instance(g.newCard("blast"))];
  const { app, page } = await open(g);
  try {
    await page.locator('[data-activate-slot="0"]').click();
    await page.locator('[data-slot="1"]').click();
    await page
      .locator(".target-elements")
      .getByRole("button", { name: "Earth", exact: true })
      .click();
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    await page.locator('[data-activate-slot="6"]').click();
    await page.locator('[data-slot="1"]').click();
    assert.match(
      await page.locator(".targeting-bar strong").textContent(),
      /Earth/,
    );
    await page.locator('[data-enemy-uid="900"]').click();
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    assert.match(
      await page.locator('[data-enemy-uid="900"]').textContent(),
      /7 \/ 11 HP/,
    );
    assert.equal(await page.locator("#modal").isVisible(), false);
    report.checks.push(
      "Transmute chooses its new element inline; later attunement uses that element and displays it while targeting",
    );
  } finally {
    await app.close();
  }
}
{
  const g = fixture();
  g.s.hp = 20;
  g.s.battle.grid[0] = [g.instance(g.newCard("soothe"))];
  g.s.battle.grid[1] = [g.instance(g.newCard("shield"))];
  const { app, page } = await open(g);
  try {
    assert.match(
      await page.locator('[data-activate-slot="1"]').textContent(),
      /Shield 4/,
    );
    await page.locator('[data-slot="0"]').click();
    assert.match(
      await page.locator("#modal").textContent(),
      /Destroyed after activation/,
    );
    await page.keyboard.press("Escape");
    await page.locator('[data-activate-slot="0"]').click();
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    assert.equal(await page.locator('[data-slot="0"] .name').count(), 0);
    assert.match(
      await page.locator('[data-ui="piles"]').textContent(),
      /Destroyed 1/,
    );
    await page.screenshot({
      path: "reports/screenshots/balance/player-healed.png",
    });
    report.checks.push(
      "Shield shows base block 4; Soothe details explain destruction and its activation removes the card",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
report.checks.push(
  "Ally HP bars show current/peak health including grown Allies",
  "Invalid choices and Escape spend no Channel",
);
await fs.writeFile(
  "reports/balance-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
