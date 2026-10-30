import { reportPath } from './artifact-paths.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const dir = 'snapshots/codex-hive-3.0.11';
await fs.mkdir(reportPath(dir), { recursive: true });
const r = JSON.parse(await fs.readFile(dir + '/attempt.json', 'utf8'));
const sources = JSON.parse(await fs.readFile(dir + '/sources.json', 'utf8'));
const cache = path.resolve('.tmp/codex-hive-replay-3.0.11');
await fs.mkdir(cache, {recursive: true});
for (const [name, source] of Object.entries(sources)) {
  assert.equal(path.basename(name), name);
  await fs.writeFile(path.join(cache, name), source);
}
const {Game} = await import(pathToFileURL(path.join(cache, 'engine.mjs')));
const {VERSION} = await import(pathToFileURL(path.join(cache, 'content.mjs')));
const g = new Game(0, structuredClone(r.initial));
delete g.s.checkpoint;
let minimumHp = g.s.hp, healed = 0;
const damageByTurn = {};
for (const [i, d] of r.decisions.entries()) {
  assert.ok(g.legal().some(a => a.key === d.action.key), 'Illegal decision ' + i);
  const hp = g.s.hp, turn = g.s.battle.turn;
  g.act(d.action.key);
  minimumHp = Math.min(minimumHp, g.s.hp);
  healed += Math.max(0, g.s.hp - hp);
  damageByTurn[turn] = (damageByTurn[turn] || 0) + Math.max(0, hp - g.s.hp);
}
const final = new Game(0, structuredClone(r.state));
delete final.s.checkpoint;
assert.deepEqual(g.observe(), final.observe());
assert.equal(g.s.mode, 'reward');
assert.equal(g.s.hp, 16);
assert.equal(healed, 0);
const result = {
  version: VERSION, fixture: 'stratum3-developed-foundation-v1', seed: 73001,
  controller: 'Codex-directed legal decisions, with explicit one-damage defense-reservation helper; no built-in policy or search',
  outcome: 'victory', startingHp: r.initial.hp, hp: g.s.hp, minimumHp,
  hpLost: r.initial.hp - g.s.hp, healed, turn: g.s.battle.turn,
  decisions: r.decisions.length, rewinds: 0, replayVerified: true,
  openingLarvae: r.initial.battle.ideons.filter(e => e.kind === 'larva').length,
  delayedOpeningBonusTested: false,
  damageByTurn,
  damageTaken: g.s.stats.damageTaken,
  sourcesSha256: crypto.createHash('sha256').update(JSON.stringify(sources)).digest('hex'),
};
await fs.writeFile(dir + '/winning-line.json', JSON.stringify({result, initial: r.initial, decisions: r.decisions.map(d => d.action.key), final: g.s}, null, 2));
await fs.writeFile(reportPath(dir + '/verification.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
