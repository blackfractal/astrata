# Astrata

A spatial deckbuilding roguelike by Jonathan. **Version 4.0.8** contains four playable Strata: **The Whispering Weald**, **The Unfinished Loom**, **The Lucent Grotto**, and **The Apex**. S3 introduces enemy-owned Ideons inside your Mind Grid, a crystal-cavern overworld with barriers, five new cards, and three new Archons: Mind Hive, Cnidarian, and the Refraction Cannon.

Double-click **Play Astrata.cmd**, or **release/Astrata/Astrata.exe**. The portable distribution is **release/Astrata-v4.zip**; extract it and keep the entire Astrata folder together. No Node installation or network connection is needed to play.

Defeat Stratum 1's Archon, choose one of a Legendary and two Rare rewards, then visit the automatic Tavern before entering Stratum 2. Your deck, equipment, Gold and remaining HP travel with you. Machine Elves join your Grimoire when you click **Enter the Unfinished Loom** after leaving the transition Tavern and reading their introduction. The first Loom entry starts its separate tutorial; Continue preserves your normal journey. After the second Archon, another transition Tavern leads to the Lucent Grotto. The Lucid Guide joins when you choose **Enter the Lucent Grotto**. Defeat its Archon, visit the transition Tavern, then enter The Apex: three shrinking rooms with paired returning Archons and a round-8 hunt deadline, followed by the Apex Predator. Defeat the Predator to complete the normal run. The first Grotto entry starts The Listening Hollow tutorial: learn to silence Ideons and defend against attacks originating inside the mind grid. All three tutorials can be replayed once unlocked; their saves stay separate from normal Continue.

Corruptions belong to **spaces**, not cards. Contain Nausea or Anger beneath a card, cover Insanity at the cost of freezing and severing that card, sacrifice a card over a Mind Mine, deny Hypnosis its activation, or send Machine Elves to Mend. Machine Elves can enter Memory Holes and repair their own or adjacent spaces. Ordinary repairs are immediate; Hole/Hypnosis take two player-turn starts, or one with upgraded Elves. The revised Mending Ground tutorial demonstrates Nausea, Anger, Memory Hole and repair, then ends with a gentle independent fight. Hover persistent space seals and marked targets for their rules.

The original First Clearing tutorial remains available. Archives retains discoveries and achievements; the latest 20 runs are displayed while full versioned run data is retained. Normal Continue restarts a battle from its checkpoint; tutorials resume their exact lesson. Saves remain in **%APPDATA%/astrata**.

- [Main design](_plans/astrata_design.md), especially §10.12 for implemented Stratum 2 rules.
- [Stratum 2 planning](_plans/stratum_2_planning.md).
- [Stratum 3 rules and implementation decisions](_plans/stratum_3_planning.md), [S3 build report](reports/stratum3-build-report.md), and [new art/prompts](reports/s3-art-provenance.json).
- [The Apex design](_plans/stratum_4_planning.md), [S4 build report](reports/stratum4-build-report.md), [S4 AI evaluation](reports/apex-ai-report.md).
- [21-card Druid expansion](reports/growth-card-reference.md) and [implementation/balance results](reports/growth-expansion-report.md).
- [Build log](BUILD_LOG.md) and [AI reports](AI_REPORT.md).
- [Interesting situations and replayable puzzles](_knowledge/situations/README.md).
- [New art and exact prompts](reports/loom-art-provenance.json).

This is the consolidated repository. Game history continues from astrata_01; original design history is retained on the local **design-history** branch and in **_knowledge/repository-migration-2026-10-04**. Research, old releases, generated variants and the frozen Cinder Hart puzzle remain preserved. The consolidated game is published to `blackfractal/astrata`.

Development: `npm start`, `npm test`, `node tools/audit.mjs`. Package with `node tools/package.mjs --app-only` and `python tools/make-zip.py`. Run AI batches with `node tools/batch.mjs 5 41001 reports/evaluation`. Add `--loom` only for the labeled Stratum 2 carry-in fixture; its victories are not earned full-run wins.

## Git LFS

Artwork and verification screenshots are stored in **Git LFS**, including their historical versions. Install Git LFS before cloning, then run `git lfs install`. In an existing checkout, `git lfs pull` downloads the actual images if they are missing. Use `npm ci` before the development commands above. Normal `git add`, `git commit` and `git push` handle subsequent image changes through `.gitattributes` and the LFS hook.

The image history was migrated on 2026-10-05. Existing clones from before that migration should preserve local work and clone afresh; this workspace has already been migrated. [Migration record and old-to-new commit map](_knowledge/git-lfs-migration-2026-10-05/README.md).

Launch the packaged game from the repository root with `Astrata.cmd` (also works from another working directory).
