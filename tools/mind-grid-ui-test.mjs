import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const g = new Game(8);
g.beginBattle([{ uid: 900, enemy: "colossus", restless: 0 }]);
const b = g.s.battle;
b.phase = "place";
b.focus = 5;
b.enemies[0].cycle = 2;
b.enemies[0].hp = 173;
b.hand = ["blast", "shield", "rain", "clear"].map((id) => g.newCard(id));
const put = (id, i) => {
  const c = g.instance(g.newCard(id));
  b.grid[i].push(c);
  return c;
};
for (const [id, i] of [
  ["blast", 0],
  ["corner", 6],
  ["rain", 7],
  ["shield", 8],
  ["shield", 9],
  ["thorn", 14],
  ["ignis", 16],
  ["blast", 21],
  ["transmute", 25],
  ["ward", 28],
  ["kiln", 30],
  ["golem", 35],
  ["blast", 38],
  ["blast", 39],
  ["blast", 40],
])
  put(id, i);
b.grid[6][0].lock = true;
b.grid[6][0].sever = true;
b.grid[6][0].freeze = 2;
b.grid[35][0].hp = 4;
b.grid[30][0].charge = 2;
b.shields = [
  { uid: 990, slot: 8, owner: b.grid[8][0].uid, block: 5, element: "Water" },
];
const profile = path.resolve(".tmp/mind-grid-" + Date.now());
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
const report = { package: "1.3.29", rules: "1.3.17", checks: [], errors: [] };
p.on("pageerror", (e) => report.errors.push(e.message));
const settle = () =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
try {
  await p.locator('[data-ui="continue"]').click();
  assert.equal(await p.locator("[data-slot]").count(), 42);
  const layout = await p.locator(".mind").evaluate((el) => {
    const nodes = [...el.querySelectorAll("[data-slot]")],
      r = el.getBoundingClientRect();
    return {
      columns: new Set(
        nodes.map((x) => Math.round(x.getBoundingClientRect().left)),
      ).size,
      rows: new Set(nodes.map((x) => Math.round(x.getBoundingClientRect().top)))
        .size,
      inside: nodes.every((x) => {
        const a = x.getBoundingClientRect();
        return (
          a.left >= r.left &&
          a.right <= r.right + 1 &&
          a.top >= r.top &&
          a.bottom <= r.bottom + 1
        );
      }),
      cellWidth: nodes[0].offsetWidth,
      cellHeight: nodes[0].offsetHeight,
    };
  });
  assert.equal(layout.columns, 7);
  assert.equal(layout.rows, 6);
  assert.equal(layout.inside, true);
  assert.ok(layout.cellWidth >= 135);
  assert.ok(layout.cellHeight >= 80);
  assert.deepEqual(
    await p
      .locator(".grid-threat")
      .evaluateAll((xs) => xs.map((x) => Number(x.dataset.slot))),
    [0, 7, 14, 21, 28, 35],
  );
  assert.equal(
    await p
      .locator('[data-slot="35"] .ally-health')
      .getAttribute("aria-valuenow"),
    "4",
  );
  assert.equal(await p.locator('[data-slot="6"] .card-status').count(), 3);
  await fs.mkdir("reports/screenshots/mind-grid", { recursive: true });
  await p.mouse.move(5, 5);
  await p.screenshot({ path: "reports/screenshots/mind-grid/placement.png" });
  await p.locator("[data-hand]").first().dragTo(p.locator('[data-slot="41"]'));
  await settle();
  assert.equal(
    await p.locator('[data-slot="41"] .name').textContent(),
    "Blast",
  );
  assert.equal(
    await p.locator('[data-slot="40"] .synergy-bonus').textContent(),
    "↔ +2",
  );
  await p
    .getByRole("button", { name: "Begin activation", exact: true })
    .click();
  await settle();
  await p.locator('[data-activate-slot="41"]').dblclick();
  await settle();
  assert.equal(
    await p.locator('[data-slot="41"] .nums b').textContent(),
    "1/2 acts",
  );
  await p.locator('[data-activate-slot="25"]').click();
  const targetingClear = await p.evaluate(
    () =>
      document.querySelector(".targeting-bar").getBoundingClientRect().top >=
      document.querySelector(".mind").getBoundingClientRect().bottom,
  );
  assert.equal(targetingClear, true);
  await p.locator('[data-slot="41"].target-option').click();
  await p
    .locator(".target-elements")
    .getByRole("button", { name: "Water", exact: true })
    .click();
  await settle();
  assert.equal(
    await p.locator('[data-slot="41"]').getAttribute("data-visual-elements"),
    "Water",
  );
  await p.locator('[data-slot="35"] .name').click();
  assert.match(await p.locator(".card-detail").textContent(), /HP 4/);
  await p.locator(".dialog-close").click();
  await p.mouse.move(5, 5);
  await p.screenshot({ path: "reports/screenshots/mind-grid/activation.png" });
  report.checks.push({
    layout,
    dragToFinalSlot: true,
    activateFinalSlot: true,
    liveSynergy: true,
    allyHealth: true,
    statusIcons: true,
    fullDetails: true,
    lastRowVisible: true,
    phaseControls: true,
    targetingClearOfBoard: true,
    transmuteFinalSlot: true,
    columnTelegraph: true,
  });
  assert.deepEqual(report.errors, []);
  await fs.writeFile(
    "reports/mind-grid-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await app.close();
}
