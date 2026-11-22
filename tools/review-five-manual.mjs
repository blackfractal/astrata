// Explicit Codex decisions only. No policy/search imports; isolated snapshots.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root='snapshots/manual-five-20261111',mode=process.argv[2]||'view',run=process.argv[3]||'1';
if(!/^[1-5](?:-[a-z0-9]+)?$/.test(run))throw Error('Invalid run identifier');
if(mode==='init'){
 if(fs.existsSync(root))throw Error('Already initialized');
 fs.mkdirSync(root+'/src',{recursive:true});fs.cpSync('src',root+'/src',{recursive:true});
 const {Game}=await import(pathToFileURL(path.resolve(root+'/src/engine.mjs')).href);
 for(let n=1;n<=5;n++){const d=root+'/'+n;fs.mkdirSync(d);const g=new Game(11112600+n);fs.writeFileSync(d+'/initial.json',JSON.stringify(g.s));fs.writeFileSync(d+'/current.json',JSON.stringify(g.s));}
 fs.writeFileSync(root+'/protocol.json',JSON.stringify({version:JSON.parse(fs.readFileSync('package.json')).version,seeds:[1,2,3,4,5].map(n=>11112600+n),controller:'Codex manual legal selectors; no weighted policy, search, or retries',created:new Date().toISOString()}));
}
const {Game}=await import(pathToFileURL(path.resolve(root+'/src/engine.mjs')).href);
const {cards,items,enemies}=await import(pathToFileURL(path.resolve(root+'/src/content.mjs')).href);
const dir=root+'/'+run,g=new Game(0,JSON.parse(fs.readFileSync(dir+'/current.json')));
function match(a,s){return Object.entries(s).every(([k,v])=>k==='card'?g.s.battle?.hand.find(c=>c.uid===a.uid)?.id===v:JSON.stringify(a[k])===JSON.stringify(v));}
function act(a,reason){const s=g.s,b=s.mode==='battle'?s.battle:null;const before={step:s.steps,s:s.stratum,mode:s.mode,hp:s.hp,gold:s.gold,turn:b?.turn,phase:b?.phase};
 if(b){const f=dir+'/battle-'+b.enemies[0].uid+'.json';if(!fs.existsSync(f))fs.writeFileSync(f,JSON.stringify(s));}
 g.act(a);fs.appendFileSync(dir+'/decisions.jsonl',JSON.stringify({before,action:a,reason,after:{step:s.steps,mode:s.mode,hp:s.hp,gold:s.gold},messages:g.decisionLog})+'\n');
 fs.writeFileSync(dir+'/current.json',JSON.stringify(s)); if(s.mode==='result')fs.writeFileSync(dir+'/final.json',JSON.stringify(s));}
if(mode==='act'||mode==='query'){
 const input=JSON.parse(fs.readFileSync(0,'utf8'));
 for(const sel of input.selectors||[input]){const m=g.legal().filter(a=>match(a,sel));if(mode==='query'){console.log(JSON.stringify(m));continue;}if(m.length!==1){console.log(JSON.stringify({error:'selector must match exactly one',selector:sel,matches:m.slice(0,5)}));break;}act(m[0],input.reason||'Codex selected');}
 if(mode==='query')process.exit();
}
if(mode==='catalog'){const ids=process.argv.slice(4);console.log(JSON.stringify(ids.map(id=>cards[id]||items[id]||enemies[id])));process.exit();}
const o=g.observe(),b=o.mode==='battle'?o.battle:null;
if(mode==='inventory'){console.log(JSON.stringify({inventory:o.inventory,equipment:o.equipment,bonuses:o.bonuses}));process.exit();}
const common={run,step:o.steps,mode:o.mode,s:o.stratum,hp:o.hp,status:o.status,gold:o.gold,base:o.bonuses,archon:o.archon};
const selected=['place','activate','recall','equip','unequip','discardItem','move','upgrade','remove','socket','unsocket','sell','consume'];
const actions=g.legal().filter(a=>!selected.includes(a.type)).map(a=>({key:a.key,label:a.label,type:a.type,...Object.fromEntries(Object.entries(a).filter(([k])=>!['key','label','type','effects','costs'].includes(k)))}));
const grid=b?.grid.flatMap((stack,i)=>stack.map(c=>[i,c.id,c.uid,c.attuned||c.element,c.ward||c.hp,g.allowance(c,i),c.lastActivatedTurn,c.upgrade?'up':'',c.charge,c.status]));
const result={...common,...(b?{turn:b.turn,phase:b.phase,F:b.focus,C:b.channel,hand:b.hand.map(c=>[c.uid,c.id,c.upgrade?'up':'']),enemies:b.enemies.map(e=>[e.uid,e.name,e.hp,e.element,e.guard,e.tell,e.status]),grid,ideons:b.ideons.map(e=>({uid:e.uid,kind:e.kind,slot:e.slot,hp:e.hp,element:e.element,owner:e.owner,age:e.age})),corruptions:b.corruptions,telegraphs:b.telegraphs,reaction:b.reaction,shields:b.shields}:{field:o.mode==='field'?{round:o.field.round,x:o.field.x,y:o.field.y,moves:o.field.moves,stage:o.field.stage,preview:o.field.queue.slice(0,8),entities:o.field.entities.map(e=>({uid:e.uid,x:e.x,y:e.y,type:e.type,enemy:e.enemy,item:e.item,gold:e.gold,...(e.enemy?g.fieldEnemyPreview(e):{})}))}:undefined,shop:o.shop,reward:o.reward,event:o.event,deck:o.deck.map(c=>c.id+(c.upgrade?'+':'')),equipment:o.equipment,inventory:o.inventory}),actions,log:o.log.slice(-3)};
if(b){
 result.biles=b.biles;
 result.plans=b.enemies.filter(e=>e.bilePlan||e.phasePlan||e.corruptionPlan?.length).map(e=>({uid:e.uid,bile:e.bilePlan,phase:e.phasePlan,corruptions:e.corruptionPlan}));
 result.cardFlags=b.grid.flatMap((stack,slot)=>stack.filter(c=>c.lock||c.sever||c.freeze||c.zeroWard).map(c=>({slot,uid:c.uid,lock:c.lock,sever:c.sever,freeze:c.freeze,depleted:c.zeroWard})));
 result.piles={draw:b.deck.length,discard:b.discard.map(c=>c.id),destroyed:b.destroyed.map(c=>c.id)};
}
if(result.field)result.field.entities=result.field.entities.map(e=>[e.uid,e.x,e.y,e.type,e.enemy||e.item||e.gold,e.age,e.hp,e.count,e.movement||null]);
delete result.base; for (const a of result.actions) delete a.key; console.log(JSON.stringify(result));
