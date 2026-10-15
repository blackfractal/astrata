import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const dir='reports/codex-cnidarian-strong-3.0.13';
const sourceDir=path.resolve('.tmp/codex-cnidarian-scaling-rules');
await fs.mkdir(dir,{recursive:true});
const file=dir+'/attempt.json';
if(process.argv[2]==='start'){
  try{await fs.access(file);throw Error('Attempt already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
  await fs.mkdir(sourceDir,{recursive:true});const sources={};
  for(const n of (await fs.readdir('release/Astrata/resources/app/src')).filter(n=>n.endsWith('.mjs'))){
    sources[n]=await fs.readFile('release/Astrata/resources/app/src/'+n,'utf8');await fs.writeFile(path.join(sourceDir,n),sources[n]);
  }
  const {depthsFixture}=await import('./depths-fixture.mjs');
  const initial=depthsFixture(73001,'cnidarian').s;delete initial.checkpoint;
  const prior=JSON.parse(await fs.readFile('reports/codex-hive-3.0.11/attempt.json','utf8')).initial;
  const {default:assert}=await import('node:assert/strict');
  assert.deepEqual(initial.deck,prior.deck);assert.deepEqual(initial.inventory,prior.inventory);assert.deepEqual(initial.equipment,prior.equipment);
  await fs.writeFile(dir+'/sources.json',JSON.stringify(sources));
  await fs.writeFile(file,JSON.stringify({controller:'Codex manual legal-action selections',initial,state:structuredClone(initial),decisions:[],checkpoints:[]}));
}
const {Game}=await import(pathToFileURL(path.join(sourceDir,'engine.mjs')));
const {cards}=await import(pathToFileURL(path.join(sourceDir,'content.mjs')));
const r=JSON.parse(await fs.readFile(file,'utf8')),g=new Game(0,structuredClone(r.state));delete g.s.checkpoint;
let selectors=[];
if(['act','query'].includes(process.argv[2])){let input='';for await(const c of process.stdin)input+=c;selectors=JSON.parse(input);}
if(process.argv[2]==='act')for(const selector of selectors){
 const matches=g.legal().filter(a=>Object.entries(selector).every(([k,v])=>k==='id'?g.s.battle.hand.find(c=>c.uid===a.uid)?.id===v:a[k]===v));
 if(matches.length!==1){console.log('MATCH ERROR',selector,matches.slice(0,4));process.exitCode=1;break;}
 const a=matches[0];r.checkpoints.push(structuredClone(g.s));r.decisions.push({selector,action:a});g.act(a);console.log('PLAYED',a.label);
}
if(process.argv[2]==='query'){
 for(const selector of selectors)console.log(JSON.stringify(g.legal().filter(a=>Object.entries(selector).every(([k,v])=>a[k]===v))));
}else{
 r.state=g.s;await fs.writeFile(file,JSON.stringify(r));const b=g.s.battle;
 console.log(JSON.stringify({moves:r.decisions.length,mode:g.s.mode,hp:g.s.hp,turn:b.turn,phase:b.phase,focus:b.focus,channel:b.channel,permanent:b.permanent,next:b.next,status:g.s.status,
 enemies:b.enemies.map(e=>({uid:e.uid,hp:e.hp,status:e.status,tell:g.tell(e),tentacleKills:e.tentacleKills})),
 hand:b.hand.map(c=>({uid:c.uid,id:c.id,up:c.upgrade,focus:cards[c.id].focus})),
 grid:b.grid.flatMap((s,i)=>s.length?[{slot:i,cards:s.map(c=>({id:c.id,uid:c.uid,el:c.attuned||c.element,uses:c.used,left:g.allowance(c,i),hp:c.hp,ward:c.ward,charge:c.charge,zero:c.zeroWard,last:c.lastActivatedTurn}))}]:[]),
 shields:b.shields,bracelets:b.bracelets,armor:b.armorBlock,ideons:b.ideons.filter(e=>e.hp>0).map(e=>({uid:e.uid,slot:e.slot,el:e.element,hp:e.hp,age:e.age,status:e.status})),corruptions:b.corruptions,reaction:b.reaction,
 actions:g.legal().filter(a=>!['place','activate','transmute','equip','unequip','recall'].includes(a.type)),
 log:g.s.log.slice(-4)}));
}
