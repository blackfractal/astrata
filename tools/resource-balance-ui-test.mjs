import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const g = new Game(29);
g.s.equipment = {};
g.s.inventory = [];
g.s.hp = 40;
const armor = { uid: g.uid(), id: "holyArmor" },
  neck = { uid: g.uid(), id: "dewNeck" };
g.s.inventory.push(armor, neck);
g.s.equipment = { torso: armor.uid, neck: neck.uid };
g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
const b = g.s.battle;
b.phase = "activate";
b.channel = 10;
b.hand = [];
b.enemies[0].hp = b.enemies[0].maxHp = 999;
b.enemies[0].element = "Arcane";
function put(id, i, upgrade = false) {
  const owned = g.newCard(id);
  owned.upgrade = upgrade;
  const c = g.instance(owned);
  b.grid[i].push(c);
  return c;
}
put("tide", 8);
for (const i of [1, 7, 9, 15]) put("blast", i);
put("plasma", 26).used = 1;
put("plasma", 26);
put("plasma", 26);
put("rot", 29, true);
b.healUses[armor.uid] = 1;
b.healUses[neck.uid] = 2;
delete g.s.checkpoint;
g.s.log = [];
g.s.history = [];
const profile = path.resolve(".tmp/resource-balance-ui-" + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.mkdir("reports/screenshots/resource-balance", { recursive: true });
await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, fast: true }),
);
const report = { package: "1.3.89", checks: [], errors: [] };
const app = await electron.launch({
  executablePath: path.resolve("release/Astrata/Astrata.exe"),
  args: ["--user-data-dir=" + profile],
});
try {
  const p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  assert.match(
    await p.locator('[data-activate-slot="8"]').innerText(),
    /Insight \+4 next turn/,
  );
  assert.match(
    await p.locator('[data-activate-slot="29"]').innerText(),
    /3.*Corrode 1/s,
  );
  assert.equal(
    await p
      .locator('[data-item-uid="' + armor.uid + '"] .heal-uses')
      .textContent(),
    "♥ 1",
  );
  assert.equal(
    await p
      .locator('[data-item-uid="' + neck.uid + '"] .heal-uses')
      .textContent(),
    "♥ 0",
  );
  await p.screenshot({
    path: "reports/screenshots/resource-balance/before.png",
  });
  report.checks.push(
    "Live Tide +4, upgraded Slow Rot direct damage plus Corrode 1, per-item remaining healing counters.",
  );
  const impacts = [];
  await p.exposeFunction("captureBalanceImpact", (x) => impacts.push(x));
  await p.evaluate(() =>
    new MutationObserver((records) => {
      for (const r of records)
        for (const n of r.addedNodes)
          if (n.nodeType === 1 && n.matches(".spell-impact"))
            window.captureBalanceImpact(n.dataset.element);
    }).observe(document.body, { subtree: true, childList: true }),
  );
  async function state() {
    const entries = await fs.readdir(path.join(profile, "runs"), {
      withFileTypes: true,
    });
    const dir = entries.find((x) => x.isDirectory() && x.name !== "builds");
    const raw = JSON.parse(
      await fs.readFile(
        path.join(profile, "runs", dir.name, "latest.json"),
        "utf8",
      ),
    );
    return raw.state || raw;
  }
  for (const slot of [8, 26, 29]) {
    await p.locator('[data-activate-slot="' + slot + '"]').dblclick();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    if (slot === 8) assert.equal((await state()).battle.next.insight, 4);
    if (slot === 26) {
      const s = await state();
      assert.equal(s.battle.enemies[0].hp, 975);
      assert.deepEqual(
        s.battle.grid[26].map((c) => c.used),
        [2, 1, 1],
      );
    }
  }
  const s = await state();
  assert.equal(s.battle.channel, 7);
  assert.equal(s.battle.enemies[0].hp, 972);
  assert.equal(s.battle.enemies[0].status.corrode, 1);
  assert.ok(impacts.includes("Corrode"), JSON.stringify(impacts));
  await p.mouse.move(5, 5);
  await p.screenshot({
    path: "reports/screenshots/resource-balance/after.png",
  });
  report.checks.push(
    "Real UI activations: Tide grants 4 future Insight; three Plasma Balls deal 24 for one Channel and consume independent uses; Slow Rot+ deals 3 then applies Corrode 1 with rust impacts.",
  );
  assert.deepEqual(report.errors, []);
} finally {
  await app.close();
}
await fs.writeFile(
  "reports/resource-balance-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
