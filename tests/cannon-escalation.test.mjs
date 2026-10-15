import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { ELEMENTS } from '../src/content.mjs';

function arena() {
  const g = new Game(731);
  g.s.stratum = 3;
  g.s.equipment = {};
  g.s.hp = g.s.maxHp = 10000;
  g.beginBattle([{ uid: 900, enemy: 'refractionCannon', restless: 0 }]);
  delete g.s.checkpoint;
  g.s.battle.grid = Array.from({ length: 42 }, () => []);
  g.capturePresentation = true;
  return g;
}

test('ordinary Cannon attacks escalate 14, 7+7, 16, 8+8 across Final Blast turns', () => {
  const g = arena(), b = g.s.battle, e = b.enemies[0];
  let ordinary = 0;
  for (let turn = 1; turn <= 16; turn++) {
    b.ideons = []; b.corruptions = {};
    const tell = g.tell(e), hp = g.s.hp;
    g.presentation = [];
    if (!tell.finalBlast) {
      const hits = tell.sequence || [{ damage: tell.damage, element: tell.element }];
      const total = 14 + 2 * Math.floor(ordinary / 2);
      assert.deepEqual(hits.map(h => h.damage), ordinary % 2 ? [total / 2, total / 2] : [total]);
      if (hits.length === 2) assert.notEqual(hits[0].element, hits[1].element);
      for (const hit of hits) assert.ok(ELEMENTS.includes(hit.element));
      g.endTurn();
      assert.equal(hp - g.s.hp, total);
      assert.deepEqual(g.presentation.filter(f => f.kind === 'incoming').map(f => [f.amount, f.element]),
        hits.map(h => [h.damage, h.element]));
      ordinary++;
    } else g.endTurn();
  }
});

test('mixed elemental intent is stable, counters its first element and survives Continue', () => {
  const g = arena(), b = g.s.battle, e = b.enemies[0];
  e.cycle = 1;
  b.grid[20] = [g.instance(g.newCard('grove'))];
  const before = JSON.stringify(g.s), tell = g.tell(e);
  assert.deepEqual(tell.sequence, [{ damage: 7, element: 'Fire' }, { damage: 7, element: 'Water' }]);
  for (let n = 0; n < 5; n++) assert.deepEqual(g.tell(e), tell);
  assert.equal(JSON.stringify(g.s), before);
  const loaded = new Game(0, JSON.parse(before));
  assert.deepEqual(loaded.tell(loaded.s.battle.enemies[0]), tell);
});

test('Final Blast warning and pending intent escalate, including old saved pending blasts', () => {
  for (const [completed, expected] of [[3, 40], [8, 50], [13, 60], [18, 70]]) {
    const g = arena(), b = g.s.battle, e = b.enemies[0];
    e.cannonTurns = completed;
    assert.match(g.tell(e).name, new RegExp(`\\(${expected} damage\\)`));
    g.endTurn();
    assert.equal(g.tell(e).damage, expected);
    assert.ok(g.presentation.some(f => f.kind === 'status' && f.name.includes(`Next move: ${expected} `)));
    const loaded = new Game(0, structuredClone(g.s));
    const owner = loaded.s.battle.enemies[0];
    assert.equal(loaded.tell(owner).damage, expected);
    loaded.s.battle.corruptions = {};
    const hp = loaded.s.hp;
    loaded.endTurn();
    assert.equal(hp - loaded.s.hp, expected);
  }
});

test('Purify preserves ordinary alternation; explicitly scaled attacks ignore half-HP and Restless bonuses', () => {
  const g = arena(), b = g.s.battle, e = b.enemies[0];
  e.cycle = 7; e.cannonTurns = 6; e.purifyPending = true;
  e.hp = 1; e.restless = 10; e.buff = 20;
  assert.equal(g.tell(e).name, 'Purify');
  g.endTurn();
  assert.equal(e.cycle, 7);
  assert.deepEqual(g.tell(e).sequence.map(h => h.damage), [10, 10]);
  b.ideons = []; b.corruptions = {};
  const hp = g.s.hp;
  g.endTurn();
  assert.equal(hp - g.s.hp, 20);
  assert.equal(g.tell(e).damage, 22);
});
