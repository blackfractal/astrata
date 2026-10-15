# Storm Canopy downward column — 3.0.21

Jonathan clarified that Storm Canopy, not Gust, should hit all main enemies plus Ideons below the card in its own column. Implemented as a shared area-target predicate: same column and strictly greater row, with no distance cap. Other columns, the same space and rows above are excluded. Guardian protection and elemental modifiers still apply. Damage 7, upgrade +3, Focus 2, Channel 1, two uses and Recall 1 are unchanged.

The same predicate controls combat, previews and AI area valuation. Ideon-specific text remains hidden in S1/S2 and visible from S3; early availability is unchanged. Updated the Hive counter advice and current main/S3 design rules to remove the previous blanket exclusion.

Validation: 603 rules tests pass. Tests cover every source/target grid pair, multiple simultaneous main and Ideon targets, elemental damage, upgrade, friendly-card safety, bottom-row placement and Continue. Packaged UI checks pass for S1/S2/S3 descriptions with isolated profiles. No live save changes and no full-fight balance claim. Main design v4.204, S3 draft 0.39. Executable and ZIP refreshed; restart to load new rules.
