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
await fs.mkdir("reports/screenshots/early-motes", { recursive: true });
for (const id of ["beetle", "bat", "moth"]) {
  const g = new Game(8);
  g.s.equipment = {};
  if (id === "beetle") {
    g.s.mode = "field";
    Object.assign(g.s.field, {
      round: 5,
      spawned: 10,
      moves: 2,
      x: 5,
      y: 5,
      entities: [
        {
          uid: 900,
          enemy: id,
          type: "Mote",
          count: 1,
          x: 6,
          y: 5,
          born: 1,
          restless: 2,
        },
      ],
    });
  } else {
    g.beginBattle([{ uid: 900, enemy: id, restless: 0 }]);
    g.s.battle.enemies[0].cycle = id === "bat" ? 1 : 0;
    g.s.battle.phase = "activate";
  }
  const profile = path.resolve(`.tmp/early-motes-${id}-${Date.now()}`);
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
    const settle = () =>
      p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    if (id === "beetle") {
      await p.locator('[data-cell="61"]').click();
      const info = await p.locator("#modal").textContent();
      assert.match(info, /4 movement rounds old/);
      assert.match(info, /Restless 2/);
      assert.match(info, /Chime · 6 Earth/);
      assert.match(info, /4 spaces/);
      assert.equal(await p.locator(".field").count(), 1);
      await p.mouse.move(5, 5);
      await p.screenshot({
        path: "reports/screenshots/early-motes/age-preview.png",
      });
      await p.locator("[data-close]").click();
      await p.locator('[data-cell="61"]').click();
      await p
        .getByRole("button", { name: "Move here · start battle", exact: true })
        .click();
      await settle();
      await p
        .getByRole("button", { name: "Begin activation", exact: true })
        .click();
      await settle();
      await p.getByRole("button", { name: "End turn", exact: true }).click();
      await settle();
      assert.match(
        await p.locator(".tell").textContent(),
        /-1 Focus next turn only/,
      );
      await p
        .getByRole("button", { name: "Begin activation", exact: true })
        .click();
      await settle();
    } else
      assert.match(
        await p.locator(".tell").textContent(),
        id === "bat"
          ? /-2 Insight next turn only/
          : /-1 Channel next turn only/,
      );
    await p.getByRole("button", { name: "End turn", exact: true }).click();
    await settle();
    const resources = await p.locator(".resources > span b").allTextContents();
    assert.deepEqual(
      resources,
      id === "beetle"
        ? ["0", "0", "2"]
        : id === "moth"
          ? ["0", "1", "1"]
          : ["0", "1", "2"],
    );
    assert.equal(await p.locator("[data-hand]").count(), id === "bat" ? 2 : 4);
    await p.mouse.move(5, 5);
    await p.screenshot({
      path: `reports/screenshots/early-motes/${id}-penalty.png`,
    });
    await p
      .getByRole("button", { name: "Begin activation", exact: true })
      .click();
    await settle();
    await p.getByRole("button", { name: "End turn", exact: true }).click();
    await settle();
    assert.deepEqual(await p.locator(".resources > span b").allTextContents(), [
      "0",
      "1",
      "2",
    ]);
    assert.equal(await p.locator("[data-hand]").count(), 4);
    report.checks.push(
      `${id}: clear resource tell, one-turn reduction and automatic recovery${id === "beetle" ? ", map inspection preserves movement and displays actual Restless-adjusted damage/age/speed before battle" : ""}`,
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/early-motes-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
