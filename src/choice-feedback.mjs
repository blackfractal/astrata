import { satchelActionReason } from "./consumables.mjs";
import { cards, items, events } from "./content.mjs";
import { tradeAssets } from "./engine.mjs";
import { apexActive } from "./apex.mjs";

export function disabledChoice(esc, label, reason) {
  return `<button disabled class="unavailable-choice">${esc(label)}<small>${esc(reason)}</small></button>`;
}

export function eventChoiceReason(s, choice) {
  const reasons = [];
  if (choice.item || choice.wager?.item) {
    const index = (s.event && events.find(e => e.id === s.event)?.choices.findIndex(c => c.label === choice.label)) ?? -1;
    const assets = choice.trade?.kind === "item" ? tradeAssets(s, choice.trade).filter(x => x.eligible) : [null];
    const capacityReasons = assets.map(x => satchelActionReason(s, {type:"eventChoice", index, tradeItem:x?.uid}));
    if (capacityReasons.length && capacityReasons.every(Boolean)) reasons.push(capacityReasons[0]);
  }
  if ((choice.cost || 0) > s.gold) reasons.push("You don't have enough gold.");
  if (choice.maxHpCost && s.maxHp <= choice.maxHpCost) reasons.push("You do not have enough maximum HP to survive this bargain.");
  if (choice.trade) {
    const assets = tradeAssets(s, choice.trade);
    if (!assets.some(x => x.eligible)) {
      const t = choice.trade;
      const name = (t.kind === "item" ? items : cards)[t.id]?.name || t.label || t.slot || t.type || (t.kind === "item" ? "item" : "card");
      reasons.push(assets.length
        ? [...new Set(assets.map(x => x.reason))].join(". ") + "."
        : `You don't have a matching ${name} to trade.`);
    }
  }
  return reasons.join(" ") || "This choice is not available right now.";
}

// Presentation only: actionable offers still come exclusively from Game.legal().
export function unavailableTavernChoices(s, type, actions) {
  const shop = s.shop;
  if (type === "heal") {
    if (actions.some(a => a.type === type)) return [];
    const amount = (shop.afterStratum ?? (s.loomIntro ? 1 : null)) || apexActive(s) ? 50 : 20;
    return [{ label: `Rest · heal up to ${amount} HP · ${amount} Gold`, reason:
      shop.healUsed ? "You have already rested at this Tavern." : s.hp >= s.maxHp ? "Your health is already full." : "You don't have enough gold." }];
  }
  if (type === "gossip") {
    if (actions.some(a => a.type === type)) return [];
    return [{ label: "Gossip · 15 Gold", reason: shop.gossipUsed ? "You have already heard the gossip here." : "You don't have enough gold." }];
  }
  if (type !== "removeHex" && type !== "sell") return [];
  const hex = type === "removeHex";
  const candidates = hex ? s.deck.filter(c => cards[c.id].type === "Hex") : s.inventory.filter(x => items[x.id].cursed);
  if (!candidates.length) return [{ label: hex ? "Remove Hex" : "Remove Cursed object", reason: hex ? "You have no Hexes to remove." : "You have no cursed objects to remove." }];
  return candidates.filter(c => !actions.some(a => a.type === type && a.uid === c.uid)).map(c => {
    const price = hex ? shop.hexPrice || { kind: "gold", gold: shop.healerPrice, hp: 0 } : { gold: Math.floor(items[c.id].worth / 2) };
    const reasons = [];
    if (!shop.healer) reasons.push("No healer is visiting this Tavern.");
    else {
      if (s.gold < price.gold) reasons.push("You don't have enough gold.");
      if (s.hp <= (price.hp || 0)) reasons.push("You don't have enough HP to survive the treatment.");
      if (price.kind === "allyGold" && !s.deck.some(x => cards[x.id].type === "Ally")) reasons.push("You don't have an Ally card to offer.");
      if (price.kind === "item" && !s.inventory.some(x => !items[x.id].cursed && !x.gem && !s.inventory.some(i => i.gem === x.uid))) reasons.push("You need an uncursed item without a socketed Gem to offer.");
    }
    const cost = [price.gold ? `${price.gold} Gold` : null, price.hp ? `${price.hp} HP` : null, price.kind === "allyGold" ? "one Ally card" : null, price.kind === "item" ? "one item" : null].filter(Boolean).join(" + ");
    return { label: `Remove ${(hex ? cards : items)[c.id].name}${cost ? " · " + cost : ""}`, reason: reasons.join(" ") };
  });
}
