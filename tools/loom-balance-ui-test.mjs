import {_electron as electron,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {prepareCorruption} from '../src/corruptions.mjs';
const root=path.resolve(import.meta.dirname,'..'),results=[];
for(const boss of ['blackBile','bombadier']){
  const g=new Game(0,JSON.parse(await fs.readFile(path.join(root,'reports/loom-balance-20261023/final-engine-'+boss+'/initial.json'),'utf8')));
  const b=g.s.battle,e=b.enemies[0];
  b.phase='place';b.reaction=null;b.jobs=[];b.turn=boss==='blackBile'?3:8;
  e.cycle=boss==='blackBile'?2:7;e.corruptionPlan=[];b.corruptions={};
  if(boss==='bombadier'){
    prepareCorruption(g,e,g.tell(e));
    assert.equal(e.corruptionPlan.filter(q=>q.kind==='mine').length,3);
  }
  delete g.s.checkpoint;
  const profile=path.join(root,'.tmp/loom-ui-'+boss+'-'+Date.now());
  await fs.mkdir(profile,{recursive:true});
  await fs.writeFile(path.join(profile,'save.json'),JSON.stringify(g.s));
  await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({width:1280,fast:true}));
  const app=await electron.launch({executablePath:path.join(root,'release/Astrata/Astrata.exe'),args:['--user-data-dir='+profile],cwd:profile,timeout:20000});
  const errors=[];
  try{
    const p=await app.firstWindow();p.on('pageerror',e=>errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    await expect(p.locator('[data-slot]')).toHaveCount(42);
    const body=await p.locator('body').innerText();
    if(boss==='blackBile'){
      assert.ok(body.includes('Churn'));assert.ok(body.includes('12 Earth'));assert.ok(body.includes('7 Fire'));
    }else{
      assert.ok(body.includes('Light the fuses')||body.includes('Light the Fuses'));
      for(const q of e.corruptionPlan.filter(q=>q.kind==='mine')){
        const tile=p.locator('[data-slot="'+q.slot+'"]');
        assert.match(await tile.getAttribute('class'),/telegraph|corruption|planned|warning/);
      }
    }
    await p.screenshot({path:path.join(root,'reports/loom-balance-20261023/ui-'+boss+'.png')});
    assert.deepEqual(errors,[]);results.push({boss,passed:true,errors});
  }finally{await app.close();}
}
await fs.writeFile(path.join(root,'reports/loom-balance-ui.json'),JSON.stringify(results,null,2));
console.log(results);
