import {_electron as electron, expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {VERSION} from '../src/content.mjs';
const live=path.join(process.env.APPDATA,'astrata','save.json');
const bytes=await fs.readFile(live),saved=JSON.parse(bytes);
const expected=new Game(0,structuredClone(saved));
const profile=path.resolve('.tmp/continue-compatibility-'+Date.now());
await fs.mkdir(profile,{recursive:true});
await fs.writeFile(path.join(profile,'save.json'),bytes);
await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({width:1280,fast:true}));
const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
const errors=[];
try{
  const p=await app.firstWindow();p.on('pageerror',e=>errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  await expect(p.locator('[data-ideon="tentacle"]')).toHaveCount(saved.battle.ideons.filter(e=>e.kind==='tentacle'&&e.hp>0).length);
  const help=await p.locator('[data-ideon="tentacle"]').first().getAttribute('data-tooltip');
  assert.match(help,/Splash.*against you/);
  assert.match(help,/gains 0.5/);
  const persisted=JSON.parse(await fs.readFile(path.join(profile,'save.json'),'utf8'));
  const actual=new Game(0,persisted);
  assert.equal(actual.s.version.rules,VERSION.rules);
  assert.equal(actual.s.hp,expected.s.hp);
  assert.equal(actual.s.battle.turn,expected.s.battle.turn);
  assert.deepEqual(actual.s.deck,expected.s.deck);
  assert.deepEqual(actual.s.inventory,expected.s.inventory);
  assert.deepEqual(actual.s.equipment,expected.s.equipment);
  assert.deepEqual(actual.s.battle.ideons,expected.s.battle.ideons);
  assert.deepEqual(errors,[]);
  const unchanged=bytes.equals(await fs.readFile(live));assert.equal(unchanged,true);
  const report={from:saved.version,to:VERSION,runId:saved.uiMeta?.runId,hp:actual.s.hp,turn:actual.s.battle.turn,
    continueRendered:true,latestSplashDescription:true,progressPreserved:true,liveSaveUnchanged:unchanged,
    saveSha256:crypto.createHash('sha256').update(bytes).digest('hex'),errors};
  await fs.mkdir('reports/screenshots/continue',{recursive:true});
  await p.screenshot({path:'reports/screenshots/continue/3.0.11-to-3.0.15.png'});
  await fs.writeFile('reports/continue-patches-ui.json',JSON.stringify(report,null,2));
  console.log(report);
}finally{await app.close();}
