import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { spawnIdeon, commandIdeon, layMindEggs, hatchMindEgg } from '../src/ideons.mjs';
const arena=()=>{
 const g=new Game(820);g.s.stratum=3;g.s.equipment={};g.beginBattle([{uid:900,enemy:'mindHive',restless:0}]);
 delete g.s.checkpoint;g.s.battle.ideons=[];g.presentation=[];return g;
};
test('Drone stays put and attacks 6,12,18,24,30 of its own element across save/load',()=>{
 let g=arena();g.s.hp=200;const e=spawnIdeon(g,g.s.battle.enemies[0],'drone',{slot:20,element:'Fire'}),uid=e.uid;
 assert.equal(e.hp,50);
 for(const damage of [6,12,18,24,30]){
  commandIdeon(g,uid);const j=g.s.battle.jobs[0];assert.equal(j.damage,damage);assert.equal(j.element,'Fire');assert.equal(j.gridSourceSlot,20);
  g.pump();assert.equal(g.s.battle.ideons[0].slot,20);
  g=new Game(0,structuredClone(g.s));delete g.s.checkpoint;
 }
 assert.equal(g.s.hp,110);
});
test('Every fourth newly laid egg contains a Drone, but the opening swarm contains none',()=>{
 const g=new Game(820);g.beginBattle([{uid:900,enemy:'mindHive',restless:0}]);
 const b=g.s.battle,o=b.enemies[0];assert.equal(b.ideons.length,8);assert.ok(b.ideons.every(e=>e.kind!=='drone'));b.ideons=[];
 const kinds=[];for(let n=0;n<8;n++){b.corruptions={};layMindEggs(g,o);kinds.push(Object.values(b.corruptions)[0].insect);}
 assert.deepEqual(kinds,['burrower','runner','burrower','drone','runner','burrower','runner','drone']);
 const q=Object.values(b.corruptions)[0],slot=Number(Object.keys(b.corruptions)[0]);b.turn++;
 b.grid[slot]=[g.instance(g.newCard('blast'))];hatchMindEgg(g,o,slot,q.uid);
 const drone=b.ideons[0];assert.equal(drone.kind,'drone');assert.equal(drone.age,0);assert.equal(drone.element,q.element);assert.equal(drone.hp,50);assert.equal(b.jobs.length,0);
 commandIdeon(g,drone.uid);assert.equal(b.jobs[0].damage,6);
});
test('Hive final command precedes one grouped death frame with the emptied battle still visible',()=>{
 const g=arena(),b=g.s.battle,o=b.enemies[0];o.hp=1;g.capturePresentation=true;
 spawnIdeon(g,o,'drone',{slot:20});spawnIdeon(g,o,'runner',{slot:6});g.presentation=[];
 g.endTurn();
 assert.equal(g.s.mode,'reward');assert.equal(g.s.hp,63); // Drone 6 + Skitter 1 before victory.
 const death=g.presentation.filter(f=>f.kind==='hiveDeath');assert.equal(death.length,1);assert.equal(death[0].insects.length,2);
 assert.equal(death[0].state.mode,'battle');assert.equal(death[0].state.battle.enemies.length,0);assert.equal(death[0].state.battle.ideons.length,0);
 assert.ok(!g.presentation.some(f=>f.kind==='hit'&&f.dead&&death[0].insects.includes(f.uid)));
 assert.ok(g.presentation.findIndex(f=>f.kind==='incoming')<g.presentation.findIndex(f=>f.kind==='hiveDeath'));
});
test('A lethal final Drone command kills the player before Hive victory or death animation',()=>{
 const g=arena(),b=g.s.battle,o=b.enemies[0];o.hp=1;g.s.hp=4;g.capturePresentation=true;spawnIdeon(g,o,'drone',{slot:20});g.presentation=[];
 g.endTurn();assert.equal(g.s.outcome,'loss');assert.equal(o.hp,1);assert.ok(!g.presentation.some(f=>f.kind==='hiveDeath'));
});
