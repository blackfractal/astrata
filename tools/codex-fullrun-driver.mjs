// Isolated, visible manual play. No policy selects actions and no live profile is used.
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomInt} from 'node:crypto';
import {_electron as electron} from '@playwright/test';
import {Game} from '../src/engine.mjs';
const version=JSON.parse(await fs.readFile('package.json','utf8')).version;
const stamp=Date.now();
const dir=path.resolve('reports/codex-fullrun-'+version+'-'+stamp);
const session=path.resolve('.tmp/codex-watch-'+stamp);
const appDir=path.join(session,'app'),profile=path.join(session,'profile'),queue=path.join(session,'commands');
await fs.mkdir(dir,{recursive:true});await fs.mkdir(queue,{recursive:true});await fs.mkdir(profile,{recursive:true});
await fs.cp('release/Astrata/resources/app',appDir,{recursive:true});
const seed=randomInt(1,2147483647),g=new Game(seed);
await fs.writeFile(path.join(dir,'initial.json'),JSON.stringify(g.s));
const sources={};for(const name of (await fs.readdir('src')).filter(n=>n.endsWith('.mjs')))sources[name]=await fs.readFile(path.join('src',name),'utf8');
await fs.writeFile(path.join(dir,'sources.json'),JSON.stringify(sources));
await fs.writeFile(path.join(profile,'save.json'),JSON.stringify(g.s));
await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({width:1440,fast:false,music:25,effects:45}));
// Skip teaching interruptions in this separate assessment profile, not game rules.
await fs.writeFile(path.join(profile,'tutorial-stats.json'),JSON.stringify({firstCompletedAt:new Date().toISOString(),stratum2:{firstCompletedAt:new Date().toISOString()},stratum3:{firstCompletedAt:new Date().toISOString()}}));
await fs.appendFile(path.join(appDir,'src/ui.mjs'),`
const manualBar=document.createElement('div');manualBar.style.cssText='position:fixed;bottom:3px;right:8px;z-index:999999;background:#111c24ed;border:1px solid #c4ab74;color:#eee;padding:4px 10px;font:12px system-ui';
manualBar.textContent='Codex manual play · waiting for decision';document.body.append(manualBar);
window.codexManual={
 read:()=>({state:structuredClone(game.s),observation:game.observe(),legal:game.legal(),busy}),
 play:async(selectors,reason)=>{
  const played=[];
  for(const selector of selectors){
   if(busy)throw Error('Game busy');
   const choices=game.legal().filter(a=>Object.entries(selector).every(([k,v])=>k==='id'?game.s.battle?.hand.find(c=>c.uid===a.uid)?.id===v:JSON.stringify(a[k])===JSON.stringify(v)));
   if(choices.length!==1)throw Error('Expected one legal action; got '+choices.length+' for '+JSON.stringify(selector));
   const a=choices[0];manualBar.textContent='Codex · '+a.label;document.title='Astrata · Codex manual run · Stratum '+game.s.stratum;
   const before=game.s.steps;await act(a.key,{kind:'codex-manual',reason});
   if(game.s.steps===before)throw Error('Action did not advance');
   played.push(a);await new Promise(r=>setTimeout(r,500));
  }
  manualBar.textContent='Codex manual play · considering the next move';return played;
 }
};
`);
const app=await electron.launch({executablePath:path.resolve('node_modules/electron/dist/electron.exe'),args:[appDir,'--disable-gpu','--user-data-dir='+profile],cwd:profile,timeout:30000});
const page=await app.firstWindow();page.on('pageerror',e=>console.log('PAGE ERROR '+e.message));
await page.locator('[data-ui="continue"]').click();
await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.show();w.focus();});
await fs.writeFile('.tmp/codex-fullrun-current.json',JSON.stringify({dir,profile,queue,seed}));
const snapshot=async()=>{const v=await page.evaluate(()=>window.codexManual.read());await fs.writeFile(path.join(dir,'current.json'),JSON.stringify(v));return v;};
await snapshot();console.log(JSON.stringify({visible:true,seed,dir,delay:500,controller:'Codex manual selections'}));
while(!page.isClosed()){
 for(const file of (await fs.readdir(queue)).filter(x=>x.endsWith('.request.json')).sort()){
  const request=JSON.parse(await fs.readFile(path.join(queue,file),'utf8'));let response;
  try{
   if(request.type==='play')response={played:await page.evaluate(async r=>window.codexManual.play(r.selectors,r.reason),request)};
   else if(request.type==='screenshot'){await page.screenshot({path:path.join(dir,'view.png')});response={screenshot:path.join(dir,'view.png')};}
   else response={read:true};
  }catch(e){response={error:e.message};}
  const v=await snapshot();response.step=v.state.steps;response.mode=v.state.mode;
  await fs.appendFile(path.join(dir,'decisions.jsonl'),JSON.stringify({time:new Date().toISOString(),request,response})+'\n');
  await fs.writeFile(path.join(queue,file.replace('.request.json','.response.json')),JSON.stringify(response));
  await fs.rename(path.join(queue,file),path.join(queue,file.replace('.request.json','.done.json')));
 }
 await new Promise(r=>setTimeout(r,100));
}
