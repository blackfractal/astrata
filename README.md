# Astrata

A spatial deckbuilding roguelike by Jonathan. **Version 2.1.4** contains two playable Strata: **The Whispering Weald** and **The Unfinished Loom**. Loom enemies now apply Corruptions earlier and attack during their warnings; Hollow Scribe threatens fourteen Memory Holes. Corruptions have dedicated art and animated effects, including the new Anger.

Double-click **Play Astrata.cmd**, or **release/Astrata/Astrata.exe**. The portable distribution is **release/Astrata-v2.zip**; extract it and keep the entire Astrata folder together. No Node installation or network connection is needed to play.

Defeat Stratum 1's Archon, choose a legendary reward, then visit the automatic Tavern before entering Stratum 2. Your deck, equipment, Gold and remaining HP travel with you. Machine Elves join your Grimoire when you click **Enter the Unfinished Loom** after leaving the transition Tavern and reading their introduction. The first Loom entry starts its separate tutorial; Continue preserves your normal journey. Defeat the second Archon to complete this build.

Corruptions belong to **spaces**, not cards. Cover Nausea or Insanity, sacrifice a card over a Mind Mine, deny Hypnosis its activation, or send Machine Elves to Mend. Machine Elves can enter Memory Holes and repair their own or adjacent spaces. Ordinary repairs are immediate; Hole/Hypnosis take two player-turn starts, or one with upgraded Elves. The revised Mending Ground tutorial demonstrates Nausea, Anger, Memory Hole and repair, then ends with a gentle independent fight. Hover persistent space seals and marked targets for their rules.

The original First Clearing tutorial remains available. Archives retains discoveries and achievements; the latest 20 runs are displayed while full versioned run data is retained. Normal Continue restarts a battle from its checkpoint; tutorials resume their exact lesson. Saves remain in **%APPDATA%/astrata**.

- [Main design](_plans/astrata_design.md), especially §10.12 for implemented Stratum 2 rules.
- [Stratum 2 planning](_plans/stratum_2_planning.md).
- [Build log](BUILD_LOG.md) and [AI reports](AI_REPORT.md).
- [Interesting situations and replayable puzzles](_knowledge/situations/README.md).
- [New art and exact prompts](reports/loom-art-provenance.json).

This is the consolidated repository. Game history continues from astrata_01; original design history is retained on the local **design-history** branch and in **_knowledge/repository-migration-2026-10-04**. Research, old releases, generated variants and the frozen Cinder Hart puzzle remain preserved. No changes were pushed.

Development: `npm start`, `npm test`, `node tools/audit.mjs`. Package with `node tools/package.mjs --app-only` and `python tools/make-zip.py`. Run AI batches with `node tools/batch.mjs 5 41001 reports/evaluation`. Add `--loom` only for the labeled Stratum 2 carry-in fixture; its victories are not earned full-run wins.
