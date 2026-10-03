import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.66", checks: [], errors: [] };
await fs.mkdir("reports/screenshots/defense-controls", { recursive: true });
function fixture(id = "shield", neighbors = 2) {
  const g = new Game(12);
  g.s.equipment = {};
  g.s.equipment.head = g.addItem("crown").uid;
  g.s.equipment.torso = g.addItem("fireArmor").uid;
  g.beginBattle([
    { uid: 900, enemy: "beetle", restless: 0 },
    { uid: 901, enemy: "beetle", restless: 0 },
  ]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 10;
  b.hand = [];
  b.grid[8] = [g.instance(g.newCard(id))];
  if (neighbors) b.grid[7] = [g.instance(g.newCard("corner"))];
  if (neighbors > 1) b.grid[9] = [g.instance(g.newCard("rain"))];
  for (const e of b.enemies) e.hp = e.maxHp = 100;
  b.enemies[0].element = "Earth";
  b.enemies[1].element = "Fire";
  delete g.s.checkpoint;
  return g;
}
async function check(name, g, fn, fast = true) {
  const profile = path.resolve(".tmp/defense-controls-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, fast }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    const settle = () =>
      p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    const state = async () => {
      const [id] = await fs.readdir(path.join(profile, "runs"));
      return JSON.parse(
        await fs.readFile(
          path.join(profile, "runs", id, "latest.json"),
          "utf8",
        ),
      );
    };
    await settle();
    await fn(p, state, settle);
    report.checks.push(name);
    console.log(name);
  } finally {
    await app.close();
  }
}
const control = (p) => p.locator('[data-activate-slot="8"]');
const source = (p) => p.locator('[data-slot="8"]');
await check(
  "Shield preview switches repeatedly, Unattunes and cancels without costs; card art still opens details",
  fixture(),
  async (p, state) => {
    await source(p).locator(".name").click();
    assert.equal(await p.locator("#modal").isVisible(), true);
    await p.locator("#modal [data-close]").click();
    assert.match(await control(p).textContent(), /Shield 4.*\(\+2\)/);
    await control(p).click();
    assert.equal(
      await source(p).getAttribute("data-preview-element"),
      "Arcane",
    );
    await p.locator('[data-slot="7"].target-option').click();
    assert.equal(await source(p).getAttribute("data-preview-element"), "Fire");
    await p.locator('[data-slot="9"].target-option').click();
    assert.equal(await source(p).getAttribute("data-preview-element"), "Water");
    await p.locator("[data-target-unattune]").click();
    assert.equal(
      await source(p).getAttribute("data-preview-element"),
      "Arcane",
    );
    assert.equal((await state()).battle.channel, 10);
    assert.equal((await state()).battle.shields.length, 0);
    assert.equal(await p.locator(".gear-item.target-option").count(), 0);
    await p.screenshot({
      path: "reports/screenshots/defense-controls/selection.png",
    });
    await p.locator(".battle-player h3").count();
    await p.mouse.click(10, 10);
    assert.equal(await p.locator(".targeting-bar").count(), 0);
    assert.equal(await source(p).getAttribute("data-preview-element"), null);
    assert.equal((await state()).battle.channel, 10);
    await control(p).click();
    await p.locator('[data-slot="7"].target-option').click();
    await p.keyboard.press("Escape");
    assert.equal(await p.locator(".targeting-bar").count(), 0);
    assert.equal(await source(p).getAttribute("data-preview-element"), null);
    await source(p).dragTo(p.locator('[data-slot="30"]'));
    assert.equal(await p.locator(".targeting-bar").count(), 0);
    assert.equal((await state()).battle.channel, 10);
  },
);
await check(
  "Drag Shield between attunement sources then confirm; helmet sphere comes from helmet exactly once",
  fixture(),
  async (p, state, settle) => {
    await p.evaluate(() => {
      window.boosts = [];
      new MutationObserver((records) => {
        for (const r of records)
          for (const n of r.addedNodes)
            if (n.nodeType === 1 && n.matches?.(".gear-power-sphere"))
              window.boosts.push({
                source: n.dataset.sourceItem,
                slot: n.dataset.targetSlot,
              });
      }).observe(document.body, { childList: true });
    });
    await source(p).dragTo(p.locator('[data-slot="7"]'));
    assert.equal(await source(p).getAttribute("data-preview-element"), "Fire");
    await source(p).dragTo(p.locator('[data-slot="9"]'));
    assert.equal(await source(p).getAttribute("data-preview-element"), "Water");
    await source(p).dragTo(p.locator("[data-target-unattune]"));
    assert.equal(
      await source(p).getAttribute("data-preview-element"),
      "Arcane",
    );
    await p.locator('[data-slot="7"].target-option').click();
    assert.equal((await state()).battle.channel, 10);
    await p.locator("[data-target-activate]").click();
    await settle();
    const s = await state();
    assert.equal(s.battle.channel, 9);
    assert.equal(s.battle.shields.length, 1);
    assert.equal(s.battle.shields[0].block, 6);
    assert.equal(s.battle.shields[0].element, "Fire");
    assert.deepEqual(await p.evaluate(() => window.boosts), [
      { source: String(s.equipment.head), slot: "8" },
    ]);
  },
  false,
);
await check(
  "One neighboring element still offers neutral; double-click commits neutral Shield once",
  fixture("shield", 1),
  async (p, state, settle) => {
    await control(p).dblclick();
    await settle();
    const s = await state();
    assert.equal(s.battle.shields[0].element, "Arcane");
    assert.equal(s.battle.channel, 9);
    assert.equal(s.battle.shields.length, 1);
  },
);
await check(
  "No attunement sources keeps single-click Shield activation",
  fixture("shield", 0),
  async (p, state, settle) => {
    await control(p).click();
    await settle();
    assert.equal((await state()).battle.shields[0].element, "Arcane");
  },
);
await check(
  "Blast can change attunement then drag onto chosen enemy; previewed matchup matches damage",
  fixture("blast"),
  async (p, state, settle) => {
    await control(p).click();
    await p.locator('[data-slot="7"].target-option').click();
    await p.locator('[data-slot="9"].target-option').click();
    await source(p).dragTo(p.locator('[data-enemy-uid="901"]'));
    await settle();
    const s = await state();
    assert.equal(s.battle.enemies[0].hp, 100);
    assert.equal(s.battle.enemies[1].hp, 94);
    assert.equal(s.battle.channel, 9);
  },
);
await check(
  "Double-click uses chosen element and top displayed enemy",
  fixture("blast"),
  async (p, state, settle) => {
    await control(p).click();
    await p.locator('[data-slot="7"].target-option').click();
    await control(p).dblclick();
    await settle();
    const s = await state();
    assert.equal(s.battle.enemies[0].hp, 94);
    assert.equal(s.battle.enemies[1].hp, 100);
    assert.equal(s.battle.channel, 9);
  },
);
await check(
  "Default double-click attacks neutrally even with several attunements",
  fixture("blast"),
  async (p, state, settle) => {
    await control(p).dblclick();
    await settle();
    const s = await state();
    assert.equal(s.battle.enemies[0].hp, 96);
    assert.equal(s.battle.channel, 9);
  },
);
const armor = fixture();
armor.s.battle.grid = armor.s.battle.grid.map(() => []);
armor.s.battle.phase = "enemy";
armor.s.battle.bracelets = [
  {
    uid: armor.s.inventory[0].uid,
    name: "Bronze Bracelet",
    block: 2,
    element: "Arcane",
  },
];
armor.s.equipment.wrist2 = armor.s.inventory[0].uid;
armor.s.battle.reaction = {
  stage: "bracelet",
  column: -1,
  damage: 10,
  element: "Earth",
  source: 900,
  name: "Test",
  intercepted: [],
};
armor.s.battle.jobs = [];
await check(
  "Armor pulses and clicks as equipment, spends once, then Bracelet remains selectable",
  armor,
  async (p, state, settle) => {
    const uid = (await state()).equipment.torso;
    const el = p.locator(`.battle-player [data-item-uid="${uid}"]`);
    assert.ok((await el.getAttribute("class")).includes("block-available"));
    await el.click();
    await settle();
    let s = await state();
    assert.equal(s.battle.reaction.damage, 7);
    assert.equal(s.battle.reaction.armorUsed, true);
    assert.ok(!(await el.getAttribute("class")).includes("block-available"));
    await p
      .locator(`.battle-player [data-item-uid="${s.equipment.wrist2}"]`)
      .click();
    await settle();
    s = await state();
    assert.equal(s.hp, 65);
  },
);
await check(
  "Clicking Druid skips both armor and Bracelet",
  armor,
  async (p, state, settle) => {
    await p.locator(".battle-player .player-portrait").click();
    await settle();
    const s = await state();
    assert.equal(s.hp, 60);
    assert.equal(s.battle.bracelets[0].block, 2);
  },
);
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/defense-controls-verification.json",
  JSON.stringify(report, null, 2),
);
