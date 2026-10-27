import fs from 'node:fs';import assert from 'node:assert/strict';
import {Game} from '../../src/engine.mjs';import {cards,items} from '../../src/content.mjs';import {WeightedPolicy} from '../../src/policy.mjs';
export const start=JSON.parse(fs.readFileSync(new URL('../../snapshots/current-depths-fight/start.json',import.meta.url)));
export const event=JSON.parse(fs.readFileSync(new URL('../../snapshots/current-depths-fight/event.json',import.meta.url)));
export function trial(s=start){const g=new Game(0,structuredClone(s));delete g.s.checkpoint;const actions=[];
function act(type,props={}){const a=g.legal().find(a=>a.type===type&&Object.entries(props).every(([k,v])=>a[k]===v));assert.ok(a,JSON.stringify({type,props,turn:g.s.battle?.turn}));step(a);}
function step(a){const before={turn:g.s.battle?.turn,hp:g.s.hp,enemy:g.s.battle?.enemies.map(e=>({id:e.id,hp:e.hp})),ideons:g.s.battle?.ideons?.map(e=>({kind:e.kind,hp:e.hp,slot:e.slot}))};g.act(a);actions.push({before,action:a,after:{turn:g.s.battle?.turn,hp:g.s.hp,mode:g.s.mode},messages:g.decisionLog});}
function place(id,slot,element){const c=g.s.battle.hand.find(c=>c.id===id);assert.ok(c,'No '+id);act('place',{uid:c.uid,slot,...element?{placementElement:element}:{}});}
function activate(slot,props={}){act('activate',{slot,...props});}
function print(){const b=g.s.battle;console.log(JSON.stringify({hp:g.s.hp,turn:b.turn,phase:b.phase,focus:b.focus,channel:b.channel,hand:b.hand.map(c=>({uid:c.uid,id:c.id})),grid:b.grid.flatMap((s,i)=>s.map(c=>({slot:i,id:c.id,used:c.used,hp:c.hp,ward:c.ward}))),corruptions:b.corruptions,enemies:b.enemies,ideons:b.ideons,legal:g.legal().filter(a=>a.type!=='place')},null,2));}
function save(name){fs.writeFileSync(new URL('../../snapshots/current-depths-fight/'+name+'.json',import.meta.url),JSON.stringify({actions,result:{mode:g.s.mode,hp:g.s.hp,turn:g.s.battle?.turn,damageTaken:g.s.stats.damageTaken-start.stats.damageTaken}},null,2));}
return{g,actions,act,step,place,activate,print,save};}
if(process.argv.includes('--baseline')){console.log(JSON.stringify(Object.fromEntries(['square','familiar','water','rain','storm','blast','shield','lucidGuide','thorn','rot','holyArmor'].map(id=>[id,cards[id]||items[id]])),null,2));for(const idx of [0,1]){const e=new Game(0,structuredClone(event));e.act(e.legal().find(a=>a.type==='eventChoice'&&a.index===idx));const t=trial(e.s),p=new WeightedPolicy();for(let n=0;n<700&&t.g.s.mode==='battle';n++){const o=t.g.observe(),a=t.g.legal().filter(a=>a.type!=='consume');t.step(p.choose(o,a).action);}t.save('baseline-'+idx);console.log('baseline',idx,t.g.s.mode,t.g.s.hp,t.g.s.battle.turn);}}

