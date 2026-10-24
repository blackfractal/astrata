// Finite tactical items; these definitions are also consumed by Archives and loot.
export function addSupplies(items, events) {
  const bottle = (id, name, effect, worth, text, stratum = 1) => {
    items[id] = {id, name, slot:'consumable', effect:{}, worth, stratum,
      expansion:'supplies', crystalCompatible:false, consumable:effect,
      text:text+' Consumed on use. No Channel cost; one consumable per player turn. Cannot enhance with Liquid Crystal.'};
  };
  for (const element of ['Fire','Earth','Wind','Water','Light','Chaos','Arcane'])
    bottle('tincture'+element, element+' Tincture', {tincture:element}, 45,
      'Change one placed player card to '+element+' for this battle, including after Recall and re-placement.');
  bottle('prismaticTincture','Prismatic Tincture',{tincture:'choose'},110,'Choose any element for one placed player card for this battle, including after Recall and re-placement.');
  bottle('shiftingSap','Shifting Sap',{shift:true},40,'Move one placed card and its entire Construct one orthogonal space to a legal empty space. Corruptions stay behind.');
  bottle('wildInspiration','Wild Inspiration',{inspiration:'top'},65,'Draw the next card. Place and activate it for free, choosing legal targets and attunement, then Discard it. Non-recallable cards are Destroyed instead. Normal conditions still apply. If placement or activation is impossible, keep the revealed card in hand.');
  bottle('perfectInspiration','Perfect Inspiration',{inspiration:'choose'},150,'Choose a card in your draw pile. Place and activate it for free, then Destroy it. Normal conditions still apply. If placement or activation is impossible, keep the revealed card in hand.',2);
  bottle('confluence','Confluence',{confluence:true},75,'Until the next enemy phase, Focus and Channel can pay each other’s resource costs at one for one.',2);
  bottle('recallMist','Recall Mist',{recall:true},40,'Recall one eligible card and its Construct to Discard for free. Cannot bypass Cannot Recall or effects preventing Recall.');
  bottle('memoryDraught','Memory Draught',{memory:true},40,'Put one card from Discard on top of the draw pile. Does not draw it immediately.');
  for (const [id,name,status] of [['rustbane','Rustbane','corrode'],['cindersalve','Cindersalve','burn'],['antidote','Antidote','poison']])
    bottle(id,name,{cleanse:status},30,'Remove all your current '+status+'.');
  bottle('sealedBreath','Sealed Breath',{immunity:true},60,'Prevent Burn, Poison and Corrode application and damage through the next enemy phase and its following start-of-turn status tick. Existing values remain unchanged during protection.',2);
  bottle('furySap','Fury Sap',{fury:true},85,'Double direct damage of your next damaging card activation this battle, including its hits and targets. Does not double statuses or equipment attacks.',2);
  bottle('bastionOil','Bastion Oil',{bastion:true},70,'Double the Guard or Ward added by your next Shield or Ward activation this battle. Does not double existing stored defense.',2);
  const gear=(id,name,slot,effect,worth,text,extra={})=>items[id]={id,name,slot,effect,worth,text,stratum:2,expansion:'supplies',...extra};
  gear('prismaticBracelet','Prismatic Bracelet','wrist',{block:4},260,'4 Guard each round. During your player turn, choose its defensive element once for the coming enemy phase. Socketed Gem resource bonuses still apply.',{socket:true,settingTier:2});
  gear('reservoirBracelet','Reservoir Bracelet','wrist',{block:4},250,'Starts with 4 Guard. After each player turn, gain 4 Guard and retain unused Guard, up to 12. First enemy phase starts with 4, not 8.',{socket:true,settingTier:2});
  gear('reclaimerBracelet',"Reclaimer’s Bracelet",'wrist',{block:3},230,'3 Guard each round. Your first two Recalls each player turn add 3 Guard for the next enemy phase, up to 9. Each Construct counts once.',{socket:true,settingTier:2});
  gear('lastStandBracelet','Last Stand Bracelet','wrist',{block:4},240,'4 Guard each round; 9 if you begin your player turn at or below one-third maximum HP.',{socket:true,settingTier:2});
  gear('echoRing','Echo Ring','finger',{},220,'Once per turn, two consecutive damaging card activations of different elements trigger a separate 5 damage attack at the second target, using the second element. Equipment attacks cannot trigger this.',{socket:true,settingTier:2});
  gear('resonanceHelm','Helm of Resonance','head',{},200,'Once per turn, activating a card attuned from a previously activated adjacent player card grants +4 direct damage or +4 Guard/Ward for that activation.');
  gear('remembranceArmor','Armor of Remembrance','torso',{},210,'Each player card Destroyed grants 2 temporary player Guard, up to 8 per round. Unused Guard expires at your next player-turn start. No passive damage reduction.');
  events.push({id:'potionDealer',name:'The Bottle Collector',stratum:1,text:'A traveler unfolds a case of colored bottles. “Certainty is cheap. Keeping your options open costs more.”',choices:[
    ...['Fire','Earth','Wind','Water','Light','Chaos','Arcane'].map(el=>({label:el+' Tincture · 30 Gold',cost:30,item:'tincture'+el})),
    {label:'Prismatic Tincture · 90 Gold',cost:90,item:'prismaticTincture'}, {label:'Keep walking'}]});
  events.push({id:'loomPotionDealer',name:'Distillations of Possibility',stratum:2,text:'An alchemist tends glass coils beside the Loom. Colored bottles are cheap; the clear one can become any element.',choices:[
    ...['Fire','Earth','Wind','Water','Light','Chaos','Arcane'].map(el=>({label:el+' Tincture · 30 Gold',cost:30,item:'tincture'+el})),
    {label:'Prismatic Tincture · 90 Gold',cost:90,item:'prismaticTincture'}, {label:'Keep walking'}]});
}
export function socketPrice(items, gemId, settingId) {
  const gem=items[gemId], setting=items[settingId];
  const row=['focusGem','channelGem'].includes(gemId)?2:gemId==='insightGem'?1:0;
  const tier=setting?.settingTier ?? (settingId==='gold'?2:setting?.worth>=100?1:0);
  return [[20,40,60],[35,70,110],[60,120,180]][row][tier];
}
