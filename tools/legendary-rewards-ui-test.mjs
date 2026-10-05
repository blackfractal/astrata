import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards, VERSION } from "../src/content.mjs";
const report = { package: "2.1.6", version: VERSION, checks: [], errors: [] };
const g = new Game(91);
g.s.field.round = 16;
g.beginBattle([{ uid: g.uid(), enemy: "hart", restless: 0 }]);
g.s.battle.enemies[0].hp = 0;
g.checkBattle();
const offer = [...g.s.reward.cards],
  rng = g.s.rng;
const profile = path.resolve(".tmp/legendary-rewards-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
await fs.writeFile(
  profile + "/settings.json",
  JSON.stringify({ width: 1440, fast: true }),
);
await fs.mkdir("reports/screenshots/legendary-rewards", { recursive: true });
for (const pass of [0, 1]) {
  const app = await electron.launch({
    executablePath: path.resolve("node_modules/electron/dist/electron.exe"),
    args: [path.resolve("."), "--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    await p
      .getByRole("heading", { name: "Choose one boss reward", exact: true })
      .waitFor();
    const ids = await p
      .locator(".reward-option [data-inspect-card]")
      .evaluateAll((xs) => xs.map((x) => x.dataset.inspectCard));
    assert.deepEqual(ids, offer);
    assert.deepEqual(
      ids.map((id) => cards[id].rarity),
      ["legendary", "rare", "rare"],
    );
    assert.equal(
      await p.getByRole("button", { name: "Skip card", exact: true }).count(),
      0,
    );
    for (const id of ids) {
      assert.ok(["legendary", "rare"].includes(cards[id].rarity));
      const card = p.locator(`[data-inspect-card="${id}"]`);
      await card.locator("img").evaluate((img) => img.decode());
      assert.ok(
        await card.locator("img").evaluate((img) => img.naturalWidth > 0),
      );
      await card.click();
      assert.match(
        await p.locator("#modal").textContent(),
        new RegExp(cards[id].rarity),
      );
      await p
        .locator("#modal img")
        .first()
        .evaluate((img) => img.decode());
      await p.keyboard.press("Escape");
    }
    if (!pass) {
      await p.mouse.move(1, 1);
      await p.screenshot({
        path: "reports/screenshots/legendary-rewards/offer.png",
      });
      report.checks.push(
        "One Legendary and two Rare cards and full art/details render; no Skip; closing and resuming retains exact offer.",
      );
    } else {
      const chosen = offer[1];
      await p
        .locator(".reward-option")
        .filter({ has: p.locator('[data-inspect-card="' + chosen + '"]') })
        .getByRole("button", { name: "Choose this card", exact: true })
        .click();
      await p
        .getByRole("heading", { name: "A glimmer to keep", exact: true })
        .waitFor();
      const current = JSON.parse(
        await fs.readFile(profile + "/save.json", "utf8"),
      );
      assert.equal(current.reward.cards, null);
      assert.equal(
        current.deck.filter((c) => c.id === chosen).length,
        g.s.deck.filter((c) => c.id === chosen).length + 1,
      );
      report.checks.push(
        "Choosing a Rare adds exactly that card and advances to the Gem reward.",
      );
    }
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
report.offer = offer;
report.initialRng = rng;
await fs.writeFile(
  "reports/mixed-boss-reward-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
