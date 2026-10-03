import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
const report = { package: "1.3.84", checks: [], errors: [] };
const dir = "reports/screenshots/boss-pressure";
await fs.mkdir(dir, { recursive: true });
for (const [id, cycle, mode] of [
  ["hart", 2, "normal"],
  ["choir", 0, "normal"],
  ["colossus", 2, "normal"],
  ["colossus", 2, "fast"],
  ["colossus", 2, "reduced"],
  ["colossus", 2, "skip"],
  ["colossus", 3, "fast"],
  ["choir", 2, "fast"],
]) {
  if (process.env.BOSS_UI_NORMAL_ONLY && !(mode === "normal")) continue;
  const g = new Game(84);
  g.s.equipment = {};
  g.s.hp = g.s.maxHp = 100;
  g.beginBattle([{ uid: 900, enemy: id, restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.hand = [];
  b.grid = b.grid.map(() => []);
  b.enemies[0].cycle = cycle;
  delete g.s.checkpoint;
  const put = (id, slot) => {
    const c = g.instance(g.newCard(id));
    b.grid[slot].push(c);
    return c;
  };
  if (id === "hart") {
    put("blast", 14);
    put("shield", 16);
    put("blast", 19);
  } else if (id === "colossus" && cycle === 2) {
    put("blast", 3);
    put("shield", 17);
    put("ward", 0).ward = 1;
  } else if (id === "choir" && cycle === 0) {
    put("blast", 12);
    put("blast", 12);
    put("shield", 20);
  } else if (id === "choir") {
    put("familiar", 4);
    put("familiar", 11);
  }
  const expected = g.tell(b.enemies[0]);
  const profile = path.resolve(".tmp/boss-pressure-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(profile + "/save.json", JSON.stringify(g.s));
  await fs.writeFile(
    profile + "/settings.json",
    JSON.stringify({ width: 1440, fast: mode === "fast" }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    if (mode === "reduced") await p.emulateMedia({ reducedMotion: "reduce" });
    await p.locator('[data-ui="continue"]').click();
    const tell = await p.locator(".enemy .tell").textContent();
    if (id === "colossus" && cycle === 2) assert.match(tell, /20 Arcane/);
    if (id === "choir" && cycle === 2) assert.match(tell, /6 Light ×3/);
    if (id === "colossus" && cycle === 3)
      assert.match(tell, /5 in the new element.*Pierce/);
    await p.evaluate(() => {
      window.bossTrace = [];
      const original = Element.prototype.animate;
      Element.prototype.animate = function (frames, options) {
        if (this.matches(".boss-effect,.slot,.attack-bolt"))
          window.bossTrace.push({
            cls: this.className,
            slot: this.dataset.slot,
            sourceSlot: this.dataset.sourceSlot,
            time: performance.now(),
            frame: frames[0],
            cards: [...document.querySelectorAll(".slot:not(.empty)")].map(
              (x) => +x.dataset.slot,
            ),
          });
        return original.call(this, frames, options);
      };
    });
    await p.getByRole("button", { name: "End turn", exact: true }).click();
    if (mode === "skip") await p.locator("[data-skip]").click();
    if (mode === "normal") {
      const effect =
        id === "hart"
          ? ".wildfire-line"
          : id === "choir"
            ? ".hymn-notes"
            : ".collapse-hole";
      await p.locator(effect).first().waitFor();
      await p.waitForFunction(
        (selector) =>
          [...document.querySelectorAll(selector)].some((el) =>
            el.getAnimations().some((a) => a.currentTime >= 300),
          ),
        effect,
      );
      await p.screenshot({ path: `${dir}/${id}.png` });
      assert.ok((await p.locator(".slot:not(.empty)").count()) > 0);
    }
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    if (id === "colossus" && cycle === 2) {
      assert.equal(await p.locator('[data-slot="3"] .name').count(), 0);
      assert.equal(await p.locator('[data-slot="17"] .name').count(), 0);
      assert.equal(await p.locator(".mind .held-attack").count(), 4);
    }
    for (
      let i = 0;
      i < 4 && (await p.locator(".player-portrait.defense-ready").count());
      i++
    ) {
      await p.locator(".player-portrait.defense-ready").click();
      await p.waitForFunction(
        () => !document.querySelector(".presentation-bar"),
      );
    }
    const trace = await p.evaluate(() => window.bossTrace);
    if (mode !== "skip" && cycle === 2 && id === "colossus") {
      assert.equal(
        trace.filter((x) => x.cls.includes("collapse-hole")).length,
        6,
      );
      assert.equal(
        trace.filter((x) => x.cls.includes("collapse-bolt")).length,
        4,
      );
    }
    if (mode === "normal" && id === "hart") {
      const fire = trace.find((x) => x.cls.includes("wildfire-line"));
      assert.deepEqual(fire.cards, [14, 16, 19]);
      assert.ok(trace.some((x) => x.cls.includes("attack-bolt")));
    }
    if (mode === "normal" && id === "choir")
      assert.equal(trace.filter((x) => x.cls.includes("hymn-notes")).length, 2);
    assert.equal(
      await p
        .locator(".boss-effect,.spell-impact,.attack-bolt,.attack-orb-overlay")
        .count(),
      0,
    );
    const save = JSON.parse(await fs.readFile(profile + "/save.json", "utf8"));
    const state = JSON.parse(
      await fs.readFile(
        `${profile}/runs/${save.uiMeta.runId}/latest.json`,
        "utf8",
      ),
    );
    const hp =
      id === "hart"
        ? 98
        : id === "choir" && cycle === 0
          ? 100
          : 100 - expected.damage * (expected.hits || 1);
    assert.equal(state.hp, hp);
    report.checks.push({
      id,
      cycle,
      mode,
      tell,
      hp: state.hp,
      animations: trace.map((x) => ({
        cls: x.cls,
        slot: x.slot,
        sourceSlot: x.sourceSlot,
      })),
    });
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
if (!process.env.BOSS_UI_NORMAL_ONLY)
  await fs.writeFile(
    "reports/boss-pressure-verification.json",
    JSON.stringify(report, null, 2),
  );
console.log(
  "Boss presentation checks passed: live intents, intact cards before effects, removal before defense, per-space bolts, three-hit Silence, Fast/Skip/reduced motion, cleanup, HP.",
);
