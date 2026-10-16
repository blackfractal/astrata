import { MIND_COLUMNS } from "./content.mjs";
// Main enemies have no grid range limit; Ideons use the card's explicit area rule.
export function areaHits(effects, source, target) {
  if (!target.ideon) return true;
  if (effects.excludeIdeons) return false;
  if (effects.ideonBelow)
    return source % MIND_COLUMNS === target.slot % MIND_COLUMNS && target.slot > source;
  if (effects.ideonRadius == null) return true;
  return Math.abs(source % MIND_COLUMNS - target.slot % MIND_COLUMNS) +
    Math.abs(Math.floor(source / MIND_COLUMNS) - Math.floor(target.slot / MIND_COLUMNS)) <= effects.ideonRadius;
}
