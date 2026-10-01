import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { VERSION } from "../src/content.mjs";
const report = {
  package: JSON.parse(await fs.readFile("package.json", "utf8")).version,
  rules: VERSION.rules,
  checks: [],
  errors: [],
};
const dir = "reports/screenshots/boss-balance";
await fs.mkdir(dir, { recursive: true });
const settle = (p) =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
for (const mode of ["cards", "purify"]) {
  const g = new Game(19);
  g.s.equipment = {};
  g.s.hp = g.s.maxHp = 999;
  g.beginBattle([{ uid: 900, enemy: "choir", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.hand = [];
  b.channel = 2;
  const e = b.enemies[0];
  e.hp = e.maxHp = 1000;
  const put = (id, i) => {
    const c = g.instance(g.newCard(id));
    b.grid[i].push(c);
    return c;
  };
  if (mode === "cards") {
    e.cycle = 1;
    put("ignis", 0);
    put("kiln", 1).charge = 1;
    put("conduit", 4);
  } else {
    e.cycle = 4;
    e.purifyPending = true;
    e.status = { burn: 3, poison: 2, corrode: 1 };
    put("ward", 0).ward = 35;
    put("kiln", 4);
    put("seed", 8);
    put("conduit", 12);
  }
  const profile = path.resolve(".tmp/boss-balance-" + mode + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, fast: true }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  const p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
  try {
    await p.locator('[data-ui="continue"]').click();
    await settle(p);
    if (mode === "cards") {
      assert.match(
        await p.locator('[data-activate-slot="1"]').textContent(),
        /Charge · 2 to fire/,
      );
      await p.locator('[data-slot="1"] .name').click();
      assert.match(
        await p.locator("#modal").textContent(),
        /Charge 1\/3 · 2 activation\(s\) to fire/,
      );
      await p.keyboard.press("Escape");
      assert.match(
        await p.locator('[data-activate-slot="4"]').textContent(),
        /Channel \+2/,
      );
      await p.locator('[data-activate-slot="4"]').click();
      await settle(p);
      assert.deepEqual(
        await p.locator(".resources > span > b").allTextContents(),
        ["0", "1", "3"],
      );
      await p.locator('[data-activate-slot="1"]').click();
      await settle(p);
      assert.equal(await p.locator(".targeting-bar").count(), 0);
      await p.locator('[data-slot="1"] .name').click();
      assert.match(
        await p.locator("#modal").textContent(),
        /Charge 2\/3 · 1 activation\(s\) to fire/,
      );
      await p.mouse.move(5, 5);
      await p.screenshot({ path: dir + "/kiln-charge.png" });
      report.checks.push(
        "One-Fire Kiln shows 2 activations to fire and separate 1/3 current charge; next click is targetless and gives 2/3 with 1 to fire. Conduit costs 1 and grants 2, taking Channel 2 to 3.",
      );
    } else {
      assert.match(
        await p.locator(".enemy .tell").textContent(),
        /Purify.*Remove Burn, Poison and Corrode/,
      );
      assert.equal(await p.locator(".grid-threat").count(), 0);
      await p.mouse.move(5, 5);
      await p.screenshot({ path: dir + "/purify-tell.png" });
      await p.getByRole("button", { name: "End turn", exact: true }).click();
      await settle(p);
      assert.match(
        await p.locator(".enemy .tell").textContent(),
        /Shatter Hymn/,
      );
      assert.match(
        await p.locator(".enemy .info").textContent(),
        /994 \/ 1000 HP/,
      );
      assert.doesNotMatch(
        await p.locator(".enemy .info").textContent(),
        /(?:burn|poison|corrode) [1-9]/i,
      );
      assert.deepEqual(
        await p
          .locator(".grid-threat")
          .evaluateAll((nodes) => nodes.map((n) => Number(n.dataset.slot))),
        [0, 4],
      );
      await p.locator('[data-slot="4"] .name').click();
      await p.getByRole("button", { name: /Recall slot 5 ·/ }).click();
      await settle(p);
      assert.deepEqual(
        await p
          .locator(".grid-threat")
          .evaluateAll((nodes) => nodes.map((n) => Number(n.dataset.slot))),
        [0, 8],
      );
      await p.mouse.move(5, 5);
      await p.screenshot({ path: dir + "/hymn-retarget.png" });
      report.checks.push(
        "Purify is a visible non-destructive tell; status ticks deal 6 before cleanse, all three counters clear, then Hymn forecasts Ward/Kiln and retargets Patient Seed after recalling Kiln.",
      );
    }
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/boss-balance-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
