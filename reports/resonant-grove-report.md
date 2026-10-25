# Resonant Grove

2026-10-25 · rules/content 4.0.25 · design 4.246

Jonathan approved extending Fourfold Grove to any complete square with 6 base damage plus2 per other card, or4 for Earth cards, selecting the most valuable formation. He requested a new name and one full-box visual linked to the card's corners.

Renamed to **Resonant Grove**. Stable ID `square` and existing artwork preserve save/collection identity. Costs remain1Focus placement,1Channel activation,1Focus Recall, with2activation allowance. No new upgrade was introduced.

`squareFormation` is shared by damage, live badges and outline rendering. Enumerate solid filled squares containing Grove, size2–6 on the7×6 board. Exposed top cards count once; Grove and melded attachments do not add bonus. Earth uses the committed element, including current-turn Attunement/Conduit and Transmute. Frozen, Severed, Insanity-covered and Ideon-covered spaces cannot complete the square. Spent cards still contribute. Highest bonus wins, then larger size, then topmost/leftmost origin. A disrupted large square falls back to the best remaining square; none means6base damage. Nausea, elemental matchup and other normal modifiers still apply afterward.

Formation reference, with all non-Earth / all Earth supporting cards:

| Square | Damage |
|---|---:|
| 2×2 | 12 / 18 |
| 3×3 | 22 / 38 |
| 4×4 | 36 / 66 |
| 5×5 | 54 / 102 |
| 6×6 | 76 / 146 |

Visuals use one perimeter box and four corresponding corner-to-card-corner lines instead of pairwise pattern links. A live badge shows size and raw bonus, with an explanatory tooltip. Hover/focus on a member highlights the formation. An exhausted Grove has no active outline. Graphics do not intercept input and remain readable in reduced-motion mode.

Verification:766rules tests pass. New cases cover every square size, actual HP loss/legal previews, overlapping nonnested squares, ties, nested growth, disruption/fallback, spent cards, attachments, committed/transmuted elements, Nausea, save identity and read-only presentation. Existing spatial tests retain boundary/Sever coverage. Isolated packaged Edge UI checks complete, broken, spent and reduced-motion states, asserting one perimeter/four rays, exact ray endpoints at card corners, no old pattern links, correct badges and no renderer errors. Complete-formation screenshot visually reviewed. Source/runtime/portable ZIP verified. No native-window or campaign balance test claimed; high-end66/146damage needs later play evidence.

Design document and implementation handoff updated. Live player save unchanged; no commit/push.
