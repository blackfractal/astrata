import {_electron as electron} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {spawnIdeon} from '../src/ideons.mjs';
const report={checks:[],errors:[]};
const dir='reports/screenshots/tendrils';await fs.mkdir(dir,{recursive:true});
for(const scenario of ['splash','adjacent','splash-reduced','adjacent-reduced']){
  const splash=scenario.startsWith('splash'),reduced=scenario.endsWith('reduced');
  const g=new Game(931);g.s.stratum=3;g.s.equipment={};
  g.beginBattle([{uid:900,enemy:'cnidarian',restless:0}]);delete g.s.checkpoint;
  const b=g.s.battle;b.grid=Array.from({length:42},()=>[]);b.ideons=[];b.hand=[];b.phase='activate';
  const e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:6});e.age=3;
  const ally=g.instance(g.newCard('familiar'));ally.hp=12;
  b.grid[splash?0:13]=[ally];
  const ward=g.instance(g.newCard('ward'));b.grid[5]=[ward];
  const profile=path.resolve('.tmp/tendril-ui-'+scenario+'-'+Date.now());await fs.mkdir(profile,{recursive:true});
  await fs.writeFile(profile+'/save.json',JSON.stringify(g.s));
  await fs.writeFile(profile+'/settings.json',JSON.stringify({width:1280,fast:false}));
  const app=await electron.launch({executablePath:path.resolve('release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile]});
  try{
    const p=await app.firstWindow();p.on('pageerror',e=>report.errors.push(e.message));
    if(reduced)await p.emulateMedia({reducedMotion:'reduce'});
    await p.locator('[data-ui="continue"]').click();
    await p.locator('[data-ideon="tentacle"] img').first().evaluate(img=>img.decode());
    const help=await p.locator('[data-ideon="tentacle"]').getAttribute('data-tooltip');
    assert.match(help,splash?/Splash: 3 Water/:/Next: 10 Water against adjacent/);
    await p.screenshot({path:dir+'/'+scenario+'-before.png'});
    await p.getByRole('button',{name:'End turn',exact:true}).click();g.act(g.legal().find(a=>a.type==='endTurn'));
    await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
    await p.evaluate(()=>{
      window.tendrilTrace=[];let started=false;
      new MutationObserver(records=>{
        for(const record of records)for(const node of record.addedNodes){
          if(node.nodeType!==1)continue;
          if(node.matches('.tendril-effect')){started=true;window.tendrilTrace.push('lash:'+node.dataset.attack);}
          if(started&&node.matches('.attack-bolt'))window.tendrilTrace.push('pulse');
          if(started&&node.matches('.spell-impact'))window.tendrilTrace.push('impact');
        }
      }).observe(document.body,{childList:true,subtree:true});
    });
    await p.locator('.battle-player .player-portrait').click();g.act(g.legal().find(a=>a.type==='skipEquipment'));
    await p.locator('.tendril-effect').waitFor();
    if(!reduced)await p.screenshot({path:dir+'/'+scenario+'-lash.png'});
    await p.waitForFunction(()=>!document.querySelector('.presentation-bar'));
    assert.deepEqual(await p.evaluate(()=>window.tendrilTrace),['lash:'+(splash?'splash':'tendril'),...(splash&&!reduced?['pulse']:[]),'impact']);
    assert.equal(await p.locator('.tendril-effect,.attack-bolt,.spell-impact').count(),0);
    const slot=splash?5:6;
    await p.locator(`[data-slot="${slot}"] [data-ideon="tentacle"]`).waitFor();
    await p.screenshot({path:dir+'/'+scenario+'-after.png'});
    const run=(await fs.readdir(profile+'/runs',{withFileTypes:true})).find(e=>e.isDirectory()&&e.name!=='builds').name;
    const raw=JSON.parse(await fs.readFile(profile+'/runs/'+run+'/latest.json','utf8')),s=raw.state||raw;
    assert.equal(s.battle.turn,2);assert.equal(s.battle.ideons[0].slot,slot);
    assert.equal(s.battle.grid[splash?0:13].at(-1).hp,splash?9:2);
    assert.equal(s.battle.grid[splash?6:5].at(-1).uid,ward.uid);
    assert.deepEqual(s.battle.grid,g.s.battle.grid);
    report.checks.push(scenario+': exact gameplay replay; lash then '+(splash&&!reduced?'pulse then ':'')+'impact; no leftover effects or renderer errors.');
  }finally{await app.close();}
}
assert.deepEqual(report.errors,[]);
await fs.writeFile('reports/tendril-ui-verification.json',JSON.stringify(report,null,2));console.log(report);
