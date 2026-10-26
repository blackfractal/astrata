import {items,cards,ELEMENTS} from './content.mjs';
import {adjacent,cardEffects,hasDirectDamageActivation,attunementSourceElement} from './engine.mjs';
import {canEnter,retargetCoveredCorruptions} from './corruptions.mjs';
import {ideonsAt,coveredByIdeon} from './ideons.mjs';
const top=s=>s?.at(-1);
export const suppliesAvailable=(s,id)=>items[id]?.expansion!=='supplies'||(items[id].stratum||1)<=(s.stratum||1);
export function supplyChoices(g,item,add) {
  const b=g.s.battle,f=items[item.id].consumable;
  if(!items[item.id].expansion)return false;
  const emit=(p={},suffix='')=>add('consume','Use '+items[item.id].name+suffix,{uid:item.uid,...p},{...f,consumable:true},{channel:0});
  if(f.tincture) b.grid.forEach((s,i)=>{if(top(s)&&!coveredByIdeon(b,i)) for(const el of f.tincture==='choose'?ELEMENTS:[f.tincture]) if(top(s).element!==el)emit({slot:i,element:el},` → ${cards[top(s).id].name} (${i+1}) · ${el}`);});
  else if(f.shift)b.grid.forEach((s,i)=>{if(!top(s)||coveredByIdeon(b,i)||s.some(c=>c.lock||c.mending))return;for(const j of adjacent(i))if(!b.grid[j].length&&!ideonsAt(b,j).length&&canEnter(b,top(s),j))emit({slot:i,destination:j},` · ${i+1} → ${j+1}`);});
  else if(f.recall)b.grid.forEach((s,i)=>{if(g.recallCost(s)!=null)emit({slot:i},` → ${cards[top(s).id].name} (${i+1})`);});
  else if(f.memory)for(const c of b.discard)emit({card:c.uid},' → '+cards[c.id].name);
  else if(f.inspiration==='choose')for(const c of b.deck)emit({card:c.uid},' → '+cards[c.id].name);
  else if(f.inspiration){if(b.deck.length)emit();}
  else if(f.cleanse){if(g.s.status[f.cleanse]>0)emit();}
  else if(!(f.fury&&b.fury)&&!(f.bastion&&b.bastion)&&!(f.confluence&&b.confluence))emit();
  return true;
}
export function recallSupply(g,i) {
  const b=g.s.battle;
  b.discard.push(...b.grid[i].map(c=>({uid:c.uid,id:c.id,upgrade:c.upgrade})));
  b.grid[i]=[]; b.shields=b.shields.filter(x=>x.slot!==i);
  b.recallCount=Math.min(2,(b.recallCount||0)+1);
  g.present('recall',{slot:i,name:'Recall Mist'});
}
export function useSupply(g,f,a) {
  const s=g.s,b=s.battle;
  if(f.tincture){const c=top(b.grid[a.slot]); c.element=a.element;c.transmuted=true;(b.tinctures||={})[c.uid]=a.element;
    for(const shield of b.shields.filter(x=>x.owner===c.uid))shield.element=a.element;}
  if(f.shift){b.grid[a.destination]=b.grid[a.slot];b.grid[a.slot]=[];for(const sh of b.shields)if(sh.slot===a.slot)sh.slot=a.destination;g.present('guideMove',{fromSlot:a.slot,slot:a.destination,name:'Shifting Sap'});retargetCoveredCorruptions(g,[a.destination]);}
  if(f.recall)recallSupply(g,a.slot);
  if(f.memory){const c=b.discard.find(c=>c.uid===a.card);b.discard=b.discard.filter(x=>x.uid!==a.card);b.deck.unshift(c);b.drawTop=[c.uid,...(b.drawTop||[]).filter(uid=>uid!==c.uid)];}
  if(f.cleanse)s.status[f.cleanse]=0;
  if(f.immunity)b.statusProtection=b.turn+1;
  if(f.fury)b.fury=true;
  if(f.bastion)b.bastion=true;
  if(f.confluence)b.confluence=true;
  if(f.inspiration){
    const idx=f.inspiration==='choose'?b.deck.findIndex(c=>c.uid===a.card):nextDrawIndex(g);
    const drawn=g.drawCards(1,{firstIndex:idx}),c=drawn[0];
    b.inspiration={uid:c.uid,stage:'place',phase:b.phase,destroy:f.inspiration==='choose'}; b.phase='place';
    g.present('reveal',{name:'Inspiration',cards:drawn.map(c=>c.uid),insight:drawn.length,incremental:true});
  }
}
export function nextDrawIndex(g){
  const b=g.s.battle;
  while(b.drawTop?.length){const uid=b.drawTop.shift(),i=b.deck.findIndex(c=>c.uid===uid);if(i>=0)return i;}
  return Math.floor(g.rand()*b.deck.length);
}
// Authoritative ordinary legality, projected with only the two waived costs.
export function inspirationLegal(g){
  const b=g.s.battle,p=b.inspiration;
  const old={phase:b.phase,focus:b.focus,channel:b.channel,hand:b.hand};
  g.projectingSupply=true;b.phase=p.stage;b.focus=p.stage==='place'?999:old.focus;b.channel=999;
  if(p.stage==='place')b.hand=b.hand.filter(c=>c.uid===p.uid);
  let legal;
  try{legal=g.baseLegal();}finally{Object.assign(b,old);g.projectingSupply=false;}
  const slot=b.grid.findIndex(s=>top(s)?.uid===p.uid);
  const choices=legal.filter(a=>p.stage==='place'?['place','placeStrike'].includes(a.type)&&a.uid===p.uid&&(a.slot==null||!b.grid[a.slot].length):a.type==='activate'&&a.slot===slot&&(a.focusSpend||0)<=old.focus&&(a.costs.focus||0)<=old.focus);
  return choices.length?choices.map(a=>({...a,label:'Inspiration · '+a.label,costs:{...a.costs,focus:p.stage==='activate'?(a.costs.focus||0):0,channel:0},effects:{...a.effects,inspiration:true}})):
    [{type:'inspirationKeep',key:JSON.stringify(['inspirationKeep',{}]),label:'Cannot resolve: keep revealed card in hand',effects:{},costs:{}}];
}
export function finishInspiration(g,a){
  const b=g.s.battle,p=b?.inspiration;if(!p)return;
  if(a.type==='consume')return;
  if(p.stage==='place'&&a.type==='place'){
    const slot=b.grid.findIndex(s=>top(s)?.uid===p.uid);
    if(slot>=0){p.stage='activate';b.phase='activate';return;}
  }
  if(a.type==='activate'||a.type==='inspirationKeep'){
    const i=b.grid.findIndex(s=>s.some(c=>c.uid===p.uid));
    if(i>=0){
      const c=b.grid[i].find(c=>c.uid===p.uid);
      if(a.type==='inspirationKeep') {b.hand.push({uid:c.uid,id:c.id,upgrade:c.upgrade});b.grid[i]=b.grid[i].filter(x=>x.uid!==c.uid);}
      else if(p.destroy||g.recallCost([c])==null)g.destroyCard(i,c.uid);
      else {b.discard.push({uid:c.uid,id:c.id,upgrade:c.upgrade});b.grid[i]=b.grid[i].filter(x=>x.uid!==c.uid);}
      b.shields=b.shields.filter(x=>x.owner!==p.uid);
    }
  }
  b.phase=p.phase;delete b.inspiration;
}
export function supplyResourceLegal(g){
  const b=g.s.battle,total=b.focus+b.channel,old={focus:b.focus,channel:b.channel};
  g.projectingSupply=true;b.focus=total;b.channel=total;
  let actions;try{actions=g.baseLegal();}finally{Object.assign(b,old);g.projectingSupply=false;}
  return actions.filter(a=>(a.costs.focus||0)+(a.costs.channel||0)<=total);
}
export function prepareSupplyPayment(g,a){
  const b=g.s.battle;if(!b||g.s.mode!=='battle'||!b.confluence||b.inspiration)return;
  const f=a.costs.focus||0,c=a.costs.channel||0;
  if(b.focus<f){const n=f-b.focus;b.focus+=n;b.channel-=n;}
  if(b.channel<c){const n=c-b.channel;b.channel+=n;b.focus-=n;}
}
export function equipmentStart(g){
  const b=g.s.battle;b.recallCount=0;b.remembranceGained=0;b.echoPrevious=null;b.echoUsed={};b.resonanceUsed={};b.prismaticChoices={};
  b.resonanceHelms=g.equipped().filter(x=>x.definition.id==='resonanceHelm').map(x=>x.uid);
  b.lastStandActive=g.s.hp<=g.s.maxHp/3;
}
export function supplyPreview(b,c,i,element=c.element){
  const f=cardEffects(c),charged=!cards[c.id].charge||c.charge>=cards[c.id].charge;
  const damage=charged&&hasDirectDamageActivation(c),guard=charged&&!!(f.shield||f.ward);
  const chain=(cards[c.id].attune||f.conduit)&&element!=='Arcane'&&adjacent(i).some(j=>{const n=top(b.grid[j]);return n&&n.lastActivatedTurn===b.turn&&attunementSourceElement(b,n)===element;});
  const bonus=chain?4*(b.resonanceHelms||[]).filter(uid=>!b.resonanceUsed?.[uid]).length:0;
  return {damageBonus:damage?bonus:0,guardBonus:!damage&&guard?bonus:0,damageMultiplier:damage&&b.fury?2:1,guardMultiplier:guard&&b.bastion?2:1};
}
export function braceletForecast(g){
  const b=g.s.battle,old=b.bracelets||[];
  return g.equipped().filter(x=>x.definition.effect.block).map(x=>{
    const prev=old.find(y=>y.uid===x.uid);let block=x.definition.effect.block;
    if(x.id==='reservoirBracelet'||x.definition.id==='reservoirBracelet')block=Math.min(12,(prev?.block??0)+(b.turn<=1&&!prev?4:4));
    if(x.definition.id==='reclaimerBracelet')block=3+3*(b.recallCount||0);
    if(x.definition.id==='lastStandBracelet'&&b.lastStandActive)block=9;
    return {uid:x.uid,block,element:b.prismaticChoices?.[x.uid]||x.element,name:x.definition.name};
  });
}
export function equipmentEnd(g){
  const b=g.s.battle;b.bracelets=braceletForecast(g);
  delete b.confluence;
}
export function gearChoices(g,add){
  const b=g.s.battle;if(g.s.mode!=='battle'||b.reaction||!['place','activate'].includes(b.phase))return;
  for(const x of g.equipped())if(x.definition.id==='prismaticBracelet'&&!b.prismaticChoices?.[x.uid])for(const element of ELEMENTS)
    add('braceletElement','Prismatic Bracelet · '+element,{uid:x.uid,element},{element},{});
}
export function destructionGuard(g,count){
  const b=g.s.battle;if(!g.equipped().some(x=>x.definition.id==='remembranceArmor'))return;
  const gain=Math.min(8-(b.remembranceGained||0),count*2);b.remembranceGained=(b.remembranceGained||0)+gain;b.bodyGuard=(b.bodyGuard||0)+gain;
}
export function activationSupply(g,c,i,element){
  const b=g.s.battle,f=cardEffects(c),charging=cards[c.id].charge&&c.charge<cards[c.id].charge;
  const damaging=hasDirectDamageActivation(c)&&!charging;
  const guard=!!(f.shield||f.ward)&&!charging;
  const linked=(cards[c.id].attune||f.conduit)&&element&&element!=='Arcane'&&adjacent(i).some(j=>{const n=top(b.grid[j]);return n&&n.lastActivatedTurn===b.turn&&attunementSourceElement(b,n)===element;});
  let bonus=0;
  if(linked&&(damaging||guard))for(const x of g.equipped())if(x.definition.id==='resonanceHelm'&&!b.resonanceUsed?.[x.uid]){(b.resonanceUsed||={})[x.uid]=true;bonus+=4;g.present('shieldBoost',{sourceItem:x.uid,slot:i,amount:4,element,name:x.definition.name});}
  const result={damageMultiplier:damaging&&b.fury?2:1,guardMultiplier:guard&&b.bastion?2:1,damageBonus:damaging?bonus:0,guardBonus:!damaging&&guard?bonus:0};
  if(damaging)delete b.fury;if(guard)delete b.bastion;
  return result;
}
export function echoAttack(g,c,i,element,target){
  const b=g.s.battle;if(!hasDirectDamageActivation(c))return;
  if(b.echoPrevious&&b.echoPrevious!==element&&target?.hp>0)for(const gear of g.equipped())if(gear.definition.id==='echoRing'&&!b.echoUsed?.[gear.uid]){
    (b.echoUsed||={})[gear.uid]=true;g.damageEnemy(target,5,element,{card:c.uid},gear.uid);
  }
  b.echoPrevious=element;
}
