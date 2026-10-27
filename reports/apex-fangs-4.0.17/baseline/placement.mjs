import {elementalRate,defenseRate,adjacent} from '../../../snapshots/apex-fangs-4.0.17/baseline/rules/engine.mjs';
import {cards} from '../../../snapshots/apex-fangs-4.0.17/baseline/rules/content.mjs';
import {clone,value} from './search.mjs';
let cfg; export function configure(c){cfg=c;}
function potential(game){
 const b=game.s.battle,z=clone(game);z.s.battle.phase='activate';
 const tell=game.tell(b.enemies[0]),hits=tell.sequence||[{damage:tell.damage||0,element:tell.element,hits:tell.hits||1}];
 const threat=hits.reduce((n,h)=>n+(h.damage||0)*(h.hits||1),0);
 const doomed=new Set(game.gridTelegraphs().flatMap(t=>t.targets));
 const best=new Map();
 for(const a of z.legal()){
  if(a.type!=='activate')continue;
  const c=b.grid[a.slot].at(-1),d=cards[c.id],e=a.effects;
  const target=[...b.enemies,...b.ideons].find(x=>x.uid===a.target);
  let attack=(e.damage||0)*elementalRate(a.element,target?.element||'Arcane');
  if(target?.ideon)attack=Math.min(attack,target.hp)*(target.guardian?1.35:target.slot%7<2?1:.55);
  const rate=hits.reduce((n,h)=>n+defenseRate(a.element,h.element)*(h.damage||0),0)/Math.max(1,threat);
  let guard=((e.shield||0)+(e.ward||0))*(rate||1);
  if(doomed.has(a.slot))guard=0;
  let utility=attack+Math.min(guard,Math.max(0,threat-10))*cfg.guard;
  if(e.transmute){
   const host=b.grid[a.cardTarget]?.at(-1),def=cards[host?.id];
   if(host&&def){const p=def.effects.hpDamage?host.hp:def.effects.damage||0;
    utility+=Math.max(0,elementalRate(a.newElement,'Chaos')-elementalRate(host.element,'Chaos'))*p*Math.min(2,game.allowance(host,a.cardTarget));
    if(def.effects.shield)utility+=Math.max(0,...hits.map(h=>defenseRate(a.newElement,h.element)-defenseRate(host.element,h.element)))*10;
   }
  }
  if(e.focusPermanent)utility+=e.focusPermanent*(b.turn<9?16:5);
  if(e.insight||e.adjInsight)utility+=(e.insight||e.adjInsight*adjacent(a.slot).filter(i=>b.grid[i].length).length)*(b.turn<13?3:2);
  if(e.channel)utility+=e.channel*5;
  if(e.secondSpring)utility+=b.grid.reduce((n,s,i)=>n+(s.length&&game.allowance(s.at(-1),i)===0?Math.min(16,cards[s.at(-1).id].effects.damage||cards[s.at(-1).id].effects.shield||s.at(-1).hp||0):0),0);
  if(e.burn&&b.enemies[0].cycle%6>=4&&!b.enemies[0].status.burn)utility+=15;
  if(e.mend)utility+=8;
  utility/=Math.max(1,a.costs.channel);
  best.set(a.slot,Math.max(best.get(a.slot)||0,utility));
 }
 const sorted=[...best.values()].sort((a,b)=>b-a);
 let p=sorted.slice(0,b.channel).reduce((a,b)=>a+b,0)+sorted.slice(b.channel).reduce((a,b)=>a+b*.12,0);
 // Maintain alternatives for subsequent turns, but prefer useful formation now.
 p+=b.grid.reduce((n,s,i)=>n+(s.length&&best.has(i)?Math.min(3,game.allowance(s.at(-1),i))*.7:0),0);
 return p;
}
function placementScore(game){return value(game,true)+potential(game)*1.5+game.s.battle.focus*.35;}
function planPlace(game){
 const out=[];const used=new Set();
 for(let depth=0;depth<12;depth++){
  const base=placementScore(game);let best=null;
  for(const a of game.legal()){
   if(!['place','recall','placeStrike'].includes(a.type)||used.has(a.key))continue;
   const b=game.s.battle;
   if(a.type==='recall'){
    const c=b.grid[a.slot]?.at(-1);
    if(!c)continue;
    const doomed=game.gridTelegraphs().some(t=>t.targets.includes(a.slot));
    if(!doomed&&game.allowance(c,a.slot)>0&&c.id!=='transmute')continue;
   }
   const z=clone(game);z.act(a);
   let score=placementScore(z)-base;
   if(a.type==='recall'){
    const c=b.grid[a.slot].at(-1),d=cards[c.id];
    score+=Math.min(12,(d.effects.damage||d.effects.shield||0))*.4;
    if(c.id==='transmute')score+=3;
   }
   if(a.type==='place'){
    const c=z.s.battle.grid[a.slot]?.at(-1);
    if(c?.id==='grove')score+=cfg.grovePlacement||2;
   }
   if(!best||score>best.score)best={a,score};
  }
  if(!best||best.score<.1)break;
  game.act(best.a);out.push(best.a);used.add(best.a.key);
 }
 const a=game.legal().find(a=>a.type==='activatePhase');if(a){game.act(a);out.push(a)}
 return out;
}

export {planPlace};
