import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.21", checks: [], errors: [] };
const dir = "reports/screenshots/golem-defeat";
await fs.mkdir(dir, { recursive: true });
const settle = (p) =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
function base() {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  g.s.battle.phase = "activate";
  g.s.battle.hand = [];
  return g;
}
async function check(g, fn) {
  const profile = path.resolve(".tmp/golem-defeat-" + Date.now());
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
  const page = await app.firstWindow();
  page.on("pageerror", (e) => report.errors.push(e.message));
  try {
    await page.locator('[data-ui="continue"]').click();
    await fn(page);
  } finally {
    await app.close();
  }
}
const death = base();
death.s.hp = 2;
await check(death, async (p) => {
  await p.evaluate(() => {
    window.hpFrames = [];
    const sample = () => {
      const hp = document.querySelector(".player-portrait b")?.textContent;
      const died = document.querySelector("h1")?.textContent === "You Died";
      if (hp || died) window.hpFrames.push({ hp, died });
    };
    new MutationObserver(sample).observe(document.querySelector("#app"), {
      subtree: true,
      childList: true,
      characterData: true,
    });
    sample();
  });
  await p.getByRole("button", { name: "End turn", exact: true }).click();
  await settle(p);
  assert.equal(await p.locator("h1").textContent(), "You Died");
  const frames = await p.evaluate(() => window.hpFrames);
  assert.ok(frames.every((f) => !f.hp || !f.hp.includes("-")));
  const zero = frames.findIndex((f) => f.hp?.startsWith("0/"));
  assert.ok(zero >= 0);
  assert.ok(frames.findIndex((f) => f.died) > zero);
  await p.screenshot({ path: dir + "/you-died.png" });
  report.checks.push(
    "Lethal attack shows 0 HP in the battle before You Died; no negative HP appears in sampled rendered states.",
  );
});
const golem = base();
golem.s.battle.grid[6] = [golem.instance(golem.newCard("golem"))];
await check(golem, async (p) => {
  assert.match(
    await p.locator('[data-slot="6"] .ally-health').textContent(),
    /10 \/ 10/,
  );
  assert.match(
    await p.locator('[data-activate-slot="6"]').textContent(),
    /\+6 HP.*Taunt/,
  );
  await p.locator('[data-activate-slot="6"]').click();
  await settle(p);
  assert.match(
    await p.locator('[data-slot="6"] .ally-health').textContent(),
    /16 \/ 16/,
  );
  assert.equal(await p.locator('[data-card-status="Taunt"]').count(), 1);
  await p.screenshot({ path: dir + "/golem-grown.png" });
  await p.getByRole("button", { name: "End turn", exact: true }).click();
  await settle(p);
  assert.equal(await p.locator('[data-card-status="Taunt"]').count(), 0);
  assert.match(
    await p.locator('[data-slot="6"] .ally-health').textContent(),
    /12 \/ 16/,
  );
  assert.match(await p.locator(".player-portrait b").textContent(), /65\/65/);
  report.checks.push(
    "Stone Golem displays 10 HP, activates once to 16/16 with a Taunt badge, intercepts the enemy hit, and enters the next turn at 12/16 without Taunt.",
  );
});
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/golem-defeat-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
