import {_electron as electron,expect} from '@playwright/test';import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';import {spawnIdeon} from '../src/ideons.mjs';
const results=[],errors=[];
for(const boss of ['refractionCannon','cnidarian'])for(const reduced of [false,true]){
 const g=new Game(731);g.s.stratum=3;g.s.equipment={};g.beginBattle([{uid:900,enemy:boss,restless:0}]);delete g.s.checkpoint;
 const b=g.s.battle;b.grid=Array.from({length:42},()=>[]);b.ideons=[];b.hand=[];b.jobs=[];b.phase='activate';b.channel=3;b.enemies[0].hp=1;
 b.grid[0]=[g.instance(g.newCard('storm'))];b.grid[1]=[g.instance(g.newCard('shield'))];
 const kids=[spawnIdeon(g,b.enemies[0],'bullet',{slot:6,field:'shared'}),spawnIdeon(g,b.enemies[0],'bullet',{slot:13,field:'shared'})];
 const profile=path.resolve('.tmp/owner-death-'+boss+'-'+Date.now());await fs.mkdir(profile,{recursive:true});await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
 const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
 try{const p=await app.firstWindow();p.on('pageerror',e=>errors.push(e.message));if(reduced)await p.emulateMedia({reducedMotion:'reduce'});
  await p.locator('[data-ui="continue"]').click();
  await p.evaluate(()=>{
   window.deathTrace=[];window.clearTime=null;const seen=new WeakSet();
   new MutationObserver(rs=>{for(const r of rs){
    if(r.type==='attributes'&&r.target.classList?.contains('disintegrating')&&r.target.dataset.enemyUid&&!seen.has(r.target)){seen.add(r.target);window.deathTrace.push({uid:Number(r.target.dataset.enemyUid),ownerPresent:!!document.querySelector('[data-enemy-uid="900"]')});}
   }const bar=document.querySelector('[data-stage="owner-cleared"]');if(bar&&!window.clearTime)window.clearTime=performance.now();}).observe(document.body,{subtree:true,attributes:true,childList:true});
  });
  await p.locator('[data-activate-slot="0"]').click();
  await p.locator('[data-stage="owner-cleared"]').waitFor();
  await expect(p.locator('[data-enemy-uid="900"]')).toHaveCount(0);for(const e of kids)await expect(p.locator(`[data-enemy-uid="${e.uid}"]`)).toHaveCount(0);
  await expect(p.locator('[data-slot="1"] .name')).toHaveText('Shield');
  await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
  const result=await p.evaluate(()=>({trace:window.deathTrace,clearDuration:performance.now()-window.clearTime}));
  assert.deepEqual(result.trace.map(x=>x.uid),[900,...kids.map(e=>e.uid)]);assert.ok(result.trace.slice(1).every(x=>!x.ownerPresent));assert.ok(result.clearDuration>=950);
  results.push({boss,reduced,...result});
 }finally{await app.close();}
}
assert.deepEqual(errors,[]);await fs.writeFile('reports/owner-death-ui.json',JSON.stringify({results,errors,isolatedProfiles:true},null,2));console.log('Boss-first, Ideons-second, one-second clear view verified in four packaged cases.');
