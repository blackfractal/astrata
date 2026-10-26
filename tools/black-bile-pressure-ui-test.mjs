import {chromium,expect} from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {refreshBossPlans} from '../src/loom-bosses.mjs';
const root=path.resolve(import.meta.dirname,'..'),webroot=path.join(root,'release/Astrata/resources/app'),report=path.join(root,'reports/black-bile-retune-4.0.29/ui');
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
  for (const mode of ['early','late','player']) {
    const g=new Game(381);g.s.stratum=2;g.s.hp=g.s.maxHp=1000;
    g.beginBattle([{uid:g.uid(),enemy:'blackBile',restless:0}]);const b=g.s.battle,e=b.enemies[0];
    b.grid=Array.from({length:42},()=>[]);
    const put=(id,i)=>b.grid[i]=[g.instance(g.newCard(id))];
    put('shield',6);put('plasma',2);put('blast',20);put('ignis',34);put('blast',40);
    if(mode==='late')e.cycle=4;
    if(mode==='player')b.biles={0:{kind:'bile',uid:g.uid(),source:e.uid}};
    refreshBossPlans(g);delete g.s.checkpoint;
    const context=await browser.newContext({viewport:{width:1440,height:810}}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
    await p.addInitScript(state=>localStorage.setItem('astrata',JSON.stringify({save:state,history:[],settings:{width:1440,fast:true}})),g.s);
    await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.locator('[data-ui="continue"]').click();
    const expected=mode==='late'?4:2;
    await expect(p.locator('.bile-forecast')).toHaveCount(expected);
    const source=p.locator('[data-slot="0"] .bile-escape');
    if(mode==='player')await expect(source).toHaveCount(1);
    const target=p.locator('[data-slot="2"] .bile-forecast');await expect(target).toHaveCount(1);
    await p.screenshot({path:path.join(report,mode+'.png')});checks.push(mode+': distinct targeted/ordinary Bile warnings visible after Continue');await context.close();
  }
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(report,'verification.json'),JSON.stringify({version:'4.0.29',passed:true,checks,errors},null,2));console.log(checks.join('\n'));
}finally{await browser.close();await new Promise(r=>server.close(r));}
