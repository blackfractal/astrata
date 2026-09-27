import { cards, items, enemies, VERSION } from "./content.mjs";
import { offense, defenseRate, adjacent, allyHit } from "./engine.mjs";
export const defaultWeights = {
  damage: 1,
  survival: 1.4,
  economy: 4,
  development: 1,
  progress: 1,
};
const dist = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
export class WeightedPolicy {
  constructor(weights = {}) {
    this.weights = { ...defaultWeights, ...weights };
    this.id = "weighted-druid-v1.6";
  }
  choose(o, actions) {
    if (!actions.length) return null;
    let winner = actions[0],
      best = -Infinity,
      reason = "Use an available legal choice.";
    for (const a of actions) {
      let score = -0.01,
        why = "Fallback for a legal choice with unfamiliar effects.";
      try {
        [score, why] = this.score(o, a);
        if (!Number.isFinite(score)) score = -0.01;
      } catch {}
      if (score > best) {
        best = score;
        winner = a;
        reason = why;
      }
    }
    return { action: winner, reason, score: best, policy: this.id };
  }
  cardValue(id, o) {
    const d = cards[id];
    if (!d) return 0;
    const e = d.effects;
    return (
      (e.damage || 0) / (d.charge || 1) +
      (d.hp || 0) * 0.6 +
      (e.ward || 0) * 0.55 +
      (e.shield || 0) * 0.4 +
      (e.channel || 0) * 6 +
      (e.focusPermanent || 0) * 10 +
      (e.heal || 0) * 1.5 +
      (e.poison || 0) * 3 +
      (e.burn || 0) * 2 +
      (e.corrode || 0) * 6 +
      (e.hpDamage ? 8 : 0) +
      (d.growth ? 8 : 0) -
      (d.focus - 1) * 3 -
      (d.type === "Hex" ? 40 : 0)
    );
  }
  gearValue(e = {}) {
    return (
      (e.channel || 0) * 20 +
      (e.focus || 0) * 14 +
      (e.insight || 0) * 6 +
      (e.block || 0) * 2 +
      (e.heal || 0) * 6 +
      (e.armor || 0) * 6 +
      (e.damage || 0) * 3 +
      (e.movement || 0) * 3 +
      (e.resist ? 4 : 0)
    );
  }
  score(o, a) {
    const f = a.effects || {},
      w = this.weights,
      b = o.battle,
      injured = o.maxHp - o.hp;
    let n = 0,
      reason = a.label;
    switch (a.type) {
      case "chooseClass":
      case "begin":
      case "continueReward":
        return [10, "Advance the journey."];
      case "startGem":
        return [
          f.defense ? 10 : 4,
          "Imbue the starting Bracelet for passive protection.",
        ];
      case "unequip":
        return [
          -25,
          "Keep equipped gear unless replacing it with better gear.",
        ];
      case "equip": {
        const inst = o.inventory.find((x) => x.uid === a.item),
          old = o.inventory.find((x) => x.uid === o.equipment[a.slot]);
        n =
          this.gearValue(items[inst.id].effect) -
          this.gearValue(items[old?.id]?.effect) -
          (Object.values(o.equipment).includes(inst.uid)
            ? this.gearValue(items[inst.id].effect)
            : 0);
        return [
          n > 0 ? 30 + n : -20,
          "Equip gear only when its evaluated benefit improves this slot.",
        ];
      }
      case "move": {
        const p = { x: a.x, y: a.y };
        const targets = o.field.entities.map((e) => {
          let value =
            e.type === "Gold"
              ? e.value * 0.35
              : e.type === "Item"
                ? 25
                : e.type === "Event"
                  ? 20
                  : e.type === "Tavern"
                    ? o.gold >= 20
                      ? injured * 0.8 + 12
                      : 2
                    : e.enemy
                      ? enemies[e.enemy].tier === "Archon"
                        ? o.field.round > 18
                          ? 20
                          : -5
                        : enemies[e.enemy].tier === "Eidolon"
                          ? -12
                          : 9
                      : 0;
          if (e.enemy) value -= ((e.count || 1) - 1) * 5;
          const d = dist(p, e),
            old = dist(o.field, e);
          return { e, score: value / (d + 1) + (old - d) * 3 };
        });
        n = targets.length ? Math.max(...targets.map((x) => x.score)) : 0;
        for (const e of o.field.entities.filter((x) => x.enemy)) {
          if (dist(p, e) === 0) {
            n -= ((e.count || 1) - 1) * (o.hp < 30 ? 8 : 3);
            const tier = enemies[e.enemy].tier;
            n -=
              tier === "Eidolon"
                ? 12
                : tier === "Archon" && o.field.round < 18
                  ? 8
                  : 0;
          }
          if (o.hp < 20 && dist(p, e) <= 2) n -= 3;
        }
        n -= dist(p, { x: 5, y: 5 }) * 0.1;
        return [
          n,
          "Move toward useful visible encounters, favoring recovery and avoiding dangerous packs.",
        ];
      }
      case "wait":
        return [-1, "End movement when there is no better destination."];
      case "place": {
        const c = cards[f.card],
          e = c.effects,
          slot = b.grid[a.slot],
          ns = adjacent(a.slot).filter((i) => b.grid[i].length),
          existing = b.grid.flat().filter((x) => x.id === c.id).length;
        const hasOffense = b.grid.some((x) => {
          const t = x.at(-1);
          return (
            t &&
            t.used < cards[t.id].limit &&
            (cards[t.id].effects.damage || cards[t.id].effects.hpDamage)
          );
        });
        n = this.cardValue(c.id, o) * 0.5 + 2;
        if (e.focusPermanent) n += b.turn < 5 ? 12 : 2;
        if (c.growth) n += 8 + ns.length * 3;
        if (e.damage && !hasOffense) n += 8;
        if (e.shield && existing) n -= 12;
        if (c.condition === "isolated") n += ns.length ? -30 : 4;
        if (c.condition === "corner" && ![0, 4, 15, 19].includes(a.slot))
          n -= 30;
        if (
          c.condition &&
          ["Earth", "Fire", "Wind", "Water"].includes(c.condition) &&
          !ns.some((i) => b.grid[i].at(-1).element === c.condition)
        )
          n -= 20;
        if (e.adj) n += ns.length * 2;
        if (e.matchingDamage || e.matchingShield)
          n +=
            ns.filter(
              (i) => b.grid[i].at(-1).id === c.id && !b.grid[i].at(-1).sever,
            ).length * 2;
        if (c.attune)
          n += ns.some((i) => b.grid[i].at(-1).element !== "Arcane") ? 1 : 0;
        for (const i of ns) if (cards[b.grid[i].at(-1).id].growth) n += 3;
        if (slot.length && !c.stack) n -= 50;
        if (
          c.stack === "supersede" &&
          slot.at(-1)?.used < cards[slot.at(-1).id].limit
        )
          n -= 10;
        if (c.stack === "tower" && !slot.length) n -= 6;
        return [
          n * w.development,
          "Develop usable offense, growth, and economy while preserving placement conditions.",
        ];
      }
      case "recall":
        return [
          f.spent && b.grid.filter((x) => x.length).length > 10 ? 3 : -15,
          "Clear exhausted cards only when grid space is scarce.",
        ];
      case "activatePhase":
      case "endTurn":
        return [-1, "Advance after worthwhile actions are used."];
      case "activate": {
        const target = b.enemies.find((e) => e.uid === a.target);
        const threat = b.enemies.reduce(
          (sum, e) => sum + (e.tell.damage || 0) * (e.tell.hits || 1),
          0,
        );
        const protectedBy =
          b.grid.flat().reduce((sum, c) => sum + (c.ward || 0), 0) +
          b.shields.reduce((sum, p) => sum + p.block, 0) +
          o.bonuses.armor +
          3;
        let damage = f.damage || (f.randomDamage && 6.5) || 0;
        if (f.charge > 1) damage /= f.charge;
        if (target) {
          damage = offense(damage, a.element, target.element);
          if (target.resist === a.element) damage = Math.ceil(damage / 2);
          if (target.wisp) damage *= a.element === "Arcane" ? 0.5 : 2;
          if (target.flicker) damage = 0.5;
          if (damage >= target.hp) n += 15;
          damage = Math.min(damage, target.hp);
          if (target.id === "colossus" && a.element === "Chaos") n -= 8;
        }
        if (f.all) damage *= b.enemies.length;
        n +=
          damage * w.damage +
          (f.burn || 0) * 2 +
          (f.poison || 0) * 3 +
          (f.corrode || 0) * 5;
        n += (f.channel || 0) > a.costs.channel ? 12 : 0;
        n += (f.focusPermanent || 0) * (b.turn < 7 ? 12 : 4);
        n += (f.insight || 0) * 0.4 + (f.focus || 0) * 1.2;
        n += Math.min(injured, f.heal || 0) * w.survival;
        if (f.cleanse)
          n += Object.values(o.status).reduce((x, y) => x + y, 0) * 2;
        if (f.shield)
          n +=
            Math.min(f.shield, Math.max(0, threat - protectedBy)) * w.survival;
        if (f.ward)
          n += Math.min(f.ward, Math.max(0, threat + 3 - protectedBy));
        if (f.taunt) n += o.hp < 15 ? 6 : 0;
        if (f.relief) n += b.turn > b.relief ? 5 : -10;
        if (f.unbind)
          n +=
            b.grid.flat().filter((x) => x.lock || x.sever || x.freeze).length *
            4;
        if (f.allyHeal) n += 4;
        if (f.magnify) n += 3;
        if (f.shift || f.transmute) n -= 4;
        return [
          n,
          "Balance immediate kills, incoming damage, healing, and future resources.",
        ];
      }
      case "block":
      case "bracelet":
        return [
          f.block * defenseRate(f.element, b.reaction.element),
          "Use the portion with the strongest effective block against this element.",
        ];
      case "intercept": {
        const c = b.grid[a.slot].at(-1),
          d = cards[c.id],
          result = allyHit(b.reaction, c.element, c.hp, f.swallow);
        return [
          (b.reaction.damage - result.remaining) * w.survival -
            (d.growth ? 8 : 0) -
            (d.effects.heal ? 5 : 0) +
            (f.swallow ? b.reaction.damage : 0),
          "Protect player HP while retaining valuable growing Allies when possible.",
        ];
      }
      case "takeHit":
        return [
          b.bracelets.reduce((n, p) => n + p.block, 0) +
            o.bonuses.armor -
            (o.hp < 20 ? 10 : 0),
          "Let passive equipment absorb a manageable hit.",
        ];
      case "rewardCard":
        return [
          this.cardValue(a.id, o) - (o.deck.length > 20 ? 6 : 0),
          "Choose a card by its damage, defense, economy, and growth features.",
        ];
      case "leaveItem":
        return [0, "Leave an unwanted item without accepting its effects."];
      case "skipReward":
        return [0, "Skip a card that would dilute the deck."];
      case "rewardGem":
      case "rewardSetting":
        return [
          this.gearValue(f.gear),
          "Prefer permanent economy and passive protection.",
        ];
      case "takeItem":
      case "buy": {
        const id = f.item,
          d = id?.startsWith("card:") ? null : items[id];
        n = d
          ? this.gearValue(d.effect) +
            (d.slot === "gem" ? 3 : 0) -
            (d.cursed ? 40 : 0)
          : this.cardValue(id?.slice(5), o);
        if (a.type === "buy") n -= a.price * 0.13;
        return [n, "Value the offered item against its price and risk."];
      }
      case "heal":
        return [injured * 0.9, "Recover HP before the next encounter."];
      case "eventChoice":
        return [
          (f.heal ? Math.min(injured, f.heal) * 1.4 : 0) +
            (f.gold || 0) * 0.2 +
            (f.hp || 0) * 1.5 +
            (f.card ? this.cardValue(f.card, o) : 0) +
            (f.hex ? -30 : 0) +
            (f.item
              ? this.gearValue(items[f.item].effect) -
                (items[f.item].cursed ? 25 : 0)
              : 0) +
            (f.clean || f.cleanHex
              ? o.deck.filter((x) => cards[x.id].type === "Hex").length * 20
              : 0) -
            (a.costs.gold || 0) * 0.2,
          "Compare the visible reward, recovery, and cost of this event choice.",
        ];
      case "socket": {
        const inst = o.inventory.find((x) => x.uid === a.uid),
          old = o.inventory.find((x) => x.uid === inst.gem),
          g = o.inventory.find((x) => x.uid === a.gem);
        return [
          this.gearValue(items[g.id].effect) -
            this.gearValue(items[old?.id]?.effect) +
            (old ? -10 : 10),
          "Socket unused Gems to activate their powers.",
        ];
      }
      case "upgrade":
        return [
          8 - (a.costs.gold || 0) * 0.06 - (a.costs.hp || 0) * 0.7,
          "Improve a card when the cost is affordable.",
        ];
      case "removeHex": {
        const lostCard = o.deck.find((c) => c.uid === a.sacrificeCard);
        const lostItem = o.inventory.find((x) => x.uid === a.sacrificeItem);
        const hpCost = a.costs.hp || 0;
        return [
          25 -
            hpCost * (o.hp < 25 ? 2 : 0.8) -
            (a.costs.gold || 0) * 0.06 -
            (lostCard ? this.cardValue(lostCard.id, o) : 0) -
            (lostItem ? this.gearValue(items[lostItem.id].effect) : 0),
          "Weigh Hex relief against the displayed HP, Gold, or sacrifice cost.",
        ];
      }
      case "sell":
        return [
          f.cursed ? 10 : -30,
          "Keep useful equipment; pay to remove a Curse.",
        ];
      case "gossip":
        return [
          !o.archon && o.gold > 100 ? 2 : -5,
          "Buy Archon information only with surplus Gold.",
        ];
      case "leave":
        return [0, "Continue when useful services are exhausted."];
      case "replaceArmor":
        return [
          this.gearValue(f.gear) -
            this.gearValue(
              items[o.inventory.find((x) => x.uid === a.old).id].effect,
            ),
          "Replace Armor only for a better evaluated effect.",
        ];
      case "declineArmor":
        return [0, "Respect the three-Armor carry limit."];
      case "remove":
      case "unsocket":
        return [-20, "Avoid unnecessary deck removal or socket churn."];
      default:
        return [
          Object.values(f)
            .filter((x) => typeof x === "number")
            .reduce((a, b) => a + b, 0) * 0.01,
          "Fallback: choose a legal action using available public effects.",
        ];
    }
  }
}
