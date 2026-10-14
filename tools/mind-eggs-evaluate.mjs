import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { WeightedPolicy } from '../src/policy.mjs';
import { depthsFixture } from './depths-fixture.mjs';
import { runRecord } from '../src/run-record.mjs';
import { createArchive } from '../run-archive.cjs';
const dir='reports/mind-eggs-evaluation';await fs.mkdir(dir,{recursive:true});
const names=(await fs.readdir('src')).filter(n=>n.endsWith('.mjs'));
const sources=Object.fromEntries(await Promise.all(names.map(async n=>[n,await fs.readFile('src/'+n,'utf8')])));
const archive=createArchive(dir,{packageVersion:'3.0.6',sources,source:'headless'}),results=[];
for(const seed of [73001,73002,73003,73004,73005]){
 const g=depthsFixture(seed,'mindHive');delete g.s.checkpoint;
 const initial=structuredClone(g.s),policy=new WeightedPolicy(),decisions=[],runId='egg-hive-'+seed+'-'+Date.now();
 archive.record(runRecord(g,runId,'start',{fixture:'Authored S3 carry-in; not a natural campaign',policy:policy.id}));
 for(let i=0;i<2000&&g.s.mode==='battle';i++){
  const choice=policy.choose(g.observe(),g.legal());assert.ok(choice);
  decisions.push(choice.action.key);g.act(choice.action);
  archive.record(runRecord(g,runId,'decision',{action:choice.action,controller:{kind:'ai',policy:policy.id,reason:choice.reason}}));
 }
 assert.notEqual(g.s.mode,'battle','AI stalled');
 const replay=new Game(0,structuredClone(initial));delete replay.s.checkpoint;
 for(const key of decisions)replay.act(key);
 assert.deepEqual(replay.observe(),g.observe());
 const result={seed,runId,outcome:g.s.mode==='reward'?'victory':g.s.outcome,hp:g.s.hp,turn:g.s.battle?.turn,damageTaken:g.s.stats.damageTaken,hatched:g.s.stats.mindEggs?.length||0,covered:g.s.stats.mindEggs?.filter(e=>e.covered ?? e.discarded.length).length||0,repairs:g.s.stats.repairs?.filter(e=>e.kind==='egg').length||0,decisions:decisions.length,replayVerified:true};
 results.push(result);await fs.writeFile(dir+'/'+seed+'.json',JSON.stringify({result,initial,decisions,final:g.s},null,2));console.log(result);
}
await fs.writeFile(dir+'/summary.json',JSON.stringify(results,null,2));
