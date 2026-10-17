import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {spawnIdeon,commandIdeon} from '../src/ideons.mjs';
function fixture(slot){const g=new Game(731);g.s.stratum=3;g.beginBattle([{uid:900,enemy:'refractionCannon',restless:0}]);delete g.s.checkpoint;
 const b=g.s.battle;b.ideons=[];b.grid=Array.from({length:42},()=>[]);b.jobs=[];
 const e=spawnIdeon(g,b.enemies[0],'bullet',{slot,element:'Fire',field:'element'});g.capturePresentation=true;g.presentation=[];return {g,b,e};}
test('Cannon two-space move presents both individual steps without applying intermediate field or collision rules',()=>{
 const {g,b,e}=fixture(27);b.corruptions[26]={kind:'hole'};
 const c=g.instance(g.newCard('blast'));b.grid[26]=[c];const grid=structuredClone(b.grid);
 commandIdeon(g,e.uid);assert.equal(e.slot,25);assert.equal(e.age,1);assert.deepEqual(b.grid,grid);assert.equal(b.jobs.length,0);
 assert.equal(g.presentation.length,1);assert.equal(g.presentation[0].kind,'ideonTravel');assert.deepEqual(g.presentation[0].path,[26,25]);
 assert.equal(g.presentation[0].state.battle.ideons[0].slot,25);
});
test('Cannon exit from columns 1 and 2 disappears at column 1 then queues exactly one equipment-only Pierce attack',()=>{
 for(const slot of [21,22]){const {g,b,e}=fixture(slot);commandIdeon(g,e.uid);
  const frame=g.presentation[0];assert.equal(frame.kind,'ideonTravel');assert.equal(frame.exiting,true);assert.deepEqual(frame.path,slot===21?[]:[21]);
  assert.equal(frame.projectile.hp,18);assert.equal(e.hp,0);assert.equal(e.removed,true);assert.equal(b.jobs.length,1);
  assert.equal(b.jobs[0].damage,14);assert.equal(b.jobs[0].pierce,true);assert.equal(b.jobs[0].gridSourceSlot,21);
 }
});
test('Cannon odd/even paths retain their original command count and never deal damage before exit',()=>{
 for(const start of [5,6]){const {g,b,e}=fixture(start);const stops=[];
  while(e.hp>0){commandIdeon(g,e.uid);if(e.hp>0){stops.push(e.slot);assert.equal(b.jobs.length,0);}}
  assert.deepEqual(stops,start===5?[3,1]:[4,2,0]);assert.equal(b.jobs.length,1);
 }
});
