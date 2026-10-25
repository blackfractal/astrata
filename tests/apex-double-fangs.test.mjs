import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';

test('Rending Fangs resolves two Fire hits, applies Nausea, and leaves Constructs intact', () => {
  const g = new Game(1902);
  g.s.equipment = {};
  g.beginBattle([{ uid: 900, enemy: 'apex', restless: 0 }]);
  const b = g.s.battle, e = b.enemies[0];
  g.s.hp = g.s.maxHp = 1000;
  e.cycle = 1;
  b.phase = 'activate';
  b.grid[10] = [g.instance(g.newCard('plasma'))];
  e.corruptionPlan = [{ slot: 9, kind: 'nausea' }];
  const uid = b.grid[10][0].uid;
  assert.equal(g.tell(e).grid, undefined);
  assert.equal(g.tell(e).commandIdeons, true);
  assert.equal(g.gridTelegraphs().length, 0);
  g.endTurn();
  assert.equal(g.s.hp, 968);
  assert.equal(b.destroyed.length, 0);
  assert.equal(b.grid[10][0].uid, uid);
  assert.equal(b.corruptions[9].kind, 'nausea');
  assert.equal(e.cycle, 2);
});

test('Both Fangs hits scale independently with full cycles and the half-health threshold', () => {
  const g = new Game(1902);
  g.beginBattle([{ uid: 900, enemy: 'apex', restless: 0 }]);
  const e = g.s.battle.enemies[0];
  for (const [cycle, hp, damage] of [[1, 500, 16], [7, 500, 19], [7, 250, 23], [13, 250, 26]]) {
    e.cycle = cycle; e.hp = hp;
    assert.deepEqual(g.tell(e).sequence, [{ damage, element: 'Fire' }, { damage, element: 'Fire' }]);
  }
});
