import {_electron as electron, expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {spawnIdeon,commandIdeon} from '../src/ideons.mjs';
const report={checks:[],errors:[]};
for(const reduced of [false,true]){
  const g=new Game(931);g.s.stratum=3;g.s.equipment={};
  g.beginBattle([{uid:900,enemy:'cnidarian',restless:0}]);delete g.s.checkpoint;
  const b=g.s.battle;b.grid=Array.from({length:42},()=>[]);b.ideons=[];b.hand=[];b.phase='enemy';b.jobs=[];
  const e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:4});e.age=3;
  for(const slot of [8,10,12]){const c=g.instance(g.newCard('ward'));c.ward=1;b.grid[slot]=[c];}
  commandIdeon(g,e.uid);g.pump();
  const profile=path.resolve('.tmp/tendril-player-'+Date.now());await fs.mkdir(profile,{recursive:true});
  await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));
  await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:false}));
  const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
  try{
    const p=await app.firstWindow();p.on('pageerror',e=>report.errors.push(e.message));
    if(reduced)await p.emulateMedia({reducedMotion:'reduce'});
    await p.locator('[data-ui="continue"]').click();
    for(const slot of [8,10])await expect(p.locator(`[data-slot="${slot}"]`)).toHaveClass(/defense-ready/);
    await expect(p.locator('[data-slot="12"]')).not.toHaveClass(/defense-ready/);
    await p.evaluate(()=>{
      window.lashes=0;window.impacts=0;
      new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes){
        if(n.nodeType!==1)continue;
        if(n.matches('.tendril-effect'))window.lashes++;
        if(n.matches('.spell-impact'))window.impacts++;
      }}).observe(document.body,{childList:true,subtree:true});
    });
    await p.locator('[data-slot="10"]').click();g.act(g.legal().find(a=>a.type==='ward'&&a.slot===10));
    await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
    assert.equal(await p.evaluate(()=>window.lashes),1);
    await expect(p.locator('[data-slot="12"]')).not.toHaveClass(/defense-ready/);
    await p.locator('[data-slot="8"]').click();g.act(g.legal().find(a=>a.type==='ward'&&a.slot===8));
    await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
    assert.equal(await p.evaluate(()=>window.lashes),1);assert.equal(await p.evaluate(()=>window.impacts),3);
    const run=(await fs.readdir(profile+'/runs',{withFileTypes:true})).find(e=>e.isDirectory()&&e.name!=='builds').name;
    const raw=JSON.parse(await fs.readFile(profile+'/runs/'+run+'/latest.json','utf8')),s=raw.state||raw;
    assert.equal(s.hp,69);assert.deepEqual(s.battle.grid,g.s.battle.grid);
    assert.equal(s.battle.grid[12][0].ward,1);
    await p.screenshot({path:'reports/screenshots/tendrils/player-'+(reduced?'reduced':'normal')+'.png'});
    report.checks.push({reduced,hp:s.hp,lashes:1,impacts:3,sameColumnAndLeftDefenses:true,rightWardUntouched:true});
  }finally{await app.close();}
}
assert.deepEqual(report.errors,[]);
await fs.writeFile('reports/tendril-player-ui-verification.json',JSON.stringify(report,null,2));console.log(report);
