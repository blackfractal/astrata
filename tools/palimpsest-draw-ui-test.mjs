import { _electron as electron, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';

const g = new Game(737);
g.s.inventory = [];
g.s.equipment = {};
g.beginBattle([{ uid: g.uid(), enemy: 'beetle', restless: 0 }]);
const b = g.s.battle;
b.hand = [];
b.deck = ['palimpsest', 'palimpsest', 'blast'].map(id => g.newCard(id));
b.drawTop = b.deck.map(c => c.uid);
b.discard = [];
g.addItem('insightDew');
delete g.s.checkpoint;
const profile = path.resolve('.tmp/palimpsest-draw-ui-' + Date.now());
await fs.mkdir(profile, { recursive: true });
await fs.writeFile(path.join(profile, 'save.json'), JSON.stringify(g.s));
await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ width: 1280, fast: false }));
const app = await electron.launch({ executablePath: path.resolve('release/Astrata/Astrata.exe'), args: ['--user-data-dir=' + profile], cwd: profile, timeout: 20000 });
const errors = [];
try {
  const p = await app.firstWindow();
  p.setDefaultTimeout(10000);
  p.on('pageerror', e => errors.push(e.message));
  await p.locator('[data-ui="continue"]').click();
  await expect(p.locator('.revealed-hand [data-hand]')).toHaveCount(0);
  await p.locator('.consumable-use').click();
  const hand = p.locator('.revealed-hand [data-hand]');
  await expect(hand).toHaveCount(3);
  await expect(p.locator('.revealed-hand .face-down')).toHaveCount(0);
  await expect(hand.nth(0)).toContainText('When drawn');
  await expect(hand.nth(1)).toContainText('Palimpsest');
  await expect(hand.nth(2)).toContainText('Blast');
  for (let i = 0; i < 3; i++) await expect(hand.nth(i)).toBeVisible();
  assert.deepEqual(errors, []);
  await fs.writeFile('reports/palimpsest-draw-ui.json', JSON.stringify({ version: '4.0.16', passed: true, isolatedProfile: true, chainCardsVisible: 3, descriptionUpdated: true, rendererErrors: errors }, null, 2));
} finally {
  await app.close();
}
