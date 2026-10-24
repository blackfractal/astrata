import fs from 'node:fs';
import {Game} from '../src/engine.mjs';
const [build,boss]=process.argv.slice(2),root='reports/loom-balance-20261023';
const dir=`${root}/${process.argv[4]||"tuned"}-${build}-${boss}`;
const g=new Game(0,JSON.parse(fs.readFileSync(dir+'/initial.json')));
const records=fs.readFileSync(`${root}/baseline-${build}-${boss}/decisions.jsonl`,'utf8').trim().split('\n').map(JSON.parse);
const until=boss==='blackBile'?3:8;
if(fs.existsSync(dir+'/decisions.jsonl'))throw Error('Already started');
for(const r of records){
 if(g.s.battle.turn>=until)break;
 const before={step:g.s.steps,stratum:2,mode:g.s.mode,hp:g.s.hp,turn:g.s.battle.turn,phase:g.s.battle.phase};
 const a=g.legal().find(a=>a.key===r.action.key);if(!a)throw Error('Diverged before change '+r.action.label);
 g.act(a);fs.appendFileSync(dir+'/decisions.jsonl',JSON.stringify({before,action:a,reason:'Replay of Codex baseline opening before the changed boss move; subsequent choices adapted manually',state:g.s})+'\n');
}
fs.writeFileSync(dir+'/current.json',JSON.stringify(g.s));console.log(dir,g.s.battle.turn,g.s.hp);
