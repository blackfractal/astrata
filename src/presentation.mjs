import { artPaths } from "./art-paths.mjs";
export function installTooltips() {
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
          back.innerHTML =
            '<span class="back-seal">✧</span><span>ASTRATA</span>';
          el.append(back);
        }
        // Deal all cards face down, then turn each card over in draw order.
        for (const el of hand) {
          if (skip) break;
          el.style.visibility = "visible";
          const deal = el.animate(
            [
              { opacity: 0, transform: reduced ? "none" : "translateY(20px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: ms(160), fill: "forwards", easing: "ease-out" },
          );
          await pause(160);
          deal.cancel();
        }
        await pause(200);
        for (const el of hand) {
          if (skip) break;
          if (!reduced) {
            const close = el.animate(
              [
                { transform: "perspective(700px) rotateY(0deg)" },
                { transform: "perspective(700px) rotateY(90deg)" },
              ],
              { duration: ms(180), fill: "forwards", easing: "ease-in" },
            );
            await pause(180);
            close.cancel();
          }
          el.classList.remove("face-down");
          el.removeAttribute("aria-label");
          if (!reduced) {
            const open = el.animate(
              [
                { transform: "perspective(700px) rotateY(-90deg)" },
                { transform: "perspective(700px) rotateY(0deg)" },
              ],
              { duration: ms(180), fill: "forwards", easing: "ease-out" },
            );
            await pause(180);
            open.cancel();
          }
          await pause(260);
        }
        if (!skip) render(frame.state);
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
