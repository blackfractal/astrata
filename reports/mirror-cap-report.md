# Mirror Armor: capped reflection

2026-10-25 — version 4.0.33, design 4.254.

Jonathan approved absorbing and reflecting at most 20 damage from one chosen attack, then exhausting Mirror Armor for the battle. Remaining damage continues through other eligible equipment or reaches the player; it cannot return to grid defenses. Smaller hits still spend the once-per-battle use. Price remains 180 Gold.

The cap applies to the incoming amount absorbed and returned before the existing offensive elemental matchup and enemy Guard. For example, a 40 Water hit reflects 20 base Water damage; against Fire that becomes 30 before enemy Guard, while the other 20 incoming damage still needs defense. This preserves the existing elemental reflection rule.

The legal defense action now exposes the actual capped protection, labels it `Reflect 20` (or less for a smaller hit), and supplies the same value to AI evaluation and the incoming-attack remainder preview. Existing attack traversal/impact frames show the absorbed amount and remaining orb value.

Validation: all 801 rules tests pass. Four added cases cover a 42-damage attack, 20 reflection, subsequent Bracelet defense, no backward grid defense, Continue persistence, smaller hits exhausting the charge, next-battle reset, elemental matchup/Guard, and lethal reflection still allowing the remaining damage to hit before victory. No new balance campaign was run. The live profile was not edited.

Tavern advice revised after Jonathan highlighted four upgraded Shields and his high-damage spells: Sturdy Metal Helmet75 plus Fury Sap85 costs160 of207Gold, leaving47. Helmet can add16Guard across the four Shields' initial two uses each. A second Fury Sap can double a separate large attack; two Transmutes already reduce the marginal value of Prismatic Tincture. This supersedes the Crown/Tincture recommendation in the preceding report; no purchases were executed.
