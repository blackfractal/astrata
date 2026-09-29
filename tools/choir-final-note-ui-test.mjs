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
const dir = "reports/screenshots/choir-final-note";
await fs.mkdir(dir, { recursive: true });
for (const mode of ["defend", "lethal", "reduced", "skip"]) {
  const g = new Game(8);
  const bracelet = g.s.equipment.wrist2;
  g.s.equipment = mode === "defend" ? { wrist2: bracelet } : {};
  g.beginBattle([{ uid: 900, enemy: "choir", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.hand = [];
  b.grid[0] = [g.instance(g.newCard("blast"))];
  b.enemies[0].hp = 1;
  b.enemies[0].cycle = 3;
  g.s.hp = mode === "lethal" ? 20 : 21;
  if (mode === "defend")
    b.bracelets = [
      { uid: bracelet, block: 2, element: "Arcane", name: "Bronze Bracelet" },
    ];
  const profile = path.resolve(".tmp/choir-final-note-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, fast: mode !== "skip" }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  const p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
  try {
    await p.locator('[data-ui="continue"]').click();
    if (mode === "reduced") await p.emulateMedia({ reducedMotion: "reduce" });
    assert.match(
      await p.locator(".death-warning").textContent(),
      /On death: Final Note.*20.*Light.*Cull/,
    );
    await p.locator(".enemy").click();
    const dialog = await p.locator("#modal").textContent();
    assert.match(dialog, /On death: Final Note deals 20 Light/);
    assert.match(dialog, /Chorus.*10.*Water/);
    await p.keyboard.press("Escape");
    if (mode === "defend") await p.screenshot({ path: dir + "/warning.png" });
    await p.evaluate(() => {
      window.timeline = [];
      const sample = () => {
        const hp = document.querySelector(".player-portrait b")?.textContent;
        const note = document.querySelector(
          ".presentation-bar span",
        )?.textContent;
        const enemy = document.querySelector(".enemy .info small")?.textContent;
        const victory = [...document.querySelectorAll(".eyebrow")].some(
          (x) => x.textContent === "Victory",
        );
        const died = document.querySelector("h1")?.textContent === "You Died";
        window.timeline.push({ hp, note, enemy, victory, died });
      };
      new MutationObserver(sample).observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
      });
      sample();
    });
    await p.locator('[data-activate-slot="0"]').dblclick();
    if (mode === "skip") await p.locator("[data-skip]").click();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    if (mode === "defend") {
      assert.equal(await p.locator(".enemy").count(), 1);
      assert.deepEqual(
        await p.locator(".phase-step.active").allTextContents(),
        ["4 · Enemy"],
      );
      assert.match(
        await p.locator(".enemy .info small").first().textContent(),
        /0 \/ 159/,
      );
      assert.match(
        await p.locator(".incoming-attack").textContent(),
        /Final Note/,
      );
      assert.match(
        await p.locator(".player-portrait b").textContent(),
        /21\/65/,
      );
      await p.screenshot({ path: dir + "/defend-final-note.png" });
      await p
        .locator('.battle-player .gear-item[data-item-uid="' + bracelet + '"]')
        .click();
      await p.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
    }
    const timeline = await p.evaluate(() => window.timeline);
    if (mode === "lethal") {
      assert.equal(await p.locator("h1").textContent(), "You Died");
      const zero = timeline.findIndex((x) => x.hp?.startsWith("0/"));
      assert.ok(zero >= 0 && timeline.findIndex((x) => x.died) > zero);
      assert.ok(!timeline.some((x) => x.victory));
      await p.screenshot({ path: dir + "/final-note-defeat.png" });
    } else {
      assert.ok(timeline.some((x) => x.victory));
      if (mode !== "skip") {
        const damage = timeline.findIndex((x) =>
          x.hp?.startsWith(mode === "defend" ? "3/" : "1/"),
        );
        assert.ok(damage >= 0 && timeline.findIndex((x) => x.victory) > damage);
      }
    }
    if (mode !== "skip")
      assert.ok(timeline.some((x) => x.note === "Final Note"));
    assert.equal(
      await p
        .locator(".attack-bolt,.impact-number,.spell-impact,.presentation-bar")
        .count(),
      0,
    );
    report.checks.push({
      mode,
      warning: true,
      correctOutcome: true,
      animationOrder: mode === "skip" ? "skipped" : "verified",
    });
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/choir-final-note-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
