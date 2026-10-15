# Cnidarian and Corruption feedback — 3.0.12

Jonathan requested adjacent-only tendril strikes, Hive-style player-card swapping, woven Nausea connections only to affected cards, and jagged Anger connections. He then added Splash and confirmed fixed damage: 4 for the adjacent strike, 1 for Splash, removing attack growth with age.

Tendrils choose the weakest orthogonally adjacent Ally (reading-order ties) and strike without moving. Otherwise they advance one space west, exchanging any player card/whole Construct and activated Guard into their old space, then Splash the weakest Ally anywhere. Splash still works when movement is obstructed. Arriving beside an Ally does not grant a full strike on the same command. At the left edge they attack an adjacent Ally, otherwise Splash a distant Ally; with no Allies they apply Poison 2. Normal elemental modifiers apply, including current Ally Attunement. This ordering preserves existing edge behavior while preventing distant Allies from halting movement. Holes and other Ideons remain obstacles.

Old saves and Continue checkpoints receive swapping, fixed base damage and revised descriptions while retaining HP, age, element, position and fight progress. Intent previews share the target-selection helper with resolution. Named attacks are recorded in the log and animate from the tendril's position.

Follow-up animation request: Splash lashes a short tapered tentacle toward the Ally, then launches the ordinary pulse from its tip. The adjacent strike extends the tentacle to the card and replaces the pulse entirely. Both retain the elemental impact, damage number and death effect. The tentacle retracts as the impact plays. Reduced motion fades the limb without extension or projectile travel; Skip cleans up the overlay. Packaged UI verifies the ordered lash/pulse/impact events, fixed damage and cleanup in normal and reduced-motion modes.

Uncovered Nausea now draws four curved, flowing strands to each actual affected card and none to empty spaces. Anger draws two jagged animated bolts to its selected card. Covering either removes its external links and redirects effects to the covering card. Reduced motion retains the shapes with animation disabled; SVG overlays do not intercept clicks.

Validation: all 575 rules tests pass. Isolated packaged UI checks verified move-plus-Splash, fixed adjacent damage at age 9, intent descriptions and exact saved-state agreement with legal replay. Corruption UI checks verified actual targets, eight curved strands for two affected cards, no empty-space link, jagged Anger, targeting/covering changes, elemental damage previews, and reduced motion. No renderer errors; screenshots visually reviewed.

The earlier manual Cnidarian victory (turn 10, 69/70 HP, 121 decisions, four HP damage and three healing) is independently replay-verified with frozen **3.0.11** sources in `reports/codex-cnidarian-play`. It relied on stopping tendrils behind ordinary cards and is not evidence of a win under 3.0.12. No new full-fight balance verdict is claimed. No changes were made to the user's live save.

Main design 4.196 and S3 planning draft 0.31 updated. Executable and portable archive refreshed. No commit or push.
