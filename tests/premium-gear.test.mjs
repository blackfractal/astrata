import test from 'node:test';
import assert from 'node:assert/strict';
import {Game, tradeAssets} from '../src/engine.mjs';
import {items, events} from '../src/content.mjs';
import {PREMIUM_GEAR} from '../src/premium-gear.mjs';
import {eventChoiceReason} from '../src/choice-feedback.mjs';
import {existsSync} from 'node:fs';
import {WeightedPolicy} from '../src/policy.mjs';

function event(id, stratum=1) {
  const g=new Game(927); g.s.mode='event'; g.s.event=id; g.s.stratum=stratum; g.s.gold=200;
  g.s.field.entities=[]; return g;
}
function choose(g,index=0,uid=null) {
  const a=g.legal().find(a=>a.type==='eventChoice'&&a.index===index&&(uid==null||a.tradeItem===uid));
  assert.ok(a,`Missing event choice ${index}`);g.act(a);
}

test('free item decks exclude premium gear at creation and every Stratum transition',()=>{
  for(let seed=1;seed<=30;seed++) {
    const g=new Game(seed);
    for(const stratum of [1,2,3,4]) {
      if(stratum>1)g.enterStratum2(stratum);
      assert.ok(g.s.itemDeck.every(id=>!PREMIUM_GEAR.has(id)));
      assert.ok(g.s.itemDeck.includes('silver'));
    }
  }
});
test('legacy unseen drops filter without RNG or changes to owned/visible premium items',()=>{
  const g=event('keepersWager'); g.addItem('gold');g.s.mode='item';g.s.itemOffer=['mirrorArmor'];
  g.s.itemDeck=['gold','silver','focusRing','card:ward','bronze'];g.s.reward={setting:'channelRing'};
  const h=new Game(0,structuredClone(g.s));
  assert.equal(h.s.rng,g.s.rng);assert.deepEqual(h.s.itemDeck,['silver','card:ward','bronze']);
  assert.deepEqual(h.s.itemOffer,['mirrorArmor']);assert.equal(h.s.reward.setting,'channelRing');
  assert.ok(h.s.inventory.some(x=>x.id==='gold'));
});
test('free item refill never awards premium gear',()=>{
  const g=new Game(17);g.s.stratum=3;g.s.itemDeck=[];
  for(let n=0;n<250;n++) {
    const f=g.s.field;g.s.mode='field';f.entities=[{uid:g.uid(),type:'Item',x:f.x,y:f.y}];g.resolveTile();
    assert.equal(g.s.mode,'item');assert.ok(!PREMIUM_GEAR.has(g.s.itemOffer[0]));
  }
});
test('S1 Archon settings exclude premium gear; later rewards and shops retain it',()=>{
  const g=new Game(19), later=new Set(), stock=new Set();
  for(let n=0;n<100;n++) {
    g.s.stratum=1;g.s.reward={setting:true};g.normalizeRewards();assert.ok(!PREMIUM_GEAR.has(g.s.reward.setting));
    g.s.stratum=2;g.s.reward={setting:true};g.normalizeRewards();later.add(g.s.reward.setting);
    g.openTavern();g.s.shop.stock.forEach(id=>stock.add(id));
  }
  assert.ok([...later].some(id=>PREMIUM_GEAR.has(id)));
  for(const id of PREMIUM_GEAR)assert.ok(stock.has(id),id);
  assert.equal(items.gold.effect.block,7);assert.equal(items.gold.worth,300);
});
test('heartwood costs permanent maximum HP, clamps current HP only when necessary',()=>{
  for(const hp of [70,30]) {
    const g=event('gildedHeartwood');g.s.hp=hp;choose(g);
    assert.equal(g.s.maxHp,55);assert.equal(g.s.hp,Math.min(hp,55));assert.ok(g.s.inventory.some(x=>x.id==='gold'));
    assert.equal(new Game(0,structuredClone(g.s)).s.maxHp,55);
  }
  const g=event('gildedHeartwood');g.s.maxHp=15;
  assert.ok(!g.legal().some(a=>a.type==='eventChoice'&&a.index===0));
  assert.match(eventChoiceReason(g.s,events.find(e=>e.id===g.s.event).choices[0]),/maximum HP/);
});
test('wager has seeded success/failure and a persistent result, charges once and cannot reroll on reload',()=>{
  const outcomes=new Set();
  for(const rng of [1,123456,987654321,3000000000]) {
    const g=event('keepersWager');g.s.rng=rng;const twin=new Game(0,structuredClone(g.s));
    choose(g);choose(twin);assert.equal(g.s.event,twin.s.event);assert.equal(g.s.rng,twin.s.rng);
    const won=g.s.event==='keepersWagerWon';outcomes.add(won);
    assert.equal(g.s.gold,100);assert.equal(g.s.inventory.some(x=>x.id==='gold'),won);
    const h=new Game(0,structuredClone(g.s));assert.equal(h.s.event,g.s.event);choose(h);assert.equal(h.s.gold,100);
  }
  assert.equal(outcomes.size,2);
  const g=event('keepersWager');g.s.gold=99;assert.ok(!g.legal().some(a=>a.index===0));
});
test('smith trades exactly the selected equipped bracelet and fitted gem, charges gold, offers different builds',()=>{
  for(const [index,reward] of ['gold','prismaticBracelet','reclaimerBracelet'].entries()) {
    const g=event('counterweightSmith',2),first=g.s.inventory.find(x=>x.id==='bronze'),gem=g.s.inventory.find(x=>items[x.id].slot==='gem');
    first.gem=gem.uid;const spare=g.addItem('silver');const extra=g.addItem('ruby');spare.gem=extra.uid;
    const c=events.find(e=>e.id===g.s.event).choices[index];
    assert.equal(tradeAssets(g.s,c.trade).find(x=>x.uid===spare.uid).eligible,false);
    choose(g,index,first.uid);
    assert.equal(g.s.gold,100);assert.ok(!g.getItem(first.uid));assert.ok(!g.getItem(gem.uid));
    assert.ok(g.getItem(spare.uid));assert.ok(g.getItem(extra.uid));assert.ok(g.s.inventory.some(x=>x.id===reward&&!x.gem));
    assert.ok(!Object.values(g.s.equipment).includes(first.uid));
  }
  const g=event('counterweightSmith',2);assert.ok(!g.legal().some(a=>a.index<3));
});
test('Mirror Armor is a saved battle prize, only offered after victory, not granted on loss or inherited',()=>{
  const g=event('sealedReflection',2);choose(g);assert.equal(g.s.mode,'battle');
  assert.ok(!g.s.inventory.some(x=>x.id==='mirrorArmor'));
  assert.equal(g.s.checkpoint.battle.victoryItem,'mirrorArmor');
  const h=new Game(0,structuredClone(g.s));h.s.battle.enemies.forEach(e=>e.hp=0);h.s.battle.jobs=[];h.checkBattle();
  assert.equal(h.s.mode,'reward');assert.equal(h.s.reward.setting,'mirrorArmor');
  assert.ok(!h.s.inventory.some(x=>x.id==='mirrorArmor'));
  h.s.reward.cards=null;h.s.reward.gem=false;
  const take=h.legal().find(a=>a.type==='rewardSetting');assert.ok(take);h.act(take);
  assert.ok(h.s.inventory.some(x=>x.id==='mirrorArmor'));
  const loser=new Game(0,structuredClone(g.s));loser.s.hp=0;loser.checkBattle();assert.equal(loser.s.mode,'result');assert.ok(!loser.s.inventory.some(x=>x.id==='mirrorArmor'));
  g.beginBattle([{uid:g.uid(),enemy:'beetle'}]);assert.equal(g.s.battle.victoryItem,null);
});
test('event outcomes never enter random pools, new scenes use existing artwork',()=>{
  const g=new Game(8);
  for(const stratum of [1,2,3,4]){g.s.stratum=stratum;assert.ok(g.eventPool().every(id=>!events.find(e=>e.id===id).resultOnly));}
  for(const e of events.filter(e=>e.art))assert.ok(existsSync('assets/'+e.art+'.png'));
});

test('policy prices permanent health sacrifice and evaluates disclosed wager odds',()=>{
  const g=event('gildedHeartwood'),p=new WeightedPolicy(),o=g.observe();
  const a=g.legal().find(a=>a.type==='eventChoice'&&a.index===0);
  const free={...a,effects:{...a.effects,maxHpCost:0}};
  assert.equal(p.score(o,free)[0]-p.score(o,a)[0],37.5);
  const wager={...a,effects:{wager:{item:'gold',odds:3}},costs:{gold:100}};
  assert.equal(p.score(o,wager)[0],p.itemValue({id:'gold'},o)/3-20);
});
