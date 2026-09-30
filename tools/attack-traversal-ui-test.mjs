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
const dir = "reports/screenshots/attack-traversal";
await fs.mkdir(dir, { recursive: true });
async function check(g, fn, fast = true) {
  const profile = path.resolve(".tmp/attack-path-" + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, "save.json"), JSON.stringify(g.s));
  await fs.writeFile(
    path.join(profile, "settings.json"),
    JSON.stringify({ width: 1280, fast }),
  );
  const app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  try {
    const p = await app.firstWindow();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    await fn(p);
  } finally {
    await app.close();
  }
}
const settle = (p) =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
const map = new Game(9);
map.s.mode = "field";
Object.assign(map.s.field, {
  round: 1,
  spawned: 2,
  queue: [],
  x: 5,
  y: 5,
  moves: 2,
  stage: "player",
  entities: [{ uid: 900, type: "Gold", value: 20, x: 7, y: 5 }],
});
await check(map, async (p) => {
  const portrait = p.locator("[data-player-token] img");
  assert.equal(await portrait.count(), 1);
  assert.ok(
    await portrait.evaluate((el) => el.complete && el.naturalWidth > 0),
  );
  assert.equal(await p.locator(".gold-symbol").count(), 1);
  assert.equal(
    await p
      .locator(".gold-symbol")
      .evaluate((el) => getComputedStyle(el).borderRadius),
    "50%",
  );
  assert.equal(
    await p
      .locator(".gold-symbol")
      .evaluate((el) => getComputedStyle(el, "::after").borderRadius),
    "50%",
  );
  await p.mouse.move(5, 5);
  await p.screenshot({ path: dir + "/map.png" });
  await p.locator('[data-cell="49"]').click();
  await settle(p);
  assert.equal(
    await p
      .locator("[data-player-token]")
      .evaluate((el) => el.closest(".tile").dataset.cell),
    "49",
  );
  assert.equal(await portrait.count(), 1);
  report.checks.push(
    "Druid portrait in yellow ring renders and follows map movement; Gold is a filled circle inside a circular ring.",
  );
});
for (const reduced of [false, true]) {
  const g = new Game(8);
  g.s.equipment = {};
  const bracelet = g.addItem("bronze");
  g.s.equipment.wrist2 = bracelet.uid;
  g.beginBattle([{ uid: 900, enemy: "mini", restless: 0 }]);
  const b = g.s.battle;
  b.phase = "activate";
  b.hand = [];
  b.enemies[0].element = "Arcane";
  b.enemies[0].buff = 28;
  const ward = g.instance(g.newCard("ward")),
    ally = g.instance(g.newCard("familiar"));
  ward.ward = 5;
  ally.hp = ally.maxHp = 6;
  ally.element = "Arcane";
  b.grid[20] = [ward];
  b.grid[22] = [ally];
  await check(
    g,
    async (p) => {
      if (reduced) await p.emulateMedia({ reducedMotion: "reduce" });
      const selectors = [
        '[data-enemy-uid="900"]',
        '[data-slot="20"]',
        '[data-slot="22"]',
        `.battle-player [data-item-uid="${bracelet.uid}"]`,
        ".battle-player .player-portrait",
      ];
      const centers = await p.evaluate(
        (ss) =>
          ss.map((s) => {
            const r = document.querySelector(s).getBoundingClientRect();
            return { left: r.left + r.width / 2, top: r.top + r.height / 2 };
          }),
        selectors,
      );
      await p.evaluate(() => {
        window.bolts = [];
        window.losses = [];
        window.bursts = [];
        window.impactOrbs = [];
        window.flightDamage = [];
        window.dyingOrbs = [];
        const original = Element.prototype.animate;
        Element.prototype.animate = function (frames, opts) {
          if (this.matches(".attack-bolt")) {
            window.bolts.push(frames);
            window.flightDamage.push(this.textContent);
          }
          return original.call(this, frames, opts);
        };
        new MutationObserver((records) => {
          for (const r of records) {
            if (
              r.type === "attributes" &&
              r.target.matches(".disintegrating")
            ) {
              const orb = document.querySelector(
                "body > .attack-orb-overlay:not(.attack-bolt)",
              );
              window.dyingOrbs.push(orb?.textContent ?? null);
            }
            for (const el of r.addedNodes) {
              if (el.nodeType === 1 && el.matches(".spell-impact")) {
                window.bursts.push(el.dataset.element);
                const orb = document.querySelector(
                  "body > .attack-orb-overlay:not(.attack-bolt)",
                );
                window.impactOrbs.push(
                  orb
                    ? {
                        damage: orb.textContent,
                        visible:
                          getComputedStyle(orb).opacity === "1" &&
                          getComputedStyle(orb).display !== "none",
                        fixed: getComputedStyle(orb).position === "fixed",
                      }
                    : null,
                );
              }
              if (
                el.nodeType === 1 &&
                el.matches(".impact-number") &&
                el.textContent.startsWith("−")
              )
                window.losses.push(el.textContent);
            }
          }
        }).observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["class"],
        });
      });
      await p.getByRole("button", { name: "End turn", exact: true }).click();
      await settle(p);
      await p.locator('[data-slot="20"]').click();
      await settle(p);
      assert.equal(
        await p.locator('[data-slot="20"] .held-attack').textContent(),
        "25",
      );
      await p.locator('[data-slot="22"]').click();
      await settle(p);
      assert.equal(
        await p.locator('[data-slot="22"] .held-attack').textContent(),
        "19",
      );
      await p.waitForTimeout(250);
      assert.equal(
        await p.locator('[data-slot="22"] .held-attack').textContent(),
        "19",
      );
      assert.equal(await p.locator('[data-slot="20"] .held-attack').count(), 0);
      if (reduced)
        assert.equal(
          await p
            .locator(".held-attack")
            .evaluate((el) => getComputedStyle(el).animationName),
          "none",
        );
      await p.mouse.move(5, 5);
      await p.screenshot({
        path: dir + (reduced ? "/held-reduced.png" : "/held-on-dead-card.png"),
      });
      await p
        .locator(`.battle-player [data-item-uid="${bracelet.uid}"]`)
        .click();
      await settle(p);
      assert.match(
        await p.locator(".player-portrait").textContent(),
        /53\/70 HP/,
      );
      const got = await p.evaluate(() => ({
        bolts: window.bolts,
        losses: window.losses,
        bursts: window.bursts,
        impactOrbs: window.impactOrbs,
        flightDamage: window.flightDamage,
        dyingOrbs: window.dyingOrbs,
      }));
      assert.deepEqual(got.bursts, ["Arcane", "Arcane", "Arcane", "Arcane"]);
      assert.deepEqual(
        got.impactOrbs,
        ["25", "19", "17"]
          .map((damage) => ({ damage, visible: true, fixed: true }))
          .concat(null),
      );
      assert.ok(
        got.dyingOrbs.includes("19"),
        "Orb remains independently visible as the Ally disintegrates",
      );
      assert.deepEqual(
        got.flightDamage,
        reduced ? [] : ["30", "25", "19", "17"],
      );
      assert.equal(await p.locator(".attack-orb-overlay").count(), 0);
      assert.equal(await p.locator(".held-attack").count(), 0);
      assert.deepEqual(got.losses, ["−5", "−6", "−2", "−17"]);
      assert.equal(got.bolts.length, reduced ? 0 : 4);
      if (!reduced)
        for (let i = 0; i < 4; i++)
          for (const [k, center] of [
            [0, centers[i]],
            [1, centers[i + 1]],
          ])
            for (const axis of ["left", "top"])
              assert.ok(
                Math.abs(parseFloat(got.bolts[i][k][axis]) - center[axis]) < 2,
                `leg ${i} ${k} ${axis}`,
              );
      await p.mouse.move(5, 5);
      await p.screenshot({
        path: dir + (reduced ? "/reduced-result.png" : "/chain-result.png"),
      });
      report.checks.push(
        (reduced ? "Reduced motion: " : "Animated: ") +
          "Arcane30 follows enemy → Ward20 → dead Familiar22 → right Bracelet → player; displays −5/−6/−2/−17, actual HP53. Attack holds with 25 on Ward, then 19 on the destroyed Ally space until next choice; all four nodes receive an Arcane hit burst; marker clears when resolved. " +
          "Remaining damage is already visible at each impact burst, survives Ally disintegration, and flight carries the current damage number. " +
          (reduced
            ? "No flying projectiles."
            : "All four projectile endpoints match actual node centers across separate clicks."),
      );
    },
    false,
  );
}
const gear = new Game(8);
gear.s.equipment = {};
const left = gear.addItem("bronze"),
  right = gear.addItem("silver");
gear.s.equipment.wrist1 = left.uid;
gear.s.equipment.wrist2 = right.uid;
gear.beginBattle([{ uid: 900, enemy: "beetle", restless: 0 }]);
gear.s.battle.phase = "enemy";
gear.s.battle.jobs = [];
gear.s.battle.bracelets = [
  { uid: left.uid, name: "Bronze Bracelet", block: 2, element: "Arcane" },
  { uid: right.uid, name: "Silver Bracelet", block: 3, element: "Arcane" },
];
gear.s.battle.reaction = {
  stage: "bracelet",
  source: 900,
  name: "Test hit",
  damage: 6,
  element: "Arcane",
  intercepted: [],
};
await check(gear, async (p) => {
  const first = p.locator(`.battle-player [data-item-uid="${left.uid}"]`);
  await first.click();
  await settle(p);
  const held = first.locator(".held-attack");
  assert.equal(await held.textContent(), "4");
  assert.equal(await held.isVisible(), true);
  await p
    .locator(".incoming-attack [data-action]")
    .filter({ hasText: "Take hit" })
    .click();
  await settle(p);
  assert.equal(await p.locator(".held-attack").count(), 0);
  assert.match(await p.locator(".player-portrait").textContent(), /66\/70 HP/);
  report.checks.push(
    "Attack also holds visibly on a depleted Bracelet while another equipment choice remains, then clears after Take hit.",
  );
});
assert.deepEqual(report.errors, []);
await fs.writeFile(
  "reports/attack-traversal-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
