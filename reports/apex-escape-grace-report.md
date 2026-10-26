# Apex: one escape movement after a round-eight Archon victory

2026-10-25 — version 4.0.34, design 4.255, S4 plan draft 0.16.

Jonathan clarified that the survivor hunts at the later of the normal round-eight deadline or one full movement turn after the first Archon victory. Earlier victories keep normal timing; only a first victory on round eight needs an exception.

After that victory, the surviving Archon stays stationary during the immediate enemy movement. Ordinary enemies still move and may start encounters. Once that movement and any resulting encounter resolve, restore the player's full movement allowance for one escape turn. Keep the floor at round eight: no ninth spawn pair, enemy aging, Gold decay or repeat rewards. Reaching central Ascend leaves the floor; spending the escape turn elsewhere lets the survivor hunt afterward. Defeating the second Archon still forces ascent after the complete encounter and rewards.

Pending, active and spent grace are saved on the floor. Continue cannot restore spent movement or create additional grace. A first-Archon reward saved on an older build receives the exception when continued; an already-started survivor fight is not rewound. The map banner, Archon inspection and Apex introduction explain the escape window.

Validation: all 805 rules tests pass. Added coverage includes all three floors, actual two-step stair entry, no extra spawns, save/load during rewards and after one escape step, survivor hunting when the escape turn ends, automatic second-victory ascent, normal timing for victories on rounds4–7, old reward compatibility, ordinary enemy movement/encounters during the pause, and displayed escape timing. Existing paired-hunt and achievement tests remain passing. No live-profile edits or combat balance changes.

The live application must be restarted to load the new build.
