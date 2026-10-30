import { reportPath } from './artifact-paths.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const dir='snapshots/codex-hive-play';
await fs.mkdir(reportPath(dir), { recursive: true });const r=JSON.parse(await fs.readFile(dir+'/attempt.json','utf8'));
// Preserve historical proof under the exact recorded rules, even after balance changes.
const sources=JSON.parse(await fs.readFile(dir+'/sources.json','utf8'));
const cache=path.resolve('.tmp/codex-hive-replay-3.0.8');await fs.mkdir(cache,{recursive:true});
for(const [name,source] of Object.entries(sources)){
 assert.equal(path.basename(name),name);await fs.writeFile(path.join(cache,name),source);
}
const {Game}=await import(pathToFileURL(path.join(cache,'engine.mjs')));
const {VERSION}=await import(pathToFileURL(path.join(cache,'content.mjs')));
const g=new Game(0,structuredClone(r.initial));delete g.s.checkpoint;
let minimumHp=g.s.hp;
for(const [i,d] of r.decisions.entries()){
 assert.ok(g.legal().some(a=>a.key===d.action.key),'Illegal decision '+i);
 g.act(d.action.key);minimumHp=Math.min(minimumHp,g.s.hp);
}
const final=new Game(0,structuredClone(r.state));delete final.s.checkpoint;
assert.deepEqual(g.observe(),final.observe());assert.equal(g.s.mode,'reward');assert.equal(g.s.hp,70);assert.equal(minimumHp,70);
const source=JSON.parse(await fs.readFile(r.source,'utf8'));
const rounds=r.checkpoints.filter((s,i,all)=>i===0||s.battle.turn!==all[i-1].battle.turn).map(s=>({turn:s.battle.turn,hp:s.hp,focus:s.battle.focus,channel:s.battle.channel}));
const result={version:VERSION,fixture:r.source,seed:73001,controller:'Codex manual legal-action selections; no policy or search',outcome:'victory',hp:g.s.hp,minimumHp,turn:g.s.battle.turn,decisions:r.decisions.length,rewinds:0,replayVerified:true,previousAiResult:source.result,rounds,damageTaken:g.s.stats.damageTaken,repairs:g.s.stats.repairs};
result.sourcesSha256=crypto.createHash('sha256').update(JSON.stringify(sources)).digest('hex');
await fs.writeFile(dir+'/winning-line.json',JSON.stringify({result,initial:r.initial,decisions:r.decisions.map(d=>d.action.key),final:g.s},null,2));
await fs.writeFile(reportPath(dir+'/verification.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
