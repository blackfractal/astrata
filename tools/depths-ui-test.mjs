import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { depthsFixture } from "./depths-fixture.mjs";
import { spawnIdeon } from "../src/ideons.mjs";
const report = {
  version: "3.0.0",
  packaged: process.argv.includes("--packaged"),
  checks: [],
  errors: [],
};
await fs.mkdir("reports/screenshots/depths", { recursive: true });
for (const kind of ["guide", "cannon", "map", "intro", "victory"]) {
  const g = depthsFixture(
    73001,
    kind === "victory"
      ? "cnidarian"
      : kind === "cannon"
        ? "refractionCannon"
        : kind === "guide"
          ? "glassBrood"
          : null,
  );
  if (kind === "intro") g.act(g.legal().find((a) => a.type === "leave"));
  else if (kind === "victory") {
    g.s.battle.enemies[0].hp = 0;
    g.checkBattle();
    for (const type of ["rewardCard", "rewardGem", "rewardSetting"])
      g.act(g.legal().find((a) => a.type === type));
  } else if (kind === "map") {
    g.s.mode = "depthsIntro";
    g.act(g.legal().find((a) => a.type === "enterDepths"));
  } else {
    const b = g.s.battle;
    b.phase = "activate";
    b.channel = 8;
    b.hand = [];
    if (kind === "guide") {
      b.grid[10] = [g.instance(g.newCard("lucidGuide"))];
      b.grid[23] = [g.instance(g.newCard("lucidNeedle"))];
      spawnIdeon(g, b.enemies[0], "guardian", { slot: 12 });
      spawnIdeon(g, b.enemies[0], "leech", { slot: 27 });
    } else {
      b.grid[10] = [g.instance(g.newCard("ward"))];
      b.grid[11] = [g.instance(g.newCard("blast"))];
      b.grid[25] = [g.instance(g.newCard("lucidNeedle"))];
      spawnIdeon(g, b.enemies[0], "bullet", {
        slot: 10,
        element: "Fire",
        field: "element",
      });
      spawnIdeon(g, b.enemies[0], "bullet", {
        slot: 27,
        element: "Arcane",
        field: "destroy",
      });
    }
  }
  delete g.s.checkpoint;
  const profile = path.resolve(".tmp/depths-ui-" + kind + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1440, fast: true }),
  );
  const packaged = process.argv.includes("--packaged");
  const app = await electron.launch({
    executablePath: path.resolve(
      packaged
        ? "release/Astrata/Astrata.exe"
        : "node_modules/electron/dist/electron.exe",
    ),
    args: [
      ...(packaged ? [] : [path.resolve(".")]),
      "--user-data-dir=" + profile,
    ],
    timeout: 30000,
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    if (kind === "intro") {
      await p.locator(".companion-intro").waitFor();
      await p.screenshot({
        path: "reports/screenshots/depths/guide-introduction.png",
      });
      await p
        .getByRole("button", { name: "Enter the Lucent Depths", exact: true })
        .click();
      await p.locator(".tile.barrier").first().waitFor();
    } else if (kind === "victory") {
      await p.locator('[data-action*="continueReward"]').click();
      await p.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
      assert.match(
        await p.locator("h1").textContent(),
        /Lucent Depths|Complete/,
      );
    } else if (kind === "map") {
      await p.locator(".tile.barrier").first().waitFor();
      assert.equal(await p.locator(".tile.barrier").count(), 10);
    } else {
      await p.locator(".ideon").first().waitFor();
      if (kind === "guide") {
        await p.locator('[data-activate-slot="10"]').click();
        await p
          .locator('[data-slot="11"][data-target-choice="destination"]')
          .click();
        await p.locator('.ideon[data-ideon="guardian"]').click();
        await p.waitForFunction(
          () => !document.querySelector(".presentation-bar"),
        );
        assert.equal(
          await p.locator('[data-slot="11"] [data-activate-slot="11"]').count(),
          1,
        );
        assert.equal(
          await p
            .locator('.ideon[data-ideon="guardian"] .ideon-health b')
            .textContent(),
          "14",
        );
        await p.locator('[data-activate-slot="23"]').click();
        await p.locator('.ideon[data-ideon="guardian"]').click();
        await p.waitForFunction(
          () => !document.querySelector(".presentation-bar"),
        );
        assert.equal(
          await p.locator('.ideon[data-ideon="guardian"]').count(),
          0,
        );
      } else {
        assert.ok(await p.locator('[data-slot="10"].ideon-covered').count());
        assert.equal(
          await p
            .locator(
              '[data-slot="10"] [data-activate-slot][aria-disabled="false"]',
            )
            .count(),
          0,
        );
        await p.locator('[data-activate-slot="25"]').click();
        await p.locator(".ideon[data-enemy-uid]").last().click();
        await p.waitForFunction(
          () => !document.querySelector(".presentation-bar"),
        );
        await p.getByRole("button", { name: "End turn", exact: true }).click();
        await p.waitForFunction(
          () => !document.querySelector(".presentation-bar"),
        );
        await p.locator(".player-portrait.defense-ready").click();
        await p.waitForFunction(
          () => !document.querySelector(".presentation-bar"),
        );
        assert.equal(
          await p
            .locator('[data-slot="8"] .ideon[data-ideon="bullet"]')
            .count(),
          1,
        );
        assert.equal(
          await p.locator('[data-slot="10"].ideon-covered').count(),
          0,
        );
      }
    }
    await p.screenshot({ path: "reports/screenshots/depths/" + kind + ".png" });
    const visual = await p.evaluate(() => ({
      width: innerWidth,
      height: innerHeight,
      scroll: document.documentElement.scrollHeight,
      missing: [...document.images]
        .filter((i) => !i.complete || !i.naturalWidth)
        .map((i) => i.src),
    }));
    report.checks.push({ kind, ...visual });
  } finally {
    await app.close();
  }
}
await fs.writeFile(
  "reports/depths-ui-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
assert.equal(report.errors.length, 0);
if (!process.argv.includes("--allow-missing-art"))
  assert.ok(report.checks.every((c) => !c.missing.length));
