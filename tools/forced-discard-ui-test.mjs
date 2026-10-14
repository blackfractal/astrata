import { _electron as electron } from '@playwright/test';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
const profile=path.resolve('.tmp/forced-discard-ui-'+Date.now());await fs.mkdir(profile,{recursive:true});
const g=new Game(108);g.s.stratum=3;g.s.equipment={};g.beginBattle([{uid:900,enemy:'mindHive',restless:0}]);g.s.hp=40;
g.s.battle.ideons=[]; // Isolate egg presentation from the opening swarm.
const b=g.s.battle,c=g.instance(g.newCard('ward'));b.grid[6]=[c];const focus=g.instance(g.newCard('focus'));b.grid[13]=[focus];b.phase='activate';
for(const [slot,element] of [[6,'Fire'],[13,'Water'],[20,'Arcane']])b.corruptions[slot]={kind:'egg',uid:g.uid(),createdTurn:0,remaining:1,damage:8,element,insect:'runner',source:900};
delete g.s.checkpoint;await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
const report={checks:[],errors:[]};
try{
 const p=await app.firstWindow();p.on('pageerror',e=>report.errors.push(e.message));await p.locator('[data-ui="continue"]').click();
 await p.locator('[data-slot="6"] .corruption-art').evaluate(img=>img.decode());
 assert.match(await p.locator('[data-slot="6"] .corruption-seal').getAttribute('data-tooltip'),/cover to Discard/);
 assert.match(await p.locator('[data-slot="13"] .corruption-seal').textContent(),/Water.*1 turn/);
 assert.match(await p.locator('[data-slot="13"] .corruption-seal').getAttribute('data-tooltip'),/cover to Destroyed/);
 assert.equal(await p.locator('.egg-cover-aura').count(),2);
 assert.equal(await p.locator('.egg-cover-aura').first().evaluate(el=>getComputedStyle(el).pointerEvents),'none');
 await fs.mkdir('reports/screenshots/forced-discard',{recursive:true});await p.screenshot({path:'reports/screenshots/forced-discard/before.png'});
 await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.egg-cover-aura i').first().evaluate(el=>getComputedStyle(el).animationName),'none');await p.emulateMedia({reducedMotion:'no-preference'});
 const a=g.legal().find(a=>a.type==='endTurn');await p.locator('[data-action='+JSON.stringify(a.key)+']').filter({visible:true}).first().click();
 await p.waitForFunction(()=>!document.querySelector('.presentation-bar')&&document.querySelectorAll('.ideon').length===3);
 await p.screenshot({path:'reports/screenshots/forced-discard/hatched.png'});
 const dirs=await fs.readdir(profile+'/runs',{withFileTypes:true});const run=dirs.find(x=>x.isDirectory()&&x.name!=='builds').name;
 const raw=JSON.parse(await fs.readFile(profile+'/runs/'+run+'/latest.json','utf8')),s=raw.state||raw;
 assert.equal(s.hp,32);assert.ok(s.battle.discard.some(x=>x.uid===c.uid));assert.ok(s.battle.destroyed.some(x=>x.uid===focus.uid));assert.ok(!s.battle.discard.some(x=>x.uid===focus.uid));assert.equal(s.battle.ideons.length,3);assert.equal(Object.keys(s.battle.corruptions).length,1);
 report.checks.push('Recallable Ward tooltip says Discard; Focus Energy tooltip says Destroyed. Actual hatch preserves both destinations, prevents damage for both covers, deals 8 only for the uncovered egg, spawns all three insects, and has no renderer errors.');assert.deepEqual(report.errors,[]);
}finally{await app.close();}
await fs.writeFile('reports/forced-discard-ui-verification.json',JSON.stringify(report,null,2));console.log(report);
