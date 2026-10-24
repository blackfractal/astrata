// Read-only analysis and isolated one-action counterfactuals, not an AI playthrough.
import fs from 'node:fs';
import {Game as CurrentGame} from '../src/engine.mjs';
import {enemies as currentEnemies,items} from '../src/content.mjs';
import {Game} from '../.tmp/growth-manual-replay-17101703/src/engine.mjs';
import {enemies} from '../.tmp/growth-manual-replay-17101703/src/content.mjs';
const dir='reports/codex-growth-manual-17101703';
const g=new Game(0,JSON.parse(fs.readFileSync(`${dir}/initial.json`,'utf8')));
const ds=fs.readFileSync(`${dir}/decisions.jsonl`,'utf8').trim().split('\n').map(JSON.parse);
const mirror=[],activations={},checks={};
for(const d of ds){
 const a=g.legal().find(a=>a.key===d.action.key);
 if(!a)throw Error('Replay mismatch '+d.before.step);
 if(a.type==='armor'&&g.getItem(a.uid)?.id==='mirrorArmor')mirror.push({step:g.s.steps,stratum:g.s.stratum,turn:g.s.battle.turn,attack:g.s.battle.reaction.name,damage:g.s.battle.reaction.damage,element:g.s.battle.reaction.element});
 if(a.type==='activate'){
  const id=g.s.battle.grid[a.slot].at(-1).id;
  const key=`S${g.s.stratum}:${id}`;activations[key]=(activations[key]||0)+1;
 }
 if(g.s.steps===723)checks.declinedItem={offer:g.observe().itemOffer,definitions:g.observe().itemOffer.map(id=>({id,name:items[id]?.name}))};
 if(g.s.steps===1197){
  const h=new CurrentGame(0,structuredClone(g.s));
  const oldTarget=g.s.battle.enemies.find(e=>e.uid===278);
  const newTarget=h.s.battle.enemies.find(e=>e.uid===278);
  const hp=oldTarget.hp;
  const b=new Game(0,structuredClone(g.s));b.act(a);
  const revised=h.legal().find(x=>x.key===a.key);h.act(revised);
  checks.forkedAttack={step:1197,originalDamage:hp-b.s.battle.enemies.find(e=>e.uid===278).hp,revisedDamage:hp-newTarget.hp,originalRoute:a.effects.route,revisedRoute:revised.effects.route,channelCost:revised.costs.channel};
 }
 if(g.s.steps>=1403&&g.s.steps<=1410)checks['finalHiveReaction'+g.s.steps]={reaction:structuredClone(g.s.battle.reaction),hp:g.s.hp};
 g.act(a);
}
const matchedS2=[];
for(const file of fs.readdirSync(dir).filter(n=>/^battle-.*\.json$/.test(n))){
 const state=JSON.parse(fs.readFileSync(`${dir}/${file}`,'utf8'));
 if(state.stratum!==2||state.battle.enemies.some(e=>e.tier!=='Mote'))continue;
 const h=new CurrentGame(0,structuredClone(state));
 for(const e of h.s.battle.enemies){const added=currentEnemies[e.id].hp-enemies[e.id].hp;e.hp+=added;e.maxHp+=added;}
 let stopped=null,played=0;
 const original=ds.filter(d=>d.before.step>=state.steps);
 for(const d of original){
  if(d.before.mode!=='battle'||h.s.mode!=='battle')break;
  const a=h.legal().find(a=>a.key===d.action.key);
  if(!a){stopped={step:d.before.step,label:d.action.label};break;}
  h.act(a);played++;
 }
 matchedS2.push({file,startStep:state.steps,played,stopped,mode:h.s.mode,hp:h.s.hp,enemies:h.s.battle.enemies.map(e=>({name:e.name,hp:e.hp,maxHp:e.maxHp})),note:'Fixed original decisions; no adaptation after divergence. Existing build, draw and RNG preserved; only fresh enemy HP adjusted.'});
}
const result={mirror,activations,checks,matchedS2,s2Hp:Object.values(enemies).filter(e=>e.stratum===2&&e.tier==='Mote'&&!e.tutorialOnly).map(e=>({id:e.id,name:e.name,before:e.hp,after:currentEnemies[e.id].hp})),mirrorPrice:items.mirrorArmor.worth,hiveFinalWard:g.s.battle.grid.flat().filter(c=>c.ward).map(c=>({id:c.id,ward:c.ward,element:c.element})),encounters:g.s.stats.encounters};
fs.writeFileSync('reports/growth-manual-diagnostics.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({mirrorUses:mirror.length,mirrorRawIncoming:mirror.reduce((n,e)=>n+e.damage,0),matchedS2,s2Hp:result.s2Hp,forked:checks.forkedAttack,hiveFinalWard:result.hiveFinalWard},null,2));
