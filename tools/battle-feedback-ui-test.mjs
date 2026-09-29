import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.18", checks: [], errors: [] },
  dir = "reports/screenshots/battle-feedback";
await fs.mkdir(dir, { recursive: true });
async function open(g) {
  const profile = path.resolve(".tmp/battle-feedback-" + Date.now());
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
const settle = (p) =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
function put(g, id, i) {
  return (g.s.battle.grid[i] = [g.instance(g.newCard(id))])[0];
}
{
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([
    { uid: 900, enemy: "bat", restless: 0 },
    { uid: 901, enemy: "beetle", restless: 0 },
    { uid: 902, enemy: "beetle", restless: 0 },
  ]);
  const b = g.s.battle;
  b.phase = "place";
  b.focus = 2;
  b.channel = 2;
  put(g, "thorn", 6);
  put(g, "shield", 5);
  b.hand = [g.instance(g.newCard("shield"))];
  const status = put(g, "sapling", 19);
  status.lock = true;
  status.freeze = b.turn + 1;
  status.sever = true;
  status.status = { burn: 2, poison: 3, corrode: 1 };
  for (const e of b.enemies) e.hp = e.maxHp = 100;
  b.enemies[1].element = "Fire";
  b.enemies[2].element = "Arcane";
  const { app, page } = await open(g);
  try {
    assert.match(await page.locator(".resource-active").textContent(), /Focus/);
    assert.equal(
      await page.locator('[data-slot="6"] .damage-value').textContent(),
      "6",
    );
    await page.locator("[data-hand]").dragTo(page.locator('[data-slot="7"]'));
    await settle(page);
    assert.equal(
      await page.locator('[data-slot="6"] .damage-value').textContent(),
      "8",
    );
    for (const status of [
      "Lock",
      "Freeze",
      "Sever",
      "Burn",
      "Poison",
      "Corrode",
    ]) {
      await page.locator(`[data-card-status="${status}"]`).hover();
      await page.locator("#hover-help:visible").waitFor();
      assert.match(
        await page.locator("#hover-help").textContent(),
        new RegExp(
          status === "Lock"
            ? "Locked"
            : status === "Freeze"
              ? "Frozen"
              : status === "Sever"
                ? "Severed"
                : status,
        ),
      );
    }
    await page.screenshot({ path: dir + "/statuses-placement.png" });
    const fits = await page
      .locator('[data-slot="19"]')
      .evaluate(
        (el) =>
          el.querySelector(".card-statuses").getBoundingClientRect().bottom <=
          el.querySelector(".slot-activate").getBoundingClientRect().top,
      );
    assert.equal(fits, true);
    assert.equal(
      await page
        .locator('[data-slot="19"]')
        .evaluate(
          (el) =>
            el.querySelector(".nums").getBoundingClientRect().top >=
            el.querySelector(".card-statuses").getBoundingClientRect().bottom,
        ),
      true,
    );
    await page
      .getByRole("button", { name: "Begin activation", exact: true })
      .click();
    await settle(page);
    assert.match(
      await page.locator(".resource-active").textContent(),
      /Channel/,
    );
    const source = page.locator('[data-slot="6"]'),
      box = await source.boundingBox();
    const start = { x: box.x + 25, y: box.y + 15 };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 15, start.y + 5, { steps: 5 });
    for (const [uid, expected, cls] of [
      [900, "12 (+4)", "damage-up"],
      [901, "4 (-4)", "damage-down"],
      [902, "8", ""],
    ]) {
      const r = await page.locator(`[data-enemy-uid="${uid}"]`).boundingBox();
      await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2, {
        steps: 12,
      });
      await page.mouse.move(r.x + r.width / 2 + 2, r.y + r.height / 2);
      await page.waitForFunction(
        ({ expected }) =>
          document.querySelector('[data-slot="6"] .damage-value')
            ?.textContent === expected,
        { expected },
      );
      assert.equal(await page.locator(".target-damage-preview").count(), 1);
      if (cls)
        assert.ok(
          (
            await page
              .locator('[data-slot="6"] .damage-value')
              .getAttribute("class")
          ).includes(cls),
        );
      if (uid === 900)
        await page.screenshot({ path: dir + "/drag-strong.png" });
    }
    await page.mouse.move(12, 100, { steps: 10 });
    await page.mouse.up();
    assert.equal(
      await page.locator('[data-slot="6"] .damage-value').textContent(),
      "8",
    );
    assert.equal(await page.locator(".target-damage-preview").count(), 0);
    assert.equal(
      await page.locator(".resources > span > b").nth(2).textContent(),
      "2",
    );
    await page.keyboard.press("Escape");
    await page.locator('[data-activate-slot="6"]').click();
    await page.locator('[data-enemy-uid="900"]').hover();
    assert.equal(
      await page.locator('[data-slot="6"] .damage-value').textContent(),
      "12 (+4)",
    );
    await page.locator('[data-enemy-uid="900"]').click();
    await settle(page);
    assert.match(
      await page.locator('[data-enemy-uid="900"]').textContent(),
      /88 \/ 100 HP/,
    );
    assert.equal(
      await page.locator('[data-slot="6"] [data-card-status="Used"]').count(),
      1,
    );
    assert.equal(
      await page.locator('[data-slot="6"] .damage-value').textContent(),
      "8",
    );
    await page.getByRole("button", { name: "End turn", exact: true }).click();
    await settle(page);
    assert.equal(await page.locator(".resource-active").count(), 0);
    report.checks.push(
      "Focus/Channel highlight switches by phase and turns off during enemy defense; Thorn Choir updates 6→8 on real placement drag; all six adverse badges explain themselves and fit above controls.",
    );
    report.checks.push(
      "Real held drag previews 12 (+4) green / 4 (-4) red / 8 neutral across three enemies, resets on canceled drop without spending Channel; click-target preview commits exactly 12 damage, then shows Used badge.",
    );
  } catch (e) {
    await page.screenshot({ path: dir + "/failure.png" });
    throw e;
  } finally {
    await app.close();
  }
}
{
  const g = new Game(8);
  g.openTavern();
  g.s.gold = 500;
  const { app, page } = await open(g);
  try {
    await page.locator('[data-tavern="grimoire"]').click();
    const offer = page
      .locator("[data-upgrade-preview]")
      .filter({ hasText: "Upgrade Shield" })
      .first();
    await offer.locator('[data-keyword="Shield"]').hover();
    await page.locator("#hover-help:visible").waitFor();
    assert.match(
      await page.locator("#hover-help").textContent(),
      /Shield 4 → 7/,
    );
    await page.screenshot({ path: dir + "/upgrade.png" });
    report.checks.push(
      "Hovering an upgrade offer, including its nested Shield keyword, explains its specific benefit (4→7 block).",
    );
  } finally {
    await app.close();
  }
}
{
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
  const { app, page } = await open(g);
  try {
    await page.evaluate(() => {
      window.resourcePhases = [];
      function sample() {
        const name =
          document
            .querySelector(".resource-active")
            ?.textContent.replace(/[0-9]/g, "")
            .trim() || "none";
        if (window.resourcePhases.at(-1) !== name)
          window.resourcePhases.push(name);
        requestAnimationFrame(sample);
      }
      sample();
    });
    await page.locator('[data-cell="61"]').click();
    await settle(page);
    const phases = await page.evaluate(() => window.resourcePhases);
    assert.ok(
      phases.some((x) => x === "Insight"),
      JSON.stringify(phases),
    );
    assert.match(await page.locator(".resource-active").textContent(), /Focus/);
    report.checks.push(
      "Reveal animation highlights Insight, then switches to Focus after the last reveal.",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/battle-feedback-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
