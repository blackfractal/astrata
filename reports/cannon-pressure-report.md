# Refraction Cannon pressure — 3.0.24

Jonathan found the Cannon too easy and requested radius-2 thought fields plus a periodic Final Blast.

All three field variants now affect a Manhattan distance of at most 2 (13 spaces when not clipped by the grid). Their existing activation restrictions and center-only coverage remain. Safe firing lanes account for the enlarged footprints; if no non-overlapping lane is available, the projectile is withheld while its normal launch attack remains.

Every fourth actual Cannon action announces Charging Final Blast... alongside its normal action. On actions 5, 9, 13, etc., only Final Blast fires: exactly 30 damage, with its uniformly random element chosen from all seven elements by the run RNG during charging. The next intent reveals that element. No new bullet, ordinary launch attack or existing-bullet command occurs on the blast action; existing fields remain. Normal full-grid defense eligibility and right-to-left traversal apply, without Pierce/Cull. Final Blast pauses the ordinary shot rotation and takes precedence over pending Purify. Purify and Final Blast both count toward the four-action cadence.

Continue preserves the selected element/counter. Older snapshots adopt new field descriptions and initialize a missing counter from their existing move-cycle count; no retroactive blast is invented. No live profile or completed run was rewritten.

Validation: all 614 rules tests pass. Six new tests cover field clipping/all types, 13-turn cadence, exact damage and paused bullets, seeded/stable element and Continue, Purify ordering, full-grid Ward defenses and traversal, and old snapshots. A packaged Electron check in an isolated profile confirms the 13-space footprint, charging announcement, Final Blast · 30 Chaos intent, and waiting-projectile tooltip, with no renderer errors. Screenshot inspected. No new difficulty/win-rate claim: this is the requested tuning, ready for playtesting.

Main design v4.207; S3 planning draft 0.42. Executable and ZIP refreshed. Tests and UI evidence: cannon-pressure-tests.txt, cannon-pressure-ui.json, cannon-pressure-ui.png.
