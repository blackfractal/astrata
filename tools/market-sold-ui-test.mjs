import { _electron as electron } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
const g = new Game(71);
g.openTavern(); g.s.gold = 10000;
g.s.shop.stock = ['card:focus', 'card:transmute', 'ruby', 'sapphire', 'silver', 'gold', 'healingSap', 'focusDraught'];
g.s.shop.soldIndices = [];
const profile = path.resolve('.tmp/market-sold-' + Date.now());
await fs.mkdir(profile, {recursive:true});
await fs.mkdir('reports/screenshots/market-sold', {recursive:true});
await fs.writeFile(profile + '/save.json', JSON.stringify(g.s));
await fs.writeFile(profile + '/settings.json', JSON.stringify({width:1280,fast:true}));
const app = await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'), args:['--user-data-dir=' + profile]});
const errors = [], checks = [];
try {
 const p = await app.firstWindow(); p.on('pageerror', e => errors.push(e.message));
 await p.locator('[data-ui="continue"]').click();
 await p.locator('[data-tavern="market"]').click();
 for (const [category,index] of [['Cards',0],['Gems',2],['Equipment',4],['Consumables',6]]) {
  await p.locator(`[data-market-category="${category}"]`).click();
  const rows = p.locator('.tavern-service .market-item');
  const geometry = () => rows.evaluateAll(es => es.map(e => {const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height];}));
  const before = await geometry(); assert.equal(before.length,2);
  await rows.first().locator('[data-action]').click();
  const sold = p.locator(`[data-stock-slot="${index}"]`);
  await sold.waitFor(); assert.equal(await sold.locator('button').innerText(),'Sold');
  assert.equal(await sold.locator('button').isDisabled(),true);
  assert.deepEqual(await geometry(),before);
  await p.screenshot({path:`reports/screenshots/market-sold/${category.toLowerCase()}.png`});
  checks.push(category + ': fixed geometry, disabled Sold placeholder');
 }
 const saved=JSON.parse(await fs.readFile(profile+'/save.json','utf8'));
 assert.deepEqual(saved.shop.stock,g.s.shop.stock); assert.deepEqual(saved.shop.soldIndices,[0,2,4,6]);
 await p.reload();
 await p.locator('[data-ui="continue"]').click();
 await p.locator('[data-tavern="market"]').click();
 await p.locator('[data-market-category="Cards"]').click();
 assert.equal(await p.locator('[data-stock-slot="0"] button').innerText(),'Sold');
 checks.push('Sold positions survive Continue'); assert.deepEqual(errors,[]);
 await fs.writeFile('reports/market-sold-ui-verification.json',JSON.stringify({version:'4.0.2',packaged:true,checks,errors},null,2));
 console.log(JSON.stringify({checks,errors}));
} finally {await app.close();}
