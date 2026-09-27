import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { VERSION } from "../src/content.mjs";
const report = {
  version: VERSION,
  checks: [],
  errors: [],
  method: "Explicit packaged inventory and battle fixtures",
};
await fs.mkdir("reports/screenshots/resonance-equipment", { recursive: true });
async function open(g) {
  const profile = path.resolve(".tmp/resonance-equipment-" + Date.now());
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
{
  const g = new Game(8);
  g.s.mode = "field";
  g.s.field.stage = "player";
  const uid = g.s.equipment.wrist1;
  const { app, page } = await open(g);
  try {
    await page.locator('[data-ui="inventory"]').click();
    assert.equal(await page.locator("#modal h2").textContent(), "Equipped");
    const satchel = page.locator("#modal .satchel");
    assert.equal(await satchel.locator(`[data-item-uid="${uid}"]`).count(), 0);
    await page
      .locator(`#modal [data-equip-slot="wrist1"] [data-item-uid="${uid}"]`)
      .dragTo(satchel);
    await page.locator(`#modal .satchel [data-item-uid="${uid}"]`).waitFor();
    assert.equal(
      await page
        .locator(`#modal .equipment-slots [data-item-uid="${uid}"]`)
        .count(),
      0,
    );
    await page
      .locator(`#modal .satchel [data-item-uid="${uid}"]`)
      .dragTo(page.locator('#modal [data-equip-slot="wrist1"]'));
    await page
      .locator(`#modal [data-equip-slot="wrist1"] [data-item-uid="${uid}"]`)
      .waitFor();
    assert.equal(await satchel.locator(`[data-item-uid="${uid}"]`).count(), 0);
    await page.screenshot({
      path: "reports/screenshots/resonance-equipment/inventory.png",
    });
    report.checks.push(
      "Equipped label replaces Belongings",
      "No equipped item duplicates in Satchel",
      "Real drag Equipped to Satchel unequips",
      "Real drag Satchel to Equipped re-equips",
      "Inventory remains open and refreshes after each drop",
    );
  } finally {
    await app.close();
  }
}
{
  const g = new Game(7);
  g.beginBattle([{ uid: g.uid(), enemy: "bat", restless: 0 }]);
  const b = g.s.battle;
  b.grid[0] = [g.instance(g.newCard("resonance"))];
  b.phase = "activate";
  b.channel = 0;
  b.hand = [];
  const { app, page } = await open(g);
  try {
    assert.equal(await page.locator(".slot.empty").first().textContent(), "");
    assert.equal(await page.locator(".slot .level").count(), 0);
    assert.equal(await page.locator(".slot").count(), 20);
    await page.locator('[data-activate-slot="0"]').click();
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    assert.equal(
      await page.locator(".resources > span").nth(2).locator("b").textContent(),
      "1",
    );
    assert.equal(
      await page
        .locator('[data-activate-slot="0"]')
        .getAttribute("aria-disabled"),
      "true",
    );
    await page.screenshot({
      path: "reports/screenshots/resonance-equipment/resonance-used.png",
    });
    await page.getByRole("button", { name: "End turn", exact: true }).click();
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    assert.equal(await page.locator('[data-slot="0"] img').count(), 0);
    assert.ok(
      (await page.locator('[data-ui="piles"]').textContent()).includes(
        "Destroyed 1",
      ),
    );
    report.checks.push(
      "Empty and occupied Mind Grid cells show no slot numbers",
      "Resonance activates at zero Channel for a net gain of one",
      "Resonance cannot activate again",
      "Resonance leaves the grid for Destroyed at turn end",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/resonance-equipment-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
