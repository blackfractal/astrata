import { _electron as electron, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
const root = path.resolve(import.meta.dirname, '..');
const report = path.join(root, 'reports/trickster-rework');
const original = JSON.parse(await fs.readFile(path.join(report, 'restored-save.json'), 'utf8'));
const results = [];
for (const fixture of ['opening', 'shift']) {
  let state = structuredClone(original);
  if (fixture === 'shift') {
    const g = new Game(0, state), b = g.s.battle, e = b.enemies[0];
    b.phase = 'place'; b.reaction = null; b.jobs = []; b.turn = 3;
    e.cycle = 2; e.corruptionPlan = []; delete e.phasePlan;
    b.grid[5] = [g.instance(g.newCard('blast'))];
    b.grid[6] = [g.instance(g.newCard('shield'))];
    state = g.s; delete state.checkpoint;
  }
  const profile = path.join(root, '.tmp/trickster-ui-' + fixture + '-' + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, 'save.json'), JSON.stringify(state));
  await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ width: 1280, fast: true }));
  const app = await electron.launch({ executablePath: path.join(root, 'release/Astrata/Astrata.exe'),
    args: ['--user-data-dir=' + profile], cwd: profile, timeout: 20000 });
  const errors = [];
  try {
    const p = await app.firstWindow(); p.on('pageerror', e => errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    await expect(p.locator('[data-slot]')).toHaveCount(42);
    await expect(p.locator('[data-enemy-uid="163"]').first()).toContainText('The Trickster');
    const body = await p.locator('body').innerText();
    assert.ok(body.includes(fixture === 'opening' ? 'Dazzle' : 'Phase disruption H'));
    if (fixture === 'shift') { assert.ok(body.includes('7 Chaos')); assert.ok(body.includes('7 Light')); }
    await p.screenshot({ path: path.join(report, 'ui-' + fixture + '.png') });
    assert.deepEqual(errors, []); results.push({ fixture, passed: true, errors });
  } finally { await app.close(); }
}
await fs.writeFile(path.join(report, 'ui-verification.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
