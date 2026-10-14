import fs from 'node:fs/promises';
import {Game} from '../src/engine.mjs';
import {cards,VERSION} from '../src/content.mjs';
import {depthsFixture} from './depths-fixture.mjs';
const dir='reports/codex-hive-3.0.11';await fs.mkdir(dir,{recursive:true});const file=dir+'/attempt.json';
let r;
if(process.argv[2]==='start'){
 try{await fs.access(file);throw Error('Attempt already exists; do not overwrite');}catch(e){if(e.code!=='ENOENT')throw e;}
 const g=depthsFixture(73001,'mindHive');r={version:VERSION,controller:'Codex manual legal decisions',initial:structuredClone(g.s),state:g.s,decisions:[],checkpoints:[]};
 const sources={};for(const n of (await fs.readdir('src')).filter(n=>n.endsWith('.mjs')))sources[n]=await fs.readFile('src/'+n,'utf8');await fs.writeFile(dir+'/sources.json',JSON.stringify(sources));
}else r=JSON.parse(await fs.readFile(file,'utf8'));
const g=new Game(0,structuredClone(r.state));delete g.s.checkpoint;
if(process.argv[2]==='act'){
 let input='';for await(const c of process.stdin)input+=c;
 for(const selector of JSON.parse(input)){
  const matches=g.legal().filter(a=>Object.entries(selector).every(([k,v])=>k==='id'?g.s.battle.hand.find(c=>c.uid===a.uid)?.id===v:a[k]===v));
  if(matches.length!==1){console.log('MATCH ERROR',selector,matches.slice(0,5));process.exitCode=1;break;}
  const a=matches[0];r.checkpoints.push(structuredClone(g.s));r.decisions.push({selector,action:a});g.act(a);console.log('PLAYED',a.label,JSON.stringify(a));
 }
}
if(process.argv[2]==='reserve'){
 // Explicit Codex instruction: accept only 1-damage chip hits, preserving
 // equipment and Ward for the already visible large attacks. Stop at any other decision.
 while(g.s.mode==='battle'&&g.s.battle.reaction?.damage===1){
  const a=g.legal().find(a=>a.type==='armor')||g.legal().find(a=>a.type==='skipEquipment');if(!a)break;
  r.checkpoints.push(structuredClone(g.s));r.decisions.push({selector:{key:a.key},action:a,reason:'Reserve defenses for visible large attacks'});g.act(a);console.log('PLAYED',a.label);
 }
}
r.state=g.s;await fs.writeFile(file,JSON.stringify(r));
const b=g.s.battle;
console.log(JSON.stringify({moves:r.decisions.length,mode:g.s.mode,hp:g.s.hp,turn:b.turn,phase:b.phase,focus:b.focus,channel:b.channel,permanent:b.permanent,next:b.next,
 hand:b.hand.map(c=>({uid:c.uid,id:c.id,focus:cards[c.id].focus,text:cards[c.id].text})),
 grid:b.grid.flatMap((s,i)=>s.length?[{slot:i,cards:s.map(c=>({id:c.id,el:c.attuned||c.element,uses:c.used,limit:g.allowance(c,i),hp:c.hp,ward:c.ward,zero:c.zeroWard,last:c.lastActivatedTurn}))}]:[]),
 shields:b.shields,bracelets:b.bracelets,armor:b.armorBlock,ideons:b.ideons.map(e=>({uid:e.uid,kind:e.kind,slot:e.slot,el:e.element,hp:e.hp,age:e.age,damage:e.kind==='drone'?e.damage+5*e.age:e.damage})),eggs:b.corruptions,reaction:b.reaction,
 actions:g.legal().filter(a=>!['place','activate','transmute','equip','unequip','recall'].includes(a.type)),
 activations:g.legal().filter(a=>['activate','transmute','recall'].includes(a.type)).map(a=>({type:a.type,slot:a.slot,target:a.target,element:a.element,destination:a.destination})),log:g.s.log.slice(-5)}));
