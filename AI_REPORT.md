# Scarce healing and stronger enemies — package 1.3.9

Rules 1.3.7/content 1.1.6; unchanged weighted-druid-v1.5. Blast damage and Shield block are now 4. All five activation-healing cards are rare, weighted one-quarter as heavily as other rare cards, and destroyed after one use. Enemy HP is increased 15%, rounded up. Raw decisions and encounter logs: `reports/balance-evaluation/`.

| Seed | Outcome | Final HP | Field round | Last encounter |
| --- | --- | --- | --- | --- |
| 825183 | win | 6 | 18 | The Cinder Hart |
| 825184 | win | 18 | 19 | Void-Colossus |
| 825185 | win | 41 | 20 | The Cinder Hart |
| 825186 | loss | 0 | 17 | Shard-Walker |
| 825187 | win | 38 | 19 | Void-Colossus |

Four wins, one loss; all five runs terminated normally without policy changes or stalls. The Cinder Hart win at 6 HP and the round-17 Shard-Walker loss show that survival pressure exists, but this sample does not estimate a reliable win rate or prove the intended difficulty. These seeds previously produced three wins/two losses; acquisition changes consume randomness differently, so routes, enemy draws, rewards, and later decisions differ. This is not a controlled before/after balance experiment. No extra tuning was performed to force favorable AI outcomes.

All 86 rules tests pass. Focused coverage includes healing at full HP, player/Ally healing and secondary effects, Keystone/Recall restrictions, covered Fusion healing, restoration next battle, scarcity across offers and Item Decks, new HP values, and old-save retention. Targeted packaged tests verify reduced Blast damage, Shield 4, the printed single-use contract, Ally healing followed by visible Destroyed-pile removal, and continued click/drag targeting, Shift and Transmute. No renderer errors. See `reports/balance-verification.json` and `reports/screenshots/balance/`. This is not a new full graphical playthrough; older evaluations below remain historical evidence for their stated versions.

---

# Ally vitality and battlefield targeting — package 1.3.8

Rules 1.3.6/content 1.1.5 and weighted-druid-v1.5 remain unchanged. Added Ally maximum-HP display metadata without capping or changing HP calculations. Five refreshed seeds 825183–825187 end identically to the preceding gameplay evaluation: **3 wins / 2 losses**, HP/rounds **51/20, 7/19, 0/20, 60/19, 0/19**. Logs: `reports/battle-targeting-evaluation/`.

All 80 rules tests pass. Packaged human-interface tests cover real clicks and drags for adjacent-card attunement and enemy selection, cancel/invalid actions without resource spending, healing a selected Ally with an updated life bar, Shift destinations, and inline Transmute element choices that affect subsequent attunement. No renderer errors. See `reports/battle-targeting-verification.json` and screenshots. The AI continues to submit complete legal actions directly; no policy adaptation was needed for this UI change. Targeted packaged interaction testing is not a new full graphical playthrough.

---

Package 1.3.7 adds only Druid card backs and faster overlapping Reveal to rules 1.3.6/content 1.1.5. The gameplay results below remain current. Packaged presentation tests preserve revealed card identities/order across Normal, Fast, Skip, and reduced-motion modes; normal four-card Reveal measured 1,778 ms. See `reports/druid-reveal-verification.json`.

# Once-per-turn activation — rules 1.3.6, content 1.1.5

Five sequential seeds 825183–825187: **3 wins / 2 losses**, unchanged weighted-druid-v1.5. Outcomes (HP / round): **win 51/20, win 7/19, loss 0/20, win 60/19, loss 0/19**. Losses occurred against Cinder Hart and Void-Colossus respectively. Full logs: `reports/activation-turn-evaluation/`. Every run ended normally; none stalled. The policy receives the restricted legal action set and needs no special-case bypass. No tuning was applied to force victories. Five runs are insufficient for a reliable win-rate estimate.

The once-per-turn/Blink requirement is now implemented. Each card tracks current-turn use independently of its total allowance; unlimited cards, Charge, and covered Pile/Fusion activations follow the same default. No current card gained Blink; a temporary printed-Blink rules fixture verifies paid repeat activation and allowance/resource limits.

All 78 rules tests pass. The packaged UI test verifies disabled activation despite surplus Channel and total uses, Used this turn, automatic forward-arrow prompting, popup details, next-turn availability, and permanent exhaustion after the final total use, with no renderer errors. See `reports/activation-turn-verification.json` and screenshot. Current verification is targeted graphical interaction plus five full headless runs, not a new full graphical playthrough. Older sections below retain their historical pending-rule descriptions and results.

---

# Druid starter and Insight — rules 1.3.5, content 1.1.4

Five sequential seeds 825183–825187: **5 wins / 0 losses**, unchanged weighted-druid-v1.5. Final HP / round: **25/19, 23/19, 29/20, 49/20, 62/19**. Logs: `reports/druid-start-evaluation/`. The new 12-card deck (four Blasts/four Shields plus four other starters) and base Insight 4 change draw frequency, random consumption, and later routes. This small combined-change sample does not isolate a balance effect.

All 72 rules tests pass. Packaged UI shows four dealt/revealed cards, eight remaining in the Grimoire, and starting resources of 4 Insight / 1 Focus / 2 Channel, with no renderer errors. See `reports/druid-start-verification.json` and screenshot. Tests also verify reset behavior and preservation of existing saved decks. This is targeted graphical verification plus five full headless runs, not a new full graphical playthrough.

General once-per-turn/Blink gameplay remains pending separately.

---

# Resonance and equipment — rules 1.3.4, content 1.1.3

Five seeds 825183–825187: **5 wins / 0 losses**, policy weighted-druid-v1.5. Final HP / round: **55/20, 29/19, 25/20, 65/19, 25/19**. Logs: `reports/resonance-equipment-evaluation/`. None acquired Resonance, so this sample checks run completion and the new unequip action without measuring Resonance balance. The policy explicitly avoids unequipping useful gear merely to re-equip it.

All 70 rules tests pass. Direct tests verify Resonance's net +1 Channel from zero, single use without Recall or extra allowance, and expiration into Destroyed, including covered/unused copies. Packaged UI tests verify those interactions plus actual equipment dragging in both directions, no duplicates across Equipped/Satchel, and unnumbered grid cells, with no renderer errors. See `reports/resonance-equipment-verification.json` and screenshots. No new full graphical playthrough is claimed for this patch.

General once-per-turn/Blink gameplay remains pending; Resonance's printed single-use restriction is implemented.

---

# Stop-on-player movement — rules 1.3.3, content 1.1.2

Five sequential seeds 825183–825187: **5 wins / 0 losses**, weighted-druid-v1.4. Final HP / round: **55/20, 29/19, 25/20, 65/19, 25/19**. Raw logs: `reports/movement-stop-evaluation/`. These outcomes match the prior five-run sample; this is regression evidence, not a measured balance effect.

All 66 rules tests pass. Targeted tests exercise a Restless Wanderer reaching the player before spending its movement, subsequent enemies completing their moves, Pack chains retaining arrivals, diagonal contact, and existing-save compatibility. The packaged UI fixture visibly holds the Bat on the player while the Hunter moves, then opens one battle containing both enemies, with no renderer errors. See `reports/movement-stop-verification.json` and its screenshots. Current graphical verification is a targeted interaction, not a newly recorded full graphical playthrough.

The design-only Blink/once-per-turn gameplay requirement remains pending.

---

# Matching starter-card adjacency — rules 1.3.2, content 1.1.2

Final five sequential seeds 825183–825187: **5 wins / 0 losses**, using weighted-druid-v1.4. Final HP / Field round: **55/20, 29/19, 25/20, 65/19, 25/19**. Raw logs are in `reports/adjacency-evaluation/`. The policy rewards placement next to matching exposed cards and reads the actual Shield block value from legal-action effects.

Both bonuses are position-dependent: adjacent Blasts gain damage and adjacent Shields gain block when activated. Direct tests and the packaged UI verify 6/7/6 for a row of three. Elemental conversion occurs after the bonus, and stored Shield block is not retroactively recalculated when neighbors change. Coverage includes diagonals, row edges, covered cards, Sever, and exposed spent neighbors.

All five seeds still win, but seed 825184 ends at 29 HP instead of the prior 40 HP. Altered placement scores and combat choices mean that a stronger card interaction need not improve every route. This small sample is not a balance estimate. No further tuning was made to chase a win rate. **62 rules tests pass**, and packaged adjacency/activation/pulse checks have no renderer errors. The prior full graphical victory belongs to rules 1.3.1; this final patch was checked with targeted packaged interactions and five full headless runs.

The design-only Blink/once-per-turn requirement remains pending in gameplay. These results use the existing repeat-activation rule, with zero-Focus Clear Mind/Rain Lantern/Tide Memory, no Blast/Shield rewards, and the new adjacency bonuses enabled.

---

# Reveal and economy-card update — rules 1.3.1, content 1.1.1

The final five sequential seeds 825183–825187 all completed: **5 wins / 0 losses**, using weighted-druid-v1.3. Final HP / Field round were 55/20, 40/19, 25/20, 65/19, and 25/19. Logs and individual encounter results are in `reports/reveal-evaluation/`. This supersedes the earlier same-turn diagnostic run before the zero-Focus economy-card changes.

Blast and Shield never appeared among selected rewards; direct generation tests over 100 seeds verify they are excluded from normal/rare reward offers. Existing copies and shop stock remain valid. The five runs used Clear Mind 0, 1, 1, 2, and 1 times respectively; none activated Rain Lantern or Tide Memory. Therefore this sample verifies completion but offers little evidence about Rain Lantern/Tide Memory balance. Their zero placement cost, Channel payment, and next-turn-only resource timing are checked directly in the rules tests. The bot still favors immediate offense over future draw, which may underuse these cards.

Seed 825183 dipped to 29 HP but finished at 55; 825186 never dropped below 57 and finished at full health. Recovery remains powerful in some routes. No balance conclusion should be attributed solely to the reward exclusion or cheaper utility cards, because reward shuffling changes later random outcomes too. The earlier 80/100 result remains evidence for rules 1.3.0/content 1.1.0, not this update.

Reveal animation is presentation-only: the captured draw order matches the headless engine, and a full-run invariance regression still passes. Normal/Fast/Skip/reduced-motion packaged checks confirm ordered reveals and automatic Placement. Movement brightness and arrow-pulse fixtures pass. **58 rules tests pass.** The final packaged full run (seed 825184) won at 40 HP, round 19, in 102 seconds; results/history, completed-save deletion, and zero renderer errors are recorded in `reports/reveal-playthrough.json`.

Scope boundary: the once-per-turn/Blink rule requested specifically for the design document is recorded in design v4.41, but is not implemented in this package. These AI results still use the previous repeat-activation behavior. Design v4.42's zero-Focus Clear Mind, Rain Lantern, and Tide Memory costs are implemented.

---

# Paired spawns and 2 Channel — rules 1.3.0

Five complete headless runs used weighted-druid-v1.3, content 1.1.0, and unchanged default numeric weights. **5 wins / 0 losses.** These are sequential seeds selected before running, not a selection of winning seeds. Raw actions, reasons, and encounter results are in `reports/pairs-evaluation/`.

| Seed | Outcome / final HP | Final round | Observation from the run |
|---|---|---|---|
| 825183 | Win / 44 | 19 | Survived Ashling + Dervish, then Shard-Walker + Pale Weaver. Sapling was activated 13 times. Hart took 5 turns. |
| 825184 | Win / 47 | 20 | Three Bats fought together in round 11: 2 turns and 5 HP lost. Colossus took 5 turns. |
| 825185 | Win / 35 | 19 | Two Ink Leeches plus Fire Wolf cost 28 HP over 5 turns. Recovered to 65 before the 7-turn Hart fight. |
| 825186 | Win / 56 | 20 | Two Ashlings plus Fire Wolf cost 8 HP over 4 turns. Finished Hart with more HP than it entered, indicating meaningful sustain. |
| 825187 | Win / 43 | 19 | Ink Leech + Wolf cost 3 HP; Colossus took 6 turns. Blast remained the main activation, used 15 times. |

The 100-run robustness set, seeds 971010–971109, completed with **80 wins / 20 losses**, no stalled or illegal-action run. 92 runs faced a multi-enemy battle; 62 faced one of the authored numbered groups. Largest observed battle: 5 enemies. Fourteen losses involved an Archon; six ended in non-Archon encounters, including a two-Bat group, a four-enemy mix, and stacked status-heavy enemies. Detailed logs are in `reports/pairs-robustness/`.

Interpretation: this combination is substantially more successful for the current bot than the preceding 49/100 sample. Extra Channel allows more offense or defense while extra encounters also offer more growth and recovery opportunities. Those are plausible explanations, not isolated causal results: spawn structure, grouping, policy threat scoring, and random-number consumption also changed. Equal seeds do not create matched encounters across these versions. A controlled experiment would vary those changes separately. No additional damage, HP, reward, or spawn-weight nerfs were made to force a target win rate.

Grouped targets work mechanically and the easiest setting remains beatable, but concentrated multi-enemy status damage deserves further human playtesting. No enemy cap was silently introduced. The bot reads visible group sizes when evaluating travel risk and handles all individual battle targets through the normal legal-action API.

Packaged verification: the Field displays four ordered pairs and group counts, without page scrolling at 1280×800. A real seeded three-Bat encounter shows three independently inspectable targets and 2 Channel. The full graphical run at seed 825184 reached the win screen at 47 HP, round 20, with no renderer errors; results/history and finished-save deletion passed. `reports/pairs-playthrough.json` records the 88-second run, started from an untouched initial class-selection state and played through ordinary controls plus Watch AI. All 54 rules tests pass. Earlier reports below retain their original versions and results.

---

# Optional pickup verification — rules 1.2.1

Five complete headless runs used weighted-druid-v1.2 and seeds 825183–825187. Results: **2 wins / 3 losses**, no stalled or illegal-action run. Final HP: 0, 49, 0, 39, 0 respectively. Raw actions, reasons and encounter summaries are in `reports/item-pickup-evaluation/`.

The bot declined one pickup on seed 825187, round 5. Other encountered pickups were accepted, including Earth Armor on 825184 and six equipment/card pickups on 825186. All five terminal outcomes and final HP match the previous 1.2.0 sample. This confirms the added decision is handled; five runs are not evidence of a balance improvement. The focused cursed-item test separately verifies that the policy prefers refusal over accepting the curse. Earlier balance observations below remain applicable to these repeated outcomes.

The packaged UI was checked for both Collect and Leave item using explicit saved fixtures; these are interaction tests, not five graphical playthroughs. All 48 rules tests pass. Older reports below retain their original rules versions.

---

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
