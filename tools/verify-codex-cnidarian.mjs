import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const dir='reports/codex-cnidarian-play';
const r=JSON.parse(await fs.readFile(dir+'/attempt.json','utf8'));
const sources=JSON.parse(await fs.readFile(dir+'/sources.json','utf8'));
const cache=path.resolve('.tmp/codex-cnidarian-replay');
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
assert.equal(g.s.mode,'reward');assert.equal(g.s.hp,69);assert.equal(g.s.battle.turn,10);
assert.equal(alliesPlaced,0);
const result={version:VERSION,controller:r.controller,outcome:'victory',startingHp:r.initial.hp,hp:g.s.hp,
  damageTaken:g.s.stats.damageTaken-r.initial.stats.damageTaken,
  turn:g.s.battle.turn,decisions:r.decisions.length,rewinds:0,replayVerified:true,alliesPlaced,
  tendrilKills:g.s.battle.enemies[0].tentacleKills||0,
  sourcesSha256:crypto.createHash('sha256').update(JSON.stringify(sources)).digest('hex'),
  limitation:'Historical 3.0.11 victory; ordinary cards stall tendrils. Not evidence of victory after the requested tendril adjacency/swap change.'};
await fs.writeFile(dir+'/verification.json',JSON.stringify(result,null,2));
await fs.writeFile(dir+'/winning-line.json',JSON.stringify({result,initial:r.initial,decisions:r.decisions.map(d=>d.action.key),final:g.s}));
console.log(result);
