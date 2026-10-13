import {trial,event} from './trial.mjs';import {Game} from '../../src/engine.mjs';
const g=new Game(0,structuredClone(event));g.act(g.legal().find(a=>a.type==='eventChoice'&&a.index===1));
export const t=trial(g.s);
function value(g){const b=g.s.battle;return g.s.hp*10000+b.grid.flat().reduce((n,c)=>n+(c.hp||0)*4+(c.ward||0),0)-(b.enemies||[]).reduce((n,e)=>n+Math.max(0,e.hp)*.03,0);}
export function defend(t){let frontier=[{g:t.g,keys:[]}],done=[];
for(let k=0;k<30&&frontier.length;k++){
 const next=[];
 for(const node of frontier){if(!node.g.s.battle.reaction||node.g.s.mode!=='battle'){done.push(node);continue;}
 for(const a of node.g.legal()){
  const x=new Game(0,node.g.save());delete x.s.checkpoint;x.act(a.key);
  if(x.s.mode==='result')continue;
  next.push({g:x,keys:[...node.keys,a.key]});
 }}
 next.sort((a,b)=>value(b.g)-value(a.g));frontier=next.slice(0,90);
}
done.sort((a,b)=>value(b.g)-value(a.g));if(!done.length)throw Error('no defense');
for(const key of done[0].keys)t.step(t.g.legal().find(a=>a.key===key));
}
t.place('storm',18);t.place('square',17);t.place('familiar',24);t.place('rain',25);
t.act('activatePhase');t.activate(18);t.activate(17);t.activate(24,{element:'Earth'});t.act('endTurn');defend(t);
t.place('conduit',26);t.place('shield',24);t.place('blast',16);t.place('clear',11);t.place('palimpsest',18);
t.act('activatePhase');t.activate(26);t.activate(18);t.activate(16,{element:'Earth',target:t.g.s.battle.enemies[0].uid});t.activate(17,{target:t.g.s.battle.enemies[1].uid});t.activate(24,{element:'Arcane'});t.act('endTurn');defend(t);
t.place('lucidGuide',5);t.place('lattice',20,'Earth');t.place('blast',23);t.place('rot',27);
t.act('activatePhase');t.activate(26);t.activate(16,{element:'Earth',target:t.g.s.battle.enemies[1].uid});t.activate(23,{element:'Earth',target:t.g.s.battle.enemies[2].uid});t.activate(27,{target:t.g.s.battle.enemies[2].uid});t.activate(24,{element:'Earth'});t.act('endTurn');defend(t);
t.place('sapling',22);t.place('blast',15);t.act('activatePhase');t.activate(15,{element:'Earth',target:t.g.s.battle.enemies[2].uid});t.activate(23,{element:'Earth',target:t.g.s.battle.enemies[2].uid});
t.save('brood-victory');console.log(JSON.stringify({hp:t.g.s.hp,mode:t.g.s.mode,turn:t.g.s.battle.turn}));
