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
const g = new Game(8);
g.s.equipment = {};
const first = g.addItem("bronze"),
  second = g.addItem("silver");
g.s.equipment.wrist1 = first.uid;
g.s.equipment.wrist2 = second.uid;
g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
const b = g.s.battle;
b.phase = "enemy";
b.hand = [];
b.bracelets = [
  { uid: first.uid, name: "Bronze Bracelet", block: 2, element: "Arcane" },
  { uid: second.uid, name: "Silver Bracelet", block: 3, element: "Arcane" },
];
b.reaction = {
  stage: "bracelet",
  damage: 6,
  element: "Arcane",
  source: 900,
  name: "First hit",
  intercepted: [],
};
b.jobs = [
  {
    kind: "hit",
    damage: 4,
    element: "Arcane",
    source: 900,
    name: "Second hit",
  },
];
const profile = path.resolve(".tmp/optional-block-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, fast: true }),
);
await fs.mkdir("reports/screenshots/optional-equipment-block", {
  recursive: true,
});
const app = await electron.launch({
  executablePath: path.resolve("release/Astrata/Astrata.exe"),
  args: ["--user-data-dir=" + profile],
});
try {
  const p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
  const settle = () =>
    p.waitForFunction(() => !document.querySelector(".presentation-bar"));
  const read = async () => {
    const [id] = await fs.readdir(path.join(profile, "runs"));
    return JSON.parse(
      await fs.readFile(path.join(profile, "runs", id, "latest.json"), "utf8"),
    );
  };
  await p.locator('[data-ui="continue"]').click();
  const skip = p
    .locator(".incoming-attack [data-action]")
    .filter({ hasText: "Take hit" });
  assert.equal(await skip.count(), 1);
  await p.mouse.move(5, 5);
  await p.screenshot({
    path: "reports/screenshots/optional-equipment-block/choice.png",
  });
  await p.locator(".inspect-attack").click();
  await p
    .locator("#modal [data-action]")
    .filter({ hasText: "Take hit" })
    .click();
  await settle();
  let s = await read();
  assert.equal(s.hp, 59);
  assert.deepEqual(
    s.battle.bracelets.map((x) => x.block),
    [2, 3],
  );
  assert.equal(s.battle.reaction.name, "Second hit");
  await p
    .locator(".incoming-attack [data-action]")
    .filter({ hasText: "Bronze Bracelet" })
    .click();
  await settle();
  s = await read();
  assert.equal(s.battle.reaction.damage, 2);
  assert.deepEqual(
    s.battle.bracelets.map((x) => x.block),
    [0, 3],
  );
  await skip.click();
  await settle();
  s = await read();
  assert.equal(s.hp, 57);
  assert.deepEqual(
    s.battle.bracelets.map((x) => x.block),
    [0, 3],
  );
  assert.equal(s.battle.reaction, null);
  report.checks.push(
    "Skip visible in incoming panel and details; first hit costs 6 HP while both items keep block; next hit allows normal Bronze blocking then skipping Silver to take remaining 2 HP; archived state matches, no reaction loop.",
  );
  assert.deepEqual(report.errors, []);
} finally {
  await app.close();
}
await fs.writeFile(
  "reports/optional-equipment-block-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
