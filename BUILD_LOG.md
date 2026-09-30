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


## Post-build polish — horizontal 16:9 battlefield, round 22

2026-09-28. Jonathan approved 16:9 as the target aspect ratio after comparing Slay the Spire 2's fixed combat positions across aspect ratios. Requested implementation of the horizontal layout and recording these preferences in the main design. Applied the frontend-design skill to the existing painterly interface.

The game renders into a centered 1600×900 stage, uniformly scaled with black bars outside it. Windowed play uses 1280×720, 1440×810, 1600×900 or 1920×1080 presets (fitted to the monitor work area when necessary); free resizing/maximization is disabled and fullscreen remains available. Existing saved width preferences infer a 16:9 height. Combat keeps player/equipment left, Mind Grid center, enemy cards right, phase arrows/resources above and revealed cards below. Head/neck sit above the portrait, armor below, paired wrists/rings on either side. Legal bracelet blocks glow and can be selected directly from the wrist icon; passive armor feedback and first-attack ring readiness remain separate. A single foe receives a larger portrait; larger groups use a two-column local scroll panel, with acting/struck foes brought into view. Large hands scroll horizontally. Incoming defense occupies the bottom dock. Battle tools holds logs, rules and AI controls and stays open across AI actions. No encounter cap or gameplay change.

Moved existing bound UI nodes into the new composition, preserving card inspection, placement, on-board attunement, targeting, defense actions and inventory controls. Adjusted tooltips/modals for the play-area bounds and converted Field animation deltas from screen pixels into scaled stage coordinates. Projectile and burst coordinates remain in screen space. Refined equipment and status spacing after screenshot review. The shared design was freshly read before minimal changes to section 10.4.1, now v4.59.

Package 1.3.18; rules 1.3.10/content 1.1.9 and weighted-druid-v1.7 unchanged. All 110 rules tests pass. Packaged graphical checks verify identical virtual battle positions at 16:9, 4:3 and 21:9, bars and no stage overflow, non-resizable windows, size presets and fullscreen transitions, card/item/dialog inspection, drawer persistence after AI step, ten-card hand scrolling and actual placement of its last card, eight-enemy access, and a real bracelet defense from the glowing icon. Reran combat feedback checks (placement drag, conditional power, strong/weak/neutral drag previews, cancel and committed damage, resources/status tooltips, Reveal, Tavern upgrades) and all seven elemental impact checks including Fast, reduced motion and Skip. No renderer errors. Screenshots inspected. Test fixtures use isolated profiles and do not alter Jonathan's save. A first harness run stopped on an overly broad nested-summary selector; narrowed it and reran successfully.

Evidence: tools/horizontal-layout-ui-test.mjs, reports/horizontal-layout-verification.json, reports/screenshots/horizontal-layout/, refreshed battle-feedback and element-impact reports, AI_REPORT.md. This is a presentation change; prior five-run results remain applicable. No new full graphical run or balancing batch was performed. Small displays scale down all battlefield text; full card details remain available, and this build does not add a separate mobile layout or text-size setting.

Additional implementation, verification and packaging time: approximately 30 minutes. Runnable distribution and CRC-verified ZIP refreshed without closing Jonathan's running game. Local commit only; no push.


## Post-build polish — sole-choice double click and Transmute correction, round 23

2026-09-29. Jonathan requested double-click activation when only one target is possible, then reported that Transmute left a selected Blast looking Arcane rather than Water. Added the shortcut to on-grid activation controls: a single click opens the existing target flow; double click commits only when one complete legal action remains after any prior choices. Fresh legal-action lookup, busy guarding and normal engine validation prevent duplicate spends or bypasses. Multiple elements/targets/destinations remain explicit. Targetless charging and other immediate effects retain their one-click behavior. A sole-target tooltip describes the shortcut.

Transmute was changing the live element, but full card details displayed the printed element, and Attune ignored the changed element during activation. Builder decision: Transmute fixes the chosen element for that placement, including explicit Arcane, overriding neighboring Attune choices; leaving the grid and being placed again resets it. It does not retroactively recolor existing Shield portions. Added a placement-local transmuted flag, recognize older changed-element instances, and show the element in modified card names, full details and current-state help. Shared glossary explains the interaction. The main design was freshly read and minimally updated to v4.60.

Package 1.3.19; rules 1.3.11; content 1.1.9 and weighted-druid-v1.7 unchanged. All 114 rules tests pass, including Water damage against Fire despite a Fire neighbor, mixed old/new Shield portions, live state reload, Arcane override, reset on fresh placement and legacy changed elements. Packaged UI tests verify sole-target double clicks spend once, single-click/Cancel behavior, multiple enemies, multiple attunements and a subsequent sole choice, inert unavailable cards and targetless Kiln charging. A real Transmute → Blast → Water flow visibly produces Water Blast and its full Water details, then the double-click attack deals 6 Water damage to Fire. No renderer errors; screenshot inspected. Initial test harness assumptions about Playwright clicking disabled controls and one neighbor yielding multiple Attune choices were corrected; production rules for ordinary Attune were preserved.

Five headless runs (825183–825187) completed: loss, win at 4 HP, loss, loss, win at 15 HP, matching prior outcomes. None activated Transmute, so these confirm general playability only; focused rules/UI checks cover the fix. Evidence: reports/double-activation-verification.json, reports/transmute-verification.json, reports/transmute-evaluation/, reports/screenshots/transmute/, tests/transmute.test.mjs and the two corresponding UI scripts. AI_REPORT.md records the five-run interpretation and coverage limit.

Additional implementation, verification and packaging time: approximately 12 minutes. Runnable release and CRC-verified ZIP refreshed. Jonathan's running game and saved profile were not closed or changed. Local commit only; no push.


## Post-build polish — Ward activation allowance, round 24

2026-09-29. Jonathan requested reducing the Ward card from three activations to two because it felt too powerful. Changed only its printed total allowance, retaining 10 ward value on placement, +10 per activation, Isolated placement and existing spent-Ward absorption. Living Lattice already has two activations. Limits are read from current content, so existing owned copies use the new limit after restart. Freshly read and minimally updated the design's Ward row and changelog to v4.61.

Package 1.3.20; content 1.1.10; rules 1.3.11 and weighted-druid-v1.7 unchanged. All 114 tests pass. A direct engine check activated Ward across two turns, verified no third legal activation, then confirmed remaining value still absorbed an enemy attack while exhausted. The packaged content was checked for limit 2. Five headless seeds 825183–825187 completed with the same loss/win4/loss/loss/win15 outcomes. None activated Ward, so this sample is a general playability check, not evidence of card balance. No new graphical run was needed for the numeric content change; the UI derives allowance from this definition.

Evidence: reports/ward-limit-verification.json, reports/ward-limit-evaluation/, AI_REPORT.md. Additional implementation, verification and packaging time: approximately 4 minutes. Runnable distribution and CRC-verified ZIP refreshed; Jonathan's running game was not closed. Local commit only; no push.


## Post-build polish — zero-HP defeat and Stone Golem activation, round 25

2026-09-29. Jonathan requested flooring player HP at zero before showing You Died, following discussion of Stone Golem starting at 10 HP and gaining 6 HP plus temporary Taunt on activation. Implemented both. Lethal damage previously captured a negative-HP battle snapshot before finish() clamped the final result. Clamp now happens before the hit snapshot, and public observations also clamp player HP. The hit animation finishes with 0 HP before the existing You Died screen; the transition label now says You Died instead of Journey complete on defeat. Full incoming damage numbers and damage statistics retain their existing meaning.

Stone Golem starts at 10 HP, retains Focus 2 / Channel 1 / one activation, and gains +6 current and maximum HP when activated. This is growth, so the Ally remains on the grid rather than following healing-card destruction. A wounded 3/10 Golem becomes 9/16. Taunt lasts through every enemy attack in that round, then expires before the next player turn; growth remains. New Taunt replaces the old holder as before. Added a visible Taunt symbol, current-state help, and an activation label stating +6 HP and Taunt. Main design freshly read and minimally updated to v4.62, including the explicit maximum-HP growth exception.

Package 1.3.21; rules 1.3.12/content 1.1.11; weighted-druid-v1.7 unchanged. All 118 rules tests pass. Focused tests cover lethal attack/status snapshots, 10→16 growth, wounded growth, single allowance, survival without healing-card destruction, repeated interception in the same enemy phase, expiry and optional interception later. An existing Taunt fixture now derives its expected HP from the new base. A new fixture initially expected a defense choice on Bell Beetle's non-attacking Harden turn; corrected it to use its next attack, Crack. Packaged UI checks sample rendered player HP throughout a lethal hit, verify no negatives and 0 HP before You Died, then exercise actual Golem activation, HP bar 10/10→16/16, Taunt badge, interception and next-turn 12/16 without Taunt. No renderer errors; screenshots inspected.

Five headless runs completed (825183–825187), still two wins and three losses. Seed 825183 used an unactivated 10-HP Golem and reached Cinder Hart at 27 HP rather than the prior 40, losing after nine boss turns. Other outcomes stayed win4/loss/loss/win15. No run activated Golem, so focused rules/UI tests cover its new ability; this small batch is not a balance conclusion or policy training. See AI_REPORT.md.

Evidence: tests/golem-defeat.test.mjs, tools/golem-defeat-ui-test.mjs, reports/golem-defeat-verification.json, reports/screenshots/golem-defeat/, reports/golem-defeat-evaluation/. Additional implementation, verification and packaging time: approximately 9 minutes. Runnable distribution and CRC-verified ZIP refreshed without closing Jonathan's game. Local commit only; no push.


## Post-build polish — Rootbound Ring projectile origin, round 26

2026-09-29. Jonathan requested that Rootbound Ring's first-attack bonus hit visibly launch from the Ring rather than from the activating card. Equipment damage now carries its source item UID in presentation metadata. The renderer resolves that exact equipped icon (either finger slot), briefly highlights it and launches the bonus projectile from its center to the enemy. Card hits retain their card source. The same metadata also handles other equipment-generated damage. Shared activation context, element, hit order, first-attack gating, damage, resources and RNG are unchanged. Reduced motion uses the stationary Ring highlight and impact without projectile travel; Skip and completion remove the highlight and effects.

Package 1.3.22; unchanged rules 1.3.12/content 1.1.11 and weighted-druid-v1.7. Main design freshly read and minimally updated to v4.63. All 118 rules tests pass. Packaged graphical checks measure projectile starting coordinates against the actual Ring icon, verify separate card/Ring origins, left and right finger placement, a socketed Water hit reduced to 1 damage and the normal 2-damage hit, no second proc on the next attack, and cleanup under Normal, Fast, reduced motion and Skip. No renderer errors; screenshot inspected. An initial transient-class polling check missed a short reduced-motion highlight; its MutationObserver had recorded the correct event, so the harness now waits on that durable record.

Evidence: tools/ring-origin-ui-test.mjs, reports/ring-origin-verification.json, reports/screenshots/ring-origin/, AI_REPORT.md. Prior five-run evaluation remains applicable; no new gameplay batch for this presentation-only change. Additional implementation, verification and packaging time: approximately 8 minutes. Runnable distribution and CRC-verified ZIP refreshed without closing Jonathan's game. Local commit only; no push.


## Post-build polish — status damage bypasses attack defenses, round 27

2026-09-29. Jonathan clarified that incoming-hit reduction should apply only to enemy attacks, not ongoing Burn, Poison, Corrode or effects already affecting the player. Corrected the wording misunderstanding: Husk Armor subtracts 2 damage from each enemy attack; it does not negate two attacks. Status ticks now go directly to player HP, bypassing leftover Bracelet block, flat Armor reduction, elemental Armor resistance and reflection. They no longer highlight Armor as a defending item. Bracelets retain their remaining block, refill normally, and protect against enemy attacks. Healing and status clearing remain unchanged. Updated Husk, Stone and elemental Armor descriptions plus status tooltips. The main design was freshly read, minimally updated to v4.64 and explicitly supersedes the older intentional status-mitigation rule. No change to status timing: the displayed counter after a tick is the next tick's value.

Package 1.3.23; rules 1.3.13/content 1.1.12; weighted-druid-v1.7 unchanged. All 125 rules tests pass, including seven new regressions for status bypass, opening/increasing Husk Corrode, per-hit subtraction, preserved bracelet/armor ordering and attack-only elemental resistance/reflection. Five background games complete: loss/loss/loss/loss/win6. The prior narrow win at seed 825184 becomes a loss, and seed 825187 wins with 6 rather than 15 HP. This confirms increased attrition in this sample, not a statistical balance conclusion. No policy retuning. Evidence: tests/status-defense.test.mjs, reports/status-defense-evaluation/, AI_REPORT.md. No new UI run for this rule/content change; presentation payload checks verify actual HP damage and absent Armor highlights.

Additional implementation, verification and packaging time: approximately 8 minutes. Runnable distribution and CRC-verified ZIP refreshed without closing Jonathan's running game. Local commit only; no push.


## Post-build polish — Glass Choir Chorus and on-death Final Note, round 28

2026-09-29. Jonathan requested replacing the fourth rotation move with Chorus, 10 Water damage, and moving Final Note to an on-death 12-Light attack warned in the enemy description. Added a content-defined death attack and serialized per-enemy trigger/resolution flags. It queues once before pending turn jobs or victory, uses the current normal defense chain, and keeps battle/rewards unresolved until completed. Killing with cards, equipment, statuses or reflection all follows the same path. Builder decisions: Final Note is exactly 12, independent of cycle/Restless/buff/half-health scaling; no defensive refill or extra preparation action; mutual death loses. Other enemies continue normally if alive. Choir remains visibly at 0 HP until its final attack finishes, then disintegrates. Warning appears on its battle card, in its hover description and full details. Recent saved enemy descriptions/rotations use current content. Main design freshly read and minimally updated to v4.65.

Package 1.3.24; rules 1.3.14/content 1.1.13; policy weighted-druid-v1.7 unchanged. Corrected the compatibility whitelist to accept the previously omitted rules versions 1.3.10–1.3.13. All 135 tests pass, including ten focused regressions for death timing, defenses, kill sources, duplicate prevention, saved defense state, mixed/multiple-enemy battles, and old saves. Isolated packaged UI checks cover warnings, Chorus details, defense choices at zero enemy HP, Final Note before rewards/defeat, Fast/reduced motion/Skip and effect cleanup. No renderer errors; screenshot inspected. Screenshot review caught simultaneous Activation/Enemy highlights during the new out-of-turn response; only Enemy now highlights. Death resolution now preserves the incoming attack name as the defeat cause, so the loss screen identifies Final Note. The first UI test used a nonexistent selector; corrected the harness to the existing incoming-attack class and reran successfully.

Five complete background runs retain the preceding loss/loss/loss/loss/win6 outcomes. None reached the Choir, so focused tests cover its new mechanics; no claim of balance or AI training. Evidence: tests/choir-final-note.test.mjs, tools/choir-final-note-ui-test.mjs, reports/choir-final-note-verification.json, reports/screenshots/choir-final-note/, reports/choir-final-note-evaluation/, AI_REPORT.md.

Additional implementation and verification time: approximately 16 minutes. Runnable release refreshed and tested without closing Jonathan's game. Jonathan added Chaotic Glare before final delivery; both changes will ship in the next packaged ZIP. Local commit only; no push.


## Post-build polish — Void-Colossus Chaotic Glare, round 29

2026-09-29. Before final delivery of the Choir change, Jonathan requested Chaotic Glare as Void-Colossus's fourth move: two base-10 Fists, Collapse, then a random element change affecting both attack and defense. Added a non-damaging seeded choice from all seven elements; subsequent Fists use the enemy instance's current element, and the existing damage matcher already uses that same live element for incoming attacks. Battle display, Tells and full rotation details update after Glare. Builder decisions: equal chance for each element, including the current element; persist until the next Glare and across saves; retain ordinary cycle/Restless/buff/half-health damage scaling; retain the Chaos-hit Mini-Void trigger regardless of current form. No random outcome is shown before the move resolves. Description/counterplay updated, and the freshly read main design minimally updated to v4.66.

Package 1.3.25; rules 1.3.15/content 1.1.14; weighted-druid-v1.7 unchanged. All 147 rules tests pass. Twelve added tests cover opening Chaos, the full cycle, every possible element, two matching-element attacks, Water +50%/Earth -50% against Fire, neutral Arcane, persistent Chaos-hit summoning, deterministic replay, saved live element, old-save migration and read-only Tells. Packaged UI fixtures exercise Fire and Arcane, no damage on Glare, visible element and attack updates, details and both subsequent 11-damage Fists (10 base plus one completed cycle). No renderer errors; screenshot inspected. Existing Choir rules remain in the full suite and its graphical verification is retained.

Five runs complete: loss/win9/loss/loss/win10. Seed 825184 changes from a Colossus loss to a win; 825187 improves from win6. The extra non-attacking turn and slower cycle scaling may make this version easier; no compensation or policy tuning was authorized or applied. These five seeds do not establish balance. Evidence: tests/chaotic-glare.test.mjs, tools/chaotic-glare-ui-test.mjs, reports/chaotic-glare-verification.json, reports/screenshots/chaotic-glare/, reports/chaotic-glare-evaluation/, AI_REPORT.md.

Additional implementation, verification and packaging time: approximately 9 minutes. Final runnable release and CRC-verified ZIP include both this and round 28's Choir changes. Jonathan's running game was not closed. Local commit only; no push.


## Post-build polish — matching-element Mini-Void inheritance, round 30

2026-09-29. Jonathan clarified that the current Colossus element should determine which damage summons a Mini-Void, and that each summon retains its birth element for attacks and defensive matchups independently of later Glares. Replaced the fixed Chaos trigger with equality against the Colossus instance's current element, copied that element onto the new summon, and made both Gnaw entries use the summon's own element. Existing neutral same-element damage, once-per-activation limit, 11 HP and alternating base-2/base-3 damage remain. This includes Arcane. Element-bearing equipment bonus hits use the same path. A matching killing blow still creates its summon, delaying victory until all enemies die. Descriptions, log text and the freshly read main design (v4.67) reflect the new rule; it supersedes round 29's retained fixed-Chaos decision. Existing saved summons retain their saved element; no retroactive inference from the parent's later form.

Package 1.3.26; rules 1.3.16/content 1.1.15; policy unchanged. All 158 rules tests pass, including eleven new regressions covering every element, nonmatching hits, once-per-activation behavior, neutral/strong/weak Fire examples, independent elements after Glare, save/resume, equipment procs and killing blows. Packaged UI verifies Fire damage → Fire summon → Water Glare with the boss becoming Water while the summon remains Fire, attacks for 2 Fire and shows 3 Fire next. Its full details retain both Fire attacks. No renderer errors; screenshot inspected.

Five background runs complete: loss/win9/loss/loss/win11. The final seed previously won10; other outcomes remain unchanged. The five-run sample is not evidence of overall balance and the policy was not retrained. See AI_REPORT.md. Evidence: tests/mini-element.test.mjs, tools/mini-element-ui-test.mjs, reports/mini-element-verification.json, reports/screenshots/mini-element/, reports/mini-element-evaluation/.

Additional implementation, verification and packaging time: approximately 7 minutes. Runnable release and CRC-verified ZIP refreshed without closing Jonathan's running game. Local commit only; no push.


## Post-build polish — live grid telegraphs and future Corruption/Shear design, round 31

2026-09-29. Jonathan requested a preparation-turn telegraph for the three Act 1 bosses and recording the later-act Corruption/grid ideas and third Act 3 boss's Vertical/Horizontal Shear. Confirmed asynchronously: Shear moves whole stacks across exactly three consecutive lines starting at the fullest, while Corruptions stay on their spaces. Freshly read and minimally extended the authoritative design to v4.68: section 3.2 specifies live previews, one normal player turn to respond, all-card counts and deterministic ties; future-only sections 11.5–11.7 record Memory Hole, Nausea, Insanity, Mind Mine, Hypnosis, Act 2 gating for both Corruptions and their dedicated counter-cards, recursive Act 3 Wildfire, wraparound Shears with formulas/examples, and larger-grid considerations. Unresolved future details are labeled instead of invented as settled rules. No future mechanic or larger board added to v1.

Implemented live outlines of the threatened row/column/stack, warning symbols on threatened cards, and enemy-side threatened-card counts with targeting/tie-break help. Refresh on every relevant board render, so Recall and placement can redirect the forecast. Actual selection remains at enemy execution. Shared pure gridTargets removes preview/resolution drift; additive battle.telegraphs observation data gives the AI the same visible information. No RNG consumption or hidden-state disclosure. Player gets the current Placement/Activation phases, not another free turn or extra action. Overlay borders do not intercept input; icons preserve card art/status/control readability. No animation or whole-board dimming. Destruction Tell wording changed from ambiguous raw 'row 1 · row' to 'Destroy fullest row' (and corresponding column/stack wording).

Package 1.3.27; rules remain 1.3.16, content 1.1.16; policy unchanged. All 166 rules tests pass, including eight added checks for deterministic ties, covered counts, live retargeting, actual destruction agreement, phase visibility and nonmutating observations. Isolated packaged UI checks all three bosses, Recall, drag placement, clickable activation controls, matching destruction and marker removal on normal turns. No renderer errors; screenshots inspected. No fresh five-run batch for a visibility-only change; AI_REPORT.md references the preceding evaluation. Evidence: tests/grid-telegraph.test.mjs, tools/grid-telegraph-ui-test.mjs, reports/grid-telegraph-verification.json, reports/screenshots/grid-telegraph/.

Additional design, implementation, verification and packaging time: approximately 17 minutes. Runnable release and CRC-verified ZIP refreshed without closing Jonathan's game. Local implementation commit only; shared design remains uncommitted and nothing pushed.


## Post-build polish — elemental state and visible card interactions, round 32

2026-09-29. Jonathan requested visible Shield attunement, Transmute color changes and Blast/Shield adjacency synergy. Added elemental borders, art tints and ribbons; per-portion Shield block chips retain their own element/value; Transmuted cards keep their current-element tint while preexisting block stays its original color. Attuned Blasts show their last resolved cast element only for the current turn. Uncommitted activation previews restore on cancellation. Available attunement swatches and hover/focus/selection links show neighboring sources. Persistent gold adjacency links and +N badges explain matching-card bonuses already included in activation values. Sever, covered cards and adjacency changes use the engine's shared helpers. Existing block is never recalculated retroactively. No gameplay element is changed by a visual cast tint. Danger outlines and status symbols remain distinct and controls remain clickable. Authoritative design updated to v4.69, then v4.70 with round 33 below.

Package 1.3.28; rules/content remain 1.3.16/1.1.16. Five new visual-model regressions; packaged UI verifies mixed Shield portions, actual Water activation, Earth Transmute preserving Water block, independent Arcane neighbor, matching +1/+2/+1 and source links, cancellation and next-turn cast reset. All three existing boss telegraph UI scenarios also pass with the new layers, including Recall, drag placement, activation and actual destruction. Screenshots inspected; no renderer errors. Discovered and fixed packaging's stale hardcoded 1.3.22: packaged package.json now reads the source package version. Evidence: board-interactions and grid-telegraph verification reports/tests/screenshots. Estimated additional implementation/verification time: approximately 25 minutes, including the initial work before context compaction. No new art generation or mechanics balancing.

## Post-build polish — durable run archives and measured disk use, round 33

2026-09-29. Jonathan asked whether a ten-run UI limit also limits saved history, prioritized debugging/statistics/version metadata, and asked about disk requirements. Confirmed existing desktop history already retains every completed result and the UI maps every entry (scrolling, not a ten-entry data cap). Existing results contain rules/content versions, summary statistics and action keys, but only the final 30 messages; unfinished/forfeited runs previously lacked permanent archives. Added section 10.10.1 to freshly read design (v4.70), requiring indefinite retention, provenance, incremental state/action/effect records, independent save/archive lifetimes and headless parity.

Added runs/<unique-ID>/ with append-only events.jsonl, metadata.json, latest.json and completed result.json, separate from Continue checkpoints. Every accepted action records structured choice, resulting exact state/RNG, emitted effects and all messages for that decision, controller identity and AI policy/weights/rationale. Initial/resume records preserve settings, chronology and version transitions; a battle rewind cannot erase prior attempts. Sources for engine/content/policy are captured once per build hash under builds/. Completed and forfeited logs are losslessly gzip-compressed with round-trip verification and atomic replacement. Completed results also retain actual executable version; legacy histories import without inventing missing build IDs/timestamps or lost events. Forfeit/new-game replacement retains the last actually played state, not just the battle-start checkpoint. Malformed history is not silently overwritten. All data stays local; archival hidden state is never fed to policy observations. Headless batches use unique archives even for repeated seeds; old run-seed.json/summary.json outputs remain latest-run convenience exports. Browser-only fallback retains localStorage records but is quota-limited; the packaged Windows app is the durable target.

Validation: all 178 tests pass (seven new archive cases plus round 32's five). Packaged UI proves 12 old results survive, a 13th is appended without duplication, unknown old build remains unknown, real human actions are structured, Abandon keeps a compressed archive, and saved build/rules/content appear in result details. Isolated profiles only; Jonathan's profile and running game were not changed. Two complete headless trials of seed 825184 both win with 9 HP after 308 decisions/19 Field rounds, agreeing with prior behavior and retained under different IDs. This is persistence verification, not a fresh balance evaluation or policy training. One full raw archive measured 2,876,324 bytes; the compressed counterpart measured 187,746 bytes, plus one shared 140,138-byte build snapshot. Excludes separate summary/convenience exports; run sizes vary. Compression preserved all 310 records. Evidence: tests/run-archive.test.mjs, tools/run-archive-ui-test.mjs, reports/run-archive-verification.json. Estimated additional implementation/verification/packaging time: approximately 20 minutes. Local commit only; shared design remains uncommitted and nothing pushed.


## Post-build polish — 7×6 Mind Grid playtest, round 34

2026-09-29. Jonathan explicitly requested expanding the current grid to seven columns by six rows to test room for future Act 2 Corruptions. Freshly read the current files and shared design. Updated design to v4.71: 42 spaces in the current v1/Act 1 playtest, spatial rules applied everywhere, initial resource/deck/card/enemy values unchanged, expanded layout and coordinate-preserving saves. Superseded the former future-only grid-experiment restriction; Corruptions and other Act 2/3 mechanics themselves remain future content.

Centralized columns/rows/size in content.mjs. Replaced fixed grid bounds throughout placement, Recall, activation, adjacency, row bonuses, corners, 2×2 square effects, Towers, Ally start-turn processing, corner Keystone, boss line selection and live telegraphs. Shift/Transmute already iterate the grid. The policy shares actual corner detection (weighted-druid-v1.8, unchanged weights). Battle observations/saves carry dimensions. Existing 20-slot saves expand by row/column coordinates, preserving whole stacks, card state and Shield portion owners/slots; checkpoints also migrate, without mutating input or consuming RNG. Old corners can become interior spaces because the board grew. Saves from rules 1.3.16 remain accepted.

Kept the fixed 1600×900 horizontal composition, with the arena increased to 550 design pixels tall and given more width. All 42 cells remain visible without scrolling; cells are about 140×85 design pixels. Player/equipment and enemy Tells stay on the sides, phase/resources above and a more compact hand below. Card names, activation controls, allowance, HP/status/element badges and matching links remain visible; long names/effects can be inspected in full. Temporary targeting controls sit over the inactive hand area instead of obscuring the bottom row. Existing art retained. Frontend-design guidance applied within the existing style.

Package 1.3.29; rules 1.3.17/content 1.1.17. All 186 tests pass (eight new dimension/migration cases; earlier spatial fixtures updated to equivalent coordinates). Packaged UI verifies 7 columns/6 rows, dragging and activating the final space, Transmute there, live synergy, Ally life bar, three simultaneous status symbols, card details and unobstructed targeting. Re-ran mixed Shield/Transmute/preview-cancellation interaction checks and all three boss telegraph cases, including Recall/drag retargeting and actual destruction. Screenshots inspected; no renderer errors. Evidence: tests/mind-grid.test.mjs, tools/mind-grid-ui-test.mjs, reports/mind-grid-verification.json, reports/screenshots/mind-grid/, plus updated interaction/telegraph reports.

Five seeded AI runs complete: loss/win13/loss/loss/loss for 825183–825187. Previously loss/win9/loss/loss/win11. The last Colossus run loses on turn 12; the other wins with 4 more HP. No compensating balance tweaks or policy training; five runs cannot establish overall difficulty. Detailed comparison in AI_REPORT.md and immutable compressed records in reports/mind-grid-evaluation/. Estimated additional implementation, visual verification, evaluation and packaging time: approximately 25 minutes. Runnable release and CRC-verified ZIP refreshed without closing Jonathan's app or changing his profile/save. Local implementation commit only; shared design remains uncommitted and nothing pushed.


## Post-build polish — right-side starter equipment, round 35

2026-09-29. Jonathan requested the initial Bronze Bracelet and Rootbound Ring start on the right instead of the left. New Game now equips them in wrist2/finger2. Starting Gem options resolve the actually occupied wrist/finger slots rather than hardcoded left slots, so both choices work for new runs and older saves paused at the opening Gem choice. Existing saved equipment is not rearranged. Design v4.72 records the right-side default. Package 1.3.30; rules remain 1.3.17, content 1.1.18; policy unchanged.

All 186 existing tests pass after updating starter-side assumptions in two fixtures. Direct smoke checks exercise both Bracelet/Ring Gem choices for both new right-side and legacy left-side opening states, verifying the socket and transition to intro. No new test suite or AI batch for a default equipment-side change. Estimated additional implementation, verification and packaging time: approximately 4 minutes. Runnable release and CRC-verified ZIP refreshed; Jonathan's running app/save untouched. Local commit only; nothing pushed.


## Post-build polish — visible Sever and stronger connections, round 36

2026-09-29. Jonathan requested more prominent connections and jagged purple lines on all four borders of Severed cards. Exposed Severed cards now have static purple zigzags with a dark outline, retain the status icon/tooltip, and have no incident connections. Clearing Sever removes the border and restores valid links immediately. General orthogonal adjacency has muted neutral links; Attunement uses the source element; Blast/Shield bonuses use brighter gold. Links have thicker dark-backed cores and endpoint markers, with hover/focus emphasis. Ordinary adjacency indicates connectivity, not an automatic numerical bonus. Existing controls and boss warnings remain available; no rules or balance changes.

Package 1.3.31; rules 1.3.17/content 1.1.18/policy v1.8 unchanged. Design v4.73 records the visual conventions. All 186 existing tests pass. Isolated packaged UI verifies four purple edges, no Severed links, card details and activation through the overlay, simultaneous boss danger markings, and Unbinding Dew restoring adjacency/Attune/synergy plus Fourfold damage from 6 to 12. Existing Shield portions, Transmute, canceled elemental preview, cast reset and matching-card interaction UI checks pass. Before/after screenshots visually inspected; no renderer errors. Evidence: tools/sever-connections-ui-test.mjs, reports/sever-connections-verification.json and screenshots/sever-connections/, refreshed board-interactions verification. No repeated AI balance batch for presentation-only changes.

Additional implementation, verification, documentation and packaging time: approximately 20 minutes. Runnable release and distribution ZIP refreshed. Jonathan's active application and profile were not modified. Local implementation commit only; no push. Opening Rite's Recall behavior was discussed separately: recommended unrecallable, with explicit first-turn Focus wording; no rule change made pending Jonathan's decision.


## Post-build polish — Fourfold pattern, elemental outlines and Opening Rite, round 37

2026-09-29. Jonathan requested up/down/left/right connections plus a diagonal to identify Fourfold Grove's block, Shield colors for chosen Attunement, no bright left stripe, and a translucent elemental art tint. He also approved making Opening Rite unrecallable.

Fourfold now marks the four perimeter adjacencies of one valid 2×2 plus its own diagonal to the opposite corner, with a 2×2 / ×2 badge. Hovering Grove emphasizes all five links. The pure squarePattern helper is shared with cardPower, retaining the existing first-valid-block order and single doubling. Broken/Severed groups disappear or retarget to another intact group. Base adjacency and other synergy links remain distinct. Removed the left ribbon; all placed cards use two-pixel elemental borders and 28% art tint. This also fixes border specificity so activated Shields visibly show the chosen element. Existing committed-cast/Shield-portion colors, mixed portions, Transmute priority and cancel/turn-reset behavior remain; visual attunement does not alter the element supplied to neighbors. Sever's purple border and boss warning outlines coexist.

Opening Rite begins placed, grants +1 Focus on the first turn only, and cannot Recall alone or via whole-stack Recall. Removed its obsolete manual-placement Focus refund. Existing saves are accepted; an already-recalled legacy copy is not forcibly moved, and resumes normal automatic opening placement next battle. Package 1.3.32, rules 1.3.18/content 1.1.19, design v4.74. Policy unchanged.

Verification: all 188 tests pass, including Fourfold in every block corner, alternate-block retargeting, Sever breaking the pattern, unchanged damage doubling, Opening Rite's opening/next-turn Focus, direct/covered Recall restrictions and previous-version save compatibility. Packaged UI passes the refreshed Sever/pattern and elemental interaction checks, including five pattern links/one diagonal/hover, actual Water Shield border and tint colors, absent ribbon, Transmute and preview cancel. Screenshots inspected; no renderer errors. Focused tests cover the small card-rule change; no new five-run balance batch or AI training.

Additional implementation, verification, documentation and packaging time: approximately 12 minutes. Updated runnable release and CRC-verified distribution ZIP; user's running app/profile left untouched. Local implementation commit only; no push.


## Post-build polish — stronger Glass Choir and finite Shields, round 38

2026-09-29. Jonathan found Glass Choir too easy and requested Shatter Hymn destroy the two most valuable piles (each whole pile counts as one target), Final Note deal 20 and bypass Wards/Shields but not Allies, and Shield have two activations like Blast. Existing keyword Cull is exactly this bypass; Bracelets and Armor still apply.

Shatter Hymn now selects two distinct occupied spaces, ranked by total printed Focus across their entire stacks, then total remaining activation allowance, then reading order. This value metric was proposed in an optional clarification; absent a reply, the recommended default was explicitly stated and applied. Unplaceable sentinel cost contributes zero. Actual allowance includes Keystone and ignores only per-turn usage for ranking; spent cards still retain their printed Focus value. Shared cardAllowance serves engine and ranking. Select both before destroying either, including every covered card; zero/one remaining stacks are handled naturally. Both are live-telegraphed; activation can change the tie-break ranking. Warnings, details and tooltips explain the metric. Other enemies' tallest-stack rules are unchanged.

Final Note is fixed20 Light Cull, with unchanged once-only death timing and no scaling; preserves Ward/Shield pools, permits Ally interception then Bracelet/Armor. Shield total base allowance2, default once-per-turn retained, Recall resets as usual, Keystone bonuses still apply. Existing saves are accepted; placed Shields retain uses already spent and can therefore be immediately spent under the new limit. Existing stored block remains valid until consumed/end of enemy phase. Package1.3.33/rules1.3.19/content1.1.20/design4.75; policyv1.8 unchanged.

All189 tests pass. Focused coverage: two distinct complete-stack targets, Focus over height, remaining-use/read-order ties, fewer than two stacks, previews matching execution; fixed20 death timing/lethality/status/reflection/multiple-death/save-resume; Cull preserves Wards/Shields and allows Allies/equipment; two Shield activations then spent and fresh-instance reset. Packaged UI verifies both danger spaces and live retarget after Recall/activation, actual destruction, allthreeboss previews,20LightCull warnings, normal/reduced/Skip presentation and death-before-reward. Screenshots inspected, no renderer errors.

Five completed archived runs825183–825187: loss/win9/loss/loss/loss; prior7×6 batch loss/win13/loss/loss/loss. Winning Colossus run309decisions vs311; other four outcomes and counts unchanged. None reaches Choir: targeted fixtures verify it, not a balance claim. No policy tuning. Fifth trial initially hit Windows EPERM during atomic archive metadata rename; retained partial records and retried only that seed successfully with a new run ID. Evaluation notes distinguish that attempt, and summary combines five completed exports. Evidence reports/choir-shield-evaluation/, updated choir-final-note/grid-telegraph reports/tools/tests, activation-turn test.

Additional implementation, verification, documentation and packaging time: approximately 15 minutes. Runnable release and CRC-verified ZIP refreshed. User's active application/profile untouched; local commit only, no push.


## Post-build polish — choose the exact event trade offering, round 39

2026-09-29. Jonathan requested that Bracelet-for-Grove-Titan open a Satchel-style selection containing equipped and spare Bracelets, allow drag-to-reward, and offer Back to the original Trade/Keep choices. He wants comparable card/item exchanges to follow this pattern. Previously Lantern Trader automatically removed the first non-Cursed equipped Bracelet and ignored spares.

Lantern Trader now declares an item/wrist trade. Shared tradeAssets enumerates owned matching instances, grouped Equipped/Satchel in new trade-ui.mjs; generic card offers use Grimoire and preserve upgrades/UIDs. Eligible candidates appear as individual legal eventChoice actions with tradeItem/tradeCard, also in costs. Invalid, missing, ambiguous, Cursed/Hex or still-socketed-Gem offers are rejected by the legal-action gate. Only the selected instance is surrendered, before the reward is granted. Equipped slots clear normally; socketed Gems remain owned and return to Satchel. This preserves prior removal semantics and does not allow free ordinary Gem setting outside Taverns.

Event screen retains one Trade button. Its modal shows asset/reward art and expandable effects, slot labels, Gem/upgrade details, selection highlight, drag-over reward highlight and explicit click confirmation. Drag onto reward commits directly; clicking selects then Trade confirms. Back/Escape/X/backdrop close only the UI and restore the original choice screen; inspecting/selecting/dropping elsewhere costs nothing. Commit rechecks current legal actions and prevents double submission. The new general exchange schema supports card/item requirements by ID/type/slot/rarity; no new event content or forced trades added. Existing Tavern mechanics retain their already-explicit item/card selection.

Package1.3.34/rules1.3.20/content1.1.21/design4.76. Weighted policyv1.9 deducts value of the exact offered item/card when comparing event rewards; weights unchanged, no training. Previous1.3.19 saves accepted, including ongoing Trader events. Exact offered IDs flow through existing persistent action archives.

All195 tests pass, including six new trade regressions: equipped/spare duplicate identity, Gem retention, keep-belongings ownership, enumeration without mutation, invalid/stale/Cursed offers, generic upgraded-card exchange/save/AI legality and specific item cost valuation. Packaged GUI verifies allthree Bracelets across Equipped/Satchel, detail inspection, Back/Escape leaving save bytes unchanged, drag equipped versus click spare, only chosen copy removed, reward exactly once, Gem retained, and one exact trade decision in archive. Screenshots inspected, no renderer errors. Evidence tests/event-trade.test.mjs, tools/event-trade-ui-test.mjs, reports/event-trade-verification.json and screenshots/event-trade/.

Five archived seeds825183–187 completed without errors: loss/win9/loss/loss/loss, decision counts367/309/195/177/388, unchanged from prior batch. Seed825186 completes an exact-instance Bracelet trade. Full immutable/compressed archives and build sources in reports/event-trade-evaluation/. Focused fixtures cover additional candidates and generic card exchange. No balance inference.

Additional implementation, verification, documentation and packaging time: approximately15 minutes. Runnable release and CRC-verified ZIP refreshed; active user application/profile untouched. Local implementation commit only, no push.


## Post-build polish — meaningful energy connections only, round 40

2026-09-29. Jonathan reported a needless connection between spent Focus Energy and Blast and requested links resembling energy flow. Removed all proximity-only adjacency lines. New pure boardConnections model emits effect-specific links: live-recipient Attunement; matching Blast/Shield bonuses; qualifying Fourfold block; neighbor-based damage/healing/growth and elemental activation requirements; same-element row damage; exposed corner Keystone's activation allowance. Fully spent recipients do not receive activation-benefit links, while spent exposed providers still contribute real passive effects. Matching pairs flow both ways only when both recipients retain allowance. Severed endpoints remain disconnected. No gameplay rules/content/policy changes.

Replaced thick connector bars and circular ports with gently curved glowing strands and animated bright pulses from provider to recipient; reciprocal benefits use opposing pulses. Short links sit clear of names and activation labels. Long row/column aura paths run through gutters and only become visible on source/recipient hover or focus. Fourfold retains its four sides and diagonal; hover emphasizes all five. Reduced motion uses static strands and never changes interaction or control behavior. Package1.3.35/design4.77, rules1.3.20/content1.1.21/policy1.9 unchanged. Design explicitly supersedes the neutral ordinary-adjacency links from v4.73.

All198 tests pass, including new assertions for no spent Focus/Blast link, one-way spent-provider matching bonus, no both-spent bonus link, Keystone recipient allowance, growth/neighbor damage, Sever, no state mutation and spent Attunement providers. Packaged UI checks absence of generic links and the reported false cable, animated/static reduced-motion CSS, Fourfold/Sever restoration, clickable controls and boss warnings; existing Shield tint/Transmute/preview/turn-reset suite passes. Screenshots inspected after moving paths away from labels; no renderer errors. Evidence updated board-interactions tests and both graphical verification reports/screenshots. No repeated AI batch for this presentation-only update; latest1.3.34 evaluation remains applicable to unchanged rules/policy.

Additional implementation, verification, documentation and packaging time: approximately12 minutes. Runnable release and CRC-verified ZIP refreshed. User's active app/profile untouched. Local implementation commit only; no push.


## Post-build polish — enemy elemental status immunity, round 41

2026-09-29. Jonathan requested Water enemies cannot suffer Burn, Fire enemies cannot suffer Poison, and Chaos enemies cannot suffer Corrode. Added one shared mapping and application gate for normal card effects, Kiln area Burn and Heat Fusion. Separate direct damage and other statuses retain their behavior. Immune attempts spend the normal activation and display/log immunity; enemy health panels, details and keyword tooltips expose the rule.

Decision: immunity follows current element. Chaotic Glare immediately clears the newly immune status; later changes do not restore it. Mini-Voids inherit immunity from their own persistent birth element. Player/Ally rules do not change. Previous saves remain compatible; loading clears prohibited counters in live battle/checkpoint copies without modifying the caller's save. Status scheduling and typed pending ticks also enforce immunity. Weighted policy v1.10 values status effects only against susceptible targets (including area Burn); weights unchanged, no training. Package1.3.36/rules1.3.21/content1.1.22/design4.78.

All208 tests pass, including ten new cases covering actual activations, all seven elements and three statuses, ordinary stacking, Kiln damage versus immunity, Fusion, tick progression, Glare transitions, legacy checkpoints and AI target choice. Packaged GUI verifies all three labels, live enemy details, paid activations with no prohibited counter, and archived immune feedback. Screenshot inspected; no renderer errors. Evidence tests/enemy-immunity.test.mjs, tools/enemy-immunity-ui-test.mjs, reports/enemy-immunity-verification.json and screenshots/enemy-immunity/.

Five archived headless seeds825183–187 complete: loss/win9/loss/loss/loss, rounds20/19/14/12/19, decisions368/309/195/177/388. Outcomes match the previous batch; first seed uses one additional decision. No crashes, illegal moves or stalls. Full versioned archives/source snapshots are retained in reports/enemy-immunity-evaluation/. This small sample establishes playability, not balance.

Additional implementation, verification, documentation and packaging time: approximately20 minutes. Runnable release and CRC-verified ZIP refreshed. User's running app/profile untouched; local implementation commit only, no push.


## Post-build polish — double-click the top enemy, round 42

2026-09-29. Jonathan requested double-click attacks the enemy currently in the topmost slot. The activation chooser now resolves enemy targeting from rendered top-to-bottom order, then revalidates the exact legal action before committing once. It retains chosen attunement and leaves unresolved multiple attunements, friendly-card targets and destinations explicit. Single-click/manual targeting and sole-choice/targetless shortcuts remain. After a kill, the next attack uses the new top enemy; no fixed UID or original enemy is remembered. Package1.3.37/design4.79; rules1.3.21/content1.1.22/policy1.10 unchanged.

All208 rules tests pass. Eight isolated packaged GUI cases pass: single-click/cancel, sole enemy, multiple enemies, reversed UID order and successive top-enemy kill, manually choosing the lower enemy, multiple attunements with subsequent top targeting, zero Channel, and targetless Kiln charging. Used-this-turn reactivation remains inert; no renderer errors. Updated tools/double-activation-ui-test.mjs and reports/double-activation-verification.json. Corrected its old 5-column attunement fixture for the current seven-column board. No AI rerun for this UI-only shortcut; preceding immunity evaluation remains applicable.

Additional implementation, verification, documentation and packaging time: approximately5 minutes. Runnable release and CRC-verified ZIP refreshed. User's running app/profile untouched; local implementation commit only, no push.


## Post-build polish — optional equipment block, round 43

2026-09-29. Jonathan requested allowing damage through without consuming Bracelet/item block. Equipment defense now offers skipEquipment, labeled Take hit — save item block. It advances the current hit to the player/Armor stage, preserving every remaining equipment block portion. Available separately per hit, including after partially blocking with one item; normal Armor resistance/reduction/reflection and on-hit statuses still resolve. No phase reversal or arbitrary partial block. Existing Ally takeHit still advances to equipment, with the new skip as a separate legal decision. Ward/Shield behavior unchanged (current Wards are FIFO automatic and Shields mandatory until exhausted, despite the request's comparison). Prior1.3.21 saves accepted. Package1.3.38/rules1.3.22/content1.1.23/design4.80/policy1.11.

Incoming panel and detail dialog expose the option; Bracelet tooltip explains preservation and passive Armor. Weighted policy explicitly recognizes skipEquipment but prefers useful block with its existing weights; no training. All212 tests pass, including four new regressions for retaining both portions, blocking a later hit, partial block then skip with Armor, per-hit/save compatibility/on-hit Burn, lethal damage floor and AI choice. Packaged GUI verifies panel/details skip,6HP first hit preserving2/3block, next hit using Bronze then skipping Silver for remaining2HP, and persisted state with no reaction loop. Screenshot inspected; no renderer errors. Evidence optional-equipment-block tests, UI tool, verification and screenshot.

Five archived seeds825183–187 complete without errors: loss/win9/loss/loss/loss, rounds20/19/14/12/19, decisions368/309/195/177/388, matching prior immunity evaluation. New legal action does not stall AI; focused engine/UI cases exercise intentional skipping. Full versioned compressed archives and build sources retained in reports/optional-equipment-block-evaluation/. Small playability sample, not balance evidence.

Additional implementation, verification, documentation and packaging time: approximately10 minutes. Runnable release and CRC-verified ZIP refreshed; user's running app/profile untouched. Local implementation commit only, no push.


## Post-build polish — personalized You Died, round 44

2026-09-29. Jonathan requested enemy+attack attribution, plain-language status deaths, and a fun sentence for each boss/Eidolon, always ending Another traveler may find a different way. Added pure death.mjs formatter and ten unique epigraphs (three Archons/seven Eidolons), retaining his exact Glass Choir example. Lethal reaction is passed into finish before status cleanup; lookup uses the actual source UID, including a dead Choir's Final Note. Status ticks report burning, poison or corrosion without assigning an original enemy. Burning Itch, Events and unknown/legacy causes have factual fallbacks; old attack-only records never invent a killer. Existing cause field retained for compatibility.

Persisted death object includes kind, relevant enemy ID/UID/name/tier/attack or status, summary, flavor and exact full message. Observation feeds both You Died and results/run history; state archives naturally retain the object, headless exports explicitly include it. Desktop and batch build snapshots now include the new death.mjs dependency. Victory behavior, lethal animation/zero-HP timing, RNG and combat decisions unchanged. Previous1.3.22 saves accepted. Package1.3.39/rules1.3.23/content1.1.24/design4.81, policy1.11 unchanged.

All219 tests pass, including seven new attribution/format regressions: actual pack member, three real status ticks before cleanup, all10 epigraphs plus future-enemy fallback, Final Note mutual death with observation/archive/save retention, Hex/Event/legacy fallbacks and victory exclusion. Six packaged GUI cases execute ordinary enemy, Eidolon, Choir Final Note and allthree statuses, checking exact death text, result.json and results-page attribution. Screenshots inspected, no renderer errors. Evidence tests/death.test.mjs, tools/death-ui-test.mjs, reports/death-verification.json and screenshots/death/.

Five complete archived seeds825183–187 retain previous outcomes/decisions: loss/win9/loss/loss/loss, counts368/309/195/177/388. Recorded killers are Cinder Hart/Stampede, Shard-Walker/Shard, Dervish Hunter/Slice and Mini-Void/Gnaw; the last correctly names the summoned enemy rather than Colossus. No errors/stalls, no training or balance inference. Full traces and build sources in reports/death-evaluation/.

Additional implementation, verification, documentation and packaging time: approximately10 minutes. Runnable release and CRC-verified ZIP refreshed. User's running app/profile untouched; local implementation commit only, no push.


## Post-build polish — map portrait and persistent attack traversal, round 45

2026-09-29. Jonathan requested the player's portrait inside the yellow Field circle, Gold as a filled circle within a circle instead of diamonds, and attacks traveling through defenders while displaying only actual losses. His follow-up specifies that the attack holds at the last card location until the next choice, with a HIT effect at every node. Corrected example arithmetic:30−5−6−2 leaves17, not7.

Field marker now nests existing Druid art in the gold ring and moves with the token; Gold uses a CSS circle/ring glyph, retaining its label. No new art generated. Incoming reactions retain lastNode and emit explicit pathFrom/pathTo, remaining damage and loss metadata. Wards, Shields, Allies, equipment block and player hits share the path emitter. Each leg starts at the last defender, including an empty slot after an Ally dies, across separate actions and saved state. Every new hit starts at its source enemy; status damage has no projectile. Outgoing player/Ring source behavior remains separate.

Loss labels use actual Ward/block consumed or HP lost, capped by available resource; elemental damage prevented and spillover remain independently calculated. Existing frame.amount/stat totals preserved. Destroyed Ally HP floors0 in presentation snapshots. Player overkill label caps to HP while raw attack accounting remains unchanged. A persistent elemental glowing orb at the last card/item displays remaining base damage while waiting for a defense decision; next flight removes it and the next impact restores it, or resolution clears it. Each stop uses its elemental hit burst. Reduced motion keeps a steady waiting orb and stationary bursts. Compact gear styling explicitly leaves this marker visible. Rules1.3.24/package1.3.40/design4.82; content1.1.24/policy1.11 unchanged. Prior1.3.23 saves accepted; older reactions without lastNode start at their known enemy. Defense order/optionality and combat balance unchanged.

All222 tests pass including three new path/resource regressions: Arcane30→Ward5→Ally6→Bracelet2→player17 with intervening save/load; weak Ally/elemental block accounting; new-hit reset, status no-projectile and player overkill. Packaged GUI verifies Druid portrait/movement and circular Gold, exact four projectile endpoint coordinates across clicks, losses−5/−6/−2/−17, four Arcane impact bursts, remaining25/19 parked on Ward/dead Ally until a choice, reduced-motion static marker/no flight, and visible hold on a depleted Bracelet before skipping remaining equipment. Screenshots inspected, no renderer errors. Ring origin regression passes normal/Water/right/reduced/Skip, expected damage and cleanup; refreshed its obsolete left-starter fixture and old grid-distance assertion for current layout. Evidence attack-traversal tests/UI tool/verification/screenshots and refreshed ring-origin verification. No AI batch repeated for this presentation change; latest death evaluation remains comparison evidence, not a new-version run.

Additional implementation, follow-up refinement, verification, documentation and packaging time: approximately15 minutes. Runnable release and CRC-verified ZIP refreshed. User's active app/profile untouched; local implementation commit only, no push.


## Post-build polish — immediate damage orb at impact, round 46

2026-09-29. Jonathan requested the numbered glowing orb appear immediately when an attack hits, making defense traversal feel continuous. The incoming projectile now shares the waiting orb's appearance and carries the current base damage number. At arrival, the remaining-damage orb appears in the same paint as the HIT burst, before the hit-flash pause and card disintegration. A viewport overlay keeps it independent of the dying card; after rendering, the waiting marker replaces it without a blank frame. Each subsequent choice resumes the numbered flight. Resolution and Skip remove transient overlays; reduced motion retains immediate stationary feedback. Package1.3.41/design4.83; rules1.3.24/content1.1.24/policy1.11 unchanged.

Three focused traversal rules tests pass. Extended packaged GUI verifies normal-speed and reduced-motion orb presence at every impact burst, visibility through Ally disintegration, flight numbers30/25/19/17, exact route and losses, hold through choices, depleted equipment hold, and cleanup. Four outgoing Ring cases (normal, Fast/right/Water, reduced, Skip) pass with no renderer errors. Existing map checks pass; screenshot inspected. No new AI batch or broad rules rerun for this presentation-only timing refinement.

Additional implementation, verification, documentation and packaging time: approximately10 minutes. Runnable release and CRC-verified ZIP refreshed. User's active app/profile untouched; local implementation commit only, no push.


## Post-build polish — The Whispering Weald, round 47

2026-09-29. Jonathan chose The Whispering Weald as Stratum 1's name: the forest is green, so Ashen did not fit. Renamed the introduction, enter action label, Field heading and location content, plus existing GUI/playthrough selectors. README and shared design now use the chosen name; historical build notes and archived runs retain their original wording. Package1.3.42/content1.1.25/design4.84; rules1.3.24/policy1.11 unchanged. No gameplay or art changes.

Verified a fresh isolated packaged run through class and Gem selection, the renamed intro/entry button and Field heading, with no renderer errors. Used locator waits for the existing transition animations. No new tests or AI batch for this text-only rename. Additional implementation, verification, documentation and packaging time: approximately5 minutes. Runnable release and CRC-verified ZIP refreshed. User's app/profile untouched; local implementation commit only, no push.


## Post-build polish — positional direct-click defense and 70 HP, round 48

2026-09-30. Jonathan requested implementing the previously discussed positional defense rule and clicking cards instead of selecting defenders from a bottom list. His follow-up raises Druid starting life from65 to70. New runs now begin70/70; loaded current/maximum HP is preserved.

Replaced automatic FIFO Wards and mandatory Shield→Ally stages with one positional choice pool: Wards, available Shield portions, and exposed living Allies in the current or more playerward column. Rows do not restrict defense. Each hit starts at column7; a chosen card establishes its column ceiling, and item block moves the hit beyond the grid. Equipment may be selected directly. Take hit skips all remaining cards/items while leaving passive Armor effects intact. Each separate/multi-hit resets. Retained printed Pierce/Cull, status bypass, covered-Ward permissions, Shield owner eligibility, once-per-hit Ally interception and elemental spillover. Ally weakness bonus clears when a non-Ally defense intervenes. Explicit Taunt/weakest targeting automatically selects a reachable Ally before ordinary choices; it cannot travel backward. This exception decision is recorded in design4.85. Existing1.3.24 saves load; lastNode infers position for older pending hits. Rules1.3.25/content1.1.26/package1.3.43.

Eligible cards have defense highlights and direct click/Defend; View preserves full details. Multiple portions or permitted covered Wards offer choices beside the selected card. Passed cards lose highlights and show Cannot defend with hover explanation. Bottom panel retains incoming damage, inspect and Take hit only. Equipment clicks remain direct. Existing numbered orb and elemental hit traversal continue between actual chosen nodes. Policyweighted-druid-v1.12 recognizes selectable Wards, caps defense benefit to incoming damage, and values farther columns to preserve closer defenders; no training.

All229 tests pass: seven new positional cases plus updated old-order/spillover/HP fixtures. Coverage includes column5 excluding6/7, same-column eligibility, Ally→Shield→Ward, stale-action rejection, per-hit reset, equipment-first and optional bypass, save/legacy position inference, special attacks/Taunt/weakest, mixed portions, AI preference, new70HP and preserved old health. Packaged GUI verifies direct clicks, local mixed-portion chooser, View, highlights/exclusions, retained portions, no bottom card list, route/orb and70HP. Normal/reduced traversal regression passes with exact resource losses and immediate orb. Screenshots reviewed; no renderer errors.

Five archived AI games825183–187 complete without errors/stalls: loss/win14/loss/loss/win12; rounds13/19/10/12/20; decisions225/300/185/175/364. Full versioned traces and source snapshots in reports/positional-defense-evaluation/. Two wins demonstrate end-to-end playability; this small sample combines rule, policy, and health changes and does not establish balance. Updated AI_REPORT with outcomes and limitations.

Additional implementation, verification, documentation and packaging time: approximately25 minutes. Runnable release and CRC-verified ZIP refreshed; user’s running app/profile untouched. Local implementation commit only, no push.


## Post-build polish — Druid takes the hit, round 49

2026-09-30. Jonathan requested selecting the Druid instead of the bottom Take hit button, and pulsing all possible defense choices including the Druid. During an ordinary defensive choice, the portrait now invokes the existing legal skipEquipment action (revalidated at click), preserving all unused defenses and resolving passive Armor normally. It supports mouse and keyboard; outside that choice, clicking the portrait again opens character details. Removed the bottom button while retaining incoming damage and the attack inspector.

Eligible cards, equipment and Druid share a gentle teal glow pulse without fading their art. Passed/depleted defenders do not pulse. Pulse runs only outside presentation frames, avoiding interference with hit/disintegration animation; reduced-motion mode uses steady highlights. Package1.3.44/design4.86; rules1.3.25/content1.1.26/policy1.12 unchanged.

Packaged graphical checks pass: six legal targets animate together, reduced motion disables pulse, mixed portions and passed columns remain correct, Druid keyboard selection takes13HP while preserving2Bracelet/3Ward/3Shield, portrait details return afterward, and no bottom action button remains. Incoming readout/inspector presence explicitly checked. Normal/reduced traversal and post-Bracelet Druid mouse-click regression pass, exact attack losses and orb cleanup retained. Screenshots reviewed, no renderer errors. No new rules tests or AI batch for this UI-only change; prior229 tests and five archived positional-defense runs remain historical evidence.

Additional implementation, verification, documentation and packaging time: approximately8 minutes. Runnable release and CRC-verified ZIP refreshed; user's active app/profile untouched. Local implementation commit only, no push.


## Post-build polish — status spell projectiles and bursts, round 50

2026-09-30. Jonathan requested a green Poison projectile and burst on the enemy, with matching Burn and Corrode effects. Successful status applications previously lacked visual frames (except area Burn); immunity had text-only feedback. applyEnemyStatus now emits explicit status/source-slot/value or immunity metadata for ordinary casts, area Burn and Heat Fusion. Area Burn no longer emits a duplicate frame. Typed enemy status ticks retain their status identity for stationary effects. These changes only expose presentation events, preserving counters, immunity, damage math, action costs and RNG. Prior1.3.25 saves load. Package1.3.45/rules1.3.26/design4.87; content1.1.26/policy1.12 unchanged.

Poison uses a bright green droplet with bubble sparks and green projectile; Burn reuses the fire shape/color; Corrode has a yellow-green fractured splash with shard sparks. Every cast travels from its source slot to the enemy, including immune attempts (labeled Immune). Tick feedback stays on the enemy without a new projectile. Status labels are compact and above the effect to preserve burst visibility. Existing elemental attacks and incoming damage paths remain separate. Fast/Skip/reduced motion retain their behavior; no generated assets required.

All233 rules tests pass including four new presentation regressions for three real status casts/immunity/source identity, area Burn once per target and typed status ticks. Packaged GUI verifies allthree status effects in normal/Fast/reduced modes, Poison immunity and Skip; actual card-to-enemy endpoints, distinct colors, centered bursts, particle counts, unchanged applications, cleanup and stationary later ticks. Screenshots inspected; no renderer errors. No AI batch rerun or training for this presentation-only change; prior positional-defense five runs remain historical evidence.

Additional implementation, visual refinement, verification, documentation and packaging time: approximately10 minutes. Runnable release and CRC-verified ZIP refreshed. User's running app/profile untouched; local implementation commit only, no push.


## Post-build polish — rust Corrode and player status sources, round 51

2026-09-30. Jonathan requested rust-colored metal corrosion, source-to-player effects for newly inflicted Burn/Poison/Corrode, and stationary player bursts for ongoing damage. Corrode now uses copper-brown #b86b45, pitted/fractured metal, dark corrosion holes, and rust flakes, with a matching mottled projectile. Poison retains green bubbles and Burn retains flames.

Friendly status applications now expose target, value and actual source item/enemy metadata. Battle-start equipment curses preserve original rules timing while presenting after battlefield/resource initialization and before the first tick/Reveal. Ring of the Ash Oath flies from its ring icon; Husk Armor from armor. Status-only enemy moves, Cinder Hart's half-health Burn and on-hit statuses fly from their enemy. Sludge's Ally-targeted Corrode ends on the actual oldest Ally. A source with no visible battlefield icon (unsocketed Weeping Garnet or Rust Hex) uses a labeled stationary application; no fabricated equipment origin. Player ticks carry typed metadata with a legacy job-name fallback and no projectile. Existing enemy casts/immunity/ticks remain intact. Counters, HP math, costs, RNG, decisions and AI policy unchanged. Package1.3.46/rules1.3.27/design4.88; content1.1.26/policy1.12 unchanged.

All237 tests pass, including four new source/target/order/legacy regressions. Packaged player-status GUI checks cover map-to-battle curses and three enemy application types in normal/Fast/reduced/Skip modes, actual source/target centers, three applications versus three stationary damage bursts, rust color and cleanup. Existing outgoing status GUI suite also passes (normal/Fast/reduced, immunity, Skip, stationary enemy ticks). Screenshots reviewed; no renderer errors. Evidence: reports/player-status-verification.json, reports/status-impact-verification.json, screenshots/player-status and status-impact. No AI rerun or training for this presentation-only change.

Additional implementation, verification, documentation and packaging time: approximately16 minutes. Runnable release and CRC-verified distribution ZIP refreshed. User's running app/profile untouched; local implementation commit only, no push.


## Post-build polish — gentler Fire Wolf Burn, round 52

2026-09-30. Jonathan requested reducing Fire Wolf's aggressive Burn 4 to Burn 2. Fire Bite now inflicts Burn 2; its printed 10 Fire damage and other moves remain unchanged. Updated the main design to v4.89, package to1.3.47 and content to1.1.27; rules1.3.27/policy1.12 unchanged. Future intents in continued battles read current content; already applied statuses remain as saved.

Verified actual Fire Bite resolution: 10 HP damage and Burn 2. All237 existing tests pass. No new tests, UI changes, AI training or balance batch for this single requested content adjustment; historical evaluations remain version-specific. Additional implementation, verification, documentation and packaging time: approximately4 minutes. Runnable release and CRC-verified ZIP refreshed. Local commit only, no push; user profile/app untouched.
