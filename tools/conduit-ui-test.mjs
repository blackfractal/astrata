import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.73", checks: [], errors: [] };
const g = new Game(4);
g.s.equipment = {};
g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
const b = g.s.battle;
b.phase = "activate";
b.channel = 20;
b.hand = [];
b.enemies[0].hp = b.enemies[0].maxHp = 100;
b.enemies[0].element = "Earth";
for (const [i, id] of [
  [7, "kiln"],
  [8, "shield"],
  [9, "familiar"],
  [10, "blast"],
  [16, "shield"],
])
  b.grid[i] = [g.instance(g.newCard(id))];
delete g.s.checkpoint;
const profile = path.resolve(".tmp/conduit-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.mkdir("reports/screenshots/conduit", { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, fast: true }),
);
const app = await electron.launch({
  executablePath: path.resolve("release/Astrata/Astrata.exe"),
  args: ["--user-data-dir=" + profile],
});
try {
  const p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
  const settle = () =>
    p.waitForFunction(() => !document.querySelector(".presentation-bar"));
  const slot = (i) => p.locator(`[data-slot="${i}"]`),
    control = (i) => p.locator(`[data-activate-slot="${i}"]`);
  const state = async () => {
    const s = JSON.parse(
      await fs.readFile(path.join(profile, "save.json"), "utf8"),
    );
    return JSON.parse(
      await fs.readFile(
        path.join(profile, "runs", s.uiMeta.runId, "latest.json"),
        "utf8",
      ),
    );
  };
  await p.locator('[data-ui="continue"]').click();
  await settle();
  await control(8).click();
  await slot(7).click();
  await p.locator("[data-target-activate]").click();
  await settle();
  assert.match(await control(9).textContent(), /Conduit/);
  await control(9).click();
  await slot(8).click();
  assert.equal(await slot(9).getAttribute("data-preview-element"), "Fire");
  await p.keyboard.press("Escape");
  assert.equal((await state()).battle.channel, 19);
  assert.equal(
    await p
      .locator('[data-from="9"][data-to="10"][data-link-type="synergy"]')
      .count(),
    0,
  );
  report.checks.push(
    "Canceled Conduit preview consumes nothing and provides no matching bonus.",
  );
  await slot(9).dragTo(slot(8));
  await p.locator("[data-target-activate]").click();
  await settle();
  assert.match(
    await slot(9).locator(".element-label").textContent(),
    /Conduit.*Fire/,
  );
  assert.equal(
    await p
      .locator('[data-from="9"][data-to="10"][data-link-type="synergy"]')
      .count(),
    1,
  );
  assert.match(await control(10).textContent(), /5/);
  await control(10).click();
  await slot(9).click();
  await slot(10).dragTo(p.locator('[data-enemy-uid="900"]'));
  await settle();
  assert.equal((await state()).battle.enemies[0].hp, 92);
  await control(16).click();
  await slot(9).click();
  await p.locator("[data-target-activate]").click();
  await settle();
  let s = await state();
  assert.equal(s.battle.shields[1].block, 5);
  assert.equal(s.battle.shields[1].element, "Fire");
  assert.equal(s.battle.channel, 16);
  report.checks.push(
    "Shield to Familiar to Blast/Shield attunement chain works through click and drag; matching bonus produces 8 Fire damage against Earth and 5 Fire block.",
  );
  await p.screenshot({ path: "reports/screenshots/conduit/chain.png" });
  await p.locator("button.phase-arrow.available").click();
  await settle();
  await slot(9).click();
  await settle();
  s = await state();
  // Bell Beetle's opening Earth hit is halved by Fire-attuned Familiar.
  assert.equal(s.battle.grid[9][0].hp, 4);
  assert.equal(s.hp, 70);
  assert.equal(s.battle.turn, 2);
  assert.doesNotMatch(
    await slot(9).locator(".element-label").textContent(),
    /Conduit/,
  );
  assert.equal(
    await p
      .locator('[data-from="9"][data-to="10"][data-link-type="synergy"]')
      .count(),
    0,
  );
  report.checks.push(
    "Clicking Familiar intercepts with its selected defensive element; HP and all temporary connections update at next turn.",
  );
  assert.deepEqual(report.errors, []);
  await fs.writeFile(
    "reports/conduit-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
} finally {
  await app.close();
}
