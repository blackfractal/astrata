import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';import {spawnIdeon} from '../src/ideons.mjs';
const results=[];
for(const completed of [3,8]){
const g=new Game(731);g.s.stratum=3;g.s.equipment={};g.s.hp=g.s.maxHp=1000;
g.beginBattle([{uid:900,enemy:'refractionCannon',restless:0}]);delete g.s.checkpoint;
const b=g.s.battle;b.grid=Array.from({length:42},()=>[]);b.hand=[];b.phase='activate';b.enemies[0].cannonTurns=completed;b.turn=completed+1;
spawnIdeon(g,b.enemies[0],'bullet',{slot:17,field:'element',element:'Fire'});
const profile=path.resolve('.tmp/cannon-pressure-'+Date.now());await fs.mkdir(profile,{recursive:true});
await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});const errors=[];
try{
 const p=await app.firstWindow();p.on('pageerror',e=>errors.push(e.message));await p.locator('[data-ui="continue"]').click();
 await expect(p.locator('.refraction-field')).toHaveCount(13);
 await expect(p.locator('[data-enemy-uid="900"] .tell')).toContainText('Charging Final Blast...');
 assert.match(await p.locator('.refraction-field').first().getAttribute('data-tooltip'),/2-space diamond/);
 await p.getByRole('button',{name:'End turn',exact:true}).click();
 await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
 await expect(p.locator('[data-enemy-uid="900"] .tell')).toContainText('Final Blast');
 const tell=await p.locator('[data-enemy-uid="900"] .tell').innerText();assert.match(tell,/30/);
 const help=await p.locator('[data-ideon="bullet"]').first().getAttribute('data-tooltip');assert.match(help,/Waits; its owner is not commanding/);
 await p.screenshot({path:'reports/cannon-five-move-ui-'+completed+'.png'});
 assert.deepEqual(errors,[]);results.push({chargeMove:completed+1,blastMove:completed+2,radiusCells:13,chargingVisible:true,finalBlastTell:tell,bulletsWait:true,errors,isolatedProfile:true});
 console.log('Packaged UI: 13-space field, five-move-cycle charging, 30-damage Final Blast intent and waiting bullets verified.');
}finally{await app.close();}

}
await fs.writeFile("reports/cannon-five-move-ui.json",JSON.stringify(results,null,2));
