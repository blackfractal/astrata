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
for (const mode of ["field", "battle"]) {
  const g = new Game(8);
  g.s.gold = 77;
  if (mode === "field") g.beginRound();
  else g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const profile = path.resolve(`.tmp/return-start-${mode}-${Date.now()}`);
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
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
    if (mode === "field") await p.locator('[data-cell="48"]').click();
    else
      await p
        .getByRole("button", { name: "Begin activation", exact: true })
        .click();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    const before = JSON.parse(
      await fs.readFile(path.join(profile, "save.json"), "utf8"),
    );
    await p.locator('[data-ui="pause"]').click();
    assert.equal(
      await p
        .getByText("Return to Desktop · autosaves first", { exact: true })
        .count(),
      0,
    );
    await p
      .getByRole("button", {
        name: "Return to Start · autosaves first",
        exact: true,
      })
      .click();
    await p.locator('[data-ui="continue"]').waitFor();
    assert.equal(p.isClosed(), false);
    assert.equal(await p.locator("#modal").isVisible(), false);
    assert.equal(
      await p.getByRole("button", { name: "Quit", exact: true }).count(),
      1,
    );
    await p.keyboard.press("Escape");
    assert.equal(await p.locator("#modal").isVisible(), false);
    const saved = JSON.parse(
      await fs.readFile(path.join(profile, "save.json"), "utf8"),
    );
    assert.equal(saved.gold, 77);
    assert.equal(saved.uiMeta.runId, before.uiMeta.runId);
    assert.ok(saved.uiMeta.elapsed >= before.uiMeta.elapsed);
    assert.equal(saved.steps, before.steps);
    await p.locator('[data-ui="continue"]').click();
    if (mode === "field") {
      assert.equal(
        await p.locator('[data-cell="48"] [data-player-token]').count(),
        1,
      );
      assert.equal(saved.field.moves, 1);
    } else {
      assert.equal(saved.battle.phase, "place");
      assert.equal(
        await p
          .getByRole("button", { name: "Begin activation", exact: true })
          .isEnabled(),
        true,
      );
    }
    report.checks.push(
      `${mode}: autosave retains run identity/time/progress, app stays open on start screen with Continue/Quit, modal closes, Continue restores ${mode === "battle" ? "the existing battle-opening checkpoint" : "the current field position"}.`,
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/return-start-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
