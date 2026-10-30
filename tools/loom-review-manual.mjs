// Codex selects legal actions; no policy, search, seed peeking or live profile.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const seed=process.argv[3];
const dir='snapshots/loom-balance-20261023/'+seed;
fs.mkdirSync(dir,{recursive:true});
const file=dir+'/current.json',mode=process.argv[2]||'view';
if(mode==='start'){
 if(fs.existsSync(file))throw Error('Run already exists');
 const {Game}=await import('../src/engine.mjs');
 const g=new Game(seed);
 fs.writeFileSync(dir+'/initial.json',JSON.stringify(g.s));
 fs.writeFileSync(file,JSON.stringify(g.s));
 const source={};for(const n of fs.readdirSync('src').filter(n=>n.endsWith('.mjs')))source[n]=fs.readFileSync('src/'+n,'utf8');
 fs.writeFileSync(dir+'/sources.json',JSON.stringify(source));
}
const frozen=path.resolve('.tmp/loom-review-'+seed+'/src');
fs.mkdirSync(frozen,{recursive:true});
for(const [name,source]of Object.entries(JSON.parse(fs.readFileSync(dir+'/sources.json','utf8'))))fs.writeFileSync(path.join(frozen,name),source);
const {Game}=await import(pathToFileURL(path.join(frozen,'engine.mjs')).href);
const {cards}=await import(pathToFileURL(path.join(frozen,'content.mjs')).href);
const g=new Game(0,JSON.parse(fs.readFileSync(file,'utf8')));
const write=()=>fs.writeFileSync(file,JSON.stringify(g.s));
function play(a,reason){
 const s=g.s,b=s.mode==='battle'?s.battle:null;
 const before={step:s.steps,stratum:s.stratum,floor:s.apex?.floor,mode:s.mode,hp:s.hp,gold:s.gold,turn:b?.turn,phase:b?.phase};
 if(b && !fs.existsSync(dir+'/battle-'+b.enemies[0].uid+'.json'))fs.writeFileSync(dir+'/battle-'+b.enemies[0].uid+'.json',JSON.stringify(s));
 g.act(a);
 const after={step:s.steps,mode:s.mode,hp:s.hp,gold:s.gold};
 fs.appendFileSync(dir+'/decisions.jsonl',JSON.stringify({before,action:a,reason,after,state:g.s})+'\n');
 write();
 if(s.mode==='result')fs.writeFileSync(dir+'/final.json',JSON.stringify({state:s,observation:g.observe(),legal:g.legal()}));
}
if(mode==='act'||mode==='query'){
 const input=JSON.parse(fs.readFileSync(0,'utf8')),selectors=input.selectors||input;
 for(const sel of selectors){
  const matches=g.legal().filter(a=>Object.entries(sel).every(([k,v])=>k==='id'&&a.type==='place'?g.s.battle?.hand.find(c=>c.uid===a.uid)?.id===v:JSON.stringify(a[k])===JSON.stringify(v)));
  if(mode==='query'){console.log(JSON.stringify(matches));continue;}
  if(matches.length!==1){console.log(JSON.stringify({error:'Ambiguous/illegal selector',sel,matches:matches.slice(0,8)}));break;}
  play(matches[0],input.reason||'Codex selected');console.log('PLAYED '+matches[0].label);
 }
}
if(mode==='query')process.exit(0);
const o=g.observe(),b=o.mode==='battle'?o.battle:null;
console.log(JSON.stringify({mode:o.mode,hp:o.hp,status:o.status,turn:b?.turn,phase:b?.phase,focus:b?.focus,channel:b?.channel,
 hand:b?.hand.map(c=>[c.id,c.uid,c.upgrade?'up':'']),enemies:b?.enemies.map(e=>({uid:e.uid,hp:e.hp,tell:e.tell,bile:e.bilePlan})),
 grid:b?.grid.flatMap((s,i)=>s.length?[[i,...s.map(c=>[c.id,g.allowance(c,i),c.hp||c.ward||0,c.attuned||c.element])]]:[]),
 hazards:b?.corruptions,biles:b?.biles,reaction:b?.reaction,
 actions:g.legal().filter(a=>!['place','activate','recall'].includes(a.type)).map(({key,effects,costs,...a})=>a), log:o.log.slice(-3)}));
