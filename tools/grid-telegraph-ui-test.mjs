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
const dir = "reports/screenshots/grid-telegraph";
await fs.mkdir(dir, { recursive: true });
const settle = (p) =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
const marks = (p) =>
  p
    .locator(".grid-threat")
    .evaluateAll((nodes) => nodes.map((x) => Number(x.dataset.slot)));
for (const [id, cycle, initial, changed, targets] of [
  ["hart", 2, [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [5, 6]],
  ["colossus", 2, [0, 5, 10, 15], [1, 6, 11, 16], [1, 6]],
  ["choir", 0, [0], [1], [1]],
]) {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: id, restless: 0 }]);
  const b = g.s.battle;
  b.phase = "place";
  b.focus = 5;
  b.hand = [];
  b.enemies[0].cycle = cycle;
  for (const i of [0, 1, 5, 6]) b.grid[i] = [g.instance(g.newCard("blast"))];
  if (id === "hart") b.hand = [g.instance(g.newCard("clear"))];
  const profile = path.resolve(".tmp/grid-telegraph-" + Date.now());
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
  const p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
  try {
    await p.locator('[data-ui="continue"]').click();
    assert.deepEqual(await marks(p), initial);
    assert.match(
      await p.locator(".enemy .tell").textContent(),
      /Destroy (fullest row|fullest column|tallest stack)/,
    );
    assert.match(
      await p.locator(".grid-threat-label").textContent(),
      /card.*threatened.*next enemy turn/,
    );
    assert.equal(
      await p.locator(".grid-threat-badge").count(),
      id === "choir" ? 1 : 2,
    );
    await p.locator('[data-slot="0"] .name').click();
    await p.getByRole("button", { name: /Recall slot 1 ·/ }).click();
    await settle(p);
    assert.deepEqual(await marks(p), changed);
    if (id === "hart") {
      await p.locator("[data-hand]").dragTo(p.locator('[data-slot="9"]'));
      await settle(p);
      assert.equal(await p.locator('[data-slot="9"] .name').count(), 1);
      assert.equal(await p.locator(".grid-threat-badge").count(), 3);
      targets.push(9);
    }
    await p.mouse.move(5, 5);
    await p.screenshot({ path: dir + "/" + id + "-preview.png" });
    await p
      .getByRole("button", { name: "Begin activation", exact: true })
      .click();
    await settle(p);
    assert.deepEqual(await marks(p), changed);
    const attackSlot = id === "choir" ? 1 : 5;
    await p.locator('[data-activate-slot="' + attackSlot + '"]').dblclick();
    await settle(p);
    assert.deepEqual(await marks(p), changed);
    await p.getByRole("button", { name: "End turn", exact: true }).click();
    await settle(p);
    for (const slot of targets)
      assert.equal(
        await p.locator('[data-slot="' + slot + '"] .name').count(),
        0,
      );
    assert.equal(await p.locator(".grid-threat").count(), 0);
    report.checks.push({
      boss: id,
      initial,
      afterRecall: changed,
      dragPlacement: id === "hart",
      activationClickable: true,
      destructionMatches: true,
    });
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/grid-telegraph-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
