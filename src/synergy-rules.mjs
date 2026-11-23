import { cards } from "./content.mjs";
import { SYNERGY_ELEMENTS } from "./synergy-content.mjs";

export function printedDeck(b) {
  // Real battles retain their full Grimoire independently of cycling and destruction.
  // The fallback supports old observation files and small board-analysis fixtures.
  if (b?.grimoire) return b.grimoire;
  const seen = new Set();
  return [...(b?.deck || []), ...(b?.hand || []), ...(b?.discard || []),
    ...(b?.destroyed || []), ...(b?.grid || []).flat()].filter(c => {
      if (c.uid == null) return true;
      if (seen.has(c.uid)) return false;
      seen.add(c.uid); return true;
    });
}
export function printedElementCounts(b) {
  const counts = Object.fromEntries(SYNERGY_ELEMENTS.map(el => [el, 0]));
  for (const c of printedDeck(b)) {
    const el = cards[c.id]?.element;
    if (el in counts) counts[el]++;
  }
  return counts;
}
// Only committed activation elements live in game state; UI previews never do.
export function currentCardElement(b, c) {
  const d = cards[c.id];
  if (c.transmuted || (c.element && c.element !== d.element)) return c.element;
  return d.attune && c.lastActivatedTurn === b?.turn
    ? c.lastActivationElement || c.element || d.element
    : c.element || d.element;
}
export function currentElementCounts(b, previewCard = null, previewElement = null) {
  const placed = new Map((b?.grid || []).flat().map(c => [c.uid, c]));
  const counts = Object.fromEntries(SYNERGY_ELEMENTS.map(el => [el, 0]));
  for (const c of printedDeck(b)) {
    const live = placed.get(c.uid);
    const el = previewCard && c.uid === previewCard.uid && previewElement
      ? previewElement : live ? currentCardElement(b, live) : cards[c.id]?.element;
    if (el in counts) counts[el]++;
  }
  return counts;
}
export function synergyBonus(b, c, element = currentCardElement(b, c)) {
  const d = cards[c.id];
  if (!d.effects.deckSynergy && !d.effects.prismaticSynergy) return 0;
  const counts = currentElementCounts(b, c, element);
  if (d.effects.prismaticSynergy)
    return Math.min(...Object.values(counts)) * d.effects.prismaticSynergy;
  if (d.effects.deckSynergy) {
    const self = printedDeck(b).some(x => x.uid === c.uid && x.id === c.id);
    return Math.max(0, (counts[element] || 0) - Number(self));
  }
  return 0;
}
export function enhancementBonus(b, c, element = currentCardElement(b, c)) {
  const d = cards[c.id], f = d.effects;
  return f.damage || f.hpDamage || f.randomDamage || f.placementStrike
    ? b?.elementEnhancements?.[element] || 0 : 0;
}
export function normalizeSynergyState(s) {
  if (s.battle) {
    s.battle.grimoire ||= s.deck.map(({ id, uid }) => ({ id, uid }));
    s.battle.elementEnhancements ||= {};
  }
  if (s.checkpoint) normalizeSynergyState(s.checkpoint);
}
