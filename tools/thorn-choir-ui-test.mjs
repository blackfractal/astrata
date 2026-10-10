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
b.phase = "place";
b.focus = 2;
b.channel = 3;
b.enemies[0].hp = b.enemies[0].maxHp = 100;
b.enemies[0].element = "Fire";
const put = (id, i) => (b.grid[i] = [g.instance(g.newCard(id))])[0];
const thorn = put("thorn", 8);
thorn.element = "Water";
thorn.transmuted = true;
put("transmute", 1);
put("shield", 7);
put("blast", 9).used = 2;
b.hand = [g.newCard("blast")];
delete g.s.checkpoint;
const profile = path.resolve(".tmp/thorn-choir-" + Date.now()),
  dir = "reports/screenshots/thorn-choir";
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
  const number = p.locator('[data-slot="8"] .damage-value');
  assert.equal(await number.textContent(), "6");
  assert.equal(
    await p
      .locator('[data-from="1"][data-to="8"][data-link-type="benefit"]')
      .count(),
    0,
  );
  assert.equal(
    await p
      .locator('[data-from="9"][data-to="8"][data-link-type="benefit"]')
      .count(),
    1,
  );
  await p.locator("[data-hand]").dragTo(p.locator('[data-slot="15"]'));
  await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
  assert.equal(await number.textContent(), "8");
  await p
    .getByRole("button", { name: "Begin activation", exact: true })
    .click();
  await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
  const source = await p.locator('[data-slot="8"]').boundingBox(),
    target = await p.locator('[data-enemy-uid="900"]').boundingBox();
  await p.mouse.move(source.x + 25, source.y + 15);
  await p.mouse.down();
  await p.mouse.move(source.x + 40, source.y + 20, { steps: 5 });
  await p.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
    { steps: 12 },
  );
  await p.mouse.move(
    target.x + target.width / 2 + 2,
    target.y + target.height / 2,
  );
  await p.waitForFunction(
    () =>
      document.querySelector('[data-slot="8"] .damage-value')?.textContent ===
      "12 (+4)",
  );
  await p.screenshot({ path: dir + "/water-preview.png" });
  await p.mouse.move(12, 100, { steps: 10 });
  await p.mouse.up();
  assert.equal(await number.textContent(), "8");
  await p.keyboard.press("Escape");
  await p.locator('[data-activate-slot="8"]').dblclick();
  await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
  const save = JSON.parse(await fs.readFile(profile + "/save.json", "utf8"));
  const latest = JSON.parse(
    await fs.readFile(
      profile + "/runs/" + save.uiMeta.runId + "/latest.json",
      "utf8",
    ),
  );
  assert.equal(latest.battle.enemies[0].hp, 88);
  assert.deepEqual(errors, []);
  const report = {
    package: JSON.parse(await fs.readFile("package.json")).version,
    checks: [
      "Utility and Shield excluded; spent Blast counts",
      "Placing second damaging neighbor updates 6 to 8",
      "Water hover previews 12 and cancellation restores 8",
      "Actual attack deals 12",
      "No erroneous utility bonus connection",
    ],
    errors,
  };
  await fs.writeFile(
    "reports/thorn-choir-ui-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await app.close();
}
