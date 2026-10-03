import { attackOrb } from "./impact-effects.mjs";
const center = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};
function overlay(el, cls, html = "") {
  if (!el) return null;
  const r = el.getBoundingClientRect(),
    node = document.createElement("div");
  node.className = "boss-effect " + cls;
  node.setAttribute("aria-hidden", "true");
  node.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
  node.innerHTML = html;
  document.body.append(node);
  return node;
}
async function motion(el, frames, duration, api) {
  if (!el || api.skip()) return;
  const a = el.animate(
    api.reduced ? [{ opacity: 0.8 }, { opacity: 0.2 }] : frames,
    { duration: api.ms(duration), fill: "forwards", easing: "ease-in-out" },
  );
  await Promise.race([a.finished, api.pause(duration)]);
  if (el.isConnected) a.commitStyles();
  a.cancel();
}
export async function bossDestruction(frame, api) {
  const owned = [];
  const add = (n) => {
    if (n) owned.push(n);
    return n;
  };
  const targets = frame.targets.map(api.card).filter(Boolean);
  try {
    if (frame.visual === "wildfire") {
      const cells = frame.spaces.map(api.card).filter(Boolean);
      if (!cells.length) return;
      const first = cells[0].getBoundingClientRect(),
        last = cells.at(-1).getBoundingClientRect();
      const row = add(overlay(cells[0], "wildfire-line"));
      row.style.width = last.right - first.left + "px";
      row.innerHTML =
        '<div class="wildfire-core"></div>' +
        Array.from(
          { length: 21 },
          (_, i) =>
            `<i class="wildfire-flame" style="left:${i * 4.8}%;--flame-lean:${((i % 3) - 1) * 13}deg;--flame-height:${45 + ((i * 17) % 48)}%"></i>`,
        ).join("");
      await motion(
        row,
        [
          { clipPath: "inset(0 0 0 100%)", opacity: 0 },
          { clipPath: "inset(0)", opacity: 1 },
        ],
        750,
        api,
      );
      if (!api.skip()) await api.pause(170);
    } else if (frame.visual === "collapse") {
      await Promise.all(
        frame.spaces.map(async (i) => {
          const cell = api.card(i),
            hole = add(
              overlay(
                cell,
                "collapse-hole",
                `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="26"/><path d="M50 0v22M50 78v22M0 50h22M78 50h22M15 15l17 17M68 68l17 17M15 85l17-17M68 32l17-17"/></svg><span>${frame.empty.includes(i) ? "5" : "Absorbed"}</span>`,
              ),
            );
          if (hole) hole.dataset.empty = String(frame.empty.includes(i));
          await motion(
            hole,
            [
              { transform: "scale(1.12)", opacity: 0 },
              { transform: "scale(.95)", opacity: 1, offset: 0.25 },
              { transform: "scale(.12)", opacity: 0.9 },
            ],
            850,
            api,
          );
        }),
      );
    } else {
      await Promise.all(
        targets.map(async (cell) => {
          const notes = add(
            overlay(
              cell,
              "hymn-notes",
              '<svg viewBox="0 0 120 100"><g class="hymn-staff"><path d="M0 30h120M0 39h120M0 48h120M0 57h120M0 66h120"/></g><g class="hymn-score"><ellipse cx="25" cy="57" rx="7" ry="5"/><path d="M31 57V22l24-5v34M31 28l24-5"/><ellipse cx="49" cy="51" rx="7" ry="5"/><ellipse cx="84" cy="70" rx="7" ry="5"/><path d="M90 70V32q20 9 9 23"/></g></svg>',
            ),
          );
          await motion(
            notes,
            [
              { transform: "translateX(-7px)", opacity: 0.2 },
              { transform: "translateX(5px)", opacity: 1, offset: 0.2 },
              { transform: "translateX(-5px)", opacity: 0.85, offset: 0.4 },
              { transform: "translateX(4px)", opacity: 1, offset: 0.6 },
              { transform: "translateX(-3px)", opacity: 1, offset: 0.8 },
              { transform: "translateX(0)", opacity: 1 },
            ],
            900,
            api,
          );
        }),
      );
    }
    if (api.skip()) return;
    await Promise.all(
      targets.map((el) =>
        motion(
          el,
          [
            { opacity: 1, filter: "brightness(1.6)", transform: "scale(1)" },
            {
              opacity: 0,
              filter: "brightness(2)",
              transform:
                frame.visual === "collapse" ? "scale(.05)" : "scale(.88)",
            },
          ],
          430,
          api,
        ),
      ),
    );
  } finally {
    owned.forEach((el) => el.remove());
  }
}
export async function collapseFlight(slots, target, api) {
  if (!target || api.skip()) return;
  const dest = center(target);
  const nodes = [];
  try {
    await Promise.all(
      slots.map(async (slot) => {
        const source = api.card(slot);
        if (!source) return;
        const from = center(source);
        const orb = attackOrb(5, "Arcane");
        orb.classList.add("boss-effect", "collapse-bolt");
        orb.dataset.sourceSlot = slot;
        orb.style.cssText = `left:${from.x}px;top:${from.y}px`;
        document.body.append(orb);
        nodes.push(orb);
        await motion(
          orb,
          [
            { transform: "translate(-50%,-50%)", opacity: 1 },
            {
              transform: `translate(calc(-50% + ${dest.x - from.x}px),calc(-50% + ${dest.y - from.y}px))`,
              opacity: 1,
            },
          ],
          520,
          api,
        );
      }),
    );
  } finally {
    nodes.forEach((n) => n.remove());
  }
}
