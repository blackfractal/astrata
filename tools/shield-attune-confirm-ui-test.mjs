import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";

const report = { checks: [], errors: [] };
const cases = [
  "single-selected",
  "double-selected",
  "double-neutral",
  "card-double-selected",
  "cancel",
  "click-away",
  "explicit-neutral",
  "transmuted",
  "no-neighbors",
  "drag-selected",
];
for (const name of cases) {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.grid = b.grid.map(() => []);
  b.phase = "activate";
  b.channel = 5;
  b.hand = [];
  b.grid[8] = [g.instance(g.newCard("shield"))];
  if (name !== "no-neighbors") b.grid[7] = [g.instance(g.newCard("water"))];
  if (name === "transmuted")
    Object.assign(b.grid[8][0], { element: "Fire", transmuted: true });
  delete g.s.checkpoint;
  const profile = path.resolve(`.tmp/shield-confirm-${name}-${Date.now()}`);
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, fast: true }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("node_modules/electron/dist/electron.exe"),
    args: [path.resolve("."), "--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    const control = p.locator('[data-activate-slot="8"]');
    const host = p.locator('[data-slot="8"]');
    const provider = p.locator('[data-slot="7"]');
    const state = async () => {
      const save = JSON.parse(
        await fs.readFile(path.join(profile, "save.json"), "utf8"),
      );
      return JSON.parse(
        await fs.readFile(
          path.join(profile, "runs", save.uiMeta.runId, "latest.json"),
          "utf8",
        ),
      );
    };
    if (["double-neutral", "transmuted", "no-neighbors"].includes(name)) {
      await control.dblclick({ force: true });
    } else {
      if (name === "drag-selected") await host.dragTo(provider);
      else {
        await control.click();
        assert.equal((await state()).battle.channel, 5);
        await provider.click();
      }
      assert.equal(await host.getAttribute("data-preview-element"), "Water");
      if (name === "cancel" || name === "click-away") {
        if (name === "cancel") await p.locator("[data-target-cancel]").click();
        else await p.locator('[data-slot="20"]').click();
        assert.equal(await p.locator(".targeting-bar").count(), 0);
        assert.equal(await host.getAttribute("data-preview-element"), null);
        assert.equal((await state()).battle.channel, 5);
        await control.dblclick({ force: true });
      } else if (name === "explicit-neutral") {
        await p.locator("[data-target-unattune]").click();
        await p.locator("[data-target-activate]").click();
      } else if (name === "single-selected") await control.click();
      else if (name === "card-double-selected")
        await host.locator(".name").dblclick();
      else await control.dblclick({ force: true });
    }
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    const s = await state();
    const expected =
      name === "transmuted"
        ? "Fire"
        : [
              "double-neutral",
              "cancel",
              "click-away",
              "explicit-neutral",
              "no-neighbors",
            ].includes(name)
          ? "Arcane"
          : "Water";
    assert.equal(s.battle.channel, 4, `${name}: spend once`);
    assert.equal(s.battle.grid[8][0].used, 1, `${name}: one use`);
    assert.equal(s.battle.shields.length, 1);
    assert.equal(
      s.battle.shields[0].element,
      expected,
      `${name}: preserve chosen element`,
    );
    assert.equal(s.battle.grid[8][0].lastActivationElement, expected);
    if (name === "double-selected") {
      await fs.mkdir("reports/screenshots/shield-confirm", { recursive: true });
      await p.screenshot({
        path: "reports/screenshots/shield-confirm/water-committed.png",
      });
    }
    report.checks.push({ name, element: expected, spentChannel: 1 });
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/shield-attune-confirm-ui-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
