// Codex selects legal actions; no policy, search, seed peeking or live profile.
import fs from 'node:fs';
import path from 'node:path';
import {Game} from '../src/engine.mjs';
import {cards,items,VERSION} from '../src/content.mjs';
const dir='snapshots/codex-fullrun-4.0.2-second';
fs.mkdirSync(dir,{recursive:true});
const file=dir+'/current.json',mode=process.argv[2]||'view';
if(mode==='start'){
 if(fs.existsSync(file))throw Error('Run already exists');
 const g=new Game(885553835);
 fs.writeFileSync(dir+'/initial.json',JSON.stringify(g.s));
 fs.writeFileSync(file,JSON.stringify(g.s));
 const source={};for(const n of fs.readdirSync('src').filter(n=>n.endsWith('.mjs')))source[n]=fs.readFileSync('src/'+n,'utf8');
 fs.writeFileSync(dir+'/sources.json',JSON.stringify(source));
}
const g=new Game(0,JSON.parse(fs.readFileSync(file,'utf8')));
const write=()=>fs.writeFileSync(file,JSON.stringify(g.s));
function play(a,reason){
 const s=g.s,b=s.mode==='battle'?s.battle:null;
 const before={step:s.steps,stratum:s.stratum,floor:s.apex?.floor,mode:s.mode,hp:s.hp,gold:s.gold,turn:b?.turn,phase:b?.phase};
 if(b && !fs.existsSync(dir+'/battle-'+b.enemies[0].uid+'.json'))fs.writeFileSync(dir+'/battle-'+b.enemies[0].uid+'.json',JSON.stringify(s));
 g.act(a);
 const after={step:s.steps,mode:s.mode,hp:s.hp,gold:s.gold};
 fs.appendFileSync(dir+'/decisions.jsonl',JSON.stringify({before,action:a,reason,after})+'\n');
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
if(mode==='replay'){
 // Reuse the first run's already-authored S1 decisions only, stopping on any divergence.
 const old=JSON.parse(fs.readFileSync('snapshots/codex-fullrun-4.0.1-1792172183724/final.json','utf8')).state.history;
 const {Game:OldGame}=await import('../snapshots/codex-fullrun-4.0.1-1792172183724/app/src/engine.mjs');
 const prior=new OldGame(885553835);
 for(let i=0;i<g.s.steps;i++)prior.act(prior.legal().find(a=>a.key===old[i]));
 let n=0;
 while(g.s.stratum===1&&g.s.mode!=='result'){
  const key=old[g.s.steps];if(!key)break;
  const previous=prior.legal().find(a=>a.key===key);
  let a=g.legal().find(a=>a.key===key);
  // Stable shop slots change indices, not the purchase itself.
  if(previous?.type==='buy')a=g.legal().find(a=>a.type==='buy'&&a.effects.item===previous.effects.item);
  if(!a){console.log('REPLAY STOP '+key);break;}
  play(a,'Reused first run decision (unchanged S1 baseline)');prior.act(previous);n++;
 }
 console.log('REPLAYED '+n+' legal decisions');
}
if(mode==='query')process.exit(0);
const o=g.observe(),b=o.mode==='battle'?o.battle:null;
console.log(JSON.stringify({step:o.steps,mode:o.mode,stratum:o.stratum,floor:o.apex?.floor,hp:o.hp,gold:o.gold,bonuses:o.bonuses,status:o.status,
 equipment:o.equipment,
 ...(b?{battle:{turn:b.turn,phase:b.phase,focus:b.focus,channel:b.channel,permanent:b.permanent,next:b.next,
 hand:b.hand.map(c=>({...c,name:cards[c.id].name,focus:cards[c.id].focus})),
 enemies:b.enemies.map(e=>({uid:e.uid,name:e.name,id:e.id,hp:e.hp,maxHp:e.maxHp,guard:e.guard,el:e.element,tell:e.tell,status:e.status})),
 grid:b.grid.flatMap((s,i)=>s.length?[{slot:i,cards:s.map(c=>({id:c.id,uid:c.uid,el:c.attuned||c.element,hp:c.hp,ward:c.ward,charge:c.charge,left:g.allowance(c,i),usedTurn:c.lastActivatedTurn,up:c.upgrade}))}]:[]),
 ideons:b.ideons,corruptions:b.corruptions,telegraphs:b.telegraphs,reaction:b.reaction,shields:b.shields}}:{field:o.field,shop:o.shop,reward:o.reward,event:o.event}),
 actions:g.legal().filter(a=>!['place','activate','recall','equip','unequip','discardItem','move','upgrade','remove','socket','unsocket'].includes(a.type)).map(({key,effects,costs,...a})=>a),log:o.log.slice(-6)}));
