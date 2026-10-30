import { cards, enemies, items, events } from "./content.mjs";

export const achievements = [
  { id: "defeat-mindHive", name: "Defeat the Mind Hive", enemy: "mindHive" },
  { id: "defeat-cnidarian", name: "Defeat the Cnidarian", enemy: "cnidarian" },
  {
    id: "defeat-refractionCannon",
    name: "Defeat the Refraction Cannon",
    enemy: "refractionCannon",
  },
  { id: "defeat-blackBile", name: "Defeat The Black Bile", enemy: "blackBile" },
  { id: "defeat-bombadier", name: "Defeat King Bombadier", enemy: "bombadier" },
  { id: "defeat-trickster", name: "Defeat The Trickster", enemy: "trickster" },
  {
    id: "defeat-seamstress",
    name: "Defeat the Seamstress of Absence",
    enemy: "seamstress",
    retired: true,
  },
  {
    id: "defeat-censer",
    name: "Defeat the Censer Engine",
    enemy: "censer",
    retired: true,
  },
  {
    id: "defeat-borrowedChoir",
    name: "Defeat the Choir of Borrowed Hands",
    enemy: "borrowedChoir",
    retired: true,
  },
  { id: "defeat-hart", name: "Defeat the Cinder Hart", enemy: "hart" },
  {
    id: "defeat-colossus",
    name: "Defeat the Void-Colossus",
    enemy: "colossus",
  },
  { id: "defeat-choir", name: "Defeat the Glass Choir", enemy: "choir" },
  { id: "defeat-apex", name: "Defeat the Apex Predator", enemy: "apex" },
  {
    id: "blast-miser",
    name: "Blast Miser",
    description:
      "Complete a run without placing a starter Blast.",
  },
  {
    id: "shield-miser",
    name: "Shield Miser",
    description:
      "Complete a run without placing a starter Shield.",
  },
  {
    id: "strict-diet",
    name: "On a Strict Diet",
    description:
      "Complete a run without using any consumable.",
  },
  {
    id: "masochist",
    name: "Masochist",
    description:
      "Complete a run without entering a Tavern spawned on the map.",
  },
  {
    id: "sedentary-lifestyle",
    name: "Sedentary Lifestyle",
    description:
      "Complete a run using fewer than 20 total map steps.",
  },
  {
    id: "elemental-purity",
    name: "Elemental Purity",
    description:
      "Complete a run with only Arcane cards and at most one other printed element in your Grimoire.",
  },
  {
    id: "pop-goes-the-weasel",
    name: "Pop Goes the Weasel",
    description:
      "Defeat an Archon from full HP with one damage hit, then survive the encounter.",
  },
  { id: "i-stand-alone", name: "I Stand Alone", secret: true },
  {
    id: "without-menders",
    name: "Without the Menders",
    description:
      "Complete a run while keeping your original Machine Elves from Stratum 2 in your deck. Never place or activate any Machine Elves. Drawing, discarding and upgrading them are allowed.",
  },
  { id: "calm-apex", name: "Calm the Apex Predator", secret: true },
  { id: "calm-astrata", name: "Calm Astrata", secret: true },
  {
    id: "traveler-kindness",
    name: "A Little Kindness",
    secret: true,
    hiddenStratumPrerequisite: true,
  },
].map((a) => ({
  ...a,
  description: a.secret
    ? "??????????????????"
    : a.description || `${a.name} and survive the encounter in a normal run.`,
}));
export function emptyCollection() {
  return { schema: 1, cards: {}, enemies: {}, equipment: {}, achievements: {} };
}
export function discover(collection, state, at = new Date().toISOString()) {
  if (!state) return collection;
  for (const key of ["cards", "enemies", "equipment", "achievements"])
    collection[key] ||= {};
  collection.highestStratum = Math.max(
    collection.highestStratum || 1,
    state.stratum || 1,
  );
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
  for (const e of [
    ...(state.battle?.enemies || []),
    ...(state.battle?.ideons || []),
  ])
    seen("enemies", e.id);
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
    if (
      !state.tutorial &&
      encounter.outcome === "victory" &&
      encounter.oneHitArchons?.length
    )
      collection.achievements["pop-goes-the-weasel"] ||= { earnedAt: at };
    for (const name of encounter.enemies || []) {
      const aliases = {
        "The Cinder Heart": "hart",
        "Cinder Heart": "hart",
        "Cinder Hart": "hart",
        "Void Colossus": "colossus",
        "Glass Choir": "choir",
      };
      const matches = Object.keys(enemies).filter(
        (id) => enemies[id].name === name.replace(/ \d+$/, ""),
      );
      const id =
        aliases[name] ||
        matches.find((id) => !!enemies[id].tutorialOnly === !!state.tutorial) ||
        (matches.length === 1 ? matches[0] : undefined);
      if (!id) continue;
      seen("enemies", id);
      const achievement = achievements.find(
        (a) => a.enemy === id && !a.retired,
      );
      if (achievement && encounter.outcome === "victory" && !state.tutorial)
        collection.achievements[achievement.id] ||= { earnedAt: at };
    }
  }
  if (
    !state.tutorial &&
    [1, 2, 3].every((afterStratum) =>
      state.stats?.travelerDonations?.some(
        (d) => d.afterStratum === afterStratum && d.gold > 0,
      ),
    )
  )
    collection.achievements["traveler-kindness"] ||= { earnedAt: at };
  if (!state.tutorial && state.outcome === "win" && state.stratum === 4) {
    if (
      state.deck?.length &&
      state.deck.every((c) => cards[c.id]?.element) &&
      new Set(
        state.deck
          .map((c) => cards[c.id].element)
          .filter((element) => element !== "Arcane"),
      ).size <= 1
    )
      collection.achievements["elemental-purity"] ||= { earnedAt: at };
    const challenges = state.stats?.runChallenges;
    if (challenges?.trackedFromStart === true) {
      for (const id of ["blast", "shield"])
        if (!(challenges.placements[id] > 0))
          collection.achievements[`${id}-miser`] ||= { earnedAt: at };
      if (challenges.consumablesUsed === 0)
        collection.achievements["strict-diet"] ||= { earnedAt: at };
      if (challenges.spawnedTavernsVisited === 0)
        collection.achievements["masochist"] ||= { earnedAt: at };
      if (
        Number.isInteger(challenges.movement) &&
        challenges.movement >= 0 &&
        challenges.movement < 20
      )
        collection.achievements["sedentary-lifestyle"] ||= { earnedAt: at };
    }
    if (state.stats?.iStandAlone)
      collection.achievements["i-stand-alone"] ||= { earnedAt: at };
    if (state.stats?.withoutMendersCompleted)
      collection.achievements["without-menders"] ||= { earnedAt: at };
  }
  return collection;
}
