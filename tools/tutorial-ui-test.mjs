import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { WeightedPolicy } from "../src/policy.mjs";
const report = {
  package: JSON.parse(await fs.readFile("package.json", "utf8")).version,
  steps: [],
  checks: [],
  errors: [],
};
const dir = "reports/screenshots/tutorial";
await fs.mkdir(dir, { recursive: true });
const profile = path.resolve(".tmp/tutorial-ui-" + Date.now());
await fs.mkdir(profile, { recursive: true });
const normal = new Game(123);
normal.s.uiMeta = { runId: "preserved-normal", elapsed: 400 };
const normalText = JSON.stringify(normal.s);
await fs.writeFile(path.join(profile, "save.json"), normalText);
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, fast: true }),
);
let app, p;
const open = async () => {
  app = await electron.launch({
    executablePath: path.resolve("release/Astrata/Astrata.exe"),
    args: ["--user-data-dir=" + profile],
  });
  p = await app.firstWindow();
  p.on("pageerror", (e) => report.errors.push(e.message));
};
const saved = async () =>
  JSON.parse(
    await fs.readFile(path.join(profile, "tutorial-save.json"), "utf8"),
  );
const settle = () =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
const button = (a) =>
  p
    .locator("[data-action=" + JSON.stringify(a.key) + "]")
    .filter({ visible: true })
    .first();
async function perform(g, a) {
  const step = g.s.tutorial.lesson;
  if (a.type === "tutorialNext") {
    await p.locator("[data-tutorial-next]").click();
    return;
  }
  if (a.type === "tutorialUI") {
    const selector = a.control.startsWith("tavern:")
      ? `[data-tavern="${a.control.split(":")[1]}"]`
      : a.control.startsWith("market:")
        ? `[data-market-category="${a.control.split(":")[1]}"]`
        : `[data-ui="${a.control}"]`;
    await p.locator(selector).click();
    return;
  }
  if (a.type === "place") {
    if (step === "shield-place") {
      await p.locator(`[data-hand="${a.uid}"]`).click();
      await p.locator("#modal [data-close]").click();
      await p.locator(`[data-slot="${a.slot}"]`).click();
      assert.equal((await saved()).tutorial.lesson, step);
      report.checks.push(
        "Initial mouse click placement cannot bypass required Shield drag.",
      );
    }
    await p
      .locator(`[data-hand="${a.uid}"]`)
      .dragTo(p.locator(`[data-slot="${a.slot}"]`));
    return;
  }
  if (a.type === "equip") {
    const from = p.locator(`.satchel [data-item-uid="${a.item}"]`);
    if (!(await from.count())) await p.locator('[data-ui="inventory"]').click();
    await p.locator(`.satchel [data-item-uid="${a.item}"]`).dragTo(
      p
        .locator(
          `${g.s.mode === "tavern" ? ".tavern-service" : "#modal"} [data-equip-slot="${a.slot}"]`,
        )
        .filter({ visible: true })
        .last(),
    );
    return;
  }
  if (a.type === "socket") {
    await p
      .locator(`.satchel [data-item-uid="${a.gem}"]`)
      .dragTo(
        p
          .locator(`.tavern-service .gear-item[data-item-uid="${a.uid}"]`)
          .filter({ visible: true })
          .last(),
      );
    return;
  }
  if (a.type === "activate") {
    if (step === "attune-attack") {
      await p.locator(`[data-activate-slot="${a.slot}"]`).click();
      await p.locator('[data-slot="22"].target-option').click();
      await p.locator(`[data-enemy-uid="${a.target}"]`).click();
    } else if (step === "first-blast") {
      await p
        .locator(`[data-slot="${a.slot}"]`)
        .dragTo(p.locator(`[data-enemy-uid="${a.target}"]`));
    } else if (a.target != null || step === "route-shield-activate")
      await p.locator(`[data-activate-slot="${a.slot}"]`).dblclick();
    else await p.locator(`[data-activate-slot="${a.slot}"]`).click();
    return;
  }
  if (["block", "ward", "intercept"].includes(a.type)) {
    await p.locator(`[data-slot="${a.slot}"]`).click();
    return;
  }
  if (["bracelet", "armor"].includes(a.type)) {
    await p.locator(`.battle-player [data-item-uid="${a.uid}"]`).click();
    return;
  }
  if (a.type === "skipEquipment") {
    await p.locator(".battle-player .player-portrait").click();
    return;
  }
  if (a.type === "recall") {
    await p.locator(`[data-slot="${a.slot}"] .name`).click();
    await button(a).click();
    return;
  }
  await button(a).click();
}
try {
  await open();
  await p.locator('[data-ui="new"]').click();
  await settle();
  assert.equal((await saved()).tutorial.lesson, "welcome");
  assert.match(
    await p.locator(".section-head h2").textContent(),
    /First Clearing/,
  );
  assert.equal(
    await fs.readFile(path.join(profile, "save.json"), "utf8"),
    normalText,
  );
  report.checks.push(
    "First New Game goes straight to tutorial map; existing normal save remains byte-identical.",
  );
  await p.mouse.move(5, 5);
  await p.screenshot({ path: dir + "/welcome.png" });
  let resumed = false;
  const policy = new WeightedPolicy();
  for (let n = 0; n < 300; n++) {
    await settle();
    let state;
    try {
      state = await saved();
    } catch (e) {
      if (e.code === "ENOENT") break;
      throw e;
    }
    const g = new Game(0, state),
      step = g.s.tutorial.lesson;
    if (step === "route-ward" && !resumed) {
      await p.locator('[data-ui="pause"]').click();
      await p.locator('[data-ui="saveAndHome"]').click();
      await p.locator('[data-ui="continueTutorial"]').waitFor();
      await app.close();
      await open();
      await p.locator('[data-ui="continueTutorial"]').click();
      await settle();
      const now = await saved();
      assert.equal(now.tutorial.lesson, step);
      assert.equal(now.battle.reaction.damage, 19);
      resumed = true;
      report.checks.push(
        "Quit/relaunch during incoming defense resumes exact lesson, 19 remaining damage and prior defense route.",
      );
    }
    if (
      [
        "shield-place",
        "route-ally",
        "route-done",
        "socket",
        "independent",
        "pursuit-one-left",
        "movement-forfeit",
        "caught",
        "elements",
        "cycle",
        "gossip-learned",
      ].includes(step) &&
      !report.steps.includes(step)
    ) {
      await p.mouse.move(5, 5);
      await p.screenshot({ path: dir + "/" + step + ".png" });
    }
    if (["elements", "cycle", "socket", "gossip-learned"].includes(step)) {
      const guide = p.locator(".tutorial-guide");
      const copy = await guide.textContent();
      if (step === "elements")
        assert.match(
          copy,
          /same cycle applies to defensive attunements and equipment/,
        );
      if (step === "cycle") {
        assert.match(
          copy,
          /Earth Armor protects best against Wind and worst against Fire/,
        );
        assert.match(
          copy,
          /Other element matchups are non-interacting, including same-element and Arcane/,
        );
      }
      if (step === "socket")
        assert.match(
          copy,
          /blocks 3 against Fire, 1 against Wind, and 2 otherwise/,
        );
      if (step === "gossip-learned")
        assert.match(
          copy,
          /Water-attuned Shields, Sapphire Bracelets and Water Armor/,
        );
      const fits = await guide.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.left >= 0 &&
          r.top >= 0 &&
          r.right <= innerWidth &&
          r.bottom <= innerHeight &&
          el.scrollHeight <= el.clientHeight + 1
        );
      });
      assert.ok(fits, step + " tutorial text fits on screen");
      report.checks.push(
        step + ": unified elemental guidance visible and within viewport.",
      );
    }
    if (step === "pursuit-one-left") {
      assert.equal(state.mode, "field");
      assert.equal(state.field.moves, 1);
      const enemy = state.field.entities.find(
        (e) => e.enemy === "tutorialRootling",
      );
      assert.deepEqual([enemy.x, enemy.y], [8, 4]);
      report.checks.push(
        "First pursuit step leaves 1 movement and Rootling stationary; second step triggers pursuit.",
      );
    }
    if (step === "movement-forfeit") {
      assert.equal(state.field.moves, 0);
      assert.equal(state.mode, "item");
      assert.match(
        await p.locator(".tutorial-guide").textContent(),
        /remaining point was forfeited/,
      );
      report.checks.push(
        "First-step item landing forfeits the unused movement point before pickup confirmation.",
      );
    }
    if (
      ["focus", "caught", "elements", "independent"].includes(step) &&
      !report.steps.includes(step)
    ) {
      const id = state.battle.enemies[0].id;
      const portrait = p.locator(`.enemy img[src$="enemy-${id}.png"]`).first();
      assert.ok(await portrait.count(), "dedicated tutorial portrait " + id);
      await portrait.evaluate((img) => img.decode());
    }
    const a =
      step === "independent"
        ? policy.choose(g.observe(), g.legal())?.action
        : g.legal()[0];
    assert.ok(a, step);
    await perform(g, a);
    await settle();
    await p
      .waitForFunction(
        (old) =>
          document.querySelector("[data-tutorial-step]")?.dataset
            .tutorialStep !== old ||
          !document.querySelector("[data-tutorial-step]"),
        step,
        { timeout: 2000 },
      )
      .catch(() => {
        if (step !== "independent") throw Error("Did not advance " + step);
      });
    report.steps.push(step);
    if (n % 12 === 0) console.log("Tutorial UI:", n, step);
  }
  await p
    .getByRole("heading", { name: "The First Clearing Complete", exact: true })
    .waitFor();
  const stats = JSON.parse(
    await fs.readFile(path.join(profile, "tutorial-stats.json"), "utf8"),
  );
  assert.equal(stats.stratum1.starts.length, 1);
  assert.equal(stats.stratum1.completions.length, 1);
  assert.ok(stats.stratum1.firstCompletedAt);
  assert.equal(
    await fs.readFile(path.join(profile, "save.json"), "utf8"),
    normalText,
  );
  await p.mouse.move(5, 5);
  await p.screenshot({ path: dir + "/complete.png" });
  await p.locator('[data-ui="home"]').click();
  await p.locator('[data-ui="tutorialMenu"]').click();
  assert.match(
    await p.locator("#modal").textContent(),
    /1 starts · 1 completions/,
  );
  await p.locator('[data-ui="tutorialStart"]').click();
  await settle();
  assert.equal((await saved()).tutorial.lesson, "welcome");
  assert.equal(
    await fs.readFile(path.join(profile, "save.json"), "utf8"),
    normalText,
  );
  report.checks.push(
    "Full mouse tutorial completed, including actual placement/attack drags, double-click attacks, item/Gem drags, every Tavern service and independent Warden victory; completion and replay stats persist separately.",
  );
  await p.locator('[data-ui="pause"]').click();
  await p.locator('[data-ui="saveAndHome"]').click();
  await p.locator('[data-ui="new"]').click();
  assert.match(
    await p.locator("#modal").textContent(),
    /forfeits the saved run/,
  );
  await p.locator('[data-ui="newConfirmed"]').click();
  await settle();
  assert.equal(
    JSON.parse(await fs.readFile(path.join(profile, "save.json"), "utf8")).mode,
    "class",
  );
  assert.equal((await saved()).tutorial.lesson, "welcome");
  report.checks.push(
    "After completion New Game follows normal class selection with its normal forfeiture warning; replay tutorial save remains independent.",
  );
  assert.deepEqual(report.errors, []);
  await fs.writeFile(
    "reports/tutorial-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} catch (e) {
  if (p) await p.screenshot({ path: dir + "/failure.png" });
  throw e;
} finally {
  await app?.close();
}
