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
await fs.mkdir("reports/screenshots/enemy-immunity", { recursive: true });
for (const [card, status, element] of [
  ["heat", "burn", "Water"],
  ["spore", "poison", "Fire"],
  ["rot", "corrode", "Chaos"],
]) {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 2;
  b.hand = [];
  b.enemies[0].element = element;
  b.grid[8] = [g.instance(g.newCard(card))];
  const profile = path.resolve(
    ".tmp/enemy-immunity-" + element + "-" + Date.now(),
  );
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
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    const label = "Immune to " + status[0].toUpperCase() + status.slice(1);
    assert.equal(await p.locator(".enemy-immunity").textContent(), label);
    await p.locator(".enemy").click();
    assert.ok((await p.locator(".dialog").textContent()).includes(label));
    await p.locator(".dialog-close").click();
    await p.locator('[data-activate-slot="8"]').dblclick();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    await p.mouse.move(5, 5);
    await p.screenshot({
      path: "reports/screenshots/enemy-immunity/" + element + ".png",
    });
    const dirs = await fs.readdir(path.join(profile, "runs"), {
      withFileTypes: true,
    });
    const run = dirs.find((x) => x.isDirectory() && x.name !== "builds");
    const latest = JSON.parse(
      await fs.readFile(
        path.join(profile, "runs", run.name, "latest.json"),
        "utf8",
      ),
    );
    const state = latest.state || latest;
    assert.equal(state.battle.enemies[0].status[status], 0);
    assert.equal(state.battle.channel, 1);
    const events = await fs.readFile(
      path.join(profile, "runs", run.name, "events.jsonl"),
      "utf8",
    );
    assert.ok(events.includes("immune to"));
    report.checks.push(
      element +
        ": live immunity label/details, real activation spent Channel, status prevented and logged; screenshot captured.",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/enemy-immunity-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
