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
Object.assign(b, { phase: "place", focus: 6, channel: 3, turn: 2 });
b.enemies[0].hp = b.enemies[0].maxHp = 100;
const host = g.instance(g.newCard("ward"));
Object.assign(host, { ward: 0, zeroWard: true, used: 1 });
b.grid[8] = [host];
const pal = g.newCard("palimpsest"),
  lat = g.newCard("lattice"),
  under = g.newCard("undertow"),
  alone = g.newCard("lattice");
b.hand = [pal, lat, under, alone];
delete g.s.checkpoint;
const profile = path.resolve(".tmp/utility-meld-" + Date.now()),
  dir = "reports/screenshots/utility-meld";
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
  const drag = async (uid, slot) => {
    await p
      .locator(`[data-hand="${uid}"]`)
      .dragTo(p.locator(`[data-slot="${slot}"]`));
    await settle();
  };
  const latest = async () => {
    const save = JSON.parse(await fs.readFile(profile + "/save.json", "utf8"));
    return JSON.parse(
      await fs.readFile(
        profile + "/runs/" + save.uiMeta.runId + "/latest.json",
        "utf8",
      ),
    );
  };
  await drag(pal.uid, 8);
  await drag(lat.uid, 8);
  assert.equal(await p.locator("[data-placement-element]").count(), 7);
  assert.equal((await latest()).battle.focus, 5);
  await p.locator("[data-placement-cancel]").click();
  assert.equal(await p.locator(`[data-hand="${lat.uid}"]`).count(), 1);
  await drag(lat.uid, 8);
  await p.screenshot({ path: dir + "/choose-element.png" });
  await p.locator('[data-placement-element="Water"]').click();
  await settle();
  let state = await latest();
  assert.equal(state.battle.grid[8].at(-1).ward, 5);
  assert.equal(state.battle.grid[8].at(-1).element, "Water");
  assert.equal(state.battle.grid[8].at(-1).used, 1);
  await p.locator('[data-slot="8"]').click();
  assert.match(
    await p.locator(".card-facts").textContent(),
    /0 Focus for whole stack/,
  );
  assert.match(
    await p.locator(".card-facts").textContent(),
    /Chosen element: Water/,
  );
  await p.screenshot({ path: dir + "/revived-host.png" });
  await p.locator("[data-close]").click();
  assert.equal(
    await p.locator(`[data-hand="${under.uid}"] .cost`).textContent(),
    "R",
  );
  await drag(under.uid, 8);
  state = await latest();
  assert.equal(state.battle.focus, 4);
  assert.equal(state.battle.grid[8].length, 0);
  for (const c of [host, pal, lat])
    assert.equal(await p.locator(`[data-hand="${c.uid}"]`).count(), 1);
  assert.equal(await p.locator(`[data-hand="${under.uid}"]`).count(), 0);
  await drag(host.uid, 8);
  state = await latest();
  assert.equal(state.battle.grid[8][0].element, "Arcane");
  assert.equal(state.battle.grid[8][0].ward, 1);
  assert.equal(state.battle.grid[8][0].used, 0);
  await drag(alone.uid, 20);
  await p.locator('[data-placement-element="Fire"]').click();
  await settle();
  await p
    .getByRole("button", { name: "Begin activation", exact: true })
    .click();
  await settle();
  await p.locator('[data-activate-slot="20"]').click();
  await settle();
  state = await latest();
  assert.equal(state.battle.grid[20][0].ward, 6);
  assert.equal(state.battle.grid[20][0].element, "Fire");
  await p.mouse.move(10, 100);
  await p.screenshot({ path: dir + "/replayed-and-standalone.png" });
  assert.deepEqual(errors, []);
  const report = {
    package: "2.1.19",
    checks: [
      "Palimpsest discounts displayed Recall to zero",
      "Lattice drag opens seven-element choice before spending; cancel preserves hand and Focus",
      "Meld revives host to5WaterWard without resetting used count",
      "Undertow costs zero after discount; returns separated reset stack to hand and discards itself",
      "Replayed Ward resets toArcane/1Ward/2uses",
      "Standalone FireLattice starts1 and activates to6",
      "No renderer errors",
    ],
    errors,
  };
  await fs.writeFile(
    "reports/utility-meld-ui-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await app.close();
}
