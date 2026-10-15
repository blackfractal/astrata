import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
const results=[];
for(const [element,reduced] of [['Fire',false],['Water',false],['Arcane',true]]){
 const g=new Game(731);g.s.stratum=3;g.s.equipment={};g.s.hp=g.s.maxHp=70;
 g.beginBattle([{uid:900,enemy:'refractionCannon',restless:0}]);delete g.s.checkpoint;
 const b=g.s.battle;b.grid=Array.from({length:42},()=>[]);b.hand=[];b.phase='activate';
 b.enemies[0].cannonTurns=4;b.enemies[0].finalBlastElement=element;
 const ward=g.instance(g.newCard('ward'));ward.ward=5;b.grid[19]=[ward];
 const spare=g.instance(g.newCard('ward'));spare.ward=5;b.grid[17]=[spare];
 const profile=path.resolve('.tmp/final-glare-'+element+'-'+Date.now());await fs.mkdir(profile,{recursive:true});
 await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:false,music:0,effects:0}));
 const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
 try{
  const p=await app.firstWindow(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
  await p.locator('[data-ui="continue"]').click();
  await p.evaluate(()=>{window.glareSeen={flight:false,impact:false};window.glareTimer=setInterval(()=>{
   window.glareSeen.flight ||= !!document.querySelector('.attack-bolt.final-blast-orb');
   window.glareSeen.impact ||= !!document.querySelector('.final-blast-impact');
  },10);});
  await p.getByRole('button',{name:'End turn',exact:true}).click();
  await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
  await p.locator('[data-slot="19"]').click();
  await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
  const held=p.locator('[data-slot="19"] .final-blast-orb');await expect(held).toHaveText('35');
  const style=await held.evaluate(el=>({color:el.style.getPropertyValue('--hit-color'),core:getComputedStyle(el,'::after').backgroundColor,halo:getComputedStyle(el,'::before').filter,animation:getComputedStyle(el).animationName}));
  assert.equal(style.core,'rgb(255, 254, 244)');assert.match(style.halo,/blur/);
  if(reduced)assert.equal(style.animation,'none');
  await p.mouse.move(5,5);await p.screenshot({path:'reports/final-blast-glare-'+element+'.png'});
  const seen=await p.evaluate(()=>{clearInterval(window.glareTimer);return window.glareSeen;});
  assert.ok(seen.impact);if(!reduced)assert.ok(seen.flight);
  assert.deepEqual(errors,[]);results.push({element,reduced,style,...seen,remaining:35,errors});
 }finally{await app.close();}
}
await fs.writeFile('reports/final-blast-glare-ui.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
