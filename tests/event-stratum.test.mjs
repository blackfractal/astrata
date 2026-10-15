import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.mjs';
import {events} from '../src/content.mjs';

function encounter(g) {
 const f=g.s.field;g.s.mode='field';
 f.entities=[{uid:900,type:'Event',x:f.x,y:f.y}];
 g.resolveTile();assert.equal(g.s.mode,'event');return g.s.event;
}
test('S1 initial event decks exclude all S3 events, including A Light in the Chitin',()=>{
 for(let seed=1;seed<=50;seed++){
  const g=new Game(seed);
  assert.ok(g.s.eventDeck.length);
  assert.ok(g.s.eventDeck.every(id=>!(events.find(e=>e.id===id).stratum>1)));
  assert.ok(!g.s.eventDeck.includes('depthsCache'));
 }
});
test('existing S1 and S2 queues discard foreign events while preserving legal order and RNG',()=>{
 for(const stratum of [1,2]){
  const original=new Game(1072600984);original.s.stratum=stratum;
  original.s.eventDeck=['dew','depthsBrood','spring','depthsTribute','depthsCache'];
  const g=new Game(0,structuredClone(original.s)),rng=g.s.rng;
  assert.equal(encounter(g),'spring');assert.deepEqual(g.s.eventDeck,['dew']);assert.equal(g.s.rng,rng);
  assert.equal(encounter(g),'dew');assert.equal(g.s.rng,rng);
 }
});
test('empty or wholly invalid event queues refill only from the current Stratum pool',()=>{
 for(const stratum of [1,2,3]){
  const g=new Game(731);g.s.stratum=stratum;g.s.eventDeck=['removed-event',...(stratum===3?['dew']:['depthsCache'])];
  const expected=new Set(g.eventPool());
  for(let i=0;i<expected.size*3;i++)assert.ok(expected.has(encounter(g)));
 }
});
test('S3 still offers A Light in the Chitin; shrine quest remains separate',()=>{
 const g=new Game(731);g.s.stratum=3;g.s.eventDeck=['depthsCache'];
 assert.equal(encounter(g),'depthsCache');
 g.s.quest=true;g.s.eventDeck=['depthsBrood'];
 assert.equal(encounter(g),'shrine');assert.deepEqual(g.s.eventDeck,['depthsBrood']);assert.equal(g.s.quest,false);
});
