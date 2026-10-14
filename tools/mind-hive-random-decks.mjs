import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { cards, VERSION } from '../src/content.mjs';
import { WeightedPolicy } from '../src/policy.mjs';
import { depthsFixture } from './depths-fixture.mjs';
import { runRecord } from '../src/run-record.mjs';
import { createArchive } from '../run-archive.cjs';

const dir='reports/mind-hive-random-decks';
await fs.mkdir(dir,{recursive:true});
const pool=Object.keys(cards).sort();
const settings={count:20,cardCount:30,pool,selection:'Uniform with replacement across every player-card definition, including Hexes, companions and Legendary cards. No upgrades or guaranteed cards.',equipment:'Same authored S3 equipment as the five baseline tests: Gold/Sapphire, Silver/Ruby, Ring of Patience/Amber Thought, Ring of Embers/Storm Opal, Stone Armor and shield-enhancing helmet.',hp:70,version:VERSION,policy:'WeightedPolicy; no training or lookahead search',note:'Synthetic independent decks, not naturally acquired campaigns. Actual player save is untouched.'};
await fs.writeFile(dir+'/settings.json',JSON.stringify(settings,null,2));
const names=(await fs.readdir('src')).filter(n=>n.endsWith('.mjs'));
const sources=Object.fromEntries(await Promise.all(names.map(async n=>[n,await fs.readFile('src/'+n,'utf8')])));
const packageVersion=JSON.parse(await fs.readFile('package.json','utf8')).version;
const archive=createArchive(dir,{packageVersion,sources,source:'headless'}),results=[];
for(let n=0;n<settings.count;n++){
 const seed=74101+n,g=depthsFixture(seed);
 // Use a separate reproducible RNG for deck construction; no curated starting cards.
 let rng=(seed^0x91f2a577)>>>0;
 const random=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;rng>>>=0;return rng/4294967296;};
 g.s.deck=[];
 for(let i=0;i<30;i++)g.addCard(pool[Math.floor(random()*pool.length)]);
 g.s.hp=70;g.s.mode='field';g.s.field.entities=[];
 g.beginBattle([{uid:g.uid(),enemy:'mindHive',restless:0}]);delete g.s.checkpoint;
 const initial=structuredClone(g.s),policy=new WeightedPolicy(),decisions=[],runId='hive-random-'+seed+'-'+Date.now();
 const metrics={maxIdeons:0,maxEggs:0,insectStrikes:0,eggBursts:0,cardDiscards:0};
 archive.record(runRecord(g,runId,'start',{fixture:settings,policy:policy.id}));
 for(let step=0;step<2500&&g.s.mode==='battle';step++){
  const b=g.s.battle;
  metrics.maxIdeons=Math.max(metrics.maxIdeons,b.ideons.length);
  metrics.maxEggs=Math.max(metrics.maxEggs,Object.values(b.corruptions).filter(q=>q.kind==='egg').length);
  const choice=policy.choose(g.observe(),g.legal());assert.ok(choice,'No legal decision');
  decisions.push(choice.action.key);g.act(choice.action);
  for(const effect of g.presentation||[])if(effect.kind==='incoming'){
   if(effect.name==='Mind Egg')metrics.eggBursts++;
   if(['Glass Skitter','Thought Burrower'].includes(effect.name))metrics.insectStrikes++;
  }
  archive.record(runRecord(g,runId,'decision',{action:choice.action,controller:{kind:'ai',policy:policy.id,reason:choice.reason}}));
 }
 assert.notEqual(g.s.mode,'battle','AI stalled');
 const replay=new Game(0,structuredClone(initial));delete replay.s.checkpoint;
 for(const key of decisions)replay.act(key);
 assert.deepEqual(replay.observe(),g.observe());
 const eggs=g.s.stats.mindEggs||[];
 metrics.cardDiscards=eggs.reduce((n,e)=>n+e.discarded.length,0);
 const result={seed,runId,outcome:g.s.mode==='reward'?'victory':g.s.outcome,hp:g.s.hp,turn:g.s.battle?.turn,damageTaken:g.s.stats.damageTaken,hatched:eggs.length,covered:eggs.filter(e=>e.covered ?? e.discarded.length).length,repairs:g.s.stats.repairs?.filter(e=>e.kind==='egg').length||0,hexes:initial.deck.filter(c=>cards[c.id].type==='Hex').length,legendaries:initial.deck.filter(c=>cards[c.id].rarity==='legendary').length,deck:initial.deck.map(c=>c.id),decisions:decisions.length,replayVerified:true,...metrics};
 results.push(result);
 await fs.writeFile(dir+'/'+seed+'.json',JSON.stringify({result,initial,decisions,final:g.s},null,2));
 await fs.writeFile(dir+'/summary.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify({seed,outcome:result.outcome,hp:result.hp,turn:result.turn,damageTaken:result.damageTaken,hexes:result.hexes,hatched:result.hatched,covered:result.covered,repairs:result.repairs}));
}
