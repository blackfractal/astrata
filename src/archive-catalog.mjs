import { cards, enemies, items } from "./content.mjs";

// Group presentation identities, never merge gameplay definitions or discovery IDs.
const enemyGroups = {
  mendingWarden: [
    { id: "mendingWarden", aliases: ["mendingTutor"], label: "Tutorial" },
  ],
  borrowedOracle: [
    { id: "borrowedOracle", label: "Encounter" },
    { id: "whisperWarden", aliases: ["whisperTutor"], label: "Tutorial" },
  ],
};
const groupedIds = new Set(
  Object.values(enemyGroups).flatMap((v) =>
    v.flatMap((x) => [x.id, ...(x.aliases || [])]),
  ),
);
export function archiveEntries(section, discoveries = {}) {
  const catalog = { cards, enemies, equipment: items }[section];
  return Object.entries(catalog).flatMap(([id, definition]) => {
    if (section === "enemies" && groupedIds.has(id) && !enemyGroups[id])
      return [];
    const variants = (
      (section === "enemies" && enemyGroups[id]) || [{ id }]
    ).map((v) => ({
      ...v,
      definition: catalog[v.id],
      seen: [v.id, ...(v.aliases || [])].some((k) => !!discoveries[k]),
    }));
    const visible = variants.filter((v) => v.seen);
    return [
      {
        id,
        definition: visible[0]?.definition || definition,
        seen: visible.length > 0,
        variants: visible,
      },
    ];
  });
}
export function cardRoles(d) {
  const e = d.effects || {},
    roles = [];
  if (
    [
      "damage",
      "randomDamage",
      "hpDamage",
      "burn",
      "poison",
      "corrode",
      "placementStrike",
      "focusDamage",
    ].some((k) => e[k])
  )
    roles.push("Attack");
  if (
    d.hp ||
    [
      "shield",
      "ward",
      "bodyGuard",
      "seasonGuard",
      "taunt",
      "revealGuard",
      "destroyedWard",
    ].some((k) => e[k])
  )
    roles.push("Defense");
  if (
    !roles.length ||
    [
      "insight",
      "focus",
      "focusPermanent",
      "channel",
      "transmute",
      "heal",
      "allyHeal",
      "adjHeal",
      "adjInsight",
      "cleanse",
      "mend",
      "unbind",
      "shift",
      "secondSpring",
      "conduit",
      "stitch",
      "fracture",
    ].some((k) => e[k])
  )
    roles.push("Utility");
  return roles;
}
const slotNames = {
  wrist: "Bracelet",
  finger: "Ring",
  neck: "Necklace",
  torso: "Armor",
  head: "Headgear",
  gem: "Gem",
  consumable: "Consumable",
  material: "Material",
};
function itemRoles(d) {
  const e = { ...d.effect, ...d.consumable },
    roles = [];
  if (["damage", "reflect", "fury", "attack"].some((k) => e[k]))
    roles.push("Attack");
  if (
    ["block", "armor", "shield", "guard", "bastion", "immunity"].some(
      (k) => e[k],
    )
  )
    roles.push("Defense");
  if (["heal", "cleanse"].some((k) => e[k])) roles.push("Recovery");
  if (["focus", "channel", "insight", "draw", "confluence"].some((k) => e[k]))
    roles.push("Resources");
  if (
    !roles.length ||
    ["recall", "memory", "move", "tincture", "inspiration"].some((k) => e[k])
  )
    roles.push("Utility");
  return roles;
}
export function archiveFacets(section, d) {
  if (section === "cards")
    return {
      element: [d.element],
      role: cardRoles(d),
      rarity: [d.rarity],
      type: [d.type],
      character: [d.character || "Druid"],
    };
  if (section === "enemies")
    return {
      stratum: [String(d.stratum || 1)],
      element: [d.element],
      tier: [d.tier],
      kind: [d.tier === "Ideon" ? "Ideon" : "Main enemy"],
      movement: [
        d.tier === "Ideon"
          ? {
              crawl: "Crawling",
              bullet: "Projectile",
              strike: "Stationary",
              leech: "Leeching",
              swap: "Swapping",
              tentacle: "Pursuing Allies",
            }[d.behavior] || "Stationary"
          : d.movement,
      ],
    };
  return {
    category: [slotNames[d.slot] || d.slot],
    element: [d.element || d.consumable?.element || "None"],
    role: itemRoles(d),
    stratum: [String(d.stratum || 1)],
    curse: [d.cursed ? "Cursed" : "Uncursed"],
  };
}
export function archiveMatches(
  entry,
  section,
  { query = "", visibility = "all", ...filters } = {},
) {
  if (
    (visibility === "seen" && !entry.seen) ||
    (visibility === "unseen" && entry.seen)
  )
    return false;
  const active = Object.entries(filters).filter(([, v]) => v);
  // Unknown entries must not reveal their element, rarity, role, or name through filters.
  if (!entry.seen) return !query && !active.length;
  return entry.variants.some((v) => {
    const d = v.definition,
      facets = archiveFacets(section, d);
    return (
      (!query || d.name.toLowerCase().includes(query.toLowerCase())) &&
      active.every(([key, value]) => facets[key]?.includes(value))
    );
  });
}
export function archiveCardStats(d) {
  return [
    {
      key: "focus",
      label: "Focus",
      value: d.unplaceable ? "—" : d.id === "undertow" ? "1+" : d.focus,
      help: d.unplaceable
        ? "Cannot be placed"
        : d.id === "undertow"
          ? "1 Focus plus the target's Recall cost"
          : "Focus to place",
    },
    {
      key: "channel",
      label: "Channel",
      value: d.limit === 0 ? "—" : (d.channel ?? 1),
      help: d.limit === 0 ? "No activation" : "Channel per activation",
    },
    {
      key: "uses",
      label: "Uses",
      value: d.limit < 0 ? "∞" : d.limit,
      help: "Activation allowance per placement",
    },
    {
      key: "recall",
      label: "Recall",
      value: d.recall == null ? "—" : d.recall,
      help: d.recall == null ? "Cannot Recall" : "Focus to Recall",
    },
  ];
}
