import {_electron as electron} from '@playwright/test';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';import {spawnIdeon,commandIdeon} from '../src/ideons.mjs';
const profile=path.resolve('.tmp/cannon-travel-'+Date.now());await fs.mkdir(profile,{recursive:true});
const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
const results=[],errors=[];
try{const p=await app.firstWindow();p.on('pageerror',e=>errors.push(e.message));await p.locator('[data-ui="new"]').waitFor();
for(const reduced of [false,true])for(const slot of [27,22,21]){
 const g=new Game(731);g.s.stratum=3;g.beginBattle([{uid:900,enemy:'refractionCannon',restless:0}]);delete g.s.checkpoint;
 const b=g.s.battle;b.ideons=[];b.grid=Array.from({length:42},()=>[]);b.jobs=[];
 const e=spawnIdeon(g,b.enemies[0],'bullet',{slot,field:'element',element:'Fire'});
 const before=g.observe();g.capturePresentation=true;g.presentation=[];commandIdeon(g,e.uid);
 await p.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
 const result=await p.evaluate(async({before,frames,after,uid})=>{
  const {playFrames}=await import('./src/presentation.mjs');
  const rendered=[],moves=[],deaths=[];const original=Element.prototype.animate;
  Element.prototype.animate=function(keyframes,options){if(this.dataset.enemyUid===String(uid))moves.push(Number(this.closest('[data-slot]').dataset.slot));return original.call(this,keyframes,options);};
  const observer=new MutationObserver(records=>{for(const r of records)if(r.target.classList?.contains('disintegrating'))deaths.push(Number(r.target.closest('[data-slot]').dataset.slot));});
  observer.observe(document.body,{attributes:true,subtree:true,attributeFilter:['class']});
  const render=s=>{
   const living=s.battle.ideons.filter(e=>e.hp>0),active=living.find(e=>e.uid===uid);rendered.push(active?.slot??null);
   document.querySelector('#app').innerHTML='<div style="display:grid;grid-template-columns:repeat(7,100px);gap:4px">'+Array.from({length:42},(_,i)=>'<div class="slot" data-slot="'+i+'" style="position:relative;width:100px;height:70px">'+living.filter(e=>e.slot===i).map(e=>'<button class="ideon ideon-projectile" data-enemy-uid="'+e.uid+'" style="width:70px;height:60px">Thought</button>').join('')+'</div>').join('')+'</div>';
  };
  try{await playFrames(before,frames,after,render,()=>false);}finally{Element.prototype.animate=original;observer.disconnect();}
  return {rendered,moves,deaths,cleanup:!document.querySelector('.presentation-bar')};
 },{before,frames:g.presentation,after:g.observe(),uid:e.uid});
 const pathSlots=slot===27?[26,25]:slot===22?[21]:[];
 assert.deepEqual(result.moves,reduced?[]:pathSlots);
 for(const stop of pathSlots)assert.ok(result.rendered.includes(stop));
 if(slot!==27){assert.ok(result.deaths.includes(21));assert.equal(result.rendered.at(-1),null);}else assert.equal(result.rendered.at(-1),25);
 assert.equal(result.cleanup,true);results.push({slot,reduced,...result});
}
assert.deepEqual(errors,[]);await fs.writeFile('reports/cannon-travel-ui.json',JSON.stringify({results,errors,isolatedProfile:true},null,2));console.log('Six normal/reduced-motion travel and edge-disappearance cases passed.');
}finally{await app.close();}
