import { cards } from "./content.mjs";
import { CORRUPTIONS } from "./strata.mjs";
const top = (stack) => stack.at(-1);
const neighbors = (i) =>
  [i % 7 ? i - 1 : -1, i % 7 < 6 ? i + 1 : -1, i - 7, i + 7].filter(
    (j) => j >= 0 && j < 42,
  );
export function corruptionAt(b, i) {
  return b.corruptions?.[i] || null;
}
export function canMend(c, corruption) {
  return !!corruption && !!CORRUPTIONS[corruption.kind];
}
export function canEnter(b, c, i) {
  const q = corruptionAt(b, i);
  if (top(b.grid[i])?.mending) return false;
  if (c.id === "elves") return !b.grid[i].length;
  return q?.kind !== "hole";
}
export function corruptionPower(b, i, power) {
  return neighbors(i).some(
    (j) => corruptionAt(b, j)?.kind === "nausea" && !b.grid[j].length,
  )
    ? Math.floor(power / 2)
    : power;
}
export function resetCoveredInsanity(b) {
  for (const [i, q] of Object.entries(b.corruptions || {}))
    if (q.kind === "insanity" && b.grid[i].length) q.value = 1;
}
// Stable, deliberately simple value: the card's printed damage/Guard strength.
// Utility cards score zero; ties follow row-major order, then normal target order.
export function angerChoice(g, slot) {
  const b = g.s.battle;
  if (b.channel < 1 || b.grid[slot].length) return null;
  const phase = b.phase,
    channel = b.channel;
  let choices;
  try {
    b.phase = "activate";
    b.channel = Number.MAX_SAFE_INTEGER;
    choices = g.baseLegal().filter((a) => {
      const c = a.type === "activate" && top(b.grid[a.slot]);
      return c && neighbors(slot).includes(a.slot) && a.element === c.element;
    });
  } finally {
    b.phase = phase;
    b.channel = channel;
  }
  const value = (a) => {
    const c = top(b.grid[a.slot]),
      d = cards[c.id],
      f = d.effects;
    const printed = Math.max(
      f.damage || 0,
      f.randomDamage || 0,
      f.hpDamage ? d.hp || 0 : 0,
      f.shield || 0,
      f.ward || 0,
    );
    return printed + (printed && c.upgrade ? d.upgrade?.bonus || 0 : 0);
  };
  return (
    choices.sort((a, z) => value(a) - value(z) || a.slot - z.slot)[0] || null
  );
}
export function triggerAnger(g, slot) {
  const b = g.s.battle,
    q = b.corruptions?.[slot];
  if (q?.kind !== "anger" || q.triggeredTurn === b.turn) return;
  q.triggeredTurn = b.turn;
  const a = angerChoice(g, slot);
  if (!a) return;
  const c = top(b.grid[a.slot]);
  g.log(
    `Anger forces ${cards[c.id].name} without Attunement, spending 1 Channel and its activation allowance.`,
  );
  g.present("corruption", { slot, name: "Anger · forced activation" });
  (g.s.stats.angerActivations ||= []).push({
    turn: b.turn,
    corruptionSlot: slot,
    slot: a.slot,
    card: c.uid,
    element: a.element,
  });
  g.activate(a, { channelCost: 1, deferPump: true });
}
export function prepareCorruption(g, e, t) {
  const b = g.s.battle;
  b.corruptions ||= {};
  const existing = Object.values(b.corruptions).filter(
    (q) => q.source === e.uid && !(e.id === "bombadier" && q.kind === "mine"),
  ).length;
  let room = (e.corruptionCap || 1) - existing;
  e.corruptionPlan = [];
  const kinds = [
    ...Array(t.count || 1).fill(t.markCorruption),
    ...(t.alsoCorruption ? Array(t.alsoCount || 1).fill(t.alsoCorruption) : []),
  ];
  for (const kind of kinds) {
    // Bombadier reserves a separate mine pool so accumulated Holes and Anger cannot
    // silently cancel the promised late-cycle three-bomb cast.
    if (!(e.id === "bombadier" && kind === "mine") && room-- <= 0) break;
    if (
      kind === "mine" &&
      e.mineCap &&
      Object.values(b.corruptions).filter(
        (q) => q.source === e.uid && q.kind === "mine",
      ).length +
        e.corruptionPlan.filter((p) => p.kind === "mine").length >=
        e.mineCap
    )
      continue;
    let candidates = b.grid.flatMap((stack, i) => {
      if (
        b.corruptions[i] ||
        b.enemies.some(
          (enemy) =>
            enemy.hp > 0 && enemy.corruptionPlan?.some((p) => p.slot === i),
        )
      )
        return [];
      const c = top(stack),
        d = cards[c?.id],
        f = d?.effects;
      if (kind === "hole" && stack.length) return [];
      if (
        kind === "hypnosis" &&
        (!c ||
          g.allowance(c, i) <= 0 ||
          !(f.damage || f.hpDamage || f.shield || f.ward || f.randomDamage))
      )
        return [];
      return [i];
    });
    if (!candidates.length) continue;
    const score = (i) => {
      const c = top(b.grid[i]);
      if (kind === "hypnosis")
        return (
          g.cardPower(c, i) + (cards[c.id].effects.ward || g.shieldPower(c, i))
        );
      const adjacent = neighbors(i).filter((j) => b.grid[j].length).length;
      if (t.spread && e.corruptionPlan.length) {
        const distance = Math.min(
          ...e.corruptionPlan.map(
            (p) =>
              Math.abs((i % 7) - (p.slot % 7)) +
              Math.abs(Math.floor(i / 7) - Math.floor(p.slot / 7)),
          ),
        );
        return distance * 10 + adjacent;
      }
      // Empty spaces beside the most cards threaten useful formations.
      return (c ? 0 : 100) + adjacent * 10;
    };
    const best = Math.max(...candidates.map(score));
    candidates = candidates.filter((i) => score(i) === best);
    // Seeded, committed space. Never follow a recalled/moved card.
    const slot = g.pick(candidates);
    e.corruptionPlan.push({ slot, kind });
    g.log(
      e.name +
        " marks " +
        CORRUPTIONS[kind].name +
        " at row " +
        (Math.floor(slot / 7) + 1) +
        ", column " +
        ((slot % 7) + 1) +
        ". One player turn to respond.",
    );
  }
  if (e.corruptionPlan.length)
    g.present("corruption", {
      slots: e.corruptionPlan.map((p) => p.slot),
      name: "Foretold Corruptions",
    });
}
export function applyCorruptions(g, e) {
  const b = g.s.battle;
  const applied = [];
  for (const { slot, kind } of e.corruptionPlan || []) {
    if (b.corruptions[slot] || (kind === "hole" && b.grid[slot].length)) {
      g.log(CORRUPTIONS[kind].name + " fails at its committed space.");
      continue;
    }
    b.corruptions[slot] = {
      kind,
      uid: g.uid(),
      source: e.uid,
      value: 1,
      remaining: 1,
      damage: e.mineDamage || 20,
      element: "Fire",
      createdTurn: b.turn,
    };
    g.log(CORRUPTIONS[kind].name + " corrupts a space.");
    applied.push(slot);
  }
  e.corruptionPlan = [];
  resetCoveredInsanity(b);
  if (applied.length)
    g.present("corruption", { slots: applied, name: "Corrupted spaces" });
}
export function retargetCoveredCorruptions(g, covered) {
  const b = g.s.battle;
  if (!b || !covered.length) return;
  for (const e of b.enemies.filter((e) => e.hp > 0)) {
    for (const mark of [...(e.corruptionPlan || [])]) {
      if (!covered.includes(mark.slot)) continue;
      const previous = mark.slot;
      const reserved = b.enemies.flatMap((enemy) =>
        (enemy.corruptionPlan || []).map((p) => p.slot),
      );
      let candidates = b.grid.flatMap((stack, i) => {
        if (b.corruptions[i] || reserved.includes(i)) return [];
        if (mark.kind !== "hypnosis") return stack.length ? [] : [i];
        const c = top(stack),
          f = cards[c?.id]?.effects;
        return c &&
          g.allowance(c, i) > 0 &&
          (f.damage || f.hpDamage || f.shield || f.ward || f.randomDamage)
          ? [i]
          : [];
      });
      if (mark.kind !== "hypnosis" && candidates.length) {
        const score = (i) =>
          neighbors(i).filter((j) => b.grid[j].length).length;
        const best = Math.max(...candidates.map(score));
        candidates = candidates.filter((i) => score(i) === best);
      }
      if (!candidates.length) {
        e.corruptionPlan = e.corruptionPlan.filter((p) => p !== mark);
        g.log(
          e.name +
            " cannot relocate " +
            CORRUPTIONS[mark.kind].name +
            ": no open space remains.",
        );
        continue;
      }
      mark.slot = g.pick(candidates);
      g.log(
        e.name +
          " redirects " +
          CORRUPTIONS[mark.kind].name +
          " from row " +
          (Math.floor(previous / 7) + 1) +
          ", column " +
          ((previous % 7) + 1) +
          " to row " +
          (Math.floor(mark.slot / 7) + 1) +
          ", column " +
          ((mark.slot % 7) + 1) +
          ".",
      );
      g.present("corruption", {
        slot: mark.slot,
        name: "Redirected: " + CORRUPTIONS[mark.kind].name,
      });
    }
  }
}
export function repairTargets(g, c, i) {
  if (c.mending) return [];
  const b = g.s.battle;
  return [i, ...neighbors(i)].flatMap((slot) => [
    ...(b.biles?.[slot] ? [{ cardTarget: slot, repairKind: "bile" }] : []),
    ...(canMend(c, b.corruptions?.[slot])
      ? [{ cardTarget: slot, repairKind: b.corruptions[slot].kind }]
      : []),
  ]);
}
function completeRepair(g, c, i, m) {
  const b = g.s.battle,
    layer = m.kind === "bile" ? b.biles : b.corruptions;
  if (layer?.[m.slot]?.uid !== m.corruptionUid) return false;
  delete layer[m.slot];
  (g.s.stats.repairs ||= []).push({
    stratum: g.s.stratum,
    turn: b.turn,
    slot: m.slot,
    kind: m.kind,
    card: c.uid,
  });
  g.present("corruption", {
    slot: m.slot,
    name: "Mended · " + CORRUPTIONS[m.kind].name,
  });
  g.log("Machine Elves repair " + CORRUPTIONS[m.kind].name + ".");
  if (g.allowance(c, i) <= 0) {
    b.grid[i] = b.grid[i].filter((x) => x.uid !== c.uid);
    b.discard.push({ id: c.id, uid: c.uid, upgrade: c.upgrade });
    g.log("Their final repair complete, Machine Elves return to discard.");
  }
  return true;
}
export function mend(g, c, i, target = i, kind = null) {
  const b = g.s.battle;
  const q = kind === "bile" ? b.biles?.[target] : b.corruptions?.[target];
  if (!canMend(c, q) || ![i, ...neighbors(i)].includes(target)) return;
  const delay = Math.max(
    0,
    (CORRUPTIONS[q.kind].repairTurns || 0) - (c.upgrade ? 1 : 0),
  );
  const job = {
    slot: target,
    corruptionUid: q.uid,
    kind: q.kind,
    due: b.turn + delay,
  };
  if (delay) c.mending = job;
  else completeRepair(g, c, i, job);
}
export function startRepairs(g) {
  const b = g.s.battle;
  for (const [i, stack] of b.grid.entries()) {
    const c = top(stack),
      m = c?.mending;
    if (!m || m.due > b.turn || c.freeze >= b.turn) continue;
    delete c.mending;
    // The repair is committed to a space, but must remain within reach.
    if ([i, ...neighbors(i)].includes(m.slot)) completeRepair(g, c, i, m);
  }
  resetCoveredInsanity(b);
  for (const [i, q] of Object.entries(b.corruptions || {})) {
    if (q.kind !== "insanity" || b.grid[i].length) continue;
    const loss = Math.min(g.s.hp, q.value++);
    g.s.hp -= loss;
    g.s.stats.damageTaken += loss;
    g.present("hit", {
      target: "player",
      amount: loss,
      element: "Chaos",
      name: "Insanity",
    });
    g.log("Insanity: lose " + loss + " HP.");
    if (g.s.hp <= 0) {
      g.finish(false, "Insanity");
      return;
    }
  }
}
export function corruptionRound(g) {
  const b = g.s.battle;
  resetCoveredInsanity(b);
  for (const [key, q] of Object.entries(b.corruptions || {})) {
    const i = Number(key),
      c = top(b.grid[i]);
    if (q.kind === "mine" && q.createdTurn < b.turn && --q.remaining <= 0) {
      delete b.corruptions[i];
      if (c) {
        g.destroyCard(i, c.uid);
        g.log("Mind Mine destroys its cover.");
      }
      g.present("mineExplosion", {
        slot: i,
        covered: !!c,
        name: "Mind Mine detonates",
      });
      if (!c)
        b.jobs.unshift({
          kind: "hit",
          name: "Mind Mine",
          damage: q.damage || 18,
          element: q.element || "Arcane",
          gridSourceSlot: i,
          source: q.source,
        });
    }
    if (q.kind === "hypnosis") compelCard(g, i, q);
  }
}

export function compelCard(g, i, q, forced = false) {
  const b = g.s.battle,
    c = top(b.grid[i]);
  if (
    !c ||
    c.hypnosisTurn === b.turn ||
    !g.condition(c, i) ||
    !(forced
      ? g.allowance(c, i) > 0 && !c.zeroWard && c.freeze < b.turn
      : g.activationAvailable(c, i))
  )
    return;
  const d = cards[c.id],
    f = d.effects,
    source = b.enemies.find((e) => e.uid === q.source && e.hp > 0);
  if (
    !source ||
    !(f.damage || f.hpDamage || f.randomDamage || f.shield || f.ward)
  )
    return;
  c.hypnosisTurn = b.turn;
  c.used++;
  c.lastActivatedTurn = b.turn;
  g.present("corruption", { slot: i, name: "Hypnosis · " + d.name });
  if (d.charge && c.charge < d.charge) {
    c.charge = Math.min(d.charge, c.charge + 1);
    return;
  }
  if (d.charge) c.charge = 0;
  const damage = f.randomDamage
    ? corruptionPower(b, i, 1 + Math.floor(g.rand() * f.randomDamage))
    : g.cardPower(c, i);
  if (damage)
    b.jobs.unshift({
      kind: "hit",
      name: "Hypnosis · " + d.name,
      damage,
      element: c.lastActivationElement || c.element,
      source: q.source,
      gridSourceSlot: i,
    });
  if (f.shield || f.ward)
    source.guard += f.shield
      ? g.shieldPower(c, i)
      : corruptionPower(b, i, f.ward + (c.upgrade ? d.upgrade?.bonus || 0 : 0));
  if (d.destroyAfterActivation) g.destroyCard(i, c.uid);
}
