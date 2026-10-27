import {Game,cardPower,adjacent,enemyDamage,defenseRate} from '../../../snapshots/apex-semi-ideal-4.0.19/guided/rules/engine.mjs';
import {cards} from '../../../snapshots/apex-semi-ideal-4.0.19/guided/rules/content.mjs';
const clone=g=>{const s=structuredClone(g.s);s.log=[];s.history=[];delete s.checkpoint;const z=new Game(0,s);return z;};
let cfg, simulated=0;
export function setConfig(c){cfg=c;}
function worth(c){const d=cards[c.id],f=d.effects;return 1+(f.hpDamage?12:f.damage||f.shield||f.ward||0)*.3+(f.transmute?10:0)+(f.focusPermanent?5:0)+(f.insight||f.adjInsight?3:0);}
function value(g, interim=false){
 const s=g.s,b=s.battle;if(s.hp<=0)return -100000+b.enemies.reduce((n,e)=>n-e.hp,0);
 if(b.enemies.every(e=>e.hp<=0))return 100000+s.hp;
 let v=s.hp*cfg.hp-b.enemies.reduce((n,e)=>n+Math.max(0,e.hp)+e.guard*.6,0);
 v-=b.destroyed.reduce((n,c)=>n+worth(c)*cfg.keep,0);
 v+=(b.permanent.focus||0)*12+(b.next.focus||0)*2+(b.next.insight||0)*2;
 v+=(cfg.draw||0)*b.hand.reduce((n,c)=>n+1+worth(c)*.1,0);
 const doomed=new Set(interim?g.gridTelegraphs().flatMap(t=>t.targets):[]);
 let guard=0;const tell=g.tell(b.enemies[0]),incoming=tell.sequence||[{damage:tell.damage||0,element:tell.element,hits:tell.hits||1}];
 for(let i=0;i<b.grid.length;i++)for(const c of b.grid[i]){
  const d=cards[c.id],allow=g.allowance(c,i), usable=!b.corruptions?.[i]||b.corruptions[i].kind!=='insanity';
  const hp=c.hp||0,w=c.ward||0;
  v+=hp*(d.growth?(allow>0?(cfg.titan||.45):(cfg.titanSpent||.45)):.45)+w*.13;
  const supportValue = allow > 0 ? (d.effects.guide ? 50 : d.effects.mend ? 24 : 0) : 0;
  if(usable && !doomed.has(i)) v += supportValue;
  if(usable){v+=Math.min(allow,3)*worth(c)*.3;if(c.element==='Light'&&(d.effects.damage||d.effects.hpDamage))v+=3;}
  if(doomed.has(i))v-=worth(c)*cfg.keep+hp*(d.growth?(allow>0?(cfg.titan||.45):(cfg.titanSpent||.45)):.45)+w*.13;
  else guard+=w+hp*.4;
 }
 for(const e of b.ideons||[])v-=e.hp*.25+(e.guardian?12:4)+(e.behavior==='crawl'?(6-e.slot%7)*1.2:0);
 for(const [i,q]of Object.entries(b.corruptions||{}))if(q.kind==='insanity'&&!b.grid[i].length)v-=q.value*(cfg.insanity||2);
 if(interim){
  let temp=0;for(const p of b.shields)if(!doomed.has(p.slot)&&b.grid[p.slot].some(c=>c.uid===p.owner)){
   const rate=incoming.length?incoming.reduce((n,t)=>n+defenseRate(p.element,t.element),0)/incoming.length:1;
   temp+=p.block*(Number.isFinite(rate)&&rate>0?rate:1);
  }
  const threat=incoming.reduce((n,t)=>n+(t.damage||0)*(t.hits||1),0)+(b.ideons||[]).filter(e=>e.born<b.turn).reduce((n,e)=>n+(e.damage||e.turnDamage||0),0);
  v+=Math.min(temp+guard,Math.max(0,threat-9))*cfg.guard;
  v+=(b.channel||0)*.05;
 }
 return v;
}
function key(g){const b=g.s.battle;return JSON.stringify([g.s.hp,b.phase,b.channel,b.focus,b.grid,b.shields,b.enemies,b.reaction,b.jobs,b.bracelets,b.armorBlock,b.next,b.permanent,g.s.rng]);}
function defend(g){
 let beam=[{g,actions:[]}],done=[];
 for(let depth=0;beam.length&&depth<30;depth++){
  const next=[];
  for(const node of beam){if(node.g.s.mode!=='battle'||!node.g.s.battle.reaction){done.push(node);continue;}
   for(const a of node.g.legal()){
    if(!['block','ward','intercept','bracelet','armor','bodyGuard','playerGuard','skipEquipment'].includes(a.type))continue;
    const z=clone(node.g);z.act(a);simulated++;
    const h=z.s.battle.reaction;
    let score=value(z)-Math.max(0,h?.damage||0)*cfg.hp;
    // A spent hit cannot travel backwards; prefer consuming temporary grid Guard before equipment.
    if(h)score-=Math.min(h.damage,z.s.battle.shields.filter(p=>p.block>0&&p.slot%7>h.column).reduce((n,p)=>n+p.block,0))*.2;
    next.push({g:z,actions:[...node.actions,a],score});
   }
  }
  const seen=new Set();beam=next.sort((a,b)=>b.score-a.score).filter(n=>{const k=key(n.g);if(seen.has(k))return false;seen.add(k);return true}).slice(0,5);
 }
 done.push(...beam);done.sort((a,b)=>value(b.g)-value(a.g));return done[0]||{g,actions:[]};
}
function activate(g){
 let beam=[{g,actions:[]}],done=[];
 for(let depth=0;beam.length&&depth<10;depth++){
  const next=[];
  for(const n of beam){
   if(n.g.s.mode!=='battle'){done.push(n);continue;}
   const legal=n.g.legal();const threatened=new Set(n.g.gridTelegraphs().flatMap(t=>t.targets));let options=legal.filter(a=>['activate','consume','endTurn'].includes(a.type));
   options=options.filter(a=>!(a.type==='activate' && a.effects.guide && a.target==null && !threatened.has(a.slot)));
   if(n.g.s.battle.channel>0&&options.some(a=>a.type==='activate'))options=options.filter(a=>a.type!=='endTurn');
   if(!options.length){done.push(n);continue;}
   for(const a of options){
    // Supplies may prepare an attack before Channel is spent.
    const z=clone(n.g);z.act(a);simulated++;
    const child={g:z,actions:[...n.actions,a],score:value(z,true)};
    if(a.type==='endTurn'||z.s.mode!=='battle')done.push(child);else next.push(child);
   }
  }
  const seen=new Set();beam=next.sort((a,b)=>b.score-a.score).filter(n=>{const k=key(n.g);if(seen.has(k))return false;seen.add(k);return true}).slice(0,10);
 }
 for(const n of beam){if(n.g.s.mode==='battle'){const a=n.g.legal().find(a=>a.type==='endTurn');if(a){n.g.act(a);n.actions.push(a);}}done.push(n)}
 const finals=done.map(n=>{const d=defend(n.g);return {g:d.g,actions:[...n.actions,...d.actions]}});
 finals.sort((a,b)=>value(b.g)-value(a.g));return finals[0];
}
export {defend,activate,clone,value};
