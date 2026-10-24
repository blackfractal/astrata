import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {enemies} from '../src/content.mjs';
import {commandIdeon, protectedOwner} from '../src/ideons.mjs';

const openings = {nerveWeaver:['shuttle',1],paleGrazer:['leech',1],hollowDrifter:['guardian',1],knotkeeper:['binder',2]};
function arena(ids, enemyFirst=false, seed=44) {
  const g=new Game(seed);g.s.stratum=3;
  g.beginBattle(ids.map((enemy,i)=>({uid:900+i,enemy,restless:0})),{enemyFirst});
  return g;
}
for (const [id,[kind,count]] of Object.entries(openings)) test(`${id}: opening exists with either initiator, fits legal spaces, and survives Continue exactly`,()=>{
  for (const first of [false,true]) {
    const g=arena([id],first),b=g.s.battle;
    const own=b.ideons.filter(e=>e.opening);
    assert.equal(own.length,count);
    for (const i of own) {
      assert.equal(i.kind,kind);assert.equal(i.owner,b.enemies[0].uid);
      assert.ok([3,4].includes(i.slot%7));assert.equal(b.grid[i.slot].length,0);
      assert.equal(i.age,0);
    }
    const h=new Game(0,structuredClone(g.s));
    assert.deepEqual(h.s.battle.ideons,b.ideons);
    assert.equal(h.s.battle.enemies[0].hp,b.enemies[0].hp);
    if(id==='hollowDrifter') assert.ok(protectedOwner(b,b.enemies[0].uid));
  }
});

test('Opening command waits through ambush, then actually attacks after player turn',()=>{
  const g=arena(['hollowDrifter']),b=g.s.battle,i=b.ideons[0];
  b.jobs=[];b.turn=0;commandIdeon(g,i.uid);
  assert.equal(i.age,0);assert.equal(b.jobs.length,0);
  b.turn=1;commandIdeon(g,i.uid);
  assert.equal(i.age,1);assert.equal(b.jobs[0].damage,8);
});

test('Combined opening has no overlap, preserves Opening Rites and is seed reproducible',()=>{
  const make=()=>{const g=new Game(23);g.s.deck.push(g.newCard('rite'));
    g.beginBattle(Object.keys(openings).map((enemy,i)=>({uid:900+i,enemy})));return g;};
  const g=make(),h=make(),b=g.s.battle;
  assert.equal(b.ideons.length,5);
  assert.equal(new Set(b.ideons.map(i=>i.slot)).size,5);
  assert.equal(b.grid.flat().filter(c=>c.id==='rite').length,1);
  for(const i of b.ideons) assert.equal(b.grid[i.slot].length,0);
  assert.deepEqual(b.ideons,h.s.battle.ideons);
});

test('Echo Polyp begins with active Nausea, later waves still telegraph; no fake mine message',()=>{
  for(const first of [false,true]) {
    const g=arena(['echoPolyp'],first),b=g.s.battle;
    assert.equal(Object.values(b.corruptions).length,2);
    assert.ok(Object.values(b.corruptions).every(c=>c.kind==='nausea'));
    assert.equal(b.enemies[0].corruptionPlan.length,0);
    b.enemies[0].cycle=0;assert.equal(g.tell(b.enemies[0]).applyCorruption,false);
    b.enemies[0].cycle=1;assert.equal(g.tell(b.enemies[0]).markCorruption,'nausea');
    const h=new Game(0,structuredClone(g.s));assert.deepEqual(h.s.battle.corruptions,b.corruptions);
  }
});

test('Durability group has stronger actual HP/attacks and no new preplaced hazards',()=>{
  for(const [id,hp,damage] of [['glassBrood',72,14],['blindSeer',82,17],['kindlyHunger',180,19],['borrowedOracle',173,18]]) {
    const g=arena([id]),b=g.s.battle,e=b.enemies[0];
    assert.equal(e.hp,hp);assert.equal(g.tell(e).damage,damage);
    assert.equal(b.ideons.length,0);assert.equal(Object.keys(b.corruptions).length,0);
    e.cycle=enemies[id].rotation.length;
    assert.ok(g.tell(e).damage>damage,'existing later-cycle escalation remains');
  }
});

test('Older in-progress battle gains no retroactive openings or HP on Continue',()=>{
  const g=arena(['hollowDrifter']);g.s.version.rules='4.0.5';
  g.s.battle.ideons=[];g.s.battle.enemies[0].hp=21;
  const h=new Game(0,structuredClone(g.s));
  assert.equal(h.s.battle.ideons.length,0);assert.equal(h.s.battle.enemies[0].hp,21);
});

test('Tutorials and bosses do not receive ordinary opening metadata',()=>{
  for(const e of Object.values(enemies).filter(e=>e.tutorialOnly||e.tier==='Archon'))
    assert.equal(e.openingIdeons,undefined);
  assert.equal(enemies.mindHive.hp,15);assert.equal(enemies.refractionCannon.hp,360);
  assert.equal(enemies.cnidarian.hp,324);assert.equal(enemies.apex.hp,500);
  assert.equal(arena(['whisperWarden']).s.battle.enemies[0].hp,40);
});

