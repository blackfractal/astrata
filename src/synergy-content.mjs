export const SYNERGY_ELEMENTS = ["Fire", "Water", "Earth", "Wind", "Light", "Chaos"];

export function registerSynergy(card) {
  for (const element of SYNERGY_ELEMENTS) {
    card(element.toLowerCase() + "Synergy", element + " Synergy", element, "Spell", 1, 2,
      { damage: 7, deckSynergy: true },
      `Deal 7 damage, +1 per other card in your Grimoire matching this attack's element. Count current elements when activated, including Attunement and Transmute on placed cards. All piles count.`,
      { channel: 1, recall: 1, stratum: 1, expansion: "synergy" });
    card(element.toLowerCase() + "Enhance", element + " Enhance", element, "Spell", 1, 2,
      { enhance: 1 },
      `For this battle, attacks matching this card's current element gain +1 direct damage per hit, including Allies and cards placed later. Stacks with each activation. Attunement and Transmute change which attacks benefit; bonuses do not stay on cards that change element.`,
      { channel: 1, recall: 1, stratum: 1, expansion: "synergy" });
  }
  card("prismaticSynergy", "Prismatic Synergy", "Arcane", "Spell", 1, 2,
    { damage: 7, prismaticSynergy: 3 },
    "Deal 7 damage, +3 per card in your least-represented non-Arcane element. Count Fire, Water, Earth, Wind, Light and Chaos across your whole Grimoire. A missing element gives no bonus. Placed cards count their current elements, including Attunement and Transmute; other piles use printed elements.",
    { channel: 1, recall: 1, stratum: 1, rarity: "rare", expansion: "synergy" });
}
