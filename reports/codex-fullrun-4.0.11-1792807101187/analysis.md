# Visible manual campaign assessment — 4.0.11

Seed: **1428779120**. Decisions chosen manually through the legal-action bridge, with the visible game and a 500 ms minimum action delay. No AI policy or solver drove this campaign. The isolated profile preserved Jonathan's regular save. Gameplay rules remained frozen; the authorized Apex background-animation fix was the only live change.

## Result

Reached the Apex Predator at **66 HP** and died to **Riven Earth on battle turn 21**, with the Predator at **126/640 HP**. Final bridge step: **2195**. Its 37 Earth damage passed through 10 Shield Guard, 4 Sap Guard, two 4-Guard bracelets and 2 armor, leaving exactly 13 damage against our remaining 13 HP.

This is one played line, not evidence that the seed is unwinnable or that the final boss requires a nerf. My overly defensive opening and several mistakes materially affected the result.

## Progression observed

| Encounter | Result | Interpretation |
|---|---|---|
| S1 Cinder Hart | Won T9, 37 HP remaining | Meaningful pressure; a Wildfire targeting mistake cost cards. |
| S2 Trickster | Won T10, 69 HP remaining | Engine handled the fight comfortably; 6 damage and 5 healing during the encounter. |
| S3 Mind Hive | Won T15, 46 → 46 HP | Elves preventing eggs and defensive reserves largely neutralized the survival test. |
| S4 Rift Chimera | Won T5, 70 → 70 HP | Multiple Prismatic Saps supplied both offense and defense efficiently. |
| S4 Void Colossus | Won T7, 70 → 66 HP | Most pressure controlled; the loss followed my Collapse retargeting mistake. |
| S4 Black Bile | Won T7, 63 → 57 HP | Burn caused the 6 HP loss; the direct attacks were manageable. |
| S4 Mind Hive | Won T15, 70 → 70 HP | Again comfortable. A 55-Ward Bastion reserve went unused; another Ward was only partly spent at the end. |
| S4 Apex Predator | Lost T21, boss 126/640 HP | Major jump in sustained pressure and card attrition. |

S4 ordinary encounters were usually safe after their opening. Movement mistakes were more costly: Blind Seer's ambush cost 11 HP before the tavern, and Glass Brood's post-Hive ambush cost 9 HP before the final ascent. Those were avoidable routing/turn-resolution errors, not proof those enemies need more damage.

## Cards and engines

- **Prismatic Sap deserves the closest review.** Four copies helped support the campaign. Each combines useful attunable damage and Guard for one Channel, allowing a defensive engine to keep attacking. Their strength came from repeated copies and elemental sources, not an isolated two-card solution. The Predator eventually destroyed most of them.
- **Machine Elves plus Eclipse Seed made both Hive fights forgiving for this deck.** Repairs prevented threatening hatches; Eclipse cleared groups; stored Ward covered what remained. The early setup window matters as much as raw enemy damage. This does not establish that either card alone solves S3.
- **Thornfall gave excess Focus a valuable job.** Removing an Ideon without spending Channel preserved activations for defense and repairs. Its repeated return to discard also mattered late, when few cards remained in circulation.
- **Plasma Ball was useful, not a universal answer.** Light Transmutation produced 24-damage attacks against Chaos, and provided a persistent element source for adjacent cards. This run did not provide a clean controlled comparison of melded versus separate Plasma Balls, so it does not justify a stacking balance change by itself.
- **Undertow remained valuable even with its surcharge.** Paying 2 Focus to return a 1-recall-cost Shield, then 1 to place it, refreshed an exhausted defense immediately. That helped late but could not offset the loss of the rest of the deck.
- **The two Silver Bracelets supplied dependable defense without solving the final fight.** This run cannot establish that Gold Bracelets are balanced; it did not use two Gold Bracelets.
- **Keystone needs a true corner.** The earlier non-corner placement did not grant its bonus. At the final fight's corner it did extend nearby cards' useful lives.

## Why the final fight failed

I dealt only about 104 boss damage over the first six turns while prioritizing setup and defense. That allowed the fight to reach several scaling cycles. The boss then removed damage cards faster than I could replace them, reducing damage per turn further and prolonging the fight again.

I also lost important opportunities through play errors: I twice treated ordinary Recall as if it returned a card to hand, and I underestimated how changing a card's current value could retarget the Predator's destruction. Ordinary Recall sends cards to discard; Undertow is the immediate-hand exception. Losing all Machine Elves meant later exposed Insanity had to be covered rather than repaired.

Two mechanics deserve further assessment:

- Applying a status near the end of a cycle can deliberately earn a **Purify respite**. I used this twice. Whether that is a desirable tactical reward or too reliable an escape should be judged across more builds.
- The Predator reached its **10-corruption cap**. It stopped adding new corruptions, but destroying covering cards exposed existing Insanity and created significant HP pressure anyway. A higher cap is not automatically necessary.

The strongest conclusion is that this particular engine had excess safety against the Hive and several preceding encounters, then insufficient sustained damage and card preservation against the Predator. A stronger line could likely have preserved more damage and ended earlier, but this run does not prove a winning continuation.

## Recommendations — not implemented

1. Assess Prismatic Sap's combined damage/Guard efficiency, especially repeated copies, before globally increasing enemy damage again.
2. Test Hive against repair-heavy decks and consider its early pressure/setup window. The large unused Ward reserve is more informative than the perfect-health result alone.
3. Keep the Predator unchanged pending a better offensive line and additional builds. My mistakes and slow opening confound a balance judgment.
4. Preserve alternatives to Titan/Transmute: Thornfall's Focus conversion, attunement chains, placement formations, and card recycling all contributed here.
5. For further progression testing, separate deliberate ambush costs from damage taken during established battles.

## Visual fix and verification

The Apex field flashed because every render replaced the field element and restarted its CSS entrance animation. The replacement tracks run/floor identity and only animates a new floor. Source, packaged release and isolated watch UI were updated without restarting the campaign or changing gameplay.

Browser verification: repeated same-floor rendering kept the animation count at 1; changing floors raised it to 2; the blanket CSS animation was absent. Syntax checks passed for the changed UI modules. Actual subsequent movement continued without replaying the entrance effect.

The game is left on the final result screen. Decision records and the final state remain alongside this report for review.
