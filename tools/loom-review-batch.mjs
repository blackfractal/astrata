import { reportPath } from './artifact-paths.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {WeightedPolicy} from '../src/policy.mjs';
const root='snapshots/loom-balance-20261023',phase=process.argv[2]||'baseline';
const results=[];
for(const build of ['engine','mixed'])for(const boss of ['blackBile','bombadier']){
 const dir=`${root}/${phase}-${build}-${boss}`,initial=JSON.parse(fs.readFileSync(dir+'/initial.json'));
 const g=new Game(0,structuredClone(initial)),policy=new WeightedPolicy(),trace=[],turns=[];
 let t=0,b=g.s.battle;
 while(g.s.mode==='battle'&&trace.length<2000){
  if(b.turn!==t){t=b.turn;turns.push({turn:t,hp:g.s.hp,bossHP:b.enemies[0].hp,focus:b.focus,channel:b.channel,corruptions:Object.keys(b.corruptions).length,biles:Object.keys(b.biles||{}).length});}
  const a=policy.choose(g.observe(),g.legal())?.action;if(!a)throw Error('No action');
  g.act(a);trace.push(a);
 }
 const replay=new Game(0,structuredClone(initial));for(const a of trace)replay.act(a);assert.deepEqual(replay.observe(),g.observe());
 const r={build,boss,controller:'WeightedPolicy supplemental test, not manual Codex',mode:g.s.mode,hp:g.s.hp,turns:b.turn,bossHP:b.enemies[0].hp,actions:trace.length,turnLog:turns,replayVerified:true};
 fs.writeFileSync(dir+'/automated.json',JSON.stringify({result:r,actions:trace,final:g.s}));results.push(r);console.log(JSON.stringify(r));
}
fs.mkdirSync(reportPath(root),{recursive:true});
fs.writeFileSync(reportPath(root+'/'+phase+'-automated-summary.json'),JSON.stringify(results,null,2));
