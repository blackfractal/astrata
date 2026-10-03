import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { VERSION } from "../src/content.mjs";
const report = { package: "1.3.80", version: VERSION, checks: [], errors: [] };
await fs.mkdir("reports/screenshots/charge-release", { recursive: true });
for (const [name, id, charge, water, used] of [
  ["kiln-empty", "kiln", 0, false, 0],
  ["kiln-fill", "kiln", 1, false, 0],
  ["kiln-release", "kiln", 2, false, 0],
  ["seed-water", "seed", 0, true, 0],
  ["seed-cap", "seed", 2, true, 0],
  ["seed-release", "seed", 3, false, 0],
  ["kiln-spent", "kiln", 2, false, 7],
]) {
  const g = new Game(80);
  g.s.equipment = {};
  g.beginBattle([
    { uid: 900, enemy: "beetle", restless: 0 },
    { uid: 901, enemy: "beetle", restless: 0 },
  ]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 2;
  b.hand = [];
  b.enemies.forEach((e) => {
    e.hp = e.maxHp = 100;
    e.element = "Arcane";
  });
  const c = g.instance(g.newCard(id));
  c.charge = charge;
  c.used = used;
  b.grid[10] = [c];
  if (water) {
    const shield = g.instance(g.newCard("shield"));
    shield.lastActivatedTurn = b.turn;
    shield.lastActivationElement = "Water";
    shield.used = 2;
    b.grid[9] = [shield];
  }
  delete g.s.checkpoint;
  const profile = path.resolve(
    ".tmp/charge-release-" + name + "-" + Date.now(),
  );
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1440, fast: true }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    const meter = p.locator('[data-slot="10"] .charge-meter'),
      button = p.locator('[data-activate-slot="10"]');
    const required = id === "kiln" ? 2 : 3;
    assert.match(
      await meter.textContent(),
      new RegExp(`Charge ${charge}/${required}`),
    );
    await p.locator('[data-slot="10"] .name').click();
    assert.match(
      await p.locator("#modal").textContent(),
      new RegExp(`Charge ${charge}/${required}`),
    );
    await p.keyboard.press("Escape");
    if (used === 7) {
      assert.match(await meter.textContent(), /Spent/);
      assert.equal(await button.getAttribute("aria-disabled"), "true");
    } else {
      const release = charge === required;
      assert.match(await button.textContent(), release ? /Release/ : /Charge/);
      if (water)
        assert.match(await button.textContent(), charge === 0 ? /\+2/ : /\+1/);
      await button.click();
      if (release) {
        assert.equal(
          await p.locator('.enemy[data-target-choice="target"]').count(),
          2,
        );
        await p.locator('[data-enemy-uid="901"]').click();
      }
      await p.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
      assert.equal(await p.locator(".targeting-bar").count(), 0);
      const save = JSON.parse(
        await fs.readFile(profile + "/save.json", "utf8"),
      );
      const current = JSON.parse(
        await fs.readFile(
          profile + "/runs/" + save.uiMeta.runId + "/latest.json",
          "utf8",
        ),
      );
      assert.deepEqual(
        current.battle.enemies.map((e) => e.hp),
        [100, 100 - (release ? (id === "kiln" ? 20 : 16) : 0)],
      );
      const expected = release
        ? 0
        : Math.min(required, charge + (water ? 2 : 1));
      assert.equal(current.battle.grid[10][0].charge, expected);
      assert.equal(current.battle.grid[10][0].used, 1);
      assert.match(
        await meter.textContent(),
        new RegExp(`Charge ${expected}/${required}`),
      );
      assert.equal(
        await button.getAttribute("aria-disabled"),
        "true",
        "no second use this turn",
      );
      if (!release && expected === required)
        assert.match(await button.textContent(), /Release/);
    }
    await p.mouse.move(1, 1);
    if (["seed-water", "seed-cap", "kiln-release", "kiln-spent"].includes(name))
      await p.screenshot({
        path: "reports/screenshots/charge-release/" + name + ".png",
      });
    report.checks.push({
      name,
      charge,
      water,
      used,
      meter: await meter.textContent(),
      button: await button.textContent(),
    });
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/charge-release-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(
  "Seven packaged Charge UI cases passed, including committed Water relay, fill without damage, separate targeted releases and charged-but-Spent.",
);
