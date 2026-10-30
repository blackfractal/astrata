import { reportPath } from './artifact-paths.mjs';
import fs from 'node:fs';
import {Game} from '../src/engine.mjs';
const root='snapshots/loom-balance-20261023'; fs.mkdirSync(root,{recursive:true});
const sources=Object.fromEntries(fs.readdirSync('src').filter(n=>n.endsWith('.mjs')).map(n=>[n,fs.readFileSync('src/'+n,'utf8')]));
const phase=process.argv[2]||'baseline';
for(const [build,file,seed] of [
 ['engine','snapshots/codex-growth-manual-17101703/battle-136.json',231001],
 ['mixed','snapshots/trickster-rework/restored-save.json',231002],
]) for(const boss of ['blackBile','bombadier']) {
 const dir=`${root}/${phase}-${build}-${boss}`; if(fs.existsSync(dir))throw Error('Exists '+dir);
 const s=JSON.parse(fs.readFileSync(file));
 delete s.checkpoint; delete s.battle; delete s.tutorial;
 s.mode='field';s.stratum=2;s.hp=70;s.status={burn:0,poison:0,corrode:0};s.history=[];s.log=[];
 const g=new Game(0,s); g.s.rng=seed;g.s.seed=seed;
 g.beginBattle([{uid:g.uid(),enemy:boss,restless:0}],{enemyFirst:false});delete g.s.checkpoint;
 fs.mkdirSync(dir,{recursive:true});
 for(const name of ['initial','current'])fs.writeFileSync(dir+'/'+name+'.json',JSON.stringify(g.s));
 fs.writeFileSync(dir+'/sources.json',JSON.stringify(sources));
 fs.mkdirSync(reportPath(dir),{recursive:true});
 fs.writeFileSync(reportPath(dir+'/manifest.json'),JSON.stringify({phase,build,boss,seed,source:file,controller:'Codex manual decisions; no AI/search',fixture:'Actual archived deck/equipment, fresh isolated boss battle at 70HP; no ambush or Restless',bonuses:g.bonuses()},null,2));
 console.log(dir,JSON.stringify(g.bonuses()));
}
