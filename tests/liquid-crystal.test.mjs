import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { potionEffects, satchelContents, itemText } from '../src/consumables.mjs';
const act=(g,type,props={})=>{const a=g.legal().find(a=>a.type===type && Object.entries(props).every(([k,v])=>a[k]===v));assert.ok(a,JSON.stringify({type,...props}));g.act(a);return a;};
const battle=()=>{const g=new Game(133);g.beginBattle([{uid:900,enemy:'mendingTutor',restless:0}]);g.s.battle.channel=4;return g;};
test('Previous S3 saves load without retroactive supply changes',()=>{
 const g=new Game(14);const before=structuredClone(g.s.field.entities);
 for(const rules of ['3.0.0','3.0.2','3.0.3','3.0.4']) {
  const saved=structuredClone(g.s);saved.version.rules=rules;
  const loaded=new Game(0,saved);assert.deepEqual(loaded.s.field.entities,before);
 }
});
test('S3 starts with one or two seeded Crystals among three supplies, always retaining Healing Sap',()=>{
 const counts=new Set();
 for(let seed=0;seed<30;seed++){
  const g=new Game(seed);g.s.stratum=3;g.s.field.entities=[];delete g.s.field.suppliesScattered;
  const replay=new Game(0,g.s);
  g.scatterSupplies();replay.scatterSupplies();
  assert.deepEqual(g.s.field.entities,replay.s.field.entities);
  const drops=g.s.field.entities.filter(e=>e.fieldSupply);
  assert.equal(drops.length,3);
  const count=drops.filter(e=>e.item==='liquidCrystal').length;
  assert.ok([1,2].includes(count));counts.add(count);
  assert.ok(drops.some(e=>e.item==='healingSap'));
  assert.equal(new Set(drops.map(e=>e.x+','+e.y)).size,3);
  g.scatterSupplies();assert.equal(g.s.field.entities.length,3);
 }
 assert.equal(counts.size,2);
});
test('Combination consumes only the Crystal, frees one slot, persists, and cannot repeat',()=>{
 const g=battle(),p=g.addItem('healingSap'),c=g.addItem('liquidCrystal');
 const before={slots:satchelContents(g.s).length,focus:g.s.battle.focus,channel:g.s.battle.channel,gold:g.s.gold};
 act(g,'enhancePotion',{uid:c.uid,potion:p.uid});
 assert.equal(g.getItem(c.uid),undefined);
 assert.equal(satchelContents(g.s).length,before.slots-1);
 assert.equal(g.s.battle.focus,before.focus);assert.equal(g.s.battle.channel,before.channel);assert.equal(g.s.gold,before.gold);
 assert.equal(g.s.battle.consumableTurn,undefined);
 const loaded=new Game(0,g.s);loaded.addItem('liquidCrystal');
 assert.equal(potionEffects(loaded.getItem(p.uid)).heal,10);
 assert.match(itemText(loaded.getItem(p.uid)),/10 HP/);
 assert.ok(!loaded.legal().some(a=>a.type==='enhancePotion'&&a.potion===p.uid));
 assert.equal(loaded.s.stats.potionsEnhanced.length,1);
});
for(const [id,key,value,phase] of [['healingSap','heal',10,'place'],['focusDraught','focus',2,'place'],['channelDraught','channel',2,'activate'],['insightDew','draw',2,'place'],['starFlask','damage',12,'activate']])
 test('Crystal doubles '+id+' while preserving one-use limit',()=>{
  const g=battle(),b=g.s.battle,p=g.addItem(id),c=g.addItem('liquidCrystal');g.s.hp=40;
  b.phase=phase;
  act(g,'enhancePotion',{uid:c.uid,potion:p.uid});
  const before={hp:g.s.hp,focus:b.focus,channel:b.channel,hand:b.hand.length,enemy:b.enemies[0].hp};
  const action=act(g,'consume',{uid:p.uid});assert.equal(action.effects[key],value);
  if(key==='heal')assert.equal(g.s.hp,before.hp+10);
  if(key==='focus')assert.equal(b.focus,before.focus+2);
  if(key==='channel')assert.equal(b.channel,before.channel+2);
  if(key==='draw')assert.equal(b.hand.length,before.hand+2);
  if(key==='damage')assert.equal(b.enemies[0].hp,before.enemy-12);
  g.addItem('channelDraught');assert.ok(!g.legal().some(a=>a.type==='consume'));
  assert.equal(g.s.stats.consumablesUsed.at(-1).crystal,true);
 });
test('Enhanced Insight crosses draw/discard boundary and tolerates only one remaining card',()=>{
 for(const remaining of [1,2]){
  const g=battle(),b=g.s.battle,p=g.addItem('insightDew');p.crystal=true;
  b.deck=[g.newCard('blast')];b.discard=remaining===2?[g.newCard('shield')]:[];b.hand=[];
  act(g,'consume',{uid:p.uid});assert.equal(b.hand.length,remaining);assert.ok(b.hand.every(Boolean));
 }
});
test('Combining is legal in Field/Tavern/player phases, not reactions or enemy turns',()=>{
 const g=battle();g.addItem('liquidCrystal');g.addItem('focusDraught');
 for(const phase of ['enemy','start']){g.s.battle.phase=phase;assert.ok(!g.legal().some(a=>a.type==='enhancePotion'));}
 g.s.battle.phase='place';g.s.battle.reaction={damage:1,element:'Arcane'};assert.ok(!g.legal().some(a=>a.type==='enhancePotion'));
 g.s.battle.reaction=null;
 for(const mode of ['field','tavern']){g.s.mode=mode;if(mode==='tavern')g.openTavern();assert.ok(g.legal().some(a=>a.type==='enhancePotion'));}
});
