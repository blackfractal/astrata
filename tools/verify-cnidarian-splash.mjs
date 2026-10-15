import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const dir='reports/codex-cnidarian-strong-3.0.14';
const r=JSON.parse(await fs.readFile(dir+'/attempt.json','utf8'));
const sources=JSON.parse(await fs.readFile(dir+'/sources.json','utf8'));
const cache=path.resolve('.tmp/codex-cnidarian-splash-replay');
await fs.mkdir(cache,{recursive:true});
for(const [name,source] of Object.entries(sources)){
  assert.equal(path.basename(name),name);
  await fs.writeFile(path.join(cache,name),source);
}
const {Game}=await import(pathToFileURL(path.join(cache,'engine.mjs')));
const {VERSION,cards}=await import(pathToFileURL(path.join(cache,'content.mjs')));
const g=new Game(0,structuredClone(r.initial));delete g.s.checkpoint;
let alliesPlaced=0;
for(const [i,d] of r.decisions.entries()){
  assert.ok(g.legal().some(a=>a.key===d.action.key),'Illegal decision '+i);
  if(d.action.type==='place') alliesPlaced+=Number(cards[g.s.battle.hand.find(c=>c.uid===d.action.uid)?.id]?.type==='Ally');
  g.act(d.action.key);
}
const final=new Game(0,structuredClone(r.state));delete final.s.checkpoint;
assert.deepEqual(g.observe(),final.observe());
assert.equal(g.s.mode,'reward');assert.equal(g.s.hp,38);assert.equal(g.s.battle.turn,14);
assert.equal(alliesPlaced,5);
const perTurn={};let healed=0;const bossDamage={};
for(let i=0;i<r.decisions.length;i++){const before=r.checkpoints[i],after=r.checkpoints[i+1]||r.state,d=r.decisions[i].action,t=before.battle.turn;perTurn[t]||={playerHpLost:0,bossHpEnd:0};perTurn[t].playerHpLost+=Math.max(0,before.hp-after.hp);perTurn[t].bossHpEnd=Math.max(0,after.battle.enemies[0].hp);healed+=Math.max(0,after.hp-before.hp);if(d.type==='activate'){const id=before.battle.grid[d.slot].at(-1).id;bossDamage[id]=(bossDamage[id]||0)+Math.max(0,before.battle.enemies[0].hp-Math.max(0,after.battle.enemies[0].hp));}}
const prior=JSON.parse(await fs.readFile('reports/codex-cnidarian-strong-3.0.13/attempt.json','utf8'));
assert.deepEqual(r.decisions.filter((d,i)=>r.checkpoints[i].battle.reaction?.name!=='Splash').map(d=>d.action.key),prior.decisions.map(d=>d.action.key));
const result={samePriorLineExceptSplashDefenses:true,fixture:g.s.evaluationFixture,seed:r.initial.seed,healed,perTurn,bossDamage,version:VERSION,controller:r.controller,outcome:'victory',startingHp:r.initial.hp,hp:g.s.hp,
  damageTaken:g.s.stats.damageTaken-r.initial.stats.damageTaken,
  turn:g.s.battle.turn,decisions:r.decisions.length,rewinds:0,replayVerified:true,alliesPlaced,
  tendrilKills:g.s.battle.enemies[0].tentacleKills||0,
  sourcesSha256:crypto.createHash('sha256').update(JSON.stringify(sources)).digest('hex'),
  limitation:'One authored strong build and one seed; not a population win-rate estimate. Adds player-directed Splash with positional defenses.'};
await fs.writeFile(dir+'/verification.json',JSON.stringify(result,null,2));
await fs.writeFile(dir+'/winning-line.json',JSON.stringify({result,initial:r.initial,decisions:r.decisions.map(d=>d.action.key),final:g.s}));
console.log(result);
