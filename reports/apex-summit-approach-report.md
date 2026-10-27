# Apex Predator summit approach

Version 4.0.40; design 4.260; S4 planning draft 0.20.

Replaces the old Face the Apex Predator scene with the standard playable 5×5 Field, smaller than floor three's 7×7. The player enters at (3,5) and the Predator at (3,2), exactly three king-moves apart. There are no spawn pairs or collectibles. The Predator moves as a Hunter after the initial movement ends, using normal enemy-first battle handling. Three movement allows direct preemption. Enemy inspection, directional buttons, equipment and consumables use existing map controls.

Summit equipment changes recalculate movement from the equipped allowance minus steps already spent, so a newly equipped movement item works without allowing refill exploits. Continue preserves the approach. Old waiting summit screens initialize the approach once; already-started Predator fights remain untouched. Normal Predator stats and battle moves are unchanged. Legacy fightApex action removed; evaluation/UI drivers updated.

Validation: all809 rules tests pass. Tests cover every legal two-step route and early waiting, three-step preemption, gear swaps, mid-approach Continue, old waiting-screen migration, ongoing-battle preservation and final victory/achievement handling. Packaged isolated Edge UI verified 25tiles, correct player/boss positions, no overflow/errors, enemyFirst=true with2movement and false with3. Screenshots visually checked. See apex-summit-tests.txt, apex-summit-ui.json and screenshots/apex-summit.

Jonathan's current save is already a Predator battle; no save overwrite or rewind was performed.
