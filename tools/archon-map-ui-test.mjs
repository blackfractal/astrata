import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { enemies } from "../src/content.mjs";
import { artPaths } from "../src/art-paths.mjs";
import { fieldEntitiesAt } from "../src/field-display.mjs";
const report = {
  package: JSON.parse(await fs.readFile("package.json", "utf8")).version,
  checks: [],
  errors: [],
};
for (const id of ["colossus", "hart", "choir"])
  for (const first of [true, false]) {
    const g = new Game(99);
    g.s.mode = "field";
    const boss = {
      uid: 900,
      type: "Archon",
      enemy: id,
      count: 1,
      born: 16,
      restless: 0,
      x: 5,
      y: 5,
    };
    const mote = {
      uid: 901,
      type: "Mote",
      enemy: "sludge",
      count: 1,
      born: 1,
      restless: 2,
      x: 5,
      y: 5,
    };
    Object.assign(g.s.field, {
      x: 3,
      y: 3,
      spawned: 32,
      round: 16,
      moves: 2,
      queue: [],
      entities: [
        { uid: 902, type: "Gold", value: 20, x: 5, y: 5 },
        ...(first ? [boss, mote] : [mote, boss]),
      ],
    });
    const original = JSON.stringify(g.s.field);
    assert.equal(fieldEntitiesAt(g.s.field, 5, 5)[0].uid, boss.uid);
    assert.equal(JSON.stringify(g.s.field), original);
    const profile = path.resolve(
      `.tmp/archon-map-${id}-${first}-${Date.now()}`,
    );
    await fs.mkdir(profile, { recursive: true });
    await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
    await fs.writeFile(
      profile + "/settings.json",
      JSON.stringify({ width: 1280, fast: true }),
    );
    const app = await electron.launch({
      executablePath: path.resolve("release/Astrata/Astrata.exe"),
      args: ["--user-data-dir=" + profile],
    });
    try {
      const p = await app.firstWindow();
      p.on("pageerror", (e) => report.errors.push(e.message));
      await p.locator('[data-ui="continue"]').click();
      const tile = p.locator('[data-cell="60"]');
      assert.ok(
        (
          await tile.locator('img[data-token="900"]').getAttribute("src")
        ).endsWith(artPaths[`enemy-${id}`]),
      );
      assert.equal(await tile.locator(".count").textContent(), "3");
      await tile.click();
      assert.equal(
        await p.locator("#modal .field-enemy-preview h3").first().textContent(),
        enemies[id].name,
      );
      assert.equal(await p.locator("#modal .field-enemy-preview").count(), 2);
      await p.locator("#modal [data-close]").click();
      await p.mouse.move(5, 5);
      if (id === "colossus" && !first)
        await p.screenshot({
          path: "reports/screenshots/polish/archon-map-priority.png",
        });
      report.checks.push(
        `${id}: ${first ? "boss present first" : "mote present first"}; Archon icon/token/inspection first, other occupants retained`,
      );
    } finally {
      await app.close();
    }
  }
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/archon-map-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
