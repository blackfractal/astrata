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
const effects = ["Poison", "Burn", "Corrode"],
  ids = ["spore", "heat", "rot"],
  colors = ["#81e65b", "#ffa04d", "#c9cf52"];
const dir = "reports/screenshots/status-impact";
await fs.mkdir(dir, { recursive: true });
for (const mode of ["normal", "fast", "reduced", "immune", "skip"]) {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.hand = [];
  b.channel = 10;
  b.enemies[0].hp = b.enemies[0].maxHp = 200;
  b.enemies[0].element = mode === "immune" ? "Fire" : "Arcane";
  ids.forEach((id, i) => (b.grid[i * 14] = [g.instance(g.newCard(id))]));
  const profile = path.resolve(".tmp/status-impact-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, fast: mode === "fast" }),
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
      window.statusBolts = [];
      window.statusBursts = [];
      window.statusLabels = [];
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (frames, opts) {
        if (this.matches(".attack-bolt"))
          window.statusBolts.push({ effect: this.dataset.effect, frames });
        return animate.call(this, frames, opts);
      };
      new MutationObserver((records) => {
        for (const r of records)
          for (const e of r.addedNodes)
            if (e.nodeType === 1) {
              if (e.matches(".spell-impact")) {
                const target = document.querySelector(".enemy.impact"),
                  b = target?.getBoundingClientRect();
                window.statusBursts.push({
                  effect: e.dataset.element,
                  color: e.style.getPropertyValue("--hit-color"),
                  sparks: e.querySelectorAll(".impact-spark").length,
                  centered:
                    !!b &&
                    Math.abs(parseFloat(e.style.left) - b.left - b.width / 2) <
                      2 &&
                    Math.abs(parseFloat(e.style.top) - b.top - b.height / 2) <
                      2,
                  core: e.querySelector("svg").innerHTML,
                });
              }
              if (e.matches(".impact-number"))
                window.statusLabels.push(e.textContent);
            }
      }).observe(document.body, { childList: true, subtree: true });
    });
    const count = ["immune", "skip"].includes(mode) ? 1 : 3;
    for (let i = 0; i < count; i++) {
      const points = await p.evaluate(
        (slot) =>
          [
            document.querySelector(`[data-slot="${slot}"]`),
            document.querySelector('[data-enemy-uid="900"]'),
          ].map((e) => {
            const r = e.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          }),
        i * 14,
      );
      await p.locator(`[data-activate-slot="${i * 14}"]`).dblclick();
      if (mode === "skip") await p.locator("[data-skip]").click();
      if (mode === "normal") {
        await p
          .locator(`.spell-impact[data-element="${effects[i]}"]`)
          .waitFor();
        await p.evaluate(() =>
          document.querySelectorAll(".spell-impact").forEach((e) =>
            e.getAnimations({ subtree: true }).forEach((a) => {
              a.pause();
              a.currentTime = 130;
            }),
          ),
        );
        await p.screenshot({ path: `${dir}/${effects[i].toLowerCase()}.png` });
      }
      await p.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
      if (!["skip", "reduced"].includes(mode)) {
        const bolt = await p.evaluate(() => window.statusBolts.at(-1));
        assert.equal(bolt.effect, effects[i]);
        for (const k of [0, 1]) {
          assert.ok(
            Math.abs(parseFloat(bolt.frames[k].left) - points[k].x) < 2,
          );
          assert.ok(Math.abs(parseFloat(bolt.frames[k].top) - points[k].y) < 2);
        }
      }
    }
    const got = await p.evaluate(() => ({
      bolts: window.statusBolts,
      bursts: window.statusBursts,
      labels: window.statusLabels,
    }));
    if (mode !== "skip") {
      assert.deepEqual(
        got.bursts.map((x) => x.effect),
        effects.slice(0, count),
      );
      assert.deepEqual(
        got.bursts.map((x) => x.color),
        colors.slice(0, count),
      );
      assert.ok(
        got.bursts.every(
          (x) => x.centered && x.sparks === (mode === "reduced" ? 0 : 8),
        ),
      );
      assert.equal(got.bolts.length, mode === "reduced" ? 0 : count);
    }
    if (mode === "immune") assert.ok(got.labels.includes("Immune to Poison"));
    else
      assert.match(
        await p.locator('[data-enemy-uid="900"]').textContent(),
        /poison 3/i,
      );
    assert.equal(
      await p.locator(".spell-impact,.attack-bolt,.impact-number").count(),
      0,
    );
    if (mode === "fast") {
      await p.evaluate(() => {
        window.statusBolts = [];
        window.statusBursts = [];
      });
      await p.getByRole("button", { name: "End turn", exact: true }).click();
      await p.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
      const ticks = await p.evaluate(() => ({
        bursts: window.statusBursts,
        bolts: window.statusBolts,
      }));
      assert.deepEqual(
        ticks.bursts.slice(0, 3).map((x) => x.effect),
        ["Burn", "Poison", "Corrode"],
      );
      assert.ok(!ticks.bolts.some((x) => effects.includes(x.effect)));
    }
    report.checks.push(
      `${mode}: ${count} status casts verified; correct colors, source card/target centers, labels, cleanup and unchanged application/immunity. ${mode === "fast" ? "Later status ticks use matching stationary bursts without another projectile." : ""}`,
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/status-impact-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
