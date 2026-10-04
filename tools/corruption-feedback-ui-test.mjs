import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const dir = "reports/screenshots/corruption-feedback";
await fs.mkdir(dir, { recursive: true });
const report = { checks: [], errors: [] };
const put = (g, id, i) => g.s.battle.grid[i].push(g.instance(g.newCard(id)));
async function open(g, name) {
  const profile = path.resolve(
    ".tmp/corruption-feedback-" + name + "-" + Date.now(),
  );
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1440, fast: false }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  const p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  await settle(p);
  return { app, p };
}
const settle = (p) =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
function fixture() {
  const g = new Game(8);
  g.s.stratum = 2;
  g.beginBattle([
    { uid: 900, enemy: "beetle", restless: 0 },
    { uid: 901, enemy: "bat", restless: 0 },
  ]);
  const b = g.s.battle;
  b.grid = Array.from({ length: 42 }, () => []);
  b.enemies[1].element = "Arcane";
  for (const e of b.enemies) e.hp = e.maxHp = 100;
  put(g, "cinder", 8);
  put(g, "shield", 14);
  b.corruptions = { 7: { kind: "nausea", uid: 990, source: 900 } };
  b.biles = {
    8: { kind: "bile", uid: 991, source: 900 },
    10: { kind: "bile", uid: 992, source: 900 },
  };
  b.enemies[0].corruptionPlan = [{ kind: "hole", slot: 11 }];
  return g;
}
{
  const g = fixture();
  g.s.battle.phase = "activate";
  const { app, p } = await open(g, "preview");
  try {
    assert.equal(await p.locator(".nausea-aura").count(), 2);
    assert.equal(await p.locator(".bile-motion").count(), 2);
    assert.equal(
      await p.locator(".nausea-warning,.bile-seal,.bile-warning").count(),
      0,
    );
    assert.ok(
      !(await p.locator(".corruption-foretell").innerText()).includes("→"),
    );
    assert.equal(
      await p.locator('[data-slot="8"] .damage-value').innerText(),
      "3",
    );
    const motion = await p
      .locator('[data-slot="8"] .nausea-aura i')
      .first()
      .evaluate((el) => ({
        name: getComputedStyle(el).animationName,
        pointer: getComputedStyle(el.parentElement).pointerEvents,
        width: el.parentElement.getBoundingClientRect().width,
      }));
    assert.equal(motion.name, "nausea-swirl");
    assert.equal(motion.pointer, "none");
    assert.ok(motion.width > 70);
    await p.locator('[data-activate-slot="8"]').click();
    await p.locator('[data-enemy-uid="900"]').hover();
    assert.equal(
      await p.locator('[data-slot="8"] .damage-value').innerText(),
      "5 (+2)",
    );
    assert.match(
      await p.locator(".target-damage-preview").getAttribute("data-tooltip"),
      /Nausea has already halved/,
    );
    await p.screenshot({ path: dir + "/nausea-element-preview.png" });
    await p.locator('[data-enemy-uid="901"]').hover();
    assert.equal(
      await p.locator('[data-slot="8"] .damage-value').innerText(),
      "3",
    );
    await p.locator("[data-target-cancel]").click();
    assert.equal(
      await p.locator('[data-slot="8"] .damage-value').innerText(),
      "3",
    );
    await p.emulateMedia({ reducedMotion: "reduce" });
    for (const cls of [".nausea-aura i", ".bile-motion i"]) {
      const v = await p
        .locator(cls)
        .first()
        .evaluate((e) => ({
          animation: getComputedStyle(e).animationName,
          opacity: getComputedStyle(e).opacity,
        }));
      assert.equal(v.animation, "none");
      assert.ok(Number(v.opacity) > 0);
    }
    await p.screenshot({ path: dir + "/reduced-motion.png" });
    report.checks.push(
      "Full-card Nausea and moving Bile on cards/empty spaces; no tiny labels or warning arrows; 6 Fire becomes 3 from Nausea, then 5 against Earth / 3 neutral; cancel resets; reduced-motion hazards remain visible.",
    );
  } finally {
    await app.close();
  }
}
{
  const g = fixture(),
    b = g.s.battle;
  b.phase = "place";
  b.focus = 3;
  b.hand = [g.newCard("blast")];
  const { app, p } = await open(g, "cover");
  try {
    await p.locator("[data-hand]").dragTo(p.locator('[data-slot="7"]'));
    await settle(p);
    assert.equal(await p.locator(".nausea-aura").count(), 0);
    assert.equal(
      await p.locator('[data-slot="8"] .damage-value').innerText(),
      "6",
    );
    await p.screenshot({ path: dir + "/covered-nausea.png" });
    report.checks.push(
      "Real placement covering Nausea removes affected-card swirls and restores damage immediately.",
    );
  } finally {
    await app.close();
  }
}
{
  const g = new Game(9);
  g.s.stratum = 2;
  g.beginBattle([{ uid: 900, enemy: "mendingTutor", restless: 0 }]);
  const b = g.s.battle;
  b.turn = 2;
  b.phase = "activate";
  b.grid = Array.from({ length: 42 }, () => []);
  b.hand = [];
  put(g, "blast", 6);
  b.corruptions = Object.fromEntries(
    [6, 7].map((i) => [
      i,
      {
        kind: "mine",
        uid: 990 + i,
        source: 900,
        remaining: 1,
        damage: 20,
        element: "Fire",
        createdTurn: 1,
      },
    ]),
  );
  const { app, p } = await open(g, "explosions");
  try {
    await p.getByRole("button", { name: "End turn", exact: true }).click();
    await p.locator('.mine-explosion[data-slot="6"]').waitFor();
    await p.screenshot({ path: dir + "/covered-explosion.png" });
    await p.locator('.mine-explosion[data-slot="7"]').waitFor();
    await p.screenshot({ path: dir + "/uncovered-explosion.png" });
    await settle(p);
    assert.equal(await p.locator('[data-slot="6"] .name').count(), 0);
    assert.equal(await p.locator(".corruption-mine").count(), 0);
    await p.locator(".battle-player .player-portrait").click();
    await p.locator('.attack-bolt[data-effect="Fire"]').waitFor();
    await p.screenshot({ path: dir + "/mine-fire-flight.png" });
    await settle(p);
    assert.match(await p.locator(".battle-player").innerText(), /50\s*\/\s*70/);
    report.checks.push(
      "Covered mine explodes before its card disappears; uncovered mine explodes and sends a Fire projectile from its space to the player for20 damage.",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/corruption-feedback-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
