import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Game} from './revised/rules/engine.mjs';
const root='reports/apex-fullest-4.0.19';
const initial=JSON.parse(fs.readFileSync(root+'/initial-70hp.json'));
const prefix=JSON.parse(fs.readFileSync(root+'/same-line-70hp.json'));
const suffix=JSON.parse(fs.readFileSync(root+'/full-health-prefix/trial.json'));
const actions=[...prefix.actions,...suffix.actions];
const g=new Game(0,structuredClone(initial));
for(const [i,wanted] of actions.entries()){
 const a=g.legal().find(a=>a.key===wanted.key);assert.ok(a,`Illegal action ${i}`);g.act(a);
}
for(const key of ['hp','mode','rng','battle','inventory','equipment'])assert.deepEqual(g.s[key],suffix.final[key],key);
fs.writeFileSync(root+'/full-health-combined.json',JSON.stringify({initial,actions,summary:{...suffix.summary,actions:actions.length,fullReplayVerified:true},final:g.s}));
console.log(JSON.stringify({actions:actions.length,turn:g.s.battle.turn,hp:g.s.hp,boss:g.s.battle.enemies[0].hp,replayVerified:true}));
