# Trickster cycle rework — 4.0.9

Approved by Jonathan after reviewing his turn7 victory (70→53HP;15damage in opening ambush). New five-move linked Corruption cycle is specified in design4.231. No artificial Corruption cap beyond42spaces. Single20 / split7+7 starting attacks; per-cycle+2 / +1perhit; no additional S2 multiplier or half-HP bonus. Map Restless and S4 rematch pressure still apply.

700 rules tests pass. Actual runtime UI and requested restore verification will be recorded below. No new balance campaign or claim of final tuning.

Requested rewind derives the original pre-battle Tavern state and replays its original Leave action with4.0.9 rules. It retains seed1298481418,37cards,4Gold,70HP and original equipment; Trickster264HP. The fight retains enemy-first entry, now Dazzle20Light and two Hole warnings. Fresh archive branch preserves the original run; live save backed up before installation. Source/manifest/candidate in reports/trickster-rework.


Verification completed:700/700 rules tests pass; two isolated packaged UI checks pass (Continue into original ambush opening; H split-attack values and grid render), no renderer errors. UI automation required the normal desktop execution context; test profiles remained under .tmp. Screenshots and UI results are in trickster-rework.

Installed the requested Continue save after verifying the live save was unchanged since backup. Prior S3 continuation (60HP, beginning of Glass Brood) is preserved in trickster-rework/before-rewind-save.json. Original archive files were not modified. No commit or push.
