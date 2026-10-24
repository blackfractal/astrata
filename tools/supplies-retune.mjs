import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {WeightedPolicy} from '../src/policy.mjs';
import {enemies,VERSION} from '../src/content.mjs';
const dir=process.argv[2]||'reports/supplies-retune-4.0.15';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(dir+'/sources.json',JSON.stringify(Object.fromEntries(fs.readdirSync('src').filter(n=>n.endsWith('.mjs')).map(n=>[n,fs.readFileSync('src/'+n,'utf8')]))));
const summary=[];
for(const item of ['baseline','prismaticBracelet','reservoirBracelet','reclaimerBracelet','lastStandBracelet','echoRing','resonanceHelm','remembranceArmor']){
 const prior=JSON.parse(fs.readFileSync('reports/supplies-encounters-4.0.14/trickster-'+item+'.json'));
 const initial=structuredClone(prior.initial);initial.version=VERSION;
 initial.battle.enemies[0].rotation=structuredClone(enemies.trickster.rotation);
 const g=new Game(0,initial),policy=new WeightedPolicy(),trace=[];
 while(g.s.mode==='battle'&&trace.length<2000){const a=policy.choose(g.observe(),g.legal()).action;g.act(a);trace.push(a);}
 assert.notEqual(g.s.mode,'battle');const r=new Game(0,initial);for(const a of trace)r.act(a);assert.deepEqual(JSON.parse(JSON.stringify(r.s)),JSON.parse(JSON.stringify(g.s)));
 const result={item,beforeHP:prior.result.hp,hp:g.s.hp,turns:g.s.battle.turn,outcome:g.s.mode==='result'?'loss':'victory',replayVerified:true};
 fs.writeFileSync(dir+'/'+item+'.json',JSON.stringify({initial,trace,final:g.s,result}));summary.push(result);
}
fs.writeFileSync(dir+'/summary.json',JSON.stringify(summary,null,2));console.log(summary);
