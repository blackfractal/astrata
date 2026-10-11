import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Game} from '../../../../src/engine.mjs';
const root=new URL('./',import.meta.url);
const events=fs.readFileSync(new URL('events.jsonl',root),'utf8').trim().split('\n').map(JSON.parse);
const start=JSON.parse(fs.readFileSync(new URL('battle-start.json',root),'utf8'));
function load(s=start){return new Game(0,{...structuredClone(s),history:[],log:[]});}
const baseline=load();
for(const e of events.slice(169,225)){
 const a=baseline.legal().find(a=>a.key===e.action.key);assert.ok(a,e.action.label);baseline.act(a);
 assert.equal(baseline.s.hp,e.state.hp);assert.equal(baseline.s.battle.enemies[0].hp,e.state.battle.enemies[0].hp);
}
assert.equal(baseline.s.hp,29);assert.equal(baseline.s.mode,'reward');
console.log('Verified Jonathan replay: turn8,29HP.');
export function trial(){
 const g=load(),actions=[];
 function act(type,props={}){
  const a=g.legal().find(a=>a.type===type && Object.entries(props).every(([k,v])=>a[k]===v));
  assert.ok(a,JSON.stringify({type,props,legal:g.legal()}));
  const before={turn:g.s.battle.turn,hp:g.s.hp,enemy:g.s.battle.enemies[0].hp};
  g.act(a);actions.push({before,action:a,after:{turn:g.s.battle.turn,hp:g.s.hp,enemy:g.s.battle.enemies[0].hp}});
 }
 function place(id,slot){const c=g.s.battle.hand.find(c=>c.id===id);assert.ok(c,JSON.stringify({missing:id,hand:g.s.battle.hand}));act('place',{uid:c.uid,slot});}
 function activate(slot,element){act('activate',{slot,...element?{element}:{}});}
 function defend(preserve=false){let guard=0;while(g.s.mode==='battle'&&g.s.battle.phase==='enemy'&&guard++<30){const opts=g.legal();let a= !preserve && opts.find(a=>a.type==='intercept');a ||= opts.find(a=>a.type==='bracelet') || opts.find(a=>a.type==='skipEquipment');assert.ok(a,JSON.stringify(opts));act(a.type,Object.fromEntries(['uid','slot'].filter(k=>a[k]!=null).map(k=>[k,a[k]])));}}
 function print(){console.log(JSON.stringify({turn:g.s.battle.turn,phase:g.s.battle.phase,hp:g.s.hp,enemy:g.s.battle.enemies[0].hp,hand:g.s.battle.hand,grid:g.s.battle.grid.flatMap((s,i)=>s.map(c=>({slot:i,id:c.id,hp:c.hp,used:c.used}))),legal:g.legal().filter(a=>a.type!=='place')},null,2));}
 return {g,actions,act,place,activate,defend,print};
}
const t=trial();
t.defend();
t.place('cinder',19);t.place('ignis',17);t.act('activatePhase');t.activate(19);t.activate(17);t.act('endTurn');t.defend();
t.place('sapling',18);t.act('activatePhase');t.activate(19);t.activate(18);t.act('endTurn');t.defend(true);
t.place('bloom',11);t.act('activatePhase');t.activate(18);t.activate(11);t.act('endTurn');t.defend();
t.act('activatePhase');t.activate(17);
t.print();
fs.writeFileSync(new URL('alternative-no-consumable.json',root),JSON.stringify({actions:t.actions,result:{hp:t.g.s.hp,turn:t.g.s.battle.turn,mode:t.g.s.mode}},null,2));
const p=trial();p.defend();
p.place('cinder',19);p.place('ignis',17);p.act('activatePhase');p.activate(19);p.activate(17);p.act('endTurn');p.defend();
p.act('consume',{uid:37});p.place('sapling',18);p.place('shield',11);p.act('activatePhase');p.activate(18);p.activate(11,'Earth');p.act('endTurn');
while(p.g.s.battle.phase==='enemy'){
 const a=p.g.legal().find(a=>a.type==='block') || p.g.legal().find(a=>a.type==='bracelet') || p.g.legal().find(a=>a.type==='skipEquipment');
 assert.ok(a);p.act(a.type,Object.fromEntries(['uid','slot'].filter(k=>a[k]!=null).map(k=>[k,a[k]])));
}
p.place('bloom',12);p.act('activatePhase');p.activate(18);p.activate(12);p.act('endTurn');p.defend();
p.act('activatePhase');p.activate(19);p.activate(17);
assert.equal(p.g.s.mode,'reward');
console.log('Potion line',p.g.s.hp,'HP, turn',p.g.s.battle.turn);
fs.writeFileSync(new URL('alternative-focus-draught.json',root),JSON.stringify({actions:p.actions,result:{hp:p.g.s.hp,turn:p.g.s.battle.turn,mode:p.g.s.mode}},null,2));

