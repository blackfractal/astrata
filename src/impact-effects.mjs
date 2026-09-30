// Small deterministic, code-drawn spell impacts. No game state or randomness is consumed.
export const impactStyles = {
  Arcane: {
    color: "#c8cbd0",
    core: '<path d="m50 5 8 29 23-17-15 25 29 8-29 8 15 25-23-17-8 29-8-29-23 17 15-25-29-8 29-8-15-25 23 17Z"/>',
    spark: "star",
  },
  Fire: {
    color: "#ffa04d",
    core: '<path d="M53 4c12 24-7 25 0 41 7-3 11-12 10-21 26 20 31 60-11 71C13 87 7 63 27 37c-1 15 6 19 12 14C31 29 48 22 53 4Z"/>',
    spark: "ember",
  },
  Water: {
    color: "#77cded",
    core: '<g fill="none" stroke="currentColor" stroke-width="4"><circle cx="50" cy="50" r="16"/><circle cx="50" cy="50" r="31"/><path d="M5 50a45 45 0 0 1 45-45M95 50a45 45 0 0 1-45 45"/></g>',
    spark: "drop",
  },
  Earth: {
    color: "#c5b178",
    core: '<path d="m47 13 22 17-5 22-25 7-19-22Zm26 45 20 12-12 21-22-9ZM13 60l21 4 7 23-26-3Z"/>',
    spark: "shard",
  },
  Wind: {
    color: "#b8e8d6",
    core: '<g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M6 42c19-28 61-28 74-9 10 15-8 28-16 15M11 61c20 27 61 24 77 1M27 91c25 3 56-11 66-32"/></g>',
    spark: "slash",
  },
  Chaos: {
    color: "#cc9cf0",
    core: '<path d="m52 3 8 29 25-15-9 27 22 13-31 3 14 34-27-19-21 22 5-32L5 58l30-13L21 13l25 20Z"/><path d="m47 24-8 27 18-4-6 29" fill="none" stroke="#24132e" stroke-width="5"/>',
    spark: "shard",
  },
  Light: {
    color: "#ffe6a1",
    core: '<path d="m50 1 9 38 40 11-40 10-9 39-10-39L1 50l39-11Z"/><g fill="none" stroke="currentColor" stroke-width="3"><path d="m18 18 14 14m36 36 14 14M18 82l14-14m36-36 14-14"/><circle cx="50" cy="50" r="30"/></g>',
    spark: "ray",
  },
};
export function spellImpact(
  target,
  element,
  { duration = 500, reduced = false } = {},
) {
  if (!target) return null;
  const name = Object.hasOwn(impactStyles, element) ? element : "Arcane";
  const style = impactStyles[name],
    r = target.getBoundingClientRect();
  const root = document.createElement("div");
  root.className = "spell-impact";
  root.dataset.element = name;
  root.dataset.motion = reduced ? "reduced" : "normal";
  root.setAttribute("aria-hidden", "true");
  root.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--hit-color:${style.color}`;
  root.innerHTML = `<svg class="impact-core" viewBox="0 0 100 100" fill="currentColor">${style.core}</svg>`;
  document.body.append(root);
  root.querySelector(".impact-core").animate(
    reduced
      ? [{ opacity: 0.65 }, { opacity: 0 }]
      : [
          { transform: "scale(.2) rotate(-12deg)", opacity: 0 },
          { transform: "scale(.85) rotate(0deg)", opacity: 0.95, offset: 0.2 },
          { transform: "scale(1.18) rotate(12deg)", opacity: 0 },
        ],
    { duration, fill: "forwards", easing: "ease-out" },
  );
  if (!reduced)
    for (let i = 0; i < 8; i++) {
      const p = document.createElement("i");
      p.className = "impact-spark spark-" + style.spark;
      root.append(p);
      const angle = (i * Math.PI) / 4 + 0.2;
      const reach = 34 + (i % 3) * 9;
      const x = Math.cos(angle) * reach,
        y = Math.sin(angle) * reach;
      p.animate(
        [
          {
            transform: `translate(-50%, -50%) rotate(${i * 45}deg) scale(.4)`,
            opacity: 0,
          },
          { opacity: 0.9, offset: 0.15 },
          {
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${i * 45 + 50}deg) scale(.15)`,
            opacity: 0,
          },
        ],
        { duration, fill: "forwards", easing: "cubic-bezier(.12,.6,.25,1)" },
      );
    }
  return root;
}

// Shared appearance for the traveling, impact and waiting portions of one attack.
export function attackOrb(damage, element) {
  const orb = document.createElement("span");
  orb.className = "held-attack";
  orb.style.setProperty(
    "--hit-color",
    (impactStyles[element] || impactStyles.Arcane).color,
  );
  orb.textContent = damage;
  orb.setAttribute("aria-label", `${damage} ${element} damage remaining`);
  return orb;
}
