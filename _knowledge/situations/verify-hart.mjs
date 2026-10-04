import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const catalog=path.dirname(fileURLToPath(import.meta.url));
const entry=path.join(catalog,'cinder-hart-last-spark');
const manifest=JSON.parse(fs.readFileSync(path.join(entry,'manifest.json'),'utf8'));
const sibling=path.resolve(catalog,'../..');
const require=createRequire(path.join(sibling,'package.json'));
const { _electron:electron }=require('@playwright/test');
const sha=p=>fs.existsSync(p)?crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'):null;
const real=path.join(process.env.APPDATA,'astrata');
const realBefore=Object.fromEntries(['save.json','history.json','collections.json'].map(n=>[n,sha(path.join(real,n))]));
const report={version:manifest.build,snapshots:[],replays:[],errors:[]};
fs.mkdirSync(path.join(entry,'screenshots'),{recursive:true});
let Game;
function prepared(name){
 const r=spawnSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(catalog,'open-situation.ps1'),'-Situation',manifest.id,'-Snapshot',name,'-PrepareOnly'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout.trim());
}
for(const name of Object.keys(manifest.snapshots)){
 const p=prepared(name);
 Game ||= (await import(pathToFileURL(path.join(p.workingDirectory,'resources/app/src/engine.mjs')).href)).Game;
 const saved=JSON.parse(fs.readFileSync(path.join(p.profile,'save.json'),'utf8'));
 const original=JSON.parse(fs.readFileSync(path.join(entry,manifest.snapshots[name].file),'utf8'));
 const copy=structuredClone(saved);delete copy.history;delete copy.log;delete copy.uiMeta;assert.deepEqual(copy,original);
 const app=await electron.launch({executablePath:p.executable,args:['--user-data-dir='+p.profile],cwd:p.workingDirectory});
 try{
  const page=await app.firstWindow();page.on('pageerror',e=>report.errors.push(e.message));
  await page.locator('[data-ui="continue"]').click();
  await page.locator('.enemy').waitFor();
  const enemyText=await page.locator('.enemy').textContent();assert.ok(enemyText.includes('Cinder Hart'));assert.ok(enemyText.includes('Immune to Burn and Poison'));
  await page.screenshot({path:path.join(entry,'screenshots',name+'.png')});
  const runDir=path.join(p.profile,'runs',p.sessionId);
  let latest;for(let i=0;i<30;i++){if(fs.existsSync(path.join(runDir,'latest.json'))){latest=JSON.parse(fs.readFileSync(path.join(runDir,'latest.json'),'utf8'));break;}await page.waitForTimeout(100);}
  assert.ok(latest);assert.equal(latest.hp,original.hp);assert.equal(latest.battle.turn,original.battle.turn);assert.equal(latest.battle.phase,original.battle.phase);assert.deepEqual(latest.battle.grid,original.battle.grid);assert.equal(latest.rng,original.rng);
  report.snapshots.push({name,hp:latest.hp,turn:latest.battle.turn,phase:latest.battle.phase,uiLoaded:true});
 }finally{await app.close();}
}
const load=name=>{const s=JSON.parse(fs.readFileSync(path.join(entry,manifest.snapshots[name].file),'utf8'));s.history=[];s.log=[];return new Game(0,s);};
const actions=JSON.parse(fs.readFileSync(path.join(entry,'solutions/jonathan-replay.json'),'utf8'));
for(const name of Object.keys(manifest.snapshots)){
 const g=load(name);
 for(const row of actions.filter(r=>r.sourceEventIndex>manifest.snapshots[name].sourceEventIndex)){
  const a=g.legal().find(a=>a.key===row.action.key);assert.ok(a,name+': '+row.action.label);g.act(a);assert.equal(g.s.hp,row.hp);assert.equal(g.s.battle.enemies[0].hp,row.bossHP);
 }
 assert.equal(g.s.outcome,'win');assert.equal(g.s.hp,4);report.replays.push({name,line:'Jonathan',outcome:g.s.outcome,hp:g.s.hp});
}
const g=load('final-turn');g.act(g.legal().find(a=>a.type==='activatePhase'));
for(const slot of [23,22,29]){const a=g.legal().find(a=>a.type==='activate'&&a.slot===slot&&a.element==='Water');assert.ok(a);g.act(a);}
assert.equal(g.s.mode,'reward');assert.equal(g.s.hp,4);assert.equal(g.s.battle.channel,0);report.replays.push({name:'final-turn',line:'Board-only Water relay',hp:g.s.hp,mode:g.s.mode,channel:0});
assert.deepEqual(report.errors,[]);
const realAfter=Object.fromEntries(Object.keys(realBefore).map(n=>[n,sha(path.join(real,n))]));
assert.deepEqual(realAfter,realBefore);report.normalProfileUnchanged=true;
fs.writeFileSync(path.join(entry,'verification.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,version:manifest.build.package},null,2));
