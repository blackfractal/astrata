import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { enemies } from '../src/content.mjs';
import { prepareCorruption, applyCorruptions } from '../src/corruptions.mjs';

function arena(ambush = false) {
  const g = new Game(20102026);
  g.s.stratum = 2;
  g.s.hp = g.s.maxHp = 10000;
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: 'trickster', restless: 0 }], { enemyFirst: ambush });
  return g;
}
function resolve(g) {
  let n = 0;
  while (g.s.battle.reaction && n++ < 100) {
    const a = g.legal().find(a => a.type === 'skipEquipment');
    assert.ok(a); g.act(a);
  }
  assert.ok(n < 100);
}
function round(g) { g.endTurn(); resolve(g); }
function put(g, slot) { g.s.battle.grid[slot] = [g.instance(g.newCard('blast'))]; }

test('Trickster new cycle: ambush marks Holes, split attacks, Nausea lands before next Holes', () => {
  const g = arena(true), b = g.s.battle, e = b.enemies[0];
  assert.ok(g.s.log.some(line => line.includes('Dazzle') && line.includes('20 Light')));
  assert.equal(e.corruptionPlan.length, 2);
  assert.ok(e.corruptionPlan.every(p => p.kind === 'hole'));
  resolve(g);
  assert.equal(g.s.hp, 9980);
  round(g); // Anti-elemental lands Holes and commits H.
  assert.equal(g.s.hp, 9960);
  assert.equal(Object.values(b.corruptions).filter(q => q.kind === 'hole').length, 2);
  assert.equal(e.phasePlan.axis, 'H');
  for (const slot of [14, 15, 16]) put(g, slot);
  const line = e.phasePlan.line;
  const r = new Game(0, structuredClone(g.s));
  assert.equal(r.s.battle.enemies[0].phasePlan.line, line);
  round(g); // H
  assert.equal(g.s.hp, 9946);
  assert.ok(e.corruptionPlan.every(p => p.kind === 'hypnosis'));
  round(g); // False face and Hypnosis; damage may include forced cards.
  assert.equal(Object.values(b.corruptions).filter(q => q.kind === 'hypnosis').length, 2);
  assert.equal(e.phasePlan.axis, 'V');
  round(g); // V marks Nausea.
  const nausea = structuredClone(e.corruptionPlan);
  assert.equal(nausea.length, 2);
  assert.ok(nausea.every(p => p.kind === 'nausea'));
  round(g); // Dazzle must not overwrite the old warning before applying it.
  for (const p of nausea) assert.equal(b.corruptions[p.slot].kind, 'nausea');
  assert.equal(e.corruptionPlan.length, 2);
  assert.ok(e.corruptionPlan.every(p => p.kind === 'hole'));
});

test('Trickster damage escalates per completed cycle and Restless, never from half HP or S2 multiplier', () => {
  const g = arena(), e = g.s.battle.enemies[0];
  assert.equal(e.hp, 264);
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let step = 0; step < 5; step++) {
      e.cycle = cycle * 5 + step;
      e.hp = 30;
      e.restless = 2;
      const t = g.tell(e);
      if (t.sequence) assert.deepEqual(t.sequence.map(h => h.damage), [9 + cycle, 9 + cycle]);
      else assert.equal(t.damage, 22 + 2 * cycle);
    }
  }
  e.cycle = 2; e.restless = 0;
  assert.deepEqual(g.tell(e).sequence.map(h => h.element), ['Chaos', 'Light']);
  e.cycle = 4;
  assert.deepEqual(g.tell(e).sequence.map(h => h.element), ['Light', 'Chaos']);
});

test('Four-Hole threshold is strictly below 60 and never adds untelegraphed Holes', () => {
  for (const hp of [60, 59]) {
    const g = arena(), e = g.s.battle.enemies[0];
    e.hp = hp;
    round(g); // Dazzle selects and stores actual spaces.
    const count = hp < 60 ? 4 : 2;
    assert.equal(e.corruptionPlan.length, count);
    e.hp = 1;
    const r = new Game(0, structuredClone(g.s));
    round(r);
    assert.equal(Object.values(r.s.battle.corruptions).filter(q => q.kind === 'hole').length, count);
  }
});

test('Trickster may fill all 42 spaces, never overwrites existing or other owners pending warnings', () => {
  const g = arena(), b = g.s.battle, e = b.enemies[0];
  for (let i = 0; i < 39; i++) b.corruptions[i] = { kind: 'hole', source: e.uid };
  b.enemies.push({ ...structuredClone(e), uid: 901, corruptionPlan: [{ slot: 40, kind: 'nausea' }] });
  prepareCorruption(g, e, { markCorruption: 'hole', count: 4 });
  assert.deepEqual(e.corruptionPlan.map(p => p.slot).sort(), [39, 41]);
  applyCorruptions(g, e);
  b.enemies.pop();
  prepareCorruption(g, e, { markCorruption: 'hole', count: 4 });
  assert.deepEqual(e.corruptionPlan, [{ slot: 40, kind: 'hole' }]);
  applyCorruptions(g, e);
  assert.equal(Object.keys(b.corruptions).length, 42);
  prepareCorruption(g, e, { markCorruption: 'hole', count: 4 });
  assert.deepEqual(e.corruptionPlan, []);
});

test('Old rotation migration preserves pending spaces, HP, RNG and raises the old eight-space cap', () => {
  const g = arena(), e = g.s.battle.enemies[0];
  e.rotation = [ { name: 'False face' }, { name: 'Dazzle' }, { name: 'Phase disruption H' }, { name: 'Anti-elemental' }, { name: 'Phase disruption V' } ];
  e.cycle = 3; e.corruptionCap = 8; e.hp = 78;
  e.corruptionPlan = [{ slot: 9, kind: 'hole' }, { slot: 19, kind: 'hole' }];
  const saved = structuredClone(g.s), r = new Game(0, saved), z = r.s.battle.enemies[0];
  assert.equal(z.cycle, 1); assert.equal(z.hp, 78); assert.equal(z.corruptionCap, 42);
  assert.deepEqual(z.corruptionPlan, e.corruptionPlan);
  assert.deepEqual(z.rotation, enemies.trickster.rotation);
  assert.equal(r.s.rng, saved.rng);
});
