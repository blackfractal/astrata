# Jonathan's Apex Predator retry — victory

Played visibly by Codex on 2026-10-29/30, using Astrata 4.0.40. Manual choices through the game's normal legal-action interface, with a minimum 500 ms pause between actions plus normal animations. No built-in AI, balance changes, artificial resources, or combat rewinds during this attempt.

## Result and provenance

- Source run: `01cf6cdc-3bc4-420a-9253-76605bdf8ec2`, seed `1877058977`.
- Restored the archived summit arrival at `2026-10-27T02:07:42.921Z`: 46 HP, 229 gold, 48 cards, original equipment and remaining supplies.
- Retry run: `5b0522b4-057e-49eb-9c74-1fd98213bc14`. The original failed run and history entries were preserved.
- Used Liquid Crystal on Healing Sap before approaching, restoring 10 HP through legal actions. Entered combat at 56 HP; the Predator received its normal opening ambush.
- **Won on player turn 11 with 35 HP.** Combat cost 21 HP. Victory reached the result screen.
- Replayed all 167 recorded decisions from the restored summit state. Every action was legal; HP, mode, and step count matched the archived state after every decision. Replay also ended in victory at 35 HP.

Raw states, frozen source modules, full archive, action sequence, restore receipt, and replay verification are in ignored `snapshots/apex-manual-20261029/`. The canonical completed retry is also saved in the game's normal run archive.

## Decisive choices

1. **Spend Mirror Armor on the opening attack.** Reflecting 20 and using the Reservoir Bracelet for the remainder let the first player turn start at 56 HP. Its value was immediate because no placed defenses existed yet.
2. **Use elemental defense and refresh it through Recall.** Water-melded Compost Ward covered early Fire attacks. Later, Heartwood Bastion supplied much more Ward per Channel. Recalling the spent Bastion allowed a fresh Earth placement for the Water/Wind sequence.
3. **Preserve Mindfire.** Light Tincture persisted for the battle through recalls. Recall Mist rescued Mindfire during the first Unmake; another normal recall plus Memory Draught guaranteed its return later. Reserving Focus for its activation mattered as much as Channel management.
4. **Spend Fury Sap on large, reliable attacks.** Light Mindfire dealt 66 with two Focus on turn 3 and 90 with three Focus on turn 7. The latter crossed the Predator's half-HP threshold, so defense was prepared for the stronger attacks.
5. **Remove guardians efficiently.** Mindfire killed the first Sentinel; the positioned Lucid Needle killed the next one. Non-guardian Ideons could be left alive when killing the boss was the better line.
6. **Confirm the final destruction highlight.** Before the second Unmake, recalled Mindfire, Bastion, and Thought Bulwark. The resulting column warning targeted Opening Rite, spent Rootwall, and spent Shield. Those were the cards actually destroyed.
7. **Use the last placement to solve several problems.** On turn 11, Borrowed Dawn covered Nausea and contributed a diagonal to Starleaf. Season's Turn went beside it, with access to Light. Reserved three Focus for Mindfire: **45 + 33 + 30 = 108 damage** against 101 remaining HP. Borrowed Dawn did not need activation. This killed the boss before the second World Eater.

## Mistakes and qualifications

- The first Unmake was mishandled. After recalling Mindfire, several rows tied at two cards, and the topmost row won. Cinder Snap and Solitude were destroyed instead of the intended expendable row. This was a planning error, not random targeting.
- Repairing Nausea at space 32 did not fully restore Thought Bulwark: Nausea at space 40 also affected it. Its activation produced 13 Guard, not the anticipated 26. The remaining Ward and equipment still covered the attacks.
- Burn was added partly hoping to induce Purify, but it expired before the relevant cycle end. **No Purify respite contributed to this victory.**
- This proves Jonathan's restored setup has a winning line under 4.0.40. It does not establish the minimum required HP, an optimal line, or broad boss balance. Supplies were an important part of the win.

## Targeting rule confirmed

Unmake counts individual cards, including melded cards. Equal fullest rows choose the topmost; equal fullest columns choose the leftmost. Warnings update during the player's turn and are committed when advancing to Enemy. After placement or Recall, recheck the highlighted line before ending the turn.
