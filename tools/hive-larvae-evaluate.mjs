import { snapshotPath } from './artifact-paths.mjs';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {depthsFixture} from './depths-fixture.mjs';import {Game} from '../src/engine.mjs';import {WeightedPolicy} from '../src/policy.mjs';import {VERSION} from '../src/content.mjs';
const dir='reports/hive-larvae-evaluation';
const snapshots = snapshotPath(dir);
await fs.mkdir(snapshots, { recursive: true });
await fs.mkdir(dir, { recursive: true });const results=[];
const sources={};for(const n of (await fs.readdir('src')).filter(n=>n.endsWith('.mjs')))sources[n]=await fs.readFile('src/'+n,'utf8');await fs.writeFile(snapshots+'/sources.json',JSON.stringify(sources));
for(const seed of [73001,73002,73003,73004,73005]){
 const g=depthsFixture(seed,'mindHive');delete g.s.checkpoint;const initial=structuredClone(g.s),decisions=[],p=new WeightedPolicy();
 for(let n=0;n<3000&&g.s.mode==='battle';n++){const choice=p.choose(g.observe(),g.legal());assert.ok(choice);decisions.push(choice.action.key);g.act(choice.action);}
 assert.notEqual(g.s.mode,'battle');const replay=new Game(0,structuredClone(initial));delete replay.s.checkpoint;for(const a of decisions)replay.act(a);assert.deepEqual(replay.observe(),g.observe());
 const result={version:VERSION,seed,build:'balanced strong fixture, 25 unupgraded cards, 70HP, same gear as prior benchmark',policy:p.id,outcome:g.s.mode==='reward'?'victory':g.s.outcome,hp:g.s.hp,turn:g.s.battle.turn,decisions:decisions.length,replayVerified:true};results.push(result);await fs.writeFile(snapshots+'/'+seed+'.json',JSON.stringify({result,initial,decisions,final:g.s},null,2));console.log(result);
}
await fs.writeFile(dir+'/summary.json',JSON.stringify(results,null,2));
