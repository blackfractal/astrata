# Ordered S3 boss defeat — 3.0.23

Jonathan requested boss disappearance followed by all remaining owned Ideons. Generalized the existing Hive presentation for Cannon/Cnidarian: killing damage feedback, one boss disintegration, concurrent child disintegrations, then a one-second cleared-board hold before rewards. Observations normally remove dead enemies immediately; presentation now preserves their final portrait until its sequence completes. Other owners/Ideons remain intact, and surviving player cards remain visible. Ownership cleanup, death triggers and reward mechanics are unchanged. The existing Hive path remains and does not double-trigger.

608 rules tests pass, including ownership isolation, one-time presentation, empty-child lists and prior Hive death ordering. Four packaged actual-activation checks (Cannon/Cnidarian, normal/reduced motion) verify boss-first/children-second, no boss resurrection, player cards retained and a real one-second hold. First UI check exposed the missing dead portrait; fixed before delivery. No live save writes.

Design4.206/S3draft0.41; executable/ZIP refreshed. No balance changes.
