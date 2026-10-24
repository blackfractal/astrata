import fs from 'node:fs';
import assert from 'node:assert/strict';
const root='reports/apex-fullest-4.0.19';
const {Game}=await import('./revised/rules/engine.mjs');
const initial=JSON.parse(fs.readFileSync(root+'/initial.json'));
for(const trial of ['revised','offense','survival']){
 const path=root+'/'+trial+'/trial.json';
 if(!fs.existsSync(path))continue;
 const data=JSON.parse(fs.readFileSync(path));
 const g=new Game(0,structuredClone(initial));const moves=[];
 for(const saved of data.actions){
  const a=g.legal().find(x=>x.key===saved.key);assert.ok(a);
  if(a.type==='endTurn'){
   const b=g.s.battle,e=b.enemies[0],t=g.tell(e),w=g.gridTelegraphs().find(t=>t.source===e.uid);
   moves.push({turn:b.turn,hp:g.s.hp,boss:e.hp,move:t.name,targets:w?.targets.map(i=>({slot:i,cards:b.grid[i].map(c=>({id:c.id,hp:c.hp,ward:c.ward,uses:g.allowance(c,i)}))}))});
  }
  g.act(a);
 }
 fs.writeFileSync(root+'/'+trial+'/enemy-turn-plans.json',JSON.stringify(moves,null,2));
 console.log(trial,JSON.stringify(moves.filter(x=>x.move.startsWith('Unmake'))));
}
