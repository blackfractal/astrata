import { _electron as electron } from '@playwright/test';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { spawnIdeon } from '../src/ideons.mjs';
const report={checks:[],errors:[]};await fs.mkdir('reports/screenshots/hive-drone',{recursive:true});
for(const ending of [false,true]){
 const g=new Game(830);g.s.stratum=3;g.s.equipment={};g.beginBattle([{uid:900,enemy:'mindHive',restless:0}]);
 const b=g.s.battle,o=b.enemies[0];b.ideons=[];b.phase='activate';
 const rear=spawnIdeon(g,o,'burrower',{slot:13}),front=spawnIdeon(g,o,'runner',{slot:12}),drone=spawnIdeon(g,o,'drone',{slot:34,element:'Water'});
 const c=g.instance(g.newCard('shield'));b.grid[4]=[c];b.corruptions[11]={kind:'hole'};b.corruptions[18]={kind:'hole'};
 if(ending)o.hp=1;
 delete g.s.checkpoint;
 const profile=path.resolve('.tmp/hive-drone-ui-'+Date.now());await fs.mkdir(profile,{recursive:true});
 await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
 const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
 try{
  const p=await app.firstWindow();p.on('pageerror',e=>report.errors.push(e.message));await p.locator('[data-ui="continue"]').click();
  const d=p.locator(`[data-enemy-uid="${drone.uid}"]`);
  await d.locator('img.ideon-art').evaluate(img=>img.decode());assert.match(await d.textContent(),/Next: 5 Water/);
  if(ending)await p.emulateMedia({reducedMotion:'reduce'});
  await p.screenshot({path:`reports/screenshots/hive-drone/${ending?'final-turn':'movement-before'}.png`});
  await p.evaluate(()=>{
   window.hiveTimings={};const sample=()=>{
    const h=window.hiveTimings,t=performance.now();
    if(!document.querySelector('.enemy[data-enemy="mindHive"]'))h.ownerGone??=t;
    if(!document.querySelector('.ideon'))h.insectsGone??=t;
    if(document.querySelector('[data-stage="hive-cleared"]'))h.cleared??=t;
    if(h.cleared&&!document.querySelector('.presentation-bar'))h.finished??=t;
   };new MutationObserver(sample).observe(document.body,{subtree:true,childList:true,attributes:true});
  });
  const action=g.legal().find(a=>a.type==='endTurn');assert.ok(action);
  await p.locator('[data-action='+JSON.stringify(action.key)+']').filter({visible:true}).first().click();g.act(action);
  if(ending){
   await p.locator('[data-stage="hive-cleared"]').waitFor();
   assert.equal(await p.locator('.ideon,.enemy').count(),0);assert.equal(await p.locator('.mind').count(),1);
   assert.match(await p.locator('[data-slot="13"]').textContent(),/Shield/);
   await p.screenshot({path:'reports/screenshots/hive-drone/clear-board.png'});
   await p.waitForFunction(()=>window.hiveTimings.finished);
   const timings=await p.evaluate(()=>window.hiveTimings);assert.ok(timings.ownerGone<timings.insectsGone);assert.ok(timings.finished-timings.cleared>=950);
   report.clearBoardHoldMs=timings.finished-timings.cleared;
   report.checks.push('Hive disappears first, then all insects; clean Mind Grid with player cards retained lasts >=950ms even with Fast and reduced motion before rewards.');
  }else{
   await p.waitForFunction(()=>!document.querySelector('.presentation-bar')&&document.querySelector('[data-ideon="drone"]')?.textContent.includes('Next: 10 Water'));
   assert.equal(await p.locator(`[data-slot="4"] [data-enemy-uid="${front.uid}"]`).count(),1);
   assert.equal(await p.locator(`[data-slot="12"] [data-enemy-uid="${rear.uid}"]`).count(),1);
   assert.equal(await p.locator(`[data-slot="34"] [data-enemy-uid="${drone.uid}"]`).count(),1);
   assert.match(await p.locator('[data-slot="13"]').textContent(),/Shield/);
   await p.screenshot({path:'reports/screenshots/hive-drone/movement-after.png'});
   report.checks.push('Drone art and 5→10 Water intent visible; Skitter moves diagonally and swaps Shield, then trailing Burrower advances and swaps that same Shield; Drone stays put.');
  }
 }finally{await app.close();}
}
assert.deepEqual(report.errors,[]);await fs.writeFile('reports/hive-drone-ui-verification.json',JSON.stringify(report,null,2));console.log(report);
