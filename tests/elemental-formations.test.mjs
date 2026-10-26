import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,cardPower,attunementElements} from '../src/engine.mjs';
import {longestWaterPath} from '../src/water-path.mjs';
import {currentPath} from '../src/elemental-formations.mjs';
import {boardConnections} from '../src/board-interactions.mjs';
import {attackPreview} from '../src/combat-preview.mjs';
import {inspirationLegal} from '../src/supplies.mjs';
function arena(){const g=new Game(31);g.beginBattle([{uid:900,enemy:'beetle',restless:0}]);
 const b=g.s.battle;b.grid=Array.from({length:42},()=>[]);b.phase='activate';b.channel=10;b.focus=3;
 g.s.equipment={};b.enemies[0].hp=1000;b.enemies[0].element='Arcane';
 const put=(id,i)=>{const c=g.instance(g.newCard(id));b.grid[i]=[c];return c;};return {g,b,put};}
test('Starleaf is Light, diagonal attunable, and trades orthogonal crowding for damage',()=>{
 const {g,b,put}=arena(),c=put('starleaf',16);assert.equal(c.element,'Light');
 assert.deepEqual(attunementElements(b,c,16),['Light']);
 for(const i of [8,10,22,24])put('water',i);
 assert.equal(cardPower(b,c,16),32);assert.deepEqual(attunementElements(b,c,16),['Light','Water']);
 for(const i of [9,15,17,23])put('blast',i);
 assert.equal(cardPower(b,c,16),24);
 const enemy=b.enemies[0];enemy.element='Chaos';const a=g.legal().find(a=>a.type==='activate'&&a.slot===16&&a.element==='Light');
 const preview=attackPreview(b,c,16,enemy,a.element,a);g.act(a);assert.equal(1000-enemy.hp,preview.damage);assert.equal(preview.damage,36);
});
test('older placed Starleaf updates base without undoing Transmute, tinctures or committed relays',()=>{
 const {g,b,put}=arena(),a=put('starleaf',0),z=put('starleaf',1),p=put('starleaf',2);
 a.element=z.element=p.element='Arcane';z.transmuted=true;b.tinctures={[p.uid]:'Arcane'};
 a.lastActivatedTurn=b.turn;a.lastActivationElement='Water';g.s.version.rules='4.0.30';
 const restored=new Game(0,g.s);assert.equal(restored.s.battle.grid[0][0].element,'Light');
 assert.equal(restored.s.battle.grid[0][0].lastActivationElement,'Water');
 assert.equal(restored.s.battle.grid[1][0].element,'Arcane');assert.equal(restored.s.battle.grid[2][0].element,'Arcane');
});
test('Fire rows and Wind columns count committed elements, penalties, exclusions and zero floor',()=>{
 const {b,put}=arena(),fire=put('ignis',14);put('corner',15);const shield=put('shield',16);
 shield.lastActivatedTurn=b.turn;shield.lastActivationElement='Fire';assert.equal(cardPower(b,fire,14),9);
 shield.lastActivationElement='Water';assert.equal(cardPower(b,fire,14),5);
 put('water',17);put('water',18);put('water',19);assert.equal(cardPower(b,fire,14),0);
 b.grid=Array.from({length:42},()=>[]);const wind=put('risingGale',0);put('gust',7);put('sapling',14);
 put('gust',1);assert.equal(cardPower(b,wind,0),5);
 b.grid[14][0].sever=true;assert.equal(cardPower(b,wind,0),7);
 assert.ok(boardConnections(b).some(x=>x.from===7&&x.to===0));
});
test('Water path can turn and include its spell internally; breaks and committed attunements update it',()=>{
 const {b,put}=arena();const slots=[0,1,8,9,16,17,24];for(const i of slots)put('water',i);
 const c=put('meanderingCurrent',9);assert.equal(currentPath(b,9).length,7);assert.equal(cardPower(b,c,9),17);
 const relay=put('shield',8);assert.equal(currentPath(b,9).length,4);
 relay.lastActivatedTurn=b.turn;relay.lastActivationElement='Water';relay.used=2;
 assert.equal(currentPath(b,9).length,7);relay.freeze=b.turn;assert.equal(currentPath(b,9).length,4);
 relay.freeze=0;b.ideons=[{slot:8,hp:10}];assert.equal(currentPath(b,9).length,4);
 b.ideons=[];const links=boardConnections(b).filter(x=>x.type==='current');assert.equal(links.length,6);
 b.turn++;assert.equal(currentPath(b,9).length,4);
});
test('exact Water solver agrees with independent exhaustive search on branched and looped boards',()=>{
 const neighbors=(a,b)=>Math.abs(a%7-b%7)+Math.abs(Math.floor(a/7)-Math.floor(b/7))===1;
 const vertices=[0,1,2,7,8,9,14,15,16];let rng=31;
 for(let trial=0;trial<90;trial++){
  rng=(Math.imul(rng,1664525)+1013904223)>>>0;const slots=vertices.filter((_,n)=>(rng>>>n)&1);
  if(!slots.length)continue;const root=slots[trial%slots.length];let best=0;
  const visit=path=>{if(path.includes(root))best=Math.max(best,path.length);
   for(const n of slots)if(!path.includes(n)&&neighbors(path.at(-1),n))visit([...path,n]);};
  for(const start of slots)visit([start]);const path=longestWaterPath(slots,root);
  assert.equal(path.length,best);assert.ok(path.includes(root));assert.equal(new Set(path).size,path.length);
  assert.ok(path.slice(1).every((n,i)=>neighbors(path[i],n)));
 }
 assert.equal(longestWaterPath(Array.from({length:42},(_,i)=>i),20).length,42);
});
test('Mindfire has one automatic spend per target, live damage preview, actual capped payment and zero-Focus damage',()=>{
 for(const focus of [0,1,2,3,7]){
  const {g,b,put}=arena(),c=put('mindfire',0);b.focus=focus;
  const actions=g.legal().filter(a=>a.type==='activate'&&a.slot===0);assert.equal(actions.length,1);
  const a=actions[0],spend=Math.min(3,focus),damage=6+8*spend;
  assert.equal(a.focusSpend,spend);assert.equal(a.costs.focus,spend);
  assert.equal(cardPower(b,c,0),damage);assert.equal(a.effects.damage,damage);
  g.act(a);assert.equal(b.focus,focus-spend);assert.equal(1000-b.enemies[0].hp,damage);
 }
});
test('Inspiration Mindfire uses actual remaining Focus rather than its free-placement projection',()=>{
 const {g,b,put}=arena(),c=put('mindfire',0);b.focus=1;
 b.inspiration={uid:c.uid,stage:'activate',phase:'activate'};
 const a=inspirationLegal(g).find(a=>a.type==='activate');assert.ok(a);
 assert.equal(a.focusSpend,1);assert.equal(a.costs.focus,1);assert.equal(a.effects.damage,14);
});
