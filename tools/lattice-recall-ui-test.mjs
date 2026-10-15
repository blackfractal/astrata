import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
const g=new Game(731);g.beginBattle([{uid:900,enemy:'cnidarian',restless:0}]);
delete g.s.checkpoint;const s=g.s,b=s.battle;b.phase='place';b.focus=3;
b.grid=Array.from({length:42},()=>[]);b.ideons=[];b.hand=[];
const c=g.instance(g.newCard('lattice'));Object.assign(c,{element:'Wind',used:2,ward:0,zeroWard:true});b.grid[17]=[c];
const profile=path.resolve('.tmp/lattice-recall-'+Date.now());await fs.mkdir(profile,{recursive:true});
await fs.writeFile(profile+'/save.json',JSON.stringify(s));
await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
try{
 const p=await app.firstWindow(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(10000);
 await p.locator('[data-ui="continue"]').click();
 await p.locator('[data-slot="17"] .name').click();
 const disabled=p.locator('[data-full-activate]'),recall=p.locator('.card-context [data-action]');
 await expect(disabled).toHaveText('Depleted: cannot activate');await expect(disabled).toBeDisabled();
 await expect(recall).toHaveText(/Recall.*1 Focus/);await expect(recall).toBeEnabled();
 const a=await disabled.boundingBox(),b=await recall.boundingBox();
 assert.ok(Math.abs(a.y-b.y)<2,'Depletion and Recall share the same row');
 assert.deepEqual(errors,[]);
 await fs.writeFile('reports/lattice-recall-ui.json',JSON.stringify({sameRow:true,recallEnabled:true,compactLabel:true,isolatedFixture:true,errors},null,2));
 console.log('Compact depleted label and Recall fit on one row in depleted Wind Lattice fixture.');
}finally{await app.close();}
