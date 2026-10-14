import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {spawnIdeon,commandIdeon,hatchMindEgg} from '../src/ideons.mjs';
const arena=()=>{const g=new Game(843);g.s.stratum=3;g.s.equipment={};g.beginBattle([{uid:900,enemy:'mindHive',restless:0}]);delete g.s.checkpoint;g.s.battle.ideons=[];return g;};

test('Larva moves and swaps silently, then makes one heavy exit attack and disappears',()=>{
 const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'larva',{slot:2,element:'Water'});
 const c=g.instance(g.newCard('shield'));b.grid[1]=[c];
 commandIdeon(g,e.uid);assert.equal(e.slot,1);assert.equal(b.grid[2][0].uid,c.uid);assert.equal(b.jobs.length,0);
 commandIdeon(g,e.uid);assert.equal(e.slot,0);assert.equal(b.jobs.length,0);
 commandIdeon(g,e.uid);assert.equal(e.hp,0);assert.equal(e.removed,true);
 assert.deepEqual(b.jobs.map(j=>[j.damage,j.element,j.gridSourceSlot]),[[18,'Water',0]]);
 commandIdeon(g,e.uid);assert.equal(b.jobs.length,1);
});

test('Hatched crawlers attack once after moving and still attack when movement is blocked',()=>{
 for(const kind of ['runner','burrower']){
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],kind,{slot:6,element:'Fire'});
  for(let i=7;i<14;i++)b.corruptions[i]={kind:'hole'};
  commandIdeon(g,e.uid);assert.equal(e.slot,5);assert.equal(b.jobs[0].damage,1);assert.equal(b.jobs[0].gridSourceSlot,5);
  b.jobs=[];b.corruptions[4]={kind:'hole'};commandIdeon(g,e.uid);
  assert.equal(e.slot,5);assert.equal(b.jobs.length,1);assert.equal(b.jobs[0].damage,1);
  b.jobs=[];e.slot=0;commandIdeon(g,e.uid);
  assert.equal(b.jobs.length,1);assert.equal(b.jobs[0].damage,kind==='runner'?9:12);assert.equal(e.removed,true);
 }
});

test('Covered hatches spawn mature insects without an immediate chip attack',()=>{
 const g=arena(),b=g.s.battle,o=b.enemies[0];b.grid[6]=[g.instance(g.newCard('shield'))];
 b.corruptions[6]={kind:'egg',uid:555,source:o.uid,createdTurn:0,element:'Earth',damage:8,insect:'burrower'};
 hatchMindEgg(g,o,6,555);assert.equal(b.jobs.length,0);assert.equal(b.ideons[0].kind,'burrower');assert.equal(b.ideons[0].age,0);
 commandIdeon(g,b.ideons[0].uid);assert.equal(b.jobs[0].damage,1);
});

test('Old opening insects migrate to Larvae without restoring HP or adding insects; hatched insects stay mature',()=>{
 const g=arena(),b=g.s.battle,o=b.enemies[0];delete b.hiveLarvaOpening;
 const opening=spawnIdeon(g,o,'runner',{slot:3,element:'Chaos'});opening.hp=4;opening.age=5;
 b.turn=3;const hatched=spawnIdeon(g,o,'burrower',{slot:6});delete hatched.turnDamage;
 const loaded=new Game(0,structuredClone(g.s)),[a,z]=loaded.s.battle.ideons;
 assert.deepEqual([a.kind,a.hp,a.maxHp,a.age,a.slot,a.element,a.damage,a.turnDamage],['larva',4,10,5,3,'Chaos',18,0]);
 assert.equal(z.kind,'burrower');assert.equal(z.turnDamage,1);assert.equal(loaded.s.battle.ideons.length,2);
 const twice=new Game(0,structuredClone(loaded.s));assert.deepEqual(twice.s.battle.ideons,loaded.s.battle.ideons);
});
