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
for (const mode of ["weald", "clearing", "movement-forfeit"]) {
  const g =
    mode === "weald" ? new Game(8) : startTutorial(new Game(TUTORIAL.seed));
  if (mode === "weald") g.beginRound();
  if (mode === "movement-forfeit")
    while (g.s.tutorial.lesson !== mode) g.act(g.legal()[0]);
  const profile = path.resolve(".tmp/tutorial-art-" + mode + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  const file = mode === "weald" ? "save.json" : "tutorial-save.json";
  await fs.writeFile(path.join(profile, file), JSON.stringify(g.s));
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
    await p
      .locator(
        `[data-ui="${mode === "weald" ? "continue" : "continueTutorial"}"]`,
      )
      .click();
    if (mode !== "movement-forfeit") {
      const bg = await p
        .locator(".field")
        .evaluate((el) => getComputedStyle(el).backgroundImage);
      assert.ok(
        bg.includes(
          mode === "weald"
            ? "location-weald-topdown.png"
            : "location-field-topdown.png",
        ),
      );
      await p.locator(".field").evaluate(async (el) => {
        const url = getComputedStyle(el).backgroundImage.match(
          /url\(["']?(.*?)["']?\)/,
        )[1];
        const img = new Image();
        img.src = url;
        await img.decode();
      });
      assert.equal(await p.locator("[data-cell]").count(), 121);
    } else {
      await p.locator('.catalog img[src$="item-sapphire-v2.png"]').waitFor();
      assert.match(
        await p.locator(".tutorial-movement").textContent(),
        /0 movement remaining/,
      );
      assert.equal(await p.locator(".catalog button[disabled]").count(), 1);
      await p.mouse.move(5,5);
      await p.screenshot({path:"reports/screenshots/tutorial/movement-forfeit.png"});
      await p.locator("[data-tutorial-next]").click();
      await p.locator('[data-tutorial-step="gem-take"]').waitFor();
      const s = JSON.parse(
          await fs.readFile(profile + "/tutorial-save.json", "utf8"),
        ),
        h = new Game(0, s);
      const a = h.legal()[0];
      await p.locator("[data-action=" + JSON.stringify(a.key) + "]").click();
      await p.locator('[data-tutorial-step="gem-save"]').waitFor();
    }
    await p.mouse.move(5, 5);
    await p.screenshot({
      path: "reports/screenshots/tutorial/" + mode + "-art.png",
    });
    report.checks.push(
      mode + ": correct art, visible controls and expected transition",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/tutorial-art-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
