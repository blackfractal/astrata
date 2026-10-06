import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const report = { checks: [], errors: [] };
await fs.mkdir("reports/screenshots/tools", { recursive: true });
for (const scenario of ["field", "missing", "upgrade"]) {
  const g = new Game(92);
  g.s.stratum = 2;
  let elves;
  if (scenario === "field") {
    g.s.mode = "field";
    g.beginRound();
  } else {
    g.openTavern();
    g.s.gold = 100;
    elves = g.addCard("elves");
    if (scenario === "upgrade") g.addItem("tools");
  }
  const profile = path.resolve(".tmp/tools-ui-" + scenario + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1280, fast: true }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("node_modules/electron/dist/electron.exe"),
    args: [path.resolve("."), "--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    if (scenario === "field") {
      const supply = p.locator('[data-field-supply="tools"]');
      await supply.waitFor();
      await supply.click();
      await p.locator(".field-supply-preview").waitFor();
      assert.match(
        await p.locator(".field-supply-preview").innerText(),
        /A sturdy set of machinery tools/,
      );
      assert.ok(
        await p
          .locator(".field-supply-preview img")
          .evaluate((el) => el.complete && el.naturalWidth > 0),
      );
    } else {
      await p.locator('[data-tavern="grimoire"]').click();
      const card = p.locator('[data-scribe-card="' + elves.uid + '"]');
      await card.waitFor();
      await card.scrollIntoViewIfNeeded();
      assert.match(await card.innerText(), /Tools.*100 Gold/s);
      if (scenario === "missing") {
        assert.equal(await card.locator("button:disabled").count(), 1);
        assert.match(
          await card.locator("button:disabled").getAttribute("data-tooltip"),
          /Tools/,
        );
      } else {
        await card
          .getByRole("button", { name: /Upgrade Machine Elves/ })
          .click();
        await card
          .getByRole("button", { name: "Upgraded", exact: true })
          .waitFor();
        const saved = JSON.parse(
          await fs.readFile(profile + "/save.json", "utf8"),
        );
        assert.equal(saved.gold, 0);
        assert.ok(!saved.inventory.some((x) => x.id === "tools"));
        assert.ok(saved.deck.find((c) => c.uid === elves.uid).upgrade);
      }
    }
    await p.mouse.move(1900, 20);
    await p.screenshot({
      path: "reports/screenshots/tools/" + scenario + ".png",
    });
    report.checks.push(scenario);
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/tools-ui-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
