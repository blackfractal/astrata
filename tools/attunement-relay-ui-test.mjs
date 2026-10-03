import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.69", checks: [], errors: [] };
const g = new Game(4);
g.s.equipment = {};
g.s.equipment.wrist1 = g.addItem("silver").uid;
g.s.equipment.wrist2 = g.addItem("gold").uid;
g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
const b = g.s.battle;
b.phase = "activate";
b.channel = 20;
b.hand = [];
b.enemies[0].hp = b.enemies[0].maxHp = 100;
b.enemies[0].element = "Wind";
for (const [i, id] of [
  [7, "thorn"],
  [8, "shield"],
  [9, "blast"],
  [10, "shield"],
])
  b.grid[i] = [g.instance(g.newCard(id))];
delete g.s.checkpoint;
const profile = path.resolve(".tmp/attunement-relay-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.mkdir("reports/screenshots/attunement-relay", { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, fast: true }),
);
let app, p;
async function open() {
  app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  await settle();
}
const settle = () =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
const slot = (i) => p.locator(`[data-slot="${i}"]`),
  control = (i) => p.locator(`[data-activate-slot="${i}"]`);
const state = async () => {
  const save = JSON.parse(
    await fs.readFile(path.join(profile, "save.json"), "utf8"),
  );
  const id = save.uiMeta.runId;
  return JSON.parse(
    await fs.readFile(path.join(profile, "runs", id, "latest.json"), "utf8"),
  );
};
try {
  await open();
  await control(8).click();
  await slot(7).click();
  assert.equal(await slot(8).getAttribute("data-preview-element"), "Earth");
  assert.equal(
    await p
      .locator('[data-from="8"][data-to="9"][data-link-type="attune"]')
      .count(),
    0,
  );
  await p.keyboard.press("Escape");
  assert.equal((await state()).battle.channel, 20);
  await control(9).click();
  assert.equal(await slot(8).getAttribute("data-target-choice"), null);
  await p.keyboard.press("Escape");
  report.checks.push(
    "Preview and cancellation never relay or spend Channel; unactivated Shield is not an attunement source.",
  );
  await control(8).click();
  await slot(7).click();
  await p.locator("[data-target-activate]").click();
  await settle();
  assert.match(
    await slot(8).locator(".element-label").textContent(),
    /Earth relay/,
  );
  assert.equal(
    await p
      .locator('[data-from="8"][data-to="9"][data-link-type="attune"]')
      .count(),
    1,
  );
  const exact = await state();
  delete exact.checkpoint;
  exact.log = [];
  exact.history = []; // Run archives omit rolling presentation history.
  await app.close();
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(exact));
  await open();
  await slot(9).dragTo(slot(8));
  assert.equal(await slot(9).getAttribute("data-preview-element"), "Earth");
  await slot(9).dragTo(p.locator('[data-enemy-uid="900"]'));
  await settle();
  assert.equal((await state()).battle.enemies[0].hp, 94);
  report.checks.push(
    "Committed Shield survives exact-state resume and becomes a clickable/draggable Earth source; Blast deals the expected6 against Wind.",
  );
  await control(10).click();
  assert.equal(await slot(9).getAttribute("data-target-choice"), "element");
  await slot(9).click();
  await p.locator("[data-target-activate]").click();
  await settle();
  const s = await state();
  assert.equal(s.battle.channel, 17);
  assert.equal(s.battle.shields[1].element, "Earth");
  assert.match(
    await slot(10).locator(".element-label").textContent(),
    /Earth relay/,
  );
  await p.screenshot({
    path: "reports/screenshots/attunement-relay/chain.png",
  });
  report.checks.push(
    "Shield to Blast to Shield chain updates source cues, colors, links and stored block, spending one Channel each.",
  );
  await p.locator("button.phase-arrow.available").click();
  await settle();
  assert.equal((await state()).battle.phase, "enemy");
  await p.locator(".battle-player .player-portrait").click();
  await settle();
  const next = await state();
  assert.equal(next.battle.turn, 2);
  assert.deepEqual(
    next.battle.bracelets.map((x) => x.block),
    [4, 7],
  );
  assert.equal(
    await p
      .locator('[data-from="8"][data-to="9"][data-link-type="attune"]')
      .count(),
    0,
  );
  assert.doesNotMatch(
    await slot(8).locator(".element-label").textContent(),
    /relay/,
  );
  for (const [uid, n] of [
    [next.equipment.wrist1, 4],
    [next.equipment.wrist2, 7],
  ])
    assert.equal(
      await p
        .locator(`.battle-player [data-item-uid="${uid}"] .block-left`)
        .textContent(),
      `${n} block`,
    );
  report.checks.push(
    "All relays expire on next player turn; Silver4 and Gold7 refill and display correctly.",
  );
  assert.deepEqual(report.errors, []);
  await fs.writeFile(
    "reports/attunement-relay-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
} finally {
  await app?.close();
}
