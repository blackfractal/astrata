import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { cards } from "../src/content.mjs";
const report = {
  package: "1.3.1",
  rules: "1.3.1",
  method:
    "Explicit packaged UI fixtures for resource limits and movement presentation",
  checks: [],
  errors: [],
};
await fs.mkdir("reports/screenshots/readability", { recursive: true });
async function open(g) {
  const profile = path.resolve(".tmp/readability-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, height: 800, fast: false }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  const page = await app.firstWindow();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator('[data-ui="continue"]').click();
  return { app, page };
}
const expensive = Object.values(cards).find(
  (c) => c.focus === 2 && !c.unplaceable,
).id;
for (const [name, phase, resource, id, used, pulse] of [
  ["zero-focus-free-card", "place", 0, "cinder", 0, true],
  ["no-affordable-placement", "place", 1, expensive, 0, true],
  ["placement-available", "place", 2, "blast", 0, false],
  ["zero-channel", "activate", 0, "blast", 0, true],
  ["all-activations-used", "activate", 2, "blast", 2, true],
  ["activation-available", "activate", 2, "blast", 0, false],
]) {
  const g = new Game(5);
  g.beginBattle([{ uid: g.uid(), enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = phase;
  if (phase === "place") {
    b.focus = resource;
    b.hand = [g.newCard(id)];
  } else {
    b.channel = resource;
    b.hand = [];
    const c = g.instance(g.newCard(id));
    c.used = used;
    b.grid[0] = [c];
  }
  const { app, page } = await open(g);
  try {
    const arrow = page.getByRole("button", {
      name: phase === "place" ? "Begin activation" : "End turn",
      exact: true,
    });
    assert.ok(await arrow.isEnabled());
    assert.equal(
      await arrow.evaluate((el) => el.classList.contains("next-choice")),
      pulse,
    );
    assert.equal(
      await arrow.evaluate((el) => getComputedStyle(el).animationName),
      pulse ? "phase-ready" : "none",
    );
    assert.equal(await page.locator(".phase-step.next-choice").count(), 0);
    if (name === "zero-focus-free-card")
      assert.equal(
        await page.locator('[data-hand][draggable="true"]').count(),
        1,
      );
    if (pulse) {
      const colors = await arrow.evaluate(async (el) => {
        const a = getComputedStyle(el).backgroundColor;
        await new Promise((r) => setTimeout(r, 450));
        return [a, getComputedStyle(el).backgroundColor];
      });
      assert.notEqual(colors[0], colors[1]);
    }
    if (name === "all-activations-used") {
      await page.mouse.move(0, 0);
      await page.screenshot({
        path: "reports/screenshots/readability/arrow-pulse.png",
      });
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(
        await arrow.evaluate((el) => getComputedStyle(el).animationName),
        "none",
      );
      assert.equal(
        await arrow.evaluate((el) => getComputedStyle(el).outlineStyle),
        "solid",
      );
      report.checks.push(
        "Reduced motion retains a steady outlined arrow without animation",
      );
    }
    report.checks.push(
      name + ": " + (pulse ? "visible arrow pulse" : "no exhaustion pulse"),
    );
  } finally {
    await app.close();
  }
}
{
  const g = new Game(9);
  g.s.mode = "field";
  Object.assign(g.s.field, {
    round: 16,
    spawned: 32,
    queue: [],
    moves: 2,
    entities: [
      {
        uid: g.uid(),
        enemy: "imp",
        count: 1,
        x: 0,
        y: 0,
        restless: 0,
        born: 1,
      },
      { uid: g.uid(), type: "Item", x: 9, y: 9 },
    ],
  });
  const { app, page } = await open(g);
  try {
    await page.locator('[data-cell="61"]').click();
    await page.waitForSelector(".presentation-bar");
    async function brightness(label) {
      const styles = await page.locator(".field .tile").evaluateAll((xs) =>
        xs.map((el) => ({
          opacity: getComputedStyle(el).opacity,
          disabled: el.disabled,
        })),
      );
      assert.equal(styles.length, 121);
      assert.ok(styles.every((x) => x.opacity === "1" && x.disabled));
      assert.equal(
        await page
          .locator(".player-portrait")
          .evaluate((el) => getComputedStyle(el).opacity),
        "1",
      );
      report.checks.push(
        label +
          ": all 121 tiles and player/equipment panel stay opaque while input is locked",
      );
    }
    await brightness("Player movement");
    await page.screenshot({
      path: "reports/screenshots/readability/player-movement.png",
    });
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    await page
      .getByRole("button", { name: "End movement", exact: true })
      .click();
    await page.waitForSelector(".presentation-bar");
    await brightness("Enemy movement");
    await page.screenshot({
      path: "reports/screenshots/readability/enemy-movement.png",
    });
    await page.waitForSelector(".mind");
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/readability-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
