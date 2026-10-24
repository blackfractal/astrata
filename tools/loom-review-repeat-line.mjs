import fs from 'node:fs';
import {Game} from '../src/engine.mjs';
const [build,boss,from,to]=process.argv.slice(2),root='reports/loom-balance-20261023',dir=`${root}/${process.argv[6]||"tuned"}-${build}-${boss}`;
const g=new Game(0,JSON.parse(fs.readFileSync(dir+'/current.json')));
const records=fs.readFileSync(`${root}/${process.argv[7]||"baseline"}-${build}-${boss}/decisions.jsonl`,'utf8').trim().split('\n').map(JSON.parse).filter(r=>r.before.turn>=Number(from));
for(const r of records){
 if(g.s.mode!=='battle'||g.s.battle.turn>=Number(to))break;
 if(g.s.battle.turn!==r.before.turn||g.s.battle.phase!==r.before.phase){console.log('Stopped: phase/turn changed');break;}
 const a=g.legal().find(a=>a.key===r.action.key);if(!a){console.log('Stopped: illegal',r.action.label);break;}
 const before={step:g.s.steps,stratum:2,mode:g.s.mode,hp:g.s.hp,turn:g.s.battle.turn,phase:g.s.battle.phase};
 g.act(a);fs.appendFileSync(dir+'/decisions.jsonl',JSON.stringify({before,action:a,reason:'Codex repeats the previously selected line under revised rules; stops at turn/phase/legality divergence',state:g.s})+'\n');
 fs.writeFileSync(dir+'/current.json',JSON.stringify(g.s));
}
console.log(g.s.mode,g.s.hp,g.s.battle?.turn,g.s.battle?.enemies[0].hp);
