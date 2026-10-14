import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { spawnIdeon, commandIdeon, scheduleDepths } from '../src/ideons.mjs';
const arena=()=>{
 const g=new Game(731);g.s.stratum=3;g.s.equipment={};g.beginBattle([{uid:900,enemy:'mindHive',restless:0}]);
 delete g.s.checkpoint;g.s.battle.ideons=[];g.presentation=[];return g;
};
const straightLane=b=>{for(let i=7;i<14;i++)b.corruptions[i]={kind:'hole'};};

test('Rear-first creation order cannot prevent the whole insect queue advancing left',()=>{
 const g=arena(),b=g.s.battle,o=b.enemies[0];
 straightLane(b);
 const back=spawnIdeon(g,o,'runner',{slot:6}),middle=spawnIdeon(g,o,'burrower',{slot:5}),front=spawnIdeon(g,o,'runner',{slot:4});
 const host=g.instance(g.newCard('ward')),meld=g.instance(g.newCard('magnify'));meld.attachedTo=host.uid;
 b.grid[3]=[meld,host];b.shields=[{slot:3,value:7}];
 scheduleDepths(g,o,{commandIdeons:true});g.pump();
 assert.deepEqual([front.slot,middle.slot,back.slot],[3,4,5]);
 assert.deepEqual(b.grid[6].map(c=>c.uid),[meld.uid,host.uid]);
 assert.equal(b.shields[0].slot,6);assert.ok(b.ideons.every(e=>e.age===1));
 assert.ok(b.grid.slice(3,6).every(s=>!s.length));
});

test('Command ordering is column first, then row, and limited to the commanded owner',()=>{
 const g=arena(),b=g.s.battle,o=b.enemies[0];
 const lower=spawnIdeon(g,o,'runner',{slot:11}),right=spawnIdeon(g,o,'runner',{slot:6}),upper=spawnIdeon(g,o,'runner',{slot:4});
 spawnIdeon(g,{...o,uid:901},'runner',{slot:0});
 scheduleDepths(g,o,{commandIdeons:true});
 assert.deepEqual(b.jobs.map(j=>j.uid),[upper.uid,lower.uid,right.uid]);
});

test('Both insects swap whole Constructs but cannot cross another Ideon or Memory Hole',()=>{
 for(const kind of ['runner','burrower']){
  const g=arena(),b=g.s.battle,o=b.enemies[0],e=spawnIdeon(g,o,kind,{slot:6});
  straightLane(b);
  const card=g.instance(g.newCard('shield'));b.grid[5]=[card];b.shields=[{slot:5,value:4}];
  commandIdeon(g,e.uid);assert.equal(e.slot,5);assert.equal(b.grid[6][0].uid,card.uid);assert.equal(b.shields[0].slot,6);
  spawnIdeon(g,o,'runner',{slot:4});commandIdeon(g,e.uid);assert.equal(e.slot,5);
  b.ideons=b.ideons.filter(x=>x.uid===e.uid);b.corruptions[4]={kind:'hole'};
  commandIdeon(g,e.uid);assert.equal(e.slot,5);
 }
});

test('Swapped player cards still land on the original-space Hypnosis corruption',()=>{
 const g=arena(),b=g.s.battle,o=b.enemies[0],e=spawnIdeon(g,o,'runner',{slot:6});
 straightLane(b);
 const c=g.instance(g.newCard('blast'));b.grid[5]=[c];b.corruptions[6]={kind:'hypnosis',source:o.uid};
 commandIdeon(g,e.uid);
 assert.equal(e.slot,5);assert.equal(b.grid[6][0].uid,c.uid);assert.equal(c.used,1);
 assert.equal(b.corruptions[6].kind,'hypnosis');assert.equal(b.corruptions[5],undefined);
});

test('Old saved Skitters gain swapping without resetting their HP, element, age or position',()=>{
 const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'runner',{slot:6,element:'Water'});
 straightLane(b);
 delete e.swap;e.text='Old stopped-by-cards description';e.hp=3;e.age=4;
 b.grid[5]=[g.instance(g.newCard('blast'))];g.s.version={...g.s.version,rules:'3.0.7'};
 g.s.checkpoint=structuredClone(g.s);
 const loaded=new Game(0,structuredClone(g.s)),bug=loaded.s.battle.ideons[0];
 assert.equal(bug.swap,true);assert.match(bug.text,/swapping/);
 assert.deepEqual([bug.hp,bug.element,bug.age,bug.slot],[3,'Water',4,6]);
 assert.equal(loaded.s.checkpoint.battle.ideons[0].swap,true);
 commandIdeon(loaded,bug.uid);assert.equal(bug.slot,5);
});

test('Skitters use every legal westward direction with seeded replay and diagonal Construct swaps',()=>{
 const seen=new Set();
 for(let seed=1;seed<=30;seed++){
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'runner',{slot:20});
  // Advance the game's persisted RNG by a seed-dependent amount.
  for(let n=0;n<seed;n++)g.rand();
  for(const slot of [12,19,26])b.grid[slot]=[g.instance(g.newCard('ward'))];
  const clone=new Game(0,structuredClone(g.s));
  commandIdeon(g,e.uid);commandIdeon(clone,e.uid);
  assert.deepEqual(clone.s.battle.ideons,b.ideons);assert.deepEqual(clone.s.battle.grid,b.grid);
  assert.ok([12,19,26].includes(e.slot));assert.equal(b.grid[20][0].id,'ward');assert.equal(b.grid[e.slot].length,0);
  seen.add(e.slot);
 }
 assert.equal(seen.size,3);
});

test('Skitters take the only legal diagonal; Burrowers remain blocked instead of changing lanes',()=>{
 for(const kind of ['runner','burrower']){
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],kind,{slot:20});
  b.corruptions[19]={kind:'hole'};spawnIdeon(g,b.enemies[0],'runner',{slot:12});
  b.grid[26]=[g.instance(g.newCard('shield'))];
  commandIdeon(g,e.uid);assert.equal(e.slot,kind==='runner'?26:20);
 }
});

test('Skitter diagonals never wrap across the top or bottom edge',()=>{
 for(const from of [6,41])for(let n=0;n<10;n++){
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'runner',{slot:from});
  for(let i=0;i<n;i++)g.rand();commandIdeon(g,e.uid);
  assert.ok((from===6?[5,12]:[33,40]).includes(e.slot));
 }
});
