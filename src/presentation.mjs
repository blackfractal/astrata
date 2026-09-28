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
    const el = e.target.closest?.("[title],[data-tooltip]");
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
    tip.style.left = Math.max(12, Math.min(innerWidth - 330, r.left)) + "px";
    tip.style.top =
      Math.max(
        12,
        Math.min(innerHeight - tip.offsetHeight - 12, r.bottom + 8),
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
      ? { enemy: before.battle.reaction.source }
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
  async function flash(el, label, dead = false, from = null) {
    const duration = ms(500);
    let projectile;
    if (el && from && from !== el) {
      const a = from.getBoundingClientRect(),
        b = el.getBoundingClientRect();
      projectile = document.createElement("div");
      projectile.className = "attack-bolt";
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
    el?.classList.add("impact");
    const tag = floating(el, label);
    await pause(550);
    el?.classList.remove("impact");
    tag?.remove();
    if (dead && el) {
      el.classList.add("disintegrating");
      await pause(600);
    }
  }
  try {
    render(before);
    for (const frame of frames) {
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
      if (frame.kind === "reveal") {
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
      } else if (frame.kind === "resources") {
        render(frame.state);
        await pause(220);
      } else if (frame.kind === "status") {
        await flash(enemy(frame.uid), frame.name);
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
                transform: `translate(${b.left - a.left}px,${b.top - a.top}px)`,
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
      } else if (frame.kind === "activate") {
        source = { slot: frame.slot };
        await flash(card(frame.slot), frame.name);
        render(frame.state);
      } else if (frame.kind === "incoming") {
        source = { enemy: frame.source };
        const el = enemy(frame.source);
        await flash(
          el,
          `${frame.name} · ${frame.amount} ${frame.element || ""}`,
        );
        render(frame.state);
      } else if (frame.kind === "hit" || frame.kind === "defend") {
        const el =
          frame.target === "enemy"
            ? enemy(frame.uid)
            : frame.target === "player"
              ? player()
              : frame.slot != null
                ? card(frame.slot)
                : frame.item
                  ? find(`[data-item-detail="${frame.item}"]`)
                  : player();
        const from =
          source?.slot != null
            ? card(source.slot)
            : source?.enemy
              ? enemy(source.enemy)
              : null;
        if (frame.armor)
          find(`[data-item-detail="${frame.armor}"]`)?.classList.add(
            "defense-ready",
          );
        await flash(
          el,
          frame.amount != null
            ? (frame.kind === "defend" ? "Blocked " : "−") + frame.amount
            : frame.name || "Hit",
          frame.dead,
          from,
        );
        render(frame.state);
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
              ? "Journey complete"
              : "Continue";
      await pause(after.mode === "reward" ? 700 : 450);
    }
  } finally {
    bar.remove();
    document
      .querySelectorAll(".impact-number,.attack-bolt")
      .forEach((el) => el.remove());
  }
}
