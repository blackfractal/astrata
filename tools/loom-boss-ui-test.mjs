import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { refreshBossPlans } from "../src/loom-bosses.mjs";
const dir = "reports/screenshots/loom-bosses";
await fs.mkdir(dir, { recursive: true });
const report = { checks: [], errors: [] };
for (const id of ["blackBile", "lateBile", "bombadier", "trickster", "anti"]) {
  const profile = path.resolve(".tmp/loom-boss-ui-" + id + "-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  const bossId =
    id === "anti" ? "trickster" : id === "lateBile" ? "blackBile" : id;
  const g = new Game(700);
  g.s.stratum = 2;
  g.s.archon = bossId;
  g.s.hp = g.s.maxHp = 200;
  g.beginBattle([{ uid: g.uid(), enemy: bossId, restless: 0 }]);
  const b = g.s.battle,
    e = b.enemies[0];
  b.phase = "activate";
  b.hand = [];
  b.channel = 5;
  e.corruptionPlan = [];
  const put = (card, i) => {
    const c = g.instance(g.newCard(card));
    b.grid[i].push(c);
    return c;
  };
  const q = (i, kind) =>
    (b.corruptions[i] = {
      kind,
      uid: g.uid(),
      source: e.uid,
      remaining: 2,
      damage: 20,
      createdTurn: b.turn,
    });
  if (id === "blackBile") {
    put("blast", 13);
    put("elves", 5);
    q(13, "nausea");
    b.biles = { 13: { kind: "bile", uid: g.uid(), source: e.uid } };
  }
  if (id === "lateBile") {
    e.cycle = 16;
    put("blast", 6);
    put("blast", 20);
  }
  if (id === "bombadier") {
    e.cycle = 2;
    put("elves", 7);
    q(8, "mine");
  }
  if (id === "trickster") {
    e.cycle = 2;
    put("plasma", 5);
    put("plasma", 5);
    const c = put("blast", 6);
    c.used = 1;
    c.lastActivatedTurn = b.turn;
    q(0, "hole");
    q(1, "hypnosis");
  }
  if (id === "anti") {
    e.cycle = 3;
    const c = put("shield", 6);
    b.shields = [
      { uid: g.uid(), owner: c.uid, slot: 6, block: 4, element: "Fire" },
    ];
    const w = put("ward", 0);
    w.element = "Water";
  }
  refreshBossPlans(g);
  g.s.uiMeta = { runId: "boss-ui-" + id, elapsed: 0 };
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
    const settle = () =>
      p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    await settle();
    assert.ok(
      await p.locator('[src="assets/enemy-' + bossId + '.png"]').count(),
    );
    if (id === "lateBile")
      assert.equal(await p.locator(".bile-forecast").count(), 2);
    if (id === "blackBile") {
      assert.equal(await p.locator('[data-slot="13"] .bile-motion').count(), 1);
      assert.equal(
        await p.locator('[data-slot="5"].bile-destination').count(),
        1,
      );
      assert.ok(await p.locator(".loom-route-lines path[stroke]").count());
    }
    if (id === "bombadier") {
      assert.match(
        await p.locator(".enemy-line").innerText(),
        /8 Fire.*10 Water.*12 Wind/s,
      );
      await p.locator('[data-activate-slot="7"]').click();
      assert.equal(await p.locator('[data-slot="8"].target-option').count(), 1);
      await p.locator('[data-slot="8"]').click();
      await settle();
      assert.equal(
        await p.locator('[data-slot="8"].corruption-mine').count(),
        0,
      );
      assert.equal(await p.locator('[data-slot="7"] .name').count(), 1);
      report.checks.push(
        "Basic Elves select an adjacent bomb on the board, defuse immediately and remain with uses left.",
      );
    }
    if (id === "trickster") {
      assert.equal(await p.locator(".phase-warning").count(), 7);
      assert.match(
        await p
          .locator('[data-slot="5"] .phase-label')
          .getAttribute("data-tooltip"),
        /destroys the whole/,
      );
      assert.match(
        await p
          .locator('[data-slot="6"] .phase-label')
          .getAttribute("data-tooltip"),
        /immediately activates/,
      );
    }
    if (id === "anti") {
      assert.match(
        await p.locator(".enemy-line").innerText(),
        /Anti-elemental.*15 Water/s,
      );
      await p.locator('[data-activate-slot="0"]').click();
      await settle();
      assert.match(
        await p.locator(".enemy-line").innerText(),
        /Anti-elemental.*15 Wind/s,
      );
      report.checks.push(
        "Anti-elemental visibly changes Water to Wind after Water Ward activation overtakes Fire Guard.",
      );
    }
    await p.mouse.move(5, 5);
    await p.screenshot({ path: dir + "/" + id + "-before.png" });
    const end = g.legal().find((a) => a.type === "endTurn");
    await p
      .locator("[data-action=" + JSON.stringify(end.key) + "]")
      .filter({ visible: true })
      .first()
      .click();
    await settle();
    // Accept each real defense decision through the Druid portrait.
    for (let n = 0; n < 8; n++) {
      const visible = await p
        .locator("[data-action]")
        .evaluateAll((els) =>
          els.filter((e) => e.offsetParent).map((e) => e.dataset.action),
        );
      const skip = visible.find((k) => k.includes("skipEquipment"));
      if (!skip) break;
      await p.locator(".battle-player .player-portrait").click();
      await settle();
    }
    if (id === "blackBile")
      assert.equal(
        await p.locator(".bile-motion").count(),
        0,
        "Elves intercept the moving glob",
      );
    if (id === "lateBile")
      assert.equal(await p.locator(".bile-motion").count(), 2);
    if (id === "trickster") {
      assert.equal(await p.locator('[data-slot="0"] .name').count(), 0);
      assert.match(
        await p.locator('[data-slot="1"] .name').innerText(),
        /Blast/,
      );
    }
    await p.mouse.move(5, 5);
    await p.screenshot({ path: dir + "/" + id + "-after.png" });
    report.checks.push(
      id +
        ": art, forecasts, actual phase advance and animated effects rendered without errors.",
    );
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/loom-boss-ui-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
