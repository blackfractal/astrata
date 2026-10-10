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
Object.assign(b.enemies[0], { hp: 200, maxHp: 200, element: "Arcane" });
const host = g.instance(g.newCard("plasma"));
b.grid[8] = [host];
b.hand = Array.from({ length: 4 }, () => g.newCard("plasma"));
const hand = b.hand.map((c) => c.uid);
delete g.s.checkpoint;
const profile = path.resolve(".tmp/plasma-meld-" + Date.now()),
  dir = "reports/screenshots/plasma-meld";
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
  for (let n = 0; n < 3; n++) {
    await p
      .locator(`[data-hand="${hand[n]}"]`)
      .dragTo(p.locator('[data-slot="8"]'));
    await settle();
    assert.equal(
      await p.locator('[data-slot="8"] .damage-value').textContent(),
      String([24, 28, 30][n]),
    );
    assert.equal(
      await p.locator('[data-slot="8"] .level').textContent(),
      `${n + 2} balls`,
    );
  }
  assert.equal(await p.locator('[data-slot="8"] .meld-layers').count(), 1);
  await p.locator('[data-slot="8"]').click();
  assert.match(await p.locator(".card-facts").textContent(), /5 \/ 5/);
  assert.match(
    await p.locator(".card-facts").textContent(),
    /4 Focus for whole stack/,
  );
  assert.match(
    await p.locator(".card-stat-breakdown").first().textContent(),
    /16 \+ 8 \+ 4 \+ 2/,
  );
  await p.screenshot({ path: dir + "/combined-details.png" });
  await p.getByText("Stack · 4 cards", { exact: true }).click();
  await p.locator(`[data-stack-card="${hand[0]}"]`).click();
  assert.equal(await p.locator("[data-full-activate]").isDisabled(), true);
  assert.match(
    await p.locator(".card-facts").textContent(),
    /With host only · \+1 Focus/,
  );
  await p.locator("[data-close]").click();
  await p
    .locator(`[data-hand="${hand[3]}"]`)
    .dragTo(p.locator('[data-slot="8"]'));
  await settle();
  assert.equal(await p.locator(`[data-hand="${hand[3]}"]`).count(), 1);
  assert.equal(
    await p.locator('[data-slot="8"] .level').textContent(),
    "4 balls",
  );
  if (await p.locator("#modal [data-close]").first().isVisible())
    await p.locator("#modal [data-close]").first().click();
  await p
    .getByRole("button", { name: "Begin activation", exact: true })
    .click();
  await settle();
  await p.locator('[data-activate-slot="8"]').dblclick();
  await settle();
  await p.mouse.move(12, 100);
  await p.screenshot({ path: dir + "/stacked-attack.png" });
  const save = JSON.parse(await fs.readFile(profile + "/save.json", "utf8"));
  const latest = JSON.parse(
    await fs.readFile(
      profile + "/runs/" + save.uiMeta.runId + "/latest.json",
      "utf8",
    ),
  );
  assert.equal(latest.battle.grid[8].at(-1).uid, host.uid);
  assert.equal(latest.battle.grid[8].at(-1).used, 1);
  assert.equal(latest.battle.enemies[0].hp, 170);
  assert.equal(latest.battle.channel, 2);
  assert.deepEqual(errors, []);
  const report = {
    package: "2.1.18",
    checks: [
      "Drag additions beneath original Plasma; live damage24/28/30",
      "Four-ball cap rejects fifth ball without spending it",
      "Combined details show5uses, Recall4 and damage breakdown",
      "Attachment is inspectable and cannot activate independently",
      "One combined30-damage attack spends1Channel and1hostuse",
      "Underneath-card edge marker visible",
      "No renderer errors",
    ],
    errors,
  };
  await fs.writeFile(
    "reports/plasma-meld-ui-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await app.close();
}
