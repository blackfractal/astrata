import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {Game} from './replay/engine.mjs';
import {cards,items} from './replay/content.mjs';
const root=new URL('./',import.meta.url);
export const events=zlib.gunzipSync(fs.readFileSync(new URL('events.jsonl.gz',root))).toString().trim().split('\n').map(JSON.parse);
export const load=(i)=>new Game(0,{...structuredClone(events[i].state),history:[],log:[]});
const g=load(1257);
for(let i=1258;i<=1419;i++){
 const e=events[i],a=g.legal().find(a=>a.key===e.action.key);
 assert.ok(a,`legal replay ${i} ${e.action.label}`);g.act(a);
 assert.equal(g.s.hp,e.state.hp,`HP ${i}`);
 assert.deepEqual(g.s.battle.enemies.map(e=>e.hp),e.state.battle.enemies.map(e=>e.hp),`enemies ${i}`);
}
const totals={hpStart:events[1257].state.hp,hpEnd:g.s.hp,damageTaken:0,healing:0,damageSources:{},defenseSources:{},activations:{},recalls:[],undertows:[],repairs:[],anger:[],destroyed:[],turns:{}};
for(let i=1258;i<=1419;i++){
 const e=events[i],p=events[i-1].state,s=e.state,a=e.action,b=p.battle;
 const hpByEnemy = new Map(b.enemies.map(e => [e.uid, Math.max(0, e.hp)]));
 const turn=totals.turns[b.turn] ||= {hpStart:p.hp,hpEnd:s.hp,damage:0,taken:0,healing:0,actions:[],enemyEnd:[]};
 const damage=s.stats.damageDealt-p.stats.damageDealt,taken=s.stats.damageTaken-p.stats.damageTaken,healing=s.hp-p.hp+taken;
 turn.hpEnd=s.hp;turn.damage+=damage;turn.taken+=taken;turn.healing+=healing;turn.enemyEnd=s.battle.enemies.map(x=>({name:x.name,hp:x.hp}));
 turn.actions.push({event:i,type:a.type,label:a.label,damage,hpChange:s.hp-p.hp});
 totals.damageTaken+=taken;totals.healing+=healing;
 if(a.type==='activate'){const id=b.grid[a.slot].at(-1).id;totals.activations[id]=(totals.activations[id]||0)+1;}
 if(a.type==='recall')totals.recalls.push({event:i,turn:b.turn,cards:b.grid[a.slot].map(c=>c.id),cost:a.costs.focus});
 if(a.type==='place'&&b.hand.find(c=>c.uid===a.uid)?.id==='undertow')totals.undertows.push({event:i,turn:b.turn,cards:b.grid[a.slot].map(c=>({id:c.id,used:c.used,charge:c.charge,ward:c.ward})),cost:a.costs.focus});
 for(const f of e.effects||[]){
  if(f.kind==='hit'&&f.target==='enemy'){
   let source=f.sourceItem?items[p.inventory.find(x=>x.uid===f.sourceItem)?.id]?.name:null;
   source ||= f.statusTick || (a.type==='activate'?cards[b.grid[a.slot].at(-1).id].name:null) || 'Automatic/status';
   const entry=totals.damageSources[source] ||= {amount:0,hpLost:0,hits:0};entry.amount+=f.amount;entry.hpLost+=Math.min(hpByEnemy.get(f.uid)||0,f.amount);entry.hits++;
   hpByEnemy.set(f.uid, Math.max(0,(hpByEnemy.get(f.uid)||0)-f.amount));
  }
  if(f.kind==='defend'||f.kind==='hit'&&f.target==='card'&&f.attackPath){
   const name=f.item?items[p.inventory.find(x=>x.uid===f.item)?.id]?.name:cards[b.grid[f.slot]?.at(-1)?.id]?.name;
   if(name){const entry=totals.defenseSources[name] ||= {guardStopped:0,loss:0,uses:0};if(f.kind==='defend')entry.guardStopped+=f.amount||0;entry.loss+=f.loss||0;entry.uses++;}
  }
 }
 for(const c of s.battle.destroyed)if(!b.destroyed.some(x=>x.uid===c.uid))totals.destroyed.push({event:i,turn:b.turn,id:c.id,messages:e.messages});
}
totals.repairs=g.s.stats.repairs.slice(events[1257].state.stats.repairs.length);
totals.anger=g.s.stats.angerActivations.slice(events[1257].state.stats.angerActivations?.length||0);
fs.writeFileSync(new URL('boss-analysis.json',root),JSON.stringify(totals,null,2));
console.log(JSON.stringify({...totals,turns:Object.entries(totals.turns).map(([turn,t])=>({turn,...t,actions:undefined})),destroyed:totals.destroyed.map(x=>({...x,messages:undefined}))},null,2));
