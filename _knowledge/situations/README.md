# Interesting situations

A local, replayable collection of Astrata puzzles and teaching positions. Preserve exact state **and the matching executable build**, not just a seed. New game versions must not silently change an existing puzzle.

| Situation | Seed | Entry points | Skills |
|---|---:|---|---|
| [Cinder Hart: The Last Spark](cinder-hart-last-spark/README.md) | 62551554 | Full battle; second Stampede; final turn | Resource planning, recalls, positional defense, elemental relay, recognizing lethal |
| [Two Wings at the Crossroads](two-wings/README.md) | 303001354 | Opening map | Initiative, enemy movement, elemental equipment, HP versus travel, forecast interpretation |
| [Between Two Eidolons](two-eidolons/README.md) | 303001354 | Round 11 map | Forced follow-up encounters, initiative, elemental equipment, Tavern routing |

## Open a situation

Open its folder and double-click the relevant **Open ... .cmd** file, then click **Continue** in Astrata. Every launch starts a fresh copy. The preserved executable is used even if the main game later changes.

Your normal game need not be closed. Practice saves, Archives, achievements and attempt traces go into this catalog's `_sessions` folder, never the normal `%APPDATA%/astrata` profile. The game itself still calls the button Continue and the app Astrata; these are isolated copies, not a new game mode.

Solutions are kept separately so prompts can be given without spoilers. Human assessment should record the line and explanation, not infer a global skill rating from one solved puzzle.

## What to preserve for each entry

- Stable ID, neutral title, prompt, skill tags and source run ID.
- Seed plus exact complete state: RNG, deck order, revealed hand, equipment/socket state, card positions, use counts, statuses, phase and pending attacks/jobs.
- Package/rules/content versions and checksum of a preserved build.
- Original run trace, outcome, source event indices and timestamps.
- Multiple useful entry points when appropriate.
- Verified solutions, optional graduated hints and an evaluation rubric.
- Screenshots and a validation record showing the saved position actually opens.

A seed reproduces choices only with the same rules and action sequence. An exact snapshot resumes the interesting decision directly. Do not expose hidden draw order or RNG to the person solving it; those remain in the save for reproducibility.

## Storage and provenance

Build ZIPs in `_builds` are shared by every puzzle using that version. The first preserved build is about **322 MiB**. First launch extracts one shared runnable copy into `_cache` (additional disk space); subsequent attempts reuse it. Snapshot JSON and compressed run traces are much smaller. Keep the ZIP, manifest, snapshots, archive and solutions; cache can be reconstructed. Practice attempts accumulate separately and are retained for later review.

This catalog is a local preservation copy, not an off-device backup. Back up `_knowledge/situations` with the project. No automatic cleanup or deletion.

## Adding another situation

Use this entry as the format. Extract states from the archived run rather than reconstructing from a screenshot. Copy the matching release ZIP once, checksum it, and reuse that build for later entries. Never overwrite a named snapshot to represent newer balance rules: create a new variant and record its parent. Validate legality, outcome and UI loading before listing it here.
