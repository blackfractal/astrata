import { reportPath } from '../../tools/artifact-paths.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const variant = process.argv[2];
if (!['baseline', 'revised'].includes(variant)) throw Error('Choose baseline or revised');
const { Game } = await import(`../../snapshots/apex-unmake-4.0.18/${variant}/rules/engine.mjs`);
const { enemies } = await import(`../../snapshots/apex-unmake-4.0.18/${variant}/rules/content.mjs`);
const { activate, defend, setConfig } = await import(`./${variant}/search.mjs`);
const { planPlace, configure } = await import(`./${variant}/placement.mjs`);
assert.equal(enemies.apex.rotation[1].count, variant === 'baseline' ? 2 : 1);
assert.equal(enemies.apex.rotation[5].count, 2);
assert.equal(enemies.apex.rotation[3].alternateUnmake, true);
const trial = process.argv[3] || variant;
if (!/^[a-z-]+$/.test(trial)) throw Error('Invalid trial label');
const dir = `snapshots/apex-unmake-4.0.18/${trial}`;
fs.mkdirSync(dir, {recursive:true});fs.mkdirSync(reportPath(dir), {recursive:true});
const initial = JSON.parse(fs.readFileSync('snapshots/apex-unmake-4.0.18/initial.json'));
const cfg = process.argv[4] ? JSON.parse(process.argv[4]) : { hp: 3, keep: 1.5, guard: 1.5, titan: 1.5, draw: 2, insanity: 10 };
setConfig(cfg); configure(cfg);
let g = new Game(0, structuredClone(initial));
const actions = [], turns = [];
while (g.s.mode === 'battle' && g.s.hp > 0 && g.s.battle.turn < 45) {
  const turn = g.s.battle.turn;
  if (g.s.battle.reaction) { const r = defend(g); g = r.g; actions.push(...r.actions); }
  if (g.s.mode !== 'battle') break;
  if (g.s.battle.phase === 'place') actions.push(...planPlace(g));
  if (g.s.mode !== 'battle') break;
  const r = activate(g);
  if (!r) throw Error('No continuation');
  g = r.g; actions.push(...r.actions);
  const row = { turn, hp: g.s.hp, boss: g.s.battle.enemies[0].hp, destroyed: g.s.battle.destroyed.length, actions: actions.length };
  turns.push(row); console.log(JSON.stringify({ variant, ...row }));
  fs.writeFileSync(dir + '/progress.json', JSON.stringify({ actions, turns, state: g.s }));
  if (g.s.mode === 'battle' && g.s.battle.turn === turn) throw Error('Stalled');
}
const replay = new Game(0, structuredClone(initial));
for (const [i, wanted] of actions.entries()) {
  const a = replay.legal().find(a => a.key === wanted.key);
  assert.ok(a, `Illegal action ${i}`);
  replay.act(a);
}
for (const key of ['hp', 'mode', 'rng', 'battle', 'inventory', 'equipment']) assert.deepEqual(replay.s[key], g.s[key], key);
const summary = { variant, trial, cfg, win: g.s.hp > 0 && g.s.battle.enemies.every(e => e.hp <= 0), terminal: g.s.mode !== 'battle', hp: g.s.hp, boss: g.s.battle.enemies[0].hp, turn: g.s.battle.turn, destroyed: g.s.battle.destroyed.length, actions: actions.length, death: g.s.death, replayVerified: true };
fs.writeFileSync(dir + '/trial.json', JSON.stringify({ summary, actions, turns, final: g.s }));
fs.writeFileSync(reportPath(dir + '/summary.json'), JSON.stringify(summary, null, 2));
fs.writeFileSync(dir + '/rules-manifest.json', JSON.stringify(Object.fromEntries(fs.readdirSync(`snapshots/apex-unmake-4.0.18/${variant}/rules`).map(n => [n, createHash('sha256').update(fs.readFileSync(`snapshots/apex-unmake-4.0.18/${variant}/rules/` + n)).digest('hex')])), null, 2));
console.log('RESULT ' + JSON.stringify(summary));
