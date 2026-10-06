import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { mend } from "../src/corruptions.mjs";

const report = { checks: [], errors: [] };
const dir = "reports/screenshots/mending";
await fs.mkdir(dir, { recursive: true });
for (const scenario of ["adjacent", "self", "frozen"]) {
  const g = new Game(31004);
  g.s.stratum = 2;
  g.beginBattle([{ uid: g.uid(), enemy: "bombadier", restless: 0 }]);
  const b = g.s.battle,
    to = scenario === "self" ? 15 : 16;
  b.enemies[0].corruptionPlan = [];
  b.phase = "place";
  const c = g.instance(g.newCard("elves"));
  b.grid[15] = [c];
  b.corruptions[to] = { uid: g.uid(), kind: "hole", source: b.enemies[0].uid };
  mend(g, c, 15, to, "hole");
  if (scenario === "frozen") c.freeze = b.turn + 1;
  const profile = path.resolve(
    ".tmp/mending-ui-" + scenario + "-" + Date.now(),
  );
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
    p.on("pageerror", (err) => report.errors.push(err.message));
    await p.locator('[data-ui="continue"]').click();
    await p.locator(".mending-target-ring").waitFor();
    assert.equal(
      await p.locator(`[data-slot="${to}"].mending-target`).count(),
      1,
    );
    assert.equal(await p.locator('[data-slot="15"].mending-source').count(), 1);
    assert.equal(
      await p.locator(".mending-thread").count(),
      scenario === "self" ? 0 : 1,
    );
    assert.match(
      await p.locator(".mending-ribbon").getAttribute("data-tooltip"),
      /2 player-turn starts remaining/,
    );
    const ring = await p
      .locator(".mending-target-ring")
      .evaluate((el) => ({
        pointer: getComputedStyle(el).pointerEvents,
        animation: getComputedStyle(el).animationName,
      }));
    assert.equal(ring.pointer, "none");
    assert.equal(
      ring.animation,
      scenario === "frozen" ? "none" : "mending-pulse",
    );
    if (scenario !== "self") {
      const thread = p.locator(
        '[data-mending-from="15"][data-mending-to="16"]',
      );
      assert.equal(await thread.count(), 1);
      assert.equal(
        await thread.evaluate((el) => getComputedStyle(el).pointerEvents),
        "none",
      );
    }
    await p.screenshot({ path: dir + "/" + scenario + ".png" });
    await p.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await p
        .locator(".mending-target-ring")
        .evaluate((el) => getComputedStyle(el).animationName),
      "none",
    );
    if (scenario !== "self")
      assert.equal(
        await p
          .locator(".mending-thread")
          .evaluate((el) => getComputedStyle(el).animationName),
        "none",
      );
    report.checks.push(
      scenario +
        ": target, source, link, tooltip, click-through, reduced motion",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/mending-ui-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
