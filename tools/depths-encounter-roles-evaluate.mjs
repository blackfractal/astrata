import { snapshotPath } from './artifact-paths.mjs';
// Controlled encounter diagnostic, not a natural run or a skilled-player benchmark.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {enemies,VERSION} from '../src/content.mjs';
import {WeightedPolicy} from '../src/policy.mjs';
import {depthsFixture} from './depths-fixture.mjs';
const ids=['glassBrood','nerveWeaver','paleGrazer','echoPolyp','blindSeer','hollowDrifter','kindlyHunger','knotkeeper','borrowedOracle'];
const current=structuredClone(Object.fromEntries(ids.map(id=>[id,enemies[id]])));
const old=structuredClone(current);
for(const e of Object.values(old)) delete e.openingIdeons;
delete old.echoPolyp.openingCorruption.immediate;
for(const [id,hp,damage,sequences] of [
 ['glassBrood',58,[9,12]],['blindSeer',65,[11,9]],
 ['kindlyHunger',150,[13,16,0,15],{2:[12,12]}],['borrowedOracle',144,[12,15,0],{2:[12,14]}]]) {
 old[id].hp=hp;
 old[id].rotation.forEach((t,i)=>{t.damage=damage[i];if(sequences?.[i])t.sequence.forEach((h,j)=>h.damage=sequences[i][j]);});
}
const dir='reports/depths-encounter-roles-evaluation';
const snapshots = snapshotPath(dir);
await fs.mkdir(snapshots, { recursive: true });
await fs.mkdir(dir, { recursive: true });
const sources=Object.fromEntries(await Promise.all((await fs.readdir('src')).filter(n=>n.endsWith('.mjs')).map(async n=>[n,await fs.readFile('src/'+n,'utf8')])));
await fs.writeFile(snapshots+'/sources.json',JSON.stringify(sources));
const results=[];
try {
 for(const [variant,definitions] of [['before',old],['after',current]]) {
  for(const id of ids) Object.assign(enemies[id],structuredClone(definitions[id]));
  if(variant==='before')for(const id of ids)delete enemies[id].openingIdeons;
  for(const id of ids) {
   const seed=73001,g=depthsFixture(seed,id),policy=new WeightedPolicy();
   const initial=g.save(),opening={focus:g.s.battle.focus,channel:g.s.battle.channel,insight:g.s.battle.insight};
   const decisions=[];
   while(g.s.mode==='battle'&&decisions.length<1200) {
    const choice=policy.choose(g.observe(),g.legal());if(!choice)throw Error('No action '+id);
    decisions.push(choice.action.key);g.act(choice.action);
   }
   const result={variant,id,seed,opening,mode:g.s.mode,hp:g.s.hp,turn:g.s.battle.turn,damageTaken:g.s.stats.damageTaken,decisions:decisions.length};
   const replay=new Game(0,initial);
   for(const key of decisions)replay.act(key);
   assert.deepEqual(replay.observe(),g.observe());result.replayVerified=true;
   results.push(result);console.log(JSON.stringify(result));
   await fs.writeFile(`${snapshots}/${variant}-${id}.json`,JSON.stringify({version:VERSION,definition:definitions[id],initial,decisions,result,final:g.save()}));
  }
 }
} finally {for(const id of ids)Object.assign(enemies[id],current[id]);}
await fs.writeFile(dir+'/summary.json',JSON.stringify(results,null,2));
