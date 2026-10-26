import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {prepareCorruption} from '../src/corruptions.mjs';

function arena() {
  const g=new Game(381);g.s.stratum=2;g.s.hp=g.s.maxHp=1000;
  g.beginBattle([{uid:g.uid(),enemy:'bombadier',restless:0}]);
  g.s.battle.enemies[0].corruptionPlan=[];
  return g;
}
function round(g) {
  g.endTurn();let n=0;
  while(g.s.battle.reaction && n++<100)g.act(g.legal().find(a=>a.type==='skipEquipment'));
  assert.ok(n<100);
}
const mines=g=>Object.values(g.s.battle.corruptions).filter(q=>q.kind==='mine');

test('Bombadier damage uses final S2 values and every hit escalates by cycle, restlessness and half HP',()=>{
  const g=arena(),e=g.s.battle.enemies[0];
  assert.equal(e.maxHp,288);
  for(const [cycle,damage] of [[0,18],[1,20],[3,20],[4,20],[5,22]]) {
    e.cycle=cycle;assert.equal(g.tell(e).damage,damage);
  }
  e.cycle=2;assert.deepEqual(g.tell(e).sequence.map(h=>[h.element,h.damage]),[['Fire',12],['Water',15],['Wind',18]]);
  e.cycle=6;assert.deepEqual(g.tell(e).sequence.map(h=>h.damage),[14,17,20]);
  e.hp=e.maxHp/2;e.restless=2;
  assert.deepEqual(g.tell(e).sequence.map(h=>h.damage),[19,22,25]);
});

test('Last Ditch Effort triggers strictly below a quarter once, preserves cycle and survives reload',()=>{
  const g=arena(),e=g.s.battle.enemies[0];e.cycle=2;e.hp=e.maxHp/4;
  assert.equal(g.tell(e).name,'Deconstructed Steam');
  e.hp--;const rng=g.s.rng;
  assert.equal(g.tell(e).name,'Last Ditch Effort');assert.equal(g.tell(e).count,6);assert.equal(g.s.rng,rng);
  round(g);
  assert.equal(e.cycle,2);assert.equal(e.lastDitchUsed,true);assert.equal(e.lastDitchRelease,true);
  assert.equal(e.corruptionPlan.length,6);assert.equal(new Set(e.corruptionPlan.map(p=>p.slot)).size,6);
  assert.equal(mines(g).length,0);assert.equal(g.s.hp,1000);
  const h=new Game(0,structuredClone(g.s)),owner=h.s.battle.enemies[0];
  assert.deepEqual(owner.corruptionPlan,e.corruptionPlan);
  assert.equal(h.tell(owner).name,'Deconstructed Steam');assert.equal(h.tell(owner).applyCorruption,true);
  round(h);assert.equal(mines(h).length,6);assert.equal(owner.lastDitchRelease,false);
  assert.equal(h.s.hp,946); // 15 Fire + 18 Water + 21 Wind; no mines explode on placement.
  round(h);assert.equal(mines(h).length,0);assert.equal(h.s.hp,803); // 23 Fire + six 20 Fire mines.
  owner.hp=owner.maxHp;owner.hp=1;
  assert.notEqual(h.tell(owner).name,'Last Ditch Effort');
});

test('Last Ditch resolves committed warnings, bypasses only its mine cap and does not lose pending Purify',()=>{
  const g=arena(),b=g.s.battle,e=b.enemies[0];
  e.cycle=4;e.hp=71;e.purifyPending=true;e.status.poison=2;
  e.corruptionPlan=[{slot:0,kind:'mine'},{slot:1,kind:'hole'}];
  round(g);
  assert.equal(b.corruptions[0].kind,'mine');assert.equal(b.corruptions[1].kind,'hole');
  assert.equal(e.corruptionPlan.length,6);assert.equal(e.purifyPending,true);assert.equal(e.cycle,4);
  assert.equal(g.tell(e).name,'Purify');assert.equal(g.tell(e).applyCorruption,true);
  round(g);assert.equal(e.purifyPending,false);assert.equal(e.lastDitchRelease,false);
  assert.equal(mines(g).length,6);assert.equal(e.cycle,4);
  b.corruptions={};prepareCorruption(g,e,{markCorruption:'mine',count:8});
  assert.equal(e.corruptionPlan.length,4); // Normal casts retain their cap.
});

test('Last Ditch respects occupied Corruption spaces and gracefully uses remaining targets',()=>{
  const g=arena(),b=g.s.battle,e=b.enemies[0];e.hp=71;
  for(let i=0;i<41;i++)b.corruptions[i]={kind:'hole',source:e.uid};
  round(g);assert.deepEqual(e.corruptionPlan,[{slot:41,kind:'mine'}]);
  assert.equal(Object.keys(b.corruptions).length,41);
});
