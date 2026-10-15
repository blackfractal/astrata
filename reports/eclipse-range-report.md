# Eclipse Seed range and progressive card descriptions — 3.0.20

Eclipse Seed remains an S1 Legendary. Jonathan clarified that only Ideon-specific descriptions should wait until S3, not the cards themselves. Card faces, hover text, inspection, Grimoire, rewards, trade details and Tavern services now use the shared description helper. Storm Canopy's Ideon exclusion follows the same rule. Archives reveal these clauses after the profile has reached S3; active-run descriptions use that run's current Stratum.

The previously agreed Eclipse Seed balance change is implemented: its charged release hits all eligible main enemies, plus only Ideons within Manhattan distance two of the Seed. Guardian protection still applies. Charge 2, damage 30, Focus 2, Channel 1, three uses and Recall 1 are unchanged. Elemental modifiers apply normally. Shared targeting drives resolution, target previews and AI area-target counting. No player save was edited.

Validation: 600 rules tests passed. Range regressions cover cardinal and diagonal boundaries, no row wrapping, main-enemy damage, guardian protection, elemental modifiers, charging and Continue. Isolated packaged UI tests verify both Eclipse Seed and Storm Canopy hide Ideon clauses in S1/S2 and show them in S3, without renderer errors. No new full-fight balance claim is made.

Main design v4.203; S3 planning draft 0.38. Executable and portable archive refreshed. Restart Astrata to load the update. Pending tentacle command-order/edge-return proposals were not included.
