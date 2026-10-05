import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { prepareCorruption, applyCorruptions } from "../src/corruptions.mjs";

const report = { checks: [], errors: [] };
const dir = "reports/screenshots/bombadier-pairs";
await fs.mkdir(dir, { recursive: true });
for (const scenario of ["opening", "anger-warning", "anger-applied"]) {
  const g = new Game(31004);
  g.s.stratum = 2;
  g.beginBattle([{ uid: g.uid(), enemy: "bombadier", restless: 0 }]);
  const e = g.s.battle.enemies[0];
  g.s.battle.phase = "activate";
  if (scenario !== "opening") {
    e.cycle = 1;
    prepareCorruption(g, e, g.tell(e));
    if (scenario === "anger-applied") {
      applyCorruptions(g, e);
      e.cycle = 2;
    }
  }
  const profile = path.resolve(
    ".tmp/bombadier-pairs-" + scenario + "-" + Date.now(),
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
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    if (scenario === "anger-applied") {
      await p.locator(".corruption-anger").first().waitFor();
      assert.equal(await p.locator(".corruption-anger").count(), 2);
      assert.equal(await p.locator(".corruption-mine").count(), 2);
      assert.equal(await p.locator(".corruption-foretell").count(), 0);
      assert.ok(
        await p
          .locator(".corruption-art")
          .evaluateAll((els) =>
            els.every((el) => el.complete && el.naturalWidth > 0),
          ),
      );
    } else {
      await p.locator(".corruption-foretell").first().waitFor();
      assert.equal(await p.locator(".corruption-foretell").count(), 4);
      const texts = await p
        .locator(".corruption-foretell")
        .evaluateAll((els) => els.map((el) => el.dataset.tooltip));
      assert.equal(texts.filter((s) => s.includes("Mind Mine")).length, 2);
      assert.equal(
        texts.filter((s) =>
          s.includes(scenario === "opening" ? "Memory Hole" : "Anger"),
        ).length,
        2,
      );
      if (scenario === "anger-warning")
        assert.match(
          await p.locator("body").innerText(),
          /2 Mind Mine \+ 2 Anger/,
        );
    }
    await p.screenshot({ path: dir + "/" + scenario + ".png" });
    report.checks.push(scenario);
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/bombadier-pairs-ui-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
