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


## Post-build polish — Ally life bars and battlefield targeting, round 12

2026-09-27. Jonathan requested visible Ally life bars and direct attunement/enemy selection by clicking or dragging highlighted battlefield objects instead of using a separate chooser window.

Added numeric, colored life bars beside the activation allowance on exposed Allies, leaving names/actions clear. Visual maximum tracks the highest HP reached during that placement, including initial upgrade/Bonded bonuses, growth, and healing. This is display metadata only: actual HP and uncapped healing/growth rules are unchanged. Legacy instances without metadata infer a display maximum from current and printed/upgraded HP; historical peaks cannot be recovered from those saves.

Replaced the activation modal with a temporary choice strip and highlighted battlefield targets. Attunement selects an eligible adjacent card; the selected element remains visible while choosing an enemy. Click highlighted objects or drag the activating card to each choice. Ally healing and Shift select grid cards/destinations the same way. Transmute uses inline element buttons for the abstract element choice. All choices are derived from the current legal actions; resource spending occurs only at final selection. Invalid selections do not inspect or act. Cancel/Escape spends nothing. Full card inspection remains available outside targeting and can initiate the same selection flow. Render cleanup removes pending highlights/listeners, and once-per-turn gating remains engine-owned.

Visual/interaction verification caught two issues before release: inserting a choice strip into document flow shifted drag destinations, so the strip is now anchored outside layout flow; the first life-bar position covered Ally names, so bars now share the numeric row. Test fixture gear was removed after its legitimate extra damage killed the intended test target, and the Shift fixture was corrected to the authored Quicksilver ID.

Package 1.3.8, unchanged rules 1.3.6/content 1.1.5 and weighted-druid-v1.5. Main design updated to v4.49 with minimal guarded edits. Frontend-design skill applied to match the existing green/gold interface. All 80 rules tests pass, including growth/healing scale and legacy metadata coverage. Packaged tests pass real clicks and drags through both attunement/enemy steps, canceled/invalid selection, HP bars without name overlap, healing updates, Shift destinations, and Transmute followed by attunement to the newly chosen element. No renderer errors; screenshots inspected.

Five refreshed headless runs retain the prior 3 wins / 2 losses, same HP/rounds: 51/20, 7/19, 0/20, 60/19, 0/19. Evidence: reports/battle-targeting-verification.json, reports/screenshots/battle-targeting/, reports/battle-targeting-evaluation/. No new full graphical playthrough is claimed.

Additional implementation, verification, and packaging time: approximately 14 minutes. Refreshed runnable distribution and ZIP with --app-only while preserving the user's open session. Local commit only, no push.


## Post-build balance — scarce healing and stronger enemies, round 13

2026-09-27. Jonathan requested Blast and Shield base strength 4 instead of 5, much rarer HP-healing cards that destroy themselves after one activation, and a modest increase to enemy life.

Implemented Blast damage 4 and Shield block 4, preserving +1 matching-neighbor bonuses and elemental multipliers. Chosen enemy adjustment: +15% HP, rounded up, written into all 23 enemy definitions including grouped encounters and summons. This increases small enemies by 1–2 HP in most cases; Archons become 115/102/106 HP. Attack damage, rotations and movement are unchanged.

Healing-card scope includes player and Ally activation healing: Soothe, Bloomcall, Sunfruit, Unbinding Dew and Aqua Veil. A central content rule makes these rare, single-use, unrecallable and immune to extra allowance. Resolve all effects, then immediately move the healer to Destroyed; using it at full health still consumes it. Fusion consumes only the covered healer and retains its covering card. Destroyed means unavailable until next battle, not permanent removal from ownership. Passive Ally growth, equipment healing and direct Event/Tavern recovery retain their existing behavior.

Scarcity decisions: no common healing rewards; healing cards receive weight 1 versus weight 4 for other rare cards, sampled without replacement for rare offers and Tavern stock. Each has a 25% inclusion chance in a new Item Deck. Warm Spring offers Rain Lantern instead of guaranteed Soothe to close that acquisition shortcut. Existing owned cards, queued Item Decks and revealed offers are retained; the new single-use card rules apply to owned healers. Existing battle enemies keep saved HP; future encounters use the new definitions. Older saves through rules 1.3.6 load.

Package 1.3.9, rules 1.3.7, content 1.1.6. Minimal fresh-read edits to main design v4.50 document the requirements and tuning decisions. All 86 rules tests pass. Two initial fixture failures were corrected: the restoration fixture must instantiate its deck card before reading battle-only fields, and a numeric expectation edit had accidentally changed a neighbor slot. The UI fixture's expected wording was corrected from “4 block” to the actual “Shield 4.” Packaged click/drag tests now pass with no renderer errors; screenshots inspected, including visible healed Ally HP and Destroyed count. Five complete headless AI runs: four wins/one loss, unchanged weighted-druid-v1.5; HP/rounds 6/18, 18/19, 41/20, 0/17, 38/19. Changed random acquisition paths prevent a controlled comparison with previous seeds. No full graphical playthrough or statistically established balance claim is made.

Evidence: tests/balance.test.mjs, reports/balance-verification.json, reports/screenshots/balance/, reports/balance-evaluation/, AI_REPORT.md. Additional implementation, verification and packaging time: approximately 15 minutes. Refreshed runnable distribution and CRC-verified ZIP using --app-only without closing Jonathan's existing game. Local commit only; no push.


## Post-build balance — starting equipment and enemy endurance, round 14

2026-09-27. Jonathan requested starting Bracelet defense reduced from 3 to 2, starting Ring damage increased from 1 to 2 but limited to the first attack activation each turn, and approximately 50% more HP for every enemy.

Bronze Bracelet now refills 2 block each enemy round. Rootbound Ring deals a separate 2-damage hit with its socketed element after the first activation that releases direct damage in a player turn. The turn marker is battle state, so it persists across exact-state saves and refreshes naturally with the next player turn/new battle. Area attacks use only their first target; Pile, Fusion and multi-element Prism cannot multiply the proc. Charge-building and status-only activations do not consume the opportunity. A negated opening attack consumes it, and a target killed by the card does not transfer the bonus to another enemy. Multiple equipped Rings each produce their own hit on the same first attack. Crown of Thorns and other equipment retain their printed triggers. Updated starting Gem-choice effect metadata to match 2 block/2 damage. Equipment shows a Ready/Spent badge and updated inspection text.

Enemy HP is ceil(previous HP × 1.5), applied once to all 23 definitions including grouped enemies and summons. This compounds on round 13's increase. Examples: Bat 10→15, Bell Beetle 14→21, Void-Colossus 115→173, Cinder Hart 102→153, Glass Choir 106→159. Saved active battle HP is preserved; subsequent encounters use the new values. Old saves through rules 1.3.7 remain loadable. Main design freshly read and minimally updated to v4.51, including Bracelet elemental examples and Ring edge-case decisions.

Package 1.3.10, rules 1.3.8, content 1.1.7. All 92 rules tests pass. Packaged UI verifies first and second Blast damage, one Ring hit, visible Ready/Spent/refresh, 2-block defense, revised descriptions and enemy HP. Initial UI fixture clicked equipment inspection instead of the actual defense action; corrected the fixture. Visual review found the initial badge overlapping the Ring name; moved it above the label and added an overlap assertion. No renderer errors; corrected screenshot inspected.

Five complete headless games with unchanged weighted-druid-v1.5: two wins/three losses. HP/rounds: 0/20, 4/19, 0/11, 0/12, 6/19. Narrow victories and earlier grouped-enemy losses suggest higher survival pressure in this small sample, not statistical balance proof. No full graphical playthrough is claimed. Evidence: tests/equipment-balance.test.mjs, reports/equipment-balance-evaluation/, reports/equipment-balance-verification.json, reports/screenshots/equipment-balance/, AI_REPORT.md.

Additional implementation, verification and packaging time: approximately 12 minutes. Refreshed runnable distribution and CRC-verified ZIP with --app-only, without closing Jonathan's existing session. Local commit only; no push.


## Post-build balance — Resonance placement cost, round 15

2026-09-27. Jonathan requested Resonance placement cost reduced from 2 to 1 because it is a one-use card. Changed only its placement cost; zero-Channel activation, +1 Channel effect, Isolated requirement, single use, no Recall/extra uses, and destruction at player-turn end remain intact. Fresh-read main design updated minimally to v4.52; README synchronized.

Package 1.3.11/content 1.1.8; rules remain 1.3.8. All 92 existing rules tests pass, including Resonance restrictions and expiry. Direct check imports the packaged engine and verifies legal placement at exactly 1 Focus, cost payment, activation from 0 Channel, no second use, and turn-end destruction. Five full AI runs retain the prior two wins/three losses and identical final HP/rounds. Evidence: reports/resonance-cost-verification.json and reports/resonance-cost-evaluation/. No new graphical playthrough or balance estimate is claimed.

Additional implementation, verification and packaging time: approximately 3 minutes. Runnable release and CRC-verified ZIP refreshed without closing Jonathan's game. Local commit only; no push.


## Post-build correction — elemental Ally spillover, round 16

2026-09-27. Jonathan reported that the weakness damage added against an Ally incorrectly persisted into subsequent Allies/the player. Confirmed two follow-up decisions: consecutive weak Allies share only the remaining bonus (6 Fire through two 2-HP Earth Allies leaves 5 base), and resistance converts overflow back to base (6 Fire through 2-HP Earth then 2-HP Water leaves 2 base). The original single-Earth example leaves 6 for the player before equipment.

Added a shared pure allyHit calculation. Incoming hit.damage remains base damage; weaknessElement/weaknessBonus track only the current weakness bonus. Ally HP absorbs bonus first, then base. Matching weak Allies share the remainder, including a zero bonus without regeneration. A changed matchup drops the old bonus and computes the new defender's interaction from base. Resistant damage is ceil(base/2); overflow converts to min(incoming base, 2×remaining local damage). This explicitly rounds each local calculation; 5 Fire against 2-HP Water passes 2 base onward. Neutral Allies subtract HP normally. Surviving Allies/Guardian swallow finish the hit; equipment receives base only. Per-hit state persists across exact-state saves and starts fresh for each hit. Existing normal save behavior still restarts the battle from its opening; old saves through rules 1.3.8 load.

Incoming attack displays and inspection previews share the engine calculation, including the leftover weakness component and each defender's actual base spillover. The baseline policy also uses this function and values base damage prevented; versioned weighted-druid-v1.6, unchanged weights. No new player element was introduced: v1 players remain without an inherent element and use existing equipment defenses.

Main design v4.53 records the confirmed rules and examples; the temporary open questions were resolved after Jonathan's answers. Package 1.3.12, rules 1.3.9, content 1.1.8. All 100 rules tests pass. Packaged click tests verify both preview and actual player damage for the 6, 5 and 2 examples. No renderer errors; screenshot inspected. Five complete AI runs: two wins/three losses, HP/rounds 0/20, 4/19, 0/14, 0/12, 15/19. No full graphical playthrough or statistical balance claim is made.

Evidence: tests/spillover.test.mjs, reports/spillover-verification.json, reports/screenshots/spillover/, reports/spillover-evaluation/, AI_REPORT.md. Additional clarification, implementation, verification and packaging time: approximately 14 minutes. Runnable distribution and CRC-verified ZIP refreshed without closing Jonathan's running session. Local commit only; no push.


## Post-build polish — resource expenditure and Charge targeting, round 17

2026-09-28. Jonathan requested Insight to count down as cards are revealed, all resource counters to refill immediately when ending the player turn, charge-building activations to require no enemy target, and Kiln to deal 30 damage to one enemy plus Burn 2 to all enemies.

Insight now shows remaining Reveal capacity and ends at zero even on a short/empty draw. Reveal presentation decrements it as each face turns up; Skip also finishes at zero. Actual Focus/Channel remain visible until spent or forfeited, so 0/0/0 truthfully indicates full use. End Turn refills the next-turn counters before enemies act, normally 4/1/2, including gear, permanent and queued bonuses; this does not reopen player actions. Enemy effects are reconciled before the next Reveal. Queued modifiers are consumed exactly once, and unused resources do not carry over. Legacy completed-Reveal saves normalize Insight to zero, preserving their draw budget as metadata.

Every charged card now has targetless charging actions until its next activation reaches the threshold. The card button shows the Charge being built, and charge actions declare no immediate damage. The releasing activation uses normal target rules; existing charges from Kiln's Fire neighbors can make it fire immediately. Kiln retains Charge 3, placement cost, allowance and upgrade behavior, and now deals 30 to one enemy plus Burn 2 to all living enemies. Secondary Burn still affects other enemies after killing the main target. Flicker negates the effect against that enemy only, consistent with existing multi-target rules; non-targeted Flickering enemies consume Flicker against the Burn. Burn application is shown during resolution. Charges still spend Channel/allowance and obey once-per-turn. Policy v1.7 values explicitly declared future charge effects; no broader training or weight tuning.

Main design freshly read and updated minimally to v4.54. Package 1.3.13, rules 1.3.10/content 1.1.9. All 107 tests pass, including resource modifiers, enemy Insight changes, old saves, all charged cards, release targeting, on-place charge, kills and Flicker. Packaged graphical checks pass all four Reveal modes, zero counters and immediate refill during enemy defense, targetless Kiln/Patient Seed charging and targeted Kiln release with Burn on both enemies. No renderer errors; screenshot inspected. Five full headless runs retain two wins/three losses, final HP/rounds 0/20, 4/19, 0/14, 0/12, 15/19. No full graphical playthrough or statistical balance claim is made.

Evidence: tests/charge-resources.test.mjs, reports/charge-resources-verification.json, reports/screenshots/charge-resources/, reports/charge-resources-evaluation/, AI_REPORT.md. Additional implementation, verification and packaging time: approximately 13 minutes. Runnable distribution and CRC-verified ZIP refreshed without closing Jonathan's running game. Local commit only; no push.


## Post-build polish — click-outside dialog dismissal, round 18

2026-09-28. Jonathan requested that Grimoire, Inventory and Menu close when clicking anywhere outside their window, in addition to the × button. Added shared backdrop dismissal for these and other dialogs. Only a click that begins on the backdrop and targets the backdrop closes it; interior clicks and drags from inside to outside remain active. Uses the existing close path, preserving Escape, × and AI pause/resume scheduling. Backdrop clicks do not activate underlying game controls.

Package 1.3.14; unchanged rules 1.3.10/content 1.1.9 and weighted-druid-v1.7. Main design minimally updated to v4.55. Packaged UI checks pass for all three windows: backdrop dismissal, interior click, drag out, ×, Escape, unchanged underlying game, and Inventory item inspection. No renderer errors. Evidence: reports/dialog-dismiss-verification.json. The preceding 107 rules tests and five-run evaluation remain applicable; no rules/content/policy changes were made, and no redundant gameplay batch was run.

Additional implementation, verification and packaging time: approximately 3 minutes. Runnable distribution and CRC-verified ZIP refreshed without closing Jonathan's running game. Local commit only; no push.


## Post-build polish — keyword help throughout the interface, round 19

2026-09-28. Jonathan requested mouse-over explanations for game terms wherever they appear, specifically asking why Locked Corner Flame can activate. Confirmed existing rules: Lock prevents Recall and Shift, not activation or legal covering; Freeze prevents activation. No gameplay restriction was changed.

Replaced the partial text-only keyword regex with a shared glossary annotator over visible DOM text and subsequent rendered updates. Added case-insensitive, whole-word aliases such as Locked, Frozen, Severed, Attunement, Charging, Siphoned and plural forms. Expanded definitions for resources, phases, card states, stacking, equipment, enemy movement/targeting and elements. Status labels, card detail facts, shop/reward descriptions and menu content now use the same definitions. Existing timed tooltip presentation is retained. Markup preserves displayed text and event handlers, excludes editable/native controls, art and tooltip contents, and does not create nested wrappers. Semantic abbreviation wrappers avoid existing layout rules for structural spans; Ally health text accepts hover without changing click bubbling.

Package 1.3.15; unchanged rules 1.3.10/content 1.1.9 and weighted-druid-v1.7. Main design freshly read and minimally updated to v4.56. All 107 rules tests pass again. Packaged UI verification checks Locked/Frozen/Severed, full card details, Ally HP, four-second expiry, actual 9-damage Locked Corner Flame activation and once-per-turn gating, Grimoire/Inventory annotations and dialog controls, 92 glossary terms/aliases, dynamic replacement, safe text preservation and repeat-scan idempotence. No renderer errors; screenshot inspected. An initial test incorrectly expected the pause menu to contain a game keyword; corrected that assertion (the menu's plain control labels need no definition).

Evidence: tools/keyword-help-ui-test.mjs, reports/keyword-help-verification.json, reports/screenshots/keyword-help/, AI_REPORT.md. Prior five-run gameplay evaluation remains applicable; no redundant gameplay batch was run. Additional implementation, verification and packaging time: approximately 15 minutes. Runnable distribution and CRC-verified ZIP refreshed without closing Jonathan's running game. Local commit only; no push.


## Post-build polish — resource focus, attack forecasts, status badges and upgrade help, round 20

2026-09-28. Jonathan requested a light box moving from Insight to Focus to Channel as each resource is used, conditional card damage that updates with the board, and elemental damage previews while holding an attack over an enemy, colored red/green and restored on cancellation. During implementation Jonathan added visible card-status symbols and upgrade-benefit tooltips in the Tavern.

Used a steady pale green resource outline matching the existing palette; it follows Reveal/Placement/Activation and disappears during enemy resolution/defense. Depleted numbers retain their separate red treatment. Applied the frontend-design skill to preserve the established interface. Thorn Choir's combat damage was already correct; the UI's separate formula omitted its adjacency bonus. Extracted grid-neighbor, card-power and enemy-damage math into shared pure helpers and use the rendered state for labels, including HP, upgrades, matching neighbors, rows, square patterns and magnification. Snapshot card identity uses UID for stack level. No rule or balance values changed.

Legal target hover/drag changes the source's number and shows a target badge with damage and expected HP loss. Positive/negative deltas supplement green/red. Uses the selected attunement, elemental cycle, Resist, Wisp, Guard and Flicker; Prism displays its four hits. Equipment, covered-card effects and delayed status damage remain separate, explained in hover help. Random attacks keep their range; charge-building has no target forecast. Leaving, dropping outside, Escape or cleanup restores the number without spending resources. Click targeting receives the same preview.

Added distinct SVG status badges for Lock, Freeze, Sever, Burn, Poison and Corrode, with numeric values on accumulating statuses. Used-this-turn, exhausted allowance and depleted Wards have separate symbols. Passive Allies with zero printed activations are not falsely marked spent. Kept full details and keyword definitions; replaced duplicate small status text with badges. Screenshot review found overlap with an Ally's allowance, so reserved badge space and made multi-row badges increase the slot's minimum height; assertions now check both controls and label separation. Upgrade offers show their authored benefit plus concrete damage/block/HP/healing/status changes; the offer tooltip takes precedence over nested keyword wrappers.

A guarded text-edit attempt stopped on an unmatched replacement; a later encoding error left polish-ui.mjs empty. Verified the file was exactly zero bytes, recovered only that empty file from the prior local commit, and reapplied edits using explicit UTF-8. No prior user work was lost. The final source and packaged application pass verification.

Package 1.3.16; unchanged rules 1.3.10/content 1.1.9 and weighted-druid-v1.7. Main design freshly read and minimally updated to v4.57. All 110 tests pass. Packaged graphical checks verify real placement/attack drags, damage 6→8 and 12/4/8 target previews, canceled-drag reset with no Channel spent, actual committed damage, resource highlight transitions, all adverse badges/tooltips, badge layout, and upgrade hover (Shield 4→7). No renderer errors; screenshots inspected. Prior five-run evaluation remains applicable; no redundant gameplay batch was run.

Evidence: tests/battle-feedback.test.mjs, tools/battle-feedback-ui-test.mjs, reports/battle-feedback-verification.json, reports/screenshots/battle-feedback/, AI_REPORT.md. Additional implementation, verification and packaging time: approximately 25 minutes. Runnable distribution and CRC-verified ZIP refreshed without closing Jonathan's running game. Local commit only; no push.


## Post-build polish — elemental spell collision bursts, round 21

2026-09-28. Jonathan requested a small explosion where a spell collides with a card, based on its element, with a generic gray star for Arcane. Added deterministic code-drawn SVG cores and eight short-lived particles: gray star (Arcane), orange flame/embers (Fire), blue ripples/drops (Water), ochre shards (Earth), mint curved gusts (Wind), violet jagged rupture (Chaos), and gold rays (Light). Projectile color uses the same palette. Effects appear at the center of the struck enemy, grid card, player or defending equipment after projectile arrival; hit-frame elements take precedence, while defense frames inherit the incoming attack's element. Damage numbers remain above the burst and input passes through it.

Effects overlap the existing hit-display interval rather than adding another wait. Fast uses the existing timing scale. Skip removes effects and bypasses remaining burst/death presentation. Reduced motion uses a stationary, gentle fading core without flying particles, projectile travel or hit shake. All transient nodes are removed through the existing presentation cleanup, including interruptions. No combat state, random values, rules, card content or policy were changed. The existing frontend-design skill guided palette and visual integration; these are code-native interface effects, not replacement card artwork.

Package 1.3.17; unchanged rules 1.3.10/content 1.1.9 and weighted-druid-v1.7. Main design freshly read and minimally updated to v4.58. Packaged UI tests perform actual attacks for all seven elements and an enemy Wind hit on an intercepting Ally, verifying distinct silhouettes, Arcane gray, target-center placement after projectile removal, particle count, pointer transparency and cleanup. Fast, reduced and Skip retain identical damage/final state; reduced has zero particles. No renderer errors. Arcane/Fire/Water screenshots inspected; test screenshots temporarily pause only effect animations at 130 ms to make appearance reproducible. The previous 110 rules tests and five-run evaluation remain applicable; no redundant gameplay batch was run.

Evidence: tools/element-impact-ui-test.mjs, reports/element-impact-verification.json, reports/screenshots/element-impact/, AI_REPORT.md. Additional implementation, verification and packaging time: approximately 8 minutes. Runnable distribution and CRC-verified ZIP refreshed without closing Jonathan's running game. Local commit only; no push.
