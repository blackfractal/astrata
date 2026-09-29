import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.25", checks: [], errors: [] };
const dir = "reports/screenshots/chaotic-glare";
await fs.mkdir(dir, { recursive: true });
const settle = (p) =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
for (const form of ["Fire", "Arcane"]) {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "colossus", restless: 0 }]);
  g.s.battle.phase = "activate";
  g.s.battle.hand = [];
  g.s.battle.enemies[0].cycle = 3;
  g.s.hp = g.s.maxHp = 999;
  let found = false;
  for (let rng = 1; rng < 10000; rng++) {
    g.s.rng = rng;
    const probe = new Game(0, g.s);
    probe.act(probe.legal().find((a) => a.type === "endTurn"));
    if (probe.s.battle.enemies[0].element === form) {
      found = true;
      break;
    }
  }
  assert.ok(found);
  const profile = path.resolve(".tmp/chaotic-glare-" + Date.now());
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
    assert.match(
      await p.locator(".enemy .tell").textContent(),
      /Chaotic Glare/,
    );
    assert.match(
      await p.locator(".enemy .info small").first().textContent(),
      /Chaos/,
    );
    await p.getByRole("button", { name: "End turn", exact: true }).click();
    await settle(p);
    assert.match(
      await p.locator(".enemy .info small").first().textContent(),
      new RegExp(form),
    );
    assert.match(
      await p.locator(".enemy .tell").textContent(),
      new RegExp("Void fist.*11.*" + form),
    );
    assert.match(
      await p.locator(".player-portrait b").textContent(),
      /999\/999/,
    );
    await p.screenshot({ path: dir + "/" + form.toLowerCase() + "-form.png" });
    await p.locator(".enemy").click();
    const details = await p.locator("#modal").textContent();
    assert.match(details, /Chaotic Glare/);
    assert.match(details, new RegExp("Void fist.*10.*" + form));
    await p.keyboard.press("Escape");
    for (const hp of [988, 977]) {
      await p
        .getByRole("button", { name: "Begin activation", exact: true })
        .click();
      await settle(p);
      await p.getByRole("button", { name: "End turn", exact: true }).click();
      await settle(p);
      assert.match(
        await p.locator(".player-portrait b").textContent(),
        new RegExp(hp + "/999"),
      );
      assert.match(
        await p.locator(".enemy .info small").first().textContent(),
        new RegExp(form),
      );
    }
    assert.match(await p.locator(".enemy .tell").textContent(), /Collapse/);
    report.checks.push({
      form,
      glareNoDamage: true,
      liveElementAndTells: true,
      bothAttacks: 11,
      details: true,
    });
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/chaotic-glare-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
