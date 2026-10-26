// Acquisition tier, independent of shop prices and combat stats.
export const PREMIUM_GEAR = new Set([
  "gold", "focusRing", "channelRing", "mirrorArmor",
  "prismaticBracelet", "reservoirBracelet", "reclaimerBracelet",
  "lastStandBracelet", "echoRing", "resonanceHelm", "remembranceArmor",
]);

export function addPremiumEvents(events) {
  events.push(
    { id: "gildedHeartwood", name: "The Gilded Heartwood", stratum: 1,
      text: "A golden bracelet circles a living branch. The tree offers it in exchange for a piece of your vitality: permanently lose 15 maximum HP. Your current HP is lowered only if it exceeds your new maximum.",
      choices: [{ label: "Give 15 maximum HP · receive Gold Bracelet", maxHpCost: 15, item: "gold" }, { label: "Leave the branch untouched" }] },
    { id: "keepersWager", name: "The Keeper's Wager", stratum: 1,
      text: "A keeper presents three sealed boxes. One contains a Gold Bracelet; two are empty. Pay 100 Gold for a one-in-three chance. You lose the entire stake if your box is empty.",
      choices: [{ label: "Wager 100 Gold · 1 in 3 chance of Gold Bracelet", cost: 100, wager: { item: "gold", odds: 3 } }, { label: "Keep your gold" }] },
    { id: "keepersWagerWon", name: "The Opened Box", stratum: 1, resultOnly: true,
      text: "Gold glimmers inside. Your 100-Gold wager won the Gold Bracelet.",
      choices: [{ label: "Continue" }] },
    { id: "keepersWagerLost", name: "The Empty Box", stratum: 1, resultOnly: true,
      text: "The box is empty. The keeper takes your 100 Gold; you receive nothing.",
      choices: [{ label: "Continue" }] },
    { id: "counterweightSmith", name: "The Counterweight Smith", stratum: 2,
      text: "A smith measures the weight of your working defenses. For 100 Gold and one equipped bracelet with its fitted gem, she offers a replacement. The surrendered gem is lost with its bracelet; the new bracelet has an empty Setting.",
      choices: [
        ...[["gold", "Gold Bracelet"], ["prismaticBracelet", "Prismatic Bracelet"], ["reclaimerBracelet", "Reclaimer's Bracelet"]].map(([item, name]) => ({
          label: "100 Gold + equipped bracelet and gem → " + name, cost: 100, item,
          trade: { kind: "item", slot: "wrist", label: "equipped bracelet with a fitted gem", equippedOnly: true, requireGem: true },
        })), { label: "Keep your defenses" }] },
    { id: "sealedReflection", name: "The Sealed Reflection", stratum: 2,
      text: "Mirror Armor hangs inside a humming furnace. Its keeper, a Censer Engine, wakes at your approach. Defeat it to claim the armor; accepting this challenge gives you nothing until you win.",
      choices: [{ label: "Fight the Censer Engine · win Mirror Armor", fight: "censer", victoryItem: "mirrorArmor" }, { label: "Leave the furnace sealed" }] },
  );
  const art = {
    gildedHeartwood: "event-graft", keepersWager: "event-trader",
    keepersWagerWon: "event-trader", keepersWagerLost: "event-trader",
    counterweightSmith: "event-loomPotionDealer", sealedReflection: "location-loom-field",
  };
  for (const event of events) if (art[event.id]) event.art = art[event.id];
}
