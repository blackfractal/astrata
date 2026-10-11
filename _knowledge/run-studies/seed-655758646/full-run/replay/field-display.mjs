import { enemies, items } from "./content.mjs";

// Display priority only: never reorder the Field's encounter or movement state.
export function fieldEntitiesAt(field, x, y) {
  const priority = (e) =>
    enemies[e.enemy]?.tier === "Archon"
      ? 3
      : e.enemy
        ? 2
        : items[e.item]?.consumable
          ? 1
          : 0;
  return field.entities
    .filter((e) => e.x === x && e.y === y)
    .sort((a, b) => priority(b) - priority(a));
}
