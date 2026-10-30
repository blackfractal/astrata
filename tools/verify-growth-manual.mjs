import { reportPath } from './artifact-paths.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const results=[];
for(const seed of [17101701,17101702,17101703]){
 const dir=`snapshots/codex-growth-manual-${seed}`;
fs.mkdirSync(reportPath(dir), { recursive: true });
 const sources=fs.readFileSync(`${dir}/sources.json`,'utf8');
 const frozen=path.resolve(`.tmp/growth-manual-replay-${seed}/src`);
 fs.mkdirSync(frozen,{recursive:true});
 for(const [name,source]of Object.entries(JSON.parse(sources)))fs.writeFileSync(path.join(frozen,name),source);
 const {Game}=await import(pathToFileURL(path.join(frozen,'engine.mjs')).href);
 const g=new Game(0,JSON.parse(fs.readFileSync(`${dir}/initial.json`,'utf8')));
 const decisions=fs.readFileSync(`${dir}/decisions.jsonl`,'utf8').trim().split('\n').map(JSON.parse);
 const final=JSON.parse(fs.readFileSync(`${dir}/current.json`,'utf8'));
 for(const d of decisions){
  const action=g.legal().find(a=>a.key===d.action.key);
  assert.ok(action,`${seed}: illegal action ${d.before.step}: ${d.action.label}`);
  g.act(action);
  assert.equal(g.s.hp,d.after.hp,`${seed}: HP at ${d.before.step}`);
  assert.equal(g.s.gold,d.after.gold,`${seed}: gold at ${d.before.step}`);
 }
 for(const key of ['rng','steps','hp','gold','mode','deck','inventory','equipment','stats','battle'])assert.deepEqual(g.s[key],final[key],`${seed}: ${key}`);
 const encounters=final.stats.encounters;
 fs.writeFileSync(reportPath(`${dir}/encounters.json`),JSON.stringify(encounters,null,2));
 const result={seed,version:'4.0.7',decisions:decisions.length,verified:true,mode:final.mode,hp:final.hp,stratum:final.stratum,sourceSHA256:crypto.createHash('sha256').update(sources).digest('hex'),segments:[1,2,3,4].map(stratum=>{const es=encounters.filter(e=>e.stratum===stratum);return {stratum,encounters:es.length,wins:es.filter(e=>e.outcome==='victory').length,netHpLost:es.reduce((n,e)=>n+e.hpStart-e.hpEnd,0),nonLosingHp:es.filter(e=>e.hpEnd>=e.hpStart).length};})};
 fs.writeFileSync(reportPath(`${dir}/verification.json`),JSON.stringify(result,null,2));results.push(result);
}
console.log(JSON.stringify(results,null,2));
