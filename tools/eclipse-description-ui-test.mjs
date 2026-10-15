import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
const results=[];
for(const stratum of [1,2,3]){
 const g=new Game(731);g.s.stratum=stratum;
 g.beginBattle([{uid:900,enemy:'bat',restless:0}]);delete g.s.checkpoint;
 const b=g.s.battle;b.phase='activate';b.channel=3;b.grid=Array.from({length:42},()=>[]);b.hand=[];
 b.grid[17]=[g.instance(g.newCard('eclipse'))];b.grid[18]=[g.instance(g.newCard('storm'))];
 const profile=path.resolve('.tmp/eclipse-description-'+stratum+'-'+Date.now());await fs.mkdir(profile,{recursive:true});
 await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));
 await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
 const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
 try{
  const p=await app.firstWindow(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(10000);
  await p.locator('[data-ui="continue"]').click();
  for(const [slot,id] of [[17,'eclipse'],[18,'storm']]){
   await p.locator(`[data-slot="${slot}"] .name`).click();
   const detail=p.locator('.card-detail');await expect(detail).toBeVisible();
   const text=await detail.innerText();assert.equal(text.includes('Ideons'),stratum===3,`${id} in S${stratum}`);
   if(id==='eclipse'&&stratum===3)assert.ok(text.includes('2-space diamond'));
   results.push({stratum,id,ideonClause:text.includes('Ideons')});
   await p.keyboard.press('Escape');
  }
  assert.deepEqual(errors,[]);
 }finally{await app.close();}
}
await fs.writeFile('reports/eclipse-description-ui.json',JSON.stringify({results,isolatedProfiles:true},null,2));
console.log('S1/S2 hide Ideon clauses; S3 shows them on Eclipse Seed and Storm Canopy.');
