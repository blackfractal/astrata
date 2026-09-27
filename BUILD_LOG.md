# Astrata 01 — build record

Started 2026-09-26 15:28 America/New_York. Source design v4.34, read-only.

## Stages
1. Requirements, independent repository, stack and content design — completed.
2. Shared rules engine and deterministic tests.
3. Desktop interface and generated art.
4. AI evaluation, fixes, packaging and graphical verification.

## Decisions
- Druid: makes adjacency, growth, Allies and stacks central to the first build (src/content.mjs).
- Electron with native JavaScript modules: a conventional self-contained Windows application, sharing identical engine code with headless Node tests and policy (desktop.cjs, src/engine.mjs).
- Stratum 1 is the Ashen Weald: pale roots, jade pools and ember-lit refuges. Warm brass and parchment frame painterly dark fantasy illustrations. The hidden lore is never stated.
- Section 10.3 takes priority over the smaller generic roster table in section 8; target 12 Motes plus 7 Eidolons and 3 Archons.
- No encounter cap. Archons have printed pursuit schedules and force contact by their sixth Field round.

## Environment
Normal shell launch failed (sandbox helper setup refresh). Supported escalated execution works; creation of the requested sibling directory approved automatically. All source design files remain untouched.

## Verification
Playable packaged GUI verified through victory and defeat. Thirty-two rules tests pass; the five-run AI evaluation and a separate 100-run robustness batch are complete. Final art/package audit is recorded below. Literal Explorer double-click remains unverified because the native UI helper is unavailable.

## Usage
One agent. Token usage estimated at completion; clock stages recorded here.

## Progress — 2026-09-26 15:51 EDT
- Core engine, content and policy implemented. First local commit 1c677ba.
- 21 focused rules tests pass, including deterministic full-run replay.
- Development seeds 41001–41005 all reached victory. These adjacent seeds shared early RNG patterns; the RNG now warms up for eight draws before selecting hidden content, avoiding the visible correlation in adjacent raw xorshift seeds. Five wins are not evidence of overall balance.
- Fixed a policy defect: equipping one Ring in alternating empty finger slots was scored as repeated improvement. The policy now subtracts the benefit it removes from the original slot.
- Spark generation initially failed with CUDA operation-not-permitted. Host nvidia-smi worked while the six-day-old ComfyUI container reported NVML failure. Its queue was empty. Restarting only that container restored generation. Laptop endpoint 127.0.0.1:8188 was unavailable. Artwork is being generated on Spark, not placeholders.
- Native computer-use helper failed its pipe connection on initial call, retry, and session-reset retry. Packaged UI testing will use Electron graphical automation; literal Explorer double-click cannot currently be claimed.
- electron-builder extracted the runtime but failed its npm dependency collector (no JSON output). A small reproducible packager will copy the pinned Electron distribution and the app's dependency-free runtime files. It does not require an editor or dev server at player runtime.

## Builder choices / rule knots
- Rootbound Ring adds a separate 1-damage imbued hit; this makes the socket's offensive element explicit (src/content.mjs, engine.mjs).
- Pack Movement triggers once per enemy arrival during a movement phase, preventing infinite zero-distance re-triggers (engine.endMovement).
- Sentinel enemies remain stationary when Restless, while their battle damage grows. Archons follow printed timed pursuit, unaffected by extra Restless movement (engine.endMovement).
- Fullest row/column counts all cards including covered levels; reading-order ties choose the first row/column (engine.gridAttack).
- Void-Colossus summons at most one Mini-Void per incoming activation, even if it contains multiple Chaos hits; prevents exponential pile summons while preserving the stated counterplay (engine.damageEnemy).
- Unprinted Freeze duration is one following player turn; Lock/Sever persist until card leaves or an effect clears them (engine.gridAttack).
- Healing an Ally may exceed its original HP; growth already has no maximum HP in the brief (engine.applyCard).
- Status rider on an enemy attack applies to the player even if its numeric hit was blocked or intercepted; it is a separate printed status application (engine.finishHit). Recommend explicitly specifying rider targeting in future design text.
- No run-time learning or search. Weighted policy only; future policy replacement uses choose(observation, legalActions). No hidden state is passed to the policy.

## Progress — 2026-09-26 15:55–16:00 EDT
- GUI victory achieved in packaged Astrata.exe, seed 3746046053: round 19, Void-Colossus defeated after 14 battle turns, 27 HP remaining. Results and persistent history were displayed; completed save removed. Evidence: reports/gui-verification.json and reports/screenshots/.
- Also verified a graphical loss run (seed 3745783979) and automatic save deletion.
- GUI test quit mid-battle, relaunched the packaged executable, and resumed at turn one. Separate unit regression covers repeated resumptions.
- Mouse placement and mouse activation, Enter confirmation, settings resolution, inventory and Grimoire dialogs tested. Latest 1280x800 window test: 1266x764 content viewport, 764px document height, no missing images or JavaScript errors.
- 30 rules tests pass. The actual five-run evaluation is 2 wins / 3 losses; the separate 100-run robustness batch is 68 wins / 32 losses, all terminal and no invalid actions. See AI_REPORT.md for the interpreted evidence rather than treating these figures as balance certification.
- All 126 required asset IDs have generated files and full machine/model/prompt/seed/workflow provenance. A second subject-clarity pass produced 59 replacements. A final painting pass is aligning these replacements with the original painterly palette, preserving previous files.
- Human playability and the complete Druid content are now available. Final delivery waits on art consistency review and package/report finalization.

## Additional decisions
- Status damage is Arcane unless printed otherwise; Stone Armor and Bracelet reserves apply, while elemental resistance needs a matching damage element (engine.beginTurn).
- Healing equipment resolves before player status ticks at turn start (engine.beginTurn).
- The two spatial utility cards Transmute and Quicksilver are discoverable shared cards for Druid, ensuring Shift/Transmute mechanics are accessible in v1. Arcane Surge remains an event cross-class offer (engine.pool, content.events).
- A fourth Armor acquisition pauses tile resolution for its carry-limit decision. Cursed worn Armors cannot be discarded as that replacement choice (engine.legal/act).
- Source SHA-256: 1C60678CE0ED2B65B85B51FC223B77007739E1EFDCEF7368519813A7574E0007. No source design changes made.

## Final design and engineering assessment

The core result is a complete playable Stratum 1 loop for Druid, with shared human/bot legality, all required content categories, generated art, persistent saves/results, and an executable containing its runtime. No gameplay questions were required. No agents were delegated, no external messages were sent, no paid image service was used, and no git push was performed.

The most difficult implementation areas were atomic defense continuation (a hit can pause repeatedly for Shield, Ally, and Bracelet decisions), interrupted Field rounds (multiple guarded rewards must resolve in order), and preserving battle-opening checkpoints across repeated resumptions. Those now have focused regression coverage. A fourth-Armor pickup and double-applied Sapling upgrade were caught and fixed during review. Long shell writes also exceeded Windows command limits; splitting the engine write resolved that without changing scope.

The main remaining design uncertainty is balance, especially Colossus versus the baseline bot's poor Recall planning and the strength of passive Bracelet/healing equipment. I recommend improving the bot's Recall evaluation before using its losses to weaken enemies. Five naive runs are plumbing evidence, not training or balance proof. The separate 100-run batch exercises scale but has the same policy limitations.

For a subsequent implementation I would separate Field and battle reducers into modules earlier and author an explicit rules-to-test checklist before the first playable loop. The engine is now formatted and divided into methods, but it is still a large file. I am least confident in balance across rare multi-enemy/status/stack combinations and in consistent fine detail across generated illustrations. Existing tests, provenance and run logs make those areas reviewable.

### Known implementation choices and limits
- An attack's status rider is a separate player status application even when its damage is intercepted. The document does not explicitly resolve this target; the choice is recorded rather than hidden.
- All initial class selection data currently targets Druid. Cards/enemies/items are declarative, class ID is stored separately, and another class requires supplying a starter list, HP/pool and selector entry. No other class or Synthesis is included.
- Exact replay requires this rules/content version. Saves with a different rules version are rejected, rather than silently loaded under changed rules. Development runs before seed warm-up are historical diagnostics, not the final replay corpus.
- The Windows native UI helper could not connect after the documented recovery sequence. The actual packaged executable was launched and operated graphically with Electron Playwright, including a legitimate victory, a loss, save/resume, results and history. **A literal Explorer double-click action is unverified.** This is the sole launch-verification gap; no editor/server/runtime install was used by the packaged app.
- Generated art is selected and inspected in contact sheets. Original and revised images are preserved; `src/art-paths.mjs` identifies the selected version, and `reports/art-manifest.json` contains provenance for all versions.

### Final stages and timeline
| Stage | Start / finish (EDT, 2026-09-26) | Outcome |
|---|---|---|
| Read authoritative design, isolate repository, select stack/class | 15:28–15:31 | Source v4.34 read; sibling repository created. |
| Content, rules engine, baseline AI | 15:31–15:43 | Catalog and engine committed 15:40; first diagnostic batch completed. |
| ComfyUI recovery and first art batch | 15:32–15:50 | Spark container recovered; all 126 required images generated. |
| Desktop interface, rules tests, graphical play | 15:43–15:55 | Packaged defeat and victory, save/resume, settings/history verified. |
| Review, art revisions, reports and packaging | 15:50–final timestamp below | Subject and style passes, 31 rules tests, five-run report and 100-run robustness check. |

Stages overlapped: image generation continued while code/tests were written. The only working-method change was replacing failed electron-builder dependency collection with direct packaging of the pinned Electron runtime.

### Token usage
No authoritative token meter was exposed. Rough estimate: **50,000–80,000 tokens** of generated reasoning/code and tool-result content during this implementation, excluding repeated cached conversation context. This is an estimate, not billing telemetry. One agent worked on the build.

## Final audit corrections
- Section 10.3 asks Motes to cover all five movement types, while 2.7 reserves Hunter largely for stronger enemies. Needle Imp is a deliberately weak Hunter Mote to satisfy the explicit v1 roster target. It has small piercing/multi-hit damage and printed counterplay (content.enemies.imp).
- Tavern gossip now reveals both the Archon and whether the next Tavern has a Healer. The predicted availability is stored and honored when that Tavern opens; one gossip purchase per visit (engine.openTavern/act). Tested explicitly.
- Wanderers now complete their full rolled path when crossing the player. Pack arrival can trigger along that path; the encounter still uses only enemies sharing the player's tile at phase end (engine.endMovement). A focused crossing regression passes.
- The final rules suite contains **32 passing tests**. The five report runs were rerun after these corrections and retain the same two wins / three losses. The refreshed 100-run robustness result is **67 wins / 33 losses**, with all 100 terminal and no crash or illegal move. The earlier 68-win number above describes the prior movement implementation.
- Generated **244 image versions** for **126 required asset identities**: all 126 originals, 59 clearer-subject revisions, and 59 painting-style revisions. Selected versions are recorded in reports/asset-selections.json and src/art-paths.mjs; all selected files have provenance. No placeholders are used.

## Delivery verification

Final packaged graphical test completed with two legitimate losses followed by a legitimate victory (seed 3746645914, round 16). Battle restart, results, save deletion, persistent history and zero renderer errors are recorded in reports/gui-verification.json. The victory was reached through ordinary UI actions and the same weighted policy available to the player, with no state injection, damage cheats or forced outcome. The previously recorded Colossus victory remains useful supplementary evidence.

Final content audit: 55 cards including 5 Hexes, 12 Motes, 7 Eidolons, 3 Archons plus Mini-Void, 32 items, 12 Events, 16 upgraded card forms, 126 required art identities, zero missing selected assets or provenance. The game is ready for human playtesting.

Executable: release/Astrata/Astrata.exe. Keep the complete folder together. BUILD_LOG.md, AI_REPORT.md and evaluation/provenance records accompany it. Source code and all tests remain in the independent astrata_01 repository.

Verification boundary: packaged executable launch-to-win is verified; the literal Explorer double-click gesture could not be automated because the native helper was unavailable. All other requested v1 deliverables are present.

Build completion record: 2026-09-26T20:05:38.277Z (UTC), approximately 38 minutes since the 15:28 EDT start, including overlapping image generation. Final packaging and local commit follow this record; no push.
- Final control-test harness initially reused an unfinished QA save and timed out on the new-game confirmation. Changed the harness to a fresh isolated profile per run, then verified mouse placement/activation and Enter successfully again, with zero missing images/errors. This was test isolation, not a game failure.


## Post-build polish — interface and presentation, round 1

Started: 2026-09-26T21:39:21.448912+00:00. Jonathan requested clearer legal actions and depleted resources, player/equipment visibility, an interactive Tavern, card/equipment drag-and-drop, contextual help, explicit reward ownership, a top-down grassy Field, and paced movement/attack/defeat animations. Adjacency is a future content principle, not new balance work. Clarifications on reward selection, transition pacing, activation display, and phase guidance are pending. Implementation and verification time will be recorded separately from the original v1 build.

Additional notes during this round: explicit View alongside Buy/Sell in visual store catalogs; one ordinary card removal per Tavern; proposed two-stage weighted spawns. Card sale semantics, Healer limit scope, and exact spawn weights/guarantee are awaiting Jonathan's answers. Earlier completed packaged verification refers to the interface-polish build before these additional changes.

Progress 2026-09-26T22:03:40.973294+00:00: implemented and graphically verified separate View/Buy controls, an owned-item View/Sell catalog, a visual Grimoire with View/Remove, and one ordinary removal per Tavern (persists through saves and resets at a new Tavern). 38 rules tests pass. Two-stage spawn weights and Healer/card-sale semantics remain pending clarification; spawn probabilities are not changed yet. The executable is refreshed with the confirmed work; the delivery ZIP and final combined AI report will be regenerated after these decisions.


### Confirmed final scope and decisions

Jonathan confirmed: cards remain paid removal (one per Tavern); item sales pay Gold except the existing Cursed-object fee; Hex removal has a separate allowance and may cost Gold, HP, HP+Gold, Ally+Gold, or an item. The only Field Tavern is spawn 8. The Archon remains spawn 16. Other spawn weights are 40 Mote / 10 Eidolon / 15 Gold / 10 Item / 20 Event. Equipment changes are available throughout player map movement; Gem changes stay Tavern-only.

- Updated the main design to v4.35 by guarded, read-before-write edits. Added 10.4.1, revised 2.2/6.4/6.6 and reconciled older reward examples. No additional gameplay clarification remains pending.
- Implemented the initial visual notes: gray unaffordable revealed cards; visible remaining/total activations and disabled controls with explanations; full uncropped art/details on card click; two-click placement and card drag/drop; one-way phase guidance; persistent player and seven equipment slots facing enemies across the grid; readable Field markers; contextual timed hover/focus help; categorized Tavern interaction, View/Buy/Sell catalogs, and equipment/Gem drag/drop.
- Generated two new location illustrations on Spark/ComfyUI (top-down grass and Tavern interior), preserving originals. Model, prompt, seed, workflow and machine are in the art manifest. No placeholders.
- Added ordered presentation frames outside saved gameplay state. Enemy movement plays one cell at a time, with arrival visible before battle; attacks, defensive absorption, damage and disintegration resolve visually before rewards. Normal/Fast/Skip controls change presentation only. A full seeded comparison verifies capturing frames leaves legal actions, RNG and outcome unchanged.
- Physical-dice implementation: category d20 1–10 enemy, 11–15 loot, 16–19 Event, 20 reroll; enemy d10 1–8 Mote / 9–10 Eidolon; loot d10 1–6 Gold / 7–10 Item. Fixed Tavern/Archon consume slots 8/16. Excluding the reserved Tavern face normalizes the 95-point random weights. Opening Eidolon results become Motes. Tavern location still uses ordinary Location dice; a guaranteed spawn is not a forced visit.
- Healer draws one payment style per visit, visible and stable. Gold uses the existing 35/50/80 fee; HP-only costs 12; HP+Gold costs 6 HP plus half the Gold fee rounded up; Ally+Gold consumes one selected Ally card plus half the fee; item payment consumes one selected non-Cursed item without a socketed Gem. Socketed Gems cannot be sacrificed directly. HP payment must leave at least 1 HP. These price choices fill details Jonathan left to the builder. Costs appear in legal actions and the bot evaluates the loss.
- Rules/package version is 1.2.0; policy is weighted-druid-v1.1 (sacrifice-aware Hex valuation). Old saves load, retaining already-revealed queues/entities. Newly rolled batches use the new schedule; a fresh run has exactly one Tavern. Old replays require their original rules version. The action/observation interface versions remain 1 because action fields are extensible and the existing action type is retained.

### Verification and hard problems

43 rules tests pass. New coverage includes exact dice weights, 100 seeded Stratum schedules, all five Hex payments, affordability and nonlethal HP constraints, independent removal allowances, save persistence, Field equipment timing, presentation invariance, and fixed item rewards. Final five AI runs: 2 wins / 3 losses. Additional 100-run robustness: 49 wins / 51 losses, all terminal.

The final packaged full UI run (seed 825184) wins at 49 HP, round 19; results/history and finished-save deletion pass, with no renderer errors. Separate packaged interaction checks exercise resource graying, zero-Focus placement, card and gear drag/drop, Gem changes, full card art, on-card activation, exhausted counts, cell-by-cell arrival, damage/disintegration before rewards, all Tavern service areas, and each Hex payment. The Field and main battle decision surface fit the 1280×800 window without page scrolling; long Tavern catalogs and detail views intentionally scroll.

Graphical checks caught and fixed: the first layout pushed the player below the viewport (revealed cards moved to the side); Chromium's drag test needed a real multi-step gesture for unsocketing; obsolete Tavern rendering still assumed the old three service names and failed on the new Healer/rest/gossip areas (replaced with the new service renderer). A local text-encoding failure occurred before a UI edit was saved; the unchanged file was recovered from Git and edits were reapplied in UTF-8. No user changes were overwritten.

Assessment: the requested actions and constraints are materially more visible, and the full run still works. Combat uses lightweight projectiles, impact flashes and dissolve effects rather than bespoke character animation. The Tavern uses highlighted service areas over generated interior art. Remaining balancing questions and bot strategy improvements are recorded in AI_REPORT.md; they are not blockers for this polish delivery.

Verification recorded at 2026-09-27T00:24:48.266481+00:00. Estimated additional active implementation/QA time for this polish: **35–40 minutes across two working sessions**, separate from the original v1 build. First logged session: 17:39–18:04 EDT; resumed work approximately 20:14 EDT through delivery. The roughly two-hour response gap is not counted as implementation time. Total elapsed round time is about 2 hours 45 minutes. Token usage for this polish is estimated at 35k–55k; no authoritative token meter is available. One agent; no delegation. Final packaging and local commit follow; no push.


## Post-build polish — optional Field item pickups, round 2

Jonathan requested the ability to refuse ordinary item pickups, while Events may make receipt compulsory or optional according to their authored outcome. Updated the main design to v4.36 using fresh, guarded replacements, and implemented Collect / Leave item in v1.

Decisions: leaving permanently forfeits this revealed pickup without adding the item/card or applying a Curse/Hex. It does not refund the movement used to enter an occupied tile; other tile contents and the normal round flow still resolve. Event consequences retain their authored choices. Gem/Setting battle rewards retain their existing collection flow. A pending pickup in an older save gains the decline option without rerolling.

Rules/package 1.2.1; policy weighted-druid-v1.2 scores declining at zero against the existing item value/risk estimate. Action and observation schema versions remain 1. Accepts saves from 1.0.0, 1.1.0, and 1.2.0.

Validation: 48 tests pass, including refusal without curse effects, normal forced equip when accepted, continued tile/round resolution, old-save stability, Item Deck Hex refusal, and unchanged Event consequences. Packaged UI checks exercised both buttons with an explicitly constructed cursed-pickup save, verified persisted state, and found no renderer errors; screenshot reviewed. Five full headless seeded runs completed (2 wins / 3 losses); one used Leave item. Detailed evidence is in reports/item-pickup-verification.json and reports/item-pickup-evaluation/. Prior 100-run and full graphical victory reports are retained as 1.2.0 evidence, not relabeled as 1.2.1.

The first regression compared generated entity IDs across collecting versus declining; collecting correctly consumes an additional UID, so the comparison now checks gameplay state without those IDs. Full runtime recopy was blocked by a loaded DLL while the game was open. Added an explicit --app-only packaging option and updated the existing code/assets without terminating Jonathan's game; a newly launched packaged instance passed both interaction checks. Reopen the game to load the update.

Additional implementation/verification time: approximately 5 minutes, starting about 21:17 EDT on 2026-09-26; final archive refresh and local commit follow this entry. No push.


## Post-build polish — phase-arrow controls, round 3

Jonathan requested replacing the separate Begin Activation and End Turn buttons with arrows between the phases at the top of battle. Implemented automatic Reveal → Placement as a noninteractive arrow, a player-clicked Placement → Activation arrow, and a player-clicked Activation → Enemy arrow. Only the legal forward control is enabled. It is highlighted, pulses when no actions remain, supports keyboard focus/Enter, and provides a temporary hover/focus explanation. The current phase remains highlighted. No backward phase navigation or automatic ending of the player's decision phases was introduced.

Updated the main design to v4.37 with guarded, fresh-read edits. Package version is 1.2.2; rules remain 1.2.1 because this change affects presentation only. Existing rules, save compatibility, and AI action names remain unchanged, so the prior five-run AI report still applies to the same engine and policy.

Packaged verification: mouse advancement, disabled future/past arrows, removal of standalone text buttons, automatic next-turn Reveal/Placement, disabled controls during enemy playback, actual enemy damage, and keyboard Enter all passed without renderer errors. Placement and Activation screenshots were captured and the Placement layout visually reviewed. Evidence: reports/phase-arrow-verification.json and reports/screenshots/phase-arrows/. The test initially read the battle-start autosave expecting a live turn; corrected the test to check live UI turn/HP, preserving the designed restart-battle save behavior.

Additional implementation and verification time: approximately 6 minutes, starting 21:23:53 EDT on 2026-09-26, including the final archive refresh. Runtime files are retained using --app-only packaging to avoid interrupting an open game. Local commit only; no push.


## Post-build polish — Channel, paired spawns, and grouped enemies, round 4

Started 2026-09-26 21:30 EDT. Jonathan requested starting activation 2, more enemy icons representing multiple creatures, two spawns at a time with the next four pairs visible, and future difficulties with three/four simultaneous spawns plus higher monster odds at the hardest setting.

Implemented starting **Channel 2**, refreshing each battle turn; printed per-card activation limits and Channel costs remain unchanged. Field timing stays at 16 spawning rounds, now **32 entities across 16 pairs**. The second slot of pair 8 is the only Field Tavern; the second slot of pair 16 is the Archon. The remaining 30 slots use the existing weighted dice. Both members are placed before player collisions resolve. The preview rolls forward to keep the next four pairs visible, shrinking only at the end. The first four pairs exclude Eidolons. Restlessness remains after pairs 4/8/12, not every preview refill.

Builder choices: Bat, Bell Beetle, and Ashling icons are one member in rounds 1–4, uniformly one/two in rounds 5–10, and uniformly two/three from round 11 onward. Counts are rolled at spawn and fixed thereafter; earlier icons do not grow while waiting. One icon moves as a group and becomes independent full-HP targets, inheriting its Restlessness. All targets must be defeated; their shared Field icon is removed once. Ordinary Mote Gold retains 18 per defeated creature; there is still one card reward offer per battle. No extra enemy cap is introduced. Group counts are visible on Field icons and in inspection; battle members have separate IDs/HP/status/Tells. Enemy inspection now uses the clicked member's live data instead of only its species definition. The policy subtracts additional travel risk for larger visible groups.

Updated the authoritative design to v4.38 using guarded read-before-write edits, reconciling the old spawn counts/examples, resource table, Restlessness, v1 scope, and future difficulty section. Future three/four-spawn settings retain 16 spawning rounds (48/64 total), and monster-heavy hardest-mode odds remain future tuning. No harder difficulty selector was implemented in v1.

Versions: package/rules 1.3.0, content 1.1.0, weighted-druid-v1.3; action/observation schema versions remain 1 (queue stays a flat ordered list of types, now grouped by two, with additive spawnWidth and enemy count fields). Saves 1.0.0 through 1.2.1 load. Legacy queue entries become second members of pairs; companions are rolled once. Old progress doubles to preserve spawning-round timing, existing Field entities stay intact, and a saved battle gets its additional base Channel once. Current saves retain queues, group counts, and restart-target IDs without rerolling. Old exact replays need their original rules version.

Verification: **54 passing rules tests**. New regressions cover 100 preview schedules, atomic paired collisions, six distinct battle targets from two group icons, independent HP/status, complete-group victory/removal, group-size ranges, four-round Restlessness, Channel reset, deterministic migration, and restart stability. Five AI runs all won; 100-run robustness is **80 wins / 20 losses**, all terminal. AI_REPORT.md interprets those logs without attributing the result to a single isolated change.

Packaged graphical checks use policy-reached snapshots from seeds 825183/825184 for four-pair preview, group badge, three-Bat encounter, 2 Channel, and member inspection; no renderer errors or missing images. Visual review caught wrapping that pushed the fourth pair below the viewport. The Field now reserves room for one row of all four pair previews plus movement controls; 1280×800 fits without page scrolling. No new art identities were needed; repeated creatures use their existing art. The complete packaged run, initial seed 825184 through Watch AI, won at 47 HP in round 20; results, history, and save deletion passed in 88 seconds. Reports are in reports/pairs-*.

Additional active implementation/verification time: approximately **10 minutes**, including final report/package/archive work. One agent, no delegation. Runtime reused with --app-only to avoid interrupting an open game; local commit follows, no push.


## Post-build polish — movement visibility, phase pulses, Reveal, and card rewards/costs, round 5

Started 2026-09-26 21:45 EDT. Jonathan requested no whole-grid/icon darkening during movement and prominent forward-arrow pulses at exhausted Focus/Channel or when no corresponding actions remain. During implementation he added face-down dealing followed by individual flips during Reveal, exclusion of Blast/Shield from card rewards, a design-document once-per-turn/Blink rule, and free placement for Rain Lantern-like next-turn economy Objects.

Implemented:
- Input remains locked during presentation, but Field tiles/markers and player/equipment visuals retain their opacity. The same opacity preservation covers battle-grid cards during Reveal/other presentation.
- Placement-to-Activation pulses when Focus is zero OR no legal placement remains. Activation-to-Enemy pulses when Channel is zero OR no legal activation remains. A 1.2-second gold pulse and arrow nudge make the control conspicuous; the phase label itself no longer pulses. Legal zero-cost actions remain usable. Reduced motion uses a steady outline.
- Reveal captures the drawn hand as a presentation event without altering RNG/game state. Cards deal face down, then flip individually in drawn order. Reveal stays highlighted and controls locked until it finishes, then Placement begins automatically. Fast/Skip work; reduced motion retains sequential reveals without 3D rotation. Card backs use a local CSS ornamental design rather than a new raster asset.
- Blast and Shield are excluded from card reward pools. The starting deck and shop pools retain them. Pending older-save rewards replace only banned entries with deterministic, nonduplicate eligible cards of the same rarity, preserving other choices without consuming RNG.
- Rain Lantern, Clear Mind, and Tide Memory now cost 0 Focus to place. Rain Lantern's existing effect is +2 Focus next turn; it was not converted into draw. Clear Mind gives +2 Insight and Tide Memory +3 Insight next turn. Their activation costs and limits remain unchanged, and permanent Focus Energy still costs Focus.

Design updates are v4.39–v4.42, using fresh guarded edits each time. The once-per-turn default and printed Blink exception are **documentation-only in this update**, matching Jonathan's explicit design-doc wording; executable activation rules remain unchanged. The design distinguishes total activation allowance from per-turn availability, defines paid repeat activation with Blink, and reconciles Shield, Attune, and Cinder Snap examples. README and AI_REPORT flag this implementation boundary explicitly.

Package/rules 1.3.1, content 1.1.1, policy weighted-druid-v1.3. Saves through 1.3.0 load. Validation: 58 rules tests pass, including reward exclusion/migration, captured reveal order, state/RNG invariance, and zero-Focus placement with delayed bonuses and Channel costs. Packaged fixtures verify movement opacity for all 121 tiles during player and enemy movement, six pulse/nonpulse resource cases, free-card usability at zero Focus, reduced motion, all four reveal modes, next-turn Reveal, and automatic phase progression. Screenshots reviewed. Final five headless runs all won; no Rain Lantern/Tide Memory activation occurred in this small sample, so no balance claim is made for those cards.

Additional active implementation/verification time: approximately 12 minutes including the final graphical run and archive refresh. Runtime reused with --app-only to preserve the open user session. Reports are reports/readability-verification.json, reports/reveal-verification.json, reports/reveal-evaluation/, and the final graphical report. Local commit only, no push.

Final packaged verification: seed 825184 reached Stratum 1 Complete at 40 HP, round 19, in 102 seconds with no renderer errors. Results/history and completed-save deletion passed. See reports/reveal-playthrough.json. Final archive refreshed after this record.


## Post-build polish — matching Blast/Shield adjacency, round 6

Started 2026-09-26 21:57 EDT, while the preceding polish was being packaged. Jonathan requested +1 block for each Shield next to another Shield and +1 damage for each Blast next to another Blast. He also repeated the request for zero-cost Clear Mind; it was already included and remains 0 Focus / 1 Channel / +2 Insight next turn / total limit 1.

Implemented +1 per orthogonally adjacent exposed matching card, symmetrically: a pair gives +1 each; a row of three gives +1/+2/+1. Evaluate when activated, before elemental math and existing damage multipliers. Stored Shield block keeps its activation-time value. Exposed spent matching cards still contribute; diagonal, row-wrapped, covered, or Severed cards do not. Card text, on-grid activation values, detail controls, public legal-action effects, and policy placement scoring reflect the bonus. No printed activation limits or costs changed.

Main design updated to v4.43 with fresh guarded edits. Package/rules 1.3.2, content 1.1.2, policy weighted-druid-v1.4. Saves through 1.3.1 load. The pending documentation-only once-per-turn/Blink change is still clearly marked in README and AI_REPORT; it was not silently implemented as part of adjacency.

Verification: 62 passing rules tests, with new symmetry, live-layout, elemental-order, stored-block, and exclusion cases. Packaged UI shows both rows as 6/7/6, executes a 7-damage Blast, activates a boosted Shield, spends Channel, and pulses the Enemy arrow at zero Channel without renderer errors. Screenshot reviewed. All five full headless runs win; final HP 55, 29, 25, 65, 25. Current evidence is in reports/adjacency-evaluation/ and reports/adjacency-verification.json. The earlier full graphical victory retains its rules 1.3.1 attribution rather than being relabeled.

Additional implementation and verification time for this follow-up: approximately 5 minutes, including final archive/commit work. Preceding round 5 took approximately 12 minutes. One agent. Final distribution includes all notes completed in this working turn; local commit only, no push.


## Post-build polish — stop enemies on the player, round 7

2026-09-26, approximately 22:03–22:09 EDT. Jonathan requested implementation of design v4.44: enemies must stop on first reaching the player, let other enemies finish, then begin one battle against all arrivals.

Removed the Wanderer-only exception that allowed passing through the player. Every step-based move now stops at contact, including extra movement from Restlessness. Existing Pack arrival tracking keeps arrivals on the player through later triggers and normal movement without retriggering on the same arrival. Collision resolution remains after the entire enemy phase. Existing presentation frames show the actual shortened path and pause on arrival before other enemies continue; no animation rewrite was needed.

Package/rules 1.3.3, content 1.1.2, policy weighted-druid-v1.4. Saves from 1.3.2 and earlier supported versions load. The main design was already updated to v4.44 in the preceding documentation-only turn and required no further edits. Blink/once-per-turn remains a separate pending gameplay requirement.

Verification: all 66 rules tests pass. Updated the prior pass-through test and added first-contact/Restlessness, later-enemy completion, Pack chaining, diagonal contact, captured/headless state equality, and 1.3.2 save compatibility coverage. A packaged UI fixture confirms a Bat remains on the player while a Hunter moves through its remaining cells, then both enter the same battle; no renderer errors. Screenshots inspected. Five full headless runs all won, ending at 55, 29, 25, 65, and 25 HP (rounds 20, 19, 20, 19, 19). These outcomes match the previous sample, so they do not demonstrate a balance change; the targeted fixture directly exercises the changed rule. Evidence: reports/movement-stop-verification.json, reports/screenshots/movement-stop/, and reports/movement-stop-evaluation/.

Additional implementation, verification, and packaging time: approximately 6 minutes. Refreshed the runnable distribution and ZIP using --app-only to preserve the open user session. Local commit only, no push.


## Post-build polish — grid clarity, Resonance, and Equipped/Satchel, round 8

2026-09-26, approximately 22:09–22:15 EDT. Jonathan requested no Mind Grid slot numbers, a useful consumable-like Resonance, no equipped-item duplicates in Satchel, the Equipped label instead of Belongings, and drag-and-drop equipment movement in both directions.

Removed visible cell indices from occupied and empty slots; retained meaningful stack Levels, card values, internal targeting indices, and accessible slot labels. Resonance previously spent 1 Channel to gain 1, yielding no net gain. It now costs 0 Channel and grants 1, with a single use. Kept its 2 Focus placement and Isolated condition. Builder decisions recorded in design v4.45: no Recall or bonus uses, to prevent resetting/reusing the consumable; a placed Resonance expires at the end of the player turn even if unused or covered, goes to the battle's Destroyed pile, and is available again next battle. Covered expiration removes only Resonance, leaving the covering card intact. Its fading is announced during turn-end presentation.

Inventory now lists equipped items only in Equipped and loose items in Satchel. Socketed Gems remain attached to Settings, including after unequipping. Added a legal unequip action for Field movement and Taverns, respecting Curse locks and retaining movement allowance. Dragging either way highlights legal destinations, performs the action, and refreshes the still-open inventory. Item details also offer Unequip. The Tavern equipment view uses the same controls. The policy recognizes unequip and avoids pointless equip/unequip loops.

Package/rules 1.3.4, content 1.1.3, policy weighted-druid-v1.5. Main design minimally updated to v4.45 after reading the current shared file. Saves through 1.3.3 load. The general once-per-turn/Blink rule remains pending; Resonance's explicit single-use rule is implemented independently.

Verification: 70 passing rules tests; new cases cover zero-Channel activation, hard single-use allowance, no Recall, turn-end destruction including covered/unused cards, equipment ownership/Gem retention, movement timing, and Cursed equipment restrictions. Packaged UI verifies actual drag-and-drop in both directions, persistent inventory refresh, deduplication, Equipped label, unnumbered slots, Resonance's net Channel gain, exhausted action, and Destroyed pile at turn end. No renderer errors; screenshots inspected. Five full headless games all won (55, 29, 25, 65, 25 HP; rounds 20, 19, 20, 19, 19). Those runs did not acquire Resonance, so direct rules/UI tests establish its correctness; no balance claim is made. Evidence: reports/resonance-equipment-verification.json, reports/screenshots/resonance-equipment/, reports/resonance-equipment-evaluation/.

Additional implementation, verification, and packaging time: approximately 6 minutes. Used the frontend-design skill for restrained changes matching the existing game UI. Refreshed runnable distribution and ZIP with --app-only, preserving the user's open session. Local commit only; no push.


## Post-build polish — Druid starter and base Insight, round 9

2026-09-26, approximately 22:16–22:21 EDT. Jonathan requested four Blasts and four Shields in the Druid starting deck, base Insight 4, and retaining Focus 1 / Channel 2.

Added two Shields to new Druid runs, retaining Familiar, Clear Mind, Focus Energy, and Sapling, for 12 cards total. Raised base Insight from 3 to 4; Focus/Channel remain 1/2. Main design updated with fresh guarded edits to v4.46, specifying the Druid exception to the other classes' shared ten-card baseline. Existing saves keep their decks, including removals and rewards; base Insight changes on the next Reveal rather than retroactively redrawing an active hand. Start a new run for the new starter composition.

Package/rules 1.3.5, content 1.1.4, unchanged policy weighted-druid-v1.5. Saves through 1.3.4 load. All 72 rules tests pass, including starter counts, four-card opening/repeated Reveal, resource reset across turns/battles, and preservation of existing decks. The initial new test paused at a normal Bracelet defense choice; its base-resource fixture now removes equipment before testing automatic turn progression. Updated the delayed-Insight expectation from 8 to 9 for the new base. Packaged UI verifies four cards deal/reveal, displays 4/1/2 resources, and leaves eight in the Grimoire, without renderer errors. Screenshot inspected.

Five full AI runs all won: seeds 825183–825187 end at 25/19, 23/19, 29/20, 49/20, and 62/19 (HP/Field round). Extra draws and a larger deck change subsequent RNG consumption, routes, and choices, so these are not isolated estimates of either change's balance effect. Evidence: reports/druid-start-evaluation/, reports/druid-start-verification.json, reports/screenshots/druid-start/. General once-per-turn/Blink gameplay remains pending separately.

Additional implementation, verification, and release work: approximately 5 minutes. Updated distribution/ZIP using --app-only to preserve the open game. Local commit only, no push.


## Post-build polish — once-per-turn activation, round 10

2026-09-27. Jonathan requested that placed cards cannot activate more than once each turn by default, and asked to update the design if necessary. The main design already contained this rule; this update closes the previously documented gameplay gap.

Added lastActivatedTurn per card instance, independent of lifetime used allowance. All activation entry points consult the same eligibility check: normal legal actions, direct resolution, Pile members, and the covered Fusion Spell. Charge-building uses count even before damage releases. Movement/covering does not clear the marker. New player turns naturally restore the per-turn opportunity while retaining used total allowance. Recall retains its documented reset behavior on later placement. Unlimited-use cards such as Shield are still once per turn. Card definitions explicitly marked Blink may repeat while paying each activation cost and respecting total allowance, Freeze, conditions, and other restrictions. No existing cards were arbitrarily assigned Blink.

Activation buttons remain visible but disabled after use; cards say Used this turn while retaining their remaining total count. Details show Per turn: Once or the Blink exception and current state. When nothing else can activate, the existing Enemy arrow pulses even with unused Channel. Updated keyword help and removed the pending-implementation notice from README. Design v4.47 minimally clarifies stack/Charge and movement semantics without changing the already approved default.

Package/rules 1.3.6, content 1.1.5, unchanged weighted-druid-v1.5. Saves through 1.3.5 load; the normal save contract still restarts battles at their saved opening. Exact-state copies preserve activation markers. All 78 rules tests pass. New tests cover stale repeated actions rejected without mutation, next-turn availability vs permanent exhaustion, unlimited Shield, a temporary printed-Blink fixture paying for repeated uses, Pile member accounting, moved/restored cards, and Charge. Fusion's prior two-in-one-turn test now takes its second activation next turn. Packaged checks confirm disabled controls despite remaining Channel/uses, visible marker and pulse, detail popup, no-op disabled click, next-turn availability and eventual total exhaustion. The test initially waited on an intentionally disabled control; its intentional no-op click now explicitly bypasses Playwright's enabled precondition. No renderer errors; screenshot inspected.

Five full headless runs reached terminal outcomes: 3 wins / 2 losses. Seeds 825183–825187: win 51 HP/round 20; win 7/19; loss 0/20 against Cinder Hart; win 60/19; loss 0/19 against Void-Colossus. No balance or policy tuning was added to force wins. Evidence: reports/activation-turn-evaluation/, reports/activation-turn-verification.json, reports/screenshots/activation-turn/.

Additional implementation, verification, and packaging time: approximately 7 minutes. Updated runnable distribution and ZIP using --app-only to preserve the open user session. Local commit only, no push.


## Post-build polish — Druid card backs and faster overlapping Reveal, round 11

2026-09-27. While the activation-rule update was being packaged, Jonathan requested removing the game title from card backs, replacing it with something representing the Druid, approximately doubling Reveal speed, and making card animations shorter with overlap.

Replaced the ornamental star and ASTRATA lettering with an inline gold tree-and-roots emblem, retaining the green/gold frame. Used a code-native vector to match the existing ornamental card-back design; no new raster generation was needed. Deal animation is now 120 ms with a 70 ms stagger; each flip half is 140 ms and the next card starts after a short 60 ms gap following face exposure, overlapping the previous opening. Expose faces strictly in draw order and await all pending animations before leaving Reveal. A short final readability hold remains. Fast/Skip remain responsive, all running card animations are canceled on completion, and reduced motion reveals sequentially without 3D rotation.

Package 1.3.7; rules remain 1.3.6 and content 1.1.5 because this is presentation-only. The preceding once-per-turn rule is included. Main design updated minimally to v4.48 with the emblem, pace, and overlap requirements. The four-card normal Reveal measured 1,778 ms versus the prior roughly 3,320 ms nominal sequential schedule; two deals and two flips overlap. Packaged tests pass for Normal, Fast, Skip, reduced motion, and a subsequent battle turn, preserving card UIDs/order, input locking, and automatic Placement. No renderer errors. Screenshots inspected. Evidence: reports/druid-reveal-verification.json and reports/screenshots/druid-reveal/.

The 78 passing rules tests and five-run results from the preceding gameplay update remain applicable; no engine/policy changes were made in this follow-up. Additional implementation, verification, and packaging time: approximately 4 minutes. Refreshed the runnable distribution and ZIP without closing the user's existing game. Local commit only; no push.
