import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const dir = "reports/screenshots/field-supplies",
  report = { package: "2.0.4", checks: [], errors: [] };
await fs.mkdir(dir, { recursive: true });
async function open(g, label) {
  const profile = path.resolve(
    ".tmp/field-supplies-ui-" + label + "-" + Date.now(),
  );
  await fs.mkdir(profile, { recursive: true });
  delete g.s.checkpoint;
  g.s.log = [];
  g.s.history = [];
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
  await p.locator('[data-ui="continue"]').click();
  const state = async () => {
    const ds = await fs.readdir(path.join(profile, "runs"), {
      withFileTypes: true,
    });
    const d = ds.find((x) => x.isDirectory() && x.name !== "builds");
    const v = JSON.parse(
      await fs.readFile(
        path.join(profile, "runs", d.name, "latest.json"),
        "utf8",
      ),
    );
    return v.state || v;
  };
  const settle = async () =>
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
  return { app, p, state, settle };
}
const g = new Game(381);
g.s.mode = "intro";
let live = await open(g, "opening");
try {
  const { p } = live;
  await p
    .getByRole("button", { name: "Enter the Whispering Weald", exact: true })
    .click();
  await live.settle();
  assert.equal(await p.locator("[data-field-supply]").count(), 3);
  for (const el of await p.locator("[data-field-supply] img").all())
    await el.evaluate((i) => i.decode());
  await p.mouse.move(5, 5);
  await p.screenshot({ path: dir + "/opening.png" });
  const before = await live.state();
  await p.locator('[data-field-supply="healingSap"]').click();
  await p.locator(".field-supply-preview").waitFor();
  assert.match(await p.locator("#modal").innerText(), /Restore 5 HP/);
  const after = await live.state();
  assert.equal(after.steps, before.steps);
  assert.equal(after.field.x, before.field.x);
  await p.screenshot({ path: dir + "/inspect.png" });
  report.checks.push(
    "Three bottle icons and effect markers load at opening; clicking a visible supply inspects its actual effect without moving.",
  );
} finally {
  await live.app.close();
}
const h = new Game(1);
h.s.mode = "field";
h.s.hp = 50;
h.s.inventory = [];
for (const k in h.s.equipment) h.s.equipment[k] = null;
for (let n = 0; n < 12; n++) h.addItem("focusDraught");
Object.assign(h.s.field, {
  round: 8,
  spawned: 32,
  x: 5,
  y: 5,
  moves: 2,
  stage: "player",
  entities: [
    {
      uid: h.uid(),
      type: "Item",
      item: "healingSap",
      fieldSupply: true,
      x: 6,
      y: 5,
      born: 1,
    },
  ],
});
live = await open(h, "pickup");
try {
  const { p, state, settle } = live;
  await p.locator('[data-field-supply="healingSap"]').click();
  await p
    .getByRole("button", { name: "Move here · collect", exact: true })
    .click();
  await settle();
  await p.getByRole("button", { name: "Leave it here", exact: true }).click();
  await settle();
  let s = await state();
  assert.equal(s.mode, "field");
  assert.equal(s.field.entities.length, 1);
  assert.equal(s.hp, 50);
  async function move(x, y) {
    const a = new Game(0, await state())
      .legal()
      .find((a) => a.type === "move" && a.x === x && a.y === y);
    assert.ok(a);
    await p
      .locator("[data-action=" + JSON.stringify(a.key) + "]")
      .filter({ visible: true })
      .first()
      .click();
    await settle();
  }
  await move(7, 5);
  await move(6, 5);
  await p
    .getByRole("button", {
      name: "Drink now · restore up to 5 HP",
      exact: true,
    })
    .waitFor();
  await p.mouse.move(5, 5);
  await p.screenshot({ path: dir + "/pickup.png" });
  await p
    .getByRole("button", {
      name: "Drink now · restore up to 5 HP",
      exact: true,
    })
    .click();
  await settle();
  s = await state();
  assert.equal(s.hp, 55);
  assert.equal(s.inventory.length, 12);
  assert.equal(s.field.entities.length, 0);
  assert.equal(s.stats.consumablesUsed.at(-1).source, "fieldPickup");
  await p.locator('[data-ui="inventory"]').click();
  assert.match(await p.locator("#modal").innerText(), /12\s*\/\s*12/);
  report.checks.push(
    "Leave it here preserves the bottle; revisit offers it again; Drink now heals five with a full twelve-slot Satchel, consumes it, records pickup use and leaves no overflow.",
  );
} finally {
  await live.app.close();
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/field-supplies-verification.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(report);
