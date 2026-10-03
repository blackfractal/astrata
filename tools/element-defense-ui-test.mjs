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
await fs.mkdir("reports/screenshots/element-defense", { recursive: true });
for (const [incoming, remaining, hp, shield] of [
  ["Earth", 7, 66, false],
  ["Fire", 8, 64, false],
  ["Water", 9, 62, false],
  ["Earth", 4, 69, true],
]) {
  const g = new Game(61);
  g.s.equipment = {};
  const bracelet = g.addItem("bronze"),
    gem = g.addItem("ruby"),
    armor = g.addItem("fireArmor");
  bracelet.gem = gem.uid;
  g.s.equipment.wrist2 = bracelet.uid;
  g.s.equipment.torso = armor.uid;
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "enemy";
  b.hand = [];
  b.jobs = [];
  b.bracelets = shield
    ? []
    : [
        {
          uid: bracelet.uid,
          name: "Bronze Bracelet",
          block: 2,
          element: "Fire",
        },
      ];
  if (shield) {
    const c = g.instance(g.newCard("shield"));
    b.grid[4] = [c];
    b.shields = [
      { uid: 999, owner: c.uid, slot: 4, block: 4, element: "Fire" },
    ];
  }
  b.reaction = {
    stage: shield ? "defend" : "bracelet",
    column: shield ? 6 : -1,
    damage: 10,
    element: incoming,
    source: 900,
    name: "Element test",
    intercepted: [],
  };
  delete g.s.checkpoint;
  const profile = path.resolve(
    ".tmp/element-defense-" + incoming + "-" + shield + "-" + Date.now(),
  );
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ fast: true, width: 1280 }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    await p.locator(".inspect-attack").click();
    const choice = p
      .locator("#modal [data-action]")
      .filter({ hasText: shield ? "Shield" : "Bronze Bracelet" })
      .first();
    assert.match(
      await choice.textContent(),
      new RegExp(remaining + " damage continues"),
    );
    await p.screenshot({
      path:
        "reports/screenshots/element-defense/" +
        incoming +
        "-" +
        (shield ? "shield" : "bracelet") +
        ".png",
    });
    await choice.click();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    const [id] = await fs.readdir(path.join(profile, "runs"));
    const latest = JSON.parse(
      await fs.readFile(path.join(profile, "runs", id, "latest.json"), "utf8"),
    );
    assert.equal(latest.hp, hp);
    report.checks.push({
      incoming,
      defender: shield ? "Fire Shield" : "Ruby Bronze Bracelet",
      previewRemainder: remaining,
      fireArmorReduction: remaining - (70 - hp),
      hp,
    });
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/element-defense-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
