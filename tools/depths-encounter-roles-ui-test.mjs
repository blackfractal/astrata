import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
const results=[];
for(const id of ['hollowDrifter','echoPolyp','glassBrood']) {
 const g=new Game(44);g.s.stratum=3;g.beginBattle([{uid:900,enemy:id,restless:0}]);delete g.s.checkpoint;
 const profile=path.resolve('.tmp/encounter-roles-'+id+'-'+Date.now());await fs.mkdir(profile,{recursive:true});
 await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
 const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
 const errors=[];
 try {
  const p=await app.firstWindow();p.on('pageerror',e=>errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  await expect(p.locator('[data-slot]')).toHaveCount(42);
  if(id==='hollowDrifter') {
   const i=g.s.battle.ideons[0];
   await expect(p.locator(`[data-slot="${i.slot}"] .ideon`)).toBeVisible();
   await expect(p.locator(`[data-slot="${i.slot}"]`)).toContainText('Hollow Sentinel');
  }
  if(id==='echoPolyp') {
   await expect(p.locator('.corruption-nausea')).toHaveCount(2);
   await expect(p.locator('body')).not.toContainText('Corrupt marked spaces');
  }
  if(id==='glassBrood')await expect(p.locator('body')).toContainText('72');
  await p.screenshot({path:`reports/depths-encounter-roles-${id}.png`});
  assert.deepEqual(errors,[]);results.push({id,hp:g.s.battle.enemies[0].hp,ideons:g.s.battle.ideons.length,corruptions:Object.keys(g.s.battle.corruptions).length,errors});
 } finally {await app.close();}
}
await fs.writeFile('reports/depths-encounter-roles-ui.json',JSON.stringify({version:'4.0.6',packaged:true,results},null,2));
console.log('Three packaged encounter views passed without renderer errors.');
