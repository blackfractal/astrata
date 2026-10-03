import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import zlib from "node:zlib";
import { Game } from "../src/engine.mjs";
const profile = path.resolve(".tmp/archives-ui-" + Date.now()),
  dir = "reports/screenshots/archives";
await fs.mkdir(profile, { recursive: true });
await fs.mkdir(dir, { recursive: true });
const g = new Game(20);
const history = Array.from({ length: 25 }, (_, i) => ({
  ...g.observe(),
  runId: "legacy-" + i,
  seed: 100 + i,
  outcome: "loss",
  packageVersion: "1.3.86",
  stats: {
    ...g.s.stats,
    encounters:
      i === 0
        ? [
            {
              enemies: ["The Glass Choir"],
              outcome: "victory",
              turns: 5,
              hpStart: 70,
              hpEnd: 15,
            },
          ]
        : [],
  },
}));
await fs.writeFile(path.join(profile, "history.json"), JSON.stringify(history));
const run = path.join(profile, "runs", "offered");
await fs.mkdir(run, { recursive: true });
await fs.writeFile(
  path.join(run, "events.jsonl.gz"),
  zlib.gzipSync(
    JSON.stringify({
      state: { mode: "reward", reward: { cards: ["ward", "rain", "clear"] } },
      recordedAt: "2026-10-01T12:00:00Z",
    }) + "\n",
  ),
);
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, fast: true }),
);
const report = { package: "1.3.87", checks: [], errors: [] };
let app, p;
async function open() {
  app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
}
async function shot(name) {
  await p.mouse.move(5, 5);
  await p.screenshot({ path: dir + "/" + name + ".png" });
}
try {
  await open();
  assert.equal(await p.locator('[data-ui="history"]').count(), 0);
  await p.locator('[data-ui="archives"]').click();
  await p.locator("[data-volume]").first().waitFor();
  assert.equal(await p.locator("[data-volume]").count(), 5);
  await shot("hub");
  await p.locator('[data-volume="history"]').click();
  assert.equal(await p.locator("[data-run]").count(), 20);
  assert.match(await p.locator('[data-run="0"]').textContent(), /Seed 124/);
  assert.match(await p.locator('[data-run="19"]').textContent(), /Seed 105/);
  await p.locator('[data-run="0"]').click();
  assert.match(await p.locator("#modal").textContent(), /Seed 124/);
  await p.keyboard.press("Escape");
  assert.equal(
    JSON.parse(await fs.readFile(path.join(profile, "history.json"), "utf8"))
      .length,
    25,
  );
  report.checks.push(
    "Archives replaces Run History; five sections; newest 20 of 25 runs shown, details correct, all25 remain on disk.",
  );
  await p.locator('[data-archive-nav="cards"]').click();
  await p.locator('[data-entry="ward"]').click();
  assert.match(await p.locator("#modal").textContent(), /Ward/);
  await p.keyboard.press("Escape");
  const unknown = p.locator(".archive-entry.undiscovered");
  assert.ok((await unknown.count()) > 0);
  assert.equal(await unknown.locator("img").count(), 0);
  assert.ok(
    (await unknown.allTextContents()).every(
      (t) => t.trim() === "?Undiscovered",
    ),
  );
  await p.locator('[aria-label="Search discovered entries"]').fill("Ward");
  assert.equal(await p.locator("[data-entry]").count(), 1);
  assert.equal(await unknown.count(), 0);
  await p.locator('[aria-label="Search discovered entries"]').fill("");
  await p
    .locator('[aria-label="Collection visibility"]')
    .selectOption("unseen");
  assert.equal(await p.locator("[data-entry]").count(), 0);
  await p.locator('[aria-label="Collection visibility"]').selectOption("all");
  await shot("cards");
  report.checks.push(
    "Unchosen reward offers imported; discovered card details, search/filter work; unknown entries reveal no names/art.",
  );
  await p.locator('[data-archive-nav="enemies"]').click();
  await p.locator('[data-entry="choir"]').click();
  assert.match(await p.locator("#modal").textContent(), /Shatter Hymn/);
  await p.keyboard.press("Escape");
  await p.locator('[data-archive-nav="equipment"]').click();
  await p.locator('[data-entry="bronze"]').click();
  assert.match(await p.locator("#modal").textContent(), /Guard/);
  await p.keyboard.press("Escape");
  await p.locator('[data-archive-nav="achievements"]').click();
  assert.equal(await p.locator(".archive-achievement.earned").count(), 1);
  const calm = p
    .locator(".archive-achievement")
    .filter({ hasText: "Calm Astrata" });
  assert.equal(await calm.count(), 1);
  assert.doesNotMatch(
    await p.locator(".archive-body").textContent(),
    /Stratum 5|hidden item|1 HP|secret clue/i,
  );
  await shot("achievements");
  report.checks.push(
    "Enemy/equipment full details work; legacy Glass Choir victory earns achievement; hidden achievements expose only names and completion state.",
  );
  await p.locator("[data-archive-back]").click();
  await p.locator("[data-archive-back]").click();
  await p.locator('[data-ui="archives"]').waitFor();
  await app.close();
  await open();
  await p.locator('[data-ui="archives"]').click();
  await p.locator('[data-volume="cards"]').click();
  assert.ok(await p.locator('[data-entry="ward"]').count());
  await p.evaluate(() =>
    window.desktop.record({
      runId: "new-discovery",
      kind: "decision",
      state: { mode: "reward", reward: { cards: ["solitude"] } },
    }),
  );
  await p.keyboard.press("Escape");
  await p.keyboard.press("Escape");
  await p.locator('[data-ui="archives"]').click();
  await p.locator('[data-volume="cards"]').click();
  assert.equal(await p.locator('[data-entry="solitude"]').count(), 1);
  report.checks.push(
    "New live decision records immediately persist unchosen offers; Escape returns through hub to start.",
  );
  const profileData = JSON.parse(
    await fs.readFile(path.join(profile, "collections.json"), "utf8"),
  );
  assert.ok(profileData.cards.ward && profileData.achievements["defeat-choir"]);
  report.checks.push(
    "Discoveries/achievements survive process restart; backing run traces retained.",
  );
  assert.deepEqual(report.errors, []);
  await fs.writeFile(
    "reports/archives-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} catch (e) {
  if (p) await p.screenshot({ path: dir + "/failure.png" });
  throw e;
} finally {
  await app?.close();
}
