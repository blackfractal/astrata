# Event Stratum filtering — 3.0.30

Jonathan encountered **A Light in the Chitin** (`depthsCache`) in S1. It is explicitly marked `stratum: 3` and should only appear in the Lucent Depths.

The initial event queue shuffled every registered event except the shrine. The encounter code supplied a Stratum-filtered refill pool, but `drawDeck` used that pool only when the existing queue was empty. Consequently, S3 events could appear during the first traversal of S1's event deck.

The initial queue now retains only eligible events. Event selection also filters existing saved queues before drawing, preserving the order of valid entries and consuming no RNG while filtering. Both paths share the existing Stratum eligibility rule. The initial shuffle still consumes the same RNG sequence as before, so unrelated initial enemy/item rolls are not shifted by this fix. S3 retains its three events; quest shrine selection remains separate. Already opened events, rewards and purchases are left intact; the live profile was not edited.

Validation: 630 tests pass. New regression coverage checks 50 initial seeds, S1/S2 old-queue restoration, legal-order/RNG preservation, fully invalid queues, repeated refills across all three Strata, the S3 Chitin event and shrine handling.

Design v4.213, build log round200. Portable app/ZIP refreshed. Restart the game to load the fix. No commit or push.
