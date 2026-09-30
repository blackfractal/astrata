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
const effects = ["Burn", "Poison", "Corrode"];
await fs.mkdir("reports/screenshots/player-status", { recursive: true });
for (const scenario of ["curses", "enemies"])
  for (const mode of ["normal", "fast", "reduced", "skip"]) {
    const g = new Game(8);
    let sources = {};
    if (scenario === "curses") {
      g.s.equipment = { finger1: null, torso: null };
      sources.Burn = g.addItem("curseRing").uid;
      sources.Corrode = g.addItem("curseArmor").uid;
      g.addItem("curseGem");
      g.s.mode = "field";
      g.s.field.moves = 2;
      g.s.field.x = 5;
      g.s.field.y = 5;
      g.s.field.entities = [
        { uid: 900, enemy: "beetle", type: "M", x: 6, y: 5, restless: 0 },
      ];
    } else {
      g.s.equipment = {};
      g.beginBattle([
        { uid: 900, enemy: "ashling", restless: 0 },
        { uid: 901, enemy: "sludge", restless: 0 },
        { uid: 902, enemy: "leech", restless: 0 },
      ]);
      g.s.battle.enemies[1].cycle = 2;
      g.s.battle.phase = "activate";
      g.s.battle.hand = [];
      sources = { Burn: 900, Corrode: 901, Poison: 902 };
    }
    const profile = path.resolve(
      `.tmp/player-status-${scenario}-${mode}-${Date.now()}`,
    );
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
      await p.evaluate(
        ({ sources, scenario }) => {
          window.statusShots = [];
          window.playerBursts = [];
          const animate = Element.prototype.animate;
          Element.prototype.animate = function (frames, opts) {
            if (
              this.matches(".attack-bolt") &&
              ["Burn", "Poison", "Corrode"].includes(this.dataset.effect)
            ) {
              const effect = this.dataset.effect,
                uid = sources[effect];
              const source = document.querySelector(
                scenario === "curses"
                  ? `.gear-item[data-item-uid="${uid}"]`
                  : `[data-enemy-uid="${uid}"]`,
              );
              const target = document.querySelector(
                ".battle-player .player-portrait",
              );
              const points = [source, target].map((e) => {
                const r = e?.getBoundingClientRect();
                return r
                  ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
                  : null;
              });
              window.statusShots.push({ effect, frames, points });
            }
            return animate.call(this, frames, opts);
          };
          new MutationObserver((records) => {
            for (const r of records)
              for (const e of r.addedNodes)
                if (
                  e.nodeType === 1 &&
                  e.matches(".spell-impact") &&
                  ["Burn", "Poison", "Corrode"].includes(e.dataset.element)
                ) {
                  const b = document
                    .querySelector(".battle-player .player-portrait")
                    .getBoundingClientRect();
                  window.playerBursts.push({
                    effect: e.dataset.element,
                    color: e.style.getPropertyValue("--hit-color"),
                    centered:
                      Math.abs(
                        parseFloat(e.style.left) - b.left - b.width / 2,
                      ) < 2 &&
                      Math.abs(parseFloat(e.style.top) - b.top - b.height / 2) <
                        2,
                  });
                }
          }).observe(document.body, { childList: true, subtree: true });
        },
        { sources, scenario },
      );
      if (scenario === "curses") await p.locator('[data-cell="61"]').click();
      else
        await p.getByRole("button", { name: "End turn", exact: true }).click();
      if (mode === "skip") await p.locator("[data-skip]").click();
      if (mode === "normal") {
        await p
          .locator('.spell-impact[data-element="Corrode"]')
          .first()
          .waitFor();
        await p.evaluate(() =>
          document.querySelectorAll(".spell-impact").forEach((e) =>
            e.getAnimations({ subtree: true }).forEach((a) => {
              a.pause();
              a.currentTime = 130;
            }),
          ),
        );
        await p.screenshot({
          path: `reports/screenshots/player-status/${scenario}-corrode.png`,
        });
      }
      await p.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
      const got = await p.evaluate(() => ({
        shots: window.statusShots,
        bursts: window.playerBursts,
      }));
      if (mode !== "skip") {
        assert.equal(
          got.shots.length,
          mode === "reduced" ? 0 : scenario === "curses" ? 2 : 3,
        );
        for (const shot of got.shots)
          for (let k = 0; k < 2; k++) {
            assert.ok(shot.points[k], "actual source/target exists");
            assert.ok(
              Math.abs(parseFloat(shot.frames[k].left) - shot.points[k].x) < 2,
            );
            assert.ok(
              Math.abs(parseFloat(shot.frames[k].top) - shot.points[k].y) < 2,
            );
          }
        assert.equal(
          got.bursts.length,
          6,
          "three applications, three stationary ticks",
        );
        for (const effect of effects)
          assert.equal(got.bursts.filter((b) => b.effect === effect).length, 2);
        assert.ok(got.bursts.every((b) => b.centered));
        assert.ok(
          got.bursts
            .filter((b) => b.effect === "Corrode")
            .every((b) => b.color === "#b86b45"),
        );
      }
      assert.equal(
        await p.locator(".spell-impact,.attack-bolt,.impact-number").count(),
        0,
      );
      report.checks.push(
        `${scenario}/${mode}: correct source and player endpoints, rust-colored Corrode, stationary typed ticks, cleanup; no renderer errors.`,
      );
    } finally {
      await app.close();
    }
  }
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/player-status-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
