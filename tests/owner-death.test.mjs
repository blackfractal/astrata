import test from 'node:test';import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';import {spawnIdeon,settleIdeons} from '../src/ideons.mjs';
test('S3 boss death groups surviving owned Ideons after its killing hit, once, and preserves other owners',()=>{
 for(const boss of ['cnidarian','refractionCannon']){
  const g=new Game(731);g.s.stratum=3;g.beginBattle([{uid:900,enemy:boss,restless:0}]);delete g.s.checkpoint;
  const b=g.s.battle;b.ideons=[];b.grid=Array.from({length:42},()=>[]);b.phase='activate';b.channel=3;b.enemies[0].hp=1;
  b.enemies.push({...b.enemies[0],uid:901,hp:100});
  const children=[spawnIdeon(g,b.enemies[0],'bullet',{slot:6}),spawnIdeon(g,b.enemies[0],'bullet',{slot:13})];
  const other=spawnIdeon(g,b.enemies[1],'bullet',{slot:20});b.tendrilReturns=[{owner:900,slot:4,due:2}];
  b.grid[0]=[g.instance(g.newCard('blast'))];g.capturePresentation=true;g.presentation=[];
  g.act(g.legal().find(a=>a.type==='activate'&&a.slot===0&&a.target===900));
  const frames=g.presentation.filter(f=>f.kind==='ownerDeath');assert.equal(frames.length,1);
  assert.deepEqual(frames[0].children.map(e=>e.uid),children.map(e=>e.uid));assert.equal(frames[0].state.battle.tendrilReturns.length,0);
  assert.ok(g.presentation.findIndex(f=>f.kind==='hit'&&f.uid===900)<g.presentation.findIndex(f=>f.kind==='ownerDeath'));
  assert.ok(!g.presentation.some(f=>f.kind==='hit'&&children.some(e=>e.uid===f.uid)));
  assert.deepEqual(b.ideons.map(e=>e.uid),[other.uid]);assert.equal(b.enemies[0].pendingTentacles,undefined);
  settleIdeons(g);assert.equal(g.presentation.filter(f=>f.kind==='ownerDeath').length,1);
 }
});
test('Owner death presents even without surviving Ideons and does not delay reward mechanics',()=>{
 const g=new Game(731);g.s.stratum=3;g.beginBattle([{uid:900,enemy:'refractionCannon',restless:0}]);delete g.s.checkpoint;
 const b=g.s.battle;b.ideons=[];b.enemies[0].hp=0;g.capturePresentation=true;g.presentation=[];g.checkBattle();
 assert.equal(g.s.mode,'reward');assert.deepEqual(g.presentation.find(f=>f.kind==='ownerDeath').children,[]);
});
