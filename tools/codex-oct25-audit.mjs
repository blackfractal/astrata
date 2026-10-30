import { reportPath } from './artifact-paths.mjs';
// Replay only the recorded human-model decisions; no policy or new decisions.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
for (const seed of [24102501, 24102502]) {
  const dir = `snapshots/codex-growth-manual-${seed}`;
  fs.mkdirSync(reportPath(dir), {recursive:true});
  const frozen = path.resolve(`.tmp/manual-audit-${seed}/src`);
  fs.mkdirSync(frozen, {recursive:true});
  const sources = JSON.parse(fs.readFileSync(`${dir}/sources.json`, 'utf8'));
  for (const [name, source] of Object.entries(sources)) fs.writeFileSync(path.join(frozen, name), source);
  const {Game} = await import(pathToFileURL(path.join(frozen, 'engine.mjs')).href);
  const game = new Game(0, JSON.parse(fs.readFileSync(`${dir}/initial.json`, 'utf8')));
  const rows = fs.readFileSync(`${dir}/decisions.jsonl`, 'utf8').trim().split('\n').map(JSON.parse);
  for (const row of rows) {
    assert.equal(game.s.steps, row.before.step);
    const legal = game.legal().find(a => a.key === row.action.key);
    assert.ok(legal, `Illegal recorded action at ${row.before.step}: ${row.action.label}`);
    game.act(legal);
    assert.equal(game.s.steps, row.after.step);
    assert.equal(game.s.hp, row.after.hp);
    assert.equal(game.s.gold, row.after.gold);
    assert.equal(game.s.mode, row.after.mode);
  }
  const expected = JSON.parse(fs.readFileSync(`${dir}/current.json`, 'utf8'));
  assert.deepEqual(JSON.parse(JSON.stringify(game.s)), expected);
  const audit = {
    seed, version:game.s.version, legalActions:rows.length,
    everyCheckpointMatched:true, exactFinalStateMatched:true,
    outcome:game.s.outcome, hp:game.s.hp, steps:game.s.steps,
    encounters:game.s.stats.encounters,
    supplies:game.s.stats.consumablesUsed,
  };
  fs.writeFileSync(reportPath(`${dir}/replay-audit.json`), JSON.stringify(audit, null, 2));
  console.log(JSON.stringify({seed, actions:rows.length, exactFinalStateMatched:true, outcome:game.s.outcome, hp:game.s.hp}));
}
