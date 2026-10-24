import { _electron as electron, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.mjs';
import { events } from '../src/content.mjs';
import { unavailableTavernChoices } from '../src/choice-feedback.mjs';
const root = path.resolve(import.meta.dirname, '..');
const report = path.join(root, 'reports/choice-feedback');
await fs.mkdir(report, { recursive: true });
const results = [];
for (const fixture of ['event-poor', 'event-affordable', 'event-trade', 'tavern-poor']) {
  const g = new Game(42);
  g.s.gold = fixture === 'event-affordable' ? 100 : 24;
  g.s.hp = 18;
  g.s.stratum = 3;
  if (fixture === 'tavern-poor') {
    g.openTavern(); g.s.shop.afterStratum = 2; g.s.shop.healer = true;
    g.s.shop.hexPrice = {kind: 'gold', gold: 50, hp: 0};
    g.addCard('rust'); g.addItem('curseRing');
  } else {
    g.s.mode = 'event';
    g.s.event = fixture === 'event-trade' ? events.find(e => e.choices.some(c => c.trade?.slot === 'wrist')).id : 'depthsCache';
    if (fixture === 'event-trade') {g.s.inventory = []; g.s.equipment = {};}
  }
  const profile = path.join(root, '.tmp/choice-ui-' + fixture + '-' + Date.now());
  await fs.mkdir(profile, { recursive: true });
  await fs.writeFile(path.join(profile, 'save.json'), JSON.stringify(g.s));
  await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({width: 1280, fast: true}));
  const app = await electron.launch({executablePath: path.join(root, 'release/Astrata/Astrata.exe'), args: ['--user-data-dir=' + profile], cwd: profile, timeout: 20000});
  const errors = [];
  try {
    const p = await app.firstWindow(); p.on('pageerror', e => errors.push(e.message));
    await p.locator('[data-ui="continue"]').click();
    if (fixture === 'tavern-poor') {
      await p.locator('[data-tavern="rest"]').click();
      await expect(p.locator('.service-content button').filter({hasText: 'Rest'})).toBeDisabled();
      await expect(p.locator('.service-content')).toContainText("You don't have enough gold.");
      await p.screenshot({path: path.join(report, 'rest.png')});
      await p.locator('[data-tavern="healer"]').click();
      await expect(p.locator('.service-content .unavailable-choice')).toHaveCount(2);
      await expect(p.locator('.service-content')).not.toContainText('No eligible or affordable');
      for (const b of await p.locator('.service-content .unavailable-choice').all()) {
        await expect(b).toBeDisabled(); await expect(b).toContainText("You don't have enough gold.");
      }
    } else if (fixture === 'event-trade') {
      await expect(p.locator('.scene-copy .unavailable-choice')).toContainText("You don't have a matching Bracelet to trade.");
    } else {
      const buy = p.locator('.scene-copy button').filter({hasText: 'Buy Lucid Needle'});
      if (fixture === 'event-poor') {
        await expect(buy).toBeDisabled(); await expect(buy).toContainText("You don't have enough gold.");
      } else await expect(buy).toBeEnabled();
      await expect(p.locator('.scene-copy button').filter({hasText: 'Keep walking'})).toBeEnabled();
    }
    await p.screenshot({path: path.join(report, fixture + '.png')});
    assert.deepEqual(errors, []); results.push({fixture, passed: true, errors});
  } finally { await app.close(); }
}
// Check alternate explanations against actual engine legality, without altering a live save.
const g = new Game(3); g.openTavern(); g.s.gold = 0;
g.s.hp = g.s.maxHp;
assert.match(unavailableTavernChoices(g.observe(), 'heal', g.legal())[0].reason, /health is already full/);
g.s.shop.healUsed = true;
assert.match(unavailableTavernChoices(g.observe(), 'heal', g.legal())[0].reason, /already rested/);
g.addCard('rust'); g.s.shop.healer = false;
assert.match(unavailableTavernChoices(g.observe(), 'removeHex', g.legal())[0].reason, /No healer/);
g.s.shop.healer = true; g.s.shop.hexPrice = {kind:'allyGold', gold:0, hp:0};
g.s.deck = g.s.deck.filter(c => c.id === 'rust');
assert.match(unavailableTavernChoices(g.observe(), 'removeHex', g.legal())[0].reason, /Ally card/);
g.s.shop.hexPrice = {kind:'item', gold:0, hp:0}; g.s.inventory = [];
assert.match(unavailableTavernChoices(g.observe(), 'removeHex', g.legal())[0].reason, /uncursed item/);
g.s.shop.hexPrice = {kind:'hp', gold:0, hp:g.s.hp};
assert.match(unavailableTavernChoices(g.observe(), 'removeHex', g.legal())[0].reason, /enough HP/);
results.push({fixture:'alternate-service-reasons', passed:true});
await fs.writeFile(path.join(report, 'ui-verification.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
