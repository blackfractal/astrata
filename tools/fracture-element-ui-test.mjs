import { chromium, expect } from "@playwright/test";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { Game } from "../src/engine.mjs";
import { cards } from "../src/content.mjs";

const root=path.resolve(import.meta.dirname,".."), webroot=process.argv.includes("--packaged")?path.join(root,"release/Astrata/resources/app"):root;
const out=path.join(root,".tmp",`synergy-attunement-ui-${Date.now()}`);
await fs.mkdir(out,{recursive:true});
const g=new Game(891); g.s.deck=["blast","cinder","chaosFracture","elementSynergy","elementEnhance"].map(id=>g.newCard(id));g.s.equipment={};
g.beginBattle([{uid:900,enemy:"beetle",restless:0}]);
const b=g.s.battle;b.phase="activate";b.channel=10;b.focus=3;b.elementEnhancements={Fire:2};
b.enemies[0].hp=b.enemies[0].maxHp=500;b.enemies[0].element="Arcane";
for(const [id,slot] of [["blast",17],["cinder",18],["chaosFracture",24],["elementSynergy",26],["elementEnhance",28]]) {
 const c=g.s.deck.find(c=>c.id===id);b.deck=b.deck.filter(x=>x.uid!==c.uid);b.hand=b.hand.filter(x=>x.uid!==c.uid);b.grid[slot]=[g.instance(c)];
}
b.grid[24][0].element="Fire";b.grid[24][0].transmuted=true;b.grid[26][0].element="Earth";b.grid[26][0].transmuted=true;
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
  await expect(page.locator('[data-slot="24"] .name')).toHaveText("Fire Fracture");
  await expect(page.locator('[data-slot="26"] .name')).toHaveText("Element Synergy");
  await page.locator('[data-slot="24"]').click();
  await expect(page.locator('#modal h2')).toHaveText("Fire Fracture");
  await expect(page.locator('#modal')).toContainText("Originally Chaos Fracture");
  await page.screenshot({path:path.join(out,"renamed-enhance.png")});
  await page.keyboard.press("Escape");
  await page.locator('[data-activate-slot="24"]').dblclick();
  await expect(page.locator('.fracture-status')).toHaveText("Fire Fracture");
  assert.deepEqual(errors,[]);console.log("Transmuted board names and original-name detail verified.");
} finally {await browser?.close();await new Promise(r=>server.close(r));}
