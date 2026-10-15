import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {Game} from './src/engine.mjs';
const r=JSON.parse(fs.readFileSync(new URL('./winning-line.json',import.meta.url))),g=new Game(r.seed),milestones=[];
for(let i=0;i<r.trace.length;i++){
 const t=r.trace[i],a=g.legal().find(a=>a.key===t.key);assert.ok(a,`Illegal action ${i}: ${t.label}`);
 const before={mode:g.s.mode,stratum:g.s.stratum,hp:g.s.hp,round:g.s.field.round};g.act(a);
 if(before.mode!=='battle'&&g.s.mode==='battle')milestones.push({index:i,event:'battle',stratum:g.s.stratum,hp:g.s.hp,enemies:g.s.battle.enemies.map(e=>e.name),enemyFirst:g.s.battle.enemyFirst});
 if(before.mode!=='tavern'&&g.s.mode==='tavern')milestones.push({index:i,event:'tavern',stratum:g.s.stratum,hp:g.s.hp,gold:g.s.gold,round:g.s.field.round});
}
const clean=s=>{s=structuredClone(s);delete s.history;delete s.log;delete s.checkpoint;return s;};
assert.deepEqual(clean(g.s),clean(r.final));assert.equal(g.s.stratum,3);assert.equal(g.s.mode,'result');assert.equal(g.s.outcome,'win');
const verification={verified:true,seed:r.seed,version:g.s.version,actions:r.trace.length,hp:g.s.hp,stats:g.s.stats,milestones,traceSha256:createHash('sha256').update(JSON.stringify(r.trace)).digest('hex')};
fs.writeFileSync(new URL('./verification.json',import.meta.url),JSON.stringify(verification,null,2));console.log(JSON.stringify({verified:true,actions:r.trace.length,hp:g.s.hp,encounters:g.s.stats.encounters}));
