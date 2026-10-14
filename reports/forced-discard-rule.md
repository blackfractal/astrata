# Forced grid discards — 3.0.9

Jonathan approved sending non-recallable cards to Destroyed when an effect would discard them from the mind grid. This closes the Mind Egg / Focus Energy repeat-bonus loop demonstrated by the preserved 3.0.8 manual Hive victory.

- Mind Eggs still clear the entire cover, prevent the hatch burst, and spawn their insect.
- Recallable cards go to Discard. Intrinsically non-recallable cards (including most Allies, Focus Energy, Opening Rite and single-use cards) go to Destroyed. Melded attachments follow a destroyed host, consistent with ordinary host destruction.
- Temporary Locked, Sticky and covering-Ideon restrictions do not change this classification. Machine Elves are recallable and still discard normally.
- Ordinary unplayed-hand discards are unchanged. Existing permanent resource bonuses remain; the destroyed card cannot return to grant another that battle. Owned cards return next battle.
- Dynamic egg tooltips, hatch labels/animation, Focus Energy text, Recall glossary, Hive description, design 4.193 and S3 draft 0.28 explain the result. Egg statistics retain actual discarded IDs and now also record covered status and destroyed IDs. Evaluation scripts count covered eggs independently of destination.

Validation: 563 rules tests pass. Regression cases cover Focus activation followed by hatch/save-load/draw, next-battle return, non-recallable Allies, recallable Allies, temporary Locked cards, melded attachments, normal hand discard and no damage from destroyed covers. Packaged UI verification confirms Ward-to-Discard, Focus-to-Destroyed, uncovered damage and three insect spawns with no renderer errors. See `forced-discard-tests.txt` and `forced-discard-ui-verification.json`.

Difficulty should increase for recycling-based builds and non-recallable Ally egg covers, but has not been remeasured with a new manually played attempt. The old zero-damage result is historical evidence under 3.0.8, not proof of a win under this version. Its verifier now imports its preserved source snapshot rather than the changing current source.

Skitters/Burrowers still attack only when exiting the left edge; the proposed small attack every turn has not been implemented. No live save or rules beyond this approved discard change were modified.
