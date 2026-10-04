import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { DEPLETED_WARD_TEXT } from "../src/content.mjs";
const profile = path.resolve(".tmp/ward-one-" + Date.now());
await fs.mkdir(profile, {recursive:true});
const g = new Game(83);
g.beginBattle([{uid:g.uid(),enemy:"beetle",restless:0}]);
const b = g.s.battle;
b.phase = "activate";
b.hand = [];
for (const [i,id] of ["ward","lattice","bastion"].entries()) {
  b.grid[i] = [g.instance(g.newCard(id))];
  Object.assign(b.grid[i][0], {ward:0, zeroWard:true, used:i ? 1 : 0});
}
b.grid[28] = [g.instance(g.newCard("ward"))];
g.s.uiMeta = {runId:"ward-one",elapsed:0};
await fs.writeFile(profile+"/save.json",JSON.stringify(g.s));
await fs.writeFile(profile+"/settings.json",JSON.stringify({width:1280,fast:true}));
const app = await electron.launch({executablePath:path.resolve("release/Astrata/Astrata.exe"),args:["--user-data-dir="+profile]});
const report = {checks:[],errors:[]};
try {
  const p = await app.firstWindow();
  p.on("pageerror",e=>report.errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  for (let i=0;i<3;i++) {
    const control = p.locator(`[data-activate-slot="${i}"]`);
    assert.equal(await control.innerText(),DEPLETED_WARD_TEXT);
    assert.equal(await control.getAttribute("aria-disabled"),"true");
    assert.ok(await control.evaluate(el=>el.scrollHeight<=el.clientHeight+1 && el.scrollWidth<=el.clientWidth+1),"depletion message fits without ellipsis");
  }
  assert.match(await p.locator('[data-slot="28"] .nums').innerText(),/Ward 1/);
  await p.locator('[data-activate-slot="28"]').click();
  await p.waitForFunction(()=>!document.querySelector(".presentation-bar"));
  assert.match(await p.locator('[data-slot="28"] .nums').innerText(),/Ward 11/);
  await p.mouse.move(5,5);
  await fs.mkdir("reports/screenshots/wards",{recursive:true});
  await p.screenshot({path:"reports/screenshots/wards/depleted.png"});
  await p.locator('[data-slot="1"] .name').click();
  assert.equal(await p.locator("[data-full-activate]").innerText(),DEPLETED_WARD_TEXT);
  assert.ok(await p.locator("[data-full-activate]").isDisabled());
  report.checks.push("All three depleted Ward types show the exact full message without clipping; detail activation is disabled with matching text.","Fresh isolated Ward shows 1 and activates to 11.");
  assert.deepEqual(report.errors,[]);
} finally {await app.close();}
await fs.writeFile("reports/ward-one-verification.json",JSON.stringify(report,null,2)+"\n");
console.log(report);
