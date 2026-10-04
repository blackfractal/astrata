import { bossDestruction, collapseFlight } from "./boss-effects.mjs";
import { stageBounds } from "./stage.mjs";
import {
  spellImpact,
  impactStyles,
  attackOrb,
  statusVisual,
} from "./impact-effects.mjs";
import { installKeywordHelp } from "./keywords.mjs";
import { artPaths } from "./art-paths.mjs";
export function installTooltips() {
  installKeywordHelp();
  const tip = document.createElement("div");
  tip.id = "hover-help";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  document.body.append(tip);
  let timer;
  const hide = () => {
    tip.hidden = true;
    clearTimeout(timer);
  };
  function show(e) {
    const el =
      e.target.closest?.("[data-upgrade-preview]") ||
      e.target.closest?.("[title],[data-tooltip]");
    if (!el) return;
    const value = el.getAttribute("title") || el.dataset.tooltip;
    if (!value) return;
    if (el.hasAttribute("title")) {
      el.dataset.tooltip = value;
      el.removeAttribute("title");
    }
    hide();
    tip.textContent = value;
    tip.hidden = false;
    const r = el.getBoundingClientRect();
    const bounds = stageBounds();
    tip.style.left =
      Math.max(
        bounds.left + 8,
        Math.min(bounds.left + bounds.width - tip.offsetWidth - 8, r.left),
      ) + "px";
    tip.style.top =
      Math.max(
        bounds.top + 8,
        Math.min(
          bounds.top + bounds.height - tip.offsetHeight - 8,
          r.bottom + 8,
        ),
      ) + "px";
    timer = setTimeout(hide, 4000);
  }
  document.addEventListener("pointerover", show);
  document.addEventListener("focusin", show);
  document.addEventListener("pointerout", hide);
  document.addEventListener("focusout", hide);
  document.addEventListener("pointerdown", hide);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide();
  });
}
export async function playFrames(before, frames, after, render, isFast) {
  if (!frames.length && before.mode === after.mode) return;
  const bar = document.createElement("div");
  bar.className = "presentation-bar";
  bar.innerHTML =
    "<span>Resolving…</span><button data-speed>Fast</button><button data-skip>Skip</button>";
  document.body.append(bar);
  let skip = false,
    fast = false,
    previous = before,
    source = before.battle?.reaction?.source
      ? {
          enemy: before.battle.reaction.source,
          element: before.battle.reaction.element,
        }
      : null;
  bar.querySelector("[data-skip]").onclick = () => (skip = true);
  bar.querySelector("[data-speed]").onclick = () => {
    fast = !fast;
    bar.querySelector("[data-speed]").textContent = fast ? "Normal" : "Fast";
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ms = (n) =>
    skip
      ? 0
      : fast || isFast()
        ? Math.max(35, n * 0.16)
        : reduced
          ? Math.min(n, 250)
          : n;
  async function pause(n) {
    const deadline = performance.now() + ms(n);
    while (!skip && performance.now() < deadline)
      await new Promise((r) => setTimeout(r, 25));
  }
  const find = (q) => document.querySelector(q);
  const enemy = (uid) => find(`[data-enemy-uid="${uid}"]`);
  const card = (i) => find(`[data-slot="${i}"]`);
  const player = () =>
    find(".battle-player .player-portrait") || find(".player-portrait");
  const item = (uid) =>
    find(`.battle-player .gear-item[data-item-uid="${uid}"]`) ||
    find(`[data-item-detail="${uid}"]`);
  const pathNode = (node) =>
    node?.kind === "enemy"
      ? enemy(node.uid)
      : node?.kind === "card"
        ? card(node.slot)
        : node?.kind === "item"
          ? item(node.uid)
          : node?.kind === "player"
            ? player()
            : null;
  function floating(el, label, cls = "") {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const tag = document.createElement("div");
    tag.className = "impact-number " + cls;
    tag.textContent = label;
    tag.style.left = r.left + r.width / 2 + "px";
    tag.style.top = r.top + r.height / 2 + "px";
    document.body.append(tag);
    return tag;
  }
  async function flash(
    el,
    label,
    dead = false,
    from = null,
    element = null,
    attack = null,
    boost = null,
    revealTarget = true,
  ) {
    // Reveal the acting/struck foe inside crowded encounters without moving the stage.
    for (const node of revealTarget ? [from, el] : []) {
      if (node?.matches(".enemy")) {
        const panel = node.closest(".enemy-line"),
          r = node.getBoundingClientRect(),
          b = panel?.getBoundingClientRect();
        if (b && (r.top < b.top || r.bottom > b.bottom))
          panel.scrollTop +=
            (r.top < b.top ? r.top - b.top : r.bottom - b.bottom) /
            stageBounds().scale;
      }
    }
    let projectile;
    if (el && from && from !== el && !reduced) {
      const a = from.getBoundingClientRect(),
        b = el.getBoundingClientRect();
      projectile = attack
        ? attackOrb(attack.incoming, element)
        : document.createElement("div");
      projectile.classList.add("attack-bolt");
      if (boost) {
        projectile.classList.add("gear-power-sphere");
        projectile.dataset.sourceItem = boost.sourceItem;
        projectile.dataset.targetSlot = boost.slot;
      }
      projectile.dataset.effect = element || "Arcane";
      if (attack) {
        projectile.classList.add("attack-orb-overlay");
        projectile.style.setProperty("--orb-scale", stageBounds().scale);
      }
      projectile.style.setProperty(
        "--hit-color",
        (impactStyles[element] || impactStyles.Arcane).color,
      );
      document.body.append(projectile);
      const animation = projectile.animate(
        [
          {
            left: a.left + a.width / 2 + "px",
            top: a.top + a.height / 2 + "px",
            opacity: 1,
          },
          {
            left: b.left + b.width / 2 + "px",
            top: b.top + b.height / 2 + "px",
            opacity: 1,
          },
        ],
        { duration: ms(350), fill: "forwards", easing: "ease-in" },
      );
      await Promise.race([animation.finished, pause(350)]);
      projectile.remove();
    }
    if (skip) return;
    // Arrive in the same paint as the hit burst, before its pause or disintegration.
    // A viewport overlay stays visible even while the struck card fades underneath.
    if (el && attack?.remaining > 0) {
      const r = el.getBoundingClientRect();
      const orb = attackOrb(attack.remaining, element);
      orb.classList.add("attack-orb-overlay");
      orb.style.left = r.left + r.width / 2 + "px";
      orb.style.top = r.top + r.height / 2 + "px";
      orb.style.setProperty("--orb-scale", stageBounds().scale);
      document.body.append(orb);
    }
    const burst = element
      ? spellImpact(el, element, { duration: ms(500), reduced })
      : null;
    el?.classList.add("impact");
    const tag = floating(el, label, attack ? "attack-impact-number" : "");
    if (tag && Object.values(statusVisual).includes(element)) {
      tag.classList.add("status-impact-number");
      tag.style.top = parseFloat(tag.style.top) - 55 + "px";
    }
    await pause(550);
    el?.classList.remove("impact");
    tag?.remove();
    burst?.remove();
    if (skip) return;
    if (dead && el) {
      el.classList.add("disintegrating");
      await pause(600);
    }
  }
  try {
    render(before);
    for (let frameIndex = 0; frameIndex < frames.length; frameIndex++) {
      const frame = frames[frameIndex];
      if (skip) break;
      bar.querySelector("span").textContent =
        frame.kind === "move"
          ? "Movement"
          : frame.name ||
            {
              incoming: "Incoming attack",
              hit: "Damage",
              defend: "Defense",
              activate: "Activation",
            }[frame.kind] ||
            "Resolving";
      if (frame.parallelGroup != null) {
        // Damage still resolves in engine order. Animate different targets together,
        // keeping each target's follow-up Ring hit/status in its original order.
        const batch = [frame];
        while (frames[frameIndex + 1]?.parallelGroup === frame.parallelGroup)
          batch.push(frames[++frameIndex]);
        const lanes = new Map();
        for (const hit of batch) {
          if (!lanes.has(hit.uid)) lanes.set(hit.uid, []);
          lanes.get(hit.uid).push(hit);
        }
        await Promise.all(
          [...lanes.values()].map(async (hits) => {
            for (const hit of hits) {
              if (skip) break;
              const from =
                hit.sourceItem != null
                  ? item(hit.sourceItem) || player()
                  : card(hit.sourceSlot);
              if (hit.sourceItem != null) from?.classList.add("gear-proc");
              try {
                await flash(
                  enemy(hit.uid),
                  hit.kind === "status" ? hit.name : "−" + hit.amount,
                  hit.dead,
                  from,
                  hit.kind === "status"
                    ? statusVisual[hit.statusEffect]
                    : hit.element,
                  null,
                  null,
                  false,
                );
              } finally {
                if (hit.sourceItem != null) from?.classList.remove("gear-proc");
              }
            }
          }),
        );
        // Keep all targets mounted until every projectile, hit and death finishes.
        previous = batch.at(-1).state;
        render(previous);
        continue;
      } else if (frame.kind === "reveal") {
        const masked = structuredClone(frame.state);
        masked.battle.phase = "start";
        masked.battle.insight =
          frame.insight ??
          masked.battle.revealInsight ??
          masked.battle.hand.length;
        render(masked);
        const hand = [
          ...document.querySelectorAll(".revealed-hand [data-hand]"),
        ];
        for (const el of hand) {
          el.classList.remove("unavailable");
          el.classList.add("deal-card", "face-down");
          el.style.visibility = "hidden";
          el.removeAttribute("title");
          el.removeAttribute("data-tooltip");
          el.setAttribute("aria-label", "Face-down card");
          const back = document.createElement("div");
          back.className = "reveal-back";
          back.setAttribute("aria-hidden", "true");
          back.innerHTML = `<svg class="druid-seal" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" stroke-width="1"/>
            <circle cx="50" cy="50" r="37" fill="none" stroke="currentColor" stroke-width=".5" stroke-dasharray="2 5"/>
            <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M50 76V25 M50 52L32 38V27 M50 52L68 38V27 M50 65L25 52V40 M50 65L75 52V40 M50 74L35 83 M50 74L65 83 M50 74V87"/>
              <path d="M32 38L21 33 M68 38L79 33 M25 52L17 48 M75 52L83 48"/>
            </g>
            <g fill="currentColor">
              <path d="M50 34C36 27 42 17 50 12C58 17 64 27 50 34Z M32 32C20 29 22 20 25 16C33 17 39 24 32 32Z M68 32C80 29 78 20 75 16C67 17 61 24 68 32Z M25 48C13 45 14 37 17 33C25 34 31 40 25 48Z M75 48C87 45 86 37 83 33C75 34 69 40 75 48Z"/>
            </g>
          </svg>`;
          el.append(back);
        }
        // Overlap neighboring animations while exposing card faces in draw order.
        async function animateCard(el, keyframes, duration, easing) {
          const animation = el.animate(keyframes, {
            duration: ms(duration),
            fill: "forwards",
            easing,
          });
          try {
            await pause(duration);
          } finally {
            animation.cancel();
          }
        }
        const deals = [];
        for (let i = 0; i < hand.length && !skip; i++) {
          const el = hand[i];
          el.style.visibility = "visible";
          deals.push(
            animateCard(
              el,
              [
                {
                  opacity: 0,
                  transform: reduced ? "none" : "translateY(20px)",
                },
                { opacity: 1, transform: "none" },
              ],
              120,
              "ease-out",
            ),
          );
          if (i < hand.length - 1) await pause(70);
        }
        await Promise.all(deals);
        await pause(100);
        const opens = [];
        for (let i = 0; i < hand.length && !skip; i++) {
          const el = hand[i];
          if (!reduced)
            await animateCard(
              el,
              [
                { transform: "perspective(700px) rotateY(0deg)" },
                { transform: "perspective(700px) rotateY(90deg)" },
              ],
              140,
              "ease-in",
            );
          const counter = find(".resources > span:first-child");
          const remaining =
            i === hand.length - 1
              ? 0
              : Math.max(0, masked.battle.insight - i - 1);
          if (counter) {
            counter.querySelector("b").textContent = remaining;
            counter.classList.toggle("depleted", remaining === 0);
          }
          el.classList.remove("face-down");
          el.removeAttribute("aria-label");
          if (!reduced)
            opens.push(
              animateCard(
                el,
                [
                  { transform: "perspective(700px) rotateY(-90deg)" },
                  { transform: "perspective(700px) rotateY(0deg)" },
                ],
                140,
                "ease-out",
              ),
            );
          if (i < hand.length - 1) await pause(reduced ? 200 : 60);
        }
        await Promise.all(opens);
        await pause(300);
        if (!skip) render(frame.state);
      } else if (frame.kind === "gridDestruction") {
        await bossDestruction(frame, {
          card,
          player,
          enemy,
          ms,
          pause,
          reduced,
          skip: () => skip,
        });
        render(frame.state);
      } else if (frame.kind === "resources") {
        render(frame.state);
        await pause(220);
      } else if (frame.kind === "status") {
        // Battle-start curses need the battlefield and equipped icons before Reveal.
        if (frame.state.mode === "battle" && !find(".battle-player"))
          render(frame.state);
        const target =
          frame.target === "player"
            ? player()
            : frame.target === "card"
              ? card(frame.slot)
              : enemy(frame.uid);
        const from =
          frame.gridSourceSlot != null
            ? card(frame.gridSourceSlot)
            : frame.sourceItem != null
              ? item(frame.sourceItem)
              : frame.source != null
                ? enemy(frame.source)
                : frame.sourceSlot != null
                  ? card(frame.sourceSlot)
                  : null;
        if (frame.sourceItem != null) from?.classList.add("gear-proc");
        try {
          await flash(
            target,
            frame.name,
            false,
            from,
            statusVisual[frame.statusEffect] || null,
          );
        } finally {
          from?.classList.remove("gear-proc");
        }
        render(frame.state);
      } else if (frame.kind === "move") {
        if (!find(".field")) {
          const initial = structuredClone(frame.state);
          initial.mode = "field";
          if (frame.player) Object.assign(initial.field, frame.from);
          else {
            const e = initial.field.entities.find((e) => e.uid === frame.uid);
            if (e) Object.assign(e, frame.from);
          }
          render(initial);
        }
        let token = frame.player
          ? find("[data-player-token]")
          : find(`[data-token="${frame.uid}"]`);
        const start = find(`[data-cell="${frame.from.y * 11 + frame.from.x}"]`),
          end = find(`[data-cell="${frame.to.y * 11 + frame.to.x}"]`);
        if (!token && start && frame.enemy) {
          token = document.createElement("img");
          token.src =
            artPaths["enemy-" + frame.enemy] ||
            "assets/enemy-" + frame.enemy + ".png";
          token.className = "moving-ghost";
          start.append(token);
        }
        if (token && start && end) {
          const a = start.getBoundingClientRect(),
            b = end.getBoundingClientRect();
          token.style.zIndex = "8";
          const animation = token.animate(
            [
              { transform: "translate(0,0)" },
              {
                transform: `translate(${(b.left - a.left) / stageBounds().scale}px,${(b.top - a.top) / stageBounds().scale}px)`,
              },
            ],
            { duration: ms(280), fill: "forwards", easing: "ease-in-out" },
          );
          await Promise.race([animation.finished, pause(280)]);
        } else await pause(220);
        render(frame.state);
        if (
          frame.to.x === frame.state.field.x &&
          frame.to.y === frame.state.field.y &&
          !frame.player
        ) {
          const cell = find(`[data-cell="${frame.to.y * 11 + frame.to.x}"]`);
          cell?.classList.add("collision");
          await pause(550);
        }
      } else if (frame.kind === "shieldBoost") {
        const from = item(frame.sourceItem);
        from?.classList.add("gear-proc");
        try {
          await flash(
            card(frame.slot),
            "+" + frame.amount + " Guard",
            false,
            from,
            frame.element === "Arcane" ? "Light" : frame.element,
            null,
            frame,
          );
        } finally {
          from?.classList.remove("gear-proc");
        }
        render(frame.state);
      } else if (frame.kind === "activate") {
        source = { slot: frame.slot };
        await flash(card(frame.slot), frame.name);
        render(frame.state);
      } else if (frame.kind === "death") {
        await flash(enemy(frame.uid), frame.name, true);
        render(frame.state);
      } else if (frame.kind === "incoming") {
        source = { enemy: frame.source, element: frame.element };
        const el = frame.collapseOrigins ? null : enemy(frame.source);
        await flash(
          el,
          `${frame.name} · ${frame.amount} ${frame.element || ""}`,
        );
        render(frame.state);
      } else if (frame.kind === "hit" || frame.kind === "defend") {
        if (frame.attackPath)
          document
            .querySelectorAll(".held-attack")
            .forEach((el) => el.remove());
        const el = frame.attackPath
          ? pathNode(frame.pathTo)
          : frame.target === "enemy"
            ? enemy(frame.uid)
            : frame.target === "player"
              ? player()
              : frame.slot != null
                ? card(frame.slot)
                : frame.item
                  ? find(`[data-item-detail="${frame.item}"]`)
                  : player();
        const from = frame.statusTick
          ? null
          : frame.attackPath
            ? pathNode(frame.pathFrom)
            : frame.sourceItem != null
              ? find(
                  `.battle-player .gear-item[data-item-uid="${frame.sourceItem}"]`,
                ) || player()
              : source?.slot != null
                ? card(source.slot)
                : source?.enemy
                  ? enemy(source.enemy)
                  : null;
        if (frame.armor)
          find(`[data-item-detail="${frame.armor}"]`)?.classList.add(
            "defense-ready",
          );
        if (frame.sourceItem != null) from?.classList.add("gear-proc");
        try {
          if (frame.collapseOrigins?.length)
            await collapseFlight(frame.collapseOrigins, el, {
              card,
              ms,
              pause,
              reduced,
              skip: () => skip,
            });
          await flash(
            el,
            frame.loss != null
              ? "−" + frame.loss
              : frame.amount != null
                ? (frame.kind === "defend" ? "Absorbed " : "−") + frame.amount
                : frame.name || "Hit",
            frame.dead,
            frame.collapseOrigins?.length ? null : from,
            frame.amount != null
              ? statusVisual[frame.attackStatus] ||
                  statusVisual[frame.statusTick] ||
                  frame.element ||
                  source?.element ||
                  "Arcane"
              : null,
            frame.attackPath && frame.pathFrom
              ? {
                  incoming: previous.battle?.reaction?.damage ?? frame.amount,
                  remaining: ["card", "item"].includes(frame.pathTo?.kind)
                    ? frame.remaining
                    : 0,
                }
              : null,
          );
        } finally {
          if (frame.sourceItem != null) from?.classList.remove("gear-proc");
        }
        render(frame.state);
        // Swap the impact overlay for the rendered waiting marker without a blank frame.
        document
          .querySelectorAll(".attack-orb-overlay")
          .forEach((el) => el.remove());
      } else render(frame.state);
      previous = frame.state;
    }
    if (!skip && before.mode !== after.mode) {
      bar.querySelector("span").textContent =
        after.mode === "battle"
          ? "Encounter"
          : after.mode === "reward"
            ? "Victory"
            : after.mode === "result"
              ? after.outcome === "loss"
                ? "You Died"
                : "Stratum 1 Complete"
              : "Continue";
      await pause(after.mode === "reward" ? 700 : 450);
    }
  } finally {
    bar.remove();
    document
      .querySelectorAll(
        ".impact-number,.attack-bolt,.spell-impact,.attack-orb-overlay,.boss-effect",
      )
      .forEach((el) => el.remove());
  }
}
