import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { items, VERSION } from "../src/content.mjs";
const report = {
  version: VERSION,
  fixture:
    "Explicit cursed Field pickup saved with rules 1.2.0; both choices exercised in the packaged UI",
  checks: [],
  errors: [],
};
const id = Object.keys(items).find(
  (id) => items[id].cursed && items[id].slot !== "gem",
);
for (const choice of ["leave", "collect"]) {
  const g = new Game(23);
  g.s.mode = "field";
  g.s.field.round = 2;
  g.s.itemDeck = [id];
  g.s.field.entities = [{ uid: g.uid(), type: "Item", x: 5, y: 5 }];
  g.resolveTile();
  const saved = g.save();
  saved.version = { ...saved.version, rules: "1.2.0" };
  const profile = path.resolve(".tmp/pickup-" + choice + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(saved));
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
    await page
      .getByText("Collect or leave this item", { exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Leave item", exact: true })
      .waitFor();
    assert.equal(await page.locator(".catalog [data-action]").count(), 1);
    await fs.mkdir("reports/screenshots/pickup", { recursive: true });
    await page.screenshot({
      path: "reports/screenshots/pickup/" + choice + ".png",
      fullPage: true,
    });
    if (choice === "leave")
      await page
        .getByRole("button", { name: "Leave item", exact: true })
        .click();
    else await page.locator(".catalog [data-action]").click();
    await page.waitForFunction(() => !document.querySelector(".reward-rule"));
    const state = await page.evaluate(
      async () => (await window.desktop.load()).save,
    );
    assert.equal(state.mode, "field");
    assert.equal(state.itemOffer, undefined);
    const owned = state.inventory.find((x) => x.id === id);
    if (choice === "leave") {
      assert.equal(owned, undefined);
      assert.deepEqual(state.equipment, saved.equipment);
    } else {
      assert.ok(owned);
      assert.ok(Object.values(state.equipment).includes(owned.uid));
    }
    report.checks.push(
      choice === "leave"
        ? "Leave item is visible, exits the pickup, saves no item and applies no curse"
        : "Collect remains visible, adds the item, and applies its forced equipment",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/item-pickup-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
