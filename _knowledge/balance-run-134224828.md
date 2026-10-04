# Run review: seed 134224828 — 2026-10-04

Jonathan asked why his just-completed run was too easy, specifically whether Gold Bracelet was responsible. The initial assessment preceded two follow-up requests: modestly strengthen all of Stratum2 and make Gold Bracelet more expensive. Package2.0.9 applies +1 damage per hit across normal Stratum2 enemies and raises Gold Bracelet from190 to300Gold; its7Guard remains.

## Evidence and scope

Run `e33bd36c-f04e-44de-9907-57c482cbf787`, won at 62/70 HP. Archive records **package 2.0.2, rules 2.0.0, content 2.0.1 throughout**. It did not use the later Loom pressure changes. Sources: local profile's metadata/result/events, read only. Full trace has 724 decisions; discarded 11 decisions from abandoned attempts after two checkpoint resumes, retaining the final 713-decision route. Aggregates: [balance-run-134224828.json](../reports/balance-run-134224828.json). Defense figures use actual presentation absorption; damage figures use displayed/stat-credited damage, which may include overkill.

## Findings

- All twelve Stratum2 encounters ended at their starting HP, including the nine-turn Choir fight. No player-hit presentation occurred in Stratum2. The HP decrease from70 to62 before the boss was a paid Sapling upgrade, not combat damage.
- Gold Bracelet absorbed103 damage on the retained whole-run route,60 in Stratum2 through12 selections. It was bought for190Gold before Void-Colossus. There were **zero Shield activations in Stratum2**, though seven Ward-type activations occurred. The passive equipment defense was often sufficient to spend Channel on offense instead.
- Choir made nine actions: Invitation8; Foretell Hypnosis; apply Hypnosis; Marionette hymn10; Release the strings; Purify; Invitation12; Foretell Hypnosis; apply Hypnosis. Only three direct attacks, totaling30. Its older rotation gave six direct-attack-free actions while Jonathan developed22 placements. No Hypnosis-damage hit reached the player. The Machine Elves were never used during the run.
- Choir defense route: Gold7+Stone Armor1; Living Lattice8+Gold2; Stone Golem10+Gold2. Gold supplied11 of its30 incoming direct damage, not the entire defense. Lowering Gold7→5, holding this route and everything else fixed, would expose just2 extra damage in this boss fight. That is a local arithmetic estimate, not a replay or proof about alternative decisions.
- The ending board still held an unused20-value Ward and several Allies, including a12HP Terra Guard and10HP Sapling. The boss did not sufficiently test the defensive reserve.
- Two Rootbound Rings contributed114 displayed damage in Stratum2,28 against Choir, with no extra Channel expenditure. Clear Quartz supplied+2Insight, Amber Thought+1Focus, and eventually Storm Opal+1Channel. Opening Rite and Focus Energy supported rapid board development. These are legitimate combinations, but together with recurring equipment defense and idle enemy actions they compound the player's advantage.

## Recommended order of experiments

1. Evaluate the current build first. Updated normal Corruptors attack while marking/applying, earlier Corruptions arrive on the first regular enemy turn, and Choir marks up to two Hypnoses. The pending2.0.9 change removes Release the Strings entirely; the three-move cycle including the authorized damage increase is9+mark,9+apply,11. Hypnosis persists until repaired or battle ends. Base direct damage averages29per3actions rather than18per5, before escalation or Purify. This directly addresses the demonstrated boss pacing problem.
2. Jonathan chose a price increase to300Gold, retaining7Guard. Two bracelets now cost600Gold. This constrains acquisition rather than reducing an already-owned pair. If ordinary fights still allow players to omit defensive card activations, test Gold Bracelet at5Guard (Bronze2/Silver4 retained for the experiment). Recurring, Channel-free7Guard can erase an entire modest enemy attack. A price-only increase does not address its effect after acquisition. Do not silently implement this proposal.
3. Track defensive card activations, HP lost per encounter, equipment absorption, fight length and remaining defensive reserve. Compare the same representative starting battle states under current rules and one bracelet change; allow strategic adaptation. A single easy run or unchanged-action damage arithmetic cannot establish general balance.
4. Review duplicate Rootbound Rings and resource Gems only if excessive snowballing persists. Avoid simultaneously weakening cards, gear and raising every enemy's HP; that would make the cause of any improvement hard to identify.

Ward starting value/depletion text and permanent Choir Hypnosis were separately authorized before this review. These changes, the later +1 enemy damage pass and300Gold bracelet price were explicitly requested. No bracelet Guard nerf was implemented.
