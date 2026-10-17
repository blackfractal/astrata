import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { apexFixture } from "./apex-fixture.mjs";
import { VERSION } from "../src/content.mjs";
const report = {
  version: VERSION.rules,
  packaged: process.argv.includes("--packaged"),
  checks: [],
  errors: [],
};
await fs.mkdir("reports/screenshots/apex", { recursive: true });
for (const kind of [
  "intro",
  "floor1",
  "floor2",
  "floor3",
  "summit",
  "predator",
  "boar",
  "chimera",
  "pair",
  "victory",
]) {
  const n =
    kind === "floor2"
      ? 2
      : kind === "floor3"
        ? 3
        : kind === "summit" || kind === "predator" || kind === "victory"
          ? 4
          : 1;
  const g = apexFixture(84001, kind === "intro" ? 0 : n);
  if (kind === "intro") g.act(g.legal().find((a) => a.type === "leave"));
  if (["predator", "victory"].includes(kind))
    g.act(g.legal().find((a) => a.type === "fightApex"));
  if (kind === "predator") {
    g.s.battle.grid[10] = [g.instance(g.newCard("ward"))];
    g.s.battle.grid[11] = [g.instance(g.newCard("grove"))];
    g.s.battle.enemies[0].cycle = 1;
  }
  if (kind === "pair") {
    g.beginBattle(
      ["bombadier", "trickster"].map((enemy) => ({
        uid: g.uid(),
        enemy,
        restless: 0,
        apexMap: true,
        apexFloor: 2,
      })),
    );
  }
  if (kind === "boar" || kind === "chimera")
    g.beginBattle([
      {
        uid: g.uid(),
        enemy: kind === "boar" ? "riftBoar" : "riftChimera",
        restless: 0,
        apexMap: true,
        apexFloor: 1,
      },
    ]);
  if (kind === "victory") {
    g.s.battle.enemies[0].hp = 0;
    g.checkBattle();
    while (g.s.mode === "reward") {
      const a = g
        .legal()
        .find((a) =>
          ["rewardCard", "leaveRewardItem", "continueReward"].includes(a.type),
        );
      g.act(a);
    }
  }
  delete g.s.checkpoint;
  const profile = path.resolve(".tmp/apex-ui-" + kind + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1440, fast: true }),
  );
  const app = await electron.launch({
    executablePath: path.resolve(
      report.packaged
        ? "release/Astrata/Astrata.exe"
        : "node_modules/electron/dist/electron.exe",
    ),
    args: [
      ...(report.packaged ? [] : [path.resolve(".")]),
      "--disable-gpu",
      "--user-data-dir=" + profile,
    ],
    timeout: 30000,
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(kind + ": " + e.message));
    await p.locator('[data-ui="continue"]').click();
    if (kind.startsWith("floor")) {
      await p.locator(".apex-field").waitFor();
      assert.equal(await p.locator(".tile").count(), [0, 121, 81, 49][n]);
      assert.equal(await p.locator(".apex-seal").count(), 2);
      const background = await p.locator('.apex-field').evaluate(async el => {
        const css = getComputedStyle(el).backgroundImage;
        const url = [...css.matchAll(/url\("?([^"\)]+)"?\)/g)].at(-1)?.[1];
        const im = new Image(); im.src = url;
        await im.decode(); return {css,width:im.naturalWidth};
      });
      assert.ok(background.css.includes(`location-apex-floor${n}.png`));
      assert.ok(background.width > 1000);
      assert.ok((await p.locator(".apex-roster").innerText()).length > 10);
      // Exercise map coordinates on resized rooms through their real UI actions.
      const move = p.locator(".tile.reachable[data-action]").first();
      await move.click();
    } else if (kind === "intro") await p.locator(".apex-intro").waitFor();
    else if (kind === "summit") {
      await p.locator(".apex-summit").waitFor();
      assert.equal(await p.locator('[data-action*="wait"]').count(), 0);
    } else if (kind === "victory") {
      await p
        .getByText("The Apex Predator has fallen.", { exact: false })
        .waitFor();
    } else {
      await p.locator(".enemy").first().waitFor();
      assert.equal(await p.locator(".enemy").count(), kind === "pair" ? 2 : 1);
    }
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    await p.screenshot({ path: "reports/screenshots/apex/" + kind + ".png" });
    const layout = await p.evaluate(() => ({
      viewport: [innerWidth, innerHeight],
      scroll: [
        document.documentElement.scrollWidth,
        document.documentElement.scrollHeight,
      ],
      app: [
        document.querySelector("#app").clientHeight,
        document.querySelector("#app").scrollHeight,
      ],
      broken: [...document.images]
        .filter((i) => !i.complete || !i.naturalWidth)
        .map((i) => i.src),
    }));
    assert.ok(
      layout.app[1] <= layout.app[0] + 2,
      kind + " scrolls: " + JSON.stringify(layout.app),
    );
    assert.equal(layout.broken.length, 0, JSON.stringify(layout.broken));
    report.checks.push({ kind, layout });
  } catch (e) {
    const p = await app.firstWindow();
    console.error(kind, report.errors, await p.locator("body").innerText());
    await p.screenshot({ path: "reports/screenshots/apex/failure.png" });
    throw e;
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/apex-ui-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
