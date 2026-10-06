import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";

const report = {
  package: JSON.parse(await fs.readFile("package.json", "utf8")).version,
  checks: [],
  errors: [],
};
for (const mode of ["tavern", "field"]) {
  const g = new Game(8285);
  g.s.gold = 100;
  g.s.mode = "field";
  const bronze = g.getItem(g.s.equipment.wrist2),
    silver = g.addItem("silver"),
    sapphire = g.addItem("sapphire"),
    ruby = g.addItem("ruby");
  if (mode === "tavern") g.openTavern();
  const profile = path.resolve(".tmp/setting-drop-" + mode + "-" + Date.now());
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
  try {
    await p.locator('[data-ui="continue"]').click();
    if (mode === "tavern") await p.locator('[data-tavern="equipment"]').click();
    else await p.locator('[data-ui="inventory"]').click();
    const root = mode === "tavern" ? ".tavern-service" : "#modal";
    const read = async () =>
      JSON.parse(await fs.readFile(path.join(profile, "save.json"), "utf8"));
    async function drag(gem, setting, expected) {
      await p
        .locator(`${root} .satchel [data-item-uid="${gem.uid}"]`)
        .dragTo(
          p.locator(`${root} [data-item-detail="${setting.uid}"]`).first(),
          { targetPosition: { x: 15, y: 15 } },
        );
      await p.waitForTimeout(200);
      const s = await read();
      assert.equal(
        s.inventory.find((x) => x.uid === setting.uid).gem,
        expected,
      );
      assert.equal(s.equipment.wrist2, bronze.uid);
    }
    await drag(sapphire, bronze, mode === "tavern" ? sapphire.uid : null);
    await drag(ruby, silver, mode === "tavern" ? ruby.uid : null);
    report.checks.push(
      mode === "tavern"
        ? "Gem drops onto artwork of both equipped and Satchel Settings socket the exact gem without changing equipment."
        : "Whole-Setting drops outside Tavern do not socket gems or change equipment.",
    );
    if (mode === "tavern") {
      await p
        .locator(`${root} [data-item-uid="${bronze.uid}"]`)
        .first()
        .dragTo(p.locator(`${root} .satchel [data-item-uid="${silver.uid}"]`));
      await p.waitForTimeout(200);
      assert.equal((await read()).equipment.wrist2, null);
      report.checks.push(
        "Dropping equipped gear over a Satchel item still unequips through the parent Satchel drop target.",
      );
    }
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/setting-drop-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
