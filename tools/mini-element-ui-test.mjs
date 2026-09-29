import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { ELEMENTS } from "../src/content.mjs";
const report = { package: "1.3.26", checks: [], errors: [] };
const dir = "reports/screenshots/mini-element";
await fs.mkdir(dir, { recursive: true });
let g;
for (let seed = 1; seed < 100; seed++) {
  const candidate = new Game(seed);
  candidate.s.equipment = {};
  candidate.beginBattle([{ uid: 900, enemy: "colossus", restless: 0 }]);
  const b = candidate.s.battle;
  b.phase = "activate";
  b.hand = [];
  b.enemies[0].element = "Fire";
  b.enemies[0].cycle = 3;
  b.grid[0] = [candidate.instance(candidate.newCard("blast"))];
  Object.assign(b.grid[0][0], { element: "Fire", transmuted: true });
  candidate.s.hp = candidate.s.maxHp = 999;
  if (new Game(0, candidate.s).pick(ELEMENTS) === "Water") {
    g = candidate;
    break;
  }
}
assert.ok(g);
const profile = path.resolve(".tmp/mini-element-" + Date.now());
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
const settle = () =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
try {
  await p.locator('[data-ui="continue"]').click();
  await p.locator('[data-activate-slot="0"]').dblclick();
  await settle();
  const boss = p.locator('[data-enemy="colossus"]'),
    mini = p.locator('[data-enemy="mini"]');
  assert.equal(await mini.count(), 1);
  assert.match(
    await boss.locator(".info small").first().textContent(),
    /Fire.*169 \/ 173/,
  );
  assert.match(
    await mini.locator(".info small").first().textContent(),
    /Fire.*11 \/ 11/,
  );
  assert.match(await mini.locator(".tell").textContent(), /Gnaw.*2.*Fire/);
  report.checks.push(
    "Fire Blast deals normal 4 damage to Fire Colossus and creates one Fire Mini-Void with a Fire attack.",
  );
  await p.getByRole("button", { name: "End turn", exact: true }).click();
  await settle();
  assert.match(
    await boss.locator(".info small").first().textContent(),
    /Water/,
  );
  assert.match(
    await boss.locator(".tell").textContent(),
    /Void fist.*11.*Water/,
  );
  assert.match(await mini.locator(".info small").first().textContent(), /Fire/);
  assert.match(await mini.locator(".tell").textContent(), /Gnaw.*3.*Fire/);
  assert.match(await p.locator(".player-portrait b").textContent(), /997\/999/);
  await p.mouse.move(5, 5);
  await p.screenshot({ path: dir + "/water-colossus-fire-mini.png" });
  await mini.click();
  const details = await p.locator("#modal").textContent();
  assert.match(details, /Gnaw.*2.*Fire/);
  assert.match(details, /Gnaw.*3.*Fire/);
  assert.match(details, /Keeps that element/);
  report.checks.push(
    "After actual Water Glare, the boss changes to Water while its Fire Mini-Void attacks for 2 Fire and keeps 3 Fire next; both full rotation entries remain Fire.",
  );
} finally {
  await app.close();
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/mini-element-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
