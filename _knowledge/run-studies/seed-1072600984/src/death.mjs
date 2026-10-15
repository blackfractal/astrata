import { enemies, enemyDeathLines } from "./content.mjs";
const statusNames = { burn: "burning", poison: "poison", corrode: "corrosion" };
const closing = "Another traveler may find a different way.";
// Capture the actual lethal hit before reaction/status cleanup. Do not guess an
// enemy from an attack name: several enemies can share a move name.
export function describeDeath(state, cause = "", hit = null) {
  const enemy =
    !hit?.statusHit && hit?.source != null
      ? state.battle?.enemies.find((e) => e.uid === hit.source)
      : null;
  let detail;
  if (hit?.statusHit || (!hit && statusNames[cause])) {
    const status = hit?.name || cause;
    detail = {
      kind: "status",
      status,
      summary: `You died from ${statusNames[status] || status || "an ongoing status"}.`,
    };
  } else if (enemy) {
    const tier = enemy.tier || enemies[enemy.id]?.tier;
    detail = {
      kind: "enemy",
      enemyId: enemy.id,
      enemyUid: enemy.uid,
      enemyName: enemy.name,
      tier,
      attack: hit.name || cause || "an attack",
      flavor: ["Archon", "Eidolon"].includes(tier)
        ? enemyDeathLines[enemy.id] || ""
        : "",
    };
    detail.summary = `${detail.enemyName} killed you with ${detail.attack}.`;
  } else {
    detail = {
      kind:
        state.mode === "event"
          ? "event"
          : cause === "Burning Itch"
            ? "hex"
            : "other",
      cause,
      summary: cause
        ? `You died ${state.mode === "event" ? "during" : "from"} ${cause}.`
        : "Your journey ended here.",
    };
  }
  return {
    ...detail,
    message: [detail.flavor, detail.summary, closing].filter(Boolean).join(" "),
  };
}
export const deathSummary = (result) =>
  result.death?.summary || describeDeath({}, result.cause).summary;
export const deathMessage = (result) =>
  result.death?.message || describeDeath({}, result.cause).message;
