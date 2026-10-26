# Trickster Apex rematch: zero damage, zero consumables

Jonathan's seed1877058977, run01cf6cdc-3bc4-420a-9253-76605bdf8ec2, Apex floor2 Trickster opening captured at2026-10-26T02:55:33.615Z. Rules4.0.35. Start57HP, boss349HP. Manually selected75-decision line independently replayed from the archived opening: victory on turn6,57HP throughout, zero damage taken, no healing, all seven consumables preserved. Mirror Armor's once-per-battle use is spent; it refreshes next battle. No live-save edits or balance changes. This proves a winning line, not unique optimal play. Later draws are seed-specific; follow the attack order because Plasma Ball consumes randomness even with one enemy.

Coordinates below are **(row,column)**, counted from the top-left starting at1. Identify cards again after each shift.

| End of player turn / enemy phase | Player HP | Trickster HP |
| --- | ---: | ---: |
| 1 | 57 | 269 |
| 2 | 57 | 227 |
| 3 | 57 | 183 |
| 4 | 57 | 130 |
| 5 | 57 | 54 |
| 6 victory | 57 | 0 |

## Turn1

Place Sapling+ **(3,4)**, Season's Turn **(2,4)**, Water Blast **(3,3)**, Mindfire **(3,5)**, Lucid Needle **(4,4)**, Corner Flame **(6,7)**. Needle costs0Focus; the others use all5Focus.

Advance. Activate in order: Sapling, Season's Turn attuned **Earth** from Sapling, Mindfire (0Focus remaining,6damage), Lucid Needle targeting Trickster, Corner Flame. Sapling attacks at7HP then grows to10.

End turn. Defend35Light with **Sapling → Mirror Armor → Silver Bracelet → Reservoir Bracelet**. Sapling dies. Mirror absorbs20 and reflects30Light against Chaos; bracelets stop the last5. Reservoir keeps3Guard.

## Turn2

Place Heartwood Bastion **(6,1)**, Plasma Ball **(6,2)**, Rootwall **(5,4)**, Root to Flame **(6,4)**. Rootwall now has Lucid Needle north and Root to Flame south, with both horizontal spaces empty. Do not activate Root to Flame.

Advance. Activate **Rootwall in Arcane → Bastion → Season's Turn in Arcane → Plasma Ball → Mindfire**. Changing Season's Turn from Earth to Arcane provides8Guard. Mindfire still spends0Focus.

End turn. Defend35Fire with **Rootwall → Season's Turn Guard → Silver Bracelet → Reservoir Bracelet**. Leave Bastion's19Ward untouched.

## Turn3

Place upgraded Ignis **(6,5)**, ordinary Ignis **(6,3)**, Transmute **(6,6)**, Prismatic Sap **(5,6)**. Keep Rootwall's east/west spaces empty.

Advance. **Transmute upgraded Ignis at(6,5) to Light → activate that Ignis → Arcane Rootwall → Plasma Ball → Water Blast.**

End turn. The bottom row shifts; Rootwall moves to **(5,5)** and Bastion to **(6,3)**. Use Rootwall against the first15Light, its remaining1Guard against15Chaos, then Bastion for the remaining14. Bastion retains5Ward. Preserve both bracelets.

## Turn4

Meld Living Lattice beneath Bastion **(6,3)**, choosing **Earth**. Place Shield+ **(5,6)**, Thought Bulwark **(1,7)** and Lucid Guide **(3,7)**. The latter placements make the rightmost column the fullest, controlling the next shift. Bulwark need not activate.

Advance. **Bastion → Season's Turn in Arcane → Light Ignis, now at(6,7) → Prismatic Sap at(5,7), attuned Light from Ignis.** Activating the Hypnosis-marked cards uses their turn allowance before Hypnosis can act.

End turn. Defend35Chaos with **Lucid Guide → Prismatic Sap's Light Guard → Bastion**. Guide dies; Bastion retains11Ward. Bracelets remain unused.

## Turn5

Place Starleaf **(5,3)**, Shield+ **(4,2)**, Solitude **(1,1)** and the new Plasma Ball **(1,3)**.

Advance. **Starleaf in Light → Solitude → new Plasma Ball → Bastion**. Starleaf has four diagonal cards and one orthogonal card:8+24−2=30base,45against Chaos. No Fury Sap needed.

End turn. The locked rightmost-column shift preserves Starleaf's formation. Defend the first15Light with **Silver Bracelet → Reservoir Bracelet**, then the15Chaos with **Bastion**. Bastion retains14Ward.

## Turn6

Place nothing. Advance. **Starleaf in Light → new Plasma Ball at(1,3)** wins before another enemy turn.

## Lessons

- Reservoir's unused Guard carries forward. Preserving it while renewable card defenses handle earlier turns pays for later split attacks.
- Season's Turn provides useful Guard by changing its activation element on turn2.
- The first horizontal shift is steered into the deliberately filled bottom row. Later, the rightmost column is made fullest before the warning locks, leaving the eventual Starleaf formation intact.
- Some placements serve as formation supports or shift-target bait rather than activations. The spent Corner, spent first Plasma, Lucid Needle and unactivated Shield support Starleaf.
- All consumables remain available for later Apex fights. The earlier continuation from turn4 was a recovery line after20HP had already been lost; it was not evidence that this fight required spending supplies.

`opening-record.json` preserves the source; `winning-line.json` contains the exact75legal decisions and state; `verified.json` records the independent replay. `save-before.json` is a backup copy only. The live run was not rewound.
