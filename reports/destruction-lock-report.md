# Destruction warning commitment — 4.0.12

Jonathan approved the targeting fix and Prismatic Sap at 8 damage / 4 Guard.

Destruction previews remain live during the player's turn. Advancing to Enemy now records each enemy's target spaces before end-of-turn expiry, statuses, Corruptions or other enemies can alter the rankings. A target emptied by an earlier effect does not cause a replacement target. Rows/columns remain the committed row/column. Collapse also retains the displayed empty-space count, damage and visual origins. Serialized enemy jobs retain this information through Continue. Old mid-resolution saves without a plan commit at the start of that enemy action, before its own effects.

This fixes the observed Apex Fangs sequence: its own Nausea could lower Prismatic Sap's value and redirect destruction to an activated Shield that was not warned. This does not stop warnings changing during the player's own activations/recalls; those changes remain intentional and visible.

Prismatic Sap now deals 8 damage and gains 4 Guard in its activation element. Costs, uses, upgrades and elemental relay behavior are unchanged.

Validation: all 711 rules tests pass. New coverage includes the observed Nausea/Fangs interaction, legacy enemy jobs, expiring cards, paired bosses sharing targets, defense spending and save/Continue, Collapse origins/damage, and Sap damage/Guard/elemental relay. Raw output: destruction-lock-tests.txt.

The paused 4.0.11 Apex retry and historical source archives remain intact. No new balance campaign is claimed by this change.

Packaged UI verification passed in an isolated profile: Continue loads, Sap activation shows 8 damage/4 Guard, Fangs marks slots 0/10 and destroys those exact cards after Nausea while the unmarked Shield in slot 20 survives. No renderer errors. Packaged runtime and portable ZIP refreshed.
