import { chromium, expect } from "@playwright/test";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards } from "../src/content.mjs";

const root=path.resolve(import.meta.dirname,".."), webroot=process.argv.includes("--packaged")?path.join(root,"release/Astrata/resources/app"):root;
const out=path.join(root,".tmp",`synergy-ui-${Date.now()}`);
await fs.mkdir(out,{recursive:true});
const ids=Object.values(cards).filter(c=>c.expansion==="synergy").map(c=>c.id);
const g=new Game(891); g.s.deck=[...ids,"cinder","sapling","water"].map(id=>g.newCard(id)); g.s.equipment={};
g.beginBattle([{uid:900,enemy:"beetle",restless:0}]);
const b=g.s.battle; b.phase="activate";b.channel=10;b.focus=3;
b.enemies[0].hp=b.enemies[0].maxHp=500;b.enemies[0].element="Arcane";
for(const [id,slot] of [["fireEnhance",17],["fireSynergy",18],["prismaticSynergy",19],["earthEnhance",24],["sapling",25]]) {
  const c=g.s.deck.find(c=>c.id===id);
  b.deck=b.deck.filter(x=>x.uid!==c.uid);b.hand=b.hand.filter(x=>x.uid!==c.uid);
  b.grid[slot]=[g.instance(c)];
}
delete g.s.checkpoint;
const collections={schema:1,importedTraces:true,highestStratum:4,cards:Object.fromEntries(Object.keys(cards).map(id=>[id,{firstSeenAt:"fixture"}])),enemies:{},equipment:{},achievements:{}};
const server=http.createServer(async(req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const file=path.resolve(webroot,"."+(pathname==="/"?"/index.html":pathname));
  if(!file.startsWith(webroot+path.sep)){res.writeHead(403).end();return;}
  try {res.setHeader("Content-Type",{".mjs":"text/javascript",".css":"text/css",".html":"text/html",".png":"image/png"}[path.extname(file)]||"application/octet-stream");res.end(await fs.readFile(file));}
  catch {res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
let browser;
try {
  browser=await chromium.launch({executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true});
  const page=await browser.newPage({viewport:{width:1600,height:900}}), errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.addInitScript(data=>{if(!localStorage.getItem("astrata"))localStorage.setItem("astrata",JSON.stringify(data));},{save:g.s,collections,history:[],settings:{width:1600,fast:true}});
  const url=`http://127.0.0.1:${server.address().port}/`;
  await page.goto(url);await page.locator('[data-ui="continue"]').click();
  await expect(page.locator('[data-slot="18"] .damage-value')).toHaveText("9");
  await expect(page.locator('[data-slot="19"] .damage-value')).toHaveText("13");
  await page.locator('[data-activate-slot="17"]').click();
  await expect(page.locator('[data-slot="18"] .damage-value')).toHaveText("10");
  await page.locator('[data-activate-slot="24"]').click();
  await expect(page.locator('[data-slot="25"] .damage-value')).toHaveText("5");
  await page.screenshot({path:path.join(out,"enhanced-board.png")});
  await page.locator('[data-activate-slot="18"]').dblclick();
  await expect(page.locator('[data-enemy-uid="900"]').first()).toContainText("490 / 500");
  // Normal Continue deliberately restarts a fight. Restore the exact archived
  // decision as an isolated fixture to verify snapshot loading, not change that rule.
  const saved=await page.evaluate(()=>{
    const key=Object.keys(localStorage).find(k=>k.startsWith("astrata-run-"));
    const state={...JSON.parse(localStorage.getItem(key)).at(-1).state,history:[],log:[]};
    const data=JSON.parse(localStorage.getItem("astrata")); data.save=state;
    localStorage.setItem("astrata",JSON.stringify(data)); return state;
  });
  assert.equal(saved.battle.elementEnhancements.Fire,1);
  assert.equal(saved.battle.elementEnhancements.Earth,1);
  await page.reload();await page.locator('[data-ui="continue"]').click();
  await expect(page.locator('[data-slot="18"] .damage-value')).toHaveText("10");
  await page.goto(url);await page.locator('[data-ui="archives"]').click();
  const search=page.getByRole("searchbox");
  await search.fill("Synergy");await expect(page.locator(".archive-entry")).toHaveCount(7);
  await page.locator(".archive-entry img").evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  await page.screenshot({path:path.join(out,"synergy-cards.png")});
  await search.fill("Enhance");await expect(page.locator(".archive-entry")).toHaveCount(6);
  await page.locator(".archive-entry img").evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  await page.screenshot({path:path.join(out,"enhance-cards.png")});
  await page.locator('[data-entry="fireEnhance"]').click();
  await expect(page.locator("#modal")).toContainText("For this battle");
  await page.screenshot({path:path.join(out,"enhance-detail.png")});
  assert.deepEqual(errors,[]);
  await fs.writeFile(path.join(out,"verification.json"),JSON.stringify({checks:["13 art assets load","live Synergy 9→10 after Enhance","Allies gain damage without HP","10 actual damage","exact archived buffs survive snapshot reload","seven Synergy and six Enhance archive entries","full rules inspect"],errors},null,2));
  console.log("Synergy UI checks passed: "+out);
} finally {await browser?.close();await new Promise(r=>server.close(r));}
