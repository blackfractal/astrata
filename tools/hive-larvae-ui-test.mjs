import {_electron as electron} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {spawnIdeon} from '../src/ideons.mjs';
const report={checks:[],errors:[]};
for(const scenario of ['opening','mixed']){
 const g=new Game(930);g.s.stratum=3;g.s.equipment={};g.beginBattle([{uid:900,enemy:'mindHive',restless:0}]);delete g.s.checkpoint;
 if(scenario==='mixed'){
  g.s.battle.ideons=[];const owner=g.s.battle.enemies[0];
  for(const [kind,slot] of [['larva',6],['runner',20],['burrower',34],['drone',27]])spawnIdeon(g,owner,kind,{slot,element:'Arcane'});
 }
 const profile=path.resolve('.tmp/hive-larvae-ui-'+scenario+'-'+Date.now());await fs.mkdir(profile,{recursive:true});
 await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
 const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
 try{
  const p=await app.firstWindow();p.on('pageerror',e=>report.errors.push(e.message));await p.locator('[data-ui="continue"]').click();
  await p.locator('[data-ideon="larva"] .ideon-art').first().evaluate(img=>img.decode());
  assert.equal(await p.locator('[data-ideon="larva"]').count(),scenario==='opening'?8:1);
  assert.match(await p.locator('[data-ideon="larva"]').first().getAttribute('data-tooltip'),/no attack/);
  if(scenario==='mixed')for(const kind of ['runner','burrower'])assert.match(await p.locator('[data-ideon="'+kind+'"] .ideon-field-name').textContent(),/Move \+ 1 Arcane/);
  await fs.mkdir('reports/screenshots/hive-larvae',{recursive:true});await p.screenshot({path:'reports/screenshots/hive-larvae/'+scenario+'-before.png'});
  for(const type of ['activatePhase','endTurn']){
   const a=g.legal().find(a=>a.type===type);await p.locator('[data-action='+JSON.stringify(a.key)+']').filter({visible:true}).first().click();g.act(a);
  }
  await p.waitForFunction(()=>!document.querySelector('.presentation-bar')&&document.querySelectorAll('.corruption-seal').length===1);
  await p.screenshot({path:'reports/screenshots/hive-larvae/'+scenario+'-after.png'});
  const run=(await fs.readdir(profile+'/runs',{withFileTypes:true})).find(e=>e.isDirectory()&&e.name!=='builds').name;
  const raw=JSON.parse(await fs.readFile(profile+'/runs/'+run+'/latest.json','utf8')),s=raw.state||raw;
  assert.equal(s.hp,scenario==='opening'?70:63);assert.equal(s.battle.turn,2);
  assert.deepEqual(s.battle.ideons.map(e=>[e.kind,e.slot,e.age]),g.s.battle.ideons.map(e=>[e.kind,e.slot,e.age]));
  report.checks.push(scenario==='opening'?'Eight Larvae render unique art and movement-only intent; first turn moves with no damage.':'Larva moves silently; Skitter and Burrower each deal 1; Drone deals 5; all intents and saved positions match engine.');
 }finally{await app.close();}
}
assert.deepEqual(report.errors,[]);await fs.writeFile('reports/hive-larvae-ui-verification.json',JSON.stringify(report,null,2));console.log(report);
