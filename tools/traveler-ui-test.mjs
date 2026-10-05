import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const report = { checks: [], errors: [] };
await fs.mkdir("reports/screenshots/traveler", { recursive: true });
for (const choice of ["Give 15 Gold", "Keep your Gold", "field"]) {
  const g = new Game(94);
  if (choice === "field") g.openTavern();
  else g.enterStratum2();
  g.s.gold = 100;
  const profile = path.resolve(".tmp/traveler-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1280, fast: true }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("node_modules/electron/dist/electron.exe"),
    args: [path.resolve("."), "--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    await p.locator('[data-tavern="gossip"]').click();
    const service = p.locator(".tavern-service");
    if (choice === "field") {
      assert.match(await service.innerText(), /Gossip.*Archon/);
      assert.equal(
        await service
          .getByRole("button", { name: "Give 15 Gold", exact: true })
          .count(),
        0,
      );
    } else {
      assert.match(await service.innerText(), /my sister/);
      assert.doesNotMatch(
        await service.innerText(),
        /Archon|achievement|Stratum 5/i,
      );
      const fits = await service.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.bottom <= innerHeight + 1 && el.scrollHeight <= el.clientHeight + 1
        );
      });
      assert.ok(fits);
      await p.screenshot({
        path:
          "reports/screenshots/traveler/" +
          (choice.startsWith("Give") ? "give" : "decline") +
          ".png",
      });
      await service.getByRole("button", { name: choice, exact: true }).click();
      await p.waitForFunction(
        () => !document.querySelector(".tavern-service [data-action]"),
      );
      const saved = JSON.parse(
        await fs.readFile(profile + "/save.json", "utf8"),
      );
      assert.equal(saved.gold, choice.startsWith("Give") ? 85 : 100);
      assert.equal(
        saved.shop.travelerDecision,
        choice.startsWith("Give") ? "gave" : "declined",
      );
      assert.equal(saved.revealedArchon, undefined);
    }
    report.checks.push(choice);
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/traveler-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
