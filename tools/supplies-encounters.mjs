import { snapshotPath } from './artifact-paths.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {WeightedPolicy} from '../src/policy.mjs';
import {items} from '../src/content.mjs';
const dir=process.argv[2]||'reports/supplies-encounters-4.0.14';
const snapshots = snapshotPath(dir);
fs.mkdirSync(snapshots, { recursive: true });
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(snapshots+'/sources.json',JSON.stringify(Object.fromEntries(fs.readdirSync('src').filter(n=>n.endsWith('.mjs')).map(n=>[n,fs.readFileSync('src/'+n,'utf8')]))));
const summary=[];
const builds={loom:JSON.parse(fs.readFileSync('snapshots/loom-balance-20261023/final-engine-blackBile/initial.json')),late:JSON.parse(fs.readFileSync('snapshots/apex-500-review-4.0.13/initial.json'))};
for(const enemy of ['blackBile','bombadier','trickster','mindHive','cnidarian','refractionCannon','apex'])for(const item of ['baseline','prismaticBracelet','reservoirBracelet','reclaimerBracelet','lastStandBracelet','echoRing','resonanceHelm','remembranceArmor']){
 if(fs.existsSync(`${dir}/${enemy}-${item}.json`)){summary.push(JSON.parse(fs.readFileSync(`${snapshots}/${enemy}-${item}.json`)).result);continue;}
 const stratum=['blackBile','bombadier','trickster'].includes(enemy)?2:enemy==='apex'?4:3;
 const s=structuredClone(builds[stratum===2?'loom':'late']);
 s.stratum=stratum;s.hp=70;s.maxHp=70;s.mode='field';delete s.checkpoint;delete s.battle;delete s.apex;s.rng=971230;
 s.inventory=s.inventory.filter(x=>Object.values(s.equipment).includes(x.uid)||s.inventory.some(y=>Object.values(s.equipment).includes(y.uid)&&y.gem===x.uid));
 const g=new Game(0,s);
 if(item!=='baseline'){const slot=items[item].slot==='wrist'?'wrist1':items[item].slot==='finger'?'finger1':items[item].slot;const old=g.getItem(g.s.equipment[slot]),gem=old?.gem;const added=g.addItem(item);if(gem&&items[item].socket){added.gem=gem;old.gem=null;}g.s.equipment[slot]=added.uid;if(old)g.removeItem(old.uid);}
 // Same finite supply kit for every loadout; equipment is the comparison variable.
 for(const id of ['prismaticTincture','perfectInspiration','furySap','bastionOil','recallMist','sealedBreath'])g.addItem(id);
 g.beginBattle([{uid:g.uid(),enemy,restless:0}]);delete g.s.checkpoint;
 const initial=structuredClone(g.s),trace=[],policy=new WeightedPolicy(),turns=[];let last=-1;
 while(g.s.mode==='battle'&&trace.length<2000){const b=g.s.battle;if(b.turn!==last){last=b.turn;turns.push({turn:b.turn,hp:g.s.hp,enemyHP:b.enemies[0].hp,ward:b.grid.flat().reduce((n,c)=>n+(c.ward||0),0)});}
 const action=policy.choose(g.observe(),g.legal())?.action;if(!action)throw Error('No action');g.act(action);trace.push(action);}
 assert.notEqual(g.s.mode,'battle');
 const replay=new Game(0,initial);for(const a of trace)replay.act(a);assert.deepEqual(JSON.parse(JSON.stringify(replay.s)),JSON.parse(JSON.stringify(g.s)));
 const result={enemy,item,stratum,hp:g.s.hp,outcome:g.s.mode==='result'?'loss':'victory',turns:g.s.battle.turn,enemyHP:g.s.battle.enemies[0].hp,used:g.s.stats.consumablesUsed?.slice(-6),replayVerified:true};
 fs.writeFileSync(`${snapshots}/${enemy}-${item}.json`,JSON.stringify({initial,trace,final:g.s,turnLog:turns,result}));summary.push(result);console.log(enemy,item,result.outcome,result.hp);
}
fs.writeFileSync(dir+'/summary.json',JSON.stringify(summary,null,2));
