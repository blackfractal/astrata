import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const report = { package: "2.0.2", checks: [], errors: [] };
await fs.mkdir("reports/screenshots/first-glimmer", { recursive: true });
for (const [slot, method] of [
  ["wrist2", "art"],
  ["finger2", "body"],
  ["wrist2", "button"],
]) {
  const g = new Game(110),
    profile = path.resolve(".tmp/first-glimmer-" + method + "-" + Date.now());
  g.act(g.legal().find((a) => a.type === "chooseClass"));
  g.s.uiMeta = { runId: "glimmer-" + method, elapsed: 0 };
  const gem = g.s.inventory.find((x) => x.id === g.s.startGem),
    uid = g.s.equipment[slot];
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
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
    await p.locator(".first-glimmer").waitFor();
    assert.equal(await p.locator(".glimmer-card").count(), 3);
    await p
      .locator(".glimmer-art img")
      .evaluateAll((imgs) => Promise.all(imgs.map((img) => img.decode())));
    assert.ok(
      await p
        .locator(".glimmer-cards")
        .evaluate((el) => el.getBoundingClientRect().bottom <= innerHeight),
    );
    const from = p.locator(".glimmer-gem .glimmer-art"),
      to = p.locator('.glimmer-setting[data-socket="' + uid + '"]');
    await from.click();
    await p.locator("#modal .full-art").waitFor();
    await p.locator("#modal [data-close]").click();
    if (method === "art") {
      await from.dragTo(p.locator(".glimmer-heading"));
      assert.ok(await p.locator(".first-glimmer").isVisible());
      await p.screenshot({
        path: "reports/screenshots/first-glimmer/choices.png",
      });
      await from.dragTo(to.locator(".glimmer-art"));
    } else if (method === "body") await from.dragTo(to.locator("h3"));
    else await to.locator("[data-action]").click();
    await p.locator(".companion-intro").waitFor();
    const saved = JSON.parse(await fs.readFile(profile + "/save.json", "utf8"));
    assert.equal(saved.inventory.find((x) => x.uid === uid).gem, gem.uid);
    assert.equal(saved.inventory.filter((x) => x.gem === gem.uid).length, 1);
    report.checks.push(
      slot +
        " socketed via " +
        method +
        "; correct owned Gem, art loads and inspection works.",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/first-glimmer-verification.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(report);
