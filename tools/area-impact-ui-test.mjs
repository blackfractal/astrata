import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.79", checks: [], errors: [] };
await fs.mkdir("reports/screenshots/area-impact", { recursive: true });
for (const [mode, count, lethal] of [
  ["normal", 2, false],
  ["normal", 4, true],
  ["fast", 4, false],
  ["reduced", 4, true],
  ["skip", 4, true],
]) {
  const g = new Game(8);
  if (lethal) g.s.equipment = {};
  g.beginBattle(
    Array.from({ length: count }, (_, i) => ({
      uid: 900 + i,
      enemy: "beetle",
      restless: 0,
    })),
  );
  const b = g.s.battle;
  b.phase = "activate";
  b.hand = [];
  b.channel = 2;
  b.grid[10] = [g.instance(g.newCard("storm"))];
  b.enemies.forEach((e) => {
    e.element = "Arcane";
    e.hp = e.maxHp = lethal ? 5 : 100;
  });
  delete g.s.checkpoint;
  const profile = path.resolve(".tmp/area-impact-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1440, fast: mode === "fast" }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    if (mode === "reduced") await p.emulateMedia({ reducedMotion: "reduce" });
    await p.locator('[data-ui="continue"]').click();
    await p.evaluate(() => {
      window.areaTrace = { bolts: [], bursts: [], deaths: 0 };
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (frames, opts) {
        if (this.matches(".attack-bolt"))
          window.areaTrace.bolts.push({
            effect: this.dataset.effect,
            time: performance.now(),
            frames,
            count: document.querySelectorAll(".attack-bolt").length,
          });
        if (this.matches(".impact-core"))
          window.areaTrace.bursts.push({
            element: this.parentElement.dataset.element,
            time: performance.now(),
            reward: !!document.querySelector(".reward-catalog"),
          });
        return animate.call(this, frames, opts);
      };
    });
    await p.locator('[data-activate-slot="10"]').dblclick();
    if (mode === "skip") await p.locator("[data-skip]").click();
    if (mode === "normal" && count === 4) {
      await p.locator(".attack-bolt").first().waitFor();
      await p.screenshot({
        path: "reports/screenshots/area-impact/four-targets.png",
      });
    }
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    const trace = await p.evaluate(() => window.areaTrace);
    if (mode !== "skip") {
      const shots = trace.bolts.filter((x) => x.effect === "Wind");
      assert.equal(shots.length, mode === "reduced" ? 0 : count);
      if (shots.length) {
        assert.ok(
          Math.max(...shots.map((x) => x.time)) -
            Math.min(...shots.map((x) => x.time)) <
            80,
          "simultaneous launch",
        );
        assert.equal(Math.max(...shots.map((x) => x.count)), count);
        assert.equal(
          new Set(shots.map((x) => JSON.stringify(x.frames[0]))).size,
          1,
          "shared source",
        );
        assert.equal(
          new Set(shots.map((x) => JSON.stringify(x.frames[1]))).size,
          count,
          "distinct targets",
        );
      }
      const bursts = trace.bursts.filter((x) => x.element === "Wind");
      assert.equal(bursts.length, count);
      assert.ok(
        Math.max(...bursts.map((x) => x.time)) -
          Math.min(...bursts.map((x) => x.time)) <
          100,
        "simultaneous impacts",
      );
      assert.ok(
        bursts.every((x) => !x.reward),
        "impacts before rewards",
      );
      if (!lethal && mode !== "reduced") {
        const ring = trace.bolts.find((x) => x.effect === "Arcane");
        assert.ok(
          ring && ring.time > Math.max(...shots.map((x) => x.time)) + 50,
          "Ring follows first hit",
        );
      }
    }
    assert.equal(
      await p
        .locator(
          ".attack-bolt,.spell-impact,.impact-number,.attack-orb-overlay",
        )
        .count(),
      0,
    );
    if (lethal) await p.locator(".reward-catalog").waitFor();
    else {
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
        Array.from({ length: count }, (_, i) => (i ? 93 : 91)),
      );
    }
    report.checks.push({
      mode,
      count,
      lethal,
      bolts: trace.bolts,
      bursts: trace.bursts,
    });
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/area-impact-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(
  "Verified simultaneous area hits: normal 2/4 targets, Ring order, victory, fast, reduced motion and Skip.",
);
