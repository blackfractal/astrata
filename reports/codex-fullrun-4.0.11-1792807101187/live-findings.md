
- Apex map flash: src/apex.css applies apex-room animation (opacity .3 -> 1, scale .98 -> 1) to every .in-apex .field. ui.render replaces app.innerHTML and presentation calls render after each move, restarting animation on every step. Gate animation to actual floor entry. No code changes during frozen playthrough.
- Hive defeated turn15 at 46 HP, no HP loss; two Machine Elves repeatedly prevented Drone eggs; Bastion reserve and Rootwall covered ending.
- Rift Chimera defeated turn5 at70HP, no HP loss. Three Prismatic Saps supplied30 damage and12 Guard for3Channel. Fourth Sap chosen over Seasons Turn; efficiency warrants review.

- Authorized visual fix during run: Apex entrance animation now runs once per floor per run, not on movement/redraw/return from battle. Source, packaged release and isolated watch UI patched; no gameplay changes. Browser check: {"sameFloorCount":1,"nextFloorCount":2,"cssAnimation":"none","step":1560}
