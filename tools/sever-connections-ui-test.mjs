import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = {
  package: JSON.parse(await fs.readFile("package.json", "utf8")).version,
  checks: [],
  errors: [],
};
const dir = "reports/screenshots/sever-connections";
await fs.mkdir(dir, { recursive: true });
const g = new Game(8);
g.s.equipment = {};
g.beginBattle([{ uid: 900, enemy: "hart", restless: 0 }]);
const b = g.s.battle;
b.phase = "activate";
b.channel = 10;
b.hand = [];
b.enemies[0].cycle = 2;
for (const [id, i] of [
  ["shield", 8],
  ["shield", 9],
  ["focus", 15],
  ["square", 16],
  ["rain", 7],
  ["blast", 23],
  ["blast", 24],
  ["clean", 27],
]) {
  b.grid[i] = [g.instance(g.newCard(id))];
}
b.grid[8][0].sever = true;
const profile = path.resolve(".tmp/sever-connections-" + Date.now());
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
const incident = () =>
  p.locator('.board-link[data-from="8"],.board-link[data-to="8"]');
try {
  await p.locator('[data-ui="continue"]').click();
  assert.equal(await p.locator(".sever-border .sever-cut").count(), 4);
  assert.equal(await incident().count(), 0);
  assert.equal(await p.locator(".link-pattern").count(), 0);
  assert.ok((await p.locator(".link-adjacency").count()) > 0);
  assert.equal(await p.locator(".link-synergy").count(), 1);
  assert.match(await p.locator('[data-activate-slot="16"]').textContent(), /6/);
  assert.ok(await p.locator('[data-slot="8"].grid-threat').count());
  await p.mouse.move(5, 5);
  await p.screenshot({ path: dir + "/severed.png" });
  await p.locator('[data-slot="8"] .name').click();
  await p.locator(".card-detail").waitFor();
  await p.locator(".dialog-close").click();
  await p.locator('[data-activate-slot="8"]').dblclick();
  await settle();
  assert.equal(
    await p.locator('[data-slot="8"] .shield-portion').textContent(),
    "4 Arcane",
  );
  await p.locator('[data-activate-slot="27"]').dblclick();
  await settle();
  assert.equal(await p.locator(".sever-border").count(), 0);
  assert.ok((await incident().count()) > 0);
  assert.equal(await p.locator(".link-synergy").count(), 2);
  assert.ok((await p.locator(".link-attune").count()) > 0);
  assert.match(
    await p.locator('[data-activate-slot="16"]').textContent(),
    /12/,
  );
  await p.mouse.move(5, 5);
  assert.equal(await p.locator(".link-pattern").count(), 5);
  assert.equal(await p.locator(".link-pattern.link-diagonal").count(), 1);
  assert.equal(await p.locator(".pattern-bonus").textContent(), "2×2 · ×2");
  await p.locator('[data-slot="16"]').hover();
  assert.equal(await p.locator(".link-pattern.link-inspected").count(), 5);
  await p.mouse.move(5, 5);
  await p.screenshot({ path: dir + "/restored.png" });
  report.checks.push(
    "Four jagged purple borders; no Severed links; ordinary and bonus links remain elsewhere; boss telegraph coexists; card details and Severed activation clickable; Unbinding Dew removes border, restores adjacency/Attune/Shield synergy and Fourfold damage from 6 to 12; five pattern links including one diagonal and the doubled-damage badge, all emphasized on Grove hover.",
  );
  assert.deepEqual(report.errors, []);
} finally {
  await app.close();
}
await fs.writeFile(
  "reports/sever-connections-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
