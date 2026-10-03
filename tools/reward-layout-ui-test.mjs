import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards } from "../src/content.mjs";
const report = { package: "1.3.76", checks: [], errors: [] };
await fs.mkdir("reports/screenshots/reward-layout", { recursive: true });
for (const [width, offer] of [
  [1440, ["magnify", "seed", "storm"]],
  [960, ["familiar", "resonance", "ward"]],
]) {
  const g = new Game(1);
  g.s.mode = "reward";
  g.s.reward = { cards: offer, boss: false, gem: false, setting: false };
  delete g.s.checkpoint;
  const profile = path.resolve(
    ".tmp/reward-layout-" + width + "-" + Date.now(),
  );
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width, fast: true }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    await p.locator(".reward-option").first().waitFor();
    const geometry = await p.locator(".reward-option").evaluateAll((xs) =>
      xs.map((x) => {
        const c = x.querySelector(".card"),
          b = x.querySelector(".reward-choice button"),
          t = c.querySelector(".text"),
          cr = c.getBoundingClientRect(),
          br = b.getBoundingClientRect();
        return {
          width: cr.width,
          height: cr.height,
          top: cr.top,
          buttonTop: br.top,
          centerDelta: Math.abs(cr.x + cr.width / 2 - br.x - br.width / 2),
          clamp: getComputedStyle(t).webkitLineClamp,
          overflow: t.scrollHeight > t.clientHeight,
        };
      }),
    );
    for (const box of geometry) {
      assert.ok(Math.abs(box.height - geometry[0].height) < 1);
      assert.ok(Math.abs(box.width - geometry[0].width) < 1);
      assert.ok(Math.abs(box.buttonTop - geometry[0].buttonTop) < 1);
      assert.ok(box.centerDelta < 1);
      assert.equal(box.clamp, "4");
    }
    if (width === 960) assert.ok(geometry.some((x) => x.overflow));
    await p.mouse.move(1, 1);
    await p.waitForTimeout(200);
    await p.screenshot({
      path: `reports/screenshots/reward-layout/${width}.png`,
    });
    for (const id of offer) {
      await p.locator(`[data-inspect-card="${id}"]`).click();
      const text = await p.locator("#modal").innerText();
      assert.ok(text.includes(cards[id].text));
      assert.equal(await p.locator("#modal .full-art").count(), 1);
      await p.keyboard.press("Escape");
    }
    assert.equal(await p.locator(".reward-option").count(), 3);
    await p.locator(".reward-choice button").last().click();
    assert.equal(await p.locator(".reward-option").count(), 0);
    report.checks.push({
      width,
      offer,
      geometry,
      details:
        "Full text/art preserved; inspection did not select; separate centered choice button selected normally.",
    });
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/reward-layout-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
