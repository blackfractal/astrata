import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.72", checks: [], errors: [] };
await fs.mkdir("reports/screenshots/sapling", { recursive: true });
for (const initial of [4, 9, 25]) {
  const g = new Game(9);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 2;
  b.hand = [];
  b.enemies[0].hp = b.enemies[0].maxHp = 100;
  for (const [slot, id] of [
    [16, "sapling"],
    [9, "clear"],
    [15, "shield"],
    [17, "shield"],
  ])
    b.grid[slot] = [g.instance(g.newCard(id))];
  b.grid[16][0].hp = initial;
  b.grid[16][0].maxHp = initial;
  if (initial === 25) g.s.version = { ...g.s.version, rules: "1.3.39" };
  delete g.s.checkpoint;
  const profile = path.resolve(".tmp/sapling-ui-" + initial + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1440, fast: true }),
  );
  let app;
  try {
    app = await electron.launch({
      executablePath: path.resolve("release/Astrata/Astrata.exe"),
      args: ["--user-data-dir=" + profile],
    });
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    const slot = p.locator('[data-slot="16"]');
    const hp = Math.min(initial, 10),
      gain = Math.min(3, 10 - hp);
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    assert.match(
      await slot.locator(".slot-activate").innerText(),
      new RegExp(`Deal ${hp}.*→ \\+${gain} HP`),
    );
    assert.equal(
      await slot.locator('[role="meter"]').getAttribute("aria-valuemax"),
      "10",
    );
    assert.equal(
      await slot.locator('[role="meter"]').getAttribute("aria-valuenow"),
      String(hp),
    );
    const links = p.locator('[data-to="16"][data-link-type="benefit"]');
    assert.equal(await links.count(), gain > 0 ? 3 : 0);
    if (initial === 4)
      await p.screenshot({ path: "reports/screenshots/sapling/before.png" });
    await slot.dragTo(p.locator('[data-enemy-uid="900"]'));
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    await p.waitForTimeout(150);
    const save = JSON.parse(await fs.readFile(profile + "/save.json", "utf8"));
    const state = JSON.parse(
      await fs.readFile(
        profile + "/runs/" + save.uiMeta.runId + "/latest.json",
        "utf8",
      ),
    );
    assert.equal(state.battle.enemies[0].hp, 100 - hp);
    assert.equal(state.battle.grid[16][0].hp, hp + gain);
    assert.equal(
      await slot.locator('[role="meter"]').getAttribute("aria-valuenow"),
      String(hp + gain),
    );
    if (initial === 4)
      await p.screenshot({ path: "reports/screenshots/sapling/after.png" });
    report.checks.push({
      initialHp: initial,
      loadedHp: hp,
      damage: hp,
      growth: gain,
      finalHp: hp + gain,
      cap: 10,
    });
  } finally {
    if (app) await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/sapling-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
