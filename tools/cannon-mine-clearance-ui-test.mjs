import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';import {spawnIdeon} from '../src/ideons.mjs';
const g=new Game(3);g.s.stratum=3;g.s.equipment={};g.s.hp=g.s.maxHp=1000;
g.beginBattle([{uid:900,enemy:'refractionCannon'}]);delete g.s.checkpoint;
const b=g.s.battle;b.grid=Array.from({length:42},()=>[]);b.hand=[];b.phase='activate';b.enemies[0].cannonTurns=3;
b.deck=Array.from({length:4},()=>g.newCard('blast'));
spawnIdeon(g,b.enemies[0],'bullet',{slot:6,field:'element',element:'Fire'});
const profile=path.resolve('.tmp/cannon-clearance-'+Date.now());await fs.mkdir(profile,{recursive:true});
await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
const errors=[];
try {
 const p=await app.firstWindow();p.on('pageerror',e=>errors.push(e.message));
 await p.locator('[data-ui="continue"]').click();
 const controls=p.locator('[data-action]');
 const index=await controls.evaluateAll(es=>es.findIndex(e=>JSON.parse(e.dataset.action)[0]==='endTurn'));
 assert.ok(index>=0);await controls.nth(index).click();
 g.act(g.legal().find(a=>a.type==='endTurn'));
 await expect(p.locator('.corruption-mine')).toHaveCount(2);
 for(const slot of Object.keys(g.s.battle.corruptions)) {
   assert.equal(await p.locator(`[data-slot="${slot}"] .ideon`).count(),0);
 }
 const slot=Number(Object.keys(g.s.battle.corruptions)[0]);
 const placement=g.legal().find(a=>a.type==='place'&&a.slot===slot);
 assert.ok(placement);
 await p.locator(`[data-hand="${placement.uid}"]`).click();
 await p.locator(`[data-slot="${slot}"]`).click();
 await expect(p.locator(`[data-slot="${slot}"]`)).toContainText('Blast');
 await p.screenshot({path:'reports/cannon-mine-clearance-ui.png'});
 assert.deepEqual(errors,[]);
 await fs.writeFile('reports/cannon-mine-clearance-ui.json',JSON.stringify({version:'4.0.5',packaged:true,freshMines:2,noBulletOverlap:true,coverPlaced:true,errors},null,2));
 console.log('Packaged charge: two clear mines, cover placement succeeds, no renderer errors.');
} finally {await app.close();}
