import test from 'node:test';import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
function arena(){const g=new Game(731);g.s.stratum=3;g.s.equipment={};g.s.hp=g.s.maxHp=10000;
 g.beginBattle([{uid:900,enemy:'refractionCannon',restless:0}]);delete g.s.checkpoint;
 g.s.battle.grid=Array.from({length:42},()=>[]);g.s.battle.enemies[0].cannonTurns=3;
 g.capturePresentation=true;g.presentation=[];return g;}
test('charging lays two distinct empty-space mines with a full response turn, then 20+20 Fire before 40 Final Blast',()=>{
 const g=arena(),b=g.s.battle;b.grid[0]=[g.instance(g.newCard('blast'))];
 assert.match(g.tell(b.enemies[0]).name,/2 Mind Mines/);g.endTurn();
 const mines=Object.entries(b.corruptions);assert.equal(mines.length,2);
 for(const [i,q]of mines){assert.notEqual(Number(i),0);assert.equal(q.createdTurn,b.turn-1);assert.equal(q.damage,20);assert.equal(q.element,'Fire');}
 assert.match(g.tell(b.enemies[0]).name,/Mines detonate, then Final Blast/);
 const hp=g.s.hp;g.presentation=[];g.endTurn();
 assert.equal(hp-g.s.hp,80);assert.equal(Object.keys(b.corruptions).length,0);
 const hits=g.presentation.filter(f=>f.kind==='incoming');assert.deepEqual(hits.map(f=>f.amount),[20,20,40]);
 assert.deepEqual(hits.slice(0,2).map(f=>f.element),['Fire','Fire']);
 assert.equal(g.presentation.filter(f=>f.kind==='mineExplosion').length,2);
});
test('mine covers are destroyed before Final Blast can select them as defenses',()=>{
 const g=arena(),b=g.s.battle;g.endTurn();
 for(const i of Object.keys(b.corruptions)){const c=g.instance(g.newCard('ward'));c.ward=40;b.grid[i]=[c];}
 const hp=g.s.hp;g.presentation=[];g.endTurn();
 assert.equal(hp-g.s.hp,40);assert.equal(b.grid.flat().length,0);
 const frames=g.presentation;assert.equal(frames.filter(f=>f.kind==='mineExplosion'&&f.covered).length,2);
 assert.ok(frames.findLastIndex(f=>f.kind==='mineExplosion')<frames.findIndex(f=>f.kind==='incoming'));
});
test('Cannon mines respect occupied player/Ideon/corruption spaces and never overwrite a full grid',()=>{
 const g=arena(),b=g.s.battle;
 for(let i=0;i<42;i++)b.grid[i]=[g.instance(g.newCard('focus'))];
 b.grid[1]=[];b.corruptions[1]={kind:'hole',source:999};
 const old=structuredClone(b.corruptions);g.endTurn();assert.deepEqual(b.corruptions,old);
 assert.equal(b.enemies[0].cannonTurns,4);assert.ok(b.enemies[0].finalBlastElement);
});
test('defused mines stay absent across Continue and do not detonate with Final Blast',()=>{
 const g=arena(),b=g.s.battle;g.endTurn();const slots=Object.keys(b.corruptions);
 // Use the real Machine Elves repair action on both adjacent mines separately.
 for(const slot of slots){b.focus=10;b.channel=10;b.phase='activate';
  b.grid[slot]=[g.instance(g.newCard('elves'))];
  const a=g.legal().find(a=>a.type==='activate'&&a.slot===Number(slot));assert.ok(a);g.act(a);
 }
 assert.equal(Object.keys(b.corruptions).length,0);
 const resumed=new Game(0,structuredClone(g.s));resumed.s.battle.grid=Array.from({length:42},()=>[]);
 const hp=resumed.s.hp;resumed.endTurn();assert.equal(hp-resumed.s.hp,40);
});
