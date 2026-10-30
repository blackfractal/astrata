// Isolated, explicitly selected legal moves; never reads/writes the player's save.
import fs from 'node:fs/promises';
import { Game } from '../src/engine.mjs';
import { cards } from '../src/content.mjs';
const dir='snapshots/codex-hive-play';await fs.mkdir(dir,{recursive:true});
const file=dir+'/attempt.json';
let record;
if(process.argv[2]==='start'){
 const source=process.argv[3]||'snapshots/hive-drone-evaluation/baseline-73001.json';
 const initial=JSON.parse(await fs.readFile(source,'utf8')).initial;
 record={source,controller:'Codex selects every move through legal actions; no WeightedPolicy',initial,state:initial,decisions:[],checkpoints:[]};
}else record=JSON.parse(await fs.readFile(file,'utf8'));
if(process.argv[2]==='rewind'){
 const n=Number(process.argv[3]);
 await fs.writeFile(dir+'/branch-'+Date.now()+'.json',JSON.stringify(record));
 record.state=record.checkpoints[n];record.decisions=record.decisions.slice(0,n);record.checkpoints=record.checkpoints.slice(0,n);
}
const g=new Game(0,structuredClone(record.state));delete g.s.checkpoint;
if(process.argv[2]==='act'){
 const steps=JSON.parse(await fs.readFile(process.argv[3],'utf8'));
 for(const selector of steps){
  const matches=g.legal().filter(a=>Object.entries(selector).every(([k,v])=>k==='id'?g.s.battle.hand.find(c=>c.uid===a.uid)?.id===v:a[k]===v));
  if(matches.length!==1){console.log('MATCH ERROR',selector,matches.slice(0,8));process.exitCode=1;break;}
  const a=matches[0];record.checkpoints.push(structuredClone(g.s));record.decisions.push({selector,action:a});g.act(a);
  console.log('PLAYED',a.label,JSON.stringify(a));
 }
}
record.state=g.s;await fs.writeFile(file,JSON.stringify(record));
const b=g.s.battle,legal=g.legal();
const view=c=>{const d=cards[c.id];return {uid:c.uid,id:c.id,el:c.attuned||c.element,type:d.type,uses:c.used,remaining:g.allowance(c,b.grid.findIndex(s=>s.some(x=>x.uid===c.uid))),hp:c.hp,ward:c.ward,charges:c.charges,zeroWard:c.zeroWard,last:c.lastActivatedTurn};};
console.log(JSON.stringify({decisions:record.decisions.length,mode:g.s.mode,hp:g.s.hp,turn:b.turn,phase:b.phase,focus:b.focus,channel:b.channel,permanent:b.permanent,next:b.next,
 hand:b.hand.map(c=>({uid:c.uid,id:c.id,focus:cards[c.id].focus,limit:cards[c.id].limit,text:cards[c.id].text,effects:cards[c.id].effects})),
 grid:b.grid.flatMap((s,i)=>s.length?[{slot:i,row:Math.floor(i/7)+1,col:i%7+1,cards:s.map(view)}]:[]),
 shields:b.shields,bracelets:b.bracelets,armor:b.armorBlock,ideons:b.ideons.map(e=>({uid:e.uid,kind:e.kind,slot:e.slot,el:e.element,hp:e.hp,age:e.age,damage:e.kind==='drone'?e.damage+5*e.age:e.damage})),eggs:b.corruptions,
 reaction:b.reaction,actions:legal.filter(a=>!['place'].includes(a.type)),log:g.s.log.slice(-7)},null,2));
