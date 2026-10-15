# Cannon five-move cycle and Codex playtest — 3.0.25

Jonathan clarified: charge on moves 4, 9, 14, ...; Final Blast on 5, 10, 15, .... Implemented a five-action cadence. Normal shot rotation, seeded/revealed element, fixed 30 damage, full-grid defense, and the pause in bullet commands on Final Blast remain unchanged. Main design4.208 / S3 planning0.43 updated. Existing pending telegraphs remain saved rather than rerolled.

## Test setup and result

One headless, manually chosen legal-action playthrough of the same authored developed-foundation fixture used for the earlier Hive/Cnidarian strong-deck tests: seed73001, 25 cards including the S3 Lucid Guide, opening70HP/3Focus/4Channel, Water Gold Bracelet, Fire Silver Bracelet, resource rings/gems, Stone Armor and Sturdy Metal Helmet. This is a declared sample carry-in, not a claimed organically acquired run or Jonathan's live save. Initial deck/inventory/equipment were checked against the earlier strong Hive fixture.

Victory on turn16 at70/70HP. Zero player damage, zero player healing, no consumables, no rewinds.191 legal actions were recorded and independently replayed to the identical final observation under current rules. Rejected selector attempts did not spend resources or change state. The line includes actual errors (missed Recall timing, blocking my own Isolated cards, and underestimating field reach); it is not an optimized solution. All checkpoints, initial state, source snapshot, action keys and verification are saved in codex-cannon-3.0.25/.

## What happened

- Faced Final Blasts on5 Water,10 Earth,15 Water. Transmute changed the spent Titan to Wind, Fire, Wind respectively. It absorbed both first blasts completely (15HP lost each) and the final18 damage remaining after Lucid Guide intercepted12 (9TitanHP lost). Titan also took a14Arcane normal attack on turn14. Its passive neighbor growth helped restore this defensive reserve between spikes; it finished with5HP.
- Titan dealt63 early boss damage before exhausting its three attacks. It remained valuable as a growing, transmutable defender. This was not a repeatedly recalled Titan or infinite activation loop.
- Solitude was the leading boss damage source:105 actualHP removed over repeated Recall/replay. Light Plasma Ball removed48 bossHP and also damaged/killed projectiles; Lucid Needle16, Storm21, Gale4, finalBlast card3actualHP. These totals sum to260 and clamp the final overkill.
- Eleven projectiles launched; one launch was withheld because no safe non-overlapping lane existed. No projectile was allowed to reach the player. The last three disappeared with the boss.
- Radius2 genuinely disrupted the formation: a bullet covered a Ward; fields prevented important cards from activating; on turn14 I had2Channel remaining and no legal activation. Clearing one field reopened other attacks, and moving bullets reopened previously restricted cards.
- On turn15 I accepted the destruction-field penalty to use Plasma Ball, Solitude, Transmute and Storm Canopy before they were destroyed. This helped finish before another normal enemy action.

## Balance assessment

The spatial puzzle is meaningfully stronger, but this developed build still defended too comfortably at the player-HP level. The field lockouts slowed the kill and forced changes of plan; they did not overwhelm its banked defenses. Equipment covered much of the ordinary14-damage pressure, disposable Allies bridged gaps, and a growing Titan with on-demand defensive Transmute answered predictable single-element spikes. Final Blast's bullet pause also removes competing projectile arrivals from that turn.

This one seed does not establish a win rate or that every build finds the boss easy. It does demonstrate that flawless playerHP is possible despite imperfect decisions with this strong carry-in. If further pressure is desired, mixed-element attacks would test the defensive engine more directly than enlarging fields again. No additional balance change was made beyond the requested five-move cadence.

## Validation and delivery

614rules tests pass, including charges4/9/14 and blasts5/10/15. Two isolated packagedUI checks confirm charging on4 and9, next30damage intent, radius2 fields, and waiting bullets. No renderer errors. Executable/ZIP rebuilt. Live user profile and run history untouched.
