import { WeightedPolicy } from "../src/policy.mjs";
import { _electron as electron } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Game } from "../src/engine.mjs";
import { startLoomTutorial } from "../src/loom-tutorial.mjs";
const profile = path.resolve(".tmp/loom-ui-" + Date.now()),
  dir = "reports/screenshots/loom";
await fs.mkdir(profile, { recursive: true });
await fs.mkdir(dir, { recursive: true });
const normal = new Game(112);
normal.enterStratum2();
normal.s.mode = "loomIntro";
normal.s.uiMeta = { runId: "loom-normal", elapsed: 0 };
const normalText = JSON.stringify(normal.s);
await fs.writeFile(path.join(profile, "save.json"), normalText);
await fs.writeFile(
  path.join(profile, "tutorial-save.json"),
  JSON.stringify(startLoomTutorial(new Game(22002)).s),
);
await fs.writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({ width: 1280, fast: true }),
);
const packaged = process.argv.includes("--packaged");
const app = await electron.launch({
  executablePath: path.resolve(
    packaged
      ? "release/Astrata/Astrata.exe"
      : "node_modules/electron/dist/electron.exe",
  ),
  args: [
    ...(packaged ? [] : [path.resolve(".")]),
    "--user-data-dir=" + profile,
  ],
});
const p = await app.firstWindow(),
  report = { packaged, checks: [], errors: [] };
p.on("pageerror", (e) => report.errors.push(e.message));
const settle = () =>
  p.waitForFunction(() => !document.querySelector(".presentation-bar"));
const saved = async () =>
  JSON.parse(
    await fs.readFile(path.join(profile, "tutorial-save.json"), "utf8"),
  );
const button = (a) =>
  p
    .locator("[data-action=" + JSON.stringify(a.key) + "]")
    .filter({ visible: true })
    .first();
try {
  await p.locator('[data-ui="continueTutorial"]').click();
  for (let n = 0; n < 400; n++) {
    await settle();
    let s;
    try {
      s = await saved();
    } catch (e) {
      if (e.code === "ENOENT") break;
      throw e;
    }
    const g = new Game(0, s),
      step = s.tutorial.lesson,
      a =
        step === "independent"
          ? new WeightedPolicy().choose(g.observe(), g.legal()).action
          : g.legal()[0];
    assert.ok(a, step);
    if (
      ["space", "covered", "delay", "hole", "mine", "hypnosis"].includes(step)
    ) {
      await p.mouse.move(5, 5);
      await p.screenshot({ path: dir + "/" + step + ".png" });
      const fits = await p.locator(".tutorial-guide").evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.left >= 0 &&
          r.bottom <= innerHeight &&
          el.scrollHeight <= el.clientHeight + 1
        );
      });
      assert.ok(fits, step + " callout fits");
      if (step === "covered")
        assert.ok(await p.locator(".corruption-covered").count());
      if (step === "delay")
        assert.equal(await p.locator(".mending-ribbon").count(), 0);
    }
    if (
      step === "independent" &&
      (await p.locator("[data-tutorial-independent]").isVisible())
    )
      await p.locator("[data-tutorial-independent]").click();
    if (a.type === "tutorialNext")
      await p.locator("[data-tutorial-next]").click();
    else if (a.type === "place")
      await p
        .locator('[data-hand="' + a.uid + '"]')
        .dragTo(p.locator('[data-slot="' + a.slot + '"]'));
    else if (a.type === "activate") {
      const el = p.locator('[data-activate-slot="' + a.slot + '"]');
      if (a.target != null) await el.dblclick();
      else {
        await el.click();
        if (a.cardTarget != null)
          await p.locator('[data-slot="' + a.cardTarget + '"]').click();
      }
    } else if (["block", "ward", "intercept"].includes(a.type))
      await p.locator('[data-slot="' + a.slot + '"]').click();
    else if (["bracelet", "armor"].includes(a.type))
      await p.locator('.battle-player [data-item-uid="' + a.uid + '"]').click();
    else if (a.type === "skipEquipment")
      await p.locator(".battle-player .player-portrait").click();
    else if (a.type === "recall") {
      await p.locator('[data-slot="' + a.slot + '"] .name').click();
      await button(a).click();
    } else await button(a).click();
    await p.waitForFunction(() => !document.querySelector(".presentation-bar"));
    await p.waitForTimeout(100);
    report.checks.push(step);
  }
  await settle();
  assert.match(await p.locator("h1").innerText(), /Mending Ground Complete/);
  assert.equal(
    await fs.readFile(path.join(profile, "save.json"), "utf8"),
    normalText,
  );
  await p.screenshot({ path: dir + "/complete.png" });
  await p.locator('[data-ui="continue"]').click();
  await p.screenshot({ path: dir + "/companion.png" });
  await p
    .getByRole("button", { name: "Enter the Unfinished Loom", exact: true })
    .click();
  await settle();
  await p.locator(".loom-field").waitFor();
  await p.screenshot({ path: dir + "/field.png" });
  report.checks.push(
    "Normal save preserved byte-for-byte; Continue shows companion and opens Loom field.",
  );
  assert.deepEqual(report.errors, []);
} finally {
  await fs.writeFile(
    "reports/loom-ui-verification.json",
    JSON.stringify(report, null, 2),
  );
  await app.close();
}
console.log(report);
