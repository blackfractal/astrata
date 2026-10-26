import fs from 'node:fs';
import {Game,cardPower} from '../src/engine.mjs';
import {cards} from '../src/content.mjs';
const dir='reports/glass-brood-line-20261025';fs.mkdirSync(dir,{recursive:true});
const file=dir+'/attempt.json';
if(process.argv[2]==='start'){
 const initial=JSON.parse(fs.readFileSync(process.env.APPDATA+'/astrata/save.json','utf8'));
 fs.writeFileSync(file,JSON.stringify({initial,state:initial,decisions:[]}));
}
const r=JSON.parse(fs.readFileSync(file)),g=new Game(0,structuredClone(r.state));
if(['act','query'].includes(process.argv[2])){
 let input='';for await(const c of process.stdin)input+=c;
 for(const sel of JSON.parse(input)){
  const matches=g.legal().filter(a=>Object.entries(sel).every(([k,v])=>a[k]===v));
  if(process.argv[2]==='query'){console.log(JSON.stringify(matches));continue;}
  if(matches.length!==1)throw Error(JSON.stringify({sel,matches:matches.slice(0,6)}));
  const a=matches[0],before={hp:g.s.hp,turn:g.s.battle.turn,phase:g.s.battle.phase};g.act(a);
  r.decisions.push({before,action:a,afterHp:g.s.hp});console.log(a.label);
 }
}
if(process.argv[2]!=='query'){
 r.state=g.s;fs.writeFileSync(file,JSON.stringify(r));const b=g.s.battle;
 console.log(JSON.stringify({hp:g.s.hp,mode:g.s.mode,turn:b.turn,phase:b.phase,focus:b.focus,channel:b.channel,hand:b.hand,grid:b.grid.flatMap((v,i)=>v.length?[{slot:i,cards:v.map(c=>({id:c.id,uid:c.uid,hp:c.hp,ward:c.ward,element:c.element,attuned:c.attuned,left:g.allowance(c,i),power:cardPower(b,c,i)}))}]:[]),enemies:b.enemies.map(e=>({uid:e.uid,hp:e.hp,status:e.status,tell:g.tell(e)})),ideons:b.ideons,shields:b.shields,bracelets:b.bracelets,reaction:b.reaction,actions:g.legal().filter(a=>!['place','activate','transmute','recall','enhancePotion'].includes(a.type)),log:g.s.log.slice(-4)}));
}
