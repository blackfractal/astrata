import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Game} from '../../snapshots/apex-semi-ideal-4.0.19/guided/rules/engine.mjs';
const root='snapshots/apex-semi-ideal-4.0.19';
const g=new Game(0,JSON.parse(fs.readFileSync(root+'/initial.json')));
const actions=[];
for(const [id,slot] of [['corner',6],['shield',5],['cinder',12],['eclipse',19],['lucidGuide',20]]){
 const uid=g.s.battle.hand.find(c=>c.id===id).uid;
 const a=g.legal().find(a=>a.type==='place'&&a.uid===uid&&a.slot===slot);assert.ok(a);
 g.act(a);actions.push(a);
}
fs.writeFileSync(root+'/guided-opening.json',JSON.stringify(g.s));
fs.writeFileSync(root+'/guided-prefix.json',JSON.stringify(actions));
console.log(JSON.stringify({hp:g.s.hp,focus:g.s.battle.focus,channel:g.s.battle.channel,placements:actions.map(a=>a.label)}));
