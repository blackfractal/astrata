# King Bombadier and Black Bile balance review

2026-10-23 — release 4.0.11; design 4.233.

Jonathan requested two runs against each boss, followed by tuning and replaying until the fights felt good. I completed ten encounter lines: four baseline, four after the first changes, and two further Black Bile replays. Bombadier now demands sustained card churn; Bile disrupts activation planning sooner and requires two elemental defenses on Churn. I am stopping here rather than inflating HP or making every favorable build lose half its health.

## Method and limits

These are isolated boss fights, not full campaigns. Two actual archived builds were copied, starting each encounter at 70 HP with no ambush or Restless. Engine build: seed 231001, 5 Insight / 3 Focus / 4 Channel, sourced from `codex-growth-manual-17101703/battle-136.json`. Mixed build: seed 231002, 4 Insight / 2 Focus / 5 Channel, sourced from `trickster-rework/restored-save.json`. Both have developed equipment, but neither has Gold Bracelets. The engine build has no Grove Titan.

I chose the baseline moves myself through legal actions. Revised fights reused unchanged prefixes or lines where still appropriate; I adapted when the revised state required a different choice. This is not ten independent samples, an optimal search, or a win-rate estimate. Later choices benefited from learning. In particular, the engine's improved Bile result does not mean the stronger rules made the fight easier.

All 1,208 recorded actions replay exactly against their frozen source versions, including intermediate RNG, inventory, deck, statistics and battle state. Candidate snapshots retain their original 4.0.10 version strings; their complete source archives and hashes distinguish baseline, first tuning and final rules. Release 4.0.11 contains the final rules. The live game save was not changed.

## Results

| Rules | Build | Boss | Winning turn | Remaining HP / 70 |
|---|---|---|---:|---:|
| Baseline | Engine | Black Bile | 12 | 46 |
| Baseline | Mixed | Black Bile | 8 | 54 |
| Baseline | Engine | Bombadier | 13 | 55 |
| Baseline | Mixed | Bombadier | 11 | 30 |
| First tuning | Engine | Black Bile | 11 | 55 |
| First tuning | Mixed | Black Bile | 8 | 54 |
| First tuning / final Bombadier | Engine | Bombadier | 13 | 35 |
| First tuning / final Bombadier | Mixed | Bombadier | 11 | 30 |
| Final Black Bile | Engine | Black Bile | 11 | 54 |
| Final Black Bile | Mixed | Black Bile | 8 | 52 |

The final Bombadier lines are stored in `tuned-*`; the second iteration changed only Black Bile. There are no additional manual Bombadier runs in the `final-*` directories.

## Changes and reasons

- **Black Bile:** Churn changes from one Earth hit to base 10 Earth followed by 6 Fire. With existing S2 pressure, its first occurrence is 12 Earth + 7 Fire. Existing completed-cycle, half-HP and Restless bonuses still apply per hit. This makes one prepared defense insufficient without adding another damage-only turn.
- **Black Bile:** Two-glob fresh casts now start after one complete cycle. The first trial used two complete cycles, but the mixed build finished before that mattered. The original four-cycle escalation was effectively absent from both builds' fights. Bile still moves only one existing glob per round, and only casts fresh globs when none can spread. Left-edge Poison priority and deterministic targets remain.
- **Bombadier:** Three-mine waves begin with the third cycle, warned on the preceding move. Previously the fifth-cycle escalation arrived after both wins. Opening waves remain two mines; each still grants a full player turn to respond.
- **Bombadier bug fix:** Mines expiring this round no longer consume the capacity reserved for the next warning. Otherwise a nominal three-mine wave could silently become two. Longer-fuse and newly placed mines still count. No mine-cap increase, instant detonation, or changes to already committed saved warnings.

Actual fresh boss HP remains 276 for Black Bile and 288 for Bombadier. Steam remains three separately defended hits, initially 9 Fire / 12 Water / 14 Wind after S2 pressure. No other attacks, card values, equipment, healing or consumables were changed.

## What mattered in play

**Bombadier:** The engine could remain at full HP through nine turns with careful Ward/Shield placement, Rootwall formations, bracelets and the once-per-battle Mirror Armor reflection. That does not eliminate later danger: uncovered mines cost 35 HP in the revised line, and I deliberately sacrificed Magnifier Ward to cover the third mine later. His difficulty comes from deciding which cards are expendable while keeping enough surviving elemental defense for Steam. More opening damage would obscure that identity.

The mixed build won at 30 HP, but this is not the minimum damage it could take. I made a defense-selection mistake that allowed a Wind hit through, and missed a lethal by one HP on turn 10. Holy Armor's limited healing and consumables helped; the Channel potion remained unused. Corrosion bought a Purify turn. Anger was sometimes useful, but also spent Channel or undid an intended Transmutation. That variability is part of the existing mechanic, not a reason for a global nerf here.

**Black Bile:** Fire damage is a favorable matchup, so these builds should be rewarded. Earlier globs drained Bastion's last use before Churn, forcing different defenses instead of repeating the planned activation. Machine Elves removed Nausea beside Crosswind Reed; adjacent Transmute then made the Reed Fire. The mixed build used Corner Flames, Ignis and Fire-attuned Season's Turn. Covering Nausea to restore a nearby damage card enabled its final lethal. These were several-card plans rather than a single automatic solution.

The engine's better result after tuning reflects improved decisions and timing. Bile is still the easier matchup for these Fire-capable decks. I would collect weaker-entry and Restless examples before increasing his damage again. Testing at full HP without ambush deliberately isolates the encounter; it does not establish that all campaign arrivals are forgiving.

## Supplemental AI evidence

Twelve WeightedPolicy fights (four per rules phase) were separate from my decisions. Baseline Bile won at 14 HP with the engine and 27 HP with mixed. Under final rules, engine lost on turn 11 with Bile at 20 HP; mixed won on turn 9 at 18 HP. Both Bombadier builds lost under baseline and revised rules: engine on turn 8 with 77 boss HP remaining, mixed on turn 5 with 211 remaining. The later mine escalation does not explain those early losses. These results show a substantial execution gap, not proof of a balanced population win rate.

## Verification and artifacts

704 rules tests pass, including split-hit execution/scaling, mine reservations, response timing and saved-state compatibility. `tools/verify-loom-review.mjs` verifies all ten complete manual traces. `reports/loom-balance-verification.json` records counts and source hashes. Two isolated packaged UI checks passed: Churn displays both hits, and all three future mine tiles display warnings, with no renderer errors. Verification is recorded separately in `reports/loom-balance-ui.json`.

Raw initial states, complete decision/state records, frozen sources, manifests and supplemental AI traces are retained under `reports/loom-balance-20261023/` for debugging. This roughly 172 MiB raw archive is deliberately not added to the portable release; the release includes this report and compact verification results. No current save edits, commit or push were made.
