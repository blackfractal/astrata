import {chromium,expect} from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {refreshBossPlans} from '../src/loom-bosses.mjs';
const root=path.resolve(import.meta.dirname,'..'),webroot=path.join(root,'release/Astrata/resources/app'),report=path.join(root,'reports/elemental-formations-4.0.31/ui');
await fs.mkdir(report,{recursive:true});
const server=http.createServer(async(req,res)=>{
  const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(webroot,'.'+(rel==='/'?'/index.html':rel));
  if(!file.startsWith(webroot+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',({'.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const errors=[],checks=[];
try {
 for(const mode of ['starleaf','meanderingCurrent','risingGale','mindfire']) {
  const g=new Game(31);g.s.stratum=2;g.s.hp=g.s.maxHp=1000;
  g.beginBattle([{uid:900,enemy:'beetle',restless:0}]);const b=g.s.battle;
  b.grid=Array.from({length:42},()=>[]);b.corruptions={};b.phase='activate';b.focus=2;b.channel=10;
  b.enemies[0].hp=b.enemies[0].maxHp=1000;b.enemies[0].element='Arcane';
  const put=(id,i)=>b.grid[i]=[g.instance(g.newCard(id))];let slot=0,damage;
  if(mode==='starleaf'){slot=16;put(mode,slot);for(const i of [8,10,22,24])put('water',i);for(const i of [9,15,17,23])put('blast',i);damage=24;}
  if(mode==='meanderingCurrent'){slot=9;for(const i of [0,1,8,9,16,17,24])put('water',i);put(mode,slot);damage=17;}
  if(mode==='risingGale'){put(mode,0);put('gust',7);put('gust',14);put('sapling',21);damage=7;}
  if(mode==='mindfire'){put(mode,0);damage=22;}
  delete g.s.checkpoint;
  const context=await browser.newContext({viewport:{width:1440,height:810}}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(state=>localStorage.setItem('astrata',JSON.stringify({save:state,history:[],settings:{width:1440,fast:true}})),g.s);
  await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.locator('[data-ui="continue"]').click();
  await p.waitForLoadState("networkidle");
  await expect(p.locator(`[data-slot="${slot}"] .damage-value`)).toHaveText(String(damage));
  if(mode==='starleaf') {
    await expect(p.locator('[data-slot="16"]')).toHaveAttribute('data-base-primary',/Light/);
    await expect(p.locator('.link-penalty')).toHaveCount(4);
    await p.locator('[data-activate-slot="16"]').click();
    await expect(p.locator('[data-target-unattune]')).toHaveAttribute('title','Use Light for this activation');
    await p.locator('[data-slot="8"]').click();
    await p.locator('[data-target-unattune]').click();
    await expect(p.locator('[data-slot="16"]')).toHaveAttribute('data-preview-element','Light');
  }
  if(mode==='meanderingCurrent')await expect(p.locator('.link-current')).toHaveCount(6);
  if(mode==='risingGale')await expect(p.locator('.link-penalty')).toHaveCount(1);
  if(mode==='mindfire') {
    await expect(p.locator('[data-slot="0"]')).toContainText('Spend 2 Focus');
    await p.locator('[data-activate-slot="0"]').dblclick();
    await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
    await expect(p.locator('[data-slot="0"] .damage-value')).toHaveText('6');
  }
  await p.screenshot({path:path.join(report,mode+'.png')});checks.push(mode);await context.close();
 }
 assert.deepEqual(errors,[]);await fs.writeFile(path.join(report,'verification.json'),JSON.stringify({version:'4.0.31',checks,errors},null,2));console.log(checks.join(', '));
}finally{await browser.close();await new Promise(r=>server.close(r));}
