import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const g = new Game(99);
g.s.gold = 200;
g.openTavern();
const setting = g.getItem(g.s.equipment.wrist2),
  gem = g.addItem("sapphire");
setting.gem = gem.uid;
const profile = path.resolve(".tmp/settings-fees-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.mkdir("reports/screenshots/settings-fees", { recursive: true });
await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
await fs.writeFile(
  profile + "/settings.json",
  JSON.stringify({ width: 1280, fast: true }),
);
const app = await electron.launch({
  executablePath: path.resolve("node_modules/electron/dist/electron.exe"),
  args: [path.resolve("."), "--user-data-dir=" + profile],
});
const errors = [];
try {
  const p = await app.firstWindow();
  p.on("pageerror", (e) => errors.push(e.message));
  const saved = async () =>
    JSON.parse(await fs.readFile(profile + "/save.json", "utf8"));
  await p.locator('[data-ui="continue"]').click();
  await p.locator('[data-tavern="equipment"]').click();
  assert.match(
    await p.locator(".jeweler-fees").innerText(),
    /20 Gold.*35 Gold/,
  );
  await p
    .locator(`.tavern-service [data-setting-drag="${setting.uid}"]`)
    .dragTo(p.locator(".satchel-empty").first(), { force: true });
  await p.waitForTimeout(200);
  assert.equal((await saved()).gold, 180);
  assert.equal(
    (await saved()).inventory.find((x) => x.uid === setting.uid).gem,
    null,
  );
  await p
    .locator(`.satchel [data-item-uid="${gem.uid}"]`)
    .dragTo(p.locator(`.tavern-service .gear-item[data-item-uid="${setting.uid}"]`));
  await p.waitForTimeout(200);
  assert.equal((await saved()).gold, 160);
  await p
    .locator(`.tavern-service .gear-item[data-item-uid="${setting.uid}"]`)
    .dragTo(p.locator(".satchel-empty").first(), { force: true });
  const badge = p.locator(
    `.satchel [data-item-uid="${setting.uid}"] [data-fitted-gem="${gem.uid}"]`,
  );
  await badge.waitFor();
  assert.ok(
    await badge
      .locator("img")
      .evaluate((el) => el.complete && el.naturalWidth > 0),
  );
  assert.equal(
    (await saved()).inventory.find((x) => x.uid === setting.uid).gem,
    gem.uid,
  );
  await p.screenshot({ path: "reports/screenshots/settings-fees/satchel.png" });
  await p.locator('[data-tavern="market"]').click();
  await p.locator('[data-market-tab="sell"]').click();
  await p.locator('[data-market-category="Equipment"]').click();
  assert.equal(await p.locator(`[data-catalog-item="${gem.uid}"]`).count(), 0);
  const row = p.locator(`[data-catalog-item="${setting.uid}"]`);
  assert.equal(await row.locator(".fitted-gem").count(), 1);
  assert.match(
    await row.locator("[data-action]").innerText(),
    /Sapphire.*42 Gold/,
  );
  await p.screenshot({
    path: "reports/screenshots/settings-fees/paired-sale.png",
  });
  await row.locator("[data-action]").click();
  await p.waitForTimeout(200);
  assert.equal((await saved()).gold, 202);
  assert.ok(
    !(await saved()).inventory.some((x) =>
      [setting.uid, gem.uid].includes(x.uid),
    ),
  );
  assert.deepEqual(errors, []);
  await fs.writeFile(
    "reports/settings-fees-ui-verification.json",
    JSON.stringify(
      {
        checks: [
          "paid unsocket",
          "paid socket",
          "unequip retains visible Gem",
          "paired sale only",
          "combined payout and removal",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log("Settings UI verified");
} finally {
  await app.close();
}
