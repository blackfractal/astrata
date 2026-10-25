import {chromium,expect} from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
const root=path.resolve(import.meta.dirname,'..'),webroot=path.join(root,'release/Astrata/resources/app'),report=path.join(root,'reports/resonant-grove-ui');
await fs.mkdir(report,{recursive:true});
const server=http.createServer(async(req,res)=>{
  const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(webroot,'.'+(rel==='/'?'/index.html':rel));
  if(!file.startsWith(webroot+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',({'.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const errors=[],checks=[];
try{
  for(const mode of ['complete','broken','spent','reduced']){
    const g=new Game(17);g.beginBattle([{uid:g.uid(),enemy:'beetle'}]);g.s.battle.grid=g.s.battle.grid.map(()=>[]);g.s.battle.phase='activate';g.s.battle.channel=4;
    for(const i of [0,1,2,7,8,9,14,15,16]){
      const c=g.instance(g.newCard(i===8?'square':'clear'));
      if(i<2){c.element='Earth';c.transmuted=true;}
      g.s.battle.grid[i]=[c];
    }
    if(mode==='broken')g.s.battle.grid[16][0].freeze=g.s.battle.turn;
    if(mode==='spent')g.s.battle.grid[8][0].used=2;
    delete g.s.checkpoint;
    const context=await browser.newContext({viewport:{width:1440,height:810},reducedMotion:mode==='reduced'?'reduce':'no-preference'}),p=await context.newPage();
    p.on('pageerror',e=>errors.push(e.message));
    await p.addInitScript(state=>localStorage.setItem('astrata',JSON.stringify({save:state,history:[],settings:{width:1440,fast:true}})),g.s);
    await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.locator('[data-ui="continue"]').click();
    const owner=p.locator('[data-slot="8"]'),outline=p.locator('.grove-pattern[data-pattern-owner="8"]');
    await expect(owner).toContainText('Resonant Grove');
    await expect(owner.locator('.pattern-bonus')).toHaveText(mode==='broken'?'2×2 · +10':'3×3 · +20');
    await expect(p.locator('.link-pattern')).toHaveCount(0);
    if(mode==='spent'){await expect(outline).toHaveCount(0);checks.push('Spent Grove has no active outline');await context.close();continue;}
    await expect(outline).toHaveAttribute('data-size',mode==='broken'?'2':'3');
    await expect(outline.locator('.grove-outline.link-core')).toHaveCount(1);
    await expect(outline.locator('.grove-corner.link-core')).toHaveCount(4);
    const geometry=await outline.evaluate((group)=>{
      const owner=document.querySelector('[data-slot="8"]'),mind=document.querySelector('.mind'),r=owner.getBoundingClientRect(),box=mind.getBoundingClientRect();
      const expected=[[r.left+5-box.left,r.top+5-box.top],[r.right-5-box.left,r.top+5-box.top],[r.right-5-box.left,r.bottom-5-box.top],[r.left+5-box.left,r.bottom-5-box.top]];
      return {pointerEvents:getComputedStyle(group.parentElement).pointerEvents,ends:[...group.querySelectorAll('.grove-corner.link-core')].map(p=>{const v=p.getPointAtLength(p.getTotalLength());return[v.x,v.y]}),expected};
    });
    assert.equal(geometry.pointerEvents,'none');geometry.ends.forEach((p,i)=>p.forEach((v,k)=>assert.ok(Math.abs(v-geometry.expected[i][k])<0.1)));
    await owner.hover();await expect(outline).toHaveClass(/link-inspected/);
    await p.screenshot({path:path.join(report,mode+'.png')});
    checks.push(mode+': correct square, one outline, four card-corner rays, hover highlight, no input interception');
    await context.close();
  }
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(report,'verification.json'),JSON.stringify({version:'4.0.25',passed:true,checks,errors},null,2));console.log(checks.join('\n'));
}finally{await browser.close();await new Promise(r=>server.close(r));}
