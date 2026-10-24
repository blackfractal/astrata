import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {Game} from './rules/engine.mjs';
const dir=path.dirname(fileURLToPath(import.meta.url));
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
const initial=read('initial.json');
const original=JSON.parse(fs.readFileSync(path.join(dir,'../apex-line-search-4.0.12/initial.json'),'utf8'));
const expected=structuredClone(original);
expected.battle.enemies[0].hp=expected.battle.enemies[0].maxHp=500;
assert.deepEqual(initial,expected,'Only initial Predator HP/maxHP may differ');
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const hash=x=>createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
for(const m of read('rules-manifest.json'))assert.equal(createHash('sha256').update(fs.readFileSync(path.join(dir,'rules',m.name))).digest('hex'),m.sha256);
const results=[];
for(let trial=1;trial<=10;trial++){
 const record=read(`trial-${trial}.json`),g=new Game(0,structuredClone(initial));
 const health=[],turns=[];let previousTurn=0,threshold=null;
 for(const [i,wanted] of record.actions.entries()){
  const b=g.s.battle;
  if(b.turn!==previousTurn){turns.push({turn:b.turn,hp:g.s.hp,boss:b.enemies[0].hp,destroyed:b.destroyed.length});previousTurn=b.turn;}
  const a=g.legal().find(a=>a.key===wanted.key);
  assert.ok(a,`Trial ${trial}, action ${i} illegal: ${wanted.key}`);
  const before=g.s.hp,turn=b.turn;g.act(a);
  if(!threshold&&g.s.battle.enemies[0].hp<=250)threshold={turn,action:i,hp:g.s.hp,boss:g.s.battle.enemies[0].hp};
  if(g.s.hp!==before)health.push({turn,action:i,label:a.label,before,after:g.s.hp,delta:g.s.hp-before,log:g.s.log.slice(-4)});
 }
 const checks={hp:g.s.hp===record.final.hp,mode:g.s.mode===record.final.mode,rng:g.s.rng===record.final.rng,battle:hash(g.s.battle)===hash(record.final.battle)};
 assert.ok(Object.values(checks).every(Boolean),`Trial ${trial} mismatch`);
 const win=g.s.hp>0&&g.s.battle.enemies.every(e=>e.hp<=0);
 assert.equal(win,record.summary.win);
 results.push({trial,actions:record.actions.length,checks,win,hp:g.s.hp,boss:g.s.battle.enemies[0].hp,turn:g.s.battle.turn,death:g.s.death,destroyed:g.s.battle.destroyed.length,threshold,turns,health});
 console.log(JSON.stringify({trial,win,hp:g.s.hp,boss:g.s.battle.enemies[0].hp,checks}));
}
fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({attempts:results.length,wins:results.filter(r=>r.win).length,legalActions:results.reduce((n,r)=>n+r.actions,0),initialOnlyBossHpChanged:true}));
