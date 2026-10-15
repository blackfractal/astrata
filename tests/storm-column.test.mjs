import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {cards,cardText} from '../src/content.mjs';
import {spawnIdeon} from '../src/ideons.mjs';
import {areaHits} from '../src/area-targets.mjs';
import {attackPreview} from '../src/combat-preview.mjs';
function arena(source=17){
 const g=new Game(731);g.s.stratum=3;g.s.equipment={};
 g.beginBattle([{uid:900,enemy:'cnidarian',restless:0}]);delete g.s.checkpoint;
 const b=g.s.battle;b.ideons=[];b.grid=Array.from({length:42},()=>[]);b.jobs=[];b.phase='activate';b.channel=10;
 const c=g.instance(g.newCard('storm'));b.grid[source]=[c];return {g,b,c};
}
test('Storm column rule exhaustively excludes above, own space and other columns across the grid',()=>{
 for(let source=0;source<42;source++)for(let slot=0;slot<42;slot++){
  const expected=slot%7===source%7&&Math.floor(slot/7)>Math.floor(source/7);
  assert.equal(areaHits(cards.storm.effects,source,{ideon:true,slot}),expected);
  assert.equal(areaHits(cards.storm.effects,source,{ideon:false}),true);
 }
});
test('Storm simultaneously damages every main enemy and only lower same-column Ideons; upgrade and Transmute retain shape',()=>{
 for(const upgrade of [false,true]){
  const {g,b,c}=arena();c.upgrade=upgrade;c.element='Fire';c.transmuted=true;
  b.enemies.push({...b.enemies[0],uid:901,hp:200});
  const targets=[3,10,16,18,23,24,31,38].map(slot=>{
   const e=spawnIdeon(g,b.enemies[0],'drone',{slot});e.element='Earth';return e;
  });
  const friendly=g.instance(g.newCard('sapling'));b.grid[39]=[friendly];const allyHP=friendly.hp;
  const raw=upgrade?10:7,hit=Math.ceil(raw*1.5),mainHit=Math.ceil(raw*0.5);
  const before=b.enemies.map(e=>e.hp);
  for(const e of targets){
   const preview=attackPreview(b,c,17,e);
   if([24,31,38].includes(e.slot))assert.equal(preview.damage,hit);else assert.equal(preview,null);
  }
  g.act(g.legal().find(a=>a.type==='activate'&&a.slot===17));
  for(const e of targets)assert.equal(e.hp,50-([24,31,38].includes(e.slot)?hit:0));
  b.enemies.forEach((e,i)=>assert.equal(e.hp,before[i]-mainHit));
  assert.equal(friendly.hp,allyHP);assert.equal(c.used,1);assert.equal(b.channel,9);
 }
});
test('Storm on bottom row still hits main enemies, not Ideons; Continue and description gating preserve behavior',()=>{
 const {g,b,c}=arena(38);c.used=1;
 const e=spawnIdeon(g,b.enemies[0],'drone',{slot:31});
 const loaded=new Game(0,structuredClone(g.s)),lb=loaded.s.battle,hp=lb.enemies[0].hp;
 loaded.act(loaded.legal().find(a=>a.type==='activate'&&a.slot===38));
 assert.equal(lb.ideons.find(x=>x.uid===e.uid).hp,50);assert.equal(lb.enemies[0].hp,hp-11);
 assert.equal(lb.grid[38][0].used,2);
 for(const s of [1,2])assert.doesNotMatch(cardText(cards.storm,s),/Ideon|column/);
 assert.match(cardText(cards.storm,3),/Ideons below this card in the same column/);
});
