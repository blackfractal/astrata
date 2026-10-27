import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {Game} from '../../src/engine.mjs';import {start,event} from './trial.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL('../../snapshots/current-depths-fight/'+n,import.meta.url)));
const results=[];
for(const name of ['human','oracle-no-damage','brood-victory']){
 let g=new Game(0,structuredClone(name==='brood-victory'?event:start));
 if(name==='brood-victory')g.act(g.legal().find(a=>a.type==='eventChoice'&&a.index===1));
 const initialDamage=g.s.stats.damageTaken, initialHp=g.s.hp;
 const data=read(name+'.json'),actions=Array.isArray(data)?data:data.actions;
 for(const row of actions){const a=g.legal().find(a=>a.key===row.action.key);assert.ok(a,name+': '+row.action.label);g.act(a);}
 assert.equal(g.s.mode,'reward');
 const result={name,initialHp,hp:g.s.hp,turn:g.s.battle.turn,damageTaken:g.s.stats.damageTaken-initialDamage,consumables:actions.filter(x=>x.action.type==='consume').length,replayVerified:true};
 if(name==='oracle-no-damage')assert.equal(result.damageTaken,0);
 results.push(result);
}
const sources=Object.fromEntries(['engine.mjs','content.mjs','depths-content.mjs','ideons.mjs','corruptions.mjs'].map(n=>[n,createHash('sha256').update(fs.readFileSync(new URL('../../src/'+n,import.meta.url))).digest('hex')]));
fs.writeFileSync(new URL('verification.json',import.meta.url),JSON.stringify({seed:start.seed,version:start.version,results,sources},null,2));
console.log(JSON.stringify(results,null,2));
