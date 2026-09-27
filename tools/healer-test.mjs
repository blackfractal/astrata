import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const checks = [],
  errors = [];
for (const kind of ["gold", "hp", "hpGold", "allyGold", "item"]) {
  const g = new Game(99);
  g.s.gold = 500;
  g.openTavern();
  g.s.shop.healer = true;
  g.s.shop.hexPrice = {
    kind,
    gold: ["gold", "hpGold", "allyGold"].includes(kind) ? 20 : 0,
    hp: ["hp", "hpGold"].includes(kind) ? 6 : 0,
  };
  g.addCard("bone");
  g.s.shop.removeUsed = true;
  const profile = path.resolve(".tmp/healer-" + kind + "-" + Date.now());
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
  try {
    const page = await app.firstWindow();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.locator('[data-ui="continue"]').click();
    for (const service of [
      "rest",
      "gossip",
      "grimoire",
      "equipment",
      "market",
      "healer",
    ]) {
      await page.locator(`[data-tavern="${service}"]`).click();
      assert.equal(errors.length, 0);
    }
    const cost = await page.locator(".treatment-cost").textContent();
    assert.match(cost, /Hex treatment/);
    const choice = page
      .getByRole("button", { name: /^Healer: remove Bone Lock/ })
      .first();
    assert.ok(await choice.count());
    const chosen = await choice.textContent();
    if (kind === "allyGold")
      await page.screenshot({
        path: "reports/screenshots/polish/healer.png",
        fullPage: true,
      });
    await choice.click();
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    assert.equal(
      await page
        .getByRole("button", { name: /^Healer: remove Bone Lock/ })
        .count(),
      0,
    );
    checks.push({ kind, cost, chosen });
  } finally {
    await app.close();
  }
}
assert.equal(errors.length, 0);
await fs.writeFile(
  "reports/healer-verification.json",
  JSON.stringify({ checks, errors }, null, 2),
);
console.log("All five packaged Healer payments verified.");
