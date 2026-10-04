import { cards, items, enemies, DRUID_COMPANION_STORY } from "./content.mjs";
export const TUTORIAL = {
  id: "stratum1",
  version: 9,
  name: "The First Clearing",
  seed: 11001,
};
const steps = [];
const note = (id, title, text, focus = "", setup = null) =>
  steps.push({ id, title, text, focus, setup, kind: "note" });
const action = (
  id,
  title,
  text,
  match,
  focus = "",
  gesture = null,
  setup = null,
) =>
  steps.push({ id, title, text, match, focus, gesture, setup, kind: "action" });
const ui = (id, title, text, control, focus) =>
  steps.push({ id, title, text, control, focus, kind: "ui" });
const place = (id, card, slot, text, gesture = null) =>
  action(
    id,
    "Placement Â· " + cards[card].name,
    text,
    { type: "place", card, slot },
    "",
    gesture,
  );
const activate = (id, slot, text, element) =>
  action(id, "Activation", text, {
    type: "activate",
    slot,
    ...(element ? { element } : {}),
  });
const phase = (id) =>
  action(
    id,
    "Advance to Activation",
    "Your placement is finished. Press the arrow from Placement to Activation. Focus returns next round; this phase uses Channel.",
    { type: "activatePhase" },
  );
const end = (
  id,
  text = "Press the arrow to Enemy. Watch the Tell resolve before making your defense choice.",
) => action(id, "Let the enemy act", text, { type: "endTurn" });
const defend = (id, type, slot, text) =>
  action(id, "Choose your defense", text, {
    type,
    ...(slot == null ? {} : { slot }),
  });
const move = (id, x, y, text) =>
  action(id, "Follow the path", text, { type: "move", x, y });
const reward = (id, card, text) =>
  action(id, "Choose your reward", text, { type: "rewardCard", id: card });
const back = (id) =>
  action(
    id,
    "Back to the Clearing",
    "Return to the overworld. Your cards recover their allowances between battles.",
    { type: "continueReward" },
  );
note(
  "welcome",
  "The First Clearing",
  DRUID_COMPANION_STORY +
    "\n\nYour journey begins in the First Clearing. Read each glowing callout, then click Continue. You can pause or return to Start at any time.",
  ".field",
  "gold",
);
note(
  "gold",
  "A glint among the leaves",
  "Gold has appeared to your right. The eight arrow buttons move one space in the direction they point. Diagonal moves cost one space too.",
  ".direction-pad",
);
move("gold-move", 6, 5, "Click the glowing east arrow to move onto the Gold.");
note(
  "gold-gained",
  "Gold collected",
  "Your Gold increased by 200. These coins will pay for Tavern upgrades later. Gold left on the Field depletes over time, so collect it quickly! Ordinary journeys offer smaller, variable caches.",
  "header .gold",
  "ring",
);
move("item-move", 7, 5, "An item has appeared one space east. Move to it.");
action(
  "ring-take",
  "An item is yours to inspect",
  "Take the Rootbound Ring. In ordinary journeys you may leave an item behind.",
  { type: "takeItem", index: 0 },
);
ui(
  "inventory-open",
  "Your belongings",
  "Click Inventory in the top-right corner of the screen. Items you wear appear in Equipped; everything else stays in the Satchel.",
  "inventory",
  '[data-ui="inventory"]',
);
action(
  "ring-equip",
  "Equip the Ring",
  "Drag the Rootbound Ring from the Satchel to your right finger. You may also inspect it and choose Equip. It adds a separate 2-damage hit to your first attack each turn.",
  { type: "equip", itemId: "ring", slot: "finger2" },
  '.satchel, [data-equip-slot="finger2"]',
);
note(
  "gear-ready",
  "Ready for the road",
  "The Ring is now Equipped, not in the Satchel. During player movement you can equip and unequip items. Gems are different: socket them only at a Tavern.",
  '[data-equip-slot="finger2"]',
  "mote",
);
move(
  "mote-move",
  8,
  5,
  "A Mosswing waits to the east. The arrow moves directly onto it. Clicking the enemy itself normally opens its details.",
);
note(
  "reveal",
  "Insight reveals your choices",
  "Watch the four cards dealt from your Grimoire. Insight starts at 4 and falls to 0 as Reveal finishes. It controls how many cards you see, not how many you may place.",
  ".resources > span:nth-child(1), .hand",
);
ui(
  "grimoire-open",
  "Your Grimoire",
  "Open the Grimoire in the top-right corner of the screen to see your deck. Undrawn cards remain there; discarded cards recycle when it empties.",
  "grimoire",
  '[data-ui="grimoire"]',
);
note(
  "focus",
  "Focus places cards",
  "Focus starts at 1. This Shield costs 1 Focus to place. Drag it from your revealed hand to the outlined space; the card stays there between rounds.",
  ".resources > span:nth-child(2), .hand",
);
place(
  "shield-place",
  "shield",
  18,
  "Drag a Shield onto the outlined space. Keyboard: focus the Shield, press Enter, close its details, then Enter on the marked space.",
  "drag-place",
);
note(
  "focus-empty",
  "Focus is spent",
  "Focus is now 0, so no more cost-1 cards can be placed. Do not worry: it returns to 1 next round. The phase arrows move only forward.",
  ".resources > span:nth-child(2)",
);
phase("first-phase");
note(
  "tell3",
  "Read the Tell",
  "Mosswing is about to deal 3 Arcane damage. A Shield activation costs 1 Channel and creates 4 Guard for this turn. Keep an eye on two numbers: Channel (2 each round) pays for activations this round; the cardâ€™s activation limit is its total uses across rounds before Recall or the next battle restores it.",
  ".enemy .tell, .resources > span:nth-child(3)",
);
activate(
  "shield-activate",
  18,
  "Click Activate on your Shield to prepare 4 Guard.",
);
end("first-enemy");
defend(
  "shield-block3",
  "block",
  18,
  "Click your glowing Shield to absorb the 3-damage attack.",
);
note(
  "shield-expiry",
  "The card stays; its Guard expires",
  "The attack was absorbed. Unused Shield Guard disappears at round end, but the card remains. Activate it again to make fresh Guard. This Shield has one use left; keep an eye on Channel and each cardâ€™s allowance.",
  '[data-slot="18"], .resources',
);
place(
  "blast-place",
  "blast",
  22,
  "Place a Blast on the outlined space. Your refreshed Focus pays for it.",
);
phase("second-phase");
activate(
  "second-shield",
  18,
  "Prepare the Shield again. The next enemy attack deals 5, so its 4 Guard will need help from your Bracelet.",
);
activate(
  "first-blast",
  22,
  "You began with 2 Channel. The Shield used 1, leaving 1 to activate Blast. Drag Blast onto Mosswing, or double-click its Activate button to hit the top enemy. Blast deals 4; your Ring adds a separate 2.",
);
end("second-enemy");
defend(
  "shield-block5",
  "block",
  18,
  "Click Shield: it stops 4 of the 5 damage. The remaining attack continues toward you.",
);
defend(
  "bracelet-block1",
  "bracelet",
  null,
  "Click your right Bracelet. It absorbs the last 1 damage without spending Channel. Its 2 Guard refills each enemy round.",
);
place(
  "synergy-place",
  "blast",
  23,
  "Place a second Blast immediately beside the first, on the outlined space.",
);
note(
  "synergy",
  "Neighbors can change a card",
  "The connecting line shows a real interaction. Each adjacent Blast adds +1 damage, so each now shows 5. Inspect card details to learn which neighbors, patterns and stacks matter.",
  '[data-slot="22"], [data-slot="23"]',
);
phase("third-phase");
activate(
  "synergy-kill",
  23,
  "Activate the new Blast against Mosswing. Its 5 damage and the Ringâ€™s first-hit 2 will finish this fight.",
);
reward(
  "ward-reward",
  "ward",
  "Choose Ward. This reward goes into your Grimoire, and we will use it in the next fight.",
);
back("first-back");
note(
  "pursuit",
  "An item beyond your reach",
  "An item lies northeast, but a Rootling is approaching. You have 2 movement points. Take both steps before the Rootling gets its movement turn.",
  ".field, .direction-pad",
  "pursuit",
);
move(
  "pursuit-move",
  9,
  4,
  "Take your first northeast step toward the distant item. You will still have 1 movement point; the Rootling waits.",
);
note(
  "pursuit-one-left",
  "One more step is yours",
  "You moved 1 space and have 1 movement point left. The Rootling has not moved. You may move up to 2 spaces before enemies take their turn.",
  ".field, .direction-pad, .section-head .muted",
);
move(
  "pursuit-second",
  10,
  3,
  "Take your second northeast step. Movement reaches 0; now watch the Rootling move one space at a time onto you.",
);
note(
  "caught",
  "Enemies move too",
  "The Rootling landed on you during enemy movement, so it acts first, before you reveal or place any cards. Your Bracelet can still defend. Moving onto an enemy yourself lets you take the first turn.",
  ".enemy",
);
defend(
  "ambush-bracelet",
  "bracelet",
  null,
  "Use your Bracelet against the Rootlingâ€™s opening 3-damage attack. It absorbs 2; the remaining 1 reaches you. Then your first Reveal begins.",
);
place(
  "ward-place",
  "ward",
  18,
  "Place Ward in the marked space nearer to you. It starts with 0 Guard and cannot defend until activated. Isolated means it needs empty neighboring spaces to activate.",
);
phase("ward-phase");
activate(
  "ward-activate",
  18,
  "Activate Ward to gain 10 Guard: it now stores 10. Unlike Shield, that stock will persist across rounds.",
);
end("ward-enemy");
defend("ward-block", "ward", 18, "Choose Ward to absorb the 3-damage attack.");
note(
  "ward-persists",
  "7 Guard remains",
  "Ward kept its remaining 7 Guard into this round. You do not have to activate it every turn. When depleted, it cannot protect you further.",
  '[data-slot="18"]',
);
place(
  "sapling-place",
  "sapling",
  19,
  "Place Sapling in column 6, directly beside Ward in column 5. Allies have HP, can attack, and may intercept incoming attacks.",
);
phase("sapling-phase");
activate(
  "sapling-attack",
  19,
  "Activate Sapling to attack with its current 4 HP; your Ring adds 2. After attacking, Sapling gains 1 HP per adjacent card, capped at 10. Ward is adjacent, so Sapling grows to 5 HP after this attack. It can still defend after attacking.",
);
end(
  "rootling-rest",
  "Rootling spends this move Gathering Strength. Advance and use the breathing room to prepare your defense.",
);
place(
  "route-shield",
  "shield",
  20,
  "Place Shield in column 7, beside Sapling in column 6. Ward, Sapling and Shield now form an adjacent line, with Sapling in the middle.",
);
phase("route-phase");
activate(
  "route-shield-activate",
  20,
  "Double-click Shieldâ€™s activation to use it without attunement. This creates 4 Guard on the right, before the attack reaches Sapling and Ward.",
);
activate(
  "route-sapling-attack",
  19,
  "Sapling attacks for its current 5 HP, then grows by 2 beside Ward and Shield, reaching 7 HP. Its attack allowance is spent, but its HP can still absorb attacks.",
);
note(
  "route",
  "Defend from right to left",
  "Rootling is winding up a 30-damage attack. Choose Shield, then Sapling, then Ward, then Bracelet. Once the attack passes a column, cards farther right cannot defend it. In normal play you may skip a defense or click your Druid to take the hit.",
  '.enemy .tell, [data-slot="19"], [data-slot="20"], [data-slot="18"]',
);
end("route-enemy");
defend(
  "route-block",
  "block",
  20,
  "Click Shield first. Its 4 Guard absorbs 4 of the 30 damage; 26 continue toward Sapling.",
);
defend(
  "route-ally",
  "intercept",
  19,
  "Click Sapling. Its 7 HP absorb 7 damage. It dies and enters Destroyed until the next battle. The remaining 19 continue leftward to Ward.",
);
defend(
  "route-ward",
  "ward",
  18,
  "Click Ward. Its stored 7 Guard absorbs 7, leaving 12 damage.",
);
defend(
  "route-bracelet",
  "bracelet",
  null,
  "Click your Bracelet. It stops 2, then the final 10 automatically reach the Druid because no defenses remain.",
);
note(
  "route-done",
  "Every layer matters",
  "You took only 10 of the original 30 damage. Each hit showed the actual HP or Guard lost. Warning: attacks will NEVER move backwards toward the right side, so choose the order of your defending cards wisely!",
  ".battle-player, header .hp",
);
place(
  "rootling-blast",
  "blast",
  22,
  "Place Blast on the marked space to finish the weakened Rootling.",
);
phase("rootling-phase");
activate(
  "rootling-kill",
  22,
  "Blast and your Ring deal the remaining 6 damage. Destroyed Allies will be available again next battle.",
);
reward(
  "water-reward",
  "water",
  "Take Water Blast. It will help with the upcoming lesson about elements.",
);
back("rootling-back");
note(
  "consumables",
  "Supplies along the path",
  "Three bottles have been visible on the Field since you arrived. Ordinary Strata scatter three supplies in seeded random places, including Healing Sap. They do not decay. Take a detour when useful, or leave them for later. Your Satchel holds 10 loose items; equipped gear and socketed Gems take no space.",
  ".field",
  "supply-route",
);
move(
  "healing-road",
  9,
  3,
  "Move west onto the Healing Sap. Entering a supply space ends your movement, just like other pickups.",
);
action(
  "healing-pickup",
  "Collect or drink",
  "Collect Healing Sap for the Satchel. When injured you can also Drink now directly from a pickup, even with a full Satchel. Leave it here preserves these visible supplies for a later visit.",
  { type: "takeItem", index: 0 },
);
action(
  "consume-healing",
  "Drink Healing Sap",
  "Use Healing Sap in the tray to restore 5 HP. It costs no Channel, but the bottle is gone permanently, including in later battles. On the map you may use one healing consumable per movement round.",
  { type: "consume", itemId: "healingSap" },
  ".consumable-tray",
);
move(
  "insight-road",
  8,
  3,
  "Move west to the blue Insight Dew. We will save this bottle for battle.",
);
action(
  "insight-pickup",
  "Keep an extra draw",
  "Collect Insight Dew. Each bottle takes one Satchel slot; this one draws a card immediately during Placement.",
  { type: "takeItem", index: 0 },
);
move("focus-road", 8, 2, "Move north to the golden Focus Draught.");
action(
  "focus-pickup",
  "Keep an extra placement",
  "Collect Focus Draught. We will use its extra Focus in the next fight.",
  { type: "takeItem", index: 0 },
);
move(
  "supplies-return-one",
  9,
  3,
  "Move southeast toward the item we were pursuing.",
);
move(
  "supplies-return-two",
  10,
  3,
  "Move east for your second step. With the supplies collected, return to the distant item.",
);
note(
  "gem-road",
  "Return to the item",
  "The next movement turn has begun. You have 2 movement points again, and the item is only 1 space north. Landing on an encounter or pickup ends your movement, even if a point remains.",
  ".field",
  "gem-road",
);
move(
  "gem-move",
  10,
  2,
  "Move north onto the item using your first step of this turn.",
);
note(
  "movement-forfeit",
  "Stopping costs the remaining movement",
  "You used only 1 step to reach this item, but movement is now 0: the remaining point was forfeited. Landing on a pickup or encounter ends your movement for that turn. Finish this pickup before the next movement turn begins.",
  ".catalog, .tutorial-movement",
);
action(
  "gem-take",
  "A Sapphire",
  "Take the Sapphire. Gems imbue Settings such as Bracelets and Rings; they are not worn by themselves.",
  { type: "takeItem", index: 0 },
);
note(
  "gem-save",
  "Save it for the Tavern",
  "You may equip ordinary items during map movement, but Gems may be socketed or removed only at a Tavern. We will save this Sapphire for your Bracelet.",
  '[data-ui="inventory"]',
);
note(
  "curses",
  "Read before you take",
  "Some objects are Cursed; some cards are Hexes. Their drawbacks can persist between battles. Inspect their text before taking them. A visiting Tavern Healer can remove them, sometimes for Gold, HP or a sacrifice.",
  '[data-ui="grimoire"], [data-ui="inventory"]',
  "ember",
);
move(
  "ember-move",
  9,
  2,
  "Move west onto the Ember Mote to explore elemental matchups.",
);
note(
  "elements",
  "Fire meets Water",
  "This enemy is Fire. Water attacks deal +50% damage to Fire, rounded up; Earth attacks deal half. Fire, Wind, Chaos, Light and Arcane attacks stay neutral against this Fire enemy. The enemyâ€™s Tell shows its attack element. The same cycle applies to defensive attunements and equipment: Water Shields, Sapphire Bracelets and Water Armor protect better against Fire.",
  ".enemy",
);
note(
  "consumable-phases",
  "One timely advantage",
  "During battle you may use one consumable per player turn, without spending Channel. Focus Draught adds 1 Focus during Placement; Insight Dew draws 1 card immediately during Placement. Channel Draught adds 1 Channel during Activation. Healing Sap restores 5 HP in either player phase. Star Flask throws 6 Arcane damage during Activation. Phase restrictions are one-way.",
  ".consumable-tray",
);
action(
  "consume-insight",
  "A glimpse now",
  "Use Insight Dew. It draws one extra card now without discarding this hand or restarting Reveal. Other consumables will be unavailable until your next player turn.",
  { type: "consume", itemId: "insightDew" },
  ".consumable-tray",
);
place("water-place", "water", 22, "Place Water Blast on the marked space.");
phase("water-phase");
activate(
  "water-attack",
  22,
  "Water Blastâ€™s 7 becomes 11 against Fire. Your unsocketed Ring adds a neutral 2. Drag over the enemy without releasing the mouse button to see a preview of the damage change from the elemental matchup. Release over the enemy when you are ready to attack.",
);
end("ember-enemy");
defend(
  "ember-bracelet",
  "bracelet",
  null,
  "Your unsocketed Bracelet absorbs 2 of the 3 Fire damage; the last 1 reaches you. Water-attuned defense protects best against Fire, just as Water attacks beat Fire. Same-element matchups are neutral.",
);
action(
  "consume-focus",
  "An extra placement",
  "A new player turn makes consumables available again. Use Focus Draught now: Focus rises from 1 to 2, enough to place both Blast and a Shield this turn. The bonus is immediate, not a permanent increase.",
  { type: "consume", itemId: "focusDraught" },
  ".consumable-tray",
);
place(
  "attune-place",
  "blast",
  23,
  "Place Blast beside Water Blast. An adjacent elemental card gives Blast an Attunement choice.",
);
place(
  "potion-shield",
  "shield",
  21,
  "Spend the extra Focus on this Shield beside Water Blast. You still need Channel to activate it; placement alone provides no Guard.",
);
phase("attune-phase");
activate(
  "attune-attack",
  23,
  "Select Blastâ€™s Activate control, choose the neighboring Water Blast for attunement, then click or drag onto the enemy. Choosing an element only previews it; you can change your choice or Unattune before committing. Its 4 becomes 6; your Ring supplies the final 2.",
  "Water",
);
action(
  "element-back",
  "Back to the path",
  "Return to the Field after seeing the enemy defeated.",
  { type: "continueReward" },
);
note(
  "cycle",
  "Remember the cycle",
  "Fire burns Earth. Earth blocks Wind. Wind dries Water. Water douses Fire. Use this same cycle for attacks, defensive attunements and equipment: +50% damage, Guard or Armor protection against the element you beat; -50% against your weakness, rounded up. Earth Armor protects best against Wind and worst against Fire. Other element matchups are non-interacting, including same-element and Arcane (non-elemental) matchups. Chaos and Light are mutually strong against each other.",
  ".field",
  "tavern",
);
move(
  "tavern-move",
  8,
  2,
  "Move west into the Lantern Rest. Time to spend some hard-earned gold!",
);
ui(
  "scribe",
  "Visit the Scribe",
  "Click the Scribe in the Tavern. Upgrades strengthen a specific card, and their costs are shown before purchase.",
  "tavern:grimoire",
  '[data-tavern="grimoire"]',
);
action(
  "upgrade",
  "Upgrade Blast",
  "Choose the highlighted Blast upgrade. Its printed damage rises from 4 to 7.",
  { type: "upgrade", card: "blast" },
);
ui(
  "market",
  "Visit the Market",
  "Click the Market. You can View an item before you Buy it.",
  "tavern:market",
  '[data-tavern="market"]',
);
ui(
  "market-equipment",
  "Choose Equipment",
  "Open the Equipment tab to see the helmet for sale.",
  "market:Equipment",
  '[data-market-category="Equipment"]',
);
action(
  "helmet-buy",
  "Buy the helmet",
  "Buy the Sturdy Metal Helmet for 75 Gold. Shield activations show (+2); on activation the helmet sends a power sphere to add that Guard. It does not supply attunement.",
  { type: "buy", itemId: "crown" },
);
ui(
  "market-consumables",
  "Supplies at the Market",
  "Open the Consumables tab. You can Buy, View or later Sell these finite supplies. Each bottle needs its own Satchel slot.",
  "market:Consumables",
  '[data-market-category="Consumables"]',
);
action(
  "flask-buy",
  "A flask for the road",
  "Buy Star Flask for 30 Gold. In battle, choose its throw control then click a highlighted enemy, or drag the bottle onto one. Target selection can be cancelled without consuming it.",
  { type: "buy", itemId: "starFlask" },
);
action(
  "channel-buy",
  "A reserve of Channel",
  "Buy Channel Draught for 40 Gold. It gives one immediate Channel during Activation, while each card still obeys its own activation limit.",
  { type: "buy", itemId: "channelDraught" },
);
ui(
  "jeweler",
  "Visit the Jeweler",
  "Click the Jeweler for your equipment and Gem sockets.",
  "tavern:equipment",
  '[data-tavern="equipment"]',
);
action(
  "helmet-equip",
  "Wear the helmet",
  "Drag the helmet into your head slot, or inspect it and choose Equip.",
  { type: "equip", itemId: "crown", slot: "head" },
  '.satchel, [data-equip-slot="head"]',
);
action(
  "socket",
  "Imbue the Bracelet",
  "Drag the Sapphire onto any part of the Bracelet Setting, or inspect the Gem and choose the Bracelet. Water defense follows the same cycle as Water attacks: this Bracelet absorbs 3 against Fire, 1 against Wind, and 2 otherwise.",
  { type: "socket", itemId: "bronze", gemId: "sapphire" },
  '.satchel, [data-equip-slot="wrist2"]',
);
ui(
  "traveler",
  "Hear the rumors",
  "Click the Traveler to hear gossip about the Archon.",
  "tavern:gossip",
  '[data-tavern="gossip"]',
);
action(
  "gossip",
  "Learn what lies ahead",
  "Pay 15 Gold for gossip. It reveals Cinder Hart, the Archon of this lessonâ€™s imagined onward journey. You will not fight that boss in the tutorial.",
  { type: "gossip" },
);
note(
  "gossip-learned",
  "Prepare for the Archon",
  "You learned that the Archon boss is the Cinder Hart, a strong Fire enemy! If this were a real run, you would now know to stock up on Water attacks, Water-attuned Shields, Sapphire Bracelets and Water Armor to counter Fire. You will not fight this boss in the tutorial.",
  ".tavern-service",
);
ui(
  "innkeeper",
  "Rest at the inn",
  "Click the Innkeeper. The earlier damage gives you a reason to recover.",
  "tavern:rest",
  '[data-tavern="rest"]',
);
action("rest", "Recover HP", "Spend 20 Gold to recover up to 20 HP.", {
  type: "heal",
});
ui(
  "healer",
  "Meet the Healer",
  "Click the Healer. This visitor treats Hexes and Cursed equipment, separately from ordinary paid card removal.",
  "tavern:healer",
  '[data-tavern="healer"]',
);
note(
  "healer-help",
  "A different price for every affliction",
  "You have no Hexes or Curses to remove. In a normal journey, read the treatment: it may require Gold, HP, an Ally or an item. Ordinary card removal is limited to one per Tavern; Hex treatment is separate.",
  ".tavern-service",
);
action(
  "leave-tavern",
  "One final challenge",
  "Leave the Tavern. Your final encounter is a gentle Eidolon, the Patient Warden.",
  { type: "leave" },
);
note(
  "final-intro",
  "The Patient Warden",
  "Inspect its Tell, place your cards, watch your resources, and choose how to defend. It alternates pauses with modest attacks. One final guided consumable lesson comes first; then your decisions are your own.",
  ".field",
  "final",
);
move(
  "final-move",
  7,
  2,
  "Move west to challenge the Patient Warden. Defeating it completes The First Clearing.",
);
place(
  "warden-shield",
  "shield",
  20,
  "Place a Shield before the final consumable lesson. You will choose how to use your Channel next.",
);
action(
  "consume-channel",
  "One more activation",
  "Use Channel Draught during Activation after placing your opening cards. For this lesson, first advance with the phase arrow; the extra Channel will be available for this turn only.",
  { type: "activatePhase" },
  "",
);
action(
  "consume-channel-use",
  "Channel when you need it",
  "Use Channel Draught now: Channel rises from 2 to 3. This is your one consumable for the turn. Keep Star Flask for a later turn; throw it at an enemy when the six damage matters.",
  { type: "consume", itemId: "channelDraught" },
  ".consumable-tray",
);
steps.push({
  id: "independent",
  kind: "free",
  title: "Your turn to decide",
  text: "Use what you have learned. Read the Tell, spend Focus and Channel, and defend from right to left. Defeat the Patient Warden to finish the tutorial.",
  focus: "",
});
export const TUTORIAL_STEPS = steps;
export function tutorialGuide(g) {
  const t = g.s.tutorial;
  return t && !t.completed
    ? {
        ...steps[t.step],
        index: t.step,
        total: steps.length,
        name: TUTORIAL.name,
      }
    : null;
}
const item = (g, id) => g.s.inventory.find((x) => x.id === id);
function matches(g, a, m) {
  return Object.entries(m).every(([k, v]) => {
    if (k === "card")
      return (
        (
          g.s.battle?.hand.find((c) => c.uid === a.uid) ||
          g.s.deck.find((c) => c.uid === a.uid)
        )?.id === v
      );
    if (k === "itemId")
      return a.type === "buy"
        ? g.s.shop.stock[a.index] === v
        : item(g, v)?.uid === (a.item ?? a.uid);
    if (k === "gemId") return item(g, v)?.uid === a.gem;
    return a[k] === v;
  });
}
export function tutorialActions(g, raw) {
  const t = g.s.tutorial,
    step = steps[t?.step];
  if (!t) return raw;
  if (g.s.mode === "result")
    return g.s.outcome === "loss" && t.finalStart
      ? [
          {
            type: "tutorialRetry",
            label: "Retry the Warden",
            key: '["tutorialRetry"]',
            effects: { progress: 1 },
            costs: {},
          },
        ]
      : [];
  if (step.kind === "free") return raw;
  if (step.kind === "action")
    return raw
      .filter((a) => matches(g, a, step.match))
      .slice(
        0,
        step.match.type === "place" || step.match.type === "upgrade"
          ? 1
          : undefined,
      );
  const type = step.kind === "ui" ? "tutorialUI" : "tutorialNext";
  return [
    {
      type,
      step: step.id,
      control: step.control,
      label: step.kind === "ui" ? step.title : "Continue lesson",
      key: JSON.stringify([type, { step: step.id }]),
      effects: { progress: 1 },
      costs: {},
    },
  ];
}
function spawn(g, type, x, y, extra = {}) {
  g.s.field.entities.push({
    uid: g.uid(),
    type,
    x,
    y,
    born: g.s.field.round,
    restless: 0,
    ...extra,
  });
}
function enter(g) {
  const t = g.s.tutorial,
    step = steps[t.step],
    f = g.s.field;
  if (!step) throw Error("Unknown tutorial step");
  t.lesson = step.id;
  if (
    t.legacySupplies &&
    step.match?.type === "consume" &&
    !g.s.inventory.some((x) => x.id === step.match.itemId)
  )
    g.addItem(step.match.itemId);
  if (step.id === "independent")
    t.finalStart = {
      battle: structuredClone(g.s.battle),
      hp: g.s.hp,
      inventory: structuredClone(g.s.inventory),
    };
  switch (step.setup) {
    case "supply-route":
      for (const [id, x, y] of [
        ["healingSap", 9, 3],
        ["insightDew", 8, 3],
        ["focusDraught", 8, 2],
      ])
        if (!f.entities.some((e) => e.fieldSupply && e.item === id))
          spawn(g, "Item", x, y, { item: id, fieldSupply: true });
      break;
    case "gold":
      spawn(g, "Gold", 6, 5, { value: 200 });
      break;
    case "ring":
      spawn(g, "Item", 7, 5, { item: "ring" });
      break;
    case "mote":
      spawn(g, "Mote", 8, 5, { enemy: "tutorialMosswing", count: 1 });
      break;
    case "pursuit":
      spawn(g, "Item", 10, 2, { item: "sapphire" });
      spawn(g, "Mote", 8, 4, { enemy: "tutorialRootling", count: 1 });
      f.moves = 2;
      break;
    case "gem-road":
      f.moves = 2;
      break;
    case "ember":
      spawn(g, "Mote", 9, 2, { enemy: "tutorialEmber", count: 1 });
      break;
    case "tavern":
      spawn(g, "Tavern", 8, 2);
      break;
    case "final":
      spawn(g, "Eidolon", 7, 2, { enemy: "tutorialWarden", count: 1 });
      break;
  }
}
export function startTutorial(g) {
  const s = g.s;
  s.tutorial = {
    ...TUTORIAL,
    step: 0,
    lesson: "welcome",
    fight: 0,
    completed: false,
  };
  s.mode = "field";
  s.archon = "hart";
  s.revealedArchon = null;
  s.gold = 0;
  s.inventory = s.inventory.filter((x) => x.id === "bronze");
  for (const k of Object.keys(s.equipment))
    if (k !== "wrist2") s.equipment[k] = null;
  s.deck = [
    ...Array(4).fill("shield"),
    ...Array(4).fill("blast"),
    "sapling",
    "clear",
  ].map((id) => g.newCard(id));
  Object.assign(s.field, {
    round: 1,
    spawned: 0,
    queue: [],
    entities: [],
    x: 5,
    y: 5,
    moves: 2,
    stage: "player",
  });
  s.stats.itemsGained = ["Bronze Bracelet"];
  for (const [id, x, y] of [
    ["healingSap", 9, 3],
    ["insightDew", 8, 3],
    ["focusDraught", 8, 2],
  ])
    spawn(g, "Item", x, y, { item: id, fieldSupply: true });
  enter(g);
  return g;
}
export function tutorialAfter(g, a) {
  const t = g.s.tutorial;
  if (!t) return;
  if (a.type === "tutorialRetry") {
    const saved = t.finalStart;
    g.s.battle = structuredClone(saved.battle);
    g.s.hp = saved.hp;
    if (saved.inventory) g.s.inventory = structuredClone(saved.inventory);
    g.s.status = { burn: 0, poison: 0, corrode: 0 };
    g.s.mode = "battle";
    delete g.s.outcome;
    delete g.s.death;
    delete g.s.cause;
    g.s.stats.encounters.push({
      round: g.s.field.round,
      enemies: [enemies.tutorialWarden.name],
      outcome: "in progress",
      hpStart: g.s.hp,
    });
    t.completed = false;
    t.step = steps.length - 1;
    t.lesson = "independent";
    t.retries = (t.retries || 0) + 1;
    return;
  }
  if (steps[t.step].kind === "free" || t.completed) return;
  t.step++;
  if (a.type === "consume" && t.legacySkipSupplyRoute) {
    t.step = steps.findIndex((x) => x.id === "gem-road");
    delete t.legacySkipSupplyRoute;
  }
  enter(g);
}
export function tutorialBattle(g, entities) {
  if (!g.s.tutorial) return;
  g.s.tutorial.fight =
    {
      tutorialMosswing: 1,
      tutorialRootling: 2,
      tutorialEmber: 3,
      tutorialWarden: 4,
    }[entities[0].enemy] || 0;
}
export function tutorialBattleReady(g) {
  const t = g.s.tutorial;
  if (t?.fight === 4)
    t.finalStart = { battle: structuredClone(g.s.battle), hp: g.s.hp };
}
export function tutorialDrawIndex(g, n) {
  const b = g.s.battle,
    t = g.s.tutorial;
  const plans = {
    1: {
      1: ["shield", "shield", "shield", "shield"],
      2: ["blast", "blast", "blast", "blast"],
      3: ["sapling", "clear", "blast", "blast"],
    },
    2: {
      1: ["ward", "blast", "blast", "clear"],
      2: ["sapling", "blast", "blast", "shield"],
      3: ["shield", "shield", "shield", "blast"],
      4: ["blast"],
    },
    3: { 1: ["water", "shield", "shield", "shield"], 2: ["blast"] },
    4: { 1: ["shield"] },
  };
  const id = plans[t.fight]?.[b.turn]?.[n];
  const i = b.deck.findIndex((c) => c.id === id);
  return i < 0 ? 0 : i;
}
export function tutorialReward(g) {
  const t = g.s.tutorial;
  if (!t) return false;
  if (t.fight === 4) {
    t.completed = true;
    g.finish(true, "The First Clearing complete");
    return true;
  }
  g.s.reward = {
    cards: t.fight === 1 ? ["ward"] : t.fight === 2 ? ["water"] : null,
    gem: false,
    setting: false,
    boss: false,
  };
  return false;
}
export function tutorialTavern(g) {
  if (!g.s.tutorial) return;
  g.s.shop = {
    stock: ["crown", "starFlask", "channelDraught"],
    healer: true,
    healerPrice: 35,
    hexPrice: { kind: "gold", gold: 35, hp: 0 },
    healUsed: false,
    removeUsed: false,
  };
}

export function normalizeTutorial(s) {
  const t = s.tutorial;
  if (!t) return;
  if (t.version < 9) {
    t.legacySupplies = true;
    if (t.lesson === "consume-healing") t.legacySkipSupplyRoute = true;
    if (
      s.mode === "tavern" &&
      s.shop &&
      !s.shop.stock.includes("channelDraught")
    )
      s.shop.stock.push("channelDraught");
  }
  const old = t.version < 3;
  if (old && t.lesson === "gem-step") t.lesson = "gem-road";
  const index = steps.findIndex((step) => step.id === t.lesson);
  if (index < 0) throw Error("Unknown saved tutorial lesson: " + t.lesson);
  t.step = index;
  if (old) {
    if (["pursuit", "pursuit-move"].includes(t.lesson)) {
      s.field.moves = 2;
      const rootling = s.field.entities.find(
        (e) => e.enemy === "tutorialRootling",
      );
      if (rootling) {
        rootling.x = 8;
        rootling.y = 4;
      }
    }
    const caught = steps.findIndex((step) => step.id === "caught");
    const gemRoad = steps.findIndex((step) => step.id === "gem-road");
    if (index >= caught && index <= gemRoad) {
      s.field.x = 10;
      s.field.y = 3;
      for (const e of s.field.entities.filter(
        (e) => e.enemy === "tutorialRootling",
      )) {
        e.x = 10;
        e.y = 3;
      }
    }
  }
  if (
    t.version < 7 &&
    s.mode === "battle" &&
    t.fight === 2 &&
    !s.battle.enemyFirst
  ) {
    t.restartRootling = true;
    t.lesson = "caught";
    t.step = steps.findIndex((step) => step.id === "caught");
  }
  t.version = TUTORIAL.version;
}
