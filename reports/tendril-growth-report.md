# Tendril damage growth — 3.0.13

Jonathan requested escalating adjacent and Splash damage, with both resetting when a tentacle dies and is replaced.

Each tendril tracks its own completed commands. On its first command, adjacent damage is 4 and Splash is 1. Subsequent commands add 2 to the adjacent strike and 0.5 to Splash, rounding Splash upward before normal elemental modifiers. The first six values are 4/6/8/10/12/14 and 1/2/2/3/3/4. Both attack modes use the same age; movement obstruction and switching modes do not reset it. Newly spawned replacements start at age zero, while surviving tendrils retain their age. Existing Continue saves retain their tracked age as well.

Targeting, movement, Poison 2 at the edge without Allies, and replacement counts remain unchanged. A shared helper keeps previews and actual damage consistent. Existing lash/pulse/impact effects show the resulting damage. The proposed killer-space replacement telegraph/burst is not part of this change.

Validation: focused tests cover both six-command sequences, switching attack modes, actual death/replacement scheduling, surviving tendril age, Continue migration, elemental modifiers and movement. Full regression results are in `tendril-growth-tests.txt`; packaged normal/reduced-motion checks are in `tendril-ui-verification.json`.

The preserved 3.0.12 strong-deck win at 65 HP used fixed damage. It is historical evidence, not a demonstrated victory under these new rules. No live save/profile was modified and no new full-fight balance claim is made.
