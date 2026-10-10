import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { _electron as electron } from "@playwright/test";

const catalog = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(catalog, "two-wings");
const original = JSON.parse(fs.readFileSync(path.join(entry, "snapshots/opening.json")));
const sha = p => fs.existsSync(p) ? crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex") : null;
const normal = path.join(process.env.APPDATA, "astrata");
const before = Object.fromEntries(["save.json", "history.json", "collections.json"].map(n => [n, sha(path.join(normal,n))]));
const result = spawnSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(catalog,"open-situation.ps1"), "-Situation", "two-wings", "-Snapshot", "opening", "-PrepareOnly"], { encoding:"utf8" });
assert.equal(result.status, 0, result.stderr);
const prepared = JSON.parse(result.stdout.trim());
const saved = JSON.parse(fs.readFileSync(path.join(prepared.profile,"save.json")));
const comparable = s => { s=structuredClone(s); for(const k of ["history","log","uiMeta"]) delete s[k];return s; };
assert.deepEqual(comparable(saved), comparable(original));
const { Game } = await import(pathToFileURL(path.join(prepared.workingDirectory,"resources/app/src/engine.mjs")));
const g = new Game(0, structuredClone(saved));
g.beginBattle([g.s.field.entities.find(e => e.enemy === "bat")], { enemyFirst:true });
assert.equal(g.s.battle.reaction.damage,4);
assert.equal(g.s.battle.reaction.element,"Wind");
g.act(g.legal().find(a => a.type === "bracelet"));
assert.equal(g.s.hp,69);
for (const [destination, enemy] of [[[7,4],"moth"],[[6,3],"bat"]]) {
  const route = new Game(0, structuredClone(saved));
  for (const [x,y] of [[6,4], destination]) {
    const action = route.legal().find(a=>a.type==="move"&&a.x===x&&a.y===y);
    assert.ok(action);route.act(action);
  }
  assert.equal(route.s.mode,"battle");
  assert.equal(route.s.battle.enemies[0].id,enemy);
  assert.equal(route.s.battle.enemyFirst,false);
}
const report = { seed:original.seed, package:"2.1.13", exactSnapshot:true, routes:["Moth: NE/E","Bat: NE/N"], freshBatWind:4, earthBraceletAbsorbs:3, ambushHPLoss:1, errors:[] };
const app = await electron.launch({executablePath:prepared.executable,args:["--user-data-dir="+prepared.profile],cwd:prepared.workingDirectory});
try {
  const p=await app.firstWindow();p.on("pageerror",e=>report.errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  await p.waitForFunction(()=>!document.querySelector(".presentation-bar"));
  const run=path.join(prepared.profile,"runs",prepared.sessionId,"latest.json");
  for(let i=0;i<30&&!fs.existsSync(run);i++) await p.waitForTimeout(100);
  assert.ok(fs.existsSync(run));
  const latest=JSON.parse(fs.readFileSync(run));
  for(const k of ["field","equipment","inventory","deck","rng","hp","mode"]) assert.deepEqual(latest[k],original[k],k);
  await p.screenshot({path:path.join(entry,"screenshots/opening.png")});
  report.uiLoaded=true;
} finally { await app.close(); }
assert.deepEqual(report.errors,[]);
const after = Object.fromEntries(Object.keys(before).map(n => [n,sha(path.join(normal,n))]));
report.normalProfileUnchanged=JSON.stringify(before)===JSON.stringify(after);
fs.writeFileSync(path.join(entry,"verification.json"),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
