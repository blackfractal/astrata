import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards } from "../src/content.mjs";
const g = new Game(8);
g.s.equipment = {};
g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
g.s.battle.grid = g.s.battle.grid.map(() => []);
g.s.battle.phase = "place";
g.s.battle.hand = [];
const placements = [
  ["conduit", 8],
  ["shield", 10],
];
for (const [id, i] of placements)
  g.s.battle.grid[i] = [g.instance(g.newCard(id))];
delete g.s.checkpoint;
const profile = path.resolve(".tmp/object-spell-art-" + Date.now()),
  dir = "reports/screenshots/object-spell-art";
await fs.mkdir(profile, { recursive: true });
await fs.mkdir(dir, { recursive: true });
await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
await fs.writeFile(
  profile + "/settings.json",
  JSON.stringify({ width: 1280, fast: true }),
);
const app = await electron.launch({
  executablePath: path.resolve("node_modules/electron/dist/electron.exe"),
  args: [path.resolve("."), "--user-data-dir=" + profile],
  timeout: 30000,
});
const errors = [],
  checks = [];
try {
  const p = await app.firstWindow();
  p.setDefaultTimeout(15000);
  p.on("pageerror", (e) => errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  assert.match(
    await p.locator('[data-slot="10"] .name').textContent(),
    /Shield/,
  );
  for (const [id, i] of placements) {
    await p.locator(`[data-slot="${i}"] .name`).click();
    const img = p.locator(`#modal img[src$="card-${id}-v4.png"]`).first();
    await img.waitFor();
    assert.ok(await img.evaluate((el) => el.complete && el.naturalWidth > 0));
    assert.match(
      await p.locator("#modal").textContent(),
      new RegExp(cards[id].name),
    );
    await p.screenshot({ path: dir + "/" + id + "-details.png" });
    await p.keyboard.press("Escape");
    checks.push({ id, name: cards[id].name, revision: 4, fullArtLoaded: true });
  }
  await p.screenshot({ path: dir + "/board.png" });
  assert.deepEqual(errors, []);
  const report = {
    package: JSON.parse(await fs.readFile("package.json")).version,
    checks,
    errors,
  };
  await fs.writeFile(
    "reports/object-spell-art-ui-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await app.close();
}
