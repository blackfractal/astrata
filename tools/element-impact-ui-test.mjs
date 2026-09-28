import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.17", checks: [], errors: [] },
  dir = "reports/screenshots/element-impact";
await fs.mkdir(dir, { recursive: true });
async function open(g, fast = false) {
  const profile = path.resolve(".tmp/element-impact-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, height: 800, fast }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  const page = await app.firstWindow();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.locator('[data-ui="continue"]').click();
  await page.evaluate(() => {
    window.impacts = [];
    new MutationObserver((records) => {
      for (const r of records)
        for (const el of r.addedNodes)
          if (el.nodeType === 1 && el.matches(".spell-impact")) {
            const target = document.querySelector(
              ".enemy.impact,.slot.impact,.player-portrait.impact",
            );
            const b = target?.getBoundingClientRect();
            window.impacts.push({
              element: el.dataset.element,
              motion: el.dataset.motion,
              sparks: el.querySelectorAll(".impact-spark").length,
              core: el.querySelector("svg").innerHTML,
              color: el.style.getPropertyValue("--hit-color"),
              bolts: document.querySelectorAll(".attack-bolt").length,
              pointer: getComputedStyle(el).pointerEvents,
              centered:
                !!b &&
                Math.abs(parseFloat(el.style.left) - b.left - b.width / 2) <
                  1 &&
                Math.abs(parseFloat(el.style.top) - b.top - b.height / 2) < 1,
              target: target?.className,
            });
          }
    }).observe(document.body, { childList: true, subtree: true });
  });
  return { app, page };
}
const settle = (page) =>
  page.waitForFunction(() => !document.querySelector(".presentation-bar"));
function base() {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "bat", restless: 0 }]);
  g.s.battle.phase = "activate";
  g.s.battle.hand = [];
  g.s.battle.channel = 20;
  g.s.battle.enemies[0].hp = g.s.battle.enemies[0].maxHp = 1000;
  g.s.battle.enemies[0].element = "Arcane";
  return g;
}
function put(g, id, slot, element) {
  const c = g.instance(g.newCard(id));
  if (element) c.element = element;
  g.s.battle.grid[slot] = [c];
  return c;
}
{
  const g = base(),
    elements = ["Arcane", "Fire", "Water", "Earth", "Wind", "Chaos", "Light"];
  elements.forEach((el, i) => put(g, "thorn", i, el));
  const { app, page } = await open(g);
  try {
    for (let i = 0; i < elements.length; i++) {
      await page.locator(`[data-activate-slot="${i}"]`).click();
      await page.locator('[data-enemy-uid="900"]').click();
      await page
        .locator(`.spell-impact[data-element="${elements[i]}"]`)
        .waitFor();
      if (["Arcane", "Fire", "Water"].includes(elements[i])) {
        await page.evaluate(() => {
          for (const a of document
            .querySelector(".spell-impact")
            .getAnimations({ subtree: true })) {
            a.pause();
            a.currentTime = 130;
          }
        });
        await page.screenshot({
          path: dir + "/" + elements[i].toLowerCase() + ".png",
        });
      }
      await settle(page);
      assert.equal(
        await page.locator(".spell-impact,.attack-bolt,.impact-number").count(),
        0,
      );
    }
    const impacts = await page.evaluate(() => window.impacts);
    assert.deepEqual(
      impacts.map((x) => x.element),
      elements,
    );
    assert.equal(new Set(impacts.map((x) => x.core)).size, 7);
    assert.ok(
      impacts.every(
        (x) =>
          x.sparks === 8 && x.bolts === 0 && x.centered && x.pointer === "none",
      ),
    );
    assert.equal(impacts[0].color, "#c8cbd0");
    report.checks.push(
      "Seven distinct element bursts on actual attacks; gray Arcane star; all centered on the target after projectile removal; eight particles; no input interception or leftover effects.",
    );
  } finally {
    await app.close();
  }
}
for (const mode of ["fast", "reduced", "skip"]) {
  const g = base();
  put(g, "thorn", 0, "Fire");
  const { app, page } = await open(g, mode === "fast");
  try {
    if (mode === "reduced")
      await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator('[data-activate-slot="0"]').click();
    await page.locator('[data-enemy-uid="900"]').click();
    if (mode === "skip") {
      await page.locator("[data-skip]").waitFor();
      await page.locator("[data-skip]").click();
    }
    await settle(page);
    const impacts = await page.evaluate(() => window.impacts);
    if (mode !== "skip") {
      assert.equal(impacts.length, 1);
      assert.equal(
        impacts[0].motion,
        mode === "reduced" ? "reduced" : "normal",
      );
      assert.equal(impacts[0].sparks, mode === "reduced" ? 0 : 8);
    }
    assert.equal(
      await page.locator(".spell-impact,.attack-bolt,.impact-number").count(),
      0,
    );
    assert.match(
      await page.locator('[data-enemy-uid="900"]').textContent(),
      /996 \/ 1000 HP/,
    );
    report.checks.push(
      `${mode}: effect mode/cleanup correct; same 4 damage and final state.`,
    );
  } finally {
    await app.close();
  }
}
{
  const g = base();
  const c = put(g, "sapling", 0);
  c.hp = c.maxHp = 40;
  g.endTurn();
  assert.equal(g.s.battle.reaction.stage, "ally");
  const { app, page } = await open(g);
  try {
    await page.getByRole("button", { name: /Sapling intercepts/ }).click();
    await page.locator('.spell-impact[data-element="Wind"]').waitFor();
    await settle(page);
    const impacts = await page.evaluate(() => window.impacts);
    assert.ok(
      impacts.some(
        (x) => x.element === "Wind" && x.target.includes("slot") && x.centered,
      ),
    );
    report.checks.push(
      "Enemy Wind attack produces its Wind impact on the defending Ally card.",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/element-impact-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
