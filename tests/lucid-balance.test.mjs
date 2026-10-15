import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,cardPower} from '../src/engine.mjs';
import {spawnIdeon} from '../src/ideons.mjs';
import {attackPreview} from '../src/combat-preview.mjs';
const arena=()=>{const g=new Game(731);g.s.stratum=3;g.s.equipment={};
  g.beginBattle([{uid:900,enemy:'cnidarian',restless:0}]);delete g.s.checkpoint;
  const b=g.s.battle;b.ideons=[];b.grid=Array.from({length:42},()=>[]);b.jobs=[];b.phase='activate';b.channel=10;
  return g;};
const put=(g,id,i)=>{const c=g.instance(g.newCard(id));g.s.battle.grid[i].push(c);return c;};
test('Needle diamond uses Manhattan distance including diagonals, edges and upgraded values; previews/legal effects match damage',()=>{
  for(const upgrade of [false,true])for(const [source,target,near] of [[17,3,true],[17,9,true],[17,19,true],[17,31,true],[17,2,false],[17,32,false],[6,7,false],[0,8,true]]){
    const g=arena(),b=g.s.battle,c=put(g,'lucidNeedle',source);c.upgrade=upgrade;
    const e=spawnIdeon(g,b.enemies[0],'drone',{slot:target});
    const expected=(near?15:8)+(upgrade?2:0);
    assert.equal(cardPower(b,c,source,e),expected);
    assert.equal(attackPreview(b,c,source,e).damage,expected);
    const a=g.legal().find(a=>a.type==='activate'&&a.slot===source&&a.target===e.uid);
    assert.equal(a.effects.damage,expected);g.act(a);assert.equal(e.hp,50-expected);
  }
});
test('Needle remains single-target, main enemies take eight/ten, and Nausea halves its near damage',()=>{
  for(const upgrade of [false,true]) {
    const g=arena(),b=g.s.battle,c=put(g,'lucidNeedle',6);c.upgrade=upgrade;
    const owner=b.enemies[0],before=owner.hp;
    g.act(g.legal().find(a=>a.type==='activate'&&a.slot===6&&a.target===owner.uid));
    assert.equal(before-owner.hp,upgrade?10:8);
  }
  const g=arena(),b=g.s.battle,c=put(g,'lucidNeedle',17);
  const e=spawnIdeon(g,b.enemies[0],'drone',{slot:19}),other=spawnIdeon(g,b.enemies[0],'drone',{slot:10});
  b.corruptions[17]={kind:'nausea'};
  const preview=attackPreview(b,c,17,e);assert.equal(preview.damage,7);
  g.act(g.legal().find(a=>a.type==='activate'&&a.slot===17&&a.target===e.uid));
  assert.equal(e.hp,43);assert.equal(other.hp,50);
});
test('Guide moves, kills an unguarded tentacle outright and warns its new location; existing costs/HP retained',()=>{
  const g=arena(),b=g.s.battle,c=put(g,'lucidGuide',0);
  const e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:2});
  assert.equal(c.hp,12);assert.equal(attackPreview(b,c,0,e).damage,18);
  const a=g.legal().find(a=>a.type==='activate'&&a.slot===0&&a.destination===1&&a.target===e.uid);
  assert.equal(a.effects.damage,18);assert.equal(a.costs.channel,1);g.act(a);
  assert.equal(e.hp,0);assert.equal(b.grid[1][0].uid,c.uid);assert.equal(c.used,1);
  assert.equal(b.tendrilReturns[0].slot,1);assert.equal(b.tendrilReturns[0].due,b.turn+1);
});
test('Upgraded Guide deals21 and retains its mark; Continue uses new damage without resetting card uses/HP',()=>{
  const g=arena(),b=g.s.battle,c=put(g,'lucidGuide',0);c.upgrade=true;c.hp=7;c.used=3;
  const e=spawnIdeon(g,b.enemies[0],'drone',{slot:1});
  const loaded=new Game(0,structuredClone(g.s)),q=loaded.s.battle.grid[0][0];
  assert.equal(q.hp,7);assert.equal(q.used,3);assert.equal(attackPreview(loaded.s.battle,q,0,e).damage,21);
  loaded.act(loaded.legal().find(a=>a.type==='activate'&&a.slot===0&&a.target===e.uid));
  const victim=loaded.s.battle.ideons[0];assert.equal(victim.hp,29);assert.equal(victim.mark.bonus,3);
});
