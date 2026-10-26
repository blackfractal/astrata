import fs from 'node:fs';import assert from 'node:assert/strict';
import {Game as NewGame} from '../src/engine.mjs';
import {Game as OldGame} from '../reports/bombadier-retune-4.0.28/baseline/src/engine.mjs';
const dir='reports/bombadier-retune-4.0.28';
const initial=JSON.parse(fs.readFileSync(dir+'/pre-battle.json'));
const human=JSON.parse(fs.readFileSync(dir+'/human-actions.json'));
const defenses=new Set(['ward','block','intercept','bracelet','armor','skipEquipment','takeHit']);
const summary=[];
for(const [name,Game] of [['baseline',OldGame],['tuned',NewGame]]){
 const g=new Game(0,structuredClone(initial)),trace=[],adjustments=[],moves=[];
 const run=a=>{g.act(a);trace.push(a);for(const m of g.decisionLog||[])if(m.startsWith('King Bombadier:'))moves.push({turn:g.s.battle.turn,hp:g.s.hp,move:m});};
 let diverged=null;
 for(const original of human){
  if(g.s.mode==='result'||g.s.mode==='reward')break;
  if(defenses.has(original.type)){
    if(!g.s.battle?.reaction){adjustments.push('No pending attack: skipped '+original.label);continue;}
    let a=g.legal().find(a=>a.key===original.key);
    if(!a&&original.type==='block')a=g.legal().find(a=>a.type==='block'&&a.slot===original.slot);
    if(!a){adjustments.push('Unavailable defense: '+original.label);a=g.legal().find(a=>a.type==='skipEquipment');}
    run(a);continue;
  }
  let safety=0;while(g.s.mode==='battle'&&g.s.battle.reaction&&safety++<50){adjustments.push('Accept additional spillover: '+g.s.battle.reaction.damage+' '+g.s.battle.reaction.element);run(g.legal().find(a=>a.type==='skipEquipment'));}
  if(g.s.mode==='result')break;
  const a=g.legal().find(a=>a.key===original.key);
  if(!a){diverged={turn:g.s.battle?.turn,action:original.label};break;}
  run(a);
 }
 const replay=new Game(0,structuredClone(initial));for(const a of trace)replay.act(a);assert.deepEqual(JSON.parse(JSON.stringify(replay.s)),JSON.parse(JSON.stringify(g.s)));
 const e=g.s.battle?.enemies[0],result={name,outcome:g.s.mode==='reward'?'win':g.s.mode==='result'?'loss':'stopped at divergence',hp:g.s.hp,turn:g.s.battle?.turn,bossHP:e?.hp,lastDitch:!!e?.lastDitchUsed,remainingWarnings:e?.corruptionPlan?.length,diverged,adjustments,moves,replayVerified:true};
 fs.writeFileSync(dir+'/'+name+'-human-line.json',JSON.stringify({initial,trace,final:g.s,result}));summary.push(result);console.log(JSON.stringify(result));
}
fs.writeFileSync(dir+'/comparison.json',JSON.stringify(summary,null,2));
