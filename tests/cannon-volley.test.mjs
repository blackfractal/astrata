import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {cannonVolley,spawnIdeon} from '../src/ideons.mjs';

function arena(completed=0) {
 const g=new Game(731);g.s.stratum=3;g.s.equipment={};g.s.hp=g.s.maxHp=10000;
 g.beginBattle([{uid:900,enemy:'refractionCannon',restless:0}]);delete g.s.checkpoint;
 const b=g.s.battle;b.grid=Array.from({length:42},()=>[]);b.hand=[];
 b.enemies[0].cannonTurns=completed;g.capturePresentation=true;g.presentation=[];
 return g;
}
test('Cannon has 300 base HP and switches to two simultaneous bullets after fifteen completed turns',()=>{
 for(const [completed,count] of [[0,1],[14,1],[15,2],[16,2],[29,2],[30,3],[45,4],[60,5],[75,5],[120,5]]) {
  const g=arena(completed),b=g.s.battle,e=b.enemies[0];
  assert.equal(e.hp,300);assert.equal(e.maxHp,300);
  const t=g.tell(e);assert.equal(t.cannonPlans.length,count);
  g.endTurn();assert.equal(b.ideons.length,count);
  assert.equal(new Set(b.ideons.map(i=>i.slot)).size,count);
  assert.ok(b.ideons.every(i=>i.age===0));
  if(count>1){
   assert.ok(t.name.includes(count+'/'+count+' bullets'));
   const frames=g.presentation.filter(f=>f.kind==='ideonVolley');assert.equal(frames.length,1);
   assert.equal(frames[0].bullets.length,count);assert.equal(frames[0].state.battle.ideons.length,count);
  }
 }
});
test('volley chooses two separated lanes even when the strongest target is in the middle',()=>{
 const g=arena(15),b=g.s.battle,e=b.enemies[0];
 b.grid[20]=[g.instance(g.newCard('grove'))];
 const plans=cannonVolley(g,e,{});assert.equal(plans.length,2);
 const [a,z]=plans.map(p=>p.slot);
 assert.ok(Math.abs(a%7-z%7)+Math.abs(Math.floor(a/7)-Math.floor(z/7))>4);
 const saved=JSON.stringify(g.s),t=g.tell(e);
 for(let n=0;n<4;n++)assert.deepEqual(g.tell(e),t);
 assert.equal(JSON.stringify(g.s),saved);
 const resumed=new Game(0,JSON.parse(saved));assert.deepEqual(resumed.tell(resumed.s.battle.enemies[0]),t);
});
test('blocked launch lanes withhold bullets without duplicating the ordinary attack',()=>{
 const g=arena(15),b=g.s.battle,e=b.enemies[0];
 for(let r=0;r<6;r++)for(const c of [5,6])if(r!==0||c!==6)b.corruptions[r*7+c]={kind:'hole'};
 assert.equal(g.tell(e).cannonPlans.length,1);
 const hp=g.s.hp;g.endTurn();assert.equal(b.ideons.length,1);assert.equal(hp-g.s.hp,14);
});
test('Final Blast still pauses all bullets and launches none after the volley threshold',()=>{
 const g=arena(19),b=g.s.battle,e=b.enemies[0];e.finalBlastElement='Fire';
 spawnIdeon(g,e,'bullet',{slot:6,field:'element',element:'Water'});
 spawnIdeon(g,e,'bullet',{slot:41,field:'element',element:'Earth'});
 const before=structuredClone(b.ideons),hp=g.s.hp;g.endTurn();
 assert.deepEqual(b.ideons,before);assert.equal(hp-g.s.hp,70);assert.equal(e.cannonTurns,20);
});
