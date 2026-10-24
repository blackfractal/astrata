import { items } from "./content.mjs";
export const SATCHEL_CAPACITY = 12;
export function potionEffects(item) {
  const f = items[item?.id]?.consumable;
  return f && Object.fromEntries(Object.entries(f).map(([k, v]) => [k, typeof v === "number" ? v * (item.crystal ? 2 : 1) : v]));
}
export function itemName(item) {
  return items[item.id].name + (item.crystal ? " ×2" : "");
}
export function potionSummary(item) {
  const f = potionEffects(item);
  if (items[item.id].expansion === 'supplies') return f.tincture ? (f.tincture === 'choose' ? 'Transmute' : f.tincture) : ({shiftingSap:'Move',wildInspiration:'Draw & play',perfectInspiration:'Choose & play',confluence:'Exchange',recallMist:'Recall',memoryDraught:'Topdeck',rustbane:'Cure rust',cindersalve:'Cure burn',antidote:'Cure poison',sealedBreath:'Protect',furySap:'2× damage',bastionOil:'2× defense'}[item.id]);
  return f && [f.heal ? `+${f.heal} HP` : null, f.focus ? `+${f.focus} Focus` : null, f.channel ? `+${f.channel} Channel` : null, f.draw ? `Draw ${f.draw}` : null, f.damage ? `${f.damage} ${f.element}` : null].filter(Boolean).join(" · ");
}
export function itemText(item) {
  if (!item.crystal) return items[item.id].text;
  return `Liquid Crystal enhanced: ${potionSummary(item)}. Twice the normal effect; cannot add another Liquid Crystal. ` +
    ({healingSap:"Use during your turn, while choosing a defense against an incoming attack, or during map movement.",focusDraught:"Use during Placement. Unspent Focus expires this turn.",channelDraught:"Use during Activation. Unspent Channel expires this turn.",insightDew:"Use during Placement; draw immediately without discarding your hand.",starFlask:"Throw during Activation. Does not trigger equipment attacks."}[item.id] || "") +
    " Consumed on use. No Channel cost; no per-turn limit.";
}
export function canCombinePotion(s) {
  return ["field", "tavern"].includes(s.mode) || (s.mode === "battle" && !s.battle.reaction && ["place", "activate"].includes(s.battle.phase));
}
export function satchelContents(s) {
  return s.inventory.filter(
    (x) =>
      !Object.values(s.equipment).includes(x.uid) &&
      !s.inventory.some((g) => g.gem === x.uid),
  );
}
export function consumableReason(s, item) {
  const f = items[item.id]?.consumable,
    b = s.battle;
  if (!f) return "Not a consumable.";
  if (s.mode === "field") {
    if (!f.heal) return "Use this during battle.";
    return s.hp >= s.maxHp ? "Already at full HP." : "";
  }
  if (s.mode !== "battle")
    return "Use during your turn in battle or map movement.";
  if (s.hp <= 0) return "The battle has ended.";
  if (b.reaction && !(f.heal || f.cleanse || f.immunity))
    return "Use during your player turn; only healing, cures and protection can interrupt an incoming attack.";
  if (!b.reaction && !["place", "activate"].includes(b.phase))
    return "Wait for your player turn.";
  if (f.cleanse && !(s.status?.[f.cleanse] > 0))
    return `No ${{ poison: "Poison", burn: "Burn", corrode: "Corrosion" }[f.cleanse] || f.cleanse} to remove.`;
  if (f.heal && s.hp >= s.maxHp) return "Already at full HP.";
  if ((f.focus || f.draw) && b.phase !== "place")
    return "Use during Placement.";
  if ((f.channel || f.damage) && b.phase !== "activate")
    return "Use during Activation.";
  if (f.draw && !b.deck.length && !b.discard.length)
    return "No cards remain to draw.";
  if (f.damage && !b.enemies.some((e) => e.hp > 0))
    return "No living enemy target.";
  return "";
}

export function consumableUnavailableReason(s, item, choiceCount) {
  if (choiceCount > 0) return "";
  return consumableReason(s, item) ||
    (s.tutorial && !s.tutorial.completed
      ? "Unavailable during this lesson."
      : "No available target or effect right now.");
}
