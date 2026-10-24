# Apex Predator retry: stop reached

Jonathan authorized up to ten failed attempts under 4.0.12, then stopping to discuss tuning. All ten completed; no win. **Do not silently start an eleventh attempt or change balance.**

Same opening seed 1428779120, step1834, 66/70 HP, 51-card deck, Predator640. Ten candidate lines mixed manually guided prefixes with bounded search continuations; not ten independent unaided manual runs. Best: candidate3, boss148HP, death from Insanity after turn18 Unmake, recorded turn19; 32 cards Destroyed. All2537 actions across ten traces independently replayed as legal, with matching final HP/mode/RNG/full battle state using frozen rule modules.

Report: [analysis](../reports/apex-line-search-4.0.12/analysis.md). Opening, ten traces, verification, rules snapshot and search source preserved in that directory. No live-profile or game-rule changes. No winning UI replay exists. The separate earlier visible retry remains untouched by this headless search.

Important nuance: last candidate blocked its second World Eater completely; its3HP loss that phase was Insanity. It later let an uncovered Insanity tick1/2/3/4/5. Do not characterize all failures as unavoidable boss damage. Search missed some longer-term repairs/formation/Ally-preservation decisions, so this is not an impossibility proof. Potential future discussion: modest boss HP reduction while retaining the destruction puzzle; no tuning authorized yet.


Update: Jonathan subsequently approved 500 HP and ten new attempts. This older stop applies to the 640-HP batch only. See apex-500-review-2026-10-24.md for the completed new batch.
