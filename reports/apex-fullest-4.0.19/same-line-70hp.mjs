import fs from 'node:fs';
import {Game} from './revised/rules/engine.mjs';
const root='reports/apex-fullest-4.0.19';
const g=new Game(0,JSON.parse(fs.readFileSync(root+'/initial-70hp.json')));
const actions=JSON.parse(fs.readFileSync(root+'/revised/trial.json')).actions;
let played=0;
for(const wanted of actions){const a=g.legal().find(x=>x.key===wanted.key);if(!a)break;g.act(a);played++;}
const result={played,expected:actions.length,hp:g.s.hp,mode:g.s.mode,turn:g.s.battle.turn,phase:g.s.battle.phase,boss:g.s.battle.enemies[0].hp,reaction:g.s.battle.reaction,jobs:g.s.battle.jobs};
fs.writeFileSync(root+'/same-line-70hp.json',JSON.stringify({result,actions:actions.slice(0,played),state:g.s},null,2));
console.log(JSON.stringify(result));
