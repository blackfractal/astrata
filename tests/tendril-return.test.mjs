import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {spawnIdeon,settleIdeons,depthsJob} from '../src/ideons.mjs';
const arena=()=>{const g=new Game(731);g.s.stratum=3;g.s.equipment={};
  g.beginBattle([{uid:900,enemy:'cnidarian',restless:0}]);delete g.s.checkpoint;
  const b=g.s.battle;b.ideons=[];b.grid=Array.from({length:42},()=>[]);b.jobs=[];
  return g;};
const put=(g,id,i)=>{const c=g.instance(g.newCard(id));g.s.battle.grid[i].push(c);return c;};
const kill=(g,i=17)=>{const b=g.s.battle,c=put(g,'blast',i),e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:20});
  g.damageEnemy(e,100,'Arcane',{card:c.uid});settleIdeons(g);return c;};
const returns=g=>depthsJob(g,{kind:'tentacleReplace',owner:g.s.battle.enemies[0].uid});

test('Kill warns its source immediately, skips the current enemy turn and destroys the whole Construct on return',()=>{
  const g=arena(),b=g.s.battle,c=kill(g),meld=g.instance(g.newCard('heat'));
  meld.attachedTo=c.uid;b.grid[17].unshift(meld);b.shields=[{slot:17,value:3}];
  assert.deepEqual(b.tendrilReturns,[{owner:b.enemies[0].uid,slot:17,due:b.turn+1}]);
  returns(g);assert.equal(b.ideons.length,0);assert.equal(b.grid[17].length,2);
  b.turn++;returns(g);assert.equal(b.tendrilReturns.length,0);assert.equal(b.grid[17].length,0);
  assert.deepEqual(b.destroyed.slice(-2).map(c=>c.uid),[meld.uid,c.uid]);
  assert.equal(b.shields.length,0);assert.equal(b.ideons[0].slot,17);assert.equal(b.ideons[0].age,0);
  assert.equal(b.ideons[0].hp,18);assert.equal(b.jobs.length,0);
});

test('Recall/movement cannot redirect warning; Continue preserves its countdown and a different occupant is destroyed',()=>{
  const g=arena(),b=g.s.battle,c=kill(g);b.grid[1]=b.grid[17];b.grid[17]=[];
  const replacement=put(g,'ward',17);b.turn++;
  const loaded=new Game(0,structuredClone(g.s));assert.deepEqual(loaded.s.battle.tendrilReturns,b.tendrilReturns);
  returns(loaded);assert.equal(loaded.s.battle.grid[1][0].uid,c.uid);
  assert.ok(loaded.s.battle.destroyed.some(c=>c.uid===replacement.uid));
  assert.equal(loaded.s.battle.ideons[0].slot,17);
});

test('Clearing the warning saves the card, while the return still occupies the original space',()=>{
  const g=arena(),b=g.s.battle,c=kill(g);b.discard.push(...b.grid[17]);b.grid[17]=[];
  b.turn++;returns(g);assert.ok(b.discard.some(x=>x.uid===c.uid));assert.equal(b.ideons[0].slot,17);
});

test('Multiplying returns warn distinct nearest spaces, including simultaneous kills by one source',()=>{
  const g=arena(),b=g.s.battle; b.enemies[0].tentacleKills=3;const c=kill(g);
  assert.deepEqual(b.tendrilReturns.map(q=>q.slot),[17,10]);
  const e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:27});
  g.damageEnemy(e,100,'Arcane',{card:c.uid});settleIdeons(g);
  assert.deepEqual(b.tendrilReturns.map(q=>q.slot),[17,10,16,18]);
  b.turn++;returns(g);assert.equal(b.ideons.length,4);
});

test('Owner death cancels returns; a Hole or Ideon on a warned space prevents eruption',()=>{
  for(const obstruction of ['owner','hole','ideon']) {
    const g=arena(),b=g.s.battle,c=kill(g);
    if(obstruction==='owner'){b.enemies[0].hp=0;settleIdeons(g);assert.equal(b.tendrilReturns.length,0);}
    if(obstruction==='hole')b.corruptions[17]={kind:'hole'};
    if(obstruction==='ideon'){b.grid[17]=[];spawnIdeon(g,b.enemies[0],'tentacle',{slot:17});b.grid[17]=[c];}
    b.turn++;returns(g);assert.equal(b.grid[17][0].uid,c.uid);assert.equal(b.tendrilReturns.length,0);
  }
});

test('Non-card kills fall back to the dead tendril space; old pending counts receive a warning instead of immediate spawning',()=>{
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:20});
  g.damageEnemy(e,100,'Arcane',{},123);settleIdeons(g);assert.equal(b.tendrilReturns[0].slot,20);
  b.enemies[0].pendingTentacles=2;returns(g);assert.equal(b.ideons.length,0);
  assert.equal(b.tendrilReturns.length,3);assert.ok(b.tendrilReturns.every(q=>q.due===b.turn+1));
});

test('Status kills use the applying card space and receive the same full-turn reprieve',()=>{
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:20});
  put(g,'rot',9);g.applyEnemyStatus(e,'corrode',100,9);
  b.jobs=[{kind:'enemyStatus',uid:e.uid,status:'corrode',damage:100}];g.pump();
  assert.equal(b.tendrilReturns[0].slot,9);assert.equal(b.tendrilReturns[0].due,b.turn+1);
});
