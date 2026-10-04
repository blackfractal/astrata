import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = { package: "2.0.4", checks: [], errors: [] },
  dir = "reports/screenshots/consumables";
await fs.mkdir(dir, { recursive: true });
async function open(g, label) {
  delete g.s.checkpoint;
  g.s.log = [];
  g.s.history = [];
  const profile = path.resolve(".tmp/consumables-" + label + "-" + Date.now());
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
  async function state() {
    const dirs = await fs.readdir(path.join(profile, "runs"), {
      withFileTypes: true,
    });
    const name = dirs.find((x) => x.isDirectory() && x.name !== "builds").name;
    const raw = JSON.parse(
      await fs.readFile(
        path.join(profile, "runs", name, "latest.json"),
        "utf8",
      ),
    );
    return raw.state || raw;
  }
  async function settle() {
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
  }
  async function act(type) {
    const current = new Game(0, await state()),
      a = current.legal().find((x) => x.type === type);
    assert.ok(a, type);
    await p
      .locator("[data-action=" + JSON.stringify(a.key) + "]")
      .filter({ visible: true })
      .first()
      .click();
    await settle();
  }
  return { app, p, state, settle, act };
}
const g = new Game(908);
g.s.inventory = [];
for (const k in g.s.equipment) g.s.equipment[k] = null;
g.beginBattle([
  { uid: 800, enemy: "beetle", restless: 0 },
  { uid: 801, enemy: "beetle", restless: 0 },
]);
g.s.hp = 50;
for (const e of g.s.battle.enemies) {
  e.hp = e.maxHp = 999;
  e.element = "Arcane";
}
const bottles = Object.fromEntries(
  [
    "healingSap",
    "focusDraught",
    "channelDraught",
    "insightDew",
    "starFlask",
  ].map((id) => [id, g.addItem(id)]),
);
g.addItem("starFlask");
const live = await open(g, "battle"),
  { app, p, state, settle, act } = live;
try {
  for (const x of Object.values(bottles))
    await p
      .locator('[data-consumable-uid="' + x.uid + '"] img')
      .evaluate((img) => img.decode());
  await p
    .locator('[data-consumable-view="' + bottles.healingSap.uid + '"]')
    .click();
  assert.match(await p.locator("#modal").textContent(), /Restore 5 HP/);
  await p.locator(".dialog-close").click();
  await p.screenshot({ path: dir + "/placement.png" });
  const use = async (id) => {
    await p
      .locator(
        '[data-consumable-uid="' + bottles[id].uid + '"] .consumable-use',
      )
      .click();
    await settle();
  };
  const hand = (await state()).battle.hand.map((c) => c.uid);
  await use("insightDew");
  let s = await state();
  assert.equal(s.battle.hand.length, hand.length + 1);
  assert.deepEqual(
    s.battle.hand.slice(0, hand.length).map((c) => c.uid),
    hand,
  );
  assert.equal(await p.locator(".consumable-use:not([disabled])").count(), 0);
  await act("activatePhase");
  await act("endTurn");
  await use("focusDraught");
  assert.equal((await state()).battle.focus, 2);
  await act("activatePhase");
  await act("endTurn");
  await act("activatePhase");
  await use("channelDraught");
  assert.equal((await state()).battle.channel, 3);
  await act("endTurn");
  await act("activatePhase");
  const flask = bottles.starFlask.uid;
  await p.locator('[data-throw="' + flask + '"]').click();
  assert.equal(await p.locator(".consumable-target").count(), 2);
  await p.keyboard.press("Escape");
  assert.equal(await p.locator(".consumable-target").count(), 0);
  assert.equal(await p.locator("#modal").isVisible(), false);
  await p.locator('[data-throw="' + flask + '"]').click();
  await p.locator("[data-cancel-potion]").click();
  await p
    .locator('[data-consumable-uid="' + flask + '"]')
    .dragTo(p.locator(".resources"));
  await settle();
  assert.equal(
    (await state()).inventory.filter((x) => x.id === "starFlask").length,
    2,
  );
  await p.locator('[data-throw="' + flask + '"]').click();
  await p.screenshot({ path: dir + "/targeting.png" });
  let before = (await state()).battle.enemies[0];
  await p.locator(".enemy").first().click();
  await settle();
  let after = (await state()).battle.enemies[0];
  assert.equal(before.hp + before.guard - after.hp - after.guard, 6);
  await act("endTurn");
  await act("activatePhase");
  s = await state();
  const second = s.inventory.find((x) => x.id === "starFlask");
  before = s.battle.enemies[1];
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p
    .locator('[data-consumable-uid="' + second.uid + '"]')
    .dragTo(p.locator(".enemy").nth(1));
  await settle();
  after = (await state()).battle.enemies[1];
  assert.equal(before.hp + before.guard - after.hp - after.guard, 6);
  assert.equal(
    (await state()).inventory.filter((x) => x.id === "starFlask").length,
    0,
  );
  await p.screenshot({ path: dir + "/used.png" });
  report.checks.push(
    "All five arts load and details show 5HP; immediate Insight preserves hand; one-per-turn disables remaining supplies; Focus/Channel add one; direct enemy click and real drag both deal six; Cancel, Escape and off-target drop consume nothing; reduced-motion drag also works.",
  );
} finally {
  await app.close();
}
const f = new Game(45);
f.s.mode = "field";
f.s.inventory = [];
for (const k in f.s.equipment) f.s.equipment[k] = null;
f.s.field.entities = [];
f.s.hp = 60;
for (let n = 0; n < 13; n++) f.addItem("healingSap");
const overflow = await open(f, "overflow");
try {
  assert.match(
    await overflow.p.locator(".satchel-overflow h2").textContent(),
    /13 \/ 12/,
  );
  await overflow.p.screenshot({ path: dir + "/overflow.png" });
  await overflow.act("discardItem");
  assert.equal((await overflow.state()).inventory.length, 12);
  await overflow.p.locator('[data-ui="inventory"]').click();
  assert.match(
    await overflow.p.locator(".stash-label").textContent(),
    /12 \/ 12/,
  );
  const grid = await overflow.p
    .locator(".satchel")
    .evaluate((el) => ({
      columns: getComputedStyle(el).gridTemplateColumns.split(" ").length,
      rows: new Set(
        [...el.children].map((x) => Math.round(x.getBoundingClientRect().top)),
      ).size,
      count: el.children.length,
    }));
  assert.deepEqual(grid, { columns: 4, rows: 3, count: 12 });
  await overflow.p.screenshot({ path: dir + "/satchel-twelve.png" });
  await overflow.p.locator(".dialog-close").click();
  await overflow.p.locator(".consumable-use").click();
  await overflow.settle();
  assert.equal((await overflow.state()).hp, 65);
  assert.equal((await overflow.state()).inventory.length, 11);
  await overflow.p.locator('[data-ui="inventory"]').click();
  assert.equal(await overflow.p.locator(".satchel-empty").count(), 1);
  await overflow.p.locator(".dialog-close").click();
  await overflow.p.screenshot({ path: dir + "/field.png" });
  report.checks.push(
    "Overflow preserves all thirteen bottles until explicit discard; Inventory shows twelve/twelve; map Healing Sap restores five and reduces owned count by one.",
  );
} finally {
  await overflow.app.close();
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/consumables-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
