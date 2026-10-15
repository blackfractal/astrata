import fs from 'node:fs/promises';import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {Game} from '../src/engine.mjs';import {VERSION,cards} from '../src/content.mjs';
const dir='reports/codex-cannon-3.0.25',r=JSON.parse(await fs.readFile(dir+'/attempt.json','utf8'));
const g=new Game(0,structuredClone(r.initial));delete g.s.checkpoint;
const perTurn={},bossDamage={},blasts=[],titanDefense=[],bulletIds=new Set();let lost=0,healed=0,withheld=0;
for(const [i,d] of r.decisions.entries()){
 assert.ok(g.legal().some(a=>a.key===d.action.key),'Illegal decision '+i);
 const before=structuredClone(g.s),b=before.battle,t=b.turn;
 if(d.action.type==='endTurn'){
  const tell=g.tell(g.s.battle.enemies[0]);
  if(tell.finalBlast)blasts.push({turn:t,element:tell.element,damage:tell.damage});
  if(tell.cannonPlan?.skipped)withheld++;
 }
 if(d.action.type==='intercept'&&b.grid[d.action.slot]?.at(-1)?.id==='grove')
  titanDefense.push({turn:t,attack:b.reaction.name,element:b.reaction.element,damage:b.reaction.damage,titanElement:b.grid[d.action.slot].at(-1).element,hpBefore:b.grid[d.action.slot].at(-1).hp});
 g.act(d.action.key);
 lost+=Math.max(0,before.hp-g.s.hp);healed+=Math.max(0,g.s.hp-before.hp);
 const row=perTurn[t]??={hpLost:0,bossHpEnd:0};row.hpLost+=Math.max(0,before.hp-g.s.hp);row.bossHpEnd=Math.max(0,g.s.battle.enemies[0].hp);
 for(const e of g.s.battle.ideons||[])bulletIds.add(e.uid);
 if(d.action.type==='activate'){
  const id=b.grid[d.action.slot].at(-1).id;
  bossDamage[id]=(bossDamage[id]||0)+Math.max(0,b.enemies[0].hp-Math.max(0,g.s.battle.enemies[0].hp));
 }
}
const final=new Game(0,structuredClone(r.state));delete final.s.checkpoint;assert.deepEqual(g.observe(),final.observe());
assert.equal(g.s.mode,'reward');assert.equal(g.s.hp,70);assert.equal(g.s.battle.turn,16);assert.equal(lost,0);
assert.deepEqual(blasts.map(x=>x.turn),[5,10,15]);
const result={version:VERSION,controller:r.controller,seed:r.initial.seed,fixture:r.initial.evaluationFixture,
 startingHp:r.initial.hp,endingHp:g.s.hp,damageTaken:lost,healed,turn:16,decisions:r.decisions.length,rewinds:0,replayVerified:true,
 startingFocus:r.initial.battle.focus,startingChannel:r.initial.battle.channel,deck:r.initial.deck.map(c=>cards[c.id].name),equipment:r.initial.equipment,
 blasts,titanDefense,bossDamage,perTurn,projectilesLaunched:bulletIds.size,launchesWithheld:withheld,
 sourcesSha256:crypto.createHash('sha256').update(await fs.readFile(dir+'/sources.json')).digest('hex'),
 limitation:'One authored strong carry-in and one seed, manually played with placement errors; not an optimized line, a natural run, or a population win-rate estimate.'};
await fs.writeFile(dir+'/verification.json',JSON.stringify(result,null,2));
await fs.writeFile(dir+'/winning-line.json',JSON.stringify({result,initial:r.initial,decisions:r.decisions.map(d=>d.action.key),final:g.s}));
console.log(JSON.stringify(result,null,2));
