import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {bilePlan,bileMoves,resolveBile,refreshBossPlans} from '../src/loom-bosses.mjs';

function setup() {
  const g=new Game(291);g.s.stratum=2;
  g.beginBattle([{uid:g.uid(),enemy:'blackBile',restless:0}]);
  g.s.battle.grid=Array.from({length:42},()=>[]);
  const put=(id,i)=>{const c=g.instance(g.newCard(id));g.s.battle.grid[i]=[c];return c;};
  return {g,b:g.s.battle,e:g.s.battle.enemies[0],put};
}
test('targeted Bile values current fire-row synergy and never duplicates ordinary destinations',()=>{
  const {g,e,put}=setup();put('shield',41);put('plasma',0);const ignis=put('ignis',14);
  for(let i=15;i<21;i++)put('corner',i);
  assert.ok(g.cardPower(ignis,14)>16);
  assert.deepEqual(bilePlan(g,e),{from:null,to:20,targeted:[14]});
  ignis.used=99;
  assert.deepEqual(bilePlan(g,e).targeted,[0]);
  e.cycle=4;const p=bilePlan(g,e),dest=bileMoves(p).map(x=>x.to);
  assert.equal(p.targeted.length,2);assert.equal(new Set(dest).size,dest.length);
});
test('a spreading glob and independent targeted throw both resolve and survive Continue',()=>{
  const {g,b,e,put}=setup();put('shield',6);const shield=put('shield',13),plasma=put('plasma',0);
  b.biles={6:{kind:'bile',uid:g.uid(),source:e.uid}};
  refreshBossPlans(g);
  assert.deepEqual(e.bilePlan,{from:6,to:13,targeted:[0]});
  const loaded=new Game(0,structuredClone(g.s));
  assert.deepEqual(loaded.s.battle.enemies[0].bilePlan,e.bilePlan);
  resolveBile(g,e);
  assert.equal(shield.used,1);assert.equal(plasma.used,1);
  assert.ok(!b.biles[6]&&b.biles[13]&&b.biles[0]);
});
test('left-edge Poison does not suppress independent throws, including Purify rounds',()=>{
  const {g,b,e,put}=setup();put('shield',0);const p=put('plasma',20);
  b.biles={0:{kind:'bile',uid:g.uid(),source:e.uid}};e.purifyPending=true;
  assert.deepEqual(bilePlan(g,e),{from:0,to:'player',targeted:[20]});
  g.endTurn();
  assert.equal(g.s.status.poison,2);assert.equal(p.used,1);assert.ok(b.biles[20]);
});
test('ties prefer rightmost then topmost; no eligible damage means no extra throw',()=>{
  const {g,b,e,put}=setup();put('shield',41);put('blast',1);put('blast',5);put('blast',12);
  assert.deepEqual(bilePlan(g,e).targeted,[5]);
  b.grid[5]=[];assert.deepEqual(bilePlan(g,e).targeted,[12]);
  b.grid[12]=[];b.grid[1][0].used=99;assert.equal(bilePlan(g,e).targeted,undefined);
});
test('new attack cycle uses final S2 values, adds two per cycle and retains half-health pressure',()=>{
  const {g,e}=setup();
  const values=[18,22,[16,12],20];
  for(let i=0;i<4;i++){e.cycle=i;const t=g.tell(e);assert.deepEqual(t.sequence?.map(x=>x.damage)??t.damage,values[i]);}
  e.cycle=4;e.hp=e.maxHp/2;assert.equal(g.tell(e).damage,23);
});
