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
const cases = [
  [
    "enemy",
    "beetle",
    null,
    "Bell Beetle killed you with Chime. Another traveler may find a different way.",
  ],
  [
    "eidolon",
    "mason",
    null,
    "It called this a renovation. You were a load-bearing traveler. Hollow Mason killed you with Hammer. Another traveler may find a different way.",
  ],
  [
    "choir",
    "choir",
    null,
    "They sang of destruction, then delivered it. The Glass Choir killed you with Final Note. Another traveler may find a different way.",
  ],
  ...[
    ["burn", "burning"],
    ["poison", "poison"],
    ["corrode", "corrosion"],
  ].map(([s, n]) => [
    s,
    "beetle",
    s,
    `You died from ${n}. Another traveler may find a different way.`,
  ]),
];
await fs.mkdir("reports/screenshots/death", { recursive: true });
for (const [name, id, status, expected] of cases) {
  const g = new Game(8);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: id, restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.hand = [];
  g.s.hp = 1;
  if (status) {
    g.s.status[status] = 2;
    b.enemies[0].cycle = 1;
  }
  if (id === "choir") {
    b.enemies[0].hp = 1;
    b.grid[0] = [g.instance(g.newCard("blast"))];
  }
  const profile = path.resolve(".tmp/death-" + name + "-" + Date.now());
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
    if (id === "choir") await p.locator('[data-activate-slot="0"]').dblclick();
    else await p.getByRole("button", { name: "End turn", exact: true }).click();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    assert.equal(await p.locator("h1").textContent(), "You Died");
    assert.equal(await p.locator(".hero-copy p").textContent(), expected);
    await p.mouse.move(5, 5);
    await p.screenshot({ path: "reports/screenshots/death/" + name + ".png" });
    const [run] = await fs.readdir(path.join(profile, "runs"));
    const result = JSON.parse(
      await fs.readFile(path.join(profile, "runs", run, "result.json"), "utf8"),
    );
    assert.equal(result.death.message, expected);
    await p.locator('[data-ui="results"]').click();
    assert.ok(
      (await p.locator(".result-title").textContent()).includes(
        result.death.summary,
      ),
    );
    report.checks.push(
      name +
        ": lethal action shows exact requested death text, persists structured cause, and results display attribution.",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/death-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
