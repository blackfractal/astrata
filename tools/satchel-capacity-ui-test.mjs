import {chromium,expect} from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
const root=path.resolve(import.meta.dirname,'..'),webroot=path.join(root,'release/Astrata/resources/app'),report=path.join(root,'reports/satchel-capacity-ui');
await fs.mkdir(report,{recursive:true});
const server=http.createServer(async(req,res)=>{
  const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(webroot,'.'+(rel==='/'?'/index.html':rel));
  if(!file.startsWith(webroot+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',({'.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const errors=[],checks=[];
try {
  for (const mode of ['shop','pickup']) {
    const g=new Game(381);g.s.inventory=[];for(const slot in g.s.equipment)g.s.equipment[slot]=null;
    g.s.mode=mode==='shop'?'tavern':'item';g.s.gold=500;g.s.hp=60;g.s.shop={stock:['insightGem'],soldIndices:[],healer:true};g.s.itemOffer=['ruby'];
    for(let n=0;n<12;n++)g.addItem('healingSap');delete g.s.checkpoint;
    const uid=g.s.inventory[0].uid;
    const context=await browser.newContext({viewport:{width:1440,height:810}}),p=await context.newPage();
    p.on('pageerror',e=>errors.push(e.message));
    await p.addInitScript(state=>localStorage.setItem('astrata',JSON.stringify({save:state,history:[],settings:{width:1440,fast:true}})),g.s);
    await p.goto(`http://127.0.0.1:${server.address().port}/`);await p.locator('[data-ui="continue"]').click();
    await expect(p.locator('.satchel-overflow')).toHaveCount(0);
    if(mode==='shop') {
      await p.locator('[data-tavern="market"]').click();await p.locator('[data-market-category="Gems"]').click();
      await expect(p.getByRole('button',{name:'Unable to pick up, your satchel is full.',exact:true})).toBeDisabled();
      await p.screenshot({path:path.join(report,'shop-full.png')});
      await p.locator('[data-market-tab="sell"]').click();await p.locator('[data-market-category="Consumables"]').click();
      await p.locator('.market-item [data-action]').first().click();
      await p.locator('[data-market-tab="buy"]').click();await p.locator('[data-market-category="Gems"]').click();
      await expect(p.getByRole('button',{name:'Buy · 100 Gold',exact:true})).toBeEnabled();
      await p.getByRole('button',{name:'Buy · 100 Gold',exact:true}).click();
      await expect(p.locator('[data-stock-slot="0"]')).toContainText('Sold');
    } else {
      await expect(p.getByRole('button',{name:'Unable to pick up, your satchel is full.',exact:true})).toBeDisabled();
      await p.screenshot({path:path.join(report,'pickup-full.png')});
      await p.locator('[data-ui="inventory"]').click();await p.locator(`[data-item-detail="${uid}"]`).click();
      await p.getByText('Use once',{exact:true}).click();await p.getByRole('button',{name:'Use Healing Sap',exact:true}).click();
      if(await p.locator('[data-close]').isVisible())await p.locator('[data-close]').click();
      await expect(p.getByRole('button',{name:'Collect',exact:true})).toBeEnabled();
      await expect(p.locator('.hp')).toHaveText('65');
    }
    await expect(p.locator('.satchel-overflow')).toHaveCount(0);
    checks.push(mode+': full capacity explained in place; voluntary service/use frees room and offer stays available');
    await context.close();
  }
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(report,'verification.json'),JSON.stringify({version:'4.0.27',passed:true,checks,errors},null,2));console.log(checks.join('\n'));
}finally{await browser.close();await new Promise(r=>server.close(r));}
