import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {Game} from '../../snapshots/apex-500-review-4.0.13/rules/engine.mjs';
import {activate,defend,setConfig} from './search.mjs';
import {planPlace,configure} from './placement.mjs';
const dir='snapshots/apex-500-review-4.0.13';
const old='snapshots/apex-line-search-4.0.12';
const initial=JSON.parse(fs.readFileSync(dir+'/initial.json'));
const configs=[
 {hp:3,keep:1.5,guard:1.5,titan:1.5,source:3,stop:14},
 {hp:3,keep:2,guard:1.3,titan:2,source:3,stop:7},
 {hp:2,keep:2,guard:1.1,titan:2.5,draw:2,source:3,stop:7},
 {hp:4,keep:3,guard:1.7,titan:1.5,draw:2,source:3,stop:7},
 {hp:1.4,keep:1,guard:1,titan:3,draw:1,grovePlacement:10,source:3,stop:7},
 {hp:3,keep:4,guard:1.4,titan:2.5,titanSpent:1.5,draw:3,source:8,stop:8},
 {hp:2.5,keep:2,guard:1.2,titan:3,titanSpent:2,draw:1.5,source:9,stop:8},
 {hp:3,keep:3,guard:1.4,titan:3,titanSpent:1,draw:2,source:10,stop:9},
 {hp:3,keep:2,guard:1.5,titan:2,draw:2,insanity:10,source:3,stop:7},
 {hp:2.5,keep:2,guard:1.4,titan:2.5,draw:1.5,insanity:12,source:10,stop:9}
];
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const hash=x=>createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
const summary=[];
const selected=process.argv.slice(2).map(Number);
for(const index of (selected.length?selected.map(n=>n-1):configs.map((_,i)=>i))){
 if(fs.existsSync(`${dir}/trial-${index+1}.json`))continue;
 const trial=index+1,cfg=configs[index];setConfig(cfg);configure(cfg);
 let g=new Game(0,structuredClone(initial)),actions=[],turns=[],prefixDivergence=null;
 const reference=JSON.parse(fs.readFileSync(`${old}/trial-${cfg.source}.json`)).actions;
 for(const wanted of reference){
  if(g.s.mode!=='battle'||(g.s.battle.turn>=cfg.stop&&g.s.battle.phase==='place'))break;
  const a=g.legal().find(a=>a.key===wanted.key);
  if(!a){prefixDivergence={action:actions.length,key:wanted.key,turn:g.s.battle.turn};break;}
  g.act(a);actions.push(a);
 }
 const reused=actions.length;
 if(fs.existsSync(dir+'/resume.json')){
  const resume=JSON.parse(fs.readFileSync(dir+'/resume.json'));
  if(resume.trial===trial){g=new Game(0,resume.state);actions=resume.actions;turns=resume.turns;}
 }
 console.log(JSON.stringify({trial,startTurn:g.s.battle.turn,hp:g.s.hp,boss:g.s.battle.enemies[0].hp,reused,prefixDivergence}));
 while(g.s.mode==='battle'&&g.s.hp>0&&g.s.battle.turn<45){
  const t=g.s.battle.turn;
  if(g.s.battle.reaction){const r=defend(g);g=r.g;actions.push(...r.actions);}
  if(g.s.mode!=='battle')break;
  if(g.s.battle.phase==='place')actions.push(...planPlace(g));
  if(g.s.mode!=='battle')break;
  const r=activate(g);if(!r)throw Error('No continuation');g=r.g;actions.push(...r.actions);
  const row={turn:t,hp:g.s.hp,boss:g.s.battle.enemies[0].hp,actions:actions.length,destroyed:g.s.battle.destroyed.length};
  turns.push(row);console.log(JSON.stringify({trial,...row}));
  fs.writeFileSync(`${dir}/in-progress-${trial}.json`,JSON.stringify({trial,cfg,actions,turns,state:g.s}));
  if(g.s.mode==='battle'&&g.s.battle.turn===t)throw Error('Stalled');
 }
 if(g.s.mode==='battle')throw Error('Attempt did not finish');
 const win=g.s.hp>0&&g.s.battle.enemies.every(e=>e.hp<=0);
 const record={trial,cfg,win,hp:g.s.hp,boss:g.s.battle.enemies[0].hp,turn:g.s.battle.turn,mode:g.s.mode,death:g.s.death,destroyed:g.s.battle.destroyed.length,reused,prefixDivergence,actions:actions.length};
 const verify=new Game(0,structuredClone(initial));
 for(const [i,wanted]of actions.entries()){
  const a=verify.legal().find(a=>a.key===wanted.key);
  if(!a)throw Error(`Illegal trial ${trial} action ${i}: ${wanted.key}`);
  verify.act(a);
 }
 record.checks={hp:verify.s.hp===g.s.hp,mode:verify.s.mode===g.s.mode,rng:verify.s.rng===g.s.rng,battle:hash(verify.s.battle)===hash(g.s.battle)};
 if(Object.values(record.checks).some(x=>!x))throw Error('Replay mismatch '+JSON.stringify(record));
 fs.writeFileSync(`${dir}/trial-${trial}.json`,JSON.stringify({summary:record,actions,turns,final:g.s}));
 summary.push(record);
 console.log('RESULT '+JSON.stringify(record));
}
console.log('COMPLETE '+JSON.stringify({attempts:summary.length,wins:summary.filter(r=>r.win).length}));
