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
function fixture(step) {
  const g = startTutorial(new Game(TUTORIAL.seed));
  for (let n = 0; n < 120 && g.s.tutorial.lesson !== step; n++)
    g.act(g.legal()[0]);
  assert.equal(g.s.tutorial.lesson, step);
  g.s.uiMeta = { runId: "edge-" + step, elapsed: 0 };
  return g;
}
async function scenario(name, g, fn, fast = true) {
  const profile = path.resolve(".tmp/tutorial-edge-" + name + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  const normal = JSON.stringify(new Game(900).s);
  await fs.writeFile(profile + "/save.json", normal);
  await fs.writeFile(profile + "/tutorial-save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1280, fast }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continueTutorial"]').click();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    await fn(p, profile);
    assert.equal(await fs.readFile(profile + "/save.json", "utf8"), normal);
    report.checks.push(name);
  } finally {
    await app.close();
  }
}
await scenario(
  "keyboard-and-reduced-motion",
  fixture("shield-place"),
  async (p, profile) => {
    await p.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await p
        .locator(".tutorial-target")
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
      "none",
    );
    const a = fixture("shield-place").legal()[0];
    await p.locator(`[data-hand="${a.uid}"]`).focus();
    await p.keyboard.press("Enter");
    await p.locator("#modal [data-close]").click();
    await p.locator(`[data-slot="${a.slot}"]`).focus();
    await p.keyboard.press("Enter");
    await p.locator('[data-tutorial-step="focus-empty"]').waitFor();
    await p.locator("[data-tutorial-next]").focus();
    await p.keyboard.press("Enter");
    await p.locator('[data-tutorial-step="first-phase"]').waitFor();
  },
);
await scenario(
  "tavern-resume-service-and-abandon-isolation",
  fixture("helmet-equip"),
  async (p, profile) => {
    await p.getByRole("heading", { name: "Jeweler", exact: true }).waitFor();
    assert.ok(
      await p
        .locator('.tavern-service [data-equip-slot="head"].tutorial-target')
        .count(),
    );
    await p.locator('[data-ui="pause"]').click();
    await p.locator('[data-ui="abandon"]').click();
    await p.locator('[data-ui="abandonConfirmed"]').click();
    await p.locator('[data-ui="new"]').waitFor();
    await assert.rejects(fs.access(profile + "/tutorial-save.json"));
  },
);
await scenario(
  "normal-speed-pursuit-animation",
  fixture("pursuit-second"),
  async (p, profile) => {
    const a = fixture("pursuit-second").legal()[0];
    await p
      .locator("[data-action=" + JSON.stringify(a.key) + "]")
      .first()
      .click();
    await p.locator(".presentation-bar").waitFor();
    assert.ok(await p.locator("#tutorial-layer").evaluate((el) => el.hidden));
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    await p.locator('[data-tutorial-step="caught"]').waitFor();
    const s = JSON.parse(
      await fs.readFile(profile + "/tutorial-save.json", "utf8"),
    );
    assert.equal(s.battle.enemies[0].id, "tutorialRootling");
    assert.deepEqual([s.field.x, s.field.y], [10, 3]);
  },
  false,
);
const retry = fixture("independent");
retry.s.hp = 1;
retry.s.battle.enemies[0].cycle = 1;
await scenario("loss-retry-fresh-archive-id", retry, async (p, profile) => {
  let g = new Game(
    0,
    JSON.parse(await fs.readFile(profile + "/tutorial-save.json", "utf8")),
  );
  for (const type of ["activatePhase", "endTurn", "skipEquipment"]) {
    const a = g.legal().find((a) => a.type === type);
    assert.ok(a, type);
    if (type === "skipEquipment")
      await p.locator(".battle-player .player-portrait").click();
    else
      await p
        .locator("[data-action=" + JSON.stringify(a.key) + "]")
        .first()
        .click();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    if (type !== "skipEquipment")
      g = new Game(
        0,
        JSON.parse(await fs.readFile(profile + "/tutorial-save.json", "utf8")),
      );
  }
  await p
    .getByRole("heading", {
      name: "The Warden awaits another try",
      exact: true,
    })
    .waitFor();
  const history = JSON.parse(
    await fs.readFile(profile + "/history.json", "utf8"),
  );
  assert.equal(history.at(-1).outcome, "loss");
  await p.getByRole("button", { name: /Retry/ }).click();
  await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
  const s = JSON.parse(
    await fs.readFile(profile + "/tutorial-save.json", "utf8"),
  );
  assert.equal(s.hp, 70);
  assert.equal(s.battle.turn, 1);
  assert.notEqual(s.uiMeta.runId, "edge-independent");
  assert.equal(s.tutorial.completed, false);
  assert.equal(s.tutorial.retries, 1);
  const stats = JSON.parse(
    await fs.readFile(profile + "/tutorial-stats.json", "utf8"),
  );
  assert.equal(stats.stratum1.completions.length, 0);
});
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/tutorial-edge-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
