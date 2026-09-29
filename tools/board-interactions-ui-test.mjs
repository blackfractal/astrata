import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.29", checks: [], errors: [] };
const dir = "reports/screenshots/board-interactions";
await fs.mkdir(dir, { recursive: true });
const settle = (p) =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
const slot = (p, i) => p.locator(`[data-slot="${i}"]`);
function fixture() {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([
    { uid: 900, enemy: "beetle", restless: 0 },
    { uid: 901, enemy: "beetle", restless: 0 },
  ]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 15;
  b.hand = [];
  for (const e of b.enemies) e.hp = e.maxHp = 100;
  return g;
}
function put(g, id, i, element) {
  const c = g.instance(g.newCard(id));
  if (element) c.element = element;
  g.s.battle.grid[i] = [c];
  return c;
}
async function open(g, label) {
  const profile = path.resolve(".tmp/board-" + label + "-" + Date.now());
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
  await p.locator('[data-ui="continue"]').click();
  return { app, p, profile };
}
{
  const g = fixture();
  for (const [id, i, el] of [
    ["shield", 8],
    ["shield", 9],
    ["rain", 7],
    ["thorn", 1, "Fire"],
    ["transmute", 11],
    ["blast", 22],
    ["blast", 23],
    ["blast", 24],
  ])
    put(g, id, i, el);
  const { app, p, profile } = await open(g, "shields");
  try {
    assert.equal(await p.locator(".link-synergy").count(), 3);
    assert.equal(
      await slot(p, 23).locator(".synergy-bonus").textContent(),
      "↔ +2",
    );
    await slot(p, 8).hover();
    assert.equal(await p.locator(".link-attune.link-inspected").count(), 2);
    await p.locator('[data-activate-slot="8"]').click();
    await p.locator('[data-slot="7"].target-option').click();
    await settle(p);
    assert.equal(
      await slot(p, 8).getAttribute("data-visual-elements"),
      "Water",
    );
    assert.equal(
      await slot(p, 8).locator(".shield-portion").textContent(),
      "5 Water",
    );
    await p.locator('[data-activate-slot="9"]').dblclick();
    await settle(p);
    assert.equal(
      await slot(p, 9).getAttribute("data-visual-elements"),
      "Arcane",
    );
    await p.locator('[data-activate-slot="11"]').click();
    await p.locator('[data-slot="8"].target-option').click();
    await p
      .locator(".target-elements")
      .getByRole("button", { name: "Earth", exact: true })
      .click();
    await settle(p);
    assert.equal(
      await slot(p, 8).getAttribute("data-visual-elements"),
      "Earth",
    );
    assert.equal(
      await slot(p, 8).locator(".shield-portion").textContent(),
      "5 Water",
    );
    await p.mouse.move(5, 5);
    await p.screenshot({ path: dir + "/shield-transmute-synergy.png" });
    const ids = await fs.readdir(path.join(profile, "runs"));
    assert.equal(ids.length, 1);
    const events = (
      await fs.readFile(
        path.join(profile, "runs", ids[0], "events.jsonl"),
        "utf8",
      )
    )
      .trim()
      .split("\n")
      .map(JSON.parse);
    assert.equal(events[0].kind, "resume");
    assert.equal(events.filter((e) => e.kind === "decision").length, 3);
    assert.equal(events.at(-1).state.battle.grid[8][0].element, "Earth");
    assert.equal(events.at(-1).version.package, "1.3.29");
    report.checks.push(
      "Shield Water portion, persistent Earth Transmute with original Water block, independent Arcane neighbor, three synergy links/+2 central bonus, source hover; desktop archive captures all three decisions and exact state.",
    );
  } finally {
    await app.close();
  }
}
{
  const g = fixture();
  put(g, "blast", 8);
  put(g, "thorn", 7, "Fire");
  put(g, "rain", 9);
  const { app, p } = await open(g, "preview");
  try {
    await p.locator('[data-activate-slot="8"]').click();
    await p.locator('[data-slot="9"].target-option').click();
    assert.equal(
      await slot(p, 8).getAttribute("data-preview-element"),
      "Water",
    );
    await p.getByRole("button", { name: "Cancel", exact: true }).click();
    assert.equal(await slot(p, 8).getAttribute("data-preview-element"), null);
    assert.equal(
      await slot(p, 8).getAttribute("data-visual-elements"),
      "Arcane",
    );
    await p.locator('[data-activate-slot="8"]').click();
    await p.locator('[data-slot="9"].target-option').click();
    await p.locator('[data-enemy-uid="900"].target-option').click();
    await settle(p);
    assert.equal(
      await slot(p, 8).locator(".element-label").textContent(),
      "Cast Water",
    );
    await p.screenshot({ path: dir + "/cast-water.png" });
    await p.getByRole("button", { name: "End turn", exact: true }).click();
    await settle(p);
    assert.equal(
      await slot(p, 8).getAttribute("data-visual-elements"),
      "Arcane",
    );
    report.checks.push(
      "Uncommitted Water preview cancels to Arcane; resolved Blast shows Water cast this turn and resets on next turn.",
    );
  } finally {
    await app.close();
  }
}
{
  const g = fixture(),
    c = put(g, "shield", 8);
  g.s.battle.shields = [
    { uid: 990, slot: 8, owner: c.uid, block: 3, element: "Fire" },
    { uid: 991, slot: 8, owner: c.uid, block: 4, element: "Water" },
  ];
  const { app, p } = await open(g, "mixed");
  try {
    assert.equal(
      await slot(p, 8).getAttribute("data-visual-elements"),
      "Fire,Water",
    );
    assert.deepEqual(
      await slot(p, 8).locator(".shield-portion").allTextContents(),
      ["3 Fire", "4 Water"],
    );
    await p.screenshot({ path: dir + "/mixed-shield.png" });
    report.checks.push(
      "Mixed Shield shows separate remaining Fire and Water portions with segmented tint.",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/board-interactions-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
