import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root='reports/loom-balance-20261023', results=[];
for(const name of fs.readdirSync(root)) {
  const dir=path.join(root,name);
  if(!fs.existsSync(path.join(dir,'decisions.jsonl')))continue;
  const sources=fs.readFileSync(path.join(dir,'sources.json'),'utf8');
  const frozen=path.resolve('.tmp/loom-verify-'+name+'/src');
  fs.mkdirSync(frozen,{recursive:true});
  for(const [n,s] of Object.entries(JSON.parse(sources)))fs.writeFileSync(path.join(frozen,n),s);
  const {Game}=await import(pathToFileURL(path.join(frozen,'engine.mjs')).href);
  const g=new Game(0,JSON.parse(fs.readFileSync(path.join(dir,'initial.json'))));
  const records=fs.readFileSync(path.join(dir,'decisions.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
  for(const [i,r] of records.entries()){
    const a=g.legal().find(a=>a.key===r.action.key);
    assert.ok(a,`${name} action ${i}: ${r.action.label}`);
    g.act(a);
    for(const k of ['rng','steps','hp','gold','mode','deck','inventory','equipment','stats','battle'])
      assert.deepEqual(g.s[k],r.state[k],`${name} action ${i}: ${k}`);
  }
  const end=JSON.parse(fs.readFileSync(path.join(dir,'current.json')));
  for(const k of ['rng','steps','hp','gold','mode','deck','inventory','equipment','stats','battle'])
    assert.deepEqual(g.s[k],end[k],`${name} final ${k}`);
  assert.equal(g.s.mode,'reward');
  results.push({name,actions:records.length,hp:g.s.hp,turn:g.s.battle.turn,mode:g.s.mode,verified:true,sourceSHA256:crypto.createHash('sha256').update(sources).digest('hex')});
}
assert.equal(results.length,10);
fs.writeFileSync('reports/loom-balance-verification.json',JSON.stringify({manual:results,totalActions:results.reduce((n,r)=>n+r.actions,0)},null,2));
console.log(JSON.stringify(results,null,2));
