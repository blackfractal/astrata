import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';

test('Hive opens with eight seeded mixed-element Larvae across all lanes, before any enemy movement',()=>{
 const layouts=new Set();
 for(let seed=1;seed<=30;seed++){
  const g=new Game(seed);g.s.stratum=3;
  g.beginBattle([{uid:900,enemy:'mindHive',restless:0}],{enemyFirst:true});
  const b=g.s.battle,bugs=b.ideons;
  assert.equal(b.turn,1);assert.equal(b.phase,'place');assert.equal(b.enemyFirst,false);
  assert.equal(bugs.length,8);assert.equal(new Set(bugs.map(e=>e.slot)).size,8);
  assert.ok(bugs.every(e=>e.slot%7>=4&&e.age===0&&!b.grid[e.slot].length));
  assert.equal(new Set(bugs.map(e=>e.element)).size,7);
  assert.ok(bugs.every(e=>e.kind==='larva'&&e.hp===16&&e.damage===18&&!e.turnDamage));
  for(let row=0;row<6;row++)assert.ok([1,2].includes(bugs.filter(e=>Math.floor(e.slot/7)===row).length));
  const clone=new Game(0,structuredClone(g.save()));
  assert.deepEqual(clone.s.battle.ideons,bugs); // Continue must not add another opening wave.
  layouts.add(JSON.stringify(bugs.map(e=>[e.slot,e.element])));
 }
 assert.ok(layouts.size>20);
});

test('Opening swarm moves only after the player ends their first turn',()=>{
 const g=new Game(762);g.beginBattle([{uid:900,enemy:'mindHive',restless:0}]);
 const slots=g.s.battle.ideons.map(e=>e.slot);g.endTurn();
 assert.equal(g.s.battle.turn,2);
 assert.ok(g.s.battle.ideons.every(e=>e.age===1));
 assert.ok(g.s.battle.ideons.some((e,i)=>e.slot!==slots[i]));
 assert.equal(Object.values(g.s.battle.corruptions).filter(q=>q.kind==='egg').length,1);
});

test('Hive opening grows once per elapsed Field round, independently of Restless and player steps',()=>{
 for(const age of [0,1,2,3,5,8]){
  const g=new Game(482);g.s.stratum=3;g.s.field.round=16+age;g.s.field.moves=1;
  const owner={uid:900,enemy:'mindHive',born:16,restless:4};
  const rng=g.s.rng;
  assert.equal(g.fieldEnemyPreview(owner).openingLarvae,8+age);
  assert.equal(g.s.rng,rng);
  g.beginBattle([owner],{enemyFirst:true});
  const b=g.s.battle;
  assert.equal(b.ideons.length,8+age);
  assert.ok(b.ideons.every(e=>e.kind==='larva'&&e.slot%7>=4));
  assert.equal(new Set(b.ideons.map(e=>e.slot)).size,8+age);
  assert.equal(b.enemyFirst,false);
  const loaded=new Game(0,structuredClone(g.save()));
  assert.deepEqual(loaded.s.battle.ideons,b.ideons);
  const repeated=new Game(482);repeated.s.stratum=3;repeated.s.field.round=16+age;repeated.s.field.moves=1;
  repeated.beginBattle([owner],{enemyFirst:true});
  assert.deepEqual(repeated.s.battle.ideons,b.ideons);
 }
});

test('Hive age bonus respects opening cards and available enemy-side spaces',()=>{
 const g=new Game(47);g.s.field.round=100;
 g.s.deck=Array.from({length:42},(_,i)=>({uid:1000+i,id:'rite',upgrade:0}));
 g.beginBattle([{uid:900,enemy:'mindHive',born:16,restless:0}]);
 assert.equal(g.s.battle.grid.flat().length,42);
 assert.equal(g.s.battle.ideons.length,0);
 const empty=new Game(47);empty.s.field.round=100;
 empty.beginBattle([{uid:900,enemy:'mindHive',born:16,restless:0}]);
 assert.equal(empty.s.battle.ideons.length,18);
});

test('Missing or future birth data does not invent a Hive age bonus; loading does not retrofit Larvae',()=>{
 for(const born of [undefined,30]){
  const g=new Game(80);g.s.field.round=20;
  const owner={uid:900,enemy:'mindHive',born,restless:7};
  assert.equal(g.fieldEnemyPreview(owner).openingLarvae,8);
  g.beginBattle([owner]);assert.equal(g.s.battle.ideons.length,8);
  g.s.field.round+=5;
  assert.equal(new Game(0,structuredClone(g.save())).s.battle.ideons.length,8);
 }
});
