# Player-Splash Cnidarian comparison

Victory at **38/70 HP on turn 14**, 184 legal decisions, no healing, consumables or rewinds. Identical prior Titan-deck line, plus six manually selected defenses against newly added player-directed Splash. The independent verifier asserts both the frozen-source replay and exact equality of all non-Splash decisions with the 3.0.13 attempt. Same seed, deck, equipment and random attack outcomes.

See [the rule and balance report](../tendril-splash-report.md) for interpretation and comparison. `attempt.json` contains initial/final states and every pre-action checkpoint; `sources.json` freezes the modules; `winning-line.json` records replay keys; `verification.json` contains results and per-turn HP changes. Run `node tools/verify-cnidarian-splash.mjs`.

This is a controlled replay with added defense decisions, not a fresh optimized line. The authored sample build is not claimed to be an organically earned run. User save/profile untouched.
