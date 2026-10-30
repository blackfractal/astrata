import { chromium } from "@playwright/test";
import http from "node:http";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { cards, enemies, items } from "../src/content.mjs";

const root = path.resolve(import.meta.dirname, ".."),
  output = path.join(root, ".tmp", `archives-ui-${Date.now()}`);
const profile = path.join(output, "profile");
await fs.mkdir(profile, { recursive: true });
const seen = (catalog) =>
  Object.fromEntries(
    Object.keys(catalog).map((id) => [id, { firstSeenAt: "test" }]),
  );
const collections = {
  schema: 1,
  importedTraces: true,
  highestStratum: 4,
  cards: seen(cards),
  enemies: seen(enemies),
  equipment: seen(items),
  achievements: {
    "defeat-choir": { earnedAt: "test" },
    "defeat-censer": { earnedAt: "legacy" },
  },
};
delete collections.cards.solitude;
await fs.writeFile(
  path.join(profile, "collections.json"),
  JSON.stringify(collections),
);
await fs.writeFile(
  path.join(profile, "history.json"),
  JSON.stringify(
    Array.from({ length: 25 }, (_, i) => ({
      seed: `archive-test-${i}`,
      outcome: "loss",
      stratum: (i % 4) + 1,
      field: { round: 8 },
      packageVersion: "4.0.40",
    })),
  ),
);
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1600, height: 900, fast: true }),
);
const webroot = process.argv.includes("--packaged")
  ? path.join(root, "release/Astrata/resources/app")
  : root;
const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(
    new URL(req.url, "http://localhost").pathname,
  );
  const file = path.resolve(
    webroot,
    "." + (pathname === "/" ? "/index.html" : pathname),
  );
  if (!file.startsWith(webroot + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    res.setHeader(
      "Content-Type",
      {
        ".mjs": "text/javascript",
        ".js": "text/javascript",
        ".css": "text/css",
        ".html": "text/html",
        ".png": "image/png",
        ".svg": "image/svg+xml",
      }[path.extname(file)] || "application/octet-stream",
    );
    res.end(await fs.readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
let app;
try {
  app = await chromium.launch({
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const page = await app.newPage({ viewport: { width: 1600, height: 900 } }),
    errors = [];
  const history = JSON.parse(
    await fs.readFile(path.join(profile, "history.json"), "utf8"),
  );
  await page.addInitScript(
    (data) => localStorage.setItem("astrata", JSON.stringify(data)),
    {
      collections,
      history,
      save: { hp: 70, field: { round: 1 } },
      tutorialSave: {
        hp: 70,
        field: { round: 1 },
        tutorial: { id: "stratum1", name: "The First Clearing" },
      },
      settings: { width: 1600, fast: true },
    },
  );
  page.on("pageerror", (error) => errors.push(error.message));
  async function screenshot(name) {
    await page.mouse.move(1550, 20);
    await page.locator("img").evaluateAll(async (imgs) => {
      await Promise.all(
        imgs
          .filter((img) => {
            const b = img.getBoundingClientRect();
            return (
              b.bottom > 0 &&
              b.top < innerHeight &&
              b.right > 0 &&
              b.left < innerWidth
            );
          })
          .map((img) => img.decode().catch(() => {})),
      );
    });
    await page.screenshot({ path: path.join(output, name) });
  }
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForSelector('[data-ui="archives"]');
  assert.equal(await page.locator(".hero-foot, .hero .eyebrow").count(), 0);
  assert.match(
    await page.locator(".hero-copy").innerText(),
    /Your mind is the battlefield/,
  );
  assert.ok(
    await page
      .locator("#app")
      .evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
  );
  await page.mouse.move(1550, 20);
  await screenshot("title.png");
  await page.locator('[data-ui="settings"]').click();
  await page.locator(".settings-controls summary").click();
  assert.match(await page.locator(".settings-controls").innerText(), /Escape/);
  await screenshot("settings.png");
  await page.keyboard.press("Escape");
  await page.locator('[data-ui="archives"]').click();
  assert.equal(await page.locator(".archives h1").innerText(), "Cards");
  assert.deepEqual(await page.locator("[data-archive-nav]").allTextContents(), [
    "Cards",
    "Enemies",
    "Equipment",
    "Achievements",
    "Run History",
  ]);
  const nav = await page.locator(".archive-tabs").boundingBox(),
    title = await page.locator(".archives h1").boundingBox();
  assert.ok(nav.y + nav.height <= title.y);
  assert.equal(await page.locator(".archive-entry.undiscovered").count(), 1);
  assert.equal(
    await page.locator('[data-entry="blast"] .archive-stat').count(),
    4,
  );
  await screenshot("cards.png");
  await page.locator("[data-filter-toggle]").click();
  await page.locator('[data-filter="element"]').selectOption("Fire");
  await page.locator('[data-filter="role"]').selectOption("Attack");
  assert.equal(await page.locator(".archive-entry.undiscovered").count(), 0);
  assert.ok(await page.locator('[data-entry="ignis"]').count());
  await screenshot("card-filters.png");
  await page.locator("[data-filter-reset]").click();
  await page.locator('[data-entry="blast"]').click();
  assert.equal(await page.locator(".archive-detail .archive-stat").count(), 4);
  await screenshot("card-detail.png");
  await page.keyboard.press("Escape");
  await page.getByRole("searchbox").fill("solitude");
  assert.equal(await page.locator("[data-entry]").count(), 0);
  for (const section of ["enemies", "equipment", "achievements", "history"]) {
    await page.locator(`[data-archive-nav="${section}"]`).click();
    if (section === "enemies") {
      assert.equal(
        await page
          .locator(".archive-entry-copy b", { hasText: "Patient Spoolkeeper" })
          .count(),
        1,
      );
      assert.equal(
        await page
          .locator(".archive-entry-copy b", { hasText: "Borrowed Oracle" })
          .count(),
        1,
      );
      await page.locator('[data-entry="borrowedOracle"]').click();
      await page.locator("#archive-variant").selectOption("1");
      assert.match(
        await page.locator(".archive-detail").innerText(),
        /40 base HP/,
      );
      await page.keyboard.press("Escape");
      await page.locator("[data-filter-toggle]").click();
      await page.locator('[data-filter="kind"]').selectOption("Ideon");
      assert.equal(
        await page.locator("[data-entry]").count(),
        Object.values(enemies).filter((d) => d.tier === "Ideon").length,
      );
    }
    if (section === "equipment") {
      await page.locator("[data-filter-toggle]").click();
      await page.locator('[data-filter="category"]').selectOption("Bracelet");
      await page.locator('[data-entry="gold"]').click();
      assert.match(
        await page.locator(".archive-detail").innerText(),
        /7 Guard/,
      );
      await page.keyboard.press("Escape");
    }
    if (section === "achievements") {
      assert.equal(
        await page.getByText("??????????????????", { exact: true }).count(),
        4,
      );
      for (const name of [
        "Blast Miser",
        "Shield Miser",
        "On a Strict Diet",
        "Masochist",
        "Sedentary Lifestyle",
      ]) {
        const entry = page
          .locator(".archive-achievement")
          .filter({ has: page.getByRole("heading", { name, exact: true }) });
        assert.match(
          await entry.locator(".achievement-description").innerText(),
          /Complete a run/,
        );
      }
      assert.equal(await page.locator(".archive-achievement").count(), 22);
      assert.match(
        await page
          .locator(".archive-achievement")
          .filter({
            has: page.getByRole("heading", {
              name: "Elemental Purity",
              exact: true,
            }),
          })
          .innerText(),
        /at most one other printed element/,
      );
      assert.equal(
        await page
          .getByText("Defeat the Censer Engine", { exact: true })
          .count(),
        0,
      );
    }
    if (section === "achievements") {
      await page.getByRole("heading", { name: "Blast Miser", exact: true }).scrollIntoViewIfNeeded();
      await screenshot("achievement-challenges.png");
      await page.getByRole("heading", { name: "Calm Astrata", exact: true }).scrollIntoViewIfNeeded();
      await screenshot("achievement-secrets.png");
    }
    if (section === "history")
      assert.equal(await page.locator("[data-run]").count(), 20);
    await screenshot(`${section}.png`);
  }
  await page.keyboard.press("Escape");
  await page.locator('[data-ui="settings"]').click();
  await page.locator("#resolution").selectOption("1280,720");
  await page.locator('[data-ui="applySettings"]').click();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.locator('[data-ui="archives"]').click();
  await page.locator("[data-filter-toggle]").click();
  await screenshot("cards-1280.png");
  assert.ok(
    await page
      .locator(".archives")
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  );
  assert.ok(
    await page
      .locator(".archive-body")
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  );
  const broken = await page
    .locator(".archive-gallery img")
    .evaluateAll((imgs) =>
      imgs
        .filter((img) => img.complete && !img.naturalWidth)
        .map((img) => img.src),
    );
  assert.deepEqual(broken, []);
  assert.deepEqual(errors, []);
  await fs.writeFile(
    path.join(output, "result.json"),
    JSON.stringify({ passed: true, errors, broken }, null, 2),
  );
  console.log(`Archives UI checks passed. Screenshots: ${output}`);
} finally {
  await app?.close();
  await new Promise((resolve) => server.close(resolve));
}
