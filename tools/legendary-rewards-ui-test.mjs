import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards, VERSION } from "../src/content.mjs";
const report = { package: "1.3.81", version: VERSION, checks: [], errors: [] };
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
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    await p
      .getByRole("heading", { name: "Choose one legendary card", exact: true })
      .waitFor();
    const ids = await p
      .locator(".reward-option [data-inspect-card]")
      .evaluateAll((xs) => xs.map((x) => x.dataset.inspectCard));
    assert.deepEqual(ids, offer);
    assert.equal(
      await p.getByRole("button", { name: "Skip card", exact: true }).count(),
      0,
    );
    for (const id of ids) {
      assert.equal(cards[id].rarity, "legendary");
      const card = p.locator(`[data-inspect-card="${id}"]`);
      await card.locator("img").evaluate((img) => img.decode());
      assert.ok(
        await card.locator("img").evaluate((img) => img.naturalWidth > 0),
      );
      await card.click();
      assert.match(await p.locator("#modal").textContent(), /legendary/);
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
        "All three legendary cards and full art/details render; no Skip; closing and resuming retains exact offer.",
      );
    } else {
      const save = JSON.parse(
        await fs.readFile(profile + "/save.json", "utf8"),
      );
      await p
        .locator('.reward-option').filter({ has: p.locator('[data-inspect-card="bastion"]') }).getByRole("button", { name: "Choose this card", exact: true })
        .click();
      await p.locator(".reward-choice button").first().click();
      await p.locator(".reward-choice button").first().click();
      await p
        .getByRole("button", { name: "Complete Stratum 1", exact: true })
        .click();
      await p
        .getByRole("heading", { name: "Stratum 1 Complete", exact: true })
        .waitFor();
      const current = JSON.parse(
        await fs.readFile(
          profile + "/runs/" + save.uiMeta.runId + "/latest.json",
          "utf8",
        ),
      );
      assert.equal(current.outcome, "win");
      assert.equal(current.deck.filter((c) => c.id === "bastion").length, 1);
      report.checks.push(
        "Selecting one legendary, collecting Gem/Setting and finishing v1 preserves the chosen legendary in the archived winning deck.",
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
  "reports/legendary-rewards-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
