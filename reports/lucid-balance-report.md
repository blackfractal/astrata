# Lucid card balance — 3.0.18

Jonathan requested Lucid Needle deal15 within a two-space NSEW diamond and8 elsewhere, and confirmed8 against main enemies. Implemented single-target Arcane15 against Ideons with Manhattan distance≤2,8 against distant Ideons/off-grid enemies. No pathfinding requirement or obstacle occlusion. Existing upgrade+2 gives17/10; Focus0,Channel1,uses2,Recall1 retained. Damage resolves through existing Nausea and elemental rules. Shared cardPower now accepts a target for near damage, used by combat, legal action effects/AI and hover previews.

Lucid Guide damage5→18, upgraded21. Existing Focus1/Channel1/12uses/12HP/noRecall, one-space movement and+3 mark for another card retained. No proposed HP buff or command interruption added. Removed hardcoded5 from preview/policy. A moved Guide killing a18HP unguarded Tentacle warns its new location for delayed return.

Validation:595rules tests pass. Added diamond axial/diagonal/edge/wrap boundaries, upgraded values, main-enemy damage, Nausea, single-target behavior, preview/effect parity, Guide move/kill/return and Continue preservation. Packaged isolated-profile UI passes actual drag previews15/8/8, cancel restoration8, Guide18, no renderer errors. Live save untouched. Design4.201/S3draft0.36; package/rules/content3.0.18. Portable app/archive rebuilt; no commit/push.
