import {chromium,expect} from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
const root=path.resolve(import.meta.dirname,'..'),webroot=path.join(root,'release/Astrata/resources/app'),report=path.join(root,'reports/bombadier-retune-4.0.28/ui');
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
  for (const mode of ['ready','warned','placed']) {
    const g=new Game(381);g.s.stratum=2;g.s.hp=g.s.maxHp=1000;
    g.beginBattle([{uid:g.uid(),enemy:'bombadier',restless:0}]);const e=g.s.battle.enemies[0];e.hp=71;e.corruptionPlan=[];
    const round=()=>{g.endTurn();let n=0;while(g.s.battle.reaction&&n++<100)g.act(g.legal().find(a=>a.type==='skipEquipment'));};
    if(mode!=='ready')round();if(mode==='placed')round();delete g.s.checkpoint;
    const context=await browser.newContext({viewport:{width:1440,height:810}}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
    await p.addInitScript(state=>localStorage.setItem('astrata',JSON.stringify({save:state,history:[],settings:{width:1440,fast:true}})),g.s);
    await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.locator('[data-ui="continue"]').click();
    if(mode==='ready') {await expect(p.locator('body')).toContainText('Last Ditch Effort');await expect(p.locator('body')).toContainText('6 Mind Mine');}
    if(mode==='warned') {await expect(p.locator('.corruption-foretell')).toHaveCount(6);const tips=await p.locator('.corruption-foretell').evaluateAll(es=>es.map(e=>e.dataset.tooltip));assert.ok(tips.every(x=>x.includes('Mind Mine')));}
    if(mode==='placed')await expect(p.locator('.corruption-mine')).toHaveCount(6);
    await p.screenshot({path:path.join(report,mode+'.png')});checks.push(mode+': intended warning/mine state visible after Continue');await context.close();
  }
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(report,'verification.json'),JSON.stringify({version:'4.0.28',passed:true,checks,errors},null,2));console.log(checks.join('\n'));
}finally{await browser.close();await new Promise(r=>server.close(r));}
