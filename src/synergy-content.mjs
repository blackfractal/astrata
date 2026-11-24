export const SYNERGY_ELEMENTS = ["Fire", "Water", "Earth", "Wind", "Light", "Chaos"];

export const LEGACY_ELEMENT_CARDS = Object.fromEntries(SYNERGY_ELEMENTS.flatMap(element =>
  ["Synergy", "Enhance"].map(kind => [element.toLowerCase() + kind, "element" + kind])));
export const canonicalElementCard = id => LEGACY_ELEMENT_CARDS[id] || id;

export function registerSynergy(card, registry) {
  card("elementSynergy", "Element Synergy", "Arcane", "Spell", 1, 2,
    { damage: 7, deckSynergy: true },
    "Attune to a non-Arcane element. Deal 7 damage, +1 per other card in your Grimoire matching that element. Placed cards count current elements, including Attunement and Transmute; other piles use printed elements. No effect without a non-Arcane element.",
    { channel: 1, recall: 1, stratum: 1, expansion: "synergy", attune: true, requiresElement: true });
  card("elementEnhance", "Element Enhance", "Arcane", "Spell", 1, 2,
    { enhance: 1 },
    "Attune to a non-Arcane element. For this battle, attacks of that element gain +1 direct damage per hit, including Allies and cards placed later. Each activation stacks. No effect without a non-Arcane element.",
    { channel: 1, recall: 1, stratum: 1, expansion: "synergy", attune: true, requiresElement: true });
  // Old archives remain readable; aliases never enter pools or the Archives catalog.
  for (const [old, id] of Object.entries(LEGACY_ELEMENT_CARDS))
    Object.defineProperty(registry, old, { value: registry[id], enumerable: false });
  card("prismaticSynergy", "Prismatic Synergy", "Arcane", "Spell", 1, 2,
    { damage: 7, prismaticSynergy: 3 },
    "Deal 7 damage, +3 per card in your least-represented non-Arcane element. Count Fire, Water, Earth, Wind, Light and Chaos across your whole Grimoire. A missing element gives no bonus. Placed cards count their current elements, including Attunement and Transmute; other piles use printed elements.",
    { channel: 1, recall: 1, stratum: 1, rarity: "rare", expansion: "synergy" });
}
