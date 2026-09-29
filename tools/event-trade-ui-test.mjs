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
const dir = "reports/screenshots/event-trade";
await fs.mkdir(dir, { recursive: true });
for (const method of ["drag", "click"]) {
  const g = new Game(8);
  g.s.mode = "event";
  g.s.event = "trader";
  g.s.field.stage = "player";
  g.s.field.moves = 2;
  g.s.field.entities = [];
  const right = g.s.equipment.wrist2,
    silver = g.addItem("silver"),
    spare = g.addItem("gold"),
    gem = g.addItem("sapphire");
  g.s.equipment.wrist1 = silver.uid;
  g.getItem(right).gem = gem.uid;
  const profile = path.resolve(".tmp/event-trade-" + method + "-" + Date.now());
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
  const p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
  try {
    await p.locator('[data-ui="continue"]').click();
    const baseline = await fs.readFile(path.join(profile, "save.json"), "utf8");
    assert.equal(
      await p
        .getByRole("button", {
          name: "Trade a Bracelet for Grove Titan",
          exact: true,
        })
        .count(),
      1,
    );
    await p.locator('[data-event-trade="0"]').click();
    assert.equal(await p.locator(".trade-asset").count(), 3);
    assert.match(
      await p.locator(".trade-belongings").textContent(),
      /Equipped.*Right wrist.*Left wrist.*Satchel/s,
    );
    await p.locator('[data-trade-asset="' + right + '"] summary').click();
    assert.match(
      await p.locator('[data-trade-asset="' + right + '"]').textContent(),
      /Sapphire.*Gem returns to Satchel/s,
    );
    await p.locator(".trade-reward summary").click();
    assert.match(await p.locator(".trade-reward").textContent(), /Grove Titan/);
    await p.locator('[data-trade-select="' + spare.uid + '"]').click();
    await p.locator("[data-trade-back]").click();
    assert.equal(await p.locator("#modal").isVisible(), false);
    assert.equal(
      await fs.readFile(path.join(profile, "save.json"), "utf8"),
      baseline,
    );
    await p.locator('[data-event-trade="0"]').click();
    await p.keyboard.press("Escape");
    assert.equal(
      await fs.readFile(path.join(profile, "save.json"), "utf8"),
      baseline,
    );
    await p.locator('[data-event-trade="0"]').click();
    await p.mouse.move(5, 5);
    await p.screenshot({ path: dir + "/" + method + "-chooser.png" });
    const offered = method === "drag" ? right : spare.uid;
    if (method === "drag")
      await p
        .locator('[data-trade-select="' + offered + '"]')
        .dragTo(p.locator("[data-trade-drop]"));
    else {
      await p.locator('[data-trade-select="' + offered + '"]').click();
      await p.locator("[data-trade-confirm]").click();
    }
    await p.waitForFunction(
      () =>
        document.querySelector("#modal").hidden &&
        !document.querySelector("[data-event-trade]"),
    );
    const saved = JSON.parse(
      await fs.readFile(path.join(profile, "save.json"), "utf8"),
    );
    assert.ok(!saved.inventory.some((x) => x.uid === offered));
    assert.ok(saved.inventory.some((x) => x.uid === silver.uid));
    assert.equal(saved.deck.filter((x) => x.id === "grove").length, 1);
    if (method === "drag") {
      assert.equal(saved.equipment.wrist2, null);
      assert.ok(saved.inventory.some((x) => x.uid === gem.uid));
    } else assert.equal(saved.equipment.wrist2, right);
    const ids = await fs.readdir(path.join(profile, "runs"));
    const events = (
      await fs.readFile(
        path.join(profile, "runs", ids[0], "events.jsonl"),
        "utf8",
      )
    )
      .trim()
      .split("\n")
      .map(JSON.parse);
    const decisions = events.filter((x) => x.kind === "decision");
    assert.equal(decisions.length, 1);
    assert.equal(decisions[0].action.tradeItem, offered);
    report.checks.push({
      method,
      allBracelets: true,
      backAndEscapeFree: true,
      selectedCopyOnly: true,
      socketedGemRetained: true,
    });
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/event-trade-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
