# Trickster Apex rematch: no further HP loss from turn4

Captured Jonathan's live run01cf6cdc-3bc4-420a-9253-76605bdf8ec2, seed1877058977, step1560, rules4.0.35. Start: turn4 Placement,37HP,4Focus,5Channel,Trickster186/349HP. Manually chosen continuation, independently replayed through35legal decisions: victory turn6 at37HP, no healing or further HP loss. Uses two Insight Dews, one Channel Draught and one Fury Sap; preserves the other Fury Sap, Healing Sap and Recall Mist. No live save changes or game tuning. This is a demonstrated winning continuation, not a proof of optimality. Future draws below are specific to this seeded state.

The Apex rematch has349HP versus264 in current S2. Opening single hits are35 versus30; split hits15+15 versus12+12, after the rematch bonus and Apex pressure scaling. Corruption mechanics are the same as current S2. Older S2 runs may predate the stronger Trickster rework.

Coordinates are **row,column**, counted from the top left, both starting at1. Preserve the order below: attacks can advance seeded randomness even with one target.

## Turn4

1. Use both Insight Dews. They draw Solitude and Plasma Ball; Thought Bulwark now grants26Guard from nine revealed cards.
2. Place Thought Bulwark at **(1,6)**, Solitude at **(1,1)**, Plasma Ball at **(1,3)**, and Lucid Guide at **(3,3)**. This spends4Focus.
3. Advance to Activation. Use Channel Draught for6Channel.
4. Activate in order: Thought Bulwark **Arcane**, Plasma Ball, Solitude, existing upgraded Ignis at **(6,4)**, existing Corner Flame at **(6,7)**. Spend6Channel; save Fury Sap.
5. End turn. Defend False Face35Chaos with Thought Bulwark26, then Lucid Guide absorbs9 and remains at3HP. Preserve both Bracelets. Activating the marked Ignis and Corner also prevents Hypnosis from activating them again this round; the depleted Bastion cannot activate.

## Turn5

1. Place Transmute at **(1,2)**, upgraded Ignis at **(6,1)**, ordinary Ignis at **(6,2)**, and Shield+ at **(1,4)**.
2. Advance. Transmute the Plasma Ball at **(1,3)** to **Light**. Activate Plasma Ball, the existing Ignis at **(6,4)**, and Thought Bulwark at **(1,6)** in **Arcane**. Spend5Channel. Save Fury Sap.
3. End turn. The committed shift moves Thought Bulwark to **(3,6)**. Use its22Guard against both hits:15 against Light, then its remaining7 against Chaos. Use Silver Bracelet4, then Reservoir Bracelet for the remaining4. No player damage. The spent Corner is destroyed crossing a Hole; this line does not depend on it surviving.

## Turn6

1. Place the newly drawn Starleaf at **(2,2)**. Its four diagonal neighbors give+24, while Transmute directly above costs2: **30Light base damage**.
2. Advance. Use **one Fury Sap**, then activate Starleaf in **Light**:30×2×1.5 = **90damage** against Chaos.
3. Activate the upgraded Ignis at **(6,1)** to finish Trickster. Victory at37HP.

Artifacts: `latest-record.json` is the captured live record; `winning-line.json` contains exact initial/final states and all decisions; `verified.json` records the independent replay. `first-winning-line.json` is an earlier, less economical continuation using both Fury Saps; the recommended line uses only one.
