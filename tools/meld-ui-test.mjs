import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const g = new Game(8);
g.s.equipment = {};
g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
const b = g.s.battle;
b.grid = b.grid.map(() => []);
Object.assign(b, { phase: "place", focus: 4, channel: 3, turn: 2 });
b.enemies[0].hp = b.enemies[0].maxHp = 100;
b.enemies[0].element = "Arcane";
const ward = g.instance(g.newCard("ward"));
Object.assign(ward, { ward: 0, zeroWard: true, used: 1 });
b.grid[8] = [ward];
const water = g.instance(g.newCard("water"));
b.grid[20] = [water];
const mag = g.newCard("magnify"),
  heat = g.newCard("heat");
b.hand = [mag, heat];
delete g.s.checkpoint;
const profile = path.resolve(".tmp/meld-" + Date.now()),
  dir = "reports/screenshots/meld";
await fs.mkdir(profile, { recursive: true });
await fs.mkdir(dir, { recursive: true });
await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
await fs.writeFile(
  profile + "/settings.json",
  JSON.stringify({ width: 1280, fast: true }),
);
const app = await electron.launch({
  executablePath: path.resolve("node_modules/electron/dist/electron.exe"),
  args: [path.resolve("."), "--user-data-dir=" + profile],
  timeout: 30000,
});
const errors = [];
try {
  const p = await app.firstWindow();
  p.setDefaultTimeout(15000);
  p.on("pageerror", (e) => errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  const settle = () =>
    p.waitForFunction(() => !document.querySelector(".presentation-bar"));
  await p
    .locator(`[data-hand="${mag.uid}"]`)
    .dragTo(p.locator('[data-slot="8"]'));
  await settle();
  assert.equal(
    await p.locator('[data-slot="8"] .level').textContent(),
    "+1 use",
  );
  await p
    .locator(`[data-hand="${heat.uid}"]`)
    .dragTo(p.locator('[data-slot="20"]'));
  await settle();
  assert.equal(
    await p.locator('[data-slot="20"] .level').textContent(),
    "Heat 2/2",
  );
  await p.locator('[data-slot="8"]').click();
  await p.getByText("Stack · 2 cards", { exact: true }).click();
  await p.locator(`[data-stack-card="${mag.uid}"]`).click();
  assert.equal(await p.locator("[data-full-activate]").isDisabled(), true);
  assert.ok(
    (await p.locator(".card-context").textContent()).includes("Melded"),
  );
  await p.screenshot({ path: dir + "/reinforcement-details.png" });
  await p.locator("[data-close]").click();
  await p
    .getByRole("button", { name: "Begin activation", exact: true })
    .click();
  await settle();
  await p.locator('[data-activate-slot="20"]').dblclick();
  await settle();
  assert.equal(
    await p.locator('[data-slot="20"] .level').textContent(),
    "Heat 1/2",
  );
  await p.locator('[data-activate-slot="8"]').click();
  await settle();
  await p.screenshot({ path: dir + "/melded-board.png" });
  const save = JSON.parse(await fs.readFile(profile + "/save.json", "utf8"));
  const latest = JSON.parse(
    await fs.readFile(
      profile + "/runs/" + save.uiMeta.runId + "/latest.json",
      "utf8",
    ),
  );
  assert.equal(latest.battle.enemies[0].hp, 93);
  assert.equal(latest.battle.enemies[0].status.burn, 2);
  assert.equal(latest.battle.grid[8].at(-1).ward, 11);
  assert.equal(latest.battle.grid[20][0].used, 1);
  assert.deepEqual(errors, []);
  const report = {
    package: "2.1.17",
    checks: [
      "Drag Magnifier beneath depleted Ward; host remains exposed",
      "Inspect inert attachment with disabled independent activation",
      "Drag Heat beneath Water Blast; remaining-use badge updates",
      "Water attack deals 7 plus Burn 2 and spends one Heat use",
      "Revived Ward activates to 11 Guard",
      "No renderer errors",
    ],
    errors,
  };
  await fs.writeFile(
    "reports/meld-ui-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await app.close();
}
