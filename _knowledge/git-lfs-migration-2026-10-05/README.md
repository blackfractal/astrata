# Git LFS migration — 2026-10-05

Jonathan authorized converting images throughout the published history to Git LFS and rewriting GitHub main.

Original main: `18ea2493d603c5dc7a3e8e02d78439f89f5b09ac`.
Migrated main before this documentation commit: `41fd9e49467933136907a44c9bb28aeaa0dbca30`.

All 120 commits were checked. The migration preserved all 2,344 current files byte-for-byte, all non-image historical file objects and modes, and all 844 distinct image contents (877,529,378 bytes). Only image storage representation and .gitattributes changed. Subsequent documentation records the migration. The [commit map](commit-map.csv) relates old hashes in existing reports and puzzle records to rewritten hashes; [verification](verification.json) contains the checks.

Raster images, including artwork and verification screenshots, use LFS: PNG, JPG/JPEG, WebP, GIF, BMP, TIF/TIFF, ICO and AVIF. Text, source, save fixtures and reports remain ordinary Git files. Future image changes use the tracked .gitattributes and local LFS pre-push hook. No image versions were discarded.

## Recovery

`pre-lfs.bundle` in this directory is an ignored, local-only complete bundle of the original branches and remote-tracking references. It was validated with `git bundle verify` before migration. Keep it until satisfied with the migration. It is not part of the repository on GitHub. Original local Git objects/reflogs were not pruned; disk usage in this existing checkout will not immediately shrink. This backup requires no LFS server to recover its original image contents.

To inspect the original history without changing this working copy, clone that bundle to a separate directory:

```powershell
git clone --branch main _knowledge/git-lfs-migration-2026-10-05/pre-lfs.bundle <separate-recovery-directory>
```

Publication uploads every LFS object reachable from rewritten main before a guarded force-push, expecting GitHub main to still equal the original hash above. Existing external clones should preserve uncommitted/local work and then clone afresh; do not merge the old history back into the migrated main. This working copy is already migrated. Ordinary commits and pushes continue normally after migration.

No gameplay code or release binary changed, and no game tests were repeated: this is a storage migration verified through file and historical content hashes. Game version remains 2.1.7.
