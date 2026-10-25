import {chromium, expect} from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
const root=path.resolve(import.meta.dirname,'..'), webroot=path.join(root,'release/Astrata/resources/app');
const report=path.join(root,'reports/premium-gear-ui');await fs.mkdir(report,{recursive:true});
const server=http.createServer(async(req,res)=>{
  const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(webroot,'.'+(rel==='/'?'/index.html':rel));
  if(!file.startsWith(webroot+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',({'.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const errors=[], results=[];
const fixture=(id,stratum=1)=>{const g=new Game(927);g.s.mode='event';g.s.event=id;g.s.stratum=stratum;g.s.gold=200;g.s.field.entities=[];return g;};
async function open(g){
  const context=await browser.newContext({viewport:{width:1440,height:810}}),p=await context.newPage();
  await p.addInitScript(state=>localStorage.setItem('astrata',JSON.stringify({save:state,history:[],settings:{width:1440,fast:true}})),g.s);
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.locator('[data-ui="continue"]').click();
  return p;
}
async function saved(p){return p.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.startsWith('astrata-run-'));return JSON.parse(localStorage.getItem(key)).at(-1).state;});}
try{
  const g=fixture('counterweightSmith',2),bracelet=g.s.inventory.find(x=>x.id==='bronze'),gem=g.s.inventory.find(x=>x.id===g.s.startGem);
  bracelet.gem=gem.uid;const spare=g.addItem('silver');
  const p=await open(g);await p.locator('[data-event-trade="1"]').click();
  await expect(p.locator(`[data-fitted-gem="${gem.uid}"]`)).toBeVisible();
  await expect(p.locator(`[data-trade-select="${spare.uid}"]`)).toBeDisabled();
  await p.locator(`[data-trade-select="${bracelet.uid}"]`).click();
  await expect(p.locator('[data-trade-confirm]')).toBeEnabled();
  await p.screenshot({path:path.join(report,'smith-trade.png')});
  await p.locator('[data-trade-confirm]').click();
  const state=await saved(p);assert.equal(state.gold,100);assert.ok(state.inventory.some(x=>x.id==='prismaticBracelet'));
  assert.ok(!state.inventory.some(x=>[bracelet.uid,gem.uid].includes(x.uid)));results.push('Smith preview, fitted gem, disabled spare, payment and exact exchange');
  for(const rng of [1,123456]){
    const wager=fixture('keepersWager');wager.s.rng=rng;const expected=new Game(0,structuredClone(wager.s));expected.act(expected.legal().find(a=>a.type==='eventChoice'&&a.index===0));
    const page=await open(wager);await page.getByRole('button',{name:/Wager 100 Gold/}).click();
    await expect(page.locator('.scene-copy h2')).toHaveText(expected.s.event==='keepersWagerWon'?'The Opened Box':'The Empty Box');
    assert.equal((await saved(page)).gold,100);await page.screenshot({path:path.join(report,expected.s.event+'.png')});results.push(expected.s.event);
  }
  const poor=fixture('gildedHeartwood');poor.s.maxHp=15;poor.s.hp=15;const page=await open(poor);
  await expect(page.getByRole('button',{name:/Give 15 maximum HP/})).toBeDisabled();
  await expect(page.locator('.choices')).toContainText('not have enough maximum HP');results.push('Unsafe maximum-HP bargain visibly unavailable');
  assert.deepEqual(errors,[]);
  await fs.writeFile(path.join(report,'verification.json'),JSON.stringify({version:'4.0.23',passed:true,results,errors},null,2));
  console.log(results.join('\n'));
}finally{await browser.close();await new Promise(r=>server.close(r));}
