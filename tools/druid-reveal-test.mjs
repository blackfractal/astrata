import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = {
  package: "1.3.7",
  rules: "1.3.6",
  checks: [],
  errors: [],
  method:
    "Explicit saved Field fixture, ordinary movement into battle, with Normal/Fast/Skip/reduced-motion presentation; no altered draw order",
};
await fs.mkdir("reports/screenshots/druid-reveal", { recursive: true });
for (const mode of ["normal", "skip", "fast", "reduced"]) {
  const g = new Game(8);
  g.s.mode = "field";
  g.s.inventory = [];
  for (const k of Object.keys(g.s.equipment)) g.s.equipment[k] = null;
  Object.assign(g.s.field, {
    spawned: 32,
    round: 16,
    queue: [],
    entities: [
      {
        uid: g.uid(),
        enemy: "bat",
        count: 1,
        x: 6,
        y: 5,
        restless: 0,
        born: 1,
      },
    ],
  });
  const profile = path.resolve(".tmp/druid-reveal-" + mode + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, height: 800, fast: mode === "fast" }),
  );
  g.act(g.legal().find((a) => a.type === "move" && a.x === 6 && a.y === 5));
  const expected = g.s.battle.hand.map((c) => String(c.uid));
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const page = await app.firstWindow();
    page.on("pageerror", (e) => report.errors.push(e.message));
    await page.emulateMedia({
      reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
    });
    await page.locator('[data-ui="continue"]').click();
    await page.evaluate(() => {
      window.flips = [];
      window.revealTiming = {
        start: null,
        end: null,
        dealOverlap: 0,
        flipOverlap: 0,
      };
      function sample() {
        const els = [...document.querySelectorAll(".deal-card")],
          t = window.revealTiming;
        if (els.length) {
          t.start ??= performance.now();
          let deals = 0,
            flips = 0;
          for (const el of els)
            for (const a of el.getAnimations()) {
              if (a.playState !== "running") continue;
              const frames = a.effect.getKeyframes();
              if (frames.some((f) => f.transform?.includes("rotateY"))) flips++;
              else deals++;
            }
          t.dealOverlap = Math.max(t.dealOverlap, deals);
          t.flipOverlap = Math.max(t.flipOverlap, flips);
        } else if (t.start && !t.end) {
          t.end = performance.now();
        }
        if (!t.end) requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
      new MutationObserver(() => {
        const cards = [...document.querySelectorAll(".deal-card")];
        if (cards.length)
          window.flips.push(
            cards
              .filter((c) => !c.classList.contains("face-down"))
              .map((c) => c.dataset.hand),
          );
      }).observe(document.querySelector("#app"), {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    });
    await page.locator('[data-cell="61"]').click();
    if (
      await page
        .getByRole("button", { name: "Move here · start battle", exact: true })
        .isVisible()
    )
      await page
        .getByRole("button", { name: "Move here · start battle", exact: true })
        .click();
    await page.waitForSelector(".deal-card.face-down");
    assert.equal(
      await page.locator(".phasebar .active").textContent(),
      "1 · Reveal",
    );
    assert.equal(await page.locator(".phasebar button:enabled").count(), 0);
    assert.equal(
      await page
        .locator(".reveal-back")
        .first()
        .textContent()
        .then((x) => x.trim()),
      "",
    );
    assert.equal(
      await page.locator(".reveal-back .druid-seal").count(),
      expected.length,
    );
    if (mode === "normal") {
      await page.screenshot({
        path: "reports/screenshots/druid-reveal/face-down.png",
      });
      await page.waitForFunction(
        () =>
          document.querySelectorAll(".deal-card:not(.face-down)").length === 1,
      );
      await page.screenshot({
        path: "reports/screenshots/druid-reveal/first-flip.png",
      });
    }
    if (mode === "skip") await page.locator("[data-skip]").click();
    await page.waitForFunction(
      () => !document.querySelector(".presentation-bar"),
    );
    assert.equal(
      await page.locator(".phasebar .active").textContent(),
      "2 · Placement",
    );
    assert.deepEqual(
      await page
        .locator(".revealed-hand [data-hand]")
        .evaluateAll((xs) => xs.map((x) => x.dataset.hand)),
      expected,
    );
    if (mode !== "skip") {
      const flips = await page.evaluate(() => window.flips);
      for (let n = 0; n <= expected.length; n++)
        assert.ok(
          flips.some(
            (x) => JSON.stringify(x) === JSON.stringify(expected.slice(0, n)),
          ),
          JSON.stringify(flips),
        );
    }
    if (mode === "normal") {
      const timing = await page.evaluate(() => window.revealTiming);
      const elapsed = timing.end - timing.start;
      assert.ok(elapsed > 500 && elapsed < 2300, JSON.stringify(timing));
      assert.ok(timing.dealOverlap >= 2, JSON.stringify(timing));
      assert.ok(timing.flipOverlap >= 2, JSON.stringify(timing));
      report.normalRevealMs = Math.round(elapsed);
      report.overlappingDeals = timing.dealOverlap;
      report.overlappingFlips = timing.flipOverlap;
      report.checks.push(
        "Druid tree emblem without title; four-card Reveal under 2.3 seconds with overlapping deals/flips",
      );
      await page
        .getByRole("button", { name: "Begin activation", exact: true })
        .click();
      await page.getByRole("button", { name: "End turn", exact: true }).click();
      await page.waitForSelector(".deal-card.face-down");
      assert.equal(
        await page.locator(".phasebar .active").textContent(),
        "1 · Reveal",
      );
      await page.locator("[data-skip]").click();
      await page.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
      await page.getByText("Battle · Turn 2", { exact: true }).waitFor();
      report.checks.push("Reveal repeats on the next battle turn");
    }
    report.checks.push(
      mode +
        ": face-down dealing, ordered reveal, input lock, and automatic Placement complete with unchanged cards",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/druid-reveal-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
