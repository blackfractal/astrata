// Verification only: replays recorded manual actions; never chooses new actions.
import fs from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { Game } from '../snapshots/manual-five-20261111/src/engine.mjs';
const root = 'snapshots/manual-five-20261111';
const out = 'reports/manual-five-20261111';
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const records = id => fs.readFileSync(`${root}/${id}/decisions.jsonl`, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const ids = fs.readdirSync(root).filter(id => /^[1-5](?:-r\d+)?$/.test(id));
const validation = [];
for (const id of ids) {
  const initial = read(`${root}/${id}/initial.json`);
  const g = new Game(0, initial);
  const rows = records(id);
  let failure = null;
  for (const [i, row] of rows.entries()) {
    const action = g.legal().find(a => a.key === row.action.key);
    if (!action) { failure = { index: i, reason: 'illegal action', key: row.action.key }; break; }
    g.act(action);
    const actual = {step:g.s.steps,mode:g.s.mode,hp:g.s.hp,gold:g.s.gold};
    if (JSON.stringify(actual) !== JSON.stringify(row.after)) {
      failure = { index:i, reason:'outcome mismatch', actual, expected:row.after }; break;
    }
  }
  const current = read(`${root}/${id}/current.json`);
  const exact = !failure && isDeepStrictEqual(JSON.parse(JSON.stringify(g.s)), current);
  const actualState = JSON.parse(JSON.stringify(g.s));
  const differingTopLevelFields = [...new Set([...Object.keys(actualState),...Object.keys(current)])].filter(k=>!isDeepStrictEqual(actualState[k],current[k]));
  // Loading a battle in this engine replaces checkpoint with a clone of the loaded
  // state. The CLI loads between batches; continuous replay does not. No retry
  // action is used, so compare this derived resume metadata separately.
  const gameplayStateMatches = !failure && differingTopLevelFields.every(k=>k==='checkpoint');
  let fork = null, forkExact = null;
  if (fs.existsSync(`${root}/${id}/fork.json`)) {
    fork = read(`${root}/${id}/fork.json`);
    const parent = new Game(0, read(`${root}/${fork.source}/initial.json`));
    for (const row of records(fork.source)) {
      if (parent.s.steps === fork.step) break;
      const a = parent.legal().find(a => a.key === row.action.key);
      if (!a) throw Error(`Invalid parent prefix ${id}`);
      parent.act(a);
    }
    forkExact = parent.s.steps === fork.step && JSON.stringify(parent.s) === JSON.stringify(read(`${root}/${id}/initial.json`));
  }
  validation.push({id,actions:rows.length,allActionsAndOutcomesMatch:!failure,exactCurrentState:exact,gameplayStateMatches,differingTopLevelFields,forkMatchesParent:forkExact,fork,failure});
}
function fullTrace(id) {
  const fp = `${root}/${id}/fork.json`;
  if (!fs.existsSync(fp)) return records(id);
  const fork = read(fp);
  return [...fullTrace(fork.source).filter(r => r.after.step <= fork.step), ...records(id)];
}
const selected = ['1-r1','2-r3','3-r1','4-r3','5-r6'];
const runs = selected.map(id => {
  const s = read(`${root}/${id}/final.json`), trace = fullTrace(id);
  const full = new Game(0,read(`${root}/${id[0]}/initial.json`));
  for (const r of trace) {
    const a=full.legal().find(a=>a.key===r.action.key);
    if(!a)throw Error(`Illegal complete-line action ${id}:${r.before.step}`);
    full.act(a);
    if(full.s.hp!==r.after.hp || full.s.steps!==r.after.step || full.s.gold!==r.after.gold || full.s.mode!==r.after.mode)throw Error(`Complete-line outcome mismatch ${id}:${r.before.step}`);
  }
  const completeFinalExactlyMatches=isDeepStrictEqual(JSON.parse(JSON.stringify(full.s)),s);
  const fights = [];
  let fight = null;
  for (const r of trace) {
    if (r.before.mode === 'battle' && !fight) fight = {startStep:r.before.step,observedHPDecreases:0,observedHPIncreases:0,actions:0};
    if (fight && r.before.mode === 'battle') {
      fight.actions++;
      const delta = r.after.hp - r.before.hp;
      if (delta < 0) fight.observedHPDecreases -= delta;
      else fight.observedHPIncreases += delta;
      if (r.after.mode !== 'battle') { fight.endStep = r.after.step; fights.push(fight); fight = null; }
    }
  }
  const encounters = s.stats.encounters.map((e,i) => ({...e,trace:fights[i] || null}));
  return {id,seed:s.seed,version:s.version,outcome:s.outcome,stratum:s.stratum,hp:s.hp,maxHp:s.maxHp,steps:s.steps,completeTraceActions:trace.length,completeFinalExactlyMatches,
    death:s.death,remainingEnemies:s.battle?.enemies.map(e=>({name:e.name,hp:e.hp})),encounters,
    purchases:s.stats.purchases,sales:s.stats.sales,consumables:s.stats.consumablesUsed,
    deck:s.deck,inventory:s.inventory,equipment:s.equipment,
    traceEncounterCount:fights.length,recordedEncounterCount:encounters.length};
});
const evidence = {version:read(`${root}/protocol.json`).version,protocol:'Five original seeds, selected local public-information corrections; manual legal decisions; no tuning or hidden-state search.',
  validation,runs};
fs.writeFileSync(`${out}/replay-evidence.json`, JSON.stringify(evidence,null,2)+'\n');
const failures = validation.filter(v => !v.allActionsAndOutcomesMatch || !v.gameplayStateMatches || v.forkMatchesParent === false);
console.log(JSON.stringify({branches:validation.length,actionsVerified:validation.reduce((n,v)=>n+v.actions,0),failures,
  runs:runs.map(r=>({id:r.id,outcome:r.outcome,hp:r.hp,stratum:r.stratum,actions:r.completeTraceActions,completeFinalExactlyMatches:r.completeFinalExactlyMatches,encounters:r.recordedEncounterCount,traceEncounters:r.traceEncounterCount,last:r.encounters.at(-1)}))},null,2));
if (failures.length || runs.some(r=>!r.completeFinalExactlyMatches)) process.exitCode = 1;
