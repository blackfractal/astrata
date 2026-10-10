# Cinder Hart: preserve the opening, accelerate the finish

2026-10-08. Seed387412921, run d1805a0a-fe10-4fc9-b7d7-ca45317e610e, package2.1.14/rules2.1.11/content2.1.10. Jonathan had retried the fight. Latest captured state: turn9,5HP,Burn8,Channel0,Hart26HP. The winning line below restarts from his original checkpoint; it does not claim that late state is recoverable.

Verified victory turn7 at14HP. Original checkpoint56HP before enemy ambush; bracelets reduceAntler10to6, thenBurn2 leaves48HP for firstplayerturn. Preserve34actions including defenses and all firstthreeplayerturns of latestattempt, arrivingturn4at38HP/Hart104HP. Exactstate comparison and all10originalgameplaysource checks pass; no edits to HP/items/RNG/rules. Userprofile read only.

Opening dealt38damage in firsttwo turns and was good. Latest attempt stalled onturn5 andturn8: no damage while Burn escalated. Equipment provides extraFocus/Channel but onlytwoBronzeBracelets, noArmor, allcardsunupgraded; noCorrode available to triggerPurify. This is a damage race, not an obviously trivial fight.

Winning differences:
- T4: placeResonance (alongsideFocusEnergy), activateexistingShield thenResonance, WaterCinderSnap11, Plasma8, WaterBlast6, StarFlask6:31damage. Takes8totalHP, enteringT5at30. Human usedFamiliarConduit+WaterShield+WaterCinder for11damage and enteredT5at34: trades4HPfor20damage.
- T5: ThornChoir atslot20(index19,row3column6), adjacenttoRainLantern(slot19), OpeningRite(slot21), spentGust(slot27), andnewBlast(slot13). Fourneighbors yield12base. Plasma10(includingRing), TransmuteThornWater, Thorn18. ChannelDraught permitsFocusEnergyactivation too.28damage insteadhuman0. Differentplacements/discards change subsequent draws legally.
- T6: recallRain andspentPlasma; putredrawnWaterBlast inRain'sformerposition, maintainingThorn'sfourneighbors. WaterThorn20(includingRing),WaterBlast11,adjacentWaterattunedBlast8:39damage. Hart6HP, player14HP enteringT7.
- T7: anArcaneBlast plusRing killsHart. Searchtrace has unnecessaryplacements andShieldactivations beforekill; these are legal, not recommended as needed.

Both consumables were already owned and unused inJonathan's capturedattempt. TransmutingThorn returns36carddamageover2uses (plus2Ring onsecond), versus+4peruseWaterbenefitforPlasma. Manyneighbor utilitycards canbe spent andstill supportThorn. Search is anexistenceproof, not optimality or a blind first-attempt victory. No balance edits justified from this one case.

`headless-replay.zip`: frozen engine, checkpoint, originalevents, prefix and continuation, verifiedtrace, originalsourcebuild, verifier. Extract and run`node verify.mjs`. All actions validated through engine. `verification.json`records sourcehashes and outcome.
