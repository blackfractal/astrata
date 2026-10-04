import { items } from "./content.mjs";
export const SATCHEL_CAPACITY = 10;
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
    if (s.field.consumableRound === s.field.round)
      return "Consumable already used this movement round.";
    return s.hp >= s.maxHp ? "Already at full HP." : "";
  }
  if (s.mode !== "battle")
    return "Use during your turn in battle or map movement.";
  if (b.reaction || !["place", "activate"].includes(b.phase))
    return "Wait for your player turn.";
  if (b.consumableTurn === b.turn) return "Consumable already used this turn.";
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
