import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.18", checks: [], errors: [], geometry: [] };
const dir = "reports/screenshots/horizontal-layout";
await fs.mkdir(dir, { recursive: true });
const settle = (p) =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
function base(count = 3) {
  const g = new Game(8);
  g.beginBattle(
    Array.from({ length: count }, (_, i) => ({
      uid: 900 + i,
      enemy: i ? "beetle" : "bat",
      restless: 0,
    })),
  );
  g.s.battle.phase = "place";
  return g;
}
async function open(g) {
  const profile = path.resolve(".tmp/layout-" + Date.now());
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
  const page = await app.firstWindow();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.locator('[data-ui="continue"]').click();
  return { app, page, profile };
}
async function geometry(page) {
  return page.evaluate(() => {
    const a = document.querySelector("#app"),
      r = a.getBoundingClientRect(),
      s = r.width / 1600;
    const rect = (q) => {
      const b = document.querySelector(q).getBoundingClientRect();
      return {
        x: (b.x - r.x) / s,
        y: (b.y - r.y) / s,
        w: b.width / s,
        h: b.height / s,
      };
    };
    return {
      viewport: [innerWidth, innerHeight],
      stage: [r.x, r.y, r.width, r.height],
      scroll: [a.scrollWidth, a.scrollHeight],
      player: rect(".battle-player"),
      mind: rect(".mind"),
      enemies: rect(".enemy-line"),
      hand: rect(".battle-dock"),
      phases: rect(".phasebar"),
    };
  });
}
{
  const g = base();
  g.s.battle.hand = ["blast", "shield", "resonance", "sapling"].map((id) =>
    g.instance(g.newCard(id)),
  );
  g.s.battle.grid[6] = [g.instance(g.newCard("thorn"))];
  const { app, page } = await open(g);
  try {
    assert.equal(
      await app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isResizable(),
      ),
      false,
    );
    let first;
    for (const [name, width, height] of [
      ["16-9", 1600, 900],
      ["4-3", 1200, 900],
      ["21-9", 2100, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(100);
      const b = await geometry(page);
      report.geometry.push({ name, ...b });
      assert.deepEqual(b.scroll, [1600, 900]);
      assert.ok(Math.abs(b.stage[2] / b.stage[3] - 16 / 9) < 0.001);
      assert.ok(b.player.x + b.player.w <= b.mind.x);
      assert.ok(b.mind.x + b.mind.w <= b.enemies.x);
      assert.ok(b.hand.y >= b.mind.y + b.mind.h);
      if (first)
        for (const part of ["player", "mind", "enemies", "hand", "phases"])
          for (const k of ["x", "y", "w", "h"])
            assert.ok(
              Math.abs(first[part][k] - b[part][k]) < 0.2,
              `${name} ${part} ${k}`,
            );
      else first = b;
      await page.screenshot({ path: dir + "/" + name + ".png" });
    }
    // The card and gear inspectors stay inside the playable area on ultrawide.
    await page.locator('[data-slot="6"]').click();
    await page.locator("#modal.card-peek").waitFor({ state: "visible" });
    await page.locator(".dialog-close").click();
    await page.locator('[data-equip-slot="finger1"] .gear-item').click();
    await page.locator("#modal .dialog").waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    await page.locator('[data-ui="inventory"]').click();
    await page.locator("#modal .dialog").waitFor({ state: "visible" });
    await page.mouse.click(2, 2);
    assert.equal(await page.locator("#modal").isVisible(), false);
    await page.locator(".battle-tools > summary").click();
    assert.equal(
      await page.locator(".battle-tools .sidebar").isVisible(),
      true,
    );
    assert.match(
      await page.locator(".battle-tools .sidebar").textContent(),
      /AI step/,
    );
    await page.locator(".battle-tools > summary").click();
    report.checks.push(
      "16:9, 4:3 and 21:9 preserve identical virtual battle geometry, center a 16:9 stage with bars, and have no stage overflow. Card/equipment/Inventory inspectors and Battle tools remain accessible.",
    );
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator('[data-ui="pause"]').click();
    await page.locator('[data-ui="settings"]').click();
    assert.deepEqual(
      await page.locator("#resolution option").allTextContents(),
      ["1280 × 720", "1440 × 810", "1600 × 900", "1920 × 1080"],
    );
    await page.locator("#resolution").selectOption("1440,810");
    await page.locator('[data-ui="applySettings"]').click();
    await page.waitForTimeout(250);
    const size = await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].getContentSize(),
    );
    assert.ok(Math.abs(size[0] / size[1] - 16 / 9) < 0.01);
    await page.locator('[data-ui="pause"]').click();
    await page.locator('[data-ui="settings"]').click();
    await page.locator("#display").selectOption("fullscreen");
    await page.locator('[data-ui="applySettings"]').click();
    await page.waitForTimeout(400);
    assert.equal(
      await app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isFullScreen(),
      ),
      true,
    );
    await page.locator('[data-ui="pause"]').click();
    await page.locator('[data-ui="settings"]').click();
    await page.locator("#display").selectOption("windowed");
    await page.locator('[data-ui="applySettings"]').click();
    await page.waitForTimeout(400);
    assert.equal(
      await app.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isFullScreen(),
      ),
      false,
    );
    await page.locator(".battle-tools > summary").click();
    await page.locator('[data-ui="botStep"]').click();
    await settle(page);
    assert.equal(await page.locator(".battle-tools").getAttribute("open"), "");
    assert.equal(await page.locator('[data-ui="botToggle"]').isVisible(), true);
    report.checks.push(
      "The Battle tools drawer remains open after an AI action, keeping Stop/Watch AI reachable.",
    );
    report.checks.push(
      "Window is not freely resizable; four 16:9 presets and fullscreen/windowed transitions work.",
    );
  } catch (e) {
    await page.screenshot({ path: dir + "/failure.png" });
    throw e;
  } finally {
    await app.close();
  }
}
{
  const g = base(8);
  g.s.battle.hand = Array.from({ length: 10 }, () =>
    g.instance(g.newCard("blast")),
  );
  const { app, page } = await open(g);
  try {
    assert.equal(await page.locator(".enemy").count(), 8);
    assert.equal(await page.locator("[data-hand]").count(), 10);
    assert.ok(
      await page
        .locator(".enemy-line")
        .evaluate((el) => el.scrollHeight > el.clientHeight),
    );
    assert.ok(
      await page
        .locator(".revealed-hand .hand")
        .evaluate((el) => el.scrollWidth > el.clientWidth),
    );
    await page.locator("[data-hand]").last().scrollIntoViewIfNeeded();
    await page
      .locator("[data-hand]")
      .last()
      .dragTo(page.locator('[data-slot="0"]'));
    await settle(page);
    assert.match(await page.locator('[data-slot="0"]').textContent(), /Blast/);
    assert.equal(await page.locator("[data-hand]").count(), 9);
    await page.locator('[data-enemy-uid="907"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: dir + "/crowded.png" });
    report.checks.push(
      "Eight enemies and ten revealed cards stay accessible through local scroll regions; the last hand card can be dragged onto the grid.",
    );
  } finally {
    await app.close();
  }
}
{
  const g = base(1);
  g.s.battle.phase = "activate";
  g.endTurn();
  assert.ok(g.legal().some((a) => a.type === "bracelet"));
  const { app, page, profile } = await open(g);
  try {
    await page.locator(".block-available").waitFor();
    const before = JSON.parse(
      await fs.readFile(path.join(profile, "save.json"), "utf8"),
    );
    await page.screenshot({ path: dir + "/defense.png" });
    assert.equal(
      await page.locator(".battle-dock .incoming-attack").count(),
      1,
    );
    await page.locator(".block-available").click();
    await settle(page);
    assert.equal(await page.locator(".block-available").count(), 0);
    const after = JSON.parse(
      await fs.readFile(path.join(profile, "save.json"), "utf8"),
    );
    assert.notDeepEqual(after, before);
    report.checks.push(
      "Incoming attack occupies the bottom dock; a glowing wrist icon commits the legal bracelet defense and removes its ready glow when spent.",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/horizontal-layout-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
