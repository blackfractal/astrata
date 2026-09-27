# AI playability and five-run report

## Current polish evaluation — rules 1.2.0

Policy: weighted-druid-v1.1; content 1.0.0; observation/action interfaces 1. Seeds 825183–825187 were rerun after fixed item rewards, the scheduled midpoint Tavern, weighted spawns, once-per-Tavern pruning, and variable Hex payments. Logs: `reports/polish-evaluation/`. The policy now values HP and sacrifice costs when evaluating Hex treatment. It remains a naive weighted policy, not a trained model.

| Seed | Result | Endpoint | Interpretation from the recorded choices |
|---|---|---|---|
| 825183 | Loss | Round 16, Cinder Hart after 10 turns | Nine earlier fights reduced HP, followed by upgrades and recovery. Entered the boss at 50 HP; limited Channel and repeated Earth attacks into Fire did not finish quickly enough. Mixed draw/opportunity luck and policy sequencing, not an identified rules exploit. |
| 825184 | Win, 49 HP | Round 19, Void-Colossus in 10 turns | Bought and socketed Storm Opal at the Tavern, gaining Channel. Upgraded Blast and Sapling, then used multiple activations and Recall to keep offense available. A useful strategy supported by available gear; the packaged graphical run reproduces this result. |
| 825185 | Loss | Round 19, Cinder Hart after 12 turns | Reached the boss at 42 HP after several fights. Rest and upgrades helped, but the late log still shows only one activation per turn. The acquired Storm Opal was not socketed before the Tavern closed. Opportunity timing and weak action economy contributed. |
| 825186 | Win, 39 HP | Round 18, Cinder Hart in 9 turns | Bought/socketed Storm Opal and imbued a Gold Bracelet with Ruby. Extra Channel plus strong Fire defense supported repeated Palimpsest activations. Both defense and sustained offense mattered. |
| 825187 | Loss | Round 18, Void-Colossus after 10 turns | Husk Armor imposed the persistent Corrode burden. The bot bought Palimpsest but lacked the Channel development of the wins; its final turns relied on one Cinder Snap activation and limited defense. Cursed-gear luck and policy development both contributed. |

**Two wins, three losses.** These five seeds illustrate behavior, not a calibrated win-rate estimate. The additional 100-run robustness batch (971010–971109) completed **49 wins / 51 losses**, with every run terminal and no illegal-action or nontermination failure. The logs are in `reports/polish-robustness/`.

No new broken rules exploit was established. The existing recommendation to improve the bot's handling of spent cards, elemental matchups, and future action economy remains deferred: this pass changes visibility and the explicitly requested rules, rather than tuning enemies around a weak policy. A fixed Tavern spawn does not guarantee the bot visits it promptly; logged visits occur after round 8 when travel takes time.

A packaged UI playthrough of seed 825184 reached the win screen at 49 HP, round 19, with no renderer errors; history and save deletion passed. Focus/drag/drop, spent allowances, attack/disintegration timing, movement paths, all six Tavern areas, all five Healer cost types, and store inspection have separate graphical checks. Targeted edge-case fixtures are labeled as such and are not presented as natural full runs.

Earlier evaluation below is retained as the original v1 baseline. Changing rules and random draws changes these seeds' trajectories; it is not an isolated balance comparison.

## Original v1 evaluation — rules 1.0.0

Evaluation: Druid, rules/content 1.0.0, observation/action interfaces 1, weighted-druid-v1. Seeds 825183–825187. All five runs were actually executed headlessly; complete decisions, public action descriptions, templated reasons, weights, and encounter records are in `reports/evaluation/`. No search, training, hidden-state access, or scripted victories were used.

| Seed | Result | Endpoint | Causal interpretation |
|---|---|---|---|
| 825183 | Win, 29 HP | Round 19, Cinder Hart in 6 turns | Upgraded Blasts and Cinder Snap, plus a socketed Storm Opal, supplied enough offense. The run reached the boss at 65 HP and lost 36 there. **Strategy supported by favorable opportunities**: it spent 255 Gold on upgrades/rest, and won several small fights in one turn. |
| 825184 | Loss | Round 18, Void-Colossus after 23 turns | Reached the boss at full HP with Earth Armor, Soothe, and extra Channel. The final turns repeatedly activated two Shields and used the Bracelet, but dealt no finishing damage. **Strategy failure**: the policy did not Recall exhausted offense early enough. Defensive survival postponed the loss while the enemy ramp grew. |
| 825185 | Loss | Round 8, Shard-Walker | Dervish Hunter cost 26 HP on round 6. Two rounds later Shard-Walker's activation-negating and piercing rotation defeated the starting-heavy deck. It had 75 Gold but spent none. **Spawn/draw pressure plus weak strategy**: an early pair of Eidolons and no realized recovery/upgrade path. |
| 825186 | Win, 60 HP | Round 20, Cinder Hart in 5 turns | Found Gold Bracelet and Holy Armor, equipped both, and developed three upgraded Saplings. It entered the boss at 57 HP and ended at 60, after taking and healing damage. **Favorable equipment luck with a repeatable strategy**: passive defense/healing frees Channel for growing Allies and attacks. |
| 825187 | Loss | Round 19, Void-Colossus after 11 turns | Entered the boss at 64 HP with a thin economy, a cursed Husk Armor, and only one Channel. Its final decisions were single Blasts, one Shield, and Familiar interception; armor's battle-start Corrode added accumulating pressure. **Strategy and item risk**, rather than proof that the boss is impossible. |

## Aggregate interpretation

Two of five won (40%). Both wins fought Cinder Hart; two losses fought Void-Colossus and one died before an Archon. This sample cannot separate boss balance from equipment and policy quality. The standout contrast is the Gold Bracelet/Holy Armor run: 31 total damage taken, versus 105 in the 23-turn Colossus loss. Passive equipment has a large effect on how much Channel can be spent offensively.

The logs expose a concrete policy weakness: Recall is almost never chosen. The policy only values clearing Spent slots when more than ten slots are occupied. Colossus removes columns, which keeps occupancy below that threshold while still destroying usable offense. The bot then pays Channel for Shields until ramping attacks defeat it. **Deferred improvement:** score Recall by access to reusable damage and next-turn Focus, rather than grid occupancy alone. This is an AI improvement, not a reason to change the game's Recall rule. The v1 bot intentionally remains a naive baseline.

No player exploit was demonstrated in these five runs. The long Colossus fight is a losing defensive loop, not an infinite protection exploit. A possible balance concern is healing behind strong passive Bracelets. **Deferred design recommendation:** before changing either mechanic, compare passive-defense/healing combinations over larger matched-seed runs and with a policy that recycles offensive cards. Enemy cycle ramp is already the design's pressure against indefinite farming.

## Defects fixed during development

- The policy initially oscillated between equivalent equipment slots. It now accounts for the benefit removed from the original slot. That was a bot scoring defect, not a legal player exploit.
- Upgraded Sapling initially risked receiving its +3 HP benefit a second time as direct damage. The implementation now derives its attack solely from current HP. A regression test covers it.
- Acquiring a fourth Armor now pauses the Field before the required carry-limit choice, rather than allowing enemy movement to interrupt that choice.
- Repeated mid-battle quit/resume always preserves the same opening checkpoint. A regression test covers the second resume as well as the first.

## Scale and robustness check

A separate 100-run batch (971010–971109) completed without crashes, illegal moves, or step-limit stalls: 67 wins. It encountered all three Archons, including a Bat plus Glass Choir encounter. These were not used to train weights and are not substituted for the five-run report above. They demonstrate that the batch command scales beyond five and exercise more content; they still do not establish balance.

Exact versions and policy weights accompany each run. Tests separately verify unfamiliar legal actions, changed starting resource values, hidden-state omission, deterministic replay, and atomic defenses. Future training should split training and held-out evaluation seeds, associate checkpoints with all four version fields, and reject incompatible checkpoints. Future search must sample plausible hidden outcomes into isolated state; the real engine RNG and hidden decks must never become policy input.
