import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Game} from './revised/rules/engine.mjs';
import {cards,items} from './revised/rules/content.mjs';
const root='reports/apex-semi-ideal-4.0.19';
for(const name of ['balanced','offense','preservation','guided','recycling-run']){
 const file=root+'/'+name+'/trial.json';if(!fs.existsSync(file))continue;
 const trial=JSON.parse(fs.readFileSync(file));
 const g=new Game(0,JSON.parse(fs.readFileSync(root+'/initial.json')));
 const damage={},activations={},placements={},recalls={},enemyPlans=[],potionEvents=[];
 const actions=['guided','recycling-run'].includes(name)?[...JSON.parse(fs.readFileSync(root+'/guided-prefix.json')),...trial.actions]:trial.actions;
 for(const [i,wanted] of actions.entries()){
  const a=g.legal().find(a=>a.key===wanted.key);assert.ok(a,`Illegal ${name} ${i}`);
  const b=g.s.battle, beforeBoss=b.enemies[0].hp;
  let label=a.type;
  if(a.type==='activate'){
   label=cards[b.grid[a.slot].at(-1).id].name;
   activations[label]=(activations[label]||0)+1;
  }
  if(a.type==='place'){
   const id=b.hand.find(c=>c.uid===a.uid)?.id;
   if(id){label=cards[id].name;placements[label]=(placements[label]||0)+1;}
  }
  if(a.type==='recall'){
   label=cards[b.grid[a.slot].at(-1).id].name;
   recalls[label]=(recalls[label]||0)+1;
  }
  if(a.type==='consume'){
   label=items[g.s.inventory.find(x=>x.uid===a.uid).id].name;
   potionEvents.push({turn:b.turn,item:label,hp:g.s.hp});
  }
  if(a.type==='endTurn')enemyPlans.push({turn:b.turn,hp:g.s.hp,boss:beforeBoss,move:g.tell(b.enemies[0]).name,
   warnings:g.gridTelegraphs().map(t=>({name:t.name,spaces:t.spaces,cards:t.targets.flatMap(i=>b.grid[i].map(c=>cards[c.id].name))}))});
  g.act(a);
  const dealt=beforeBoss-Math.max(0,g.s.battle.enemies[0].hp);
  if(dealt>0)damage[label]=(damage[label]||0)+dealt;
 }
 for(const k of ['hp','mode','rng','battle','inventory','equipment'])assert.deepEqual(g.s[k],trial.final[k]);
 const summary={summary:trial.summary,fullActions:actions.length,fullReplayVerified:true,damageToBoss:damage,activations,placements,recalls,potionEvents,enemyPlans,stats:g.s.stats,
  destroyed:g.s.battle.destroyed.map(c=>cards[c.id].name)};
 fs.writeFileSync(root+'/'+name+'/analysis.json',JSON.stringify(summary,null,2));
 console.log(JSON.stringify({trial:name,...trial.summary,damageToBoss:damage,recalls,potionEvents,damageTaken:g.s.stats.damageTaken}));
}
