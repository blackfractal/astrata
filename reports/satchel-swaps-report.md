# Satchel swaps and overflow — 4.0.26

Jonathan requested equipment swaps preserve Satchel usage and fitted Settings count as one item.

The existing counter already excludes equipped gear and socketed Gems: a spare fitted Setting occupies one slot. Replacing worn gear with a spare already preserves the count. The actual defects were moving worn gear into another occupied matching slot (previously displaced the other item into the Satchel) and the overflow gate hiding Tavern selling/socketing actions.

Worn rings/bracelets now swap atomically, preserving fitted Gems. Cursed worn gear cannot be relocated through the swap path. Tavern overflow exposes ordinary sales, paid socketing, equipment swaps/equipping and potion combining. It still prevents further purchases, departure, unsocketing and unequipping until capacity is restored. The overflow UI places alternative actions before permanent discard and explicitly describes fitted Settings as one slot. The 12-slot limit and normal equipped-item exemption are unchanged. Individually unequipping an item or unsocketing a Gem still creates a loose item.

Validation: all 770 rule tests pass, including four new regressions for fitted count, full-capacity spare replacement, ring/bracelet swaps plus reload, paid socketing after a full-Satchel purchase, fitted-pair sales and combining. Isolated packaged Edge UI checks resolve 13/12 overflow using socketing or selling with no discards or renderer errors; screenshot reviewed. See satchel-swaps-tests.txt and satchel-swaps-ui/verification.json. No live profile/save changes, no item restoration and no campaign balance changes. Runtime and portable ZIP refreshed.
