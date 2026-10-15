import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {spawnIdeon, commandIdeon, tendrilTargets, tendrilDamage, tendrilPlan, settleIdeons, depthsJob} from '../src/ideons.mjs';
const arena=()=>{
  const g=new Game(731);g.s.stratum=3;g.s.equipment={};
  g.beginBattle([{uid:900,enemy:'cnidarian',restless:0}]);
  delete g.s.checkpoint;g.s.battle.ideons=[];g.s.battle.grid=Array.from({length:42},()=>[]);
  return g;
};
const put=(g,id,slot)=>{
  const c=g.instance(g.newCard(id));g.s.battle.grid[slot].push(c);return c;
};
test('Tendrils Splash distant Allies while swapping Constructs, preserving Guard and space hazards',()=>{
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:20});
  const far=put(g,'sapling',0),diagonal=put(g,'sapling',12);far.hp=2;diagonal.hp=8;
  const host=put(g,'ward',19),meld=g.instance(g.newCard('magnify'));
  meld.attachedTo=host.uid;b.grid[19].unshift(meld);b.shields=[{slot:19,value:7}];
  b.corruptions[19]={kind:'nausea',uid:990};
  assert.equal(tendrilTargets(b,e).length,0);commandIdeon(g,e.uid);
  assert.equal(e.slot,19);assert.deepEqual([far.hp,diagonal.hp],[1,8]);
  assert.match(g.s.log.at(-1),/Splash/);
  assert.deepEqual(b.grid[20].map(c=>c.uid),[meld.uid,host.uid]);
  assert.equal(b.grid[19].length,0);assert.equal(b.shields[0].slot,20);
  assert.equal(b.corruptions[19].kind,'nausea');assert.equal(e.age,1);
});
test('Tendrils hit only the weakest adjacent Ally, with stable ties and no move on an attack',()=>{
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:20});
  const far=put(g,'sapling',0);far.hp=1;
  const a=put(g,'sapling',13),z=put(g,'sapling',19);a.hp=z.hp=20;
  assert.deepEqual(tendrilTargets(b,e).map(x=>x.i),[13,19]);
  commandIdeon(g,e.uid);assert.equal(a.hp,16);assert.equal(z.hp,20);assert.equal(far.hp,1);assert.equal(e.slot,20);
  z.hp=2;assert.equal(tendrilTargets(b,e)[0].i,19);commandIdeon(g,e.uid);
  assert.equal(b.grid[19].length,0);assert.equal(e.slot,20);
});
test('Tendrils respect holes, other Ideons and row edges; Splash replaces Poison when an Ally exists',()=>{
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:20});
  b.corruptions[19]={kind:'hole'};commandIdeon(g,e.uid);assert.equal(e.slot,20);
  delete b.corruptions[19];spawnIdeon(g,b.enemies[0],'tentacle',{slot:19});
  commandIdeon(g,e.uid);assert.equal(e.slot,20);
  e.slot=7;const ally=put(g,'sapling',6);ally.hp=3;commandIdeon(g,e.uid);
  assert.equal(e.slot,8);assert.equal(ally.hp,1);assert.equal(g.s.status.poison||0,0);
  commandIdeon(g,e.uid);assert.equal(b.grid[6].length,0);
  e.slot=7;commandIdeon(g,e.uid);assert.equal(g.s.status.poison,2);
});
test('Existing tendrils and their Continue checkpoint gain swapping without resetting combat progress',()=>{
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:20});
  e.swap=false;e.damage=12;e.hp=3;e.age=7;e.element='Fire';e.text='obsolete';
  put(g,'blast',19);g.s.checkpoint=structuredClone(g.s);
  const loaded=new Game(0,structuredClone(g.s)),q=loaded.s.battle.ideons[0];
  assert.equal(q.swap,true);assert.match(q.text,/adjacent/);
  assert.equal(q.damage,4);
  assert.deepEqual(tendrilDamage(q),{strike:18,splash:5});
  assert.deepEqual([q.hp,q.age,q.slot,q.element],[3,7,20,'Fire']);
  assert.equal(loaded.s.checkpoint.battle.ideons[0].swap,true);
  commandIdeon(loaded,q.uid);assert.equal(q.slot,19);
});

test('Each surviving tendril grows both attacks on the same clock, rounding Splash upward',()=>{
  for(const adjacent of [false,true]) {
    const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:20});
    b.corruptions[19]={kind:'hole'};b.corruptions[13]={kind:'hole'};
    const ally=put(g,'familiar',adjacent?13:0);ally.hp=100;
    if(adjacent)delete b.corruptions[13];
    const expected=adjacent?[4,6,8,10,12,14]:[1,2,2,3,3,4];
    for(const loss of expected){
      assert.equal(tendrilDamage(e)[adjacent?'strike':'splash'],loss);
      const before=ally.hp;commandIdeon(g,e.uid);assert.equal(before-ally.hp,loss);
    }
    // Switching between Splash and adjacent strike does not restart either growth.
    b.grid[adjacent?0:13]=b.grid[adjacent?13:0];b.grid[adjacent?13:0]=[];
    const before=ally.hp;commandIdeon(g,e.uid);
    assert.equal(before-ally.hp,adjacent?4:16);
  }
});

test('Replacement tendrils reset both damage values while survivors retain their age',()=>{
  const g=arena(),b=g.s.battle,owner=b.enemies[0];
  const dead=spawnIdeon(g,owner,'tentacle',{slot:20}),survivor=spawnIdeon(g,owner,'tentacle',{slot:27});
  dead.age=12;survivor.age=9;dead.hp=0;settleIdeons(g);
  b.turn++; // Full player turn before the warned return.
  depthsJob(g,{kind:'tentacleReplace',owner:owner.uid});
  const replacement=b.ideons.find(e=>e.uid!==survivor.uid);
  assert.equal(replacement.age,0);assert.deepEqual(tendrilDamage(replacement),{strike:4,splash:1});
  assert.deepEqual(tendrilDamage(survivor),{strike:22,splash:6});
  assert.equal(owner.pendingTentacles,0);
  replacement.slot=20;const ally=put(g,'familiar',13);ally.hp=30;
  commandIdeon(g,replacement.uid);assert.equal(ally.hp,26);
});

test('Splash still fires if movement is obstructed and respects the Ally activation attunement',()=>{
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:20});
  b.corruptions[19]={kind:'hole'};b.corruptions[13]={kind:'hole'};const ally=put(g,'familiar',0);
  ally.hp=10;ally.attuned='Fire';commandIdeon(g,e.uid);
  assert.equal(e.slot,20);assert.equal(ally.hp,8); // 1 Water, +50%, rounded up.
  assert.match(g.s.log.at(-1),/Splash/);
});

test('Player Splash starts at the post-movement column and cannot travel backwards through defenses',()=>{
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:4});
  b.jobs=[];e.age=15;
  for(const i of [8,10,12])put(g,'ward',i).ward=2;
  commandIdeon(g,e.uid);
  assert.equal(e.slot,3);
  assert.deepEqual({damage:b.jobs[0].damage,slot:b.jobs[0].gridSourceSlot,name:b.jobs[0].name,visual:b.jobs[0].attackVisual},
    {damage:9,slot:3,name:'Splash',visual:'splash'});
  g.pump();
  assert.deepEqual(g.defenseChoices().wards.map(x=>x.i),[8,10]);
  g.act(g.legal().find(a=>a.type==='ward'&&a.slot===8));
  assert.equal(g.s.hp,63); // 9 Water minus 2 neutral Ward; farther-right Ward cannot defend.
  assert.equal(b.grid[10][0].ward,2);assert.equal(b.grid[12][0].ward,2);
});

test('Obstructed tendrils Splash the player; starting at the left edge uses Poison instead',()=>{
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:20});
  b.jobs=[];b.corruptions[19]={kind:'hole'};e.age=3;
  commandIdeon(g,e.uid);assert.equal(e.slot,20);assert.equal(b.jobs[0].damage,3);
  assert.equal(b.jobs[0].gridSourceSlot,20);
  b.jobs=[];e.slot=0;commandIdeon(g,e.uid);
  assert.equal(b.jobs.length,0);assert.equal(g.s.status.poison,2);
});


test('Tendrils pursue their Splash target in all four directions, even from the player edge',()=>{
  for(const [from,target,to] of [[17,3,10],[17,31,24],[17,20,18],[17,14,16],[7,10,8]]) {
    const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:from});
    const ally=put(g,'familiar',target);ally.hp=30;
    commandIdeon(g,e.uid);
    assert.equal(e.slot,to);assert.equal(ally.hp,30-(Math.abs(to%7-target%7)+Math.abs(Math.floor(to/7)-Math.floor(target/7))===1?4:1));
    assert.equal(g.s.status.poison||0,0);
  }
});

test('Vertical pursuit swaps the entire Construct and Guard; reaching adjacency uses a full strike',()=>{
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:17});
  const ally=put(g,'familiar',3);ally.hp=30;
  const ward=put(g,'ward',10),meld=g.instance(g.newCard('magnify'));
  meld.attachedTo=ward.uid;b.grid[10].unshift(meld);b.shields=[{slot:10,value:7}];
  b.corruptions[10]={kind:'nausea'};
  commandIdeon(g,e.uid);
  assert.equal(e.slot,10);assert.equal(ally.hp,26);
  assert.deepEqual(b.grid[17].map(c=>c.uid),[meld.uid,ward.uid]);
  assert.equal(b.shields[0].slot,17);assert.equal(b.corruptions[10].kind,'nausea');
  commandIdeon(g,e.uid);assert.equal(e.slot,10);assert.equal(ally.hp,20);
});

test('Pursuit chooses the weakest Ally and a closer legal step, using horizontal then reading order ties',()=>{
  const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:17});
  const a=put(g,'familiar',5),z=put(g,'familiar',29);a.hp=z.hp=30;
  commandIdeon(g,e.uid);assert.equal(e.slot,18);assert.equal(a.hp,29);assert.equal(z.hp,30);
  e.slot=17;b.corruptions[18]={kind:'hole'};
  commandIdeon(g,e.uid);assert.equal(e.slot,10);assert.equal(a.hp,27);
  e.slot=17;spawnIdeon(g,b.enemies[0],'tentacle',{slot:10});
  commandIdeon(g,e.uid);assert.equal(e.slot,17);assert.equal(a.hp,25);
});


test('Post-move intent and combat agree: full scaled strike on arrival, Splash if the closer step is blocked',()=>{
  for(const blocked of [false,true]) {
    const g=arena(),b=g.s.battle,e=spawnIdeon(g,b.enemies[0],'tentacle',{slot:17});
    const ally=put(g,'familiar',3);ally.hp=50;e.age=3;
    if(blocked)b.corruptions[10]={kind:'hole'};
    const plan=tendrilPlan(b,e);assert.equal(plan.destination,blocked?17:10);
    assert.equal(plan.adjacent,!blocked);assert.equal(plan.target.c.uid,ally.uid);
    commandIdeon(g,e.uid);assert.equal(ally.hp,blocked?47:40);
    assert.match(g.s.log.at(-1),blocked?/Splash/:/Tendril strike/);
  }
});
