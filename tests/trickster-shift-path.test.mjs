import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {phasePlan,phaseMoves,disrupt} from '../src/loom-bosses.mjs';
function arena(){
 const g=new Game(301);g.s.stratum=2;g.beginBattle([{uid:901,enemy:'trickster',restless:0}]);
 const b=g.s.battle,e=b.enemies[0];b.grid=Array.from({length:42},()=>[]);b.corruptions={};
 const put=(slot,id='blast')=>{const c=g.instance(g.newCard(id));b.grid[slot].push(c);return c;};
 return {g,b,e,put};
}
test('choose fullest line, counting meld cards, and lock staggered neighboring shifts',()=>{
 for(const axis of ['H','V']){
  const {g,b,e,put}=arena();e.cycle=axis==='H'?2:4;
  const slot=line=>axis==='H'?line*7:line;
  for(let n=0;n<4;n++)put(slot(2));
  for(let n=0;n<3;n++)put(slot(1));
  put(slot(0));put(slot(4));
  e.phasePlan=phasePlan(b,e,axis);assert.deepEqual(e.phasePlan.shifts,[{line:1,distance:1},{line:2,distance:2},{line:3,distance:3}]);
  for(let n=0;n<10;n++)put(slot(5));
  assert.deepEqual(phasePlan(b,e,axis).shifts,e.phasePlan.shifts);
  const restored=new Game(0,structuredClone(g.s));
  assert.deepEqual(restored.s.battle.enemies[0].phasePlan.shifts,e.phasePlan.shifts);
 }
});
test('H/V, wrapping or ordinary movement: Hole on either step destroys before later motion',()=>{
 for(const [axis,from,path] of [['H',2,[3,4]],['H',6,[0,1]],['V',7,[14,21]],['V',35,[0,7]]]){
  for(const index of [0,1]){
   const {g,b,e,put}=arena(),c=put(from,'shield');put(from,'plasma');
   b.shields=[{slot:from,owner:c.uid,block:7,element:'Fire'}];
   b.corruptions[path[index]]={kind:'hole',source:e.uid};
   const plan={axis,line:axis==='H'?Math.floor(from/7):from%7};
   const preview=phaseMoves(b,plan).find(m=>m.from===from);
   assert.deepEqual(preview.path,path);assert.equal(preview.hole,path[index]);
   g.capturePresentation=true;g.presentation=[];disrupt(g,e,plan);
   assert.equal(b.destroyed.length,2);assert.equal(b.grid.flat().length,0);assert.equal(b.shields.length,0);
   const fall=g.presentation.find(f=>f.kind==='holeFall');assert.equal(fall.slot,path[index]);assert.equal(fall.step,index+1);
   const steps=g.presentation.filter(f=>f.kind==='phaseShift');assert.equal(steps.length,2);
   if(index===0)assert.equal(steps[1].moves.length,0);
   assert.ok(b.corruptions[path[index]]);
  }
 }
});
test('two selected lines move simultaneously without losing neighbors; untouched line stays put',()=>{
 const {g,b,e,put}=arena();const a=put(0),c=put(1),d=put(14),safe=put(7);
 const plan={axis:'H',line:0,lines:[0,2]};disrupt(g,e,plan);
 assert.equal(b.grid[2][0].uid,a.uid);assert.equal(b.grid[3][0].uid,c.uid);
 assert.equal(b.grid[16][0].uid,d.uid);assert.equal(b.grid[7][0].uid,safe.uid);
});
test('Hypnosis only compels final landing, not transit; legacy single-line warning stays single',()=>{
 const {g,b,e,put}=arena();const a=put(0),safe=put(14);
 b.corruptions[1]={kind:'hypnosis',source:e.uid};e.cycle=2;
 e.phasePlan={cycle:2,axis:'H',line:0};
 assert.deepEqual(phasePlan(b,e,'H'),e.phasePlan);
 disrupt(g,e,e.phasePlan);assert.equal(a.used,0);assert.equal(b.grid[2][0].uid,a.uid);
 assert.equal(b.grid[14][0].uid,safe.uid);
});
test('staggered H and V wrap neighboring lines and move exactly one, two and three spaces',()=>{
 for(const axis of ['H','V']){
  const {g,b,e,put}=arena();
  const center=put(0),neighbor=put(axis==='H'?7:1),wrapped=put(axis==='H'?35:6);
  put(0,'plasma');e.cycle=axis==='H'?2:4;
  const plan=phasePlan(b,e,axis);
  assert.deepEqual(plan.shifts.map(s=>s.line),[axis==='H'?5:6,0,1]);
  const preview=phaseMoves(b,plan);
  assert.equal(preview.find(m=>m.from===0).distance,2);
  disrupt(g,e,plan);
  assert.equal(b.grid[axis==='H'?2:14][0].uid,center.uid);
  assert.equal(b.grid[axis==='H'?10:22][0].uid,neighbor.uid);
  assert.equal(b.grid[axis==='H'?36:13][0].uid,wrapped.uid);
 }
});
test('third-step Hole destroys the lower/right shifted Construct and stops there',()=>{
 for(const axis of ['H','V']){
  const {g,b,e,put}=arena();put(0);put(0,'plasma');const start=axis==='H'?7:1;
  put(start);const hole=axis==='H'?10:22;b.corruptions[hole]={kind:'hole'};
  const plan=phasePlan(b,e,axis);g.capturePresentation=true;g.presentation=[];disrupt(g,e,plan);
  assert.equal(b.destroyed.length,1);
  assert.equal(g.presentation.find(f=>f.kind==='holeFall').step,3);
  assert.equal(g.presentation.find(f=>f.kind==='holeFall').slot,hole);
 }
});
