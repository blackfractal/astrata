# Hive Larvae and recurring insect pressure

2026-10-14. Rules/content/package 3.0.10; main design 4.194; S3 plan draft 0.29.

Jonathan chose a separate opening species named Larva: the eight starting insects threaten a heavy arrival hit without attacking every turn. Fresh Hive battles now open with eight Hive Larvae, each with 16 HP, one-space westward movement and an 18-damage elemental exit attack. They swap player Constructs as they move. The exit attack happens on the next command after reaching the player-side edge, then the Larva disappears.

Eggs hatch the existing mature species, never Larvae. Burrowers and Skitters now attack for 1 damage of their element after attempting movement, including when blocked. The attack originates from their resulting column and uses normal positional defense eligibility. Their exit attacks remain 12 and 9 respectively and replace that command's small attack. Drones retain 50 HP and escalating 5/10/15/... attacks. Newborns wait until the next command. The 18 and 1 damage values are initial balance choices, not proven final tuning.

Legacy Hive opening insects convert to Larvae without adding insects, restoring HP or resetting position, age, element or statuses. Existing maximum HP is preserved. Hatched insects remain their existing species. The preceding forced-discard fix remains: intrinsically non-recallable grid cards and their attachments go to Destroyed, closing Focus Energy recycling through Mind Eggs.

Original Larva art was generated with the built-in image generation tool, not the DGX Spark. The provider did not expose a model identifier. Exact prompt, retained original and hash are in larva-art-provenance.json.

Validation: all 567 rules tests pass; 204 required assets pass the art/provenance audit. Isolated packaged UI tests verify eight opening Larvae with decoded art and accurate intent, no first-command Larva damage, and a mixed command dealing 1 + 1 + 5 from Skitter, Burrower and Drone. No renderer errors; screenshots retained under reports/screenshots/hive-larvae.

Five unchanged weighted-policy trials using the balanced strong fixture (25 unupgraded cards, 70 HP, same equipment) lost on rounds 13, 12, 13, 13 and 13. All action replays matched exactly. These are regression and controller results, not proof that careful human play cannot win or that balance is settled. The earlier manually driven no-damage victory used 3.0.8 and is not a verified victory under these rules. Full traces and source snapshots are retained in hive-larvae-evaluation.

The user's live save was not edited. Restart the app to load the rebuilt version.
