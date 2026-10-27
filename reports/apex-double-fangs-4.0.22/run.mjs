import { reportPath } from '../../tools/artifact-paths.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root='snapshots/apex-double-fangs-4.0.22';
const [variant,opening='guided']=process.argv.slice(2);
assert.ok(['baseline','revised','spread'].includes(variant));
assert.ok(['guided','free','titan'].includes(opening));
const {Game}=await import(`../../snapshots/apex-double-fangs-4.0.22/${variant}/rules/engine.mjs`);
const {enemies,cards,VERSION}=await import(`../../snapshots/apex-double-fangs-4.0.22/${variant}/rules/content.mjs`);
const {activate,defend,setConfig}=await import(`./${variant}/search.mjs`);
const {planPlace,configure}=await import(`./${variant}/placement.mjs`);
const config={hp:3,keep:1.5,guard:1.5,titan:1.5,draw:2,insanity:10};
setConfig(config);configure(config);
const initial=JSON.parse(fs.readFileSync(root+'/initial.json'));
let g=new Game(0,structuredClone(initial));
const actions=[],turns=[];
if(opening==='guided')for(const wanted of JSON.parse(fs.readFileSync(root+'/guided-prefix.json'))){
  const a=g.legal().find(a=>a.key===wanted.key);assert.ok(a);g.act(a);actions.push(a);
}
if(opening==='titan')for(const [id,slot] of [['grove',20],['lucidGuide',19],['corner',6],['cinder',5]]){
 const uid=g.s.battle.hand.find(c=>c.id===id).uid;
 const a=g.legal().find(a=>a.type==='place'&&a.uid===uid&&a.slot===slot);assert.ok(a);g.act(a);actions.push(a);
}
const dir=`${root}/${variant}-${opening}`;fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(reportPath(dir), {recursive:true});
const fang=enemies.apex.rotation[1];
assert.equal(fang.grid,variant==='baseline'?'destroy':undefined);
if(variant!=='baseline')assert.deepEqual(fang.sequence,[{damage:16,element:'Fire'},{damage:16,element:'Fire'}]);
while(g.s.mode==='battle'&&g.s.hp>0&&g.s.battle.turn<45){
 const turn=g.s.battle.turn;
 if(g.s.battle.reaction){const r=defend(g);g=r.g;actions.push(...r.actions);}
 if(g.s.mode!=='battle')break;
 if(g.s.battle.phase==='place')actions.push(...planPlace(g));
 if(g.s.mode!=='battle')break;
 const r=activate(g);assert.ok(r);g=r.g;actions.push(...r.actions);
 const row={turn,hp:g.s.hp,boss:g.s.battle.enemies[0].hp,destroyed:g.s.battle.destroyed.length,actions:actions.length};
 turns.push(row);console.log(JSON.stringify({variant,opening,...row}));
 fs.writeFileSync(dir+'/progress.json',JSON.stringify({actions,turns,state:g.s}));
 assert.ok(g.s.mode!=='battle'||g.s.battle.turn!==turn,'Stalled');
}
const replay=new Game(0,structuredClone(initial));
const bossDamage={},destroyedBy={},potions=[];
for(const [i,wanted] of actions.entries()){
 const a=replay.legal().find(a=>a.key===wanted.key);assert.ok(a,`Illegal ${i}`);
 const b=replay.s.battle,before=b.enemies[0].hp,n=b.destroyed.length;
 const name=a.type==='activate'?cards[b.grid[a.slot].at(-1).id].name:a.type;
 const move=b.reaction?.name||replay.tell(b.enemies[0]).name;
 if(a.type==='consume')potions.push({turn:b.turn,id:replay.getItem(a.uid).id,hp:replay.s.hp});
 replay.act(a);
 const dealt=before-Math.max(0,b.enemies[0].hp);if(dealt>0)bossDamage[name]=(bossDamage[name]||0)+dealt;
 if(b.destroyed.length>n)destroyedBy[move]=(destroyedBy[move]||0)+b.destroyed.length-n;
}
for(const k of ['hp','mode','rng','battle','inventory','equipment'])assert.deepEqual(replay.s[k],g.s[k],k);
const summary={version:VERSION,variant,opening,win:g.s.hp>0&&g.s.battle.enemies.every(e=>e.hp<=0),terminal:g.s.mode!=='battle',hp:g.s.hp,boss:g.s.battle.enemies[0].hp,turn:g.s.battle.turn,destroyed:g.s.battle.destroyed.length,actions:actions.length,death:g.s.death,replayVerified:true,bossDamage,destroyedBy,potions};
fs.writeFileSync(dir+'/trial.json',JSON.stringify({summary,actions,turns,final:g.s}));
fs.writeFileSync(reportPath(dir+'/summary.json'),JSON.stringify(summary,null,2));
fs.writeFileSync(dir+'/rules-manifest.json',JSON.stringify(Object.fromEntries(fs.readdirSync(`${root}/${variant}/rules`).map(n=>[n,createHash('sha256').update(fs.readFileSync(`${root}/${variant}/rules/`+n)).digest('hex')])),null,2));
console.log('RESULT '+JSON.stringify(summary));
