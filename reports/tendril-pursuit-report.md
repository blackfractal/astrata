# Tendril pursuit correction — 3.0.16

Jonathan noticed Tendrils moved left instead of toward their Splash target. They now choose the weakest Ally (reading-order ties), then move one orthogonal space closer to that same Ally. Prefer horizontal movement if both axes offer a closer legal step. If no closer legal step exists, stay and Splash. Adjacent Allies still receive the regular strike without movement; moving into adjacency still uses Splash that command. Without Allies, retain leftward movement and player Splash / left-edge Poison.

Whole Constructs and stored Guard swap normally in every direction. Space Corruptions stay fixed; Holes and other Ideons obstruct. Updated intent and card/boss descriptions, main design4.199 and S3 draft0.34. Compatible Continue saves retain progress and receive updated descriptions. No user profile edits.

Validation: all584 rules tests pass, including four-direction pursuit, edge behavior, blocked alternatives, deterministic target selection, vertical Construct/Guard swapping, first-arrival Splash, growth and save compatibility. This changes the encounter from earlier win replays; those are historical evidence, not current-rule balance results.

Killer-space replacement telegraphs/bursts remain unimplemented; this change addresses pursuit only.
