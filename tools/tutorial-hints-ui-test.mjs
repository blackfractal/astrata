import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { startTutorial, TUTORIAL } from "../src/tutorial.mjs";
const report = {
  package: JSON.parse(await fs.readFile("package.json", "utf8")).version,
  checks: [],
  errors: [],
};
function fixture(step = "independent") {
  const g = startTutorial(new Game(TUTORIAL.seed));
  for (let i = 0; i < 130 && g.s.tutorial.lesson !== step; i++)
    g.act(g.legal()[0]);
  assert.equal(g.s.tutorial.lesson, step);
  return g;
}
async function scenario(name, g, fn) {
  const profile = path.resolve(
    ".tmp/tutorial-hints-" + name + "-" + Date.now(),
  );
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/tutorial-save.json", JSON.stringify(g.s));
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
    await p.clock.install();
    await p.locator('[data-ui="continueTutorial"]').click();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    await p.clock.runFor(300);
    await fn(p, profile);
    report.checks.push(name);
  } finally {
    await app.close();
  }
}
const empty = fixture();
empty.s.battle.hand = [];
empty.s.battle.focus = 0;
await scenario(
  "one-time-introduction-idle-arrow-input-reset-and-resume",
  empty,
  async (p, profile) => {
    await p.locator("[data-tutorial-independent]").click();
    assert.equal(await p.locator("#tutorial-layer").isVisible(), false);
    assert.equal(
      JSON.parse(await fs.readFile(profile + "/tutorial-save.json", "utf8"))
        .tutorial.independentIntroDismissed,
      true,
    );
    await p.clock.fastForward(14000);
    assert.equal(await p.locator("[data-tutorial-hint]").count(), 0);
    await p.mouse.move(70, 70);
    await p.clock.fastForward(14000);
    assert.equal(await p.locator("[data-tutorial-hint]").count(), 0);
    await p.clock.fastForward(1100);
    await p.locator("[data-tutorial-hint]").waitFor();
    assert.match(
      await p.locator("[data-tutorial-hint]").textContent(),
      /Placement to Activation/,
    );
    assert.ok(await p.locator(".tutorial-hint-target[data-action]").count());
    await p.screenshot({ path: "reports/screenshots/tutorial/idle-arrow.png" });
    const s = JSON.parse(
        await fs.readFile(profile + "/tutorial-save.json", "utf8"),
      ),
      g = new Game(0, s),
      a = g.legal().find((a) => a.type === "activatePhase");
    await p.locator("[data-action=" + JSON.stringify(a.key) + "]").click();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    assert.equal(await p.locator("#tutorial-layer").isVisible(), false);
    await p.locator('[data-ui="pause"]').click();
    await p.clock.fastForward(20000);
    assert.equal(await p.locator("#tutorial-layer").isVisible(), false);
    await p.locator('[data-ui="saveAndHome"]').click();
    await p.locator('[data-ui="continueTutorial"]').click();
    assert.equal(await p.locator("#tutorial-layer").isVisible(), false);
    await p.clock.fastForward(15100);
    await p.locator("[data-tutorial-hint]").waitFor();
    assert.match(
      await p.locator("[data-tutorial-hint]").textContent(),
      /Activation to Enemy/,
    );
  },
);
const defending = fixture();
defending.s.tutorial.independentIntroDismissed = true;
const ward = defending.instance(defending.newCard("ward"));
ward.ward = 10;
defending.s.battle.grid[6].push(ward);
defending.s.battle.reaction = {
  damage: 5,
  element: "Arcane",
  stage: "ward",
  name: "Measured tap",
  intercepted: [],
};
await scenario(
  "idle-defense-and-no-autoplay",
  defending,
  async (p, profile) => {
    const before = JSON.parse(
      await fs.readFile(profile + "/tutorial-save.json", "utf8"),
    );
    await p.clock.fastForward(15100);
    await p.locator("[data-tutorial-hint]").waitFor();
    assert.match(
      await p.locator("[data-tutorial-hint]").textContent(),
      /click Ward to block/,
    );
    assert.ok(await p.locator('[data-slot="6"].tutorial-hint-target').count());
    const after = JSON.parse(
      await fs.readFile(profile + "/tutorial-save.json", "utf8"),
    );
    assert.equal(after.steps, before.steps);
    assert.equal(after.battle.reaction.damage, 5);
    await p.screenshot({
      path: "reports/screenshots/tutorial/idle-defense.png",
    });
  },
);
await scenario(
  "strong-required-pulse-and-reduced-motion",
  fixture("shield-place"),
  async (p) => {
    const card = p.locator("[data-hand].tutorial-target-control").first();
    await p.emulateMedia({ reducedMotion: "no-preference" });
    await card.evaluate((el) => getComputedStyle(el).animationName);
    await p.clock.runFor(40);
    const animations = await card.evaluate((el) =>
      el.getAnimations().map((a) => ({
        name: a.animationName,
        frames: a.effect.getKeyframes(),
      })),
    );
    assert.ok(
      animations.some(
        (a) =>
          a.name === "tutorial-wobble" &&
          Math.max(...a.frames.map((f) => parseFloat(f.outlineOffset))) -
            Math.min(...a.frames.map((f) => parseFloat(f.outlineOffset))) >=
            5,
      ),
    );
    assert.ok(animations.some((a) => a.name === "tutorial-pulse"));
    await p.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await card.evaluate((el) => getComputedStyle(el).animationName),
      "none",
    );
    assert.equal(await card.evaluate((el) => getComputedStyle(el).scale), "1");
    await p.screenshot({
      path: "reports/screenshots/tutorial/strong-cue-reduced-motion.png",
    });
    await p.emulateMedia({ reducedMotion: "no-preference" });
    const a = fixture("shield-place").legal()[0];
    await p
      .locator(`[data-hand="${a.uid}"]`)
      .dragTo(p.locator(`[data-slot="${a.slot}"]`));
    await p.locator('[data-tutorial-step="focus-empty"]').waitFor();
  },
);
await scenario(
  "first-action-clears-intro-and-real-idle-delay",
  empty,
  async (p, profile) => {
    const a = empty.legal().find((a) => a.type === "activatePhase");
    await p.locator("[data-action=" + JSON.stringify(a.key) + "]").click();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    assert.equal(await p.locator("#tutorial-layer").isVisible(), false);
    assert.equal(
      JSON.parse(await fs.readFile(profile + "/tutorial-save.json", "utf8"))
        .tutorial.independentIntroDismissed,
      true,
    );
    const started = Date.now();
    await p.locator("[data-tutorial-hint]").waitFor({ timeout: 20000 });
    assert.ok(Date.now() - started >= 14000);
    assert.match(
      await p.locator("[data-tutorial-hint]").textContent(),
      /Activation to Enemy/,
    );
  },
);
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/tutorial-hints-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
