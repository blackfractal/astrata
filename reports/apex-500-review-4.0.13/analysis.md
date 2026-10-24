# Apex Predator at 500 HP — 4.0.13

Jonathan approved reducing maximum HP from 640 to exactly 500, then requested ten attempts from the same opening, continuing after any wins. **0/10 attempts won.** Closest failed attempt: 70 boss HP remaining (attempt 1).

## Change and validation

Only the Predator's maximum HP changed. Its six-move cycle, destruction targeting, Corruptions, Ideons, +3 direct damage per completed cycle, and +4 per direct hit at or below half HP remain intact. The latter now triggers at 250 HP. Source, main design, S4 plan, version metadata and packaged runtime were updated. All 711 rules tests pass, including fresh 500-HP encounters and the 251/250 threshold boundary. A packaged-engine check also confirmed 500 maximum HP and the +4 threshold. No player save or archived original run was overwritten. Existing in-progress encounters retain their saved HP; the new retry fixture explicitly starts at 500.

## Starting position and method

Same seed **1428779120**, decision **1834**, original **66/70 HP**, **51-card deck**, equipment, inventory, draw order and RNG. The new initial JSON is independently compared against the old fixture: the only differences are the Predator's HP and maximum HP, both 640 → 500. Frozen rule modules and their hashes are retained.

These are ten **search-assisted candidate lines**, not ten independent human playthroughs or ten independently sampled seeds. I reused previously planned openings and used bounded placement, activation and defense lookahead for new continuations. Attempt 1 follows the old best line until turn 14 before replanning; attempts 2–5 and 9 share a six-turn opening; attempts 6–8 and 10 use the alternate early-Titan opening, including the Second Spring refinement for 8/10. All prefixes are replayed under the new rules, not imported as old mid-battle HP snapshots. Variations prioritize HP, card preservation, Titan, draw and Insanity differently; 9/10 attach a stronger penalty to exposed Insanity. No enemy/card changes were made between attempts.

Search sees the exact simulator state and is not exhaustive. It sometimes misses long-term formations, card repair opportunities or preservation of useful Allies. The success fraction describes these candidate lines in this one position, **not the game's overall win probability or proof of optimal play**. Small lookahead branches are not counted as separate completed fights. Exactly ten complete attempts were recorded, including all losses.

## Results

| Attempt | Result | Player HP | Predator HP | Final turn | Destroyed cards | Death cause |
|---|---|---:|---:|---:|---:|---|
| 1 | Loss | 0 | 70 | 15 | 25 | Riven Earth |
| 2 | Loss | 0 | 79 | 15 | 27 | Rending Fangs |
| 3 | Loss | 0 | 91 | 13 | 25 | World Eater |
| 4 | Loss | 0 | 125 | 14 | 26 | Riven Earth |
| 5 | Loss | 0 | 109 | 13 | 25 | World Eater |
| 6 | Loss | 0 | 146 | 16 | 27 | Hollow Hunger |
| 7 | Loss | 0 | 125 | 16 | 27 | Hollow Hunger |
| 8 | Loss | 0 | 119 | 18 | 32 | Brood of the Summit |
| 9 | Loss | 0 | 146 | 13 | 26 | World Eater |
| 10 | Loss | 0 | 105 | 16 | 25 | Hollow Hunger |

Destroyed counts include self-destruction and all other removals, not only the boss's destruction moves. Final-turn numbers use the engine's turn counter.

## Interpretation

The earlier best 640-HP line did not become an automatic win: replaying it against 500 HP brought the player to 2 HP at the beginning of turn 14, compared with 14 HP previously. The lower half-HP threshold activates the damage bonus earlier in terms of damage dealt (250 rather than 320), so old defense plans require adaptation. Attempt 1 subsequently lost on turn 15 with 70 boss HP left.

No win was found in these ten candidate lines. This is not an impossibility result; do not infer that another automatic nerf is necessary without reviewing the remaining tactical mistakes.

The retries also retain tactical limitations: one line spent 3 Focus placing Second Spring onto Insanity, disabling its activation to suppress that space; another used Shield and Scouring Gale as covers. The defensive alternate line left the boss untouched on turns 9 and 10 while dealing with its summoned Guardian. These resource and targeting tradeoffs warrant review before treating the failure count as evidence that further tuning is required.

## Reproduction

All **2522 actions** were independently re-enumerated as legal and replayed. Final player HP, mode, RNG and entire battle state match for every attempt. Run `node reports/apex-500-review-4.0.13/verify.mjs`. The directory retains `initial.json`, all ten `trial-N.json` traces/final states, `summary.json`, detailed `verification.json`, search scripts and immutable `rules/`. `run.mjs` contains the batch generator using the older archived prefixes (completed attempts are preserved and skipped).
