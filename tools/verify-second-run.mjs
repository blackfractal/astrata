import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const dir='reports/codex-fullrun-4.0.2-second';
const sources=JSON.parse(fs.readFileSync(dir+'/sources.json','utf8'));
const frozen=path.resolve('.tmp/second-run-replay/src');
fs.mkdirSync(frozen,{recursive:true});
for(const [name,text] of Object.entries(sources))fs.writeFileSync(path.join(frozen,name),text);
const {Game}=await import(pathToFileURL(path.join(frozen,'engine.mjs')).href);
const final=JSON.parse(fs.readFileSync(dir+'/final.json','utf8')).state;
let g=new Game(0,JSON.parse(fs.readFileSync(dir+'/initial.json','utf8')));
const decisions=fs.readFileSync(dir+'/decisions.jsonl','utf8').trim().split('\n').map(JSON.parse);
for(const d of decisions){
 const a=g.legal().find(a=>a.key===d.action.key);
 assert.ok(a,`Illegal replay action at ${d.before.step}: ${d.action.label}`);
 g.act(a);
 assert.equal(g.s.hp,d.after.hp,`HP at ${d.before.step}`);
 assert.equal(g.s.gold,d.after.gold,`Gold at ${d.before.step}`);
}
for(const key of ['rng','steps','hp','gold','mode','deck','inventory','equipment','stats','battle'])assert.deepEqual(g.s[key],final[key],key);
const encounters=final.stats.encounters;
const segments=[1,2,3,4].map(stratum=>{
 const list=encounters.filter(e=>e.stratum===stratum);
 return {stratum,encounters:list.length,wins:list.filter(e=>e.outcome==='victory').length,turns:list.reduce((n,e)=>n+e.turns,0),nonLosingHP:list.filter(e=>e.hpEnd>=e.hpStart).length,netEncounterHPLost:list.reduce((n,e)=>n+e.hpStart-e.hpEnd,0)};
});
fs.writeFileSync(dir+'/encounters.json',JSON.stringify(encounters,null,2));
const result={version:'4.0.2',seed:final.seed,decisions:decisions.length,verified:true,comparison:['every action legal','per-action HP and gold','final RNG, state, deck, inventory, equipment, statistics and battle'],segments,damageTaken:final.stats.damageTaken,goldEarned:final.stats.goldEarned,goldSpent:final.stats.goldSpent,deckSize:final.deck.length,finalBoss:final.battle.enemies.map(e=>({name:e.name,hp:e.hp,maxHp:e.maxHp})),sourceSHA256:crypto.createHash('sha256').update(fs.readFileSync(dir+'/sources.json')).digest('hex')};
fs.writeFileSync(dir+'/verification.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
