import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
const results=[];
for(const [completed,count] of [[15,2],[30,3],[60,5]]){
 const g=new Game(731);g.s.stratum=3;g.s.equipment={};g.s.hp=g.s.maxHp=10000;
 g.beginBattle([{uid:900,enemy:'refractionCannon',restless:0}]);delete g.s.checkpoint;
 const b=g.s.battle;b.grid=Array.from({length:42},()=>[]);b.hand=[];b.phase='activate';b.enemies[0].cannonTurns=completed;
 const profile=path.resolve('.tmp/cannon-volley-ui-'+completed+'-'+Date.now());await fs.mkdir(profile,{recursive:true});
 await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:false,music:0,effects:0}));
 const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
 try{
  const p=await app.firstWindow(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  await expect(p.locator('[data-enemy-uid="900"] .tell')).toContainText(count+'/'+count+' bullets');
  await p.evaluate(()=>{window.volleySamples=[];window.volleyWatch=setInterval(()=>{
   const bullets=[...document.querySelectorAll('[data-ideon="bullet"]')];
   if(bullets.length)window.volleySamples.push({count:bullets.length,animated:bullets.filter(e=>e.getAnimations({subtree:true}).length>0).length});
  },16);});
  await p.getByRole('button',{name:'End turn',exact:true}).click();
  await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
  await expect(p.locator('[data-ideon="bullet"]')).toHaveCount(count);
  await p.screenshot({path:'reports/cannon-volley-ui-'+count+'.png',timeout:10000});
  const samples=await p.evaluate(()=>{clearInterval(window.volleyWatch);return window.volleySamples;});
  assert.ok(samples.some(s=>s.count===count));assert.ok(samples.every(s=>s.count===count),'Volley must appear together');
  assert.deepEqual(errors,[]);results.push({completed,count,allAppearTogether:true,errors});
 }finally{await app.close();}
}
await fs.writeFile('reports/cannon-volley-ui.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
