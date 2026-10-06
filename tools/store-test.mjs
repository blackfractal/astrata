import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const g = new Game(99);
g.s.gold = 500;
g.openTavern();
g.s.shop.healer = true;
g.s.shop.stock = [
  "card:heat",
  g.s.startGem,
  "bronze",
  "curseRing",
  "card:rust",
  "curseGem",
];
const curse = g.addItem("curseRing");
const hex = g.addCard("rust");
const socketed = g.addItem("sapphire");
g.getItem(g.s.equipment.wrist2).gem = socketed.uid;
const spareSetting = g.addItem("bronze"),
  spareGem = g.addItem("ruby");
spareSetting.gem = spareGem.uid;
const profile = path.resolve(".tmp/store-check-" + Date.now());
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
const errors = [];
try {
  const page = await app.firstWindow();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.locator('[data-ui="continue"]').click();
  assert.deepEqual(await page.getByRole("tab").allTextContents(), [
    "Cards",
    "Gems",
    "Equipment",
  ]);
  assert.equal(await page.locator(".service-content details").count(), 0);
  assert.equal(await page.locator(".healer-only").count(), 1);
  assert.match(
    await page.locator(".healer-only").textContent(),
    /Requires a Tavern Healer to remove/,
  );
  assert.equal(await page.locator(".healer-only [data-action]").count(), 0);
  await page.getByRole("tab", { name: "Cards", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page
      .getByRole("tab", { name: "Gems", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  assert.equal(await page.locator(".healer-only").count(), 1);
  await page.getByRole("tab", { name: "Equipment", exact: true }).click();
  assert.equal(await page.locator(".healer-only").count(), 1);
  await page.locator(".healer-only [data-stock-view]").click();
  assert.equal(await page.locator("#modal [data-action]").count(), 0);
  await page.locator("[data-close]").click();
  await page.getByRole("tab", { name: "Cards", exact: true }).click();
  await page.locator("[data-stock-view]").first().click();
  assert.ok(await page.locator("#modal .full-art").count());
  assert.ok(await page.locator("#modal [data-action]").count());
  await page.locator("[data-close]").click();
  await page.getByRole("tab", { name: "Gems", exact: true }).click();
  await page.locator(".market-item:not(.healer-only) [data-action]").click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  assert.equal(
    await page
      .getByRole("tab", { name: "Gems", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  assert.equal(
    await page.locator(".market-item:not(.healer-only) [data-action]").count(),
    0,
  );
  await page.locator('[data-market-tab="sell"]').click();
  assert.deepEqual(await page.getByRole("tab").allTextContents(), [
    "Grimoire",
    "Equipment",
  ]);
  assert.equal(
    await page.locator(".market-equipped").count(),
    Object.values(g.s.equipment).filter(Boolean).length + 2,
  );
  const cursed = page.locator(`[data-catalog-item="${curse.uid}"]`);
  assert.ok(
    await cursed.evaluate(
      (e) =>
        e.classList.contains("healer-only") &&
        e.classList.contains("market-equipped"),
    ),
  );
  assert.equal(await cursed.locator("[data-action]").count(), 0);
  await cursed.locator("[data-owned-view]").click();
  assert.equal(
    await page
      .getByRole("button", { name: /^Remove Ring of the Ash Oath/ })
      .count(),
    0,
  );
  await page.locator("[data-close]").click();
  await page.mouse.move(5, 5);
  await page.screenshot({
    path: "reports/screenshots/polish/store-equipped-tabs.png",
    fullPage: true,
  });
  assert.ok(await page.locator("[data-owned-view]").count());
  await page.locator("[data-owned-view]").first().click();
  assert.ok(await page.locator("#modal .full-art").count());
  await page.locator("[data-close]").click();
  assert.equal(await page.locator(`[data-catalog-item="${socketed.uid}"]`).count(), 0);
  const braceletRow = page.locator(`[data-catalog-item="${g.s.equipment.wrist2}"]`);
  assert.equal(await braceletRow.locator(".fitted-gem").count(), 1);
  assert.match(await braceletRow.textContent(), /Equipped.*Socket: Sapphire/s);
  await braceletRow.locator("[data-action]").click();
  await braceletRow.waitFor({ state: "detached" });
  let state = JSON.parse(await fs.readFile(path.join(profile, "save.json"), "utf8"));
  assert.ok(!state.inventory.some((x) => [socketed.uid, g.s.equipment.wrist2].includes(x.uid)));
  await page.locator(`[data-catalog-item="${spareSetting.uid}"] [data-action]`).click();
  await page.locator(`[data-catalog-item="${spareSetting.uid}"]`).waitFor({ state: "detached" });
  assert.equal(await page.locator(`[data-catalog-item="${spareGem.uid}"]`).count(), 0);
  assert.equal(await page.getByRole("tab", { name: "Equipment", exact: true }).getAttribute("aria-selected"), "true");
  await page.getByRole("tab", { name: "Grimoire", exact: true }).click();
  assert.ok(await page.locator("[data-owned-card]").count());
  assert.equal(await page.locator(".healer-only [data-action]").count(), 0);
  assert.match(
    await page.locator(".healer-only").textContent(),
    /Requires a Tavern Healer/,
  );
  await page
    .getByRole("button", { name: /^Remove .*40 Gold$/ })
    .first()
    .click();
  await page.getByRole("tab", { name: "Grimoire", exact: true }).click();
  assert.equal(
    await page.getByRole("button", { name: /^Remove .*40 Gold$/ }).count(),
    0,
  );
  await page.screenshot({
    path: "reports/screenshots/polish/store-sell-remove.png",
    fullPage: true,
  });
  await page.locator('[data-tavern="grimoire"]').click();
  state = JSON.parse(
    await fs.readFile(path.join(profile, "save.json"), "utf8"),
  );
  assert.equal(
    await page.locator("[data-scribe-card]").count(),
    state.deck.length,
  );
  assert.equal(await page.getByRole("button", { name: /^Remove / }).count(), 0);
  assert.equal(
    await page.locator(".scribe-stock .healer-only [data-action]").count(),
    0,
  );
  const scribeRow = page
    .locator("[data-scribe-card]")
    .filter({ has: page.locator("[data-upgrade-preview]") })
    .first();
  await scribeRow.locator("[data-owned-card]").click();
  assert.ok(await page.locator("#modal .full-art").count());
  await page.locator("[data-close]").click();
  const upgradeUid = Number(await scribeRow.getAttribute("data-scribe-card"));
  await scribeRow.locator("[data-upgrade-preview]").first().hover();
  await page.locator("#hover-help:visible").waitFor();
  await page.screenshot({
    path: "reports/screenshots/polish/scribe-gallery.png",
    fullPage: true,
  });
  await scribeRow.locator("[data-upgrade-preview]").first().click();
  await page.waitForFunction(
    (uid) =>
      document
        .querySelector(`[data-scribe-card="${uid}"]`)
        ?.textContent.includes("Upgraded"),
    upgradeUid,
  );
  state = JSON.parse(
    await fs.readFile(path.join(profile, "save.json"), "utf8"),
  );
  assert.equal(state.deck.find((c) => c.uid === upgradeUid).upgrade, true);
  await page.locator('[data-tavern="healer"]').click();
  await page
    .getByRole("button", { name: /^Remove Ring of the Ash Oath/ })
    .click();
  await page.waitForFunction(
    () => !document.querySelector(".presentation-bar"),
  );
  assert.equal(
    await page
      .getByRole("button", { name: /^Remove Ring of the Ash Oath/ })
      .count(),
    0,
  );
  assert.equal(errors.length, 0);
  console.log(
    "Category tabs, keyboard navigation, actual Buy/Sell, equipped outlines, disabled cursed/Hex transactions, healer removal and one-card removal limit verified.",
  );
  await fs.writeFile(
    "reports/store-verification.json",
    JSON.stringify(
      {
        package: JSON.parse(await fs.readFile("package.json", "utf8")).version,
        categoryTabs: true,
        keyboardTabs: true,
        equippedOutlines: true,
        restrictedObjectsInspectable: true,
        healerOnlyRemoval: true,
        errors,
        viewBuy: true,
        viewSell: true,
        cardCatalog: true,
        oneRemoval: true,
        pairedSettingSale: true,
        settingSaleRemovesGem: true,
        scribeGalleryViewUpgrade: true,
      },
      null,
      2,
    ),
  );
} finally {
  await app.close();
}
