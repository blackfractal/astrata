# Full-Satchel preflight and Tavern restoration — 4.0.27

Purchases and pickups that would exceed 12 loose items are unavailable before spending Gold or consuming an offer. The current shop/pickup/reward stays visible with “Unable to pick up, your satchel is full.” Full capacity also blocks unsocketing/unequipping that would add a loose item, with specific reasons. Events requiring capacity check before accepting payment/trades. Cards use no capacity. Atomic matching-slot swaps and one-slot fitted Settings from 4.0.26 are retained.

Removed the forced-discard screen and early legal-action gate. Players can leave, manage Inventory, use legal healing supplies or combine supplies, equip a spare, and at Taverns sell/socket. While collecting an item, management does not advance movement or reroll the offer. Direct Drink now remains available for healing pickups. Battle-only consumables retain their restrictions. Dropping a fitted Setting drops its gem too; the action names both. Legacy excess inventory remains intact without a modal interruption; new capacity-increasing actions stay blocked.

774 rule tests pass (reports/satchel-capacity-tests.txt). Packaged isolated Edge checks confirm a disabled full-Satchel purchase, selling followed by successful buying, and a full-Satchel pickup made available by drinking Healing Sap through Inventory. No forced screen or renderer errors. Evidence in reports/satchel-capacity-ui. No campaign balance claim.

On Jonathan's explicit request, restored the exact archived Tavern entry at step671 of run01cf6cdc-3bc4-420a-9253-76605bdf8ec2:537Gold,67/70HP,32cards,original unsold stock/equipment,12/12Satchel. ScorchedResolve not yet bought; RootboundRing and spareAmber restored with the snapshot. Kept before.json and before-final-restore.json backups plus tavern-entry.json in reports/tavern-rewind-20261025. Kept original archive/history. Restarted app; Continue opens this state under the new rules. Verified save and new-rule observations read-only after restore.

Runtime and portable ZIP refreshed to4.0.27. No commit/push.
