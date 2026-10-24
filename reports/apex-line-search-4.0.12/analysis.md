# Apex Predator: ten candidate lines, 4.0.12

Stopped at Jonathan's ten-attempt limit. No winning line found. Best result: Predator at **148/640 HP**, player defeated by Insanity after Unmake, entering turn 19. No balance changes, live-profile edits, or additional attempts were made for this investigation.

## Fixture and method

- Seed **1428779120**, original Apex Predator opening at decision **1834**.
- Original **51-card deck**, equipment, inventory, RNG and **66/70 player HP**; Predator **640 HP**.
- Current **4.0.12** rules, including committed destruction targets and Prismatic Sap at 8 damage / 4 Guard.
- Ten completed candidate continuations. These were **not ten independent, unaided manual playthroughs**: Codex planned and revised opening/midgame sequences, then used bounded placement, activation and defense searches. Several candidates share validated prefixes. Small planning branches and defense simulations were not counted as completed attempts.
- Trials 1–2 used the earlier lookahead; trial 3 combined a manually guided line through turn 14 with the revised planner. Trials 4–7 varied priorities after a shared opening. Trials 8–9 used a different manually planned early-Titan opening; trial 10 additionally forced Second Spring and deliberate Titan damage to preserve it through the next destruction turn.
- The search considers the exact current state and immediate simulated outcomes. It is not an exhaustive solver and does not establish impossibility, a win rate, or the minimum starting HP required.

All **2,537 recorded actions** across the ten candidates were replayed from the opening with frozen rules. Every action was legal; final player HP, mode, RNG and the **entire battle state** matched the recorded result. Run `node reports/apex-line-search-4.0.12/verify.mjs` from the repository root to reproduce this validation.

## Results

| Candidate | Predator HP remaining | Final turn | Death cause | Cards in Destroyed |
|---|---:|---:|---|---:|
| 1 | 317 | 16 | Hollow Hunger | 27 |
| 2 | 414 | 11 | Brood of the Summit | 21 |
| 3 | **148** | 19 | Insanity | 32 |
| 4 | 281 | 16 | Insanity | 29 |
| 5 | 250 | 13 | World Eater | 24 |
| 6 | 272 | 14 | Riven Earth | 25 |
| 7 | 241 | 13 | World Eater | 25 |
| 8 | 265 | 15 | Rending Fangs | 25 |
| 9 | 249 | 17 | Unmake | 30 |
| 10 | 243 | 18 | Brood of the Summit | 32 |

Final turn is the engine's recorded turn. Candidate 3 took its fatal damage as Insanity resolved after the turn-18 enemy phase, advancing into turn 19. Destroyed counts include all cards in that pile, not only cards removed by the boss's named destruction moves.

## Findings

**HP can fund damage, but it needs a specific return.** Candidate 3 deliberately accepted a 19-damage Light hit to preserve a Light Titan. The Titan delivered roughly 100 damage over its three attacks. That improved the damage race, but the next multiattack drained the Titan, and the following World Eater cost 25 player HP. Crossing half boss HP also immediately strengthened subsequent attacks; this must be included in the turn's defense calculation.

**The destruction puzzle does support clever lines.** The alternate opening played Titan immediately, used it to absorb part of Riven Earth, and kept its HP below two higher-value destruction targets. Later recalls redirected Unmake away from its row. Eclipse Seed and other valuable cards could also serve as deliberate destruction targets. These are real legal interactions, not changes to the targeting rules.

**Protecting a card is not the same as keeping an engine productive.** A surviving Titan with no uses still needs Second Spring or another legal source of allowance. Spring costs three Channel, so finding the turn to restore uses while also defending matters. Preserving a large Ally can also make it the next destruction target. Candidate 10 deliberately used its restored Titan for damage and then as a partial defense to lower its target priority again.

**World Eater is not inherently unblockable.** Candidate 10 completely absorbed its second World Eater attack with Familiar, three Shields and equipment. Its 3-HP loss in that enemy phase came from Insanity. This is an important distinction from candidate 3's 25 direct damage from World Eater.

**Persistent corruption needs more attention than these searches consistently gave it.** Candidate 10 left an Insanity space exposed across several turns, with successive ticks of 1, 2, 3, 4 and 5 HP. Candidate 3's final loss was also Insanity after Unmake. Treating a mostly blocked direct attack as a successful defensive turn misses that continuing cost. Some continuations also spent useful Allies to protect immediate HP, or failed to preserve formations for later turns. These are limitations of the tested lines, not evidence that no better play exists.

**The combined duration and attrition are the clearest pressure.** The closest candidate had 32 cards destroyed while the Predator still had 148 HP. Guardian removal, rebuilding defenses, recalling cards, repairing spaces, drawing replacements and dealing boss damage all competed for Channel. Conservative lines sometimes retained more HP but left substantially more boss HP; aggressive lines often failed earlier.

## Discussion before tuning

There is enough evidence to discuss a small adjustment, but not to declare this seed impossible or use these results as a population balance estimate. The planner's remaining mistakes matter.

I would preserve row destruction, valuable-target destruction and the need to plan placements. If Jonathan chooses to tune the fight, my first isolated experiment would be a modest **boss HP reduction**, shortening the time the engine must survive attrition without removing the board puzzle. A small World Eater damage reduction is another possible experiment, but candidate 10 shows that raw World Eater damage is not the sole bottleneck. Do not change both at once if the purpose is to identify what helps.

No tuning is approved or implemented by this report. The ten-attempt search is finished. A visible victory replay was conditional on finding a win; there is no winning replay to show.

## Preserved evidence

- `initial.json`: exact opening, including RNG and build.
- `trial-1.json` through `trial-10.json`: legal action sequences and final states.
- `verification.json`: independent replay checks, turn summaries and HP-loss events.
- `rules/` and `rules-manifest.json`: frozen rule modules and source hashes.
- `manual-prefix.json`, `alternate-opening.json`, `final-opening.json`: shared planning prefixes.
- `search-source/`: archived planner/driver source for inspection. These are text snapshots; use the verifier above for replay.

The search left the normal player save unchanged and did not resume the separate paused visible retry.
