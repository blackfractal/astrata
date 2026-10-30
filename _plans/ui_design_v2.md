# UI Design v2 — working notebook

Jonathan · 2026-10-30

## Direction and delivery order

Simplify the information on screen while making spatial play more satisfying. The game already feels crowded on desktop; a phone will magnify that problem. Preserve strategic information, but distinguish what a player needs for the current decision from rules they can inspect when needed.

The title-screen and Archives pass belongs on **main**, for Jonathan to commit and push first. Broader gameplay changes belong on a later branch based on that committed main. `design/ui-v2` was created before this clarification and has no commits of its own; it will need to start from the updated main when brainstorming becomes implementation. Do not change gameplay UI or rules as part of the Archives pass.

## First pass implemented on main

### Title screen

- Remove “A journey through the Strata”.
- Replace the three-line spellbook/forest paragraph with “Your mind is the battlefield.” This is the current copy choice, open to further discussion.
- Remove the Strata/version/controls footer. Mouse, Enter and Escape help is available under Controls in Settings.
- Keep the title, forest art and primary menu. Fit the complete menu when both Continue and Resume tutorial are present.

### Archives navigation

- Archives opens directly to Cards. There is no hub or All Archives page.
- Persistent navigation appears above the large page heading: **Cards · Enemies · Equipment · Achievements · Run History**.
- Return to start and Escape return to the title screen. Details close back to the current filtered gallery.
- Run History displays the most recent 20 runs; complete records remain stored.

### Browsing collections

Search and discovered/undiscovered selection remain visible. Additional filters sit behind a Filters button, with a count of active filters and a clear action. The gallery uses art and short labels; selecting an entry opens complete details.

| Collection | Filters |
| --- | --- |
| Cards | Element, Attack/Defense/Utility, rarity, card type; character when more than one character exists |
| Enemies | Stratum, element, Mote/Eidolon/Archon, movement, main enemy/Ideon |
| Equipment | Category/slot, element, role, introduction Stratum, cursed/uncursed |

The Apex Predator is an Archon; there is no separate Boss rank. Cards can belong to multiple roles. Equipment has no authored rarity, so there is no invented rarity filter. Unknown entries remain `?`: their names, art, stats and metadata cannot be inferred through filters. Filter options come from discovered content. Browsing does not discover anything.

Card art in Archives uses four fixed stat corners:

| Corner | Stat |
| --- | --- |
| Top left | Focus placement cost |
| Top right | Channel activation cost |
| Bottom left | Uses / activation allowance |
| Bottom right | Recall Focus cost |

Each uses a short label, number and explanatory hover text. `—` means unavailable; `∞` means unlimited; Undertow's dynamic Focus cost reads `1+`. Placement-only cards do not imply a usable Channel activation. This is an Archives prototype, not yet a decision to change cards everywhere.

### Archive cleanup

Patient Spoolkeeper's two lesson stages appear as one enemy. Borrowed Oracle's two tutorial stages and regular encounter appear as one gallery identity, with a selector inside details when both tutorial and regular versions are known. Encountering the tutorial does not reveal the regular enemy's stats. Gameplay IDs, encounter records and discovery evidence stay separate.

Retire the obsolete defeat achievements for Seamstress of Absence, Censer Engine and Choir of Borrowed Hands, which became Eidolons. Preserve previously earned records without displaying these as current boss goals. Show how to earn ordinary achievements. Calm the Apex Predator, I Stand Alone, Calm Astrata and A Little Kindness instead show `??????????????????`, including after completion.

## Achievement notes for the designer

- **Without the Menders:** complete S1–S4 while retaining the original Machine Elves received entering S2, never placing or activating any Machine Elves. Drawing, discarding, recycling and upgrading are allowed. Removing the original or using another copy invalidates the challenge.
- **A Little Kindness:** donate to the Traveler at all three inter-Stratum Taverns in the same normal run. This is tracked now and is intended as one prerequisite for hidden S5 later.
- **Calm the Apex Predator:** intended condition reaffirmed by Jonathan: obtain a special potion and use it on the Predator at exactly 1 HP. Calming opens the hidden S5 route to Astrata herself, with the other secret prerequisites still required. Potion details and transition behavior remain to be planned; this is still unimplemented. See the main design’s Hidden S5 route section.

The Without the Menders explanation is now public. Keep the other secret-route explanations in designer notes; their player-facing descriptions are question marks.

### Additional full-run achievements (4.0.42)

- **Blast Miser:** complete S1–S4 without placing the starter Blast (including upgraded/Transmuted copies). Water Blast is allowed.
- **Shield Miser:** complete S1–S4 without placing the starter Shield (including upgraded/Transmuted copies).
- **On a Strict Diet:** complete S1–S4 without using a consumable. Collecting, buying, carrying and selling them are allowed; drinking directly from a pickup counts as use.
- **Masochist:** complete S1–S4 without entering a spawned map Tavern, including the Apex-floor Tavern. Between-Strata Taverns are allowed.

- **Sedentary Lifestyle:** complete S1–S4 with fewer than20 total map steps; diagonal steps count1 and automatic transitions/waiting count0.

- **Elemental Purity:** finish S1–S4 with a nonempty Grimoire containing Arcane plus at most one other printed element. All-Arcane and single-element decks also qualify. This tests the final deck, not every earlier deck state; temporary transformations do not count.

- **Pop Goes the Weasel:** defeat a full-health Archon with one direct damage hit and survive the encounter. Separate hits cannot be combined. This is an encounter achievement, not a full-run requirement.

These seven have explicit descriptions and persistent unlocks. Player-facing descriptions use “Complete a run” instead of listing Strata1–4. The first five track from fresh-run start; incomplete legacy records cannot prove eligibility. Elemental Purity can be established from a complete final deck. Battle restarts retain violations.

## Gameplay UI brainstorming — not implemented

### Principles to test

- Show state visually before explaining it with sentences. Use persistent numbers and clear state changes for the information needed now; put rules in inspection and contextual help.
- Make the next legal action and its consequence obvious without pulsing everything simultaneously.
- Favor one selection and one contextual action area over repeating full controls and long descriptions on every card.
- Preserve the pleasures of placement, elemental chains and defense traversal. Simplification must make their relationships easier to see, not hide the information needed to plan them.
- Avoid relying on hover for information a touchscreen player needs. A tap/hold inspection interaction must have a clear, reliable equivalent.

### Candidate experiments

1. Compare a compact card face with the four-corner system against the current battle cards. Decide which values must remain visible when a card is small, and which appear only when selected.
2. Try a single selected-card inspector, with art, full rules and actions, instead of text and controls repeated over the entire grid.
3. Separate persistent resource state, selected-action costs and damage previews visually. Keep the element matchup and defense origin visible during targeting.
4. Test how much side-panel content can collapse during battle without obscuring equipment, pending attacks or enemy intentions.
5. Prototype a dense S3/S4 board at landscape phone size. Test selecting a particular card, inspecting a Corruption underneath it, choosing an Ideon target and routing a multi-hit defense. Consider temporary zoom or a larger inspection view before reducing the grid or changing game rules.
6. Audit persistent explanatory copy screen by screen. Keep tutorial instruction and short labels; remove prose that merely narrates the interface.

### Questions for a future design session

- Which information should a selected card show first: damage/Guard, remaining uses or activation choices?
- Can connection effects communicate synergy without making a full grid visually noisy?
- Which gestures remain comfortable on a phone, and which need explicit buttons?
- Does enlarging the active decision area help more than making every element smaller?
- What should the UI teach through interaction, and what still needs a tutorial?

Keep the working Electron desktop shell and shared game rules. Mobile layout and a mobile shell are separate concerns; this notebook does not authorize a rewrite. Make a small working interaction prototype before choosing a broad redesign.
