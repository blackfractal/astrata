import { fieldEntitiesAt } from "./field-display.mjs";
import { attackOrb } from "./impact-effects.mjs";
import { eventTrades } from "./trade-ui.mjs";
import {
  boardInteractions,
  previewElement,
  inspectLinks,
} from "./board-interactions.mjs";
import { arrangeBattle } from "./battle-layout.mjs";
import {
  damageMarkup,
  gridTelegraphs,
  targetPreview,
  statusBadges,
  upgradeHelp,
} from "./battle-feedback.mjs";
import { cards, items, enemies } from "./content.mjs";
import {
  activationGrowth,
  conduitActive,
  defensiveElement,
  matchingNeighbors,
  blockHit,
  allyHit,
  incomingDamageText,
  adjacent,
  attunementSourceElement,
} from "./engine.mjs";
const slotNames = {
  head: "Head",
  neck: "Neck",
  torso: "Armor",
  wrist1: "Left wrist",
  wrist2: "Right wrist",
  finger1: "Left ring",
  finger2: "Right ring",
};
const actTypes = ["activate", "recall"];
let drag = null;
let marketTab = "buy";
const marketCategory = { buy: "Cards", sell: "Equipment" };
const healerRequired = "Requires a Tavern Healer to remove.";
const stop = (e) => e.stopPropagation();
function run(c, a) {
  if (c.busy()) return;
  c.close();
  return c.act(a);
}
function button(c, a, cls = "") {
  const markup = c.actionButton(a, cls);
  if (a.type !== "upgrade") return markup;
  const owned = c.o.deck.find((x) => x.uid === a.uid);
  const help = owned && upgradeHelp(cards[owned.id]);
  return help
    ? markup.replace(
        "<button ",
        `<button data-upgrade-preview data-tooltip="${c.esc(help)}" `,
      )
    : markup;
}
function bindActions(c, root) {
  root.querySelectorAll("[data-action]").forEach(
    (el) =>
      (el.onclick = (e) => {
        stop(e);
        run(c, el.dataset.action);
      }),
  );
}
function cardName(c) {
  const d = cards[c.id];
  return (
    (c.used != null && (c.transmuted || c.element !== d.element)
      ? c.element + " "
      : "") + d.name
  );
}
function effect(c, slot, ctx) {
  const d = cards[c.id],
    f = d.effects || {};
  if (d.charge && c.charge + 1 < d.charge)
    return `Charge · ${d.charge - c.charge} to fire`;
  const matching = matchingNeighbors(ctx.o.battle, c, slot);
  return (
    [
      f.damage || f.hpDamage
        ? damageMarkup(ctx.o.battle, c, slot) +
          (f.growAfterAttack
            ? ` → +${activationGrowth(ctx.o.battle, c, slot)} HP`
            : "")
        : f.randomDamage
          ? "Deal 1–" + f.randomDamage
          : null,
      f.shield
        ? `Shield ${f.shield + (c.upgrade ? d.upgrade?.bonus || 0 : 0) + (f.matchingShield || 0) * matching}${d.name.includes("Shield") && ctx.o.bonuses.shield ? ` <span class="gear-shield-bonus" title="Equipment bonus added on activation">(+${ctx.o.bonuses.shield})</span>` : ""}`
        : null,
      f.ward ? `Ward +${f.ward}` : null,
      f.heal ? `Heal ${f.heal}` : null,
      f.selfGrowth ? `+${f.selfGrowth} HP` : null,
      f.taunt ? "Taunt" : null,
      f.conduit ? "Conduit" : null,
      f.poison ? `Poison ${f.poison}` : null,
      f.burn ? `Burn ${f.burn}` : null,
      f.burnAll ? `Burn ${f.burnAll} to all` : null,
      f.corrode ? `Corrode ${f.corrode}` : null,
      f.channel ? `Channel +${f.channel}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || d.type
  );
}
function remaining(ctx, c, i) {
  return ctx.game.allowance(c, i);
}
function whyDisabled(ctx, c, i) {
  const b = ctx.o.battle,
    d = cards[c.id];
  if (c.zeroWard) return "Ward depleted";
  if (!remaining(ctx, c, i)) return "Activation allowance exhausted";
  if (c.freeze >= b.turn) return "Frozen";
  if (!d.blink && c.lastActivatedTurn === b.turn)
    return "Already activated this turn";
  if (b.reaction) return "Resolve the incoming attack first";
  if (b.phase !== "activate") return "Available during activation";
  if (d.channel > b.channel)
    return `Needs ${d.channel} Channel; ${b.channel} remaining`;
  return "Card condition or target unavailable";
}
let targetingCleanup = null;
let targetingSlot = null;
function clearTargeting() {
  targetingCleanup?.();
  targetingCleanup = null;
  targetingSlot = null;
}
function attunedActivationChooser(ctx, slot, choices, dragging) {
  clearTargeting();
  ctx.close();
  const elements = [...new Set(choices.map((a) => a.element))];
  // A targetless card with no attunement choice retains its one-click activation.
  if (!dragging && choices.length === 1 && choices[0].target == null) {
    run(ctx, choices[0]);
    return;
  }
  targetingSlot = slot;
  const source = ctx.app.querySelector(`[data-slot="${slot}"]`);
  const bar = document.createElement("div");
  bar.className = "targeting-bar";
  bar.setAttribute("role", "status");
  ctx.app.querySelector(".mind").before(bar);
  const controller = new AbortController(),
    signal = controller.signal;
  let element = elements.includes("Arcane") ? "Arcane" : elements[0];
  let options = new Map(),
    dropped = false;
  const filtered = () => choices.filter((a) => a.element === element);
  const preview = targetPreview(ctx, source, slot, (el) => {
    const option = options.get(el);
    return option?.kind === "target"
      ? filtered().find((a) => a.target === option.value)
      : null;
  });
  const choiceAt = (target) =>
    [...options.keys()].find((el) => el === target || el.contains(target));
  function clean() {
    preview.clear();
    for (const el of options.keys()) {
      el.classList.remove("target-option", "target-selected");
      el.removeAttribute("data-target-choice");
    }
    options.clear();
  }
  targetingCleanup = () => {
    controller.abort();
    clean();
    source?.classList.remove("target-source");
    previewElement(ctx, slot);
    inspectLinks(ctx, null);
    bar.remove();
  };
  function commit(target = undefined) {
    if (ctx.busy()) return;
    let candidates = filtered();
    if (candidates.some((a) => a.target != null)) {
      if (target == null) {
        const top = [
          ...ctx.app.querySelectorAll(".enemy[data-enemy-uid]"),
        ].find((el) =>
          candidates.some((a) => a.target === Number(el.dataset.enemyUid)),
        );
        if (!top) return;
        target = Number(top.dataset.enemyUid);
      }
      candidates = candidates.filter((a) => a.target === target);
    }
    if (candidates.length !== 1) return;
    const action = ctx.game.legal().find((a) => a.key === candidates[0].key);
    if (!action) {
      clearTargeting();
      return;
    }
    clearTargeting();
    run(ctx, action);
  }
  function mark(el, kind, value) {
    if (!el) return;
    el.classList.add("target-option");
    el.dataset.targetChoice = kind;
    if (kind === "element" && value === element)
      el.classList.add("target-selected");
    options.set(el, { kind, value });
  }
  function rebuild() {
    clean();
    source?.classList.add("target-source");
    previewElement(ctx, slot, element);
    inspectLinks(ctx, slot);
    const c = ctx.o.battle.grid[slot].at(-1),
      hasTarget = filtered().some((a) => a.target != null);
    bar.innerHTML = `<strong>${cards[c.id].name} · ${element}</strong><span>${hasTarget ? "Choose attunement or enemy · double-click to attack the top enemy" : "Choose attunement, then Activate"}</span><div class="target-elements"></div>${hasTarget ? "" : "<button data-target-activate>Activate</button>"}<button data-target-cancel>Cancel</button>`;
    bar.querySelector("[data-target-cancel]").onclick = clearTargeting;
    const activate = bar.querySelector("[data-target-activate]");
    if (activate) activate.onclick = () => commit();
    if (elements.includes("Arcane")) {
      const neutral = document.createElement("button");
      neutral.textContent = "Unattune";
      neutral.dataset.targetUnattune = "";
      neutral.title = "Use Arcane for this activation";
      bar.querySelector(".target-elements").append(neutral);
      mark(neutral, "element", "Arcane");
    }
    for (const i of ctx.game.neighbors(slot)) {
      const neighbor = ctx.o.battle.grid[i].at(-1);
      const offered = attunementSourceElement(ctx.o.battle, neighbor);
      if (offered !== "Arcane" && elements.includes(offered))
        mark(ctx.app.querySelector(`[data-slot="${i}"]`), "element", offered);
    }
    for (const a of filtered())
      if (a.target != null)
        mark(
          ctx.app.querySelector(`[data-enemy-uid="${a.target}"]`),
          "target",
          a.target,
        );
  }
  function choose(option) {
    if (option.kind === "element") {
      element = option.value;
      rebuild();
    } else commit(option.value);
  }
  ctx.app.addEventListener(
    "click",
    (e) => {
      if (e.target.closest(`[data-activate-slot="${slot}"]`)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      const option = options.get(choiceAt(e.target));
      if (option) {
        e.preventDefault();
        e.stopImmediatePropagation();
        choose(option);
      } else if (!bar.contains(e.target)) clearTargeting();
    },
    { capture: true, signal },
  );
  ctx.app.addEventListener(
    "dblclick",
    (e) => {
      if (!e.target.closest(`[data-activate-slot="${slot}"]`)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      commit();
    },
    { capture: true, signal },
  );
  ctx.app.addEventListener(
    "dragstart",
    () => {
      dropped = false;
    },
    { capture: true, signal },
  );
  ctx.app.addEventListener(
    "dragover",
    (e) => {
      if (drag?.activation !== slot) return;
      const choice = choiceAt(e.target);
      if (choice) e.preventDefault();
      preview.show(choice);
    },
    { capture: true, signal },
  );
  ctx.app.addEventListener("dragleave", preview.leave, {
    capture: true,
    signal,
  });
  ctx.app.addEventListener(
    "dragend",
    () => {
      preview.clear();
      if (!dropped) clearTargeting();
    },
    { capture: true, signal },
  );
  ctx.app.addEventListener(
    "drop",
    (e) => {
      if (drag?.activation !== slot) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const option = options.get(choiceAt(e.target));
      dropped = !!option;
      drag = null;
      preview.clear();
      if (option) choose(option);
      else clearTargeting();
    },
    { capture: true, signal },
  );
  ctx.app.addEventListener(
    "pointerover",
    (e) => {
      if (!drag) preview.show(choiceAt(e.target));
    },
    { capture: true, signal },
  );
  ctx.app.addEventListener("pointerout", preview.leave, {
    capture: true,
    signal,
  });
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        clearTargeting();
      } else if (["Enter", " "].includes(e.key)) {
        const option = options.get(choiceAt(e.target));
        if (option) {
          e.preventDefault();
          e.stopImmediatePropagation();
          choose(option);
        } else if (e.target.closest(`[data-activate-slot="${slot}"]`)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          commit();
        }
      }
    },
    { capture: true, signal },
  );
  rebuild();
}

function activationChooser(ctx, slot, dragging = false) {
  if (ctx.busy()) return;
  if (dragging && targetingSlot === slot) return;
  const choices = ctx.game
    .legal()
    .filter((a) => a.type === "activate" && a.slot === slot);
  if (!choices.length) return;
  if (cards[ctx.o.battle.grid[slot].at(-1).id].attune)
    return attunedActivationChooser(ctx, slot, choices, dragging);
  clearTargeting();
  targetingSlot = slot;
  ctx.close();
  const controller = new AbortController(),
    signal = controller.signal;
  const source = ctx.app.querySelector(`[data-slot="${slot}"]`);
  const bar = document.createElement("div");
  bar.className = "targeting-bar";
  bar.setAttribute("role", "status");
  ctx.app.querySelector(".mind").before(bar);
  let filtered = choices,
    stage,
    options = new Map();
  const selected = new Set();
  const preview = targetPreview(ctx, source, slot, (choice) =>
    stage === "target" && choice
      ? filtered.find((a) => a.target === options.get(choice))
      : null,
  );
  function cleanHighlights() {
    preview.clear();
    ctx.app
      .querySelectorAll(".target-option,.target-source,.target-selected")
      .forEach((el) => {
        el.classList.remove(
          "target-option",
          "target-source",
          "target-selected",
        );
        el.removeAttribute("data-target-choice");
      });
  }
  targetingCleanup = () => {
    controller.abort();
    previewElement(ctx, slot);
    inspectLinks(ctx, null);
    cleanHighlights();
    bar.remove();
  };
  function select(value) {
    if (ctx.busy()) return;
    filtered = filtered.filter((a) => a[stage] === value);
    selected.add(stage);
    rebuild();
  }
  function rebuild() {
    cleanHighlights();
    options = new Map();
    source?.classList.add("target-source");
    stage = null;
    for (const field of [
      "element",
      "cardTarget",
      "newElement",
      "destination",
      "target",
    ]) {
      if (selected.has(field)) continue;
      const values = [...new Set(filtered.map((a) => a[field]))].filter(
        (v) => v != null,
      );
      if (!values.length || (field === "element" && values.length === 1)) {
        selected.add(field);
        continue;
      }
      stage = field;
      break;
    }
    const chosenElements = [...new Set(filtered.map((a) => a.element))].filter(
      Boolean,
    );
    previewElement(
      ctx,
      slot,
      chosenElements.length === 1 ? chosenElements[0] : null,
    );
    inspectLinks(ctx, slot);
    if (!stage) {
      const action = filtered[0];
      clearTargeting();
      if (action && !dragging) run(ctx, action);
      return;
    }
    const label = {
      element: "Choose an attunement card",
      target: "Choose an enemy",
      cardTarget: "Choose a card",
      destination: "Choose an empty slot",
      newElement: "Choose an element",
    }[stage];
    const c = ctx.o.battle.grid[slot].at(-1);
    bar.innerHTML = `<strong>${cards[c.id].name}${selected.has("element") && cards[c.id].attune ? " · " + filtered[0].element : ""}</strong><span>${label}</span><div class="target-elements"></div><button data-target-cancel>Cancel</button>`;
    bar.querySelector("[data-target-cancel]").onclick = clearTargeting;
    const values = [...new Set(filtered.map((a) => a[stage]))];
    const mark = (el, value) => {
      if (!el) return;
      el.classList.add("target-option");
      el.dataset.targetChoice = stage;
      options.set(el, value);
    };
    if (stage === "element") {
      for (const i of ctx.game.neighbors(slot)) {
        const neighbor = ctx.o.battle.grid[i].at(-1);
        const offered = attunementSourceElement(ctx.o.battle, neighbor);
        if (values.includes(offered))
          mark(ctx.app.querySelector(`[data-slot="${i}"]`), offered);
      }
    } else if (stage === "target") {
      for (const value of values)
        mark(ctx.app.querySelector(`[data-enemy-uid="${value}"]`), value);
    } else if (stage === "newElement") {
      for (const value of values) {
        const el = document.createElement("button");
        el.textContent = value;
        bar.querySelector(".target-elements").append(el);
        mark(el, value);
      }
    } else {
      for (const value of values)
        mark(ctx.app.querySelector(`[data-slot="${value}"]`), value);
    }
  }
  const choiceAt = (target) =>
    [...options.keys()].find((el) => el === target || el.contains(target));
  ctx.app.addEventListener(
    "click",
    (e) => {
      // A second click on the activation control belongs to the double-click
      // shortcut, even if the source card is itself a legal target.
      if (e.target.closest(`[data-activate-slot="${slot}"]`)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      const choice = choiceAt(e.target);
      if (choice) {
        e.preventDefault();
        e.stopImmediatePropagation();
        dragging = false;
        select(options.get(choice));
      } else if (e.target.closest(".slot,.enemy")) {
        e.preventDefault();
        e.stopImmediatePropagation();
      } else if (!bar.contains(e.target)) clearTargeting();
    },
    { capture: true, signal },
  );
  ctx.app.addEventListener(
    "dblclick",
    (e) => {
      if (!e.target.closest(`[data-activate-slot="${slot}"]`)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (ctx.busy()) return;
      let candidates = filtered;
      if (stage === "target") {
        // Enemy cards render in top-to-bottom order. Resolve only this choice;
        // attunement, friendly-card targets and destinations stay explicit.
        const topEnemy = [
          ...ctx.app.querySelectorAll(".enemy[data-enemy-uid]"),
        ].find((el) =>
          filtered.some((a) => a.target === Number(el.dataset.enemyUid)),
        );
        if (!topEnemy) return;
        candidates = filtered.filter(
          (a) => a.target === Number(topEnemy.dataset.enemyUid),
        );
      }
      if (candidates.length !== 1) return;
      // Revalidate the complete decision, including any chosen attunement.
      const action = ctx.game.legal().find((a) => a.key === candidates[0].key);
      if (!action) return;
      clearTargeting();
      run(ctx, action);
    },
    { capture: true, signal },
  );
  ctx.app.addEventListener(
    "dragover",
    (e) => {
      if (drag?.activation !== slot) return;
      const choice = choiceAt(e.target);
      if (choice) e.preventDefault();
      preview.show(choice);
    },
    { capture: true, signal },
  );
  ctx.app.addEventListener("dragleave", preview.leave, {
    capture: true,
    signal,
  });
  ctx.app.addEventListener("dragend", preview.clear, { capture: true, signal });
  ctx.app.addEventListener(
    "pointerover",
    (e) => {
      if (!drag) preview.show(choiceAt(e.target));
    },
    { capture: true, signal },
  );
  ctx.app.addEventListener("pointerout", preview.leave, {
    capture: true,
    signal,
  });
  ctx.app.addEventListener(
    "drop",
    (e) => {
      if (drag?.activation !== slot) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const choice = choiceAt(e.target);
      preview.clear();
      drag = null;
      dragging = false;
      if (choice) select(options.get(choice));
      else clearTargeting();
    },
    { capture: true, signal },
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        clearTargeting();
      } else if (["Enter", " "].includes(e.key)) {
        const choice = choiceAt(e.target);
        if (choice) {
          e.preventDefault();
          e.stopImmediatePropagation();
          dragging = false;
          select(options.get(choice));
        }
      }
    },
    { capture: true, signal },
  );
  rebuild();
}
export function showCard(ctx, c, slot = null) {
  const d = cards[c.id],
    b = ctx.game?.s.battle,
    live = c.used != null;
  const allowances = live
    ? remaining(ctx, c, slot)
    : d.limit < 0
      ? Infinity
      : d.limit;
  const format = (n) => (n === Infinity ? "∞" : n);
  const upgrade = d.upgrade
    ? `<h3>Upgrade${c.upgrade ? " · acquired" : ""}</h3><p>${ctx.text(d.upgrade.text)}</p><p>${[d.upgrade.gold ? d.upgrade.gold + " Gold" : null, d.upgrade.hp ? d.upgrade.hp + " HP" : null, d.upgrade.sacrifice ? "Sacrifice another card of equal rarity" : null, d.upgrade.hex ? "Gain " + d.upgrade.hex : null, d.upgrade.element ? "Requires " + d.upgrade.element + " equipment" : null].filter(Boolean).join(" · ")}</p>`
    : "";
  ctx.dialog(
    `<h2>${cardName(c)}${c.upgrade ? " +" : ""}</h2><div class="card-detail">${ctx.img("card-" + c.id, "full-art")}<div><div class="eyebrow">${c.element || d.element} · ${d.type} · ${d.rarity}</div><p>${ctx.text(d.text)}</p><dl class="card-facts"><dt>Focus</dt><dd>${d.focus === 99 ? "Cannot place" : d.focus}</dd><dt>Channel</dt><dd>${d.channel}</dd><dt>Activations</dt><dd>${format(allowances)} / ${d.limit < 0 ? "∞" : live ? ctx.game.allowance({ ...c, used: 0 }, slot) : d.limit}</dd><dt>Per turn</dt><dd>${d.blink ? "Blink · repeat at printed Channel cost" : "Once"}</dd><dt>Recall</dt><dd>${d.recall == null ? "Cannot recall" : d.recall + " Focus"}</dd>${live ? `<dt>Current state</dt><dd>${[c.transmuted || c.element !== d.element ? "Transmuted: " + c.element + (d.attune ? " (replaces Attune)" : "") : null, d.attune && !c.transmuted && c.lastActivatedTurn === b.turn ? "Relays " + c.lastActivationElement + " until next player turn" : null, d.type === "Ally" ? "HP " + c.hp : null, conduitActive(b, c) ? "Conduit: " + defensiveElement(b, c) + " defense; counts as neighboring Blast and Shield until next player turn" : null, c.taunt ? "Taunt" + (c.tauntUntil != null ? " through enemy phase" : "") : null, d.type === "Ward" ? "Ward " + c.ward : null, d.charge ? `Charge ${c.charge}/${d.charge} · ${Math.max(1, d.charge - c.charge)} activation(s) to fire` : null, !d.blink && c.lastActivatedTurn === b.turn ? "Activated this turn" : null, c.lock ? "Locked" : null, c.sever ? "Severed" : null, c.freeze >= b.turn ? "Frozen" : null].filter(Boolean).join(" · ") || "Ready"}</dd>` : ""}</dl>${upgrade}</div></div><div class="card-context"></div>`,
  );
  const context = ctx.modal.querySelector(".card-context");
  if (slot != null) {
    const a = ctx.game
      .legal()
      .filter((a) => a.slot === slot && actTypes.includes(a.type));
    context.innerHTML = `<button data-full-activate ${a.some((a) => a.type === "activate") ? "" : "disabled"} title="${ctx.esc(a.some((a) => a.type === "activate") ? d.text : whyDisabled(ctx, c, slot))}">Activate · ${effect(c, slot, ctx)}</button>${a
      .filter((a) => a.type === "recall")
      .map((a) => button(ctx, a))
      .join("")}`;
    context.querySelector("[data-full-activate]").onclick = () =>
      activationChooser(ctx, slot);
    bindActions(ctx, context);
    const stack = b.grid[slot];
    if (stack.length > 1) {
      const details = document.createElement("details");
      details.innerHTML = `<summary>Stack · ${stack.length} cards</summary>${stack.map((x) => `<button data-stack-card="${x.uid}">${cards[x.id].name} · used ${x.used}</button>`).join("")}`;
      context.append(details);
      details.querySelectorAll("[data-stack-card]").forEach(
        (el) =>
          (el.onclick = () =>
            showCard(
              ctx,
              stack.find((x) => x.uid === Number(el.dataset.stackCard)),
              slot,
            )),
      );
    }
  }
  if (c.uid != null) ctx.modal.classList.add("card-peek");
}
function gearMarkup(ctx, editable = false) {
  const o = ctx.o,
    legal = ctx.actions;
  return `<div class="equipment-slots">${Object.entries(o.equipment)
    .map(([slot, uid]) => {
      const x = o.inventory.find((x) => x.uid === uid),
        d = items[x?.id],
        g = x && o.inventory.find((g) => g.uid === x.gem),
        block =
          o.battle && slot === "torso" && d?.effect.armor
            ? { block: o.battle.armorBlock }
            : o.battle?.bracelets.find((b) => b.uid === uid);
      const canDefend = legal.some(
        (a) => ["bracelet", "armor"].includes(a.type) && a.uid === uid,
      );
      return `<div class="gear-slot ${canDefend ? "defense-ready" : ""}" data-equip-slot="${slot}"><span class="gear-label">${slotNames[slot]}</span><button class="gear-item" ${x ? `data-item-detail="${uid}" data-item-uid="${uid}" draggable="${editable}"` : ""} title="${ctx.esc(d ? d.name + ": " + d.text : "Empty " + slotNames[slot])}">${x ? ctx.img("item-" + x.id) : '<span class="empty-gear">+</span>'}<span>${d?.name || "Empty"}</span>${block ? `<b class="block-left">${block.block} block</b>` : ""}${o.mode === "battle" && d?.effect.firstAttackOnly ? `<b class="block-left ring-trigger">${o.battle.firstAttackTurn === o.battle.turn ? "Spent" : "+2 ready"}</b>` : ""}</button>${d?.socket ? `<button class="gem-socket" data-socket="${uid}" ${g ? `data-gem-drag="${g.uid}" data-setting-drag="${uid}" draggable="${editable}"` : ""} title="${ctx.esc(g ? items[g.id].name + ": " + items[g.id].text : "Empty Gem socket")}">${g ? ctx.img("item-" + g.id) : "◇"}<span>${g ? items[g.id].name : "Socket"}</span></button>` : ""}</div>`;
    })
    .join("")}</div>`;
}
function playerMarkup(ctx, battle = false) {
  return `<section class="player-panel ${battle ? "battle-player" : ""}"><button class="player-portrait" data-player-detail title="Druid · ${ctx.o.hp} / ${ctx.o.maxHp} HP">${ctx.img("location-druid")}<span>Druid <b>${ctx.o.hp}/${ctx.o.maxHp} HP</b></span></button>${gearMarkup(ctx)}<div class="player-status">${Object.entries(
    ctx.o.status,
  )
    .filter(([k, v]) => v)
    .map(([k, v]) => `<span>${k} ${v}</span>`)
    .join("")}</div></section>`;
}
function equipmentBody(ctx) {
  return `${gearMarkup(ctx, true)}<h3 class="stash-label">Satchel</h3><div class="satchel" data-unsocket-drop>${ctx.o.inventory
    .filter(
      (x) =>
        !Object.values(ctx.o.equipment).includes(x.uid) &&
        !ctx.o.inventory.some((g) => g.gem === x.uid),
    )
    .map(
      (x) =>
        `<button class="stash-item" draggable="true" data-item-uid="${x.uid}" data-item-detail="${x.uid}" title="${ctx.esc(items[x.id].text)}">${ctx.img("item-" + x.id)}<span>${items[x.id].name}</span></button>`,
    )
    .join("")}</div>`;
}
function itemDetails(ctx, uid) {
  const x = ctx.o.inventory.find((x) => x.uid === uid);
  if (!x) return;
  const d = items[x.id];
  const choices = ctx.game
    .legal()
    .filter(
      (a) =>
        a.item === uid ||
        (["socket", "unsocket", "sell"].includes(a.type) && a.uid === uid) ||
        (a.type === "socket" && a.gem === uid),
    );
  ctx.dialog(
    `<h2>${d.name}</h2><div class="item-detail">${ctx.img("item-" + x.id, "full-art")}<div><p>${ctx.text(d.text)}</p>${d.forbid ? `<p>Cannot socket: ${d.forbid.map((id) => items[id].name).join(", ")}</p>` : ""}${d.cursed ? `<p class="healer-required" data-tooltip="${healerRequired}">${healerRequired}</p>` : ""}<div class="item-options">${
      ["equip", "unequip", "socket", "unsocket", "sell"]
        .map((type) => {
          const list = choices.filter(
            (a) => a.type === type && !(type === "sell" && d.cursed),
          );
          return list.length
            ? `<details><summary>${{ equip: "Equip", unequip: "Unequip", socket: "Socket", unsocket: "Remove Gem", sell: "Sell / remove" }[type]}</summary>${list.map((a) => button(ctx, a)).join("")}</details>`
            : "";
        })
        .join("") || "<p>No changes available here.</p>"
    }</div></div></div>`,
  );
  bindActions(ctx, ctx.modal);
}
function bindEquipment(ctx, root) {
  root.querySelectorAll("[data-item-detail]").forEach(
    (el) =>
      (el.onclick = (e) => {
        stop(e);
        if (!ctx.busy()) itemDetails(ctx, Number(el.dataset.itemDetail));
      }),
  );
  root
    .querySelectorAll("[data-player-detail]")
    .forEach(
      (el) =>
        (el.onclick = () =>
          ctx.dialog(
            `<h2>The Druid</h2><div class="item-detail">${ctx.img("location-druid", "full-art")}<p>${ctx.o.hp}/${ctx.o.maxHp} HP<br>Insight ${ctx.o.bonuses.insight} · Focus ${ctx.o.bonuses.focus} · Channel ${ctx.o.bonuses.channel}</p></div>`,
          )),
    );
  root.querySelectorAll('[data-item-uid][draggable="true"]').forEach(
    (el) =>
      (el.ondragstart = (e) => {
        drag = { item: Number(el.dataset.itemUid) };
        e.dataTransfer.setData("text/plain", JSON.stringify(drag));
        root.classList.add("dragging-gear");
        markDrops();
      }),
  );
  root.querySelectorAll("[data-gem-drag]").forEach(
    (el) =>
      (el.ondragstart = (e) => {
        stop(e);
        drag = {
          gem: Number(el.dataset.gemDrag),
          setting: Number(el.dataset.settingDrag),
        };
        e.dataTransfer.setData("text/plain", JSON.stringify(drag));
        root.querySelector("[data-unsocket-drop]")?.classList.add("drop-ready");
      }),
  );
  const current = () => ctx.game.legal();
  function dropAction(el) {
    if (!drag) return null;
    if (el.dataset.equipSlot)
      return current().find(
        (a) =>
          a.type === "equip" &&
          a.item === drag.item &&
          a.slot === el.dataset.equipSlot,
      );
    if (el.dataset.socket) {
      const gem = drag.item;
      return current().find(
        (a) =>
          a.type === "socket" &&
          a.uid === Number(el.dataset.socket) &&
          a.gem === gem,
      );
    }
    if (el.hasAttribute("data-unsocket-drop"))
      return current().find(
        (a) =>
          (a.type === "unsocket" && a.uid === drag.setting) ||
          (a.type === "unequip" && a.item === drag.item),
      );
  }
  function markDrops() {
    root
      .querySelectorAll("[data-equip-slot],[data-socket],[data-unsocket-drop]")
      .forEach((el) => el.classList.toggle("drop-ready", !!dropAction(el)));
  }
  root
    .querySelectorAll("[data-equip-slot],[data-socket],[data-unsocket-drop]")
    .forEach((el) => {
      el.ondragover = (e) => {
        if (dropAction(el)) {
          e.preventDefault();
          stop(e);
        }
      };
      el.ondrop = async (e) => {
        e.preventDefault();
        stop(e);
        const a = dropAction(el);
        drag = null;
        if (a) {
          const keepOpen = root === ctx.modal;
          await run(ctx, a);
          if (keepOpen)
            showEquipment({
              ...ctx,
              o: ctx.game.observe(),
              actions: ctx.game.legal(),
            });
        }
      };
    });
  root.querySelectorAll("[data-socket]").forEach(
    (el) =>
      (el.onclick = (e) => {
        stop(e);
        itemDetails(ctx, Number(el.dataset.socket));
      }),
  );
  root.ondragend = () => {
    drag = null;
    root.classList.remove("dragging-gear");
    root
      .querySelectorAll(".drop-ready")
      .forEach((el) => el.classList.remove("drop-ready"));
  };
}
export function showEquipment(ctx) {
  ctx.dialog(`<h2>Equipped</h2>${equipmentBody(ctx)}`);
  bindEquipment(ctx, ctx.modal);
}
function tavern(ctx) {
  const { o, actions, app } = ctx;
  if (o.tutorial?.lesson === "helmet-buy") {
    marketTab = "buy";
    marketCategory.buy = "Equipment";
  }
  const host = app.querySelector(".layout>section");
  const service = ctx.service === "shop" ? "market" : ctx.service;
  const services = [
    ["market", "Market", "Goods & cards", "◈"],
    ["rest", "Innkeeper", "Rest & recovery", "☀"],
    ["equipment", "Jeweler", "Equipment & Gems", "◇"],
    ["grimoire", "Scribe", "Cards & upgrades", "✧"],
    ["gossip", "Traveler", "Rumors", "?"],
    [
      "healer",
      "Healer",
      o.shop.healer ? "Remove afflictions" : "Away today",
      "✚",
    ],
  ];
  host.innerHTML = `<div class="section-head"><div><div class="eyebrow">Shelter beneath the roots</div><h2>The Lantern Rest</h2></div>${actions
    .filter((a) => a.type === "leave")
    .map((a) => button(ctx, a, "primary"))
    .join(
      "",
    )}</div><div class="tavern-scene">${services.map(([id, label, sub, glyph]) => `<button data-tavern="${id}" class="tavern-hotspot hotspot-${id} ${service === id ? "selected" : ""}" title="${sub}"><b>${glyph}</b><span>${label}<small>${sub}</small></span></button>`).join("")}</div><section class="tavern-service"><h3>${services.find((x) => x[0] === service)?.[1] || "Market"}</h3><div class="service-content"></div></section>`;
  host
    .querySelectorAll("[data-tavern]")
    .forEach((el) => (el.onclick = () => ctx.setService(el.dataset.tavern)));
  const content = host.querySelector(".service-content");
  if (service === "equipment") {
    content.innerHTML = `<h3>Equipped</h3>${equipmentBody(ctx)}`;
    bindEquipment(ctx, content);
  } else if (service === "market") {
    content.insertAdjacentHTML(
      "beforebegin",
      `<div class="toolbar market-tabs"><button data-market-tab="buy" class="${marketTab === "buy" ? "active" : ""}">Buy</button><button data-market-tab="sell" class="${marketTab === "sell" ? "active" : ""}">Sell / remove</button></div>`,
    );
    host.querySelectorAll("[data-market-tab]").forEach(
      (el) =>
        (el.onclick = () => {
          marketTab = el.dataset.marketTab;
          ctx.render();
        }),
    );
    if (marketTab === "sell") {
      content.innerHTML = sellCatalog(ctx);
      bindMarketCategories(ctx, content);
      bindCatalog(ctx, content);
      bindActions(ctx, host);
      return;
    }
    const stock = o.shop.stock.map((id, index) => {
      const isCard = id.startsWith("card:"),
        d = isCard ? cards[id.slice(5)] : items[id],
        price = d.worth || { common: 30, rare: 65, legendary: 120 }[d.rarity],
        a = actions.find((a) => a.type === "buy" && a.index === index);
      return { id, index, isCard, d, price, a };
    });
    const cat = marketCategory.buy;
    const entries = stock.filter((x) =>
      cat === "Cards"
        ? x.isCard
        : cat === "Gems"
          ? !x.isCard && x.d.slot === "gem"
          : !x.isCard && x.d.slot !== "gem",
    );
    content.innerHTML = marketCategories(
      "buy",
      ["Cards", "Gems", "Equipment"],
      entries
        .map((x) => {
          const restricted = x.d.cursed || x.d.type === "Hex";
          return `<article class="market-item ${restricted ? "healer-only" : x.a ? "" : "unavailable"}">${ctx.img((x.isCard ? "card-" : "item-") + (x.isCard ? x.id.slice(5) : x.id))}<h4>${x.d.name}</h4><p>${ctx.text(x.d.text)}</p>${restricted ? `<p class="healer-required" data-tooltip="${healerRequired}">${healerRequired}</p>` : ""}<div class="store-controls"><button data-stock-view="${x.index}">View</button>${!restricted && x.a ? button(ctx, { ...x.a, label: "Buy · " + x.price + " Gold" }) : `<button disabled title="${restricted ? healerRequired : `Needs ${x.price} Gold; ${o.gold} available`}">${restricted ? "Buy unavailable" : `Buy · ${x.price} Gold`}</button>`}</div></article>`;
        })
        .join("") || "<p>Sold out</p>",
    );
    bindMarketCategories(ctx, content);
  } else if (service === "grimoire") {
    content.innerHTML = scribeCatalog(ctx);
    bindCatalog(ctx, content);
  } else {
    const types =
      {
        rest: ["heal"],
        gossip: ["gossip"],
        healer: ["removeHex", "sell"],
      }[service] || [];
    const list = actions.filter(
      (a) =>
        types.includes(a.type) &&
        (service !== "healer" || a.type !== "sell" || a.effects.cursed),
    );
    const price = o.shop.hexPrice || {
      kind: "gold",
      gold: o.shop.healerPrice,
      hp: 0,
    };
    const treatment =
      service === "healer" && o.shop.healer
        ? `<p class="treatment-cost">Hex treatment: ${[price.gold ? price.gold + " Gold" : null, price.hp ? price.hp + " HP" : null, price.kind === "allyGold" ? "one Ally card (permanently removed)" : null, price.kind === "item" ? "one item without a socketed Gem (consumed)" : null].filter(Boolean).join(" + ")}.</p>`
        : "";
    content.innerHTML =
      treatment +
      types
        .map((type) => {
          const entries = list.filter((a) => a.type === type);
          return `<details open><summary>${{ heal: "Recover HP", gossip: "Ask about the road", removeHex: "Remove Hex", sell: "Remove Cursed object", upgrade: "Upgrade a card", remove: "Remove a card" }[type]}</summary><div class="choices">${entries.map((a) => button(ctx, a)).join("") || `<p>${service === "healer" && !o.shop.healer ? "No healer is visiting." : "No eligible or affordable choices."}</p>`}</div></details>`;
        })
        .join("");
  }
  bindActions(ctx, host);
  host
    .querySelectorAll("[data-stock-view]")
    .forEach(
      (el) => (el.onclick = () => viewStock(ctx, Number(el.dataset.stockView))),
    );
}
function viewStock(ctx, index) {
  const id = ctx.o.shop.stock[index],
    d = id.startsWith("card:") ? cards[id.slice(5)] : items[id],
    restricted = d.cursed || d.type === "Hex",
    a =
      !restricted &&
      ctx.actions.find((a) => a.type === "buy" && a.index === index);
  if (id.startsWith("card:")) {
    showCard(ctx, { id: id.slice(5) });
    ctx.modal.querySelector(".card-context").innerHTML = a
      ? button(ctx, a, "primary")
      : `<p>${restricted ? healerRequired : "Not enough Gold to buy this card."}</p>`;
  } else {
    const d = items[id];
    ctx.dialog(
      `<h2>${d.name}</h2><div class="item-detail">${ctx.img("item-" + id, "full-art")}<div><p>${ctx.text(d.text)}</p><p>${d.slot} · Worth ${d.worth} Gold</p>${d.forbid ? `<p>Cannot socket: ${d.forbid.map((id) => items[id].name).join(", ")}</p>` : ""}${a ? button(ctx, a, "primary") : `<p>${restricted ? healerRequired : "Not enough Gold to buy this item."}</p>`}</div></div>`,
    );
  }
  bindActions(ctx, ctx.modal);
}
function marketCategories(mode, categories, body) {
  const selected = marketCategory[mode];
  return `<div class="market-categories" role="tablist" aria-label="${mode === "buy" ? "Buy categories" : "Sell categories"}">${categories.map((cat) => `<button role="tab" id="market-${mode}-${cat}" data-market-category="${cat}" aria-selected="${cat === selected}" aria-controls="market-catalog" tabindex="${cat === selected ? 0 : -1}">${cat}</button>`).join("")}</div><section id="market-catalog" role="tabpanel" aria-labelledby="market-${mode}-${selected}" tabindex="0">${mode === "sell" && selected === "Grimoire" ? '<p class="catalog-note">One paid card removal per Tavern.</p>' : ""}<div class="market-stock">${body}</div></section>`;
}
function bindMarketCategories(ctx, root) {
  const tabs = [...root.querySelectorAll("[data-market-category]")];
  for (const el of tabs) {
    el.onclick = () => {
      marketCategory[marketTab] = el.dataset.marketCategory;
      ctx.render();
      ctx.tutorialSignal?.("market:" + el.dataset.marketCategory);
    };
    el.onkeydown = (e) => {
      const i = tabs.indexOf(el);
      const next =
        e.key === "ArrowRight"
          ? (i + 1) % tabs.length
          : e.key === "ArrowLeft"
            ? (i + tabs.length - 1) % tabs.length
            : e.key === "Home"
              ? 0
              : e.key === "End"
                ? tabs.length - 1
                : null;
      if (next == null) return;
      e.preventDefault();
      const category = tabs[next].dataset.marketCategory;
      tabs[next].click();
      ctx.app.querySelector(`[data-market-category="${category}"]`)?.focus();
    };
  }
}
function scribeCatalog(ctx) {
  const { o, actions } = ctx;
  return `<div class="market-stock scribe-stock">${
    o.deck
      .map((c) => {
        const d = cards[c.id],
          u = d.upgrade,
          restricted = d.type === "Hex";
        const offers = restricted
          ? []
          : actions.filter((a) => a.type === "upgrade" && a.uid === c.uid);
        const requirements = u
          ? [
              u.gold ? `${u.gold} Gold` : null,
              u.hp ? `${u.hp} HP (must survive)` : null,
              u.element ? `an equipped ${u.element}-imbued Setting` : null,
              u.sacrifice ? `another ${d.rarity} card as a sacrifice` : null,
            ]
              .filter(Boolean)
              .join(" + ")
          : "";
        const reason = restricted
          ? healerRequired
          : c.upgrade
            ? "Already upgraded"
            : !u
              ? "No upgrade available"
              : o.tutorial
                ? "Not available in this tutorial lesson"
                : `Requires ${requirements}`;
        const controls = offers.map((a) => button(ctx, a)).join("");
        return `<article class="market-item ${restricted ? "healer-only" : offers.length ? "" : "unavailable"}" data-scribe-card="${c.uid}">${ctx.img("card-" + c.id)}<h4>${d.name}${c.upgrade ? " +" : ""}</h4><p>${ctx.text(d.text)}</p>${restricted ? `<p class="healer-required" data-tooltip="${healerRequired}">${healerRequired}</p>` : u ? `<p data-tooltip="${ctx.esc(upgradeHelp(d))}">${ctx.text(upgradeHelp(d))}</p>` : ""}<div class="store-controls"><button data-owned-card="${c.uid}">View</button>${offers.length > 1 ? `<details><summary>Choose upgrade sacrifice</summary>${controls}</details>` : controls || `<button disabled title="${ctx.esc(reason)}" data-tooltip="${ctx.esc(reason)}">${c.upgrade ? "Upgraded" : "Upgrade unavailable"}</button>`}</div></article>`;
      })
      .join("") || "<p>No cards in your Grimoire.</p>"
  }</div>`;
}
function sellCatalog(ctx) {
  const { o, actions } = ctx;
  const body =
    marketCategory.sell === "Equipment"
      ? o.inventory
          .map((x) => {
            const d = items[x.id],
              a =
                !d.cursed &&
                actions.find((a) => a.type === "sell" && a.uid === x.uid),
              gem = o.inventory.find((g) => g.uid === x.gem),
              setting = o.inventory.find((i) => i.gem === x.uid),
              equipped =
                !!setting || Object.values(o.equipment).includes(x.uid);
            return `<article class="market-item ${d.cursed ? "healer-only" : ""} ${equipped ? "market-equipped" : ""}" data-catalog-item="${x.uid}">${equipped ? '<span class="equipped-label">Equipped</span>' : ""}${ctx.img("item-" + x.id)}<h4>${d.name}</h4><p>${ctx.text(d.text)}${gem ? "<br>Socket: " + items[gem.id].name : ""}${setting ? "<br>Socketed in " + items[setting.id].name : ""}</p>${d.cursed ? `<p class="healer-required" data-tooltip="${healerRequired}">${healerRequired}</p>` : ""}<div class="store-controls"><button data-owned-view="${x.uid}">View</button>${a ? button(ctx, a) : `<button disabled title="${d.cursed ? healerRequired : "Sale unavailable during this tutorial lesson"}">Sell unavailable</button>`}</div></article>`;
          })
          .join("")
      : o.deck
          .map((c) => {
            const d = cards[c.id],
              restricted = d.type === "Hex",
              a =
                !restricted &&
                actions.find((a) => a.type === "remove" && a.uid === c.uid);
            return `<article class="market-item ${restricted ? "healer-only" : ""}" data-catalog-card="${c.uid}">${ctx.img("card-" + c.id)}<h4>${d.name}${c.upgrade ? " +" : ""}</h4><p>${ctx.text(d.text)}</p>${restricted ? `<p class="healer-required" data-tooltip="${healerRequired}">${healerRequired}</p>` : ""}<div class="store-controls"><button data-owned-card="${c.uid}">View</button>${a ? button(ctx, a) : `<button disabled title="${restricted ? healerRequired : o.shop.removeUsed ? "Removal already used at this Tavern" : "Needs 40 Gold"}">${restricted ? "Removal unavailable" : o.shop.removeUsed ? "Removal used" : "Remove unavailable"}</button>`}</div></article>`;
          })
          .join("");
  return marketCategories(
    "sell",
    ["Grimoire", "Equipment"],
    body || "<p>No belongings in this category.</p>",
  );
}
function bindCatalog(ctx, root) {
  root
    .querySelectorAll("[data-owned-view]")
    .forEach(
      (el) =>
        (el.onclick = () => itemDetails(ctx, Number(el.dataset.ownedView))),
    );
  root.querySelectorAll("[data-owned-card]").forEach(
    (el) =>
      (el.onclick = () =>
        showCard(
          ctx,
          ctx.o.deck.find((c) => c.uid === Number(el.dataset.ownedCard)),
        )),
  );
}
function incomingDetails(ctx) {
  const h = ctx.o.battle.reaction;
  if (!h) return;
  const source = ctx.o.battle.enemies.find((e) => e.uid === h.source);
  const choices = ctx.actions
    .map((a) => {
      let note = "";
      if (["block", "bracelet"].includes(a.type)) {
        const result = blockHit(
          a.effects.block,
          a.effects.element,
          h.damage,
          h.element,
        );
        note = ` → ${result.remaining} damage continues`;
      }
      if (a.type === "armor")
        note = ` → ${a.effects.reflect ? 0 : Math.max(0, h.damage - a.effects.armor)} damage continues`;
      if (a.type === "ward")
        note = ` → ${Math.max(0, h.damage - a.effects.ward)} damage continues`;
      if (a.type === "intercept") {
        const result = allyHit(
          h,
          a.effects.element,
          a.effects.allyHp,
          a.effects.swallow,
        );
        note = ` → ${result.absorbed} Ally HP, ${result.remaining} base damage continues${result.weaknessBonus ? ` + ${result.weaknessBonus} bonus only against ${result.weaknessElement}` : ""}`;
      }
      return button(ctx, { ...a, label: a.label + note });
    })
    .join("");
  ctx.dialog(
    `<h2>${h.name}</h2><p>${source?.name || "Status"} → Druid</p><p class="attack-number">${incomingDamageText(h)}</p><p>Choose a highlighted card or equipment. After a card blocks, only its column and columns closer to you remain eligible. Armor and Bracelets share the equipment stop; Take hit skips all unused defenses, including Armor.</p><div class="choices">${choices}</div>`,
  );
  bindActions(ctx, ctx.modal);
}
export function enhance(ctx) {
  clearTargeting();
  const { o, actions, app, game } = ctx;
  const sidebar = app.querySelector(".sidebar");
  if (sidebar) {
    const gate = Array.from(sidebar.children).find((el) =>
      el.textContent.includes("The gatekeeper"),
    );
    const log = sidebar.querySelector(".log");
    const ai = sidebar.lastElementChild;
    sidebar.innerHTML = "";
    if (o.mode !== "battle")
      sidebar.insertAdjacentHTML("beforeend", playerMarkup(ctx));
    if (gate) {
      const detail = document.createElement("details");
      detail.className = "gate-detail";
      detail.innerHTML =
        "<summary>Archon · " + (o.archon || "Unknown") + "</summary>";
      detail.append(gate);
      sidebar.append(detail);
    }
    if (log) {
      const detail = document.createElement("details");
      detail.innerHTML = "<summary>Recent events</summary>";
      detail.append(log);
      sidebar.append(detail);
    }
    if (ai) {
      const botbar = ai.querySelector(".botbar");
      if (botbar?.textContent.startsWith("The AI uses")) botbar.remove();
      sidebar.append(ai);
    }
    sidebar.insertAdjacentHTML(
      "beforeend",
      `<label class="speed-control"><input data-fast type="checkbox" ${ctx.settings.fast ? "checked" : ""}> Fast animations</label>`,
    );
  }
  app.querySelector("[data-fast]")?.addEventListener("change", (e) => {
    ctx.settings.fast = e.target.checked;
    ctx.saveSettings();
  });
  if (o.mode === "field") {
    app.querySelectorAll(".tile").forEach((el, i) => {
      el.dataset.cell = i;
      const x = i % 11,
        y = Math.floor(i / 11),
        foe = fieldEntitiesAt(o.field, x, y).find((e) => e.enemy);
      if (foe) el.querySelector("img")?.setAttribute("data-token", foe.uid);
      el.querySelector(".player-mark")?.setAttribute("data-player-token", "");
      const entity = o.field.entities.find(
        (e) => !e.enemy && e.x === x && e.y === y,
      );
      if (entity) {
        const glyph = el.querySelector(".glyph");
        if (glyph) {
          glyph.classList.add("glyph-" + entity.type);
          glyph.innerHTML += `<small>${entity.type}</small>`;
        }
      }
    });
    app.querySelector(".field-wrap>small")?.remove();
  }
  if (o.mode === "battle") {
    const b = o.battle;
    app
      .querySelectorAll(".enemy")
      .forEach((el, i) => (el.dataset.enemyUid = b.enemies[i].uid));
    const section = app.querySelector(".mind").parentElement;
    const hand = app.querySelector(".hand");
    if (hand && sidebar) {
      const wrap = document.createElement("section");
      wrap.className = "revealed-hand";
      wrap.innerHTML = '<div class="eyebrow">Revealed cards</div>';
      wrap.append(hand);
      sidebar.prepend(wrap);
    }
    section.insertAdjacentHTML("beforeend", playerMarkup(ctx, true));
    app.querySelectorAll(".resources>span").forEach((el, i) => {
      el.classList.toggle("depleted", !b[["insight", "focus", "channel"][i]]);
      const active =
        !b.reaction && b.phase === ["start", "place", "activate"][i];
      el.classList.toggle("resource-active", active);
      if (active) el.setAttribute("aria-current", "step");
    });
    const placement = actions.some((a) => a.type === "place"),
      activation = actions.some((a) => a.type === "activate");
    app.querySelectorAll("[data-action]").forEach((el) => {
      const a = actions.find((a) => a.key === el.dataset.action);
      if (
        a &&
        ((a.type === "activatePhase" && (b.focus <= 0 || !placement)) ||
          (a.type === "endTurn" && (b.channel <= 0 || !activation)))
      )
        el.classList.add("next-choice");
    });
    app.querySelectorAll("[data-hand]").forEach((el) => {
      const c = b.hand.find((c) => c.uid === Number(el.dataset.hand)),
        d = cards[c.id],
        legal = actions.some((a) => a.type === "place" && a.uid === c.uid),
        cost = d.focus + (b.milky ? 1 : 0);
      el.classList.toggle("unavailable", !legal);
      el.dataset.placementDisabled = String(!legal);
      el.draggable = legal;
      el.title = legal
        ? d.text
        : d.unplaceable
          ? "Cannot be placed"
          : b.phase !== "place"
            ? "Placement has ended"
            : cost > b.focus
              ? `Needs ${cost} Focus; ${b.focus} remaining`
              : "No legal slot";
      el.querySelector(".cost").textContent = d.focus === 99 ? "—" : cost;
      el.onclick = () => {
        if (ctx.busy()) return;
        ctx.select(legal ? c.uid : null);
        ctx.render();
        showCard(ctx, c);
      };
      el.ondragstart = (e) => {
        drag = { card: c.uid };
        ctx.select(c.uid);
        e.dataTransfer.setData("text/plain", JSON.stringify(drag));
        app.querySelectorAll("[data-slot]").forEach((slot) =>
          slot.classList.toggle(
            "valid",
            actions.some(
              (a) =>
                a.type === "place" &&
                a.uid === c.uid &&
                a.slot === Number(slot.dataset.slot),
            ),
          ),
        );
      };
      el.ondragend = () => {
        drag = null;
        app
          .querySelectorAll(".slot.valid")
          .forEach((el) => el.classList.remove("valid"));
      };
    });
    app.querySelectorAll("[data-slot]").forEach((old) => {
      const i = Number(old.dataset.slot),
        c = b.grid[i].at(-1),
        el = document.createElement("div");
      el.className = old.className;
      el.dataset.slot = i;
      el.innerHTML = old.innerHTML;
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.setAttribute(
        "aria-label",
        c ? cardName(c) + " · full details" : "Slot " + (i + 1),
      );
      old.replaceWith(el);
      if (c) {
        const d = cards[c.id],
          left = remaining(ctx, c, i),
          can = actions.some((a) => a.type === "activate" && a.slot === i);
        el.querySelector(".name").textContent =
          cardName(c) + (c.upgrade ? " +" : "");
        el.dataset.element = c.element;
        const badges = statusBadges(ctx, c, i);
        if (badges) {
          el.classList.add("has-statuses");
          el.insertAdjacentHTML("beforeend", badges);
          el.style.setProperty(
            "--status-rows",
            Math.ceil(el.querySelectorAll(".card-status").length / 3),
          );
        }
        const nums = el.querySelector(".nums");
        nums.innerHTML = `${d.type === "Ward" ? "Ward " + c.ward + " · " : ""}<b>${left === Infinity ? "∞" : left}/${d.limit < 0 ? "∞" : ctx.game.allowance({ ...c, used: 0 }, i)} acts</b>`;
        if (d.type === "Ally") {
          const maximum = Math.max(
            c.hp,
            c.maxHp || d.hp + (c.upgrade ? d.upgrade?.bonus || 0 : 0),
          );
          const ratio = Math.max(0, c.hp / maximum);
          el.classList.add("ally-slot");
          nums.insertAdjacentHTML(
            "afterbegin",
            `<div class="ally-health ${ratio <= 0.3 ? "critical" : ratio <= 0.6 ? "wounded" : ""}" role="meter" aria-label="${ctx.esc(d.name)} health" aria-valuemin="0" aria-valuemax="${maximum}" aria-valuenow="${Math.max(0, c.hp)}"><i style="width:${ratio * 100}%"></i><span>${c.hp} / ${maximum} HP</span></div>`,
          );
        }
        el.draggable = can;
        el.ondragstart = (e) => {
          if (ctx.busy() || !can) {
            e.preventDefault();
            return;
          }
          drag = { activation: i };
          e.dataTransfer.setData("text/plain", JSON.stringify(drag));
          activationChooser(ctx, i, true);
        };
        el.ondragend = () => {
          drag = null;
        };
        el.insertAdjacentHTML(
          "beforeend",
          `<button class="slot-activate ${can ? "available" : ""}" data-activate-slot="${i}" aria-disabled="${!can}" title="${ctx.esc(can ? d.text : whyDisabled(ctx, c, i))}">Activate · ${effect(c, i, ctx)}</button>`,
        );
        const activationChoices = actions.filter(
          (a) => a.type === "activate" && a.slot === i,
        );
        if (
          activationChoices.length === 1 &&
          ["target", "cardTarget", "destination", "newElement"].some(
            (k) => activationChoices[0][k] != null,
          )
        )
          el.querySelector(".slot-activate").title +=
            " Double-click to apply to the only legal target.";
        el.querySelector(".slot-activate").onclick = (e) => {
          stop(e);
          if (!ctx.busy() && can && e.detail < 2) activationChooser(ctx, i);
        };
      }
      el.onclick = (e) => {
        if (ctx.busy()) return;
        const a = game
          .legal()
          .find(
            (a) =>
              a.type === "place" &&
              a.slot === i &&
              app
                .querySelector(`[data-hand="${a.uid}"]`)
                ?.classList.contains("selected"),
          );
        if (a && !(game.s.tutorial?.lesson === "shield-place" && e.detail > 0))
          run(ctx, a);
        else if (c) showCard(ctx, c, i);
      };
      el.onkeydown = (e) => {
        if (e.target === el && ["Enter", " "].includes(e.key)) {
          e.preventDefault();
          el.click();
        }
      };
      el.ondragover = (e) => {
        if (
          drag?.card &&
          actions.some(
            (a) => a.type === "place" && a.uid === drag.card && a.slot === i,
          )
        ) {
          e.preventDefault();
          el.classList.add("drop-ready");
        }
      };
      el.ondragleave = () => el.classList.remove("drop-ready");
      el.ondrop = (e) => {
        e.preventDefault();
        const a = actions.find(
          (a) => a.type === "place" && a.uid === drag?.card && a.slot === i,
        );
        drag = null;
        if (a) run(ctx, a);
      };
    });
    const hints = section.querySelectorAll(".row.spread>small");
    hints.forEach((el) => {
      if (
        el.textContent.startsWith("Choose a revealed") ||
        el.textContent.startsWith("Click a placed")
      )
        el.textContent =
          b.phase === "place"
            ? "Placement"
            : activation
              ? "Activation"
              : "No activations available";
    });
    if (b.reaction) {
      const box = section.querySelector(".incoming-attack");
      if (box) {
        box.classList.add("incoming-attack");
        box.insertAdjacentHTML(
          "afterbegin",
          '<button class="inspect-attack">Incoming attack ↘</button>',
        );
        box.querySelector(".inspect-attack").onclick = () =>
          incomingDetails(ctx);
        box
          .querySelectorAll("[data-action]")
          .forEach((el) => (el.onclick = () => run(ctx, el.dataset.action)));
      }
    }
  }
  if (o.mode === "event") {
    eventTrades(ctx);
    const scene = app.querySelector(".scene");
    scene?.insertAdjacentHTML(
      "beforeend",
      `<aside class="event-gear">${playerMarkup(ctx)}</aside>`,
    );
  }
  if (o.mode === "tavern") tavern(ctx);
  if (o.mode === "reward" || o.mode === "item") {
    const title = app.querySelector(".layout>section>h2");
    title?.insertAdjacentHTML(
      "afterend",
      `<p class="reward-rule">${o.reward?.cards ? "Choose ONE card · the other cards are left behind" : o.mode === "item" ? "Collect or leave this item" : o.reward?.gem || o.reward?.setting ? "Your reward · collect this item" : "All rewards collected"}</p>`,
    );
    app.querySelectorAll(".catalog [data-action]").forEach((el) => {
      const a = actions.find((a) => a.key === el.dataset.action);
      if (a)
        el.textContent =
          a.type === "rewardCard" ? "Choose this card" : "Collect";
    });
  }
  bindEquipment(ctx, app);
  if (o.mode === "battle") {
    arrangeBattle(ctx);
    boardInteractions(ctx);
    gridTelegraphs(ctx);
    if (o.battle.reaction) {
      const b = o.battle;
      app.querySelectorAll("[data-slot]").forEach((el) => {
        const i = Number(el.dataset.slot),
          c = b.grid[i].at(-1);
        if (!c) return;
        const options = () =>
          game
            .legal()
            .filter(
              (a) =>
                ["ward", "block", "intercept"].includes(a.type) && a.slot === i,
            );
        const available = options();
        const tutorialWaiting =
          o.tutorial &&
          !available.length &&
          game
            .baseLegal()
            .some(
              (a) =>
                ["ward", "block", "intercept"].includes(a.type) && a.slot === i,
            );
        const control = el.querySelector(".slot-activate");
        if (control) {
          control.textContent = available.length
            ? "Defend"
            : tutorialWaiting
              ? "Later in lesson"
              : "Cannot defend";
          control.classList.toggle("available", !!available.length);
          control.setAttribute("aria-disabled", !available.length);
          control.removeAttribute("data-activate-slot");
        }
        const defend = (e) => {
          e?.stopPropagation();
          if (ctx.busy()) return;
          const choices = options();
          if (choices.length === 1) {
            run(ctx, choices[0]);
            return;
          }
          if (!choices.length) return;
          // Only mixed portions/covered Wards need a second choice, beside their card.
          app.querySelectorAll(".defense-options").forEach((x) => x.remove());
          const menu = document.createElement("div");
          menu.className = "defense-options";
          menu.innerHTML =
            choices.map((a) => button(ctx, a)).join("") +
            "<button data-defense-cancel>Cancel</button>";
          menu.onclick = (e) => e.stopPropagation();
          el.append(menu);
          menu.querySelectorAll("[data-action]").forEach(
            (btn) =>
              (btn.onclick = (e) => {
                stop(e);
                run(ctx, btn.dataset.action);
              }),
          );
          menu.querySelector("[data-defense-cancel]").onclick = (e) => {
            stop(e);
            menu.remove();
          };
        };
        el.onclick = available.length
          ? defend
          : () => {
              if (!ctx.busy()) showCard(ctx, c, i);
            };
        if (control) control.onclick = defend;
        el.classList.toggle("defense-ready", !!available.length);
        const passed =
          b.reaction.column != null && i % b.columns > b.reaction.column;
        el.classList.toggle("defense-passed", passed);
        el.setAttribute(
          "aria-label",
          cardName(c) +
            (available.length
              ? " · Click to defend"
              : passed
                ? " · Attack has passed this column"
                : " · Cannot defend this hit"),
        );
        if (control)
          control.title = available.length
            ? "Click to absorb this hit. It cannot travel back toward the enemy."
            : passed
              ? "The attack has passed this column."
              : tutorialWaiting
                ? "Follow the highlighted defense for this lesson."
                : "No eligible defense against this hit.";
        const view = document.createElement("button");
        view.className = "defense-view";
        view.textContent = "View";
        view.setAttribute("aria-label", "View " + cardName(c));
        view.onclick = (e) => {
          stop(e);
          if (!ctx.busy()) showCard(ctx, c, i);
        };
        el.append(view);
      });
    }
    const hit = o.battle.reaction,
      node = hit?.lastNode;
    if (
      hit?.damage > 0 &&
      !hit.statusHit &&
      ["card", "item"].includes(node?.kind)
    ) {
      const anchor =
        node.kind === "card"
          ? app.querySelector(`[data-slot="${node.slot}"]`)
          : app.querySelector(
              `.battle-player .gear-item[data-item-uid="${node.uid}"]`,
            );
      if (anchor) {
        const held = attackOrb(hit.damage, hit.element);
        anchor.append(held);
      }
    }
  }
  if (ctx.frame) {
    app
      .querySelectorAll("button,select,input")
      .forEach((el) => (el.disabled = true));
  }
}
