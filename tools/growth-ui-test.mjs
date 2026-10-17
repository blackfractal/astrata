import { _electron as electron, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { spawnIdeon } from "../src/ideons.mjs";
const results = [];
const put = (g, id, i) => {
  const c = g.instance(g.newCard(id));
  g.s.battle.grid[i] = [c];
  return c;
};
for (const id of [
  "mindfire",
  "bodyGuard",
  "thornfall",
  "braidedSeasons",
  "forkedCurrent",
  "starleaf",
]) {
  const g = new Game(94);
  g.s.equipment = {};
  g.s.stratum = 3;
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  delete g.s.checkpoint;
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 10;
  b.focus = 3;
  b.hand = [];
  b.enemies[0].hp = b.enemies[0].maxHp = 200;
  b.enemies[0].element = "Arcane";
  if (id === "bodyGuard") {
    b.bodyGuard = 10;
    b.reaction = {
      damage: 14,
      element: "Fire",
      stage: "defend",
      column: 6,
      source: 900,
      name: "Test hit",
    };
  } else if (id === "thornfall") {
    b.phase = "place";
    b.hand = [g.newCard("thornfall")];
  } else put(g, id, 10);
  if (id === "braidedSeasons") {
    put(g, "water", 9);
    put(g, "ignis", 11);
  }
  if (id === "starleaf") {
    put(g, "water", 2);
    put(g, "ignis", 4);
  }
  if (id === "forkedCurrent")
    for (const slot of [11, 12, 13]) {
      const e = spawnIdeon(g, b.enemies[0], "runner", { slot });
      e.element = "Arcane";
    }
  const profile = path.resolve(".tmp/growth-ui-" + id + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1280, fast: true }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
    // Contain native Windows spellchecker stray relative writes in test data.
    cwd: profile,
  });
  const errors = [];
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    await expect(p.locator("[data-slot]")).toHaveCount(42);
    const saved = async () =>
      JSON.parse(await fs.readFile(profile + "/save.json", "utf8"));
    if (id === "mindfire") {
      await p.locator('[data-activate-slot="10"]').click();
      await p
        .getByRole("button", { name: "2 Focus → 22 damage", exact: true })
        .click();
      await p.locator('[data-enemy-uid="900"]').first().hover();
      await expect(p.locator(".target-damage-preview")).toContainText("22");
      await p.locator('[data-enemy-uid="900"]').first().click();
      await expect(p.locator('[data-enemy-uid="900"]').first()).toContainText(
        "178 / 200",
      );
    }
    if (id === "bodyGuard") {
      await p
        .getByRole("button", { name: "Player Guard · 10 Arcane", exact: true })
        .click();
      await expect(p.locator(".player-portrait")).toContainText("66/70");
    }
    if (id === "thornfall") {
      await p.locator("[data-hand]").click();
      await expect(p.locator('[data-enemy-uid="900"]').first()).toHaveClass(
        /target-option/,
      );
      await p.locator('[data-enemy-uid="900"]').first().click();
      await expect(p.locator('[data-enemy-uid="900"]').first()).toContainText(
        "190 / 200",
      );
    }
    if (id === "braidedSeasons") {
      await p.locator('[data-activate-slot="10"]').click();
      await p.locator('[data-slot="9"]').click();
      await p
        .locator(".target-elements")
        .getByRole("button", { name: "Fire", exact: true })
        .click();
      await p.locator('[data-enemy-uid="900"]').first().click();
      await expect(p.locator('[data-enemy-uid="900"]').first()).toContainText(
        "176 / 200",
      );
    }
    if (id === "forkedCurrent") {
      await p.locator('[data-activate-slot="10"]').click();
      await p.locator(`[data-enemy-uid="${b.ideons[0].uid}"]`).first().click();
      await p.locator('[data-enemy-uid="900"]').first().click();
      await expect(p.locator(".targeting-bar")).toContainText("16 damage");
      await p.screenshot({ path: "reports/growth-route-preview.png" });
      await p.getByRole("button", { name: "Fire along this route" }).click();
      await expect(p.locator('[data-enemy-uid="900"]').first()).toContainText(
        "184 / 200",
      );
    }
    if (id === "starleaf") {
      await p.locator('[data-activate-slot="10"]').click();
      await expect(p.locator('[data-slot="2"]')).toHaveClass(/target-option/);
      await p.locator('[data-slot="2"]').click();
      await p.locator('[data-enemy-uid="900"]').first().click();
      await expect(p.locator('[data-enemy-uid="900"]').first()).toContainText(
        "180 / 200",
      );
    }
    await p.screenshot({ path: `reports/growth-ui-${id}.png` });
    assert.deepEqual(errors, []);
    results.push({ id, passed: true, errors });
    console.log(id + " passed");
  } catch (e) {
    const p = await app.firstWindow();
    console.log("ERRORS", errors);
    console.log((await p.locator("body").innerText()).slice(-7000));
    await p.screenshot({ path: "reports/growth-ui-failure.png" });
    throw e;
  } finally {
    await app.close();
  }
}
await fs.writeFile(
  "reports/growth-ui-verification.json",
  JSON.stringify({ version: "4.0.7", packaged: true, results }, null, 2),
);
