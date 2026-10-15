# Continue compatibility repair — 3.0.15

Jonathan's Continue save was rules 3.0.11. The hard-coded compatibility list stopped at 3.0.7, plus the currently running version, so the constructor rejected the save before any migration ran. The live save was intact; restarting alone could not fix this.

Accept valid 3.0 patch versions through the current release, which share the existing migration path. Continue still rejects unknown future patches, later minor/major families and malformed versions. Historical pre-3.0 support remains unchanged. New regression coverage walks every released 3.0 patch and verifies migration of tendril behavior, checkpoint descriptions and preservation of battle HP/age/turn. No combat balance changes.

Verification includes loading a copy of Jonathan's actual save through the packaged Continue button, showing the current player-Splash/scaling text and preserving deck, equipment, inventory and combat state. The original save is checked byte-for-byte unchanged. Results: `continue-patches-tests.txt` and `continue-patches-ui.json`.
