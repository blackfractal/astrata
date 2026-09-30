import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { items } from "../src/content.mjs";
const report = {
  package: JSON.parse(await fs.readFile("package.json", "utf8")).version,
  checks: [],
  errors: [],
};
const dir = "reports/screenshots/ring-origin";
await fs.mkdir(dir, { recursive: true });
for (const mode of ["normal", "fast-right-water", "reduced", "skip"]) {
  const g = new Game(8),
    ring = g.s.equipment.finger2;
  if (mode !== "fast-right-water") {
    g.s.equipment.finger1 = ring;
    g.s.equipment.finger2 = null;
  }
  if (mode === "fast-right-water") {
    g.s.equipment.finger2 = ring;
    g.s.equipment.finger1 = null;
    const gem = Object.values(items).find(
      (x) => x.slot === "gem" && x.element === "Water",
    );
    g.addItem(gem.id);
    g.getItem(ring).gem = g.s.inventory.at(-1).uid;
  }
  g.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.hand = [];
  b.channel = 10;
  b.enemies[0].hp = b.enemies[0].maxHp = 100;
  b.enemies[0].element = mode === "fast-right-water" ? "Wind" : "Arcane";
  for (const i of [0, 4]) b.grid[i] = [g.instance(g.newCard("blast"))];
  const profile = path.resolve(".tmp/ring-origin-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, fast: mode === "fast-right-water" }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  const p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
  try {
    await p.locator('[data-ui="continue"]').click();
    if (mode === "reduced") await p.emulateMedia({ reducedMotion: "reduce" });
    await p.evaluate(() => {
      window.shots = [];
      window.procs = [];
      const original = Element.prototype.animate;
      Element.prototype.animate = function (keyframes, options) {
        if (this.matches(".attack-bolt")) {
          const from =
            document.querySelector(".gear-proc") ||
            document.querySelector(".slot.target-source") ||
            document.querySelector('[data-slot="0"]');
          const r = from.getBoundingClientRect();
          window.shots.push({
            uid: from.dataset.itemUid || null,
            x: parseFloat(keyframes[0].left),
            y: parseFloat(keyframes[0].top),
            expectedX: r.left + r.width / 2,
            expectedY: r.top + r.height / 2,
            color: this.style.getPropertyValue("--hit-color"),
          });
        }
        return original.call(this, keyframes, options);
      };
      new MutationObserver(() => {
        const el = document.querySelector(".gear-proc");
        if (el && window.procs.at(-1) !== el.dataset.itemUid)
          window.procs.push(el.dataset.itemUid);
      }).observe(document.querySelector("#app"), {
        attributes: true,
        subtree: true,
        attributeFilter: ["class"],
      });
    });
    await p.locator('[data-activate-slot="0"]').dblclick();
    await p.waitForFunction(() => window.procs.length > 0);
    if (mode === "normal")
      await p.screenshot({ path: dir + "/ring-projectile.png" });
    if (mode === "skip") await p.locator("[data-skip]").click();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    const shots = await p.evaluate(() => window.shots),
      procs = await p.evaluate(() => window.procs);
    assert.deepEqual(procs, [String(ring)]);
    if (mode === "reduced") assert.equal(shots.length, 0);
    else {
      assert.equal(shots.length, 2);
      assert.equal(shots[0].uid, null);
      assert.equal(shots[1].uid, String(ring));
      assert.ok(Math.abs(shots[1].x - shots[1].expectedX) < 0.1);
      assert.ok(Math.abs(shots[1].y - shots[1].expectedY) < 0.1);
      assert.ok(
        Math.hypot(shots[0].x - shots[1].x, shots[0].y - shots[1].y) > 50,
      );
    }
    const firstHp = mode === "fast-right-water" ? 95 : 94;
    assert.match(
      await p.locator('[data-enemy-uid="900"]').textContent(),
      new RegExp(firstHp + " / 100 HP"),
    );
    assert.equal(
      await p.locator(".gear-proc,.attack-bolt,.spell-impact").count(),
      0,
    );
    await p.locator('[data-activate-slot="4"]').dblclick();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    assert.match(
      await p.locator('[data-enemy-uid="900"]').textContent(),
      new RegExp(firstHp - 4 + " / 100 HP"),
    );
    assert.equal(
      (await p.evaluate(() => window.shots)).filter((s) => s.uid).length,
      mode === "reduced" ? 0 : 1,
    );
    report.checks.push(
      mode +
        ": Ring highlights and supplies the bonus-hit origin in its actual equipment slot; expected damage preserved; second attack has no Ring proc; effects clean up.",
    );
  } catch (e) {
    console.log(
      mode,
      await p.evaluate(() => ({
        shots: window.shots,
        procs: window.procs,
        text: document.querySelector("#app").innerText,
      })),
    );
    await p.screenshot({ path: dir + "/failure.png" });
    throw e;
  } finally {
    await app.close();
  }
}
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/ring-origin-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
