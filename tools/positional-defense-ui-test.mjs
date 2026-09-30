import { _electron as electron, expect } from "@playwright/test";
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
const bracelet = g.addItem("bronze");
g.s.equipment.wrist2 = bracelet.uid;
g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
const b = g.s.battle;
b.phase = "enemy";
b.jobs = [];
b.hand = [];
function put(id, i, value) {
  const c = g.instance(g.newCard(id));
  b.grid[i] = [c];
  if (id === "ward") c.ward = value;
  if (id === "familiar") {
    c.hp = c.maxHp = value;
    c.element = "Arcane";
  }
  return c;
}
put("ward", 6, 3);
const shield = put("shield", 4);
put("ward", 11, 2);
put("familiar", 2, 3);
b.shields = [
  { uid: 998, owner: shield.uid, slot: 4, block: 2, element: "Arcane" },
  { uid: 999, owner: shield.uid, slot: 4, block: 3, element: "Water" },
];
b.bracelets = [
  { uid: bracelet.uid, block: 2, element: "Arcane", name: "Bronze Bracelet" },
];
b.reaction = {
  stage: "defend",
  column: 6,
  damage: 20,
  element: "Arcane",
  source: 900,
  name: "Test hit",
  intercepted: [],
};
const profile = path.resolve(".tmp/positional-ui-" + Date.now());
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
const settle = (p) =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
try {
  await fs.mkdir("reports/screenshots/positional-defense", { recursive: true });
  const p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  for (const i of [2, 4, 6, 11])
    await expect(p.locator(`[data-slot="${i}"]`)).toHaveClass(/defense-ready/);
  await p.mouse.move(5, 5);
  await p.screenshot({
    path: "reports/screenshots/positional-defense/ready.png",
  });
  assert.equal(await p.locator(".incoming-attack [data-action]").count(), 1);
  await expect(p.locator(".incoming-attack [data-action]")).toHaveText(
    "Take hit — save defenses",
  );
  await p.locator('[data-slot="4"] .defense-view').click();
  await expect(p.locator("#modal")).toBeVisible();
  await p.locator("[data-close]").first().click();
  await p.locator('[data-slot="4"]').click();
  await expect(p.locator('[data-slot="4"] .defense-options')).toBeVisible();
  await p.screenshot({
    path: "reports/screenshots/positional-defense/portions.png",
  });
  await p
    .locator(".defense-options [data-action]")
    .filter({ hasText: "Arcane Shield" })
    .click();
  await settle(p);
  await expect(p.locator('[data-slot="4"] .held-attack')).toHaveText("18");
  await expect(p.locator('[data-slot="6"]')).not.toHaveClass(/defense-ready/);
  await expect(p.locator('[data-slot="6"]')).toHaveClass(/defense-passed/);
  for (const i of [2, 4, 11])
    await expect(p.locator(`[data-slot="${i}"]`)).toHaveClass(/defense-ready/);
  await p.locator('[data-slot="11"]').click();
  await settle(p);
  await expect(p.locator('[data-slot="11"] .held-attack')).toHaveText("16");
  await p.locator('[data-slot="2"] .slot-activate').click();
  await settle(p);
  await expect(p.locator('[data-slot="2"] .held-attack')).toHaveText("13");
  await expect(p.locator('[data-slot="4"]')).not.toHaveClass(/defense-ready/);
  assert.equal(await p.locator(".incoming-attack [data-action]").count(), 1);
  await fs.mkdir("reports/screenshots/positional-defense", { recursive: true });
  await p.mouse.move(5, 5);
  await p.screenshot({
    path: "reports/screenshots/positional-defense/passed-columns.png",
  });
  await p.locator(`.battle-player [data-item-uid="${bracelet.uid}"]`).click();
  await settle(p);
  await expect(p.locator(".player-portrait")).toContainText("59/70 HP");
  assert.equal(await p.locator(".held-attack").count(), 0);
  report.checks.push(
    "All three card defense types highlight together; direct card click and Defend button resolve without bottom selection list. View remains available. Mixed Shield portions open beside the clicked card. Column five disables column seven while same-column Ward stays legal; then column three disables remaining Shield. Numbered attack route persists, equipment is last, losses leave59/70HP.",
  );
} finally {
  await app.close();
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/positional-defense-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
