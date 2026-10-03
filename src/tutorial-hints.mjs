import { cards } from "./content.mjs";
import { WeightedPolicy } from "./policy.mjs";
const policy = new WeightedPolicy();
export function tutorialHint(game) {
  const s = game.s,
    b = s.battle;
  if (!s.tutorial || s.tutorial.lesson !== "independent" || s.mode !== "battle")
    return null;
  const legal = game.legal();
  let action;
  if (
    !b.reaction &&
    b.phase === "place" &&
    !legal.some((a) => a.type === "place")
  )
    action = legal.find((a) => a.type === "activatePhase");
  else if (
    !b.reaction &&
    b.phase === "activate" &&
    !legal.some((a) => a.type === "activate")
  )
    action = legal.find((a) => a.type === "endTurn");
  action ||= policy.choose(game.observe(), legal)?.action;
  if (!action) return null;
  const name =
    action.slot == null
      ? "this card"
      : cards[b.grid[action.slot].at(-1)?.id]?.name || "this card";
  let text;
  switch (action.type) {
    case "activatePhase":
      text =
        "Ready to continue? Click the arrow from Placement to Activation to use your Channel.";
      break;
    case "endTurn":
      text =
        "Ready for the enemy? Click the arrow from Activation to Enemy, then choose how to defend.";
      break;
    case "ward":
    case "block":
    case "intercept":
      text = `You could click ${name} to defend against this attack. Choose carefully: the attack cannot move back toward cards on the right.`;
      break;
    case "armor":
      text =
        "You could click the highlighted Armor to protect against this hit, or click the Druid to skip it.";
      break;
    case "bracelet":
      text =
        "You could click the highlighted Bracelet to absorb some of this attack with its remaining Guard.";
      break;
    case "skipEquipment":
      text =
        "Click your Druid to accept the remaining hit. You can choose another available defense instead.";
      break;
    case "place":
      text = `You could place ${cards[b.hand.find((c) => c.uid === action.uid)?.id]?.name || "the highlighted card"} in the highlighted space. Drag it there, or select it and choose the space.`;
      break;
    case "activate":
      text = `You could activate ${name}. ${action.target != null ? "Drag it onto the enemy, or double-click its activation to attack." : "Click its activation button to use the effect."}`;
      break;
    case "recall":
      text = `You could Recall ${name} to free its space. Open its details to see the Recall choice.`;
      break;
    default:
      text = `One available option: ${action.label}.`;
  }
  return { action, text };
}
