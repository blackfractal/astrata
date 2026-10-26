import {chromium,expect} from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {refreshBossPlans} from '../src/loom-bosses.mjs';
const root=path.resolve(import.meta.dirname,'..'),webroot=path.join(root,'release/Astrata/resources/app'),report=path.join(root,'reports/trickster-retune-4.0.30/ui');
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
 for(const axis of ['H','V']) {
  const g=new Game(301);g.s.stratum=2;g.s.hp=g.s.maxHp=1000;
  g.beginBattle([{uid:g.uid(),enemy:'trickster',restless:0}]);const b=g.s.battle,e=b.enemies[0];
  b.grid=Array.from({length:42},()=>[]);b.corruptions={};b.phase='activate';e.cycle=axis==='H'?2:4;
  const put=(id,i)=>b.grid[i].push(g.instance(g.newCard(id)));
  put('blast',0);put('plasma',0);put('shield',axis==='H'?2:14);
  put('blast',axis==='H'?7:1);put('blast',axis==='H'?35:6);
  const holes=axis==='H'?[1,10]:[7,22];for(const i of holes)b.corruptions[i]={kind:'hole',uid:g.uid(),source:e.uid};
  refreshBossPlans(g);delete g.s.checkpoint;
  const context=await browser.newContext({viewport:{width:1440,height:810}}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(state=>localStorage.setItem('astrata',JSON.stringify({save:state,history:[],settings:{width:1440,fast:true}})),g.s);
  await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.locator('[data-ui="continue"]').click();
  await expect(p.locator('.phase-warning')).toHaveCount(axis==='H'?21:18);
  const tip=await p.locator('[data-slot="0"] .phase-label').getAttribute('data-tooltip');
  assert.ok(tip.includes('destroys the whole Construct'));assert.ok(!tip.includes('${'));
  await expect(p.locator('[data-slot="0"] .phase-label')).toContainText('2');
  await expect(p.locator(`[data-slot="${axis==='H'?7:1}"] .phase-label`)).toContainText('3');
  await expect(p.locator(`[data-slot="${axis==='H'?35:6}"] .phase-label`)).toContainText('1');
  await p.screenshot({path:path.join(report,axis+'-warning.png')});
  await p.evaluate(()=>{
    window.__falls=[];window.__ghosts=[];
    new MutationObserver(records=>{
      for(const r of records){
        if(r.type==='attributes'&&r.target.matches?.('[data-slot].disintegrating'))window.__falls.push(Number(r.target.dataset.slot));
        for(const el of r.addedNodes||[])if(el.matches?.('.phase-moving-card'))window.__ghosts.push(Number(el.dataset.slot));
      }
    }).observe(document.body,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
  });
  await p.getByRole('button',{name:'End turn',exact:true}).click();
  await p.waitForFunction(()=>window.__falls.length>=2);
  await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
  const visual=await p.evaluate(()=>({falls:window.__falls,ghosts:window.__ghosts}));
  for(const hole of holes)assert.ok(visual.falls.includes(hole));
  assert.equal(visual.ghosts.filter(i=>i===0).length,1);
  assert.ok(!visual.ghosts.includes(holes[0]));
  await p.screenshot({path:path.join(report,axis+'-resolved.png')});
  checks.push({axis,visual,passed:true});await context.close();
 }
 assert.deepEqual(errors,[]);await fs.writeFile(path.join(report,'verification.json'),JSON.stringify({version:'4.0.30',checks,errors},null,2));console.log(JSON.stringify(checks));
}finally{await browser.close();await new Promise(r=>server.close(r));}
