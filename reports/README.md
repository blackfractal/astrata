# Reports and local snapshots

Keep readable analysis, balance findings, summary statistics, verification results,
screenshots and art provenance in `reports/`. These are committed normally.

Raw game saves, rewind backups, exact battle states, replay action traces, run
archives and frozen copies of the game belong in **`snapshots/`**, which is ignored
by Git. Preserve the experiment's relative path: a report in
`reports/example/` has its local replay data in `snapshots/example/`.

On 2026-10-26, existing raw artifacts were moved using this layout and verified by
SHA-256. The local inventory is `snapshots/migration-20261026.json`. Nothing was
removed from Git history. Older reports may describe their original locations;
look under the matching `snapshots/` path for their raw evidence. A fresh clone
does not include these local snapshots; copy them separately when sharing a replay.

Evaluation tools keep summaries here and write raw data to the matching snapshot
directory. New tools should use `snapshotPath(reportDirectory)` from
`tools/artifact-paths.mjs`, create that directory, and write states/traces there.
`reportPath(snapshotDirectory)` provides the reverse mapping for summary writers.
Explicit output directories outside this repository's `reports/` tree keep their
existing meaning. Avoid putting temporary command queues or profiles in reports.

Curated, intentionally versioned puzzles remain in `_knowledge/situations/`.
The live game's saves and automatic run archives remain in `%APPDATA%/astrata`.
This organization does not change Continue, save behavior or game rules.
