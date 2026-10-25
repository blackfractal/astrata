import {chromium} from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {startRepairs} from '../src/corruptions.mjs';
const root=path.resolve(import.meta.dirname,'..'),webroot=path.join(root,'release/Astrata/resources/app');
const g=new Game(17);g.beginBattle([{uid:g.uid(),enemy:'borrowedFace'}]);
g.s.battle.grid=g.s.battle.grid.map(()=>[]);g.s.battle.corruptions={0:{kind:'insanity',value:2},41:{kind:'insanity',value:3}};delete g.s.checkpoint;
const initial=structuredClone(g.s),before=g.observe();g.capturePresentation=true;startRepairs(g);
const frames=[{kind:'incoming',source:g.s.battle.enemies[0].uid,amount:10,element:'Water',name:'Previous enemy attack',state:before},...g.presentation];
const server=http.createServer(async(req,res)=>{
  const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(webroot,'.'+(rel==='/'?'/index.html':rel));
  if(!file.startsWith(webroot+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',({'.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const errors=[];
try{
  const p=await browser.newPage({viewport:{width:1440,height:810}});p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(state=>localStorage.setItem('astrata',JSON.stringify({save:state,history:[],settings:{width:1440,fast:true}})),initial);
  await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.locator('[data-ui="continue"]').click();
  const result=await p.evaluate(async({before,frames,after})=>{
    const points=[document.querySelector('[data-slot="0"]'),document.querySelector('[data-slot="41"]'),document.querySelector('.battle-player .player-portrait')].map(el=>{const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
    const bolts=[],animate=Element.prototype.animate;
    Element.prototype.animate=function(keys,opts){if(this.matches('.attack-bolt'))bolts.push({element:this.dataset.effect,keys});return animate.call(this,keys,opts);};
    try{const {playFrames}=await import('/src/presentation.mjs');await playFrames(before,frames,after,()=>{},()=>true);}finally{Element.prototype.animate=animate;}
    return {points,bolts};
  },{before,frames,after:g.observe()});
  assert.equal(result.bolts.length,2);
  result.bolts.forEach((bolt,i)=>{
    assert.equal(bolt.element,'Chaos');
    for(const [k,pt] of [[0,result.points[i]],[1,result.points[2]]]){
      assert.ok(Math.abs(parseFloat(bolt.keys[k].left)-pt.x)<1);
      assert.ok(Math.abs(parseFloat(bolt.keys[k].top)-pt.y)<1);
    }
  });
  assert.deepEqual(errors,[]);
  await fs.writeFile('reports/insanity-origin-ui.json',JSON.stringify({version:'4.0.24',passed:true,previousEnemySourceOverridden:true,...result,errors},null,2));
  console.log('Both Chaos projectiles originate at their Insanity spaces and end at the player, overriding a preceding enemy attack.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
