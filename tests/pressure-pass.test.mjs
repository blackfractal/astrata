import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { enemies } from '../src/content.mjs';
import { spawnIdeon, commandIdeon } from '../src/ideons.mjs';
test('Sold stock stays indexed across purchases and exact reload; cannot buy twice',()=>{
 const g=new Game(71);g.s.mode='tavern';g.s.gold=1000;
 g.s.shop={stock:['card:focus','gold','ruby'],healer:false};
 const first=g.legal().find(a=>a.type==='buy'&&a.index===0);assert.ok(first);g.act(first);
 const stock=[...g.s.shop.stock];assert.deepEqual(stock,['card:focus','gold','ruby']);
 const h=new Game(0,structuredClone(g.s));assert.deepEqual(h.s.shop.stock,stock);
 assert.ok(!h.legal().some(a=>a.type==='buy'&&a.index===0));
 h.act(h.legal().find(a=>a.type==='buy'&&a.index===2));
 assert.deepEqual(h.s.shop.stock,stock);assert.deepEqual(h.s.shop.soldIndices,[0,2]);
 assert.ok(h.legal().some(a=>a.type==='buy'&&a.index===1));
});
test('Transmute offers only NESW placed targets, never itself, diagonals or distant cards',()=>{
 const g=new Game(71);g.beginBattle([{uid:900,enemy:'beetle'}]);
 const b=g.s.battle;b.phase='activate';b.channel=5;
 for(const i of [0,1,6,7,8,9,14,15,16,41])b.grid[i]=[g.instance(g.newCard(i===8?'transmute':'blast'))];
 const targets=[...new Set(g.legal().filter(a=>a.type==='activate'&&a.slot===8).map(a=>a.cardTarget))].sort((a,b)=>a-b);
 assert.deepEqual(targets,[1,7,9,15]);
 const a=g.legal().find(a=>a.type==='activate'&&a.slot===8);g.act(a);
 assert.equal(b.grid[a.cardTarget][0].element,a.newElement);
});
test('Tutorials, S1 and Predator retain damage; S3 Ideon pressure excludes Predator ownership',()=>{
 assert.equal(enemies.apex.hp,500);assert.equal(enemies.mindHive.hp,15);
 for(const [id,expected]of [['beetle',4],['tutorialMosswing',3]]){
  const g=new Game(4);g.beginBattle([{uid:900,enemy:id,restless:0}]);
  assert.equal(g.tell(g.s.battle.enemies[0]).damage,expected);
 }
 const g=new Game(4);g.beginBattle([{uid:900,enemy:'apex',restless:0}]);
 const b=g.s.battle;b.ideons=[];b.jobs=[];
 const e=spawnIdeon(g,b.enemies[0],'guardian',{slot:6});commandIdeon(g,e.uid);
 assert.equal(b.jobs[0].damage,7);
});
