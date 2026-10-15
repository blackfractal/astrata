# Cnidarian pursuit and delayed return — 3.0.17

Tendrils pursue their weakest Splash Ally one orthogonal step instead of always moving west. A move into adjacency still uses Splash; starting adjacent uses the growing strike. No Allies retains westward movement, player-directed Splash and left-edge Poison.

Kills immediately create fixed blue return warnings on the killing card's space. They skip the current enemy turn and erupt after surviving tendrils act on the following enemy turn, giving one full player turn to recall/move the threatened card. The entire remaining Construct and its active Guard are removed on emergence. Newborns start at age zero and cannot attack that command.

Multiplying replacements use the same death tiers. Extras and simultaneous kills competing for one space warn distinct nearest legal spaces, with reading-order ties. Equipment/consumable kills use the defeated tendril's space; status kills use the last applying card's recorded space. Holes/Ideons block spawning; a newly blocked warning fails rather than retargeting. Owner death cancels warnings. Existing legacy pending counts gain warnings rather than immediate returns. No old deaths are reconstructed from history.

Validation: all591 rules tests pass. Tests cover four-direction pursuit and Construct/Guard swapping; immediate warning/source attribution; full-turn delay; entire-Construct destruction; movement/Recall/replacement; Continue preservation; multiple returns; blocked returns; owner death; equipment and status kills. Packaged isolated-profile UI verifies warning color/text, updated pursuit intent and visibility with reduced motion. Existing player-Splash traversal UI passes in normal/reduced motion: one lash and three impacts, correct same-column/leftward defenses, no renderer errors. Initial sandboxed UI launch failed in Playwright transport; rerun with desktop access passed. No user profile edited. Existing battle-win reports predate these changes and are not balance evidence for3.0.17.

Design4.200 / S3draft0.35. Portable app and archive refreshed. No commit/push.
