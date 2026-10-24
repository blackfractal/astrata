import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
const results=[];
for(const type of ['tincture','inspiration','bracelet','buff','dealer','jeweler']){
 const g=new Game(904);g.s.inventory=[];g.s.equipment={};g.s.stratum=2;g.s.gold=500;
 if(type==='dealer'){g.s.mode='event';g.s.event='potionDealer';}
 else if(type==='jeweler'){g.openTavern();g.addItem('gold');g.addItem('focusGem');}
 else {
  g.beginBattle([{uid:900,enemy:'beetle',restless:0}]);const b=g.s.battle;b.enemies[0].hp=b.enemies[0].maxHp=200;b.hand=[];
  b.grid[10]=[g.instance(g.newCard('blast'))];b.phase='place';
  if(type==='tincture')g.addItem('prismaticTincture');
  if(type==='buff'){g.addItem('furySap');b.phase='activate';}
  if(type==='inspiration'){g.addItem('wildInspiration');b.deck=[g.newCard('blast')];b.focus=0;b.channel=0;}
  if(type==='bracelet'){const x=g.addItem('prismaticBracelet');g.s.equipment.wrist2=x.uid;}
 }
 delete g.s.checkpoint;
 const profile=path.resolve('.tmp/supplies-ui-'+type+'-'+Date.now());await fs.mkdir(profile,{recursive:true});
 await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:true}));
 const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile],cwd:profile,timeout:20000});
 const errors=[];
 try{
  const p=await app.firstWindow();p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));await p.locator('[data-ui="continue"]').click();
  if(type==='tincture'){
   await p.locator('.consumable-use').click();await expect(p.locator('.supply-options')).toBeVisible();
   await p.locator('.supply-options button').filter({hasText:'Water'}).click();
   await expect(p.locator('[data-slot="10"]')).toContainText('Blast');
   await expect(p.locator('[data-slot="10"] .element-label')).toContainText('Water');
  }
  if(type==='inspiration'){
   await p.locator('.consumable-use').click();await expect(p.locator('.inspiration-prompt')).toContainText('place');
   await p.locator('[data-hand]').first().click();await p.locator('[data-slot="11"]').click();
   await expect(p.locator('.inspiration-prompt')).toContainText('activate');
   await p.locator('[data-activate-slot="11"]').dblclick();
   await expect(p.locator('.inspiration-prompt')).toHaveCount(0);
  }
  if(type==='bracelet'){await p.locator('.supply-special summary').click();await p.locator('.supply-special button').filter({hasText:'Water'}).click();await expect(p.locator('.supply-special')).toHaveCount(0);}
  if(type==='buff'){await p.locator('.consumable-use').click();await expect(p.locator('.supply-buffs')).toContainText('Next attack ×2');await expect(p.locator('[data-slot="10"]')).toContainText('8');}
  if(type==='dealer'){await expect(p.locator('.scene-copy')).toContainText('Prismatic Tincture');await p.getByRole('button',{name:'Fire Tincture · 30 Gold',exact:true}).click();}
  if(type==='jeweler'){await p.locator('[data-tavern="equipment"]').click();await expect(p.locator('.jeweler-fees')).toContainText('20–180');}
  await p.screenshot({path:path.resolve('reports/supplies-ui-'+type+'.png')});
  assert.deepEqual(errors,[]);results.push({type,passed:true});
 }finally{await app.close();}
}
await fs.writeFile('reports/supplies-ui-results.json',JSON.stringify(results,null,2));
