import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {Game} from '../src/engine.mjs';
import {WeightedPolicy} from '../src/policy.mjs';
import {cards,items,VERSION} from '../src/content.mjs';
const dir=process.argv[2]||'reports/supplies-campaigns-4.0.14';
fs.mkdirSync(dir,{recursive:true});
const sources=Object.fromEntries(fs.readdirSync('src').filter(n=>n.endsWith('.mjs')).map(n=>[n,fs.readFileSync('src/'+n,'utf8')]));
fs.writeFileSync(dir+'/sources.json',JSON.stringify(sources));
const policy=new WeightedPolicy();
const summaries=[];
function fork(g){const t=Object.create(Game.prototype);t.s=structuredClone(g.s);t.presentation=[];t.decisionLog=[];return t;}
function evaluation(s,start){
 if(s.mode==='result')return s.outcome==='win'?100000:-100000;
 if(s.mode!=='battle')return 10000+s.hp*6;
 const b=s.battle;
 let n=s.hp*6-b.enemies.reduce((n,e)=>n+Math.max(0,e.hp)*0.7+(e.hp>0?15:0),0);
 n-=b.ideons?.reduce((n,e)=>n+(e.hp>0?8+Math.max(0,6-e.slot%7)*1.5:0),0)||0;
 n-=s.status.burn*4+s.status.poison*8+s.status.corrode*12;
 n+=(b.permanent.focus||0)*16+(b.next.insight||0)*3;
 n+=Math.min(60,b.grid.flat().reduce((n,c)=>n+Math.max(0,c.ward||0),0))*0.5;
 for(const stack of b.grid){const c=stack.at(-1);if(!c)continue;const d=cards[c.id];n+=d.type==='Ally'?Math.max(0,c.hp)*0.6:0;n+=c.used<d.limit&&!c.zeroWard?Math.min(5,d.focus+1):0;}
 n-=b.destroyed.length*0.8;
 return n;
}
function choose(g){
 const o=g.observe(),legal=g.legal(),b=g.s.battle;
 const ordinary=policy.choose(o,legal);
 if(g.s.mode!=='battle'||b.reaction||b.inspiration||!['place','activate'].includes(b.phase))return ordinary;
 const scored=legal.map(a=>{let score;try{score=policy.score(o,a)[0];}catch{score=-1;}return {a,score};}).sort((a,b)=>b.score-a.score);
 const candidates=[ordinary.action],seen=new Set([ordinary.action.key]),groups=new Map();
 for(const {a}of scored){const group=a.type==='place'?'place:'+a.effects.card:a.type==='activate'?'activate:'+a.slot:a.type==='consume'?'consume:'+a.uid:a.type;
  if((groups.get(group)||0)>=2||seen.has(a.key))continue;groups.set(group,(groups.get(group)||0)+1);candidates.push(a);seen.add(a.key);if(candidates.length>=6)break;}
 let best=-Infinity,action=ordinary.action;
 for(const a of candidates){const t=fork(g);t.act(a);let steps=0;
  while(t.s.mode==='battle'&&t.s.battle.turn===b.turn&&steps++<70){const d=policy.choose(t.observe(),t.legal());if(!d)break;t.act(d.action);}
  const score=evaluation(t.s,g.s);
  if(score>best){best=score;action=a;}
 }
 return {action,reason:'Automated six-candidate turn rollout; value '+best.toFixed(2)+'. '+ordinary.reason};
}
for(let index=0;index<10;index++){
 const seed=24102501+index,runDir=dir+'/run-'+seed;fs.mkdirSync(runDir,{recursive:true});
 const g=new Game(seed),initial=structuredClone(g.s),trace=[];fs.writeFileSync(runDir+'/initial.json',JSON.stringify(initial));
 const start=Date.now();
 for(let step=0;step<12000&&g.s.mode!=='result';step++){
  const before={hp:g.s.hp,stratum:g.s.stratum,mode:g.s.mode,turn:g.s.battle?.turn};
  const decision=choose(g);if(!decision)throw Error('No action '+seed);
  g.act(decision.action);trace.push({action:decision.action,reason:decision.reason,before,after:{hp:g.s.hp,mode:g.s.mode}});
  if(step%100===0){fs.writeFileSync(runDir+'/checkpoint.json',JSON.stringify(g.s));console.log(seed,'step',step,'S'+g.s.stratum,g.s.mode,g.s.hp);}
 }
 if(g.s.mode!=='result')throw Error('Nonterminal run '+seed);
 fs.writeFileSync(runDir+'/actions.json',JSON.stringify(trace));fs.writeFileSync(runDir+'/final.json',JSON.stringify(g.s));
 const replay=new Game(0,initial);for(const x of trace)replay.act(x.action);
 const hash=s=>createHash('sha256').update(JSON.stringify(s)).digest('hex');
 if(hash(replay.s)!==hash(g.s))throw Error('Replay mismatch '+seed);
 const summary={seed,version:VERSION,outcome:g.s.outcome,stratum:g.s.stratum,hp:g.s.hp,steps:trace.length,elapsedMs:Date.now()-start,encounters:g.s.stats.encounters,consumables:g.s.stats.consumablesUsed||[],deck:g.s.deck.map(c=>c.id),inventory:g.s.inventory,equipment:g.s.equipment,death:g.s.death,replayHash:hash(g.s)};
 summaries.push(summary);fs.writeFileSync(dir+'/summary.json',JSON.stringify(summaries,null,2));console.log('FINISHED',seed,g.s.outcome,'S'+g.s.stratum,trace.length);
}
