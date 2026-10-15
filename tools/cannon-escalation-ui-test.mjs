import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';import {spawnIdeon} from '../src/ideons.mjs';
const results=[];
for(const completed of [3,8,13]){
const g=new Game(731);g.s.stratum=3;g.s.equipment={};g.s.hp=g.s.maxHp=1000;
g.beginBattle([{uid:900,enemy:'refractionCannon',restless:0}]);delete g.s.checkpoint;
const b=g.s.battle;b.grid=Array.from({length:42},()=>[]);b.hand=[];b.phase='activate';b.enemies[0].cannonTurns=completed;b.enemies[0].cycle=completed-Math.floor(completed/5);b.turn=completed+1;
spawnIdeon(g,b.enemies[0],'bullet',{slot:17,field:'element',element:'Fire'});
const profile=path.resolve('.tmp/cannon-escalation-'+Date.now());await fs.mkdir(profile,{recursive:true});
await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});const errors=[];
try{
 const p=await app.firstWindow();p.on('pageerror',e=>errors.push(e.message));await p.locator('[data-ui="continue"]').click();
 await expect(p.locator('.refraction-field')).toHaveCount(13);
 await expect(p.locator('[data-enemy-uid="900"] .tell')).toContainText('Charging Final Blast...');
 const ordinaryTell=await p.locator('[data-enemy-uid="900"] .tell').innerText();const ordinaryDamage=14+2*Math.floor((completed-Math.floor(completed/5))/2);assert.match(ordinaryTell,new RegExp(`${ordinaryDamage/2} Arcane.*${ordinaryDamage/2}`));
 assert.match(await p.locator('.refraction-field').first().getAttribute('data-tooltip'),/2-space diamond/);
 await p.getByRole('button',{name:'End turn',exact:true}).click();
 await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
 await expect(p.locator('[data-enemy-uid="900"] .tell')).toContainText('Final Blast');
 const tell=await p.locator('[data-enemy-uid="900"] .tell').innerText();const blastDamage=40+10*Math.floor(completed/5);assert.match(tell,new RegExp(String(blastDamage))); 
 const help=await p.locator('[data-ideon="bullet"]').first().getAttribute('data-tooltip');assert.match(help,/Waits; its owner is not commanding/);
 await expect(p.locator('.corruption-mine')).toHaveCount(2);
 await p.screenshot({path:'reports/cannon-escalation-ui-'+completed+'.png'});
 await p.getByRole('button',{name:'Begin activation',exact:true}).click();
 await p.getByRole('button',{name:'End turn',exact:true}).click();
 await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
 await expect(p.locator('.corruption-mine')).toHaveCount(0);
 await expect(p.locator('header .hp')).toHaveText(String(1000-ordinaryDamage-40-blastDamage));
 assert.deepEqual(errors,[]);results.push({chargeMove:completed+1,blastMove:completed+2,radiusCells:13,minesVisible:2,minesResolved:true,ordinaryTell,ordinaryDamage,hpAfterUncoveredMinesAndBlast:1000-ordinaryDamage-40-blastDamage,blastDamage,chargingVisible:true,finalBlastTell:tell,bulletsWait:true,errors,isolatedProfile:true});
 console.log('Packaged UI: 13-space field, five-move-cycle charging, escalating Final Blast intent and waiting bullets verified.');
}finally{await app.close();}

}
await fs.writeFile("reports/cannon-escalation-ui.json",JSON.stringify(results,null,2));
