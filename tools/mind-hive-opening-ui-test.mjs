import { _electron as electron } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { depthsFixture } from './depths-fixture.mjs';
const profile=path.resolve('.tmp/hive-opening-ui-'+Date.now());await fs.mkdir(profile,{recursive:true});
const g=depthsFixture(73001,'mindHive');
await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
const report={checks:[],errors:[]};
try{
 const p=await app.firstWindow();p.on('pageerror',e=>report.errors.push(e.message));
 await p.locator('[data-ui="continue"]').click();await p.waitForFunction(()=>document.querySelectorAll('.ideon').length===8&&!document.querySelector('.presentation-bar'));
 assert.equal(await p.locator('.ideon').count(),8);
 for(const e of g.s.battle.ideons)assert.equal(await p.locator(`[data-slot="${e.slot}"] .ideon`).count(),1);
 await fs.mkdir('reports/screenshots/hive-opening',{recursive:true});await p.screenshot({path:'reports/screenshots/hive-opening/initial.png'});
 const a=g.legal().find(a=>a.type==='activatePhase');
 assert.ok(a,'Placement arrow is available before insects move');
 await p.locator('[data-action='+JSON.stringify(a.key)+']').filter({visible:true}).first().click();g.act(a);
 const end=g.legal().find(a=>a.type==='endTurn');assert.ok(end);
 await p.locator('[data-action='+JSON.stringify(end.key)+']').filter({visible:true}).first().click();g.act(end);
 await p.waitForFunction(()=>!document.querySelector('.presentation-bar')&&document.querySelectorAll('.corruption-seal').length===1);
 for(const e of g.s.battle.ideons)assert.equal(await p.locator(`[data-slot="${e.slot}"] .ideon`).count(),1);
 await p.screenshot({path:'reports/screenshots/hive-opening/after-first-turn.png'});
 report.checks.push('Continue displays eight insects in engine-defined spaces; player placement/activation arrows work first; enemy turn visibly moves swarm and lays one egg.');
 assert.deepEqual(report.errors,[]);
}finally{await app.close();}
await fs.writeFile('reports/mind-hive-opening-ui-verification.json',JSON.stringify(report,null,2));console.log(report);
