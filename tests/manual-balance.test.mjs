import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {items,enemies,starter} from '../src/content.mjs';
import {tuneEnemyHealth,pressureFactor} from '../src/difficulty.mjs';

test('S2 health adjustment only affects Motes; damage, tutorials and survival timers retain their rules',()=>{
 const defs=Object.fromEntries([
  {id:'mote',stratum:2,tier:'Mote',hp:40},
  {id:'elite',stratum:2,tier:'Eidolon',hp:100},
  {id:'boss',stratum:2,tier:'Archon',hp:200},
  {id:'s1',stratum:1,tier:'Mote',hp:40},
  {id:'s3',stratum:3,tier:'Mote',hp:40},
  {id:'lesson',stratum:2,tier:'Mote',tutorialOnly:true,hp:40},
  {id:'mindHive',stratum:3,tier:'Archon',hp:15},
  {id:'apex',stratum:4,tier:'Archon',hp:640},
 ].map(e=>[e.id,e]));
 tuneEnemyHealth(defs);
 assert.deepEqual(Object.values(defs).map(e=>e.hp),[54,120,240,40,48,40,15,640]);
 assert.equal(pressureFactor(defs.mote),1.15);
 const g=new Game(42);
 const mote=Object.values(enemies).find(e=>e.stratum===2&&e.tier==='Mote'&&!e.tutorialOnly);
 g.s.stratum=2;g.beginBattle([{uid:900,enemy:mote.id,restless:0}]);
 assert.equal(g.s.battle.enemies[0].maxHp,mote.hp);
 g.s.battle.enemies[0].hp-=7;
 const h=new Game(0,structuredClone(g.s));
 assert.equal(h.s.battle.enemies[0].hp,mote.hp-7);
});

test('Mirror Armor purchase charges its revised price and retains one-battle reflection',()=>{
 const g=new Game(7);g.s.mode='tavern';g.s.gold=179;
 g.s.shop={stock:['mirrorArmor'],healer:false};
 assert.ok(!g.legal().some(a=>a.type==='buy'));
 g.s.gold=180;
 const a=g.legal().find(a=>a.type==='buy');assert.ok(a);g.act(a);
 assert.equal(g.s.gold,0);
 assert.ok(g.s.inventory.some(x=>x.id==='mirrorArmor'));
 assert.equal(items.mirrorArmor.effect.reflect,true);
});

test('Later-Stratum item decks exclude starters except Focus, including legacy unoffered loot',()=>{
 const excluded=new Set(starter.filter(id=>id!=='focus'));
 for(const stratum of [2,3]){
  const g=new Game(42);g.enterStratum2(stratum);
  assert.ok(g.s.itemDeck.includes('card:focus'));
  assert.ok(g.s.itemDeck.every(id=>!id.startsWith('card:')||!excluded.has(id.slice(5))));
 }
 const g=new Game(4);
 g.s.itemDeck=['ruby','card:blast','card:shield','card:sapling','card:focus','card:water'];
 const h=new Game(0,structuredClone(g.s));
 assert.deepEqual(h.s.itemDeck,['ruby','card:focus','card:water']);
 assert.equal(h.s.rng,g.s.rng);
 assert.deepEqual(h.s.deck,g.s.deck);
});
