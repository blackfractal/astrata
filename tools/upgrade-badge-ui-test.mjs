import { _electron as electron } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
const g=new Game(84);g.s.equipment={};g.beginBattle([{uid:900,enemy:'colossus',restless:0}]);
const b=g.s.battle;b.phase='activate';b.channel=2;b.grid=b.grid.map(()=>[]);
function put(id,slot,upgrade=false){const c=g.instance({...g.newCard(id),upgrade});b.grid[slot]=[c];return c;}
const shield=put('shield',9,true);shield.element='Light';shield.transmuted=true;shield.lock=true;
put('shield',10);const thorn=put('thorn',23,true);put('clear',24);put('water',16);
b.hand=[{...g.newCard('blast'),upgrade:true}];
const profile=path.resolve('.tmp/upgrade-badge-'+Date.now());await fs.mkdir(profile,{recursive:true});await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1440,fast:true}));
const dir='reports/screenshots/upgrade-badge';await fs.mkdir(dir,{recursive:true});
const report={package:'1.3.83',checks:[],errors:[]};
const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
try{const p=await app.firstWindow();p.on('pageerror',e=>report.errors.push(e.message));await p.locator('[data-ui="continue"]').click();
const s=p.locator('[data-slot="9"]');assert.equal(await s.locator('.upgrade-badge').count(),1);assert.equal(await p.locator('[data-slot="10"] .upgrade-badge').count(),0);
assert.match(await s.locator('.name').textContent(),/\+/);assert.match(await s.locator('.shield-value').getAttribute('data-tooltip'),/4 base \+ 3 upgrade \+ 1 adjacent Shield \/ Conduit = 8 shield/);
await s.locator('.shield-value').hover();await p.locator('#hover-help:visible').waitFor();assert.match(await p.locator('#hover-help').textContent(),/4 base \+ 3 upgrade/);
await p.screenshot({path:dir+'/shield-tooltip.png'});
const boxes=await s.evaluate(el=>{const a=el.querySelector('.upgrade-badge').getBoundingClientRect(),b=el.querySelector('.card-statuses').getBoundingClientRect();return {badgeX:a.left,statusRight:b.right};});assert.ok(boxes.statusRight<=boxes.badgeX);
await s.locator('.name').click();await p.locator('#modal .card-stat-breakdown').first().waitFor();assert.match(await p.locator('#modal').textContent(),/4 base \+ 3 upgrade \+ 1 adjacent Shield/);assert.equal(await p.locator('#modal .upgrade-badge').count(),1);await p.screenshot({path:dir+'/details.png'});await p.keyboard.press('Escape');
assert.match(await p.locator('[data-slot="23"] .damage-value').getAttribute('data-tooltip'),/4 base \+ 3 upgrade \+ 4 placement \/ synergy = 11 damage/);
await p.locator('[data-activate-slot="23"]').click();const normal=await p.locator('[data-slot="23"] .damage-value').getAttribute('data-tooltip');await p.keyboard.press('Escape');assert.equal(await p.locator('[data-slot="23"] .damage-value').getAttribute('data-tooltip'),normal);
assert.equal(await p.locator('[data-hand] .upgrade-badge').count(),1);
report.checks.push('Gold badge and plus on upgraded grid/hand/details cards, no badge on ordinary cards, no status overlap; actual 4+3+1 Shield and conditional Thorn math; tooltip and full popup; cancellation restores normal breakdown.');
assert.deepEqual(report.errors,[]);
}finally{await app.close();}
await fs.writeFile('reports/upgrade-badge-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
