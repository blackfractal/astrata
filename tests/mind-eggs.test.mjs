import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { forcedDiscardLabel } from '../src/card-removal.mjs';
import { hiveBrood, layMindEggs, hatchMindEgg, spawnIdeon, settleIdeons } from '../src/ideons.mjs';
const arena=(id='mindHive')=>{const g=new Game(102);g.s.stratum=3;g.s.equipment={};g.beginBattle([{uid:900,enemy:id,restless:0}]);delete g.s.checkpoint;g.s.battle.ideons=[];g.s.battle.focus=20;g.s.battle.channel=20;return g;};
const put=(g,id,slot)=>{const c=g.instance(g.newCard(id));g.s.battle.grid[slot].push(c);return c;};
const egg=(g,slot,extra={})=>g.s.battle.corruptions[slot]={kind:'egg',uid:g.uid(),source:g.s.battle.enemies[0].uid,createdTurn:0,remaining:1,damage:8,element:'Water',insect:'runner',...extra};
const act=(g,type,match={})=>{const a=g.legal().find(a=>a.type===type&&Object.entries(match).every(([k,v])=>a[k]===v));assert.ok(a,JSON.stringify({type,...match}));g.act(a);};
const settle=g=>{for(let i=0;i<200&&g.s.mode==='battle'&&g.s.battle.reaction;i++)act(g,'skipEquipment');};
test('Hive egg stages ramp from one to eight across four columns',()=>{
 for(const [round,count,columns] of [[1,1,1],[4,1,1],[5,2,2],[8,2,2],[9,4,3],[11,4,3],[12,6,4],[13,6,4],[14,8,4],[15,0,4]]){
  const g=arena(),o=g.s.battle.enemies[0];o.hp=16-round;
  assert.deepEqual(hiveBrood(o),{round,count,columns});layMindEggs(g,o);
  const entries=Object.entries(g.s.battle.corruptions);assert.equal(entries.length,count);
  assert.ok(entries.every(([slot])=>Number(slot)%7>=7-columns));
 }
});
test('Eggs land under occupied cards and use all elements with deterministic persisted RNG',()=>{
 const g=arena(),b=g.s.battle,o=b.enemies[0];for(let i=0;i<42;i++)put(g,'blast',i);
 const seen=new Set();
 for(let n=0;n<7;n++){
  b.corruptions={};const clone=new Game(0,structuredClone(g.s));
  layMindEggs(g,o);layMindEggs(clone,clone.s.battle.enemies[0]);
  assert.deepEqual(g.s.battle.corruptions,clone.s.battle.corruptions);
  for(const [i,e] of Object.entries(b.corruptions)){seen.add(e.element);assert.equal(b.grid[i].length,1);}
 }
 assert.equal(seen.size,7);
});
test('Covered egg discards whole Construct, clears Guard and resets fresh cards without Focus',()=>{
 const g=arena(),b=g.s.battle,o=b.enemies[0];const host=put(g,'ward',13),meld=put(g,'magnify',13);
 host.used=2;host.zeroWard=true;host.ward=0;host.element='Fire';meld.attachedTo=host.uid;
 b.shields=[{slot:13,value:9},{slot:1,value:4}];const q=egg(g,13),focus=b.focus;
 hatchMindEgg(g,o,13,q.uid);
 assert.equal(b.grid[13].length,0);assert.equal(b.destroyed.length,0);assert.equal(b.focus,focus);
 assert.deepEqual(b.discard.slice(-2),[host,meld].map(c=>({uid:c.uid,id:c.id,upgrade:c.upgrade})));
 assert.equal(b.shields.length,1);assert.equal(b.ideons[0].slot,13);assert.equal(b.ideons[0].element,'Water');
 assert.ok(!b.jobs.some(j=>j.kind==='hit'));assert.equal(g.instance(b.discard.at(-2)).used,0);
});
test('Covered egg destroys normally unrecallable Allies but still prevents hatch damage',()=>{
 const g=arena(),b=g.s.battle;g.capturePresentation=true;const c=put(g,'sapling',6),q=egg(g,6);hatchMindEgg(g,b.enemies[0],6,q.uid);
 assert.ok(b.destroyed.some(x=>x.uid===c.uid));assert.ok(!b.discard.some(x=>x.uid===c.uid));assert.equal(b.ideons.length,1);
 assert.ok(!b.jobs.some(j=>j.kind==='hit'));assert.equal(g.s.stats.mindEggs.at(-1).damage,0);
 assert.deepEqual(g.s.stats.mindEggs.at(-1).destroyed,[c.uid]);
 assert.equal(g.presentation.findLast(f=>f.kind==='eggHatch').destination,'Destroyed');
});

test('Egg cannot recycle Focus Energy after its permanent bonus, including across save/load',()=>{
 const g=arena(),b=g.s.battle,c=put(g,'focus',6);b.phase='activate';act(g,'activate',{slot:6});
 assert.equal(b.permanent.focus,1);const q=egg(g,6);hatchMindEgg(g,b.enemies[0],6,q.uid);
 const resumed=new Game(0,structuredClone(g.s)),rb=resumed.s.battle;rb.deck=[];
 rb.discard=[{uid:99999,id:'blast',upgrade:false}];resumed.reveal();
 assert.equal(rb.permanent.focus,1);assert.ok(rb.destroyed.some(x=>x.uid===c.uid));
 assert.ok(!rb.hand.some(x=>x.uid===c.uid));assert.ok(rb.hand.some(x=>x.id==='blast'));
 // Destroyed is battle-local: the owned card returns in the next battle.
 g.s.deck.push({uid:c.uid,id:c.id,upgrade:c.upgrade});g.beginBattle([{uid:901,enemy:'mindHive',restless:0}]);
 assert.ok([...g.s.battle.deck,...g.s.battle.hand].some(x=>x.uid===c.uid));assert.equal(g.s.battle.permanent.focus,0);
});

test('Recallable Allies and temporarily Locked cards still discard; attached cards follow destroyed hosts',()=>{
 for(const id of ['elves','shield']){
  const g=arena(),b=g.s.battle,c=put(g,id,6);c.lock=2;const q=egg(g,6);
  assert.equal(forcedDiscardLabel(b.grid[6]),'Discard');hatchMindEgg(g,b.enemies[0],6,q.uid);
  assert.ok(b.discard.some(x=>x.uid===c.uid));assert.equal(b.destroyed.length,0);
 }
 const g=arena(),b=g.s.battle,host=put(g,'focus',6),meld=put(g,'palimpsest',6);meld.attachedTo=host.uid;
 assert.equal(forcedDiscardLabel(b.grid[6]),'Destroyed');const q=egg(g,6);hatchMindEgg(g,b.enemies[0],6,q.uid);
 assert.deepEqual(b.destroyed.map(x=>x.uid),[host.uid,meld.uid]);assert.equal(b.discard.length,0);
});

test('Unplayed non-recallable cards still use the ordinary hand discard',()=>{
 const g=arena(),b=g.s.battle,c=g.newCard('focus');b.hand=[c];
 act(g,'activatePhase');assert.ok(b.discard.some(x=>x.uid===c.uid));assert.equal(b.destroyed.length,0);
});
test('Uncovered egg hits for eight of its element from its own column through legal defenses',()=>{
 const g=arena(),b=g.s.battle;for(const i of [1,2,5])put(g,'ward',i).ward=10;
 const q=egg(g,3);hatchMindEgg(g,b.enemies[0],3,q.uid);g.pump();
 assert.equal(b.reaction.damage,8);assert.equal(b.reaction.element,'Water');
 assert.deepEqual(g.defenseChoices().wards.map(x=>x.i),[1,2]);
});
test('Eggs get a full player response, then hatch without moving their newborn insects',()=>{
 const g=arena(),b=g.s.battle;g.s.hp=1000;g.endTurn();settle(g);
 assert.equal(b.turn,2);assert.equal(b.ideons.length,0);assert.equal(Object.keys(b.corruptions).length,1);
 const slots=Object.keys(b.corruptions).map(Number);for(const i of slots)put(g,'blast',i);
 g.endTurn();settle(g);assert.equal(b.turn,3);assert.equal(b.ideons.length,1);
 assert.deepEqual(b.ideons.map(e=>e.slot).sort((a,z)=>a-z),slots.sort((a,z)=>a-z));
 assert.ok(b.ideons.every(e=>e.age===0));assert.equal(b.discard.filter(c=>c.id==='blast').length>=1,true);
});
test('Machine Elves remove eggs immediately and stop both burst and insect',()=>{
 const g=arena(),b=g.s.battle;put(g,'elves',5);const q=egg(g,6);b.phase='activate';
 act(g,'activate',{slot:5,cardTarget:6});assert.equal(b.corruptions[6],undefined);
 hatchMindEgg(g,b.enemies[0],6,q.uid);assert.equal(b.ideons.length,0);assert.equal(b.jobs.length,0);
});
test('Egg waits if another Ideon occupies its hatch space; it is not silently lost',()=>{
 const g=arena(),b=g.s.battle,o=b.enemies[0],q=egg(g,6);const invader=spawnIdeon(g,o,'runner',{slot:6});
 hatchMindEgg(g,o,6,q.uid);assert.equal(b.corruptions[6],q);assert.equal(b.ideons.length,1);
 invader.slot=5;hatchMindEgg(g,o,6,q.uid);assert.equal(b.corruptions[6],undefined);assert.equal(b.ideons.length,2);
});
test('Hive death removes its unhatched eggs and insects but leaves unrelated corruption',()=>{
 const g=arena(),b=g.s.battle,o=b.enemies[0];egg(g,6);b.corruptions[2]={kind:'nausea',source:o.uid};spawnIdeon(g,o,'runner');o.hp=0;settleIdeons(g);
 assert.equal(b.corruptions[6],undefined);assert.equal(b.corruptions[2].kind,'nausea');assert.equal(b.ideons.length,0);
});
test('Final round resolves egg damage before Hive victory',()=>{
 const g=arena(),b=g.s.battle,o=b.enemies[0];o.hp=1;g.s.hp=4;egg(g,6);g.endTurn();settle(g);
 assert.equal(g.s.outcome,'loss');assert.equal(o.hp,1);
});
test('Storm Canopy including upgrade/transmute never hits Ideons or bypasses their guardian',()=>{
 const g=arena('glassBrood'),b=g.s.battle,o=b.enemies[0];const guardian=spawnIdeon(g,o,'guardian',{slot:6}),other=spawnIdeon(g,o,'runner',{slot:13});
 const c=put(g,'storm',0);c.upgrade=true;c.element='Fire';b.enemies.push({...o,uid:901,hp:100});b.phase='activate';
 act(g,'activate',{slot:0});assert.equal(guardian.hp,guardian.maxHp);assert.equal(other.hp,other.maxHp);assert.equal(o.hp,o.maxHp);assert.ok(b.enemies[1].hp<100);
});
