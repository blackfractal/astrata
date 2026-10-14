import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { cards, VERSION } from '../src/content.mjs';
import { WeightedPolicy } from '../src/policy.mjs';
import { depthsFixture } from './depths-fixture.mjs';
import { runRecord } from '../src/run-record.mjs';
import { createArchive } from '../run-archive.cjs';

const dir=process.argv[2]||'reports/mind-hive-opening-evaluation';await fs.mkdir(dir,{recursive:true});
const droneAware=process.argv.includes('--drone-aware');
class DroneAwarePolicy extends WeightedPolicy {
 constructor(){super();this.id='diagnostic-drone-priority-v1';}
 score(o,a){
  const [score,reason]=super.score(o,a),b=o.battle,f=a.effects||{};
  if(a.type==='activate'&&b){
   const target=b.ideons?.find(e=>e.uid===a.target);
   if(target?.kind==='drone'&&!f.charging&&(f.damage||f.hpDamage||f.randomDamage||f.guide))
    return [score+25,'Diagnostic: prioritize damaging a scaling Drone.'];
   const q=b.corruptions?.[a.cardTarget??a.slot];
   if((f.mend||f.stitch)&&q?.insect==='drone')
    return [score+25,'Diagnostic: prevent a Drone hatch.'];
  }
  return [score,reason];
 }
}
const foundation=['blast','blast','shield','shield','focus','focus','clear','rain','conduit','transmute','elves','lucidGuide'];
const builds=[
 {id:'baseline',name:'Original balanced carry-in (25 cards)',cards:null,upgrades:[]},
 {id:'wards',name:'Wards and repair (30 cards)',cards:[...foundation,'ward','ward','magnify','magnify','lattice','lattice','elves','bastion','water','cinder','solitude','lucidNeedle','lucidNeedle','scouringGale','sapling','familiar','tide','undertow'],upgrades:['elves','ward','lucidNeedle','water']},
 {id:'allies',name:'Allies and elemental chains (30 cards)',cards:[...foundation,'sapling','familiar','terra','golem','grove','aqua','ember','ward','magnify','lattice','water','cinder','thorn','lucidNeedle','scouringGale','tide','clear','transmute'],upgrades:['grove','sapling','elves','lucidNeedle']},
 {id:'spells',name:'Efficient spells and Insight (30 cards)',cards:[...foundation,'lucidNeedle','lucidNeedle','scouringGale','scouringGale','water','water','cinder','cinder','solitude','solitude','plasma','plasma','ward','magnify','tide','clear','keystone','storm'],upgrades:['lucidNeedle','scouringGale','water','solitude']},
];
for(const b of builds)if(b.cards){assert.equal(b.cards.length,30);for(const id of b.cards)assert.ok(cards[id],id);}
const settings={version:VERSION,builds,seeds:[73001,73002,73003,73004,73005],hp:70,equipment:'Gold/Sapphire + Silver/Ruby bracelets, Ring of Patience/Amber Thought, Ring of Embers/Storm Opal, Stone Armor, Sturdy Metal Helmet. Same as prior baseline. No consumables.',method:'Synthetic coherent S3 carry-ins, not earned campaigns. One unchanged WeightedPolicy, no training/search or tuning after results. Baseline unchanged from previous five tests; other builds have four upgrades each. Save untouched.'};
await fs.writeFile(dir+'/settings.json',JSON.stringify(settings,null,2));
const sources=Object.fromEntries(await Promise.all((await fs.readdir('src')).filter(n=>n.endsWith('.mjs')).map(async n=>[n,await fs.readFile('src/'+n,'utf8')])));
const archive=createArchive(dir,{packageVersion:VERSION.content,sources,source:'headless'});
const results=process.argv.includes('--resume')?JSON.parse(await fs.readFile(dir+'/summary.json','utf8')):[];
if(droneAware){settings.method+=' Separate five-fight diagnostic: baseline only; +25 action score for damaging Drones or repairing Drone eggs. Production AI unchanged.';settings.builds=builds.slice(0,1);await fs.writeFile(dir+'/settings.json',JSON.stringify(settings,null,2));}
for(const build of settings.builds)for(const seed of settings.seeds){
 if(results.some(r=>r.build===build.id&&r.seed===seed))continue;
 const g=depthsFixture(seed,build.cards?null:'mindHive');
 if(build.cards){
  g.s.deck=[];for(const id of build.cards)g.addCard(id);
  for(const id of build.upgrades)g.s.deck.find(c=>c.id===id&&!c.upgrade).upgrade=true;
  g.s.mode='field';g.s.field.entities=[];g.beginBattle([{uid:g.uid(),enemy:'mindHive',restless:0}]);
 }
 delete g.s.checkpoint;
 const initial=structuredClone(g.s),policy=droneAware?new DroneAwarePolicy():new WeightedPolicy(),decisions=[],rounds=[],runId=`hive-opening-${build.id}-${seed}-${Date.now()}`;
 archive.record(runRecord(g,runId,'start',{fixture:settings,build:build.id,policy:policy.id}));
 let maxIdeons=8,lastTurn=0;
 for(let step=0;step<2500&&g.s.mode==='battle';step++){
  const b=g.s.battle;maxIdeons=Math.max(maxIdeons,b.ideons.length);
  if(b.turn!==lastTurn){rounds.push({turn:b.turn,hp:g.s.hp,damageTaken:g.s.stats.damageTaken,ideons:b.ideons.length,eggs:Object.values(b.corruptions).filter(q=>q.kind==='egg').length,focus:b.focus,channel:b.channel});lastTurn=b.turn;}
  const choice=policy.choose(g.observe(),g.legal());assert.ok(choice);
  decisions.push(choice.action.key);g.act(choice.action);
  archive.record(runRecord(g,runId,'decision',{action:choice.action,controller:{kind:'ai',policy:policy.id,reason:choice.reason}}));
 }
 assert.notEqual(g.s.mode,'battle','Policy stalled');
 const replay=new Game(0,structuredClone(initial));delete replay.s.checkpoint;
 for(const key of decisions)replay.act(key);
 assert.deepEqual(replay.observe(),g.observe());
 const eggs=g.s.stats.mindEggs||[],o=g.s.battle.enemies[0];
 const result={build:build.id,seed,runId,outcome:g.s.mode==='reward'?'victory':g.s.outcome,hp:g.s.hp,turn:g.s.battle.turn,damageTaken:g.s.stats.damageTaken,laid:o.eggsLaid||0,hatched:eggs.length,covered:eggs.filter(e=>e.covered ?? e.discarded.length).length,repairs:g.s.stats.repairs?.filter(e=>e.kind==='egg').length||0,maxIdeons,decisions:decisions.length,replayVerified:true,rounds};
 results.push(result);await fs.writeFile(`${dir}/${build.id}-${seed}.json`,JSON.stringify({result,initial,decisions,final:g.s},null,2));
 await fs.writeFile(dir+'/summary.json',JSON.stringify(results,null,2));console.log(JSON.stringify({...result,rounds:undefined,runId:undefined}));
}
