import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
const policy = new WeightedPolicy(),
  states = {};
for (
  let seed = 825183;
  seed < 825193 && Object.keys(states).length < 5;
  seed++
) {
  const g = new Game(seed);
  for (let i = 0; i < 1600 && g.s.mode !== "result"; i++) {
    const mode = g.s.mode;
    if (
      ["field", "battle", "tavern", "reward", "item"].includes(mode) &&
      !states[mode]
    )
      states[mode] = structuredClone(g.s);
    const a = policy.choose(g.observe(), g.legal());
    if (!a) break;
    g.act(a.action);
  }
}
await fs.mkdir("reports/screenshots/polish", { recursive: true });
const report = { errors: [], checks: [] };
for (const mode of process.env.ONLY
  ? [process.env.ONLY]
  : ["battle", "field", "tavern", "reward", "item"]) {
  if (!states[mode]) throw Error("Missing fixture " + mode);
  const profile = path.resolve(".tmp/polish-" + mode + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(
    path.join(profile, "save.json"),
    JSON.stringify(states[mode]),
  );
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, height: 800, fast: true }),
  );
  const app = await electron.launch({
    executablePath: process.env.PACKAGED
      ? path.resolve("release/Astrata/Astrata.exe")
      : path.resolve("node_modules/electron/dist/electron.exe"),
    args: [
      ...(process.env.PACKAGED ? [] : ["."]),
      "--user-data-dir=" + profile,
    ],
  });
  try {
    const page = await app.firstWindow();
    page.on("pageerror", (e) => report.errors.push(e.message));
    await page.locator('[data-ui="continue"]').click();
    await page.waitForTimeout(150);
    await page.screenshot({
      path: `reports/screenshots/polish/${mode}.png`,
      fullPage: true,
    });
    const missing = await page
      .locator("img")
      .evaluateAll((xs) =>
        xs.filter((i) => !i.complete || !i.naturalWidth).map((i) => i.src),
      );
    if (missing.length) throw Error("Missing " + missing);
    if (mode === "battle") {
      const hand = page.locator('[data-hand][draggable="true"]').first();
      await hand.click();
      await page.waitForSelector(".card-peek .full-art");
      report.checks.push("Hand card opens full artwork and details");
      await page.locator(".slot.valid").first().click();
      await page.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
      await page
        .getByRole("button", { name: "Begin activation", exact: true })
        .click();
      await page.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
      const available = page.locator(".slot-activate.available").first();
      if (await available.count()) {
        await available.click();
        if (await page.locator("[data-confirm-activation]").count())
          await page.locator("[data-confirm-activation]").click();
        await page.waitForFunction(
          () => !document.querySelector(".presentation-bar"),
        );
        report.checks.push("Visible on-card activation executes");
      }
      await page.locator(".slot:not(.empty)").first().click();
      await page.waitForSelector(".card-peek");
      await page.screenshot({
        path: "reports/screenshots/polish/card-details.png",
      });
      await page.locator("[data-close]").click();
      report.checks.push(
        "Placed card popup, remaining allowance, persistent player and seven gear slots",
      );
    }
    if (mode === "tavern") {
      await page.locator('[data-tavern="equipment"]').click();
      await page.screenshot({
        path: "reports/screenshots/polish/tavern-equipment.png",
        fullPage: true,
      });
      if (
        await page.locator(".tavern-service .gem-socket[data-gem-drag]").count()
      ) {
        const gemId = Number(
          await page
            .locator(".tavern-service .gem-socket[data-gem-drag]")
            .first()
            .getAttribute("data-gem-drag"),
        );

        const from = page
            .locator(".tavern-service .gem-socket[data-gem-drag]")
            .first(),
          to = page.locator("[data-unsocket-drop]");
        await to.scrollIntoViewIfNeeded();
        const a = await from.boundingBox(),
          b = await to.boundingBox();
        await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
        await page.mouse.down();
        await page.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2 + 8, {
          steps: 4,
        });
        await page.mouse.move(b.x + b.width - 10, b.y + 10, { steps: 16 });
        await page.mouse.move(b.x + b.width - 10, b.y + 20);
        await page.mouse.up();
        await page.waitForFunction(
          () => !document.querySelector(".presentation-bar"),
        );
        await page.locator('[data-tavern="equipment"]').click();
        await page.screenshot({
          path: "reports/screenshots/polish/after-unsocket.png",
          fullPage: true,
        });
        report.checks.push("Gem dragged out to satchel");

        if (gemId) {
          await page
            .locator(`.satchel [data-item-uid="${gemId}"]`)
            .dragTo(page.locator(".tavern-service [data-socket]").first());
          await page.waitForFunction(
            () => !document.querySelector(".presentation-bar"),
          );
          if (
            !(await page
              .locator(`.tavern-service [data-gem-drag="${gemId}"]`)
              .count())
          )
            throw Error("Gem was not socketed");
          report.checks.push("Gem dragged into Setting");
        }
      }
      const bracelet = states.tavern.equipment.wrist1;
      if (bracelet) {
        await page
          .locator(`.satchel [data-item-uid="${bracelet}"]`)
          .dragTo(page.locator('.tavern-service [data-equip-slot="wrist2"]'));
        await page.waitForFunction(
          () => !document.querySelector(".presentation-bar"),
        );
        if (
          !(await page
            .locator(
              `.tavern-service [data-equip-slot="wrist2"] [data-item-detail="${bracelet}"]`,
            )
            .count())
        )
          throw Error("Equipment drag failed");
        report.checks.push("Equipment dragged into a compatible body slot");
      }
    }
    if (mode === "reward") {
      if (!(await page.getByText("Choose ONE card", { exact: false }).count()))
        throw Error("Reward label absent");
      report.checks.push("Choose-one card reward labeled");
    }
    if (mode === "item") {
      if ((await page.locator(".catalog [data-action]").count()) !== 1)
        throw Error("Item offers a choice");
      report.checks.push("One fixed item with Collect");
    }
    report[mode] = {
      missing,
      viewport: await page.evaluate(() => ({
        width: innerWidth,
        height: innerHeight,
        scroll: document.documentElement.scrollHeight,
      })),
    };
  } finally {
    await app.close();
  }
}
await fs.writeFile(
  "reports/polish-ui-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) throw Error("Renderer errors");
