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
const g=new Game(891); g.s.deck=["blast","cinder","fireEnhance","fireSynergy","earthEnhance"].map(id=>g.newCard(id));g.s.equipment={};
g.beginBattle([{uid:900,enemy:"beetle",restless:0}]);
const b=g.s.battle;b.phase="activate";b.channel=10;b.focus=3;b.elementEnhancements={Fire:2};
b.enemies[0].hp=b.enemies[0].maxHp=500;b.enemies[0].element="Arcane";
for(const [id,slot] of [["blast",17],["cinder",18],["fireEnhance",24],["fireSynergy",26],["earthEnhance",28]]) {
 const c=g.s.deck.find(c=>c.id===id);b.deck=b.deck.filter(x=>x.uid!==c.uid);b.hand=b.hand.filter(x=>x.uid!==c.uid);b.grid[slot]=[g.instance(c)];
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
  await expect(page.locator('[data-slot="17"] .damage-value')).toHaveText("4");
  await expect(page.locator('[data-slot="26"] .damage-value')).toHaveText("11");
  await page.locator('[data-activate-slot="17"]').click();
  await page.locator('[data-slot="18"]').click();
  await expect(page.locator('[data-slot="17"] .element-label')).toHaveText("Preview Fire");
  await expect(page.locator('[data-slot="17"] .damage-value')).toHaveText("6");
  // A preview cannot change another card's Synergy count.
  await expect(page.locator('[data-slot="26"] .damage-value')).toHaveText("11");
  await page.locator('[data-target-cancel]').click();
  await expect(page.locator('[data-slot="17"] .damage-value')).toHaveText("4");
  await expect(page.locator('.element-preview')).toHaveCount(0);
  // Selecting a different activation cancels the original preview.
  await page.locator('[data-activate-slot="17"]').click();
  await page.locator('[data-slot="18"]').click();
  await page.locator('[data-activate-slot="28"]').click();
  await expect(page.locator('.element-preview')).toHaveCount(0);
  await expect(page.locator('[data-slot="17"] .damage-value')).toHaveText("4");
  // Commit that same card: both its damage and other cards' counts now change.
  await page.locator('[data-activate-slot="17"]').click();
  await page.locator('[data-slot="18"]').click();
  await page.locator('[data-enemy-uid="900"]').first().click();
  await expect(page.locator('[data-enemy-uid="900"]').first()).toContainText("494 / 500");
  await expect(page.locator('[data-slot="26"] .damage-value')).toHaveText("12");
  await expect(page.locator('.element-preview')).toHaveCount(0);
  await page.screenshot({path:path.join(out,"committed-attunement.png")});
  assert.deepEqual(errors,[]);
  console.log("Attunement preview, cancellation, switching cards, commitment and Synergy verified: "+out);
} finally {await browser?.close();await new Promise(r=>server.close(r));}
