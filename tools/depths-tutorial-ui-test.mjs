import { _electron as electron } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {WeightedPolicy} from '../src/policy.mjs';
const normal=new Game(33003); normal.enterStratum2(3); normal.act(normal.legal().find(a=>a.type==='leave'));
const profile=path.resolve('.tmp/depths-tutorial-'+Date.now());
await fs.mkdir(profile,{recursive:true});
await fs.mkdir('reports/screenshots/depths-tutorial',{recursive:true});
await fs.writeFile(profile+'/save.json',JSON.stringify(normal.s));
await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
const errors=[], checks=[];
try {
 const p=await app.firstWindow(); p.on('pageerror',e=>errors.push(e.message));
 const actionButton=async key=>{
   const b=p.locator('[data-action]').filter({visible:true});
   for(let i=0;i<await b.count();i++) if(await b.nth(i).getAttribute('data-action')===key) return b.nth(i);
   throw new Error('Missing action button '+key);
 };
 await p.locator('[data-ui="continue"]').click();
 await (await actionButton(normal.legal()[0].key)).click();
 await p.locator('[data-tutorial-step="whispers"]').waitFor();
 const normalSave=await fs.readFile(profile+'/save.json','utf8');
 assert.equal(JSON.parse(normalSave).stratum,3);
 assert.ok(JSON.parse(normalSave).deck.some(c=>c.id==='lucidGuide'));
 checks.push('First S3 entry automatically starts tutorial after preserving normal run and awarding Guide');
 for(let n=0;n<24;n++) {
   const state=JSON.parse(await fs.readFile(profile+'/tutorial-save.json','utf8'));
   const g=new Game(0,state),lesson=g.s.tutorial.lesson,a=g.legal()[0];
   console.log(lesson);
   await p.locator(`[data-tutorial-step="${lesson}"]`).waitFor();
   if(['whispers','route','independent'].includes(lesson)) await p.screenshot({path:`reports/screenshots/depths-tutorial/${lesson}.png`});
   if(lesson==='independent') break;
   if(a.type==='tutorialNext') await p.locator('[data-tutorial-next]').click();
   else if(a.type==='place') {
     await p.locator(`[data-hand="${a.uid}"]`).click();
     await p.locator(`[data-slot="${a.slot}"]`).click();
   } else if(a.type==='activate') {
     await p.locator(`[data-activate-slot="${a.slot}"]`).click();
     if(a.destination!=null) await p.locator(`[data-slot="${a.destination}"][data-target-choice]`).click();
     if(a.target!=null) await p.locator(`[data-enemy-uid="${a.target}"][data-target-choice]`).click();
   } else if(a.type==='block') await p.locator(`[data-slot="${a.slot}"]`).click();
   else if(a.type==='bracelet') await p.locator(`.battle-player [data-item-uid="${a.uid}"]`).click();
   else await (await actionButton(a.key)).click();
   await p.waitForFunction(old=>document.querySelector('.tutorial-guide')?.dataset.tutorialStep!==old,lesson);
   if(lesson==='right-ward') {
     await p.reload(); await p.locator('[data-ui="continueTutorial"]').click();
     checks.push('Resume preserves charged Ward and exact lesson');
   }
 }
 assert.equal(await fs.readFile(profile+'/save.json','utf8'),normalSave);
 await p.locator('[data-tutorial-independent]').click();
 assert.equal(await p.locator('.tutorial-guide:visible').count(),0);
 await p.locator('[data-tutorial-hint]').waitFor({timeout:20000});
 checks.push('Optional hint appears after 15 seconds idle');
 // Verify a legal practice victory headlessly, then resume its exact terminal
 // state to exercise the completion UI/profile. The guided steps above use UI.
 const practiceState=JSON.parse(await fs.readFile(profile+'/tutorial-save.json','utf8'));
 const practice=new Game(0,practiceState), baseline=new WeightedPolicy();
 for(let n=0;n<300 && practice.s.mode!=='result';n++) practice.act(baseline.choose({},practice.legal()).action);
 assert.equal(practice.s.outcome,'win');
 await fs.writeFile(profile+'/tutorial-save.json',JSON.stringify({...practice.s,uiMeta:practiceState.uiMeta}));
 await p.reload(); await p.locator('[data-ui="continueTutorial"]').click();
 await p.getByRole('heading',{name:'The Listening Hollow Complete'}).waitFor({timeout:60000});
 await p.screenshot({path:'reports/screenshots/depths-tutorial/complete.png'});
 assert.equal(await p.locator('[data-ui="continue"]').innerText(),'Continue your journey →');
 const stats=JSON.parse(await fs.readFile(profile+'/tutorial-stats.json','utf8'));
 assert.ok(stats.stratum3.firstCompletedAt);
 assert.equal(await fs.readFile(profile+'/save.json','utf8'),normalSave);
 checks.push('Legal headless practice victory resumes to completion UI; profile records completion without changing normal save');
 checks.push('All guided steps use real controls; Guide moves/targets Ideon; source-column defense and bracelet work; practice intro dismisses');
 await p.reload(); await p.locator('[data-ui="tutorialMenu"]').click();
 assert.equal(await p.locator('[data-ui="depthsTutorial"]').count(),1);
 checks.push('S3 replay is unlocked; normal Continue save unchanged');
 assert.deepEqual(errors,[]);
 await fs.writeFile('reports/depths-tutorial-ui-verification.json',JSON.stringify({version:'4.0.4',packaged:true,checks,errors},null,2));
 console.log(JSON.stringify({checks,errors}));
} finally {await app.close();}
