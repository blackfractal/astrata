import { reportPath, snapshotPath } from '../../tools/artifact-paths.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {Game} from '../../snapshots/apex-line-search-4.0.12/rules/engine.mjs';
const dir=snapshotPath(path.dirname(fileURLToPath(import.meta.url)));
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
const initial=read('initial.json');
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const hash=x=>createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
const results=[];
for(let trial=1;trial<=10;trial++){
 const record=read(`trial-${trial}.json`),g=new Game(0,structuredClone(initial));
 const health=[],turns=[];let previousTurn=0;
 for(const [i,wanted] of record.actions.entries()){
  const b=g.s.battle;
  if(b.turn!==previousTurn){turns.push({turn:b.turn,hp:g.s.hp,boss:b.enemies[0].hp,destroyed:b.destroyed.length});previousTurn=b.turn}
  const legal=g.legal().find(a=>a.key===wanted.key);
  if(!legal)throw Error(`Trial ${trial}, action ${i} is illegal: ${wanted.key}`);
  const before=g.s.hp,turn=b.turn;g.act(legal);
  if(g.s.hp!==before)health.push({turn,action:i,label:legal.label,before,after:g.s.hp,delta:g.s.hp-before,log:g.s.log.slice(-4)});
 }
 const checks={hp:g.s.hp===record.final.hp,mode:g.s.mode===record.final.mode,rng:g.s.rng===record.final.rng,battle:hash(g.s.battle)===hash(record.final.battle)};
 if(Object.values(checks).some(x=>!x))throw Error(`Trial ${trial} replay mismatch: ${JSON.stringify(checks)}`);
 results.push({trial,actions:record.actions.length,checks,win:g.s.outcome==='win',playerHp:g.s.hp,bossHp:g.s.battle.enemies[0].hp,turn:g.s.battle.turn,death:g.s.death,destroyed:g.s.battle.destroyed.length,turns,health});
 console.log(JSON.stringify({trial,checks,hp:g.s.hp,boss:g.s.battle.enemies[0].hp,death:g.s.cause}));
}
fs.writeFileSync(reportPath(path.join(dir,'verification.json')),JSON.stringify(results,null,2));
