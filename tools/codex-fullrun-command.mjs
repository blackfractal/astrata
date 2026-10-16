import fs from 'node:fs/promises';
import path from 'node:path';
import {cards,items} from '../src/content.mjs';
const info=JSON.parse(await fs.readFile('.tmp/codex-fullrun-current.json','utf8'));
const mode=process.argv[2]||'status';
if(['act','refresh','screenshot'].includes(mode)){
 let input='';if(mode==='act')for await(const c of process.stdin)input+=c;
 const payload=mode==='act'?JSON.parse(input):{};
 const request={type:mode==='act'?'play':mode==='screenshot'?'screenshot':'read',selectors:payload.selectors||payload,reason:payload.reason||'Codex manually selected line'};
 const id=Date.now()+'-'+Math.random().toString(16).slice(2),file=path.join(info.queue,id+'.request.json');
 await fs.writeFile(file+'.tmp',JSON.stringify(request));await fs.rename(file+'.tmp',file);
 const response=path.join(info.queue,id+'.response.json');
 while(true){try{const r=JSON.parse(await fs.readFile(response,'utf8'));console.log(JSON.stringify(r.played?{played:r.played.map(a=>a.label),step:r.step,mode:r.mode}:r));break;}catch(e){if(e.code!=='ENOENT')throw e;}await new Promise(r=>setTimeout(r,100));}
}
const v=JSON.parse(await fs.readFile(path.join(info.dir,'current.json'),'utf8')),s=v.state,b=s.battle,o=v.observation;
if(mode==='query'){
 let input='';for await(const c of process.stdin)input+=c;const filter=JSON.parse(input||'{}');
 console.log(JSON.stringify(v.legal.filter(a=>Object.entries(filter).every(([k,val])=>a[k]===val))));
}else if(mode==='deck')console.log(JSON.stringify({deck:s.deck.map(c=>({...c,name:cards[c.id].name,text:cards[c.id].text,effects:cards[c.id].effects,focus:cards[c.id].focus,limit:cards[c.id].limit,upgradeEffect:cards[c.id].upgrade})),inventory:s.inventory.map(i=>({...i,...items[i.id]}))}));
else console.log(JSON.stringify({seed:s.seed,step:s.steps,mode:s.mode,stratum:s.stratum,apex:s.apex,hp:s.hp,gold:s.gold,inventory:s.inventory.map(i=>({uid:i.uid,id:i.id,gem:i.gem})),equipment:s.equipment,field:s.mode==='battle'?{round:o.field.round,x:o.field.x,y:o.field.y}:o.field,reward:s.reward,tavern:s.tavern,event:s.event,
 battle:b&&s.mode==='battle'?{turn:b.turn,phase:b.phase,focus:b.focus,channel:b.channel,permanent:b.permanent,next:b.next,hand:b.hand.map(c=>({uid:c.uid,id:c.id,upgrade:c.upgrade,focus:cards[c.id].focus})),enemies:o.battle.enemies.map(e=>({uid:e.uid,name:e.name,element:e.element,hp:e.hp,maxHp:e.maxHp,tell:e.tell,status:e.status,flicker:e.flicker})),grid:o.battle.grid.flatMap((stack,slot)=>stack.length?[{slot,cards:stack.map(c=>({uid:c.uid,id:c.id,up:c.upgrade,used:c.used,turn:c.lastActivatedTurn,hp:c.hp,ward:c.ward,element:c.element,charge:c.charge,lock:c.lock,sever:c.sever,freeze:c.freeze}))}]:[]),shields:b.shields,bracelets:b.bracelets,armor:b.armorBlock,ideons:b.ideons,corruptions:b.corruptions,reaction:b.reaction}:undefined,
 actions:v.legal.filter(a=>!['place','activate','equip','unequip','recall'].includes(a.type)),log:s.log.slice(-5)},null,0));
