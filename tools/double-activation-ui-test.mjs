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
const settle = (p) =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
function base(count = 1, id = "thorn") {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle(
    Array.from({ length: count }, (_, i) => ({
      uid: 900 + i,
      enemy: "beetle",
      restless: 0,
    })),
  );
  const b = g.s.battle;
  b.phase = "activate";
  b.channel = 10;
  b.hand = [];
  b.grid[6] = [g.instance(g.newCard(id))];
  for (const e of b.enemies) {
    e.hp = e.maxHp = 100;
    e.element = "Arcane";
  }
  return g;
}
async function check(name, g, fn) {
  const profile = path.resolve(".tmp/double-activate-" + Date.now());
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
    report.checks.push(name);
  } finally {
    await app.close();
  }
}
const activate = (p) => p.locator('[data-activate-slot="6"]');
const enemy = (p) => p.locator('[data-enemy-uid="900"]');
await check(
  "Single click still highlights the sole enemy without spending Channel; Escape cancels.",
  base(),
  async (p) => {
    await activate(p).click();
    assert.equal(await p.locator(".enemy.target-option").count(), 1);
    assert.match(await enemy(p).textContent(), /100 \/ 100 HP/);
    assert.equal(await p.locator(".resources b").nth(2).textContent(), "10");
    await p.keyboard.press("Escape");
    assert.equal(await p.locator(".targeting-bar").count(), 0);
  },
);
await check(
  "Double-clicking a sole-target attack commits exactly once; later double clicks on the used card do nothing.",
  base(),
  async (p) => {
    await activate(p).dblclick({ force: true });
    await settle(p);
    assert.match(await enemy(p).textContent(), /96 \/ 100 HP/);
    assert.equal(await p.locator(".resources b").nth(2).textContent(), "9");
    assert.equal(await p.locator(".targeting-bar").count(), 0);
    await activate(p).dblclick({ force: true });
    assert.match(await enemy(p).textContent(), /96 \/ 100 HP/);
  },
);
await check(
  "Double-click attacks the top displayed enemy once when two enemies are available.",
  base(2),
  async (p) => {
    await activate(p).dblclick({ force: true });
    await settle(p);
    assert.match(await enemy(p).textContent(), /96 \/ 100 HP/);
    assert.match(
      await p.locator('[data-enemy-uid="901"]').textContent(),
      /100 \/ 100 HP/,
    );
    assert.equal(await p.locator(".resources b").nth(2).textContent(), "9");
    assert.equal(await p.locator(".targeting-bar").count(), 0);
  },
);
const reordered = base(2);
reordered.s.battle.enemies.reverse();
reordered.s.battle.enemies[0].hp = 1;
reordered.s.battle.grid[20] = [reordered.instance(reordered.newCard("thorn"))];
await check(
  "Uses display order rather than UID; after the top enemy dies, the next attack targets the new top enemy.",
  reordered,
  async (p) => {
    assert.equal(
      await p.locator(".enemy").first().getAttribute("data-enemy-uid"),
      "901",
    );
    await activate(p).dblclick({ force: true });
    await settle(p);
    assert.equal(await p.locator('[data-enemy-uid="901"]').count(), 0);
    assert.match(await enemy(p).textContent(), /100 \/ 100 HP/);
    await p.locator('[data-activate-slot="20"]').dblclick({ force: true });
    await settle(p);
    assert.match(await enemy(p).textContent(), /96 \/ 100 HP/);
    assert.equal(await p.locator(".resources b").nth(2).textContent(), "8");
  },
);
await check(
  "Single-click targeting still allows selecting the lower enemy.",
  base(2),
  async (p) => {
    await activate(p).click();
    await p.locator('[data-enemy-uid="901"].target-option').click();
    await settle(p);
    assert.match(await enemy(p).textContent(), /100 \/ 100 HP/);
    assert.match(
      await p.locator('[data-enemy-uid="901"]').textContent(),
      /96 \/ 100 HP/,
    );
  },
);
const attuned = base(2, "blast");
attuned.s.battle.grid[5] = [attuned.instance(attuned.newCard("thorn"))];
attuned.s.battle.grid[13] = [attuned.instance(attuned.newCard("thorn"))];
attuned.s.battle.grid[13][0].element = "Water";
await check(
  "Multiple attunements stay explicit; after choosing Earth, double-click attacks the top of two enemies.",
  attuned,
  async (p) => {
    await activate(p).dblclick({ force: true });
    assert.match(
      await p.locator(".targeting-bar").textContent(),
      /Choose an attunement/,
    );
    assert.equal(await p.locator(".resources b").nth(2).textContent(), "10");
    await p.locator('[data-slot="5"].target-option').click();
    assert.equal(await p.locator(".enemy.target-option").count(), 2);
    await activate(p).dblclick({ force: true });
    await settle(p);
    assert.match(await enemy(p).textContent(), /96 \/ 100 HP/);
    assert.equal(await p.locator(".resources b").nth(2).textContent(), "9");
  },
);
const empty = base();
empty.s.battle.channel = 0;
await check(
  "Unavailable activation with zero Channel remains inert.",
  empty,
  async (p) => {
    await activate(p).dblclick({ force: true });
    assert.equal(await p.locator(".targeting-bar").count(), 0);
    assert.match(await enemy(p).textContent(), /100 \/ 100 HP/);
  },
);
await check(
  "Targetless Kiln charging remains one ordinary activation during a double click.",
  base(1, "kiln"),
  async (p) => {
    await activate(p).dblclick({ force: true });
    await settle(p);
    assert.match(await activate(p).textContent(), /Charge 2\/3/);
    assert.equal(await p.locator(".resources b").nth(2).textContent(), "9");
    assert.match(await enemy(p).textContent(), /100 \/ 100 HP/);
  },
);
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/double-activation-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
