export const SYNERGY_ELEMENTS = ["Fire", "Water", "Earth", "Wind", "Light", "Chaos"];

export function registerSynergy(card) {
  for (const element of SYNERGY_ELEMENTS) {
    card(element.toLowerCase() + "Synergy", element + " Synergy", element, "Spell", 1, 2,
      { damage: 7, deckSynergy: true },
      `Deal 7 damage, +1 per other printed ${element} card in your Grimoire, including other ${element} Synergy copies. All piles count; Attunement and Transmute do not change the count.`,
      { channel: 1, recall: 1, stratum: 1, expansion: "synergy" });
    card(element.toLowerCase() + "Enhance", element + " Enhance", element, "Spell", 1, 2,
      { enhance: 1 },
      `For this battle, all printed ${element} cards in your Grimoire that deal direct damage gain +1 damage per hit, including Allies and cards placed later. Stacks with each activation. Attunement and Transmute do not change which cards benefit.`,
      { channel: 1, recall: 1, stratum: 1, expansion: "synergy" });
  }
  card("prismaticSynergy", "Prismatic Synergy", "Arcane", "Spell", 1, 2,
    { damage: 7, prismaticSynergy: 3 },
    "Deal 7 damage, +3 per card in your least-represented printed non-Arcane element. Count Fire, Water, Earth, Wind, Light and Chaos across your whole Grimoire. A missing element gives no bonus. Attunement and Transmute do not change the counts.",
    { channel: 1, recall: 1, stratum: 1, rarity: "rare", expansion: "synergy" });
}
