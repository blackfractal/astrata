import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';

function arena() {
  const g=new Game(12);
  g.s.equipment={torso:g.addItem('mirrorArmor').uid};
  g.beginBattle([{uid:990,enemy:'bombadier',restless:0}]);
  const b=g.s.battle;
  b.phase='activate';b.jobs=[];b.bracelets=[];
  b.enemies[0].corruptionPlan=[];
  g.capturePresentation=true;g.presentation=[];
  return g;
}
function hit(g,damage,element='Arcane') {
  g.s.battle.jobs=[{kind:'hit',name:'Mirror test',damage,element,source:990}];
  g.pump();
}
function act(g,type) {
  const a=g.legal().find(a=>a.type===type);
  assert.ok(a,`Expected ${type}`);g.act(a);
}

test('Mirror caps absorption and reflection at20; remainder routes through equipment, survives Continue',()=>{
  const g=arena(),b=g.s.battle,enemy=b.enemies[0];
  const ward=g.instance(g.newCard('ward'));ward.ward=40;b.grid[0]=[ward];
  b.bracelets=[{uid:901,block:7,name:'Bracelet',element:'Arcane'}];
  const hp=enemy.hp,channel=b.channel;
  hit(g,42);
  const a=g.legal().find(a=>a.type==='armor');
  assert.equal(a.effects.armor,20);assert.match(a.label,/Reflect 20/);
  g.act(a);
  assert.equal(enemy.hp,hp-20);
  assert.equal(b.reaction.damage,22);assert.equal(b.reaction.column,-1);
  assert.equal(b.mirror,true);assert.equal(b.channel,channel);
  assert.ok(!g.legal().some(a=>['armor','ward'].includes(a.type)));
  const frame=g.presentation.find(f=>f.kind==='defend'&&f.item===g.s.equipment.torso);
  assert.equal(frame.amount,20);assert.equal(frame.remaining,22);
  const h=new Game(0,structuredClone(g.s));
  assert.ok(!h.legal().some(a=>a.type==='armor'));
  act(h,'bracelet');
  assert.equal(h.s.hp,55);assert.equal(h.s.battle.grid[0][0].ward,40);
  hit(h,5);assert.ok(!h.legal().some(a=>a.type==='armor'));
  act(h,'skipEquipment');assert.equal(h.s.hp,50);
});

test('Mirror cap precedes reflected elemental matchup and enemy Guard',()=>{
  const g=arena(),e=g.s.battle.enemies[0],hp=e.hp;
  e.guard=2;hit(g,40,'Water');act(g,'armor');
  assert.equal(e.hp,hp-28); //20 Water ->30 against Fire, minus2 Guard
  assert.equal(g.s.hp,50); //20 of the original40 still reaches the player
});

test('Small reflection spends Mirror for this battle; next battle refreshes it',()=>{
  const g=arena(),e=g.s.battle.enemies[0],hp=e.hp;
  hit(g,6);act(g,'armor');assert.equal(e.hp,hp-6);assert.equal(g.s.hp,70);
  hit(g,5);assert.equal(g.s.hp,65);
  g.beginBattle([{uid:990,enemy:'bombadier',restless:0}]);
  g.s.battle.phase='activate';g.s.battle.bracelets=[];
  hit(g,20);assert.ok(g.legal().some(a=>a.type==='armor'));
});

test('Lethal reflection still resolves the unreflected remainder before victory',()=>{
  const g=arena();g.s.battle.enemies[0].hp=10;
  hit(g,40);act(g,'armor');
  assert.equal(g.s.hp,50);assert.equal(g.s.mode,'reward');
});
