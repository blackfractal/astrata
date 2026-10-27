# Apex Predator rebuilding window — 4.0.17

Jonathan approved reducing Rending Fangs from two destroyed Constructs to one. World Eater still destroys two; Unmake still destroys the fullest row. There is no column-destruction move. Whole melded Constructs are removed. HP500, direct damage, scaling, Corruptions, Ideons and the existing destruction-warning commitments are unchanged.

The design document, S4 planning document and enemy description reflect this change. Regression coverage verifies the one-versus-two distinction, whole-Construct destruction and committed targets across Nausea changes. All 737 rules tests pass.

## Evaluation method

Paired bounded-search retries use the latest manual campaign opening: seed24102477, 36/70HP, 55 cards, four Focus/four Channel, six Insight, boss500HP. Source: snapshots/codex-growth-manual-24102477/battle-466.json. Both frozen rule sets include Palimpsest replacement draw. Only the Rending Fangs count differs. Starting log/history/checkpoint data were removed for search efficiency, with gameplay state unchanged.

Both use the same placement heuristic, activation beam10/depth7, defense beam5/depth30 and evaluation weights. The older helper was updated identically in both copies to include the current playerGuard defense action. This is a limited search-assisted comparison, not manually chosen moves, an optimality claim or a population win rate. Raw initial state, frozen rules, search code, actions and turn checkpoints are under reports/apex-fangs-4.0.17.

## Results

| Rules | Result | Turn | Boss HP remaining | Cards destroyed | Actions |
|---|---|---:|---:|---:|---:|
| Baseline: Fangs destroys two | Loss to Brood of the Summit | 11 | 387 | 23 | 155 |
| Revised: Fangs destroys one | Loss to World Eater | 13 | 214 | 24 | 191 |

All346 actions were independently checked against legal actions and replayed; final HP, mode, RNG, complete battle, inventory and equipment matched. The frozen rule sets differ only in the Fangs count. Both begin with the same controller/configuration, but subsequent decisions adapt to the different board states.

The smaller Fangs hit creates a meaningful rebuilding window in this sample: on turn10 the revised player retains26HP with the boss at319, compared with3HP and403 in the baseline. It is not enough for this controller to win from this36HP opening. The revised fight still ends with24 destroyed cards and a lethal World Eater. This does not prove the position impossible or justify another immediate nerf. Keep the approved change; further tuning should compare additional starting builds and stronger lines rather than extrapolate from this pair.

## Delivery

Version4.0.17. Runtime and portable archive updated; source/version/ZIP verification is recorded separately in reports/apex-fangs-4.0.17/package-verification.json. No visual UI pass claimed for this rules-only update. No live save/profile modifications, commit or push.

