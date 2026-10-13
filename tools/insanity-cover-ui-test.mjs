import { _electron as electron } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
const profile=path.resolve('.tmp/insanity-cover-ui-'+Date.now());
await fs.mkdir(profile,{recursive:true});
const g=new Game(84);
g.s.stratum=2;
g.beginBattle([{uid:900,enemy:'mendingTutor',restless:0}]);
const b=g.s.battle;
b.grid=Array.from({length:42},()=>[]);
for(const [id,i] of [['water',8],['blast',9],['elves',15],['shield',20],['shield',24]]) b.grid[i]=[g.instance(g.newCard(id))];
b.corruptions={8:{kind:'insanity',uid:990,value:1,source:900},20:{kind:'hypnosis',uid:991,source:900},24:{kind:'mine',uid:992,source:900,remaining:1,damage:20,element:'Fire'}};
b.phase='activate'; b.channel=3;
await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));
await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
const report={checks:[],errors:[]};
try {
 const p=await app.firstWindow();
 p.on('pageerror',e=>report.errors.push(e.message));
 await p.locator('[data-ui="continue"]').click();
 await p.locator('[data-slot="8"].severed-card').waitFor();
 assert.equal(await p.locator('[data-slot="8"] [data-card-status="Freeze"]').count(),1);
 assert.equal(await p.locator('[data-slot="8"] [data-card-status="Sever"]').count(),1);
 assert.equal(await p.locator('[data-activate-slot="8"]').isDisabled(),true);
 assert.match(await p.locator('[data-activate-slot="8"]').getAttribute('title'),/Insanity/);
 for (const [kind, animation] of [['hypnosis','hypnosis-cover-swirl'],['insanity','insanity-cover-tremor'],['mine','mine-cover-sparks']]) {
   const aura=p.locator('.'+kind+'-cover-aura');
   assert.equal(await aura.evaluate(el=>getComputedStyle(el).pointerEvents),'none');
   assert.equal(await aura.locator('i').first().evaluate(el=>getComputedStyle(el).animationName),animation);
 }
 await fs.mkdir('reports/screenshots/insanity',{recursive:true});
 await p.screenshot({path:'reports/screenshots/insanity/frozen-cover.png'});
 await p.emulateMedia({reducedMotion:'reduce'});
 for (const kind of ['hypnosis','insanity','mine']) {
   const state=await p.locator('.'+kind+'-cover-aura i').first().evaluate(el=>({animation:getComputedStyle(el).animationName,opacity:getComputedStyle(el).opacity}));
   assert.equal(state.animation,'none'); assert.ok(Number(state.opacity)>0);
 }
 await p.screenshot({path:'reports/screenshots/insanity/reduced-motion.png'});
 await p.emulateMedia({reducedMotion:'no-preference'});
 await p.locator('[data-activate-slot="15"]').click();
 await p.locator('[data-slot="8"].target-option').click();
 await p.waitForFunction(()=>!document.querySelector('.presentation-bar') && !document.querySelector('[data-slot="8"].severed-card'));
 assert.equal(await p.locator('[data-slot="8"] [data-card-status="Freeze"]').count(),0);
 assert.equal(await p.locator('.insanity-cover-aura').count(),0);
 assert.equal(await p.locator('[data-activate-slot="8"]').isDisabled(),false);
 await p.screenshot({path:'reports/screenshots/insanity/repaired-cover.png'});
 report.checks.push('Covered Insanity shows Freeze/Sever badges and jagged border, disables activation with cause tooltip; adjacent Elves repair restores activation and removes derived status visuals immediately.');
 report.checks.push('Hypnosis swirls, Insanity vibrations, and Mind Mine sparks overlay covering cards without intercepting input; reduced motion preserves visible stationary effects; repair removes the matching overlay.');
 assert.deepEqual(report.errors,[]);
} finally { await app.close(); }
await fs.writeFile('reports/insanity-cover-ui-verification.json',JSON.stringify(report,null,2));
console.log(report);
