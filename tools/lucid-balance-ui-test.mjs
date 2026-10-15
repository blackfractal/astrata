import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {spawnIdeon} from '../src/ideons.mjs';
const g=new Game(735);g.s.stratum=3;g.s.equipment={};
g.beginBattle([{uid:900,enemy:'cnidarian',restless:0}]);delete g.s.checkpoint;
const b=g.s.battle;b.grid=Array.from({length:42},()=>[]);b.ideons=[];b.phase='activate';b.jobs=[];
b.grid[17]=[g.instance(g.newCard('lucidNeedle'))];b.grid[0]=[g.instance(g.newCard('lucidGuide'))];
const near=spawnIdeon(g,b.enemies[0],'drone',{slot:19}),far=spawnIdeon(g,b.enemies[0],'drone',{slot:41});
const profile=path.resolve('.tmp/lucid-balance-ui-'+Date.now());await fs.mkdir(profile,{recursive:true});
await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));
await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
const errors=[];
try{
 const p=await app.firstWindow();p.on('pageerror',e=>errors.push(e.message));
 await p.locator('[data-ui="continue"]').click();
 await expect(p.locator('[data-slot="0"] .damage-value')).toHaveText('18');
 const source=p.locator('[data-slot="17"]');await expect(source.locator('.damage-value')).toHaveText('8');
 const r=await source.boundingBox();await p.mouse.move(r.x+25,r.y+15);await p.mouse.down();
 await p.mouse.move(r.x+45,r.y+20,{steps:5});
 for(const [uid,damage] of [[near.uid,'15'],[far.uid,'8'],[b.enemies[0].uid,'8']]){
  const t=await p.locator(`[data-enemy-uid="${uid}"]`).boundingBox();
  await p.mouse.move(t.x+t.width/2,t.y+t.height/2,{steps:8});
  await expect(source.locator('.damage-value')).toHaveText(damage);
 }
 await p.mouse.move(20,180);await p.mouse.up();
 await expect(source.locator('.damage-value')).toHaveText('8');
 assert.deepEqual(errors,[]);
 await fs.writeFile('reports/lucid-balance-ui.json',JSON.stringify({guide18:true,nearPreview15:true,farPreview8:true,mainEnemyPreview8:true,cancelRestores8:true,errors},null,2));
 console.log('Lucid Guide display and Needle near/far/main-enemy drag previews verified.');
}finally{await app.close();}
