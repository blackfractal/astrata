# Tendril attack chosen after movement — 3.0.19

Jonathan requested Tendrils decide strike versus Splash after moving. A shared tendrilPlan now supplies the deterministic destination/target to combat and intent. Existing adjacent Allies keep the tendril in place for a strike; otherwise it approaches its selected Ally, then checks orthogonal adjacency and strikes immediately if in range. A still-distant or obstructed target receives Splash. Growth, source position, swapping, no-Ally playerSplash/edgePoison and fixed return warnings remain intact.

Validated596tests, including scaled arrival strike, blocked Splash, all directions, Construct/Guard swapping and preview parity. Packaged isolated-profile UI confirms the arrival strike intent, fixed return warning and normal/reduced-motion playerSplash traversal without renderer errors.

Living Lattice diagnosis: read-only inspection of Jonathan's latest turn4 Placement snapshot found3Focus, standalone depleted Wind Lattice at slot17, legal Recall costing1Focus. Jonathan confirmed the button was below the popup scroll. Depletion does not prevent Recall; no rule/UI changes or user-save writes were needed for that question.

Design4.202/S3draft0.37/package3.0.19. App/archive refreshed. No commit/push.

Follow-up: shortened the shared depletion label to "Depleted: cannot activate", matching design/tutorial wording. A fixed isolated depleted Wind Lattice UI fixture confirms the disabled activation label and enabled1Focus Recall control fit on the same row. Initial live-snapshot-copy checks were stale because the user continued playing; no user state was changed.
