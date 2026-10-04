import { cards, enemies, items, events } from "./content.mjs";

export const achievements = [
  { id: "defeat-hart", name: "Defeat the Cinder Hart", enemy: "hart" },
  {
    id: "defeat-colossus",
    name: "Defeat the Void-Colossus",
    enemy: "colossus",
  },
  { id: "defeat-choir", name: "Defeat the Glass Choir", enemy: "choir" },
  { id: "defeat-apex", name: "Defeat the Apex Predator" },
  { id: "calm-apex", name: "Calm the Apex Predator" },
  { id: "calm-astrata", name: "Calm Astrata" },
];
export function emptyCollection() {
  return { schema: 1, cards: {}, enemies: {}, equipment: {}, achievements: {} };
}
export function discover(collection, state, at = new Date().toISOString()) {
  if (!state) return collection;
  for (const key of ["cards", "enemies", "equipment", "achievements"])
    collection[key] ||= {};
  const seen = (kind, id) => {
    const catalog = { cards, enemies, equipment: items }[kind];
    if (catalog[id]) collection[kind][id] ||= { firstSeenAt: at };
  };
  const offer = (id) => {
    if (typeof id !== "string") return;
    if (id.startsWith("card:")) seen("cards", id.slice(5));
    else seen("equipment", id);
  };
  for (const c of state.deck || []) seen("cards", c.id);
  for (const i of state.inventory || []) seen("equipment", i.id);
  for (const e of state.field?.entities || []) {
    seen("enemies", e.enemy);
    if (items[e.item]?.consumable) seen("equipment", e.item);
  }
  for (const e of state.battle?.enemies || []) seen("enemies", e.id);
  if (state.mode === "reward")
    for (const id of state.reward?.cards || []) seen("cards", id);
  if (state.mode === "item") for (const id of state.itemOffer || []) offer(id);
  if (state.mode === "tavern")
    for (const id of state.shop?.stock || []) offer(id);
  if (state.mode === "event") {
    const event =
      typeof state.event === "string"
        ? events.find((e) => e.id === state.event)
        : state.event;
    for (const choice of event?.choices || []) {
      // These authored choices show the named reward in the visible choice text.
      for (const id of [choice.card, choice.hex]) if (id) seen("cards", id);
      if (choice.item) seen("equipment", choice.item);
    }
  }
  // Legacy summaries can establish acquired content and encountered enemies, not unseen offers.
  for (const [field, kind, catalog] of [
    ["cardsGained", "cards", cards],
    ["itemsGained", "equipment", items],
  ]) {
    for (const name of state.stats?.[field] || []) {
      const id = Object.keys(catalog).find((id) => catalog[id].name === name);
      if (id) seen(kind, id);
    }
  }
  for (const encounter of state.stats?.encounters || []) {
    for (const name of encounter.enemies || []) {
      const aliases = {
        "The Cinder Heart": "hart",
        "Cinder Heart": "hart",
        "Cinder Hart": "hart",
        "Void Colossus": "colossus",
        "Glass Choir": "choir",
      };
      const id =
        aliases[name] ||
        Object.keys(enemies).find(
          (id) => enemies[id].name === name.replace(/ \d+$/, ""),
        );
      if (!id) continue;
      seen("enemies", id);
      const achievement = achievements.find((a) => a.enemy === id);
      if (achievement && encounter.outcome === "victory" && !state.tutorial)
        collection.achievements[achievement.id] ||= { earnedAt: at };
    }
  }
  return collection;
}
