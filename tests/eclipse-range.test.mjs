import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {cards, cardText} from '../src/content.mjs';
import {spawnIdeon} from '../src/ideons.mjs';
import {attackPreview} from '../src/combat-preview.mjs';
import {discover,emptyCollection} from '../src/archive-profile.mjs';
function arena(source=17){
 const g=new Game(731);g.s.stratum=3;g.s.equipment={};
 g.beginBattle([{uid:900,enemy:'cnidarian',restless:0}]);delete g.s.checkpoint;
 const b=g.s.battle;b.ideons=[];b.grid=Array.from({length:42},()=>[]);b.jobs=[];b.phase='activate';b.channel=10;
 const c=g.instance(g.newCard('eclipse'));c.charge=2;b.grid[source]=[c];return {g,b,c};
}
test('Eclipse hits main enemies and only Ideons inside its Manhattan diamond, including boundaries and no row wrapping',()=>{
 for(const [source,slot,hit] of [[17,3,true],[17,9,true],[17,19,true],[17,31,true],[17,2,false],[17,32,false],[6,7,false],[0,8,true]]){
  const {g,b,c}=arena(source),owner=b.enemies[0];
  const e=spawnIdeon(g,owner,'drone',{slot});e.element='Arcane';
  const before=owner.hp,preview=attackPreview(b,c,source,e);
  if(hit)assert.equal(preview.damage,30);else assert.equal(preview,null);
  g.act(g.legal().find(a=>a.type==='activate'&&a.slot===source));
  assert.equal(e.hp,hit?20:50);assert.equal(before-owner.hp,30);
  assert.equal(c.charge,0);assert.equal(c.used,1);assert.equal(b.channel,9);
 }
});
test('Eclipse retains charging, elemental damage and Continue state',()=>{
 const {g,b,c}=arena();c.charge=1;c.element='Wind';c.transmuted=true;
 const owner=b.enemies[0],near=spawnIdeon(g,owner,'drone',{slot:19}),far=spawnIdeon(g,owner,'drone',{slot:20});
 near.element='Water';far.element='Water';const hp=owner.hp;
 g.act(g.legal().find(a=>a.type==='activate'&&a.slot===17));
 assert.equal(owner.hp,hp);assert.equal(near.hp,50);assert.equal(c.charge,2);
 b.turn++;c.lastActivatedTurn=0;
 const loaded=new Game(0,structuredClone(g.s));
 const lb=loaded.s.battle,lc=lb.grid[17][0];
 assert.equal(lc.used,1);assert.equal(lc.charge,2);
 loaded.act(loaded.legal().find(a=>a.type==='activate'&&a.slot===17));
 assert.equal(lb.ideons.find(e=>e.uid===near.uid).hp,5);
 assert.equal(lb.ideons.find(e=>e.uid===far.uid).hp,50);
 assert.equal(lb.enemies[0].hp,hp-45);
});
test('Eclipse remains available in S1; Ideon clauses are displayed only from S3',()=>{
 for(const stratum of [1,2,3]){
  const g=new Game(731);g.s.stratum=stratum;
  assert.ok(g.pool('legendary',true).some(c=>c.id==='eclipse'));
  for(const id of ['eclipse','storm'])assert.equal(/Ideons/.test(cardText(cards[id],stratum)),stratum>=3);
 }
 assert.equal(cards.eclipse.focus,2);assert.equal(cards.eclipse.limit,3);assert.equal(cards.eclipse.channel,1);assert.equal(cards.eclipse.recall,1);
});
test('Archives learn the furthest visited Stratum without forgetting it in later early runs',()=>{
 const collection=emptyCollection();discover(collection,{stratum:2,deck:[{id:'eclipse'}]});
 assert.doesNotMatch(cardText(cards.eclipse,collection.highestStratum),/Ideons/);
 discover(collection,{stratum:3});discover(collection,{stratum:1});
 assert.match(cardText(cards.eclipse,collection.highestStratum),/Ideons/);
});
