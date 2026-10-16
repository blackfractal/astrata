# The Apex — first playable build 4.0.0

2026-10-16 · Jonathan / Codex · BUILD_LOG round 203

The normal run now continues from the S3 transition Tavern through The Apex and ends after surviving victory over the Apex Predator. Launch `Astrata.cmd` or `release/Astrata/Astrata.exe`. No live player saves, history, settings, commits or remote branches were changed.

## Delivered

- Four rooms: 11×11, 9×9, 7×7, 5×5, center entry and quick ascent transitions. The first three have eight spawn pairs; pair four contains two distinct returning Archons from the corresponding Stratum.
- Visible Archon identity seals, fixed diagonal spawn positions, stationary waiting, explicit round-eight hunt deadline, combined fights including arriving ordinary enemies, central stairs after the first kill, and forced ascent after the second full encounter and its rewards.
- Stronger ordinary enemies and S1/S2 rematches, unchanged S3 Archon numbers, generous rematch rewards, full-service floor-three Tavern, and a final room without a movement clock.
- A 640-HP Chaos Predator using six moves with elemental attacks, telegraphed card destruction, Nausea/Insanity/Hypnosis, guardians, leeches and skitters. It commands its Ideons every turn and escalates direct damage. Exact moves and numbers are in the design document.
- New mountain/lava/crystal overworld and candle-lit meditation artwork, plus the winged wolf–tiger Predator and Rift Boar Eidolon. Existing enemy portraits remain recognizable.
- I Stand Alone's map-spawn ledger and final award, Predator defeat achievement, and existing Machine Elves retention/non-use eligibility reaching S4 completion. Full versioned run archives include the new rules sources.
- Existing 3.0.x saves remain loadable; an unfinished S3 run can progress into S4. A previously completed result is not silently converted into a new run. Normal battle Continue still uses its established opening checkpoint behavior.

## Implementation decisions

The first-playable snapshot in `_plans/stratum_4_planning.md` records all open choices resolved during implementation: spawn odds, scaling, 180 Gold per rematch Archon, rare/Legendary offer odds, optional good items, route reservations and Predator tuning. Preserve resources between floors without free healing. Ascend takes precedence if an enemy occupies its space. No new S4 companion, cards, tutorial, random Events or hidden-S5 implementation were added.

## Verification

- Full regression suite: **646 passed, zero failed** (`reports/apex-regression-tests.txt`). Sixteen new Apex tests include save/RNG preservation, both ascent routes, complete grouped encounters, all nine boss pairings across eight turns, shrinking bounds, rewards, achievements, telegraphs and the six-Ideon cap.
- Content/art audit: all required assets present with provenance; new images in `reports/apex-art-provenance.md` and the art manifest.
- Desktop checks cover introduction, all three moving floors, summit, Predator battle, paired battle and victory. They exercise resized-map actions, verify image loading, reject renderer errors and check the internal 1600×900 canvas does not scroll. Screenshots are in `reports/screenshots/apex`.
- Five complete sample Apex runs plus five direct Predator trials: all terminated normally, all lost. Two ascents reached floor three. See `reports/apex-ai-report.md`; initial states, decisions and frozen sources are retained. These authored carry-ins are not earned full-run wins.

## Limits and tuning

This is a first playable balance pass. No human-quality winning line through all four Strata has been established for this version. The current heuristic AI is weak at Ideon/formation management; its losses cannot determine balance by themselves. Paired S3 bosses and Predator endurance need player evaluation. Scripted victory checks verify the ending, not the difficulty of earning it. A Mind Hive pairing retains its existing player-first opening exception.

The new art uses the built-in image-generation tool, not DGX Spark. Initial restricted Electron launches failed in the graphics subprocess; isolated desktop verification ran successfully outside that restricted process environment. Test profiles are repository-local and do not touch the live game.

## Delivery verification

The packaged 4.0.0 executable passed all nine UI cases, including victory, with no errors, broken images or internal scrolling. `reports/apex-ui-verification.json` records the packaged run. The portable `release/Astrata-v4.zip` is generated with CRC verification and required-file checks; the prior v3 ZIP is retained.


### Predator art revision and Rift Boar

Jonathan reassigned the first boar/bison image to an Eidolon and requested a much more terrifying wolf/tiger or combined-predator final boss, potentially winged. The selected replacement is a winged wolf–tiger with saber teeth and dark-energy edges. This supersedes the original boar-like Predator art direction; its 640 HP and six-move mechanics remain unchanged. Crushing Tusks is now named Rending Fangs.

The Rift Boar is a native Apex Chaos Eidolon, Stalker, 135 HP. Cycle: Rift Gore (18 Earth), Cinder Breath (12 Fire then 12 Chaos), Rending Charge (22 Chaos, Pierce). Native numbers are not multiplied by the returning-enemy scaling. It joins the Eidolon pool on all three ascending floors, and its map spawn counts toward I Stand Alone. Earlier Strata cannot offer it. This is an initial implementation choice for its combat role.
