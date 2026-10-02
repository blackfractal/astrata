// Profile progress is separate from normal run saves and normal Stratum victories.
function recordTutorial(
  stats,
  state,
  event,
  runId,
  now = new Date().toISOString(),
) {
  if (!state?.tutorial || !runId) return stats;
  const result = structuredClone(stats || {}),
    id = state.tutorial.id;
  const t = (result[id] ||= {
    starts: [],
    completions: [],
    firstCompletedAt: null,
  });
  if (event === "start" && !t.starts.some((x) => x.runId === runId))
    t.starts.push({ runId, at: now, version: state.tutorial.version });
  if (
    event === "complete" &&
    state.tutorial.completed &&
    state.outcome === "win" &&
    !t.completions.some((x) => x.runId === runId)
  ) {
    t.completions.push({ runId, at: now, version: state.tutorial.version });
    t.firstCompletedAt ||= now;
  }
  return result;
}
module.exports = { recordTutorial };
