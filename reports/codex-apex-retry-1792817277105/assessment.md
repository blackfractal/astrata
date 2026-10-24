# Apex Predator retry — paused for review

Restored the original fight-entry archive at step 1834: seed 1428779120, rules 4.0.11, 66 HP, same deck/equipment/random state. Archive-omitted log/history fields were restored for loading; gameplay state was not modified. Used the original isolated app and a new profile. Decisions remained manual with visible animations and 500 ms minimum spacing.

Stopped at Jonathan's invitation to examine a poor position rather than continue: **turn 9 activation, step 1975, 16 HP, Predator 413/640 HP**. The turn has not ended. `paused-turn9.json` preserves the full snapshot. Current destruction preview targets Lucid Guide and Solitude. This is a judgment that I see no credible winning continuation, not a proof of mathematical impossibility.

## What the retry establishes

The more aggressive opening was not an improvement. Turn-one Titan produced 20 damage, then 23 on turn two, but Fangs destroyed it. Its 3 Focus placement crowded out the original defensive opening. Accepting HP loss is useful only when it buys enough lasting advantage; this line did not.

The largest losses came from defense removed before it could absorb damage:

- Turn 2: before ending the turn, Fangs preview targeted Titan and Sap. After Nausea was applied, the executed targets became Titan and the activated Water Shield. The lost Shield forced an ally sacrifice and 9 HP damage. This needs a telegraph-consistency investigation: a preview that does not account for preceding effects in the same enemy move is misleading.
- Turn 6: I spent Needle's remaining activation, lowering its destruction priority, and failed to recheck the final targets. World Eater destroyed Bastion and the activated Shield. This was a separate manual decision error, not evidence of the preview issue. Sacrificing Ember and Elves plus equipment still left 19 damage from the main hit, then chip damage and exposed Insanity.
- Early Solitude was adjacent to Nausea, reducing its damage despite being isolated from player cards. Undertow relocated it later. This was another placement error.

Some choices did work: recalling cards ahead of Unmake preserved the valuable row; recalling both Hypnosis targets saved the Saps; Guide efficiently removed the Guardian; Rootwall plus equipment almost completely covered Riven Earth. Those gains did not offset the opening losses.

## Next assessment

Do not treat this as a clean second demonstration that the boss is impossible. Nor does it support the earlier suggestion that simply attacking more would win. A better attempt should preserve the first run's defensive opening, make fewer destruction-target mistakes, and increase damage selectively rather than place Titan immediately before an unavoidable destruction move.

The most actionable issue to investigate before tuning is whether Fangs/World Eater previews accurately represent destruction after their preceding corruption effects. No gameplay or balance changes were made during this retry.
