import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const report = { checks: [], errors: [] };
for (const completed of [true, false]) {
  const profile = path.resolve(
    ".tmp/loom-companion-" + completed + "-" + Date.now(),
  );
  await fs.mkdir(profile, { recursive: true });
  const g = new Game(112);
  g.enterStratum2();
  g.s.uiMeta = { runId: "companion-timing", elapsed: 0 };
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1280, fast: true }),
  );
  if (completed)
    await fs.writeFile(
      profile + "/tutorial-stats.json",
      JSON.stringify({ stratum2: { firstCompletedAt: "2026-10-04" } }),
    );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    p.on("console", (m) => {
      if (m.type() === "error") console.log(m.text());
    });
    await p.locator('[data-ui="continue"]').click();
    await p.locator('[data-ui="grimoire"]').click();
    assert.doesNotMatch(await p.locator("#modal").innerText(), /Machine Elves/);
    await p.locator("#modal [data-close]").click();
    const leave = g.legal().find((a) => a.type === "leave");
    await p.locator("[data-action=" + JSON.stringify(leave.key) + "]").click();
    await p.locator(".companion-intro").waitFor();
    const before = JSON.parse(
      await fs.readFile(profile + "/save.json", "utf8"),
    );
    assert.equal(
      before.deck.some((c) => c.id === "elves"),
      false,
    );
    await p
      .getByRole("button", { name: "Enter the Unfinished Loom", exact: true })
      .click();
    if (completed) await p.locator(".loom-field").waitFor();
    else await p.locator(".tutorial-guide").waitFor();
    const after = JSON.parse(await fs.readFile(profile + "/save.json", "utf8"));
    assert.equal(after.deck.filter((c) => c.id === "elves").length, 1);
    assert.equal(
      after.stats.withoutMenders.uid,
      after.deck.find((c) => c.id === "elves").uid,
    );
    if (completed) {
      await p.locator('[data-ui="grimoire"]').click();
      assert.match(await p.locator("#modal").innerText(), /Machine Elves/);
    }
    report.checks.push(
      "No Elves in Tavern or pre-entry save; entry grants one companion " +
        (completed
          ? "and opens map/Grimoire."
          : "before separate tutorial, preserving normal save."),
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/loom-companion-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
