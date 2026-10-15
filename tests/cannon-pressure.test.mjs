import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {ELEMENTS} from '../src/content.mjs';
import {spawnIdeon,fieldIdeons,normalizeInsectMovement} from '../src/ideons.mjs';
function arena(seed=731){
 const g=new Game(seed);g.s.stratum=3;g.s.equipment={};
 g.beginBattle([{uid:900,enemy:'refractionCannon',restless:0}]);delete g.s.checkpoint;
 g.s.hp=g.s.maxHp=10000;g.s.battle.grid=Array.from({length:42},()=>[]);
 g.capturePresentation=true;g.presentation=[];return g;
}
test('every thought field uses a clipped radius-two Manhattan diamond',()=>{
 for(const field of ['element','shared','destroy']){
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'bullet',{slot:17,field,element:'Fire'});
  assert.equal(Array.from({length:42},(_,i)=>fieldIdeons(b,i)).filter(x=>x.includes(e)).length,13);
  assert.ok(fieldIdeons(b,9).includes(e));assert.ok(!fieldIdeons(b,8).includes(e));
  e.slot=0;assert.deepEqual(Array.from({length:42},(_,i)=>i).filter(i=>fieldIdeons(b,i).includes(e)),[0,1,2,7,8,14]);
 }
});
test('Cannon charges on actual turns 4/9/14 and fires escalating 40/50/60 on 5/10/15',()=>{
 const g=arena(),b=g.s.battle,e=b.enemies[0];
 for(let turn=1;turn<=15;turn++){
  b.corruptions={}; // Test the blast itself; mine pressure has separate integration coverage.
  const t=g.tell(e),blast=[5,10,15].includes(turn);
  assert.equal(!!t.finalBlast,blast);assert.equal(t.name.includes('Charging Final Blast'),turn%5===4);
  const before=structuredClone(b.ideons),hp=g.s.hp,cycle=e.cycle;
  g.endTurn();assert.equal(e.cannonTurns,turn);
  if(blast){assert.equal(hp-g.s.hp,40+10*(turn/5-1));assert.equal(e.cycle,cycle);assert.deepEqual(b.ideons,before);}
  assert.equal(b.turn,turn+1);
 }
 assert.equal(g.presentation.filter(f=>f.kind==='status'&&f.name?.startsWith('Charging Final Blast')).length,3);
});
test('Final Blast element is seeded, stable under inspection and preserved by Continue',()=>{
 const elements=new Set();
 for(let seed=1;seed<=40;seed++){
  const g=arena(seed),e=g.s.battle.enemies[0];for(let n=0;n<4;n++)g.endTurn();
  const saved=JSON.stringify(g.s),element=e.finalBlastElement;elements.add(element);
  for(let n=0;n<5;n++){assert.equal(g.tell(e).element,element);g.observe();}
  assert.equal(JSON.stringify(g.s),saved);
  const resumed=new Game(0,JSON.parse(saved));assert.equal(resumed.tell(resumed.s.battle.enemies[0]).element,element);
  assert.equal(resumed.s.battle.enemies[0].cannonTurns,4);
 }
 assert.deepEqual([...elements].sort(),[...ELEMENTS].sort());
});
test('Final Blast takes priority over Purify; Purify still counts toward the five-turn timer',()=>{
 const g=arena(),e=g.s.battle.enemies[0];e.cannonTurns=3;e.purifyPending=true;
 assert.match(g.tell(e).name,/Purify.*Charging Final Blast/);g.endTurn();
 e.purifyPending=true;assert.ok(g.tell(e).finalBlast);g.endTurn();
 assert.equal(g.tell(e).name,'Purify');assert.equal(e.cannonTurns,5);
});
test('Final Blast starts at the enemy edge and permits Wards across the entire grid',()=>{
 const g=arena(),b=g.s.battle,e=b.enemies[0];e.finalBlastElement='Fire';e.hp=1;e.cycle=100;
 for(let i=0;i<7;i++){const c=g.instance(g.newCard('ward'));c.ward=5;c.zeroWard=false;b.grid[i]=[c];}
 g.endTurn();assert.equal(b.reaction.damage,40);assert.equal(b.reaction.column,6);assert.ok(!b.reaction.pierce);
 assert.deepEqual(g.defenseChoices().wards.map(x=>x.i),[0,1,2,3,4,5,6]);
 g.act(g.legal().find(a=>a.type==='ward'&&a.slot===3));
 assert.deepEqual(g.defenseChoices().wards.map(x=>x.i),[0,1,2]);
});
test('old Cannon snapshots acquire the counter and current field description without changing combat position',()=>{
 const g=arena(),b=g.s.battle,e=b.enemies[0];e.cycle=7;delete e.cannonTurns;
 const bullet=spawnIdeon(g,e,'bullet',{slot:17,field:'element',element:'Water'});bullet.hp=3;bullet.text='old';
 normalizeInsectMovement(g.s);assert.equal(e.cannonTurns,7);assert.equal(bullet.hp,3);assert.equal(bullet.slot,17);
 assert.match(bullet.text,/radius-2/);assert.equal(e.finalBlastElement,undefined);
});
