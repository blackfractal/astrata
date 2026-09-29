// Separate audit data from the player's observation and battle-restart checkpoint.
export function runRecord(game, runId, kind, detail = {}) {
  const { checkpoint, history, log, uiMeta, ...state } = game.s;
  return structuredClone({
    runId,
    kind,
    ...detail,
    state,
    messages: kind === "decision" ? game.decisionLog || [] : log,
    effects:
      kind === "decision"
        ? (game.presentation || []).map(({ state, ...effect }) => effect)
        : [],
  });
}
