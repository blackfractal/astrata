# Cnidarian: manually selected winning line (historical rules 3.0.11)

Jonathan requested a Codex-directed attempt from his prepared starting position. Victory on turn 10, 69/70 HP, 121 legal decisions, no rewinds or automated policy/search. The frozen-source verifier independently reproduces the final observation exactly. Four HP damage taken, three recovered through Holy Armor; one Insight Dew and one Channel Draught used.

This used the prepared full-health Cnidarian test: Jonathan's exact post-Hive 36-card deck, equipment and inventory, 4 Focus/3 Channel, no Restless. It does not establish a win from the original Hive's remaining 20 HP.

The decisive encounter weakness was card-blocked tendrils. Wind Living Lattice at R1C6, Shield at R2C6 and Focus Energy at R3C5 stopped all three tendrils. No Allies were placed, no tendrils were killed, and no replacement escalation or Poison occurred. Jonathan has since requested adjacent-only attacks and card swapping, so this is **not a demonstrated victory under the revised encounter**.

The offensive engine used Thorn Eruption surrounded by damaging cards, Transmute to Wind, Storm Canopy, Wind Blast relays, Wild Conduit and Second Spring. Undertow refreshed Conduit and finally Storm Canopy. Lattice, Shields, Gold/Silver bracelets and Wind defenses covered the boss's Water/Light/Chaos cycle. Kiln never fired; this was not an optimized minimum-loss solution.

- `attempt.json`: initial/final states, every decision and pre-action checkpoint.
- `sources.json`: preserved installed game modules.
- `winning-line.json`: compact replay keys with initial/final states.
- `verification.json`: outcome, versions and source hash.
- Replay: `node tools/verify-codex-cnidarian.mjs`.

The user's live save was not modified by this attempt.
