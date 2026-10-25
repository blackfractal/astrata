import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Game} from './revised/rules/engine.mjs';
const root='reports/apex-double-fangs-4.0.22';
const g=new Game(0,JSON.parse(fs.readFileSync(root+'/turn11.json')));
const actions=JSON.parse(fs.readFileSync(root+'/turn11-prefix.json'));
const finish=[];
function act(type,filter=()=>true){
 const a=g.legal().find(a=>a.type===type&&filter(a));assert.ok(a,`Missing ${type}`);
 const before=g.s.battle.enemies[0].hp;g.act(a);actions.push(a);
 finish.push({label:a.label,damage:before-Math.max(0,g.s.battle.enemies[0].hp),boss:g.s.battle.enemies[0].hp,hp:g.s.hp});
}
const undertow=g.s.battle.hand.find(c=>c.id==='undertow');
act('place',a=>a.uid===undertow.uid&&a.slot===30);
const solitude=g.s.battle.hand.find(c=>c.id==='solitude');
act('place',a=>a.uid===solitude.uid&&a.slot===35);
act('activatePhase');
act('activate',a=>a.slot===27&&a.cardTarget===34&&a.newElement==='Light');
act('activate',a=>a.slot===34&&a.focusSpend===3);
act('activate',a=>a.slot===35);
assert.ok(g.s.hp>0&&g.s.battle.enemies.every(e=>e.hp<=0),'Not a win');
const replay=new Game(0,JSON.parse(fs.readFileSync(root+'/initial.json')));
for(const [i,wanted] of actions.entries()){
 const a=replay.legal().find(a=>a.key===wanted.key);assert.ok(a,`Illegal ${i}`);replay.act(a);
}
for(const k of ['hp','mode','rng','battle','inventory','equipment'])assert.deepEqual(replay.s[k],g.s[k],k);
const summary={win:true,hp:g.s.hp,boss:g.s.battle.enemies[0].hp,turn:g.s.battle.turn,destroyed:g.s.battle.destroyed.length,actions:actions.length,manualFinalActions:finish.length,replayVerified:true,finish};
fs.writeFileSync(root+'/winning-line.json',JSON.stringify({summary,actions,final:g.s}));
fs.writeFileSync(root+'/winning-summary.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary));
