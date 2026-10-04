# Repository consolidation — 2026-10-04

Jonathan requested moving the entire astrata_01 repository into astrata. Every top-level game file and directory was moved, including Git history, node_modules, assets, releases, reports and temporary profiles. The verified-empty astrata_01 directory was removed afterward.

The original design repository's .git, README.md and .gitignore are preserved here. Its main history was imported as the local design-history branch. The original GitHub origin is retained; no push or remote history rewrite was performed. The active main branch retains game history through b29d244 and subsequent work.

Existing _plans, _knowledge, _research and the unidentified original directory were retained. Frozen situation builds were not modified. The situation verification script now finds development dependencies in the consolidated root. The user's application profile was not modified.

Old release ZIPs remain in release. The new portable build is Astrata-v2.zip.
