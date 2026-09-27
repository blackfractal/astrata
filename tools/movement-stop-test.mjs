import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { VERSION } from "../src/content.mjs";
const g = new Game(9);
g.s.mode = "field";
Object.assign(g.s.field, {
  round: 17,
  spawned: 32,
  queue: [],
  x: 5,
  y: 5,
  moves: 2,
  stage: "player",
  entities: [
    { uid: 900, enemy: "bat", x: 4, y: 5, restless: 3, born: 1, count: 1 },
    { uid: 901, enemy: "imp", x: 8, y: 5, restless: 0, born: 1, count: 1 },
  ],
});
// Choose a deterministic saved RNG state giving the Bat direction (+1, 0).
for (let rng = 1; ; rng++) {
  const probe = new Game(0, g.save());
  probe.s.rng = rng;
  if (probe.rand() >= 2 / 3 && Math.floor(probe.rand() * 3) === 1) {
    g.s.rng = rng;
    break;
  }
}
const profile = path.resolve(".tmp/movement-stop-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, height: 800, fast: false }),
);
const report = {
  version: VERSION,
  method:
    "Explicit packaged Field fixture: Restless Bat one step from player, followed by Hunter",
  checks: [],
  errors: [],
};
const app = await electron.launch({
  executablePath: path.resolve("release/Astrata/Astrata.exe"),
  args: ["--user-data-dir=" + profile],
});
try {
  const page = await app.firstWindow();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.locator('[data-ui="continue"]').click();
  await page.evaluate(() => {
    window.movementStates = [];
    new MutationObserver(() => {
      if (!document.querySelector(".field")) return;
      const cell = (uid) =>
        document
          .querySelector(`[data-token="${uid}"]`)
          ?.closest("[data-cell]")
          ?.getAttribute("data-cell");
      window.movementStates.push({
        bat: cell(900),
        imp: cell(901),
        battle: !!document.querySelector("[data-enemy]"),
      });
    }).observe(document.body, { childList: true, subtree: true });
  });
  await page.getByRole("button", { name: "End movement", exact: true }).click();
  await page.waitForFunction(() =>
    window.movementStates.some((s) => s.bat === "60" && s.imp === "62"),
  );
  assert.equal(await page.locator("[data-enemy]").count(), 0);
  await fs.mkdir("reports/screenshots/movement-stop", { recursive: true });
  await page.screenshot({
    path: "reports/screenshots/movement-stop/bat-waits.png",
  });
  await page.waitForFunction(
    () =>
      !!document.querySelector("[data-enemy]") &&
      !document.querySelector(".presentation-bar"),
  );
  assert.equal(await page.locator("[data-enemy]").count(), 2);
  const states = await page.evaluate(() => window.movementStates);
  assert.ok(states.some((s) => s.bat === "60" && s.imp === "61"));
  assert.ok(states.every((s) => !s.bat || ["59", "60"].includes(s.bat)));
  assert.ok(states.every((s) => !s.battle));
  report.checks.push(
    "Bat stops at first contact despite 4 remaining steps",
    "Hunter continues step by step while Bat stays on player",
    "Battle UI waits until all movement completes",
    "One battle includes both enemies",
  );
  report.fieldStates = Array.from(
    new Map(states.map((s) => [JSON.stringify(s), s])).values(),
  );
  await page.screenshot({
    path: "reports/screenshots/movement-stop/battle.png",
  });
  assert.deepEqual(report.errors, []);
} finally {
  await app.close();
}
await fs.writeFile(
  "reports/movement-stop-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
