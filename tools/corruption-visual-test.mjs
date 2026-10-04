import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { enemies } from "../src/content.mjs";
import { prepareCorruption, applyCorruptions } from "../src/corruptions.mjs";

const report = { checks: [], errors: [] };
await fs.mkdir("reports/screenshots/loom", { recursive: true });
for (const scenario of ["scribe", "gallery"]) {
  const profile = path.resolve(
    ".tmp/corruption-visual-" + scenario + "-" + Date.now(),
  );
  await fs.mkdir(profile, { recursive: true });
  const g = new Game(83);
  g.s.stratum = 2;
  g.beginBattle([{ uid: g.uid(), enemy: "hollowScribe", restless: 0 }]);
  const b = g.s.battle,
    e = b.enemies[0];
  if (scenario === "scribe") {
    prepareCorruption(g, e, enemies.hollowScribe.rotation[0]);
    applyCorruptions(g, e);
  } else {
    for (const [i, kind] of [
      "hole",
      "nausea",
      "insanity",
      "mine",
      "hypnosis",
    ].entries())
      b.corruptions[8 + i] = {
        kind,
        uid: g.uid(),
        source: e.uid,
        value: 2,
        remaining: 2,
        createdTurn: b.turn,
      };
    for (const [i, kind] of [
      [22, "nausea"],
      [23, "insanity"],
      [24, "mine"],
      [25, "hypnosis"],
    ]) {
      b.corruptions[i] = {
        kind,
        uid: g.uid(),
        source: e.uid,
        value: 1,
        remaining: 2,
        createdTurn: b.turn,
      };
      b.grid[i] = [g.instance(g.newCard("shield"))];
    }
  }
  b.hand = [g.newCard("elves", true), g.newCard("shield")];
  b.focus = 2;
  g.s.uiMeta = { runId: "visual-" + scenario, elapsed: 0 };
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1280, fast: true }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    await p.locator(".corruption-art").first().waitFor();
    await p.waitForFunction(() =>
      [...document.querySelectorAll(".corruption-art")].every(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    );
    assert.equal(
      await p.locator(".corruption-art").count(),
      scenario === "scribe" ? 14 : 9,
    );
    const moving = await p
      .locator(".corruption-hole .corruption-motion i")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    assert.equal(moving, "hole-fall");
    if (scenario === "gallery") {
      assert.equal(await p.locator(".corruption-covered").count(), 2);
      assert.equal(
        await p
          .locator('[data-slot="22"] .corruption-motion')
          .evaluate((el) => getComputedStyle(el).display),
        "none",
      );
      assert.ok(await p.locator('[data-slot="24"] .slot-activate').isVisible());
      assert.equal(
        await p
          .locator('[data-slot="9"] .corruption-motion i')
          .first()
          .evaluate((el) => getComputedStyle(el).animationName),
        "nausea-swirl",
      );
    }
    await p.mouse.move(5, 5);
    await p.screenshot({
      path: `reports/screenshots/loom/corruption-${scenario}.png`,
    });
    const hole = await p
      .locator(".corruption-hole")
      .first()
      .getAttribute("data-slot");
    await p
      .locator('[data-hand="' + b.hand[0].uid + '"]')
      .dragTo(p.locator('[data-slot="' + hole + '"]'));
    await p
      .locator('[data-slot="' + hole + '"] .name')
      .filter({ hasText: "Machine Elves" })
      .waitFor();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    assert.ok(
      await p.locator('[data-slot="' + hole + '"] .corruption-art').isVisible(),
    );
    await p.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await p
        .locator(".corruption-motion i")
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
      "none",
    );
    report.checks.push(
      scenario === "scribe"
        ? "Fourteen distinct painted Holes render with falling particles; upgraded Elves drag onto one and its art recedes beneath the card."
        : "All five Corruption images decode; counters and covered states render; suppressed swirls stop; activation controls remain visible; reduced-motion stops particles.",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/corruption-visual-verification.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(report);
