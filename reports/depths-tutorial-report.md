# Stratum 3 tutorial — The Listening Hollow

Version 4.0.4 · 2026-10-17 · Jonathan / Codex

Requested: teach Ideons through lore about invading thoughts and whispering voices, demonstrate Lucid Guide attacks, and show why Shields/Wards farther right cannot intercept an Ideon already inside the defensive line.

Implemented 23 steps, ending in independent practice against the same Borrowed Oracle. The guided sequence uses actual card costs, 18-damage Guide movement/attack in two formations, and a real 6-Chaos attack from column 3. Charged column-6 Ward and column-7 Shield are ineligible; column-2 Shield absorbs 4 and Bronze Bracelet absorbs 2. Tutorial supplies 2 Focus/3 Channel; normal game resources and difficulty are unchanged. Existing Oracle art is intentionally reused for the same creature, with tutorial-only variants and provenance aliases.

First S3 entry starts the tutorial after preserving normal Continue and granting Lucid Guide. Replay unlocks for profiles that have reached S3. Exact-step resume and independent retry are supported. Completion records tutorial progress, not a normal Stratum victory. Independent guidance hides after the introduction, with gentle 15-second idle suggestions.

Validation: 656 regression tests pass, including complete deterministic walkthrough with reload at every step, real defense legality/damage, retry state/RNG, and independent policy victory. Asset audit: 215 required entries, no missing files or provenance. Packaged UI verification covers automatic entry, all guided steps through actual click controls, Guide movement/Ideon targeting, exact-step resume, idle suggestions, completion and replay. Guided steps use real UI controls. Independent practice has a verified legal headless winning line using an action-effects baseline; its terminal state is resumed in the isolated profile to test completion UI/persistence. The ordinary board-aware AI lost this revised practice encounter (turn16, Oracle6HP), so this is not an AI-victory claim or a reason to weaken the lesson. The player chooses their own actions. See depths-tutorial-ui-verification.json and screenshots/depths-tutorial.

Design v4.226, S3 planning draft0.50, README and handoff updated. Packaged app and portable ZIP refreshed. User live save/profile untouched; no commit or push. No new balance changes or normal encounter additions.

Revision: Jonathan requested using only the guaranteed S3 companion for the specialist attack lesson. Removed Lucid Needle from the fresh tutorial deck and all teaching text. Explain rows, columns and adjacency, then demonstrate the Guide moving right to attack and later down to attack. Old guided saves map by lesson ID, retire Needle steps safely, and remove the obsolete tutorial Needle; already-independent practice preserves its exact board. Tutorial schema version2.
