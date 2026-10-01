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
const directions = [
  [-1, -1, "northwest"],
  [0, -1, "north"],
  [1, -1, "northeast"],
  [-1, 0, "west"],
  [1, 0, "east"],
  [-1, 1, "southwest"],
  [0, 1, "south"],
  [1, 1, "southeast"],
];
await fs.mkdir("reports/screenshots/direction-pad", { recursive: true });
for (const mode of ["directions", "edge", "enemy", "empty"]) {
  const g = new Game(8);
  g.s.mode = "field";
  Object.assign(g.s.field, {
    round: 2,
    spawned: 4,
    x: mode === "edge" ? 0 : 5,
    y: mode === "edge" ? 0 : 5,
    moves: mode === "empty" ? 0 : 20,
    stage: "player",
    queue: ["Mote", "Gold", "Item", "Mote", "Event", "Eidolon", "Gold", "Mote"],
    entities:
      mode === "enemy"
        ? [
            {
              uid: 900,
              type: "Mote",
              enemy: "beetle",
              x: 6,
              y: 5,
              born: 1,
              restless: 0,
              count: 1,
            },
          ]
        : [],
  });
  const profile = path.resolve(`.tmp/direction-pad-${mode}-${Date.now()}`);
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, fast: mode !== "directions" }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    assert.equal(await p.locator(".direction-button").count(), 8);
    assert.equal(await p.locator(".spawn-pair").count(), 4);
    assert.ok(
      await p.locator(".direction-pad").evaluate((e) => {
        const r = e.getBoundingClientRect();
        return r.bottom <= innerHeight && r.right <= innerWidth;
      }),
      "pad fits viewport",
    );
    assert.equal(
      await p.locator(".field-movement-controls [data-action]").count(),
      mode === "edge" ? 4 : mode === "empty" ? 1 : 9,
    );
    if (mode === "directions") {
      let x = 5,
        y = 5,
        n = 0;
      for (const [dx, dy, name] of directions) {
        await p
          .getByRole("button", { name: `Move ${name}`, exact: true })
          .click();
        await p.locator(".presentation-bar").waitFor();
        assert.equal(await p.locator(".direction-button:disabled").count(), 8);
        await p.waitForFunction(
          () => !document.querySelector(".presentation-bar"),
        );
        x += dx;
        y += dy;
        n++;
        assert.equal(
          await p
            .locator(`[data-cell="${y * 11 + x}"] [data-player-token]`)
            .count(),
          1,
        );
        const save = JSON.parse(
          await fs.readFile(path.join(profile, "save.json"), "utf8"),
        );
        assert.equal(save.field.x, x);
        assert.equal(save.field.y, y);
        assert.equal(save.field.moves, 20 - n);
      }
      await p.mouse.move(5, 5);
      await p.screenshot({
        path: "reports/screenshots/direction-pad/controls.png",
      });
      const emptyTile = g.s.field.y * 11 + g.s.field.x + 1;
      await p.locator(`[data-cell="${emptyTile}"]`).click();
      await p.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
      assert.equal(
        await p
          .locator(`[data-cell="${emptyTile}"] [data-player-token]`)
          .count(),
        1,
      );
    } else if (mode === "edge") {
      for (const name of [
        "northwest",
        "north",
        "northeast",
        "west",
        "southwest",
      ])
        assert.equal(
          await p.locator(`[data-direction="${name}"]`).isDisabled(),
          true,
        );
      await p
        .getByRole("button", { name: "Move southeast", exact: true })
        .focus();
      await p.keyboard.press("Enter");
      await p.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
      assert.equal(
        await p.locator('[data-cell="12"] [data-player-token]').count(),
        1,
      );
    } else if (mode === "enemy") {
      await p.locator('[data-cell="61"]').click();
      assert.match(await p.locator("#modal").textContent(), /Bell Beetle/);
      assert.equal(
        await p.locator('[data-cell="60"] [data-player-token]').count(),
        1,
      );
      await p.locator("[data-close]").click();
      await p.getByRole("button", { name: "Move east", exact: true }).click();
      await p.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
      assert.equal(await p.locator('[data-enemy-uid="900"]').count(), 1);
      assert.equal(await p.locator("#modal").isVisible(), false);
    } else
      assert.equal(await p.locator(".direction-button:disabled").count(), 8);
    report.checks.push(
      `${mode}: movement pad matches legal actions, remains visible, and preserves expected movement/inspection behavior.`,
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/direction-pad-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
