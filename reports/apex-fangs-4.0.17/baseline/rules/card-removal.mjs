import { cards } from "./content.mjs";

// A forced grid discard does not bypass a card's intrinsic Recall restriction.
// Temporary restrictions (Locked, Sticky, covering Ideons) are not card traits.
export function forcedDiscardOutcome(stack) {
  const destroyedIds = new Set(stack.filter(c => {
    const d = cards[c.id];
    return d.recall == null || d.singleUse || d.unrecallable;
  }).map(c => c.uid));
  // Melded attachments share their host's destruction, as with normal damage.
  for (let changed = true; changed;) {
    changed = false;
    for (const c of stack) if (destroyedIds.has(c.attachedTo) && !destroyedIds.has(c.uid)) {
      destroyedIds.add(c.uid);
      changed = true;
    }
  }
  return {
    discarded: stack.filter(c => !destroyedIds.has(c.uid)),
    destroyed: stack.filter(c => destroyedIds.has(c.uid)),
  };
}

export function forcedDiscardLabel(stack) {
  const { discarded, destroyed } = forcedDiscardOutcome(stack);
  return destroyed.length ? discarded.length ? "Discard + Destroyed" : "Destroyed" : "Discard";
}
