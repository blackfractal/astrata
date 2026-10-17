import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { WeightedPolicy } from '../src/policy.mjs';
import { startDepthsTutorial, depthsTutorialUnlocked } from '../src/depths-tutorial.mjs';
import { enemies } from '../src/content.mjs';
function lessons() {
  let g = startDepthsTutorial(new Game(33003));
  const states = {};
  for (let i = 0; i < 50 && g.s.tutorial.lesson !== 'independent'; i++) {
    g = new Game(0, g.save());
    states[g.s.tutorial.lesson] = structuredClone(g.s);
    assert.equal(g.legal().length, 1, g.s.tutorial.lesson);
    g.act(g.legal()[0]);
  }
  assert.equal(g.s.tutorial.lesson, 'independent');
  return {g, states};
}
test('S3 tutorial resumes every lesson and teaches real Ideon targeting and source-column defense', () => {
  const {g, states:s} = lessons();
  assert.equal(s.silenced.battle.grid[17][0].id, 'lucidGuide');
  assert.ok(!s.silenced.battle.ideons.some(e => e.hp > 0));
  assert.equal(s.route.battle.reaction.damage, 6);
  assert.equal(s.route.battle.grid[26][0].ward, 11);
  const raw = new Game(0, s.route).baseLegal();
  assert.ok(raw.some(a => a.type === 'block' && a.slot === 22));
  assert.ok(!raw.some(a => ['block','ward','intercept'].includes(a.type) && [6,26].includes(a.slot)));
  assert.equal(s.bracelet.battle.reaction.damage, 2);
  assert.equal(s.safe.hp, 70);
  assert.equal(s.safe.battle.grid[26][0].ward, 11);
  assert.equal(s['own-voice'].battle.ideons.filter(e => e.hp > 0).length, 0);
  assert.equal(s['own-voice'].battle.grid[24][0].id,'lucidGuide');
  assert.ok(!g.s.deck.some(c=>c.id==='lucidNeedle'));
  assert.equal(g.s.battle.enemies[0].uid, s.whispers.battle.enemies[0].uid);
  assert.equal(g.s.battle.enemies[0].hp, 40);
  assert.equal(g.s.battle.enemies[0].maxHp, 40);
});
test('S3 independent practice has a legal winning line and records a tutorial, not a normal Stratum victory', () => {
  let {g} = lessons();
  const policy = new WeightedPolicy();
  for(let i=0;i<300 && g.s.mode!=='result';i++) {
    g = new Game(0,g.save());
    // Action-effects baseline; deliberately does not use the built-in AI's
    // board heuristics, which mishandle this practice encounter.
    const a = policy.choose({},g.legal()).action;
    assert.ok(a); g.act(a);
  }
  assert.equal(g.s.outcome,'win');
  assert.equal(g.s.tutorial.completed,true);
  assert.ok(!g.s.stats.strataCompleted?.includes(3));
});
test('S3 retry restores the independent encounter and its RNG', () => {
  const {g} = lessons(), saved=structuredClone(g.s.tutorial.finalStart);
  g.s.hp=0; g.finish(false,'test loss');
  g.act(g.legal().find(a=>a.type==='tutorialRetry'));
  assert.equal(g.s.mode,'battle');
  assert.equal(g.s.hp,saved.hp);
  assert.equal(g.s.rng,saved.rng);
  assert.deepEqual(g.s.battle,saved.battle);
});
test('S3 tutorial is hidden before discovery and its enemy variants are tutorial-only', () => {
  assert.equal(depthsTutorialUnlocked({}),false);
  assert.equal(depthsTutorialUnlocked({save:{stratum:2}}),false);
  for(const data of [{save:{stratum:3}},{history:[{stratum:4}]},{tutorialStats:{stratum3:{}}},{tutorialSave:{tutorial:{id:'stratum3'}}}])
    assert.equal(depthsTutorialUnlocked(data),true);
  for(const id of ['whisperTutor','whisperWarden']) assert.equal(enemies[id].tutorialOnly,true);
});
test('Older guided saves preserve progress through the revised Guide formation lesson', () => {
  const {states:s}=lessons();
  const old=structuredClone(s['guide-strike']);
  old.tutorial.version=1; old.tutorial.step=4;
  old.battle.grid[17]=old.battle.grid[16]; old.battle.grid[16]=[];
  old.battle.ideons[0].slot=19;
  const g=new Game(0,old);
  assert.equal(g.s.tutorial.lesson,'guide-strike');
  assert.equal(g.s.tutorial.version,2);
  assert.equal(g.legal()[0].slot,16);
  g.act(g.legal()[0]);
  assert.equal(g.s.tutorial.lesson,'silenced');
  const retired=structuredClone(s.safe);
  retired.tutorial.version=1; retired.tutorial.lesson='needle-strike'; retired.tutorial.step=20;
  retired.battle.grid[24]=[g.instance(g.newCard('lucidNeedle'))];
  const h=new Game(0,retired);
  assert.equal(h.s.tutorial.lesson,'own-voice');
  assert.equal(h.s.battle.grid[24].length,0);
  assert.equal(h.legal()[0].type,'tutorialNext');
  h.act(h.legal()[0]);
  assert.equal(h.s.tutorial.lesson,'independent');
});
