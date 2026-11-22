import fs from 'node:fs';
import {Game} from '../snapshots/manual-five-20261111/src/engine.mjs';
const root='snapshots/manual-five-20261111';
const [source,destination,stepText]=process.argv.slice(2);
if(!/^[1-5](?:-[a-z0-9]+)?$/.test(source)||!new RegExp(`^${source[0]}-[a-z0-9]+$`).test(destination))throw Error('Invalid fork');
const step=Number(stepText),reason=fs.readFileSync(0,'utf8').trim();
if(!Number.isInteger(step)||!reason||fs.existsSync(`${root}/${destination}`))throw Error('Need fresh destination, exact step, and rationale');
const records=fs.readFileSync(`${root}/${source}/decisions.jsonl`,'utf8').trim().split('\n').map(JSON.parse);
const g=new Game(0,JSON.parse(fs.readFileSync(`${root}/${source}/initial.json`)));
for(const r of records){if(g.s.steps===step)break;const a=g.legal().find(a=>a.key===r.action.key);if(!a)throw Error('Invalid prefix');g.act(a);}
if(g.s.steps!==step)throw Error('Missing branch point');
const d=`${root}/${destination}`;fs.mkdirSync(d);
fs.writeFileSync(`${d}/initial.json`,JSON.stringify(g.s));fs.writeFileSync(`${d}/current.json`,JSON.stringify(g.s));
fs.writeFileSync(`${d}/decisions.jsonl`,'');
fs.writeFileSync(`${d}/fork.json`,JSON.stringify({source,destination,step,reason,knownArchon:g.observe().archon,rule:'Correct only errors apparent from player-visible information at branch time; no future RNG or hidden Archon knowledge; original run retained.'},null,2));
console.log(JSON.stringify({destination,step,mode:g.s.mode,knownArchon:g.observe().archon}));
