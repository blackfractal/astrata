# Cannon mine response spaces — 4.0.5

2026-10-17. Jonathan requested that the Cannon's newly placed Mind Mines not be covered by bullets on their appearance turn.

Charging still announces the next Final Blast immediately. Mine placement is queued after all enemy actions and their bullet movement/launches, but before end-of-round Corruption processing and the next player turn. It chooses actual empty spaces after those actions, avoiding both moving and newly spawned bullets and handling combined encounters without changing projectile behavior. Existing player cards, Ideons and Corruptions remain excluded; if fewer than two spaces exist, place only those available. Mines retain20Fire and a full player response turn, then detonate before Final Blast. The surrounding diamond permits placement of any element; occupied Ideon centers remain unavailable. Existing mines in already-started saved positions are not relocated.

Validation:660regression tests pass. Coverage includes previously overlapping seeds3/24, five-bullet volleys, combined Cannon owners, incoming-attack save/resume with pending mine jobs, cover/detonation order, and field versus center placement. Packaged UI confirms two visible mines with no bullet centers, actual Blast cover placement, and no renderer errors in an isolated profile. No live-profile changes.

Main design4.227/S3draft0.51, BUILD_LOG207 and handoff updated; app and portableZIP refreshed. Further S2/S3 difficulty suggestions are recorded in the second-run assessment as proposals only; no enemy HP/damage tuning was applied.
