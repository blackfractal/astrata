import { chromium, expect } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';

const root = path.resolve(import.meta.dirname, '..');
const profile = path.join(root, '.tmp', 'consumable-feedback-' + Date.now());
const report = path.join(root, 'reports', 'unlimited-consumables-ui');
await fs.mkdir(profile, { recursive: true });
await fs.mkdir(report, { recursive: true });
const g = new Game(714);
g.s.inventory = [];
for (const k of Object.keys(g.s.equipment)) g.s.equipment[k] = null;
const bottles = ['healingSap', 'healingSap', 'antidote', 'cindersalve', 'sealedBreath', 'channelDraught'].map(id => g.addItem(id));
g.beginBattle([{ uid: g.uid(), enemy: 'hart', restless: 0 }]);
// The fixture needs only a real pending defense choice, not a particular enemy definition.
g.s.hp = 40;
g.s.status.burn = 4;
g.s.battle.phase = 'enemy';
g.s.battle.jobs = [];
g.s.battle.reaction = { damage: 5, element: 'Fire', stage: 'bracelet', column: -1, intercepted: [], name: 'Pending fire attack', source: g.s.battle.enemies[0].uid, burn: 2 };
delete g.s.checkpoint;
await fs.writeFile(path.join(profile, 'save.json'), JSON.stringify(g.s));
await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ width: 1280, fast: true }));
const webroot = path.join(root, 'release/Astrata/resources/app');
const server = http.createServer(async (req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(webroot, '.' + (rel === '/' ? '/index.html' : rel));
  if (!file.startsWith(webroot + path.sep)) { res.writeHead(403).end(); return; }
  try {
    const types = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const app = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const errors = [];
try {
  const p = await app.newPage({ viewport: { width: 1440, height: 810 } });
  await p.addInitScript(state => localStorage.setItem('astrata', JSON.stringify({ save: state, history: [], settings: { width: 1440, fast: true } })), g.s);
  p.on('pageerror', e => errors.push(e.message));
  await p.goto(`http://127.0.0.1:${server.address().port}/`);
  await p.locator('[data-ui="continue"]').click();
  const button = x => p.locator(`[data-consumable-uid="${x.uid}"] .consumable-use`);
  await expect(button(bottles[2])).toBeDisabled();
  await expect(button(bottles[2])).toHaveAttribute('data-tooltip', 'No Poison to remove.');
  await expect(button(bottles[5])).toBeDisabled();
  for (const x of [bottles[0], bottles[1], bottles[3], bottles[4]]) {
    await expect(button(x)).toBeEnabled();
    await button(x).click();
    await expect(p.locator(`[data-consumable-uid="${x.uid}"]`)).toHaveCount(0);
  }
  const saved = await p.evaluate(() => {
    const key = Object.keys(localStorage).find(k => k.startsWith('astrata-run-'));
    return JSON.parse(localStorage.getItem(key)).at(-1).state;
  });
  assert.equal(saved.hp, 50);
  assert.equal(saved.status.burn, 0);
  assert.equal(saved.battle.reaction.damage, 5);
  assert.equal(saved.battle.reaction.name, 'Pending fire attack');
  assert.ok(saved.battle.statusProtection >= saved.battle.turn);
  assert.equal(saved.stats.consumablesUsed.length, 4);
  assert.deepEqual(errors, []);
  await p.screenshot({ path: path.join(report, 'pending-attack-after-four-supplies.png') });
  await fs.writeFile(path.join(report, 'verification.json'), JSON.stringify({ passed: true, version: '4.0.21', healingUses: 2, totalUses: 4, pendingAttackPreserved: true, noPoisonTooltip: true, errors }, null, 2));
  console.log('Packaged UI: four defensive supplies used during one pending attack; no-Poison tooltip and phase restriction verified.');
} finally { await app.close(); await new Promise(resolve => server.close(resolve)); }
