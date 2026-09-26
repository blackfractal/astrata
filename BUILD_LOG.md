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
