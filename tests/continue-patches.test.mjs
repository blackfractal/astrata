import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {VERSION} from '../src/content.mjs';

test('Continue accepts every released 3.0 patch and migrates tendrils without resetting battle progress',()=>{
  const g=new Game(73);g.s.stratum=3;
  g.beginBattle([{uid:900,enemy:'cnidarian',restless:0}]);
  const original=structuredClone(g.s);
  const current=Number(VERSION.rules.split('.')[2]);
  for(let patch=0;patch<=current;patch++){
    const s=structuredClone(original);s.version={...VERSION,rules:`3.0.${patch}`};
    s.battle.turn=4;s.battle.ideons[0].age=3;s.battle.ideons[0].hp=7;
    s.battle.ideons[0].swap=false;s.battle.ideons[0].text='Old description';
    if(s.checkpoint)s.checkpoint.version=structuredClone(s.version);
    const input=structuredClone(s),loaded=new Game(0,s).s;
    assert.deepEqual(s,input,'Loading must not mutate the input save');
    assert.equal(loaded.version.rules,VERSION.rules);
    assert.equal(loaded.battle.turn,4);assert.equal(loaded.hp,s.hp);
    assert.equal(loaded.battle.ideons[0].age,3);assert.equal(loaded.battle.ideons[0].hp,7);
    assert.equal(loaded.battle.ideons[0].swap,true);
    assert.match(loaded.battle.ideons[0].text,/Splashes the player/);
    if(loaded.checkpoint)assert.match(loaded.checkpoint.battle.ideons[0].text,/Splashes the player/);
  }
});

test('Continue still rejects future, malformed and unknown save versions',()=>{
  const current=Number(VERSION.rules.split('.')[2]),s=new Game(73).s;
  for(const rules of [`3.0.${current+1}`,'3.1.0','4.0.0','3.0.011','3.0.-1','3.0.11beta','',null]){
    const saved={...structuredClone(s),version:{...VERSION,rules}};
    assert.throws(()=>new Game(0,saved),/incompatible rules/);
  }
});
