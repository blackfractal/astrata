import { adjacent } from "./engine.mjs";
import { coveredByIdeon, fieldIdeons, stickyAt } from "./ideons.mjs";
import { artPaths } from "./art-paths.mjs";
import { cards } from "./content.mjs";
const tones = {
  Arcane: "#cbd0de",
  Fire: "#ff9b58",
  Water: "#79caff",
  Earth: "#93c37c",
  Wind: "#c6e6c0",
  Light: "#f9df81",
  Chaos: "#bf94f4",
};
const fieldNames = {
  element: "Element",
  shared: "One card",
  destroy: "Destruction",
};
export function enhanceIdeons(ctx) {
  const { o, app, esc, img } = ctx,
    b = o.battle;
  app.classList.toggle("in-depths", o.stratum === 3);
  if (!b) return;
  for (const el of app.querySelectorAll(".slot[data-slot]")) {
    const i = Number(el.dataset.slot),
      fields = fieldIdeons(b, i);
    el.classList.toggle("ideon-covered", coveredByIdeon(b, i));
    if (stickyAt(b, i)) {
      el.classList.add("ideon-bound");
      el.dataset.tooltip =
        (el.dataset.tooltip || "") +
        " Adjacent Clinging Thought prevents Recall.";
    }
    for (const field of fields) {
      const ring = document.createElement("span");
      ring.className = "refraction-field";
      ring.style.setProperty("--field-color", tones[field.element]);
      ring.dataset.tooltip = `${fieldNames[field.field]} field · ${field.field === "element" ? "Only " + field.element + " activations" : field.field === "shared" ? "One card may activate here each turn" : "Activating destroys the card afterward"}`;
      el.append(ring);
    }
  }
  for (const e of b.ideons || []) {
    if (e.hp <= 0) continue;
    const cell = app.querySelector(`.slot[data-slot="${e.slot}"]`);
    if (!cell) continue;
    const owner = b.enemies.find((x) => x.uid === e.owner);
    const el = document.createElement("button");
    el.className =
      "ideon" + (e.behavior === "bullet" ? " ideon-projectile" : "");
    el.dataset.enemyUid = e.uid;
    el.dataset.ideon = e.kind;
    el.style.setProperty("--ideon-color", tones[e.element]);
    const state = Object.entries(e.status || {})
      .filter(([, v]) => v)
      .map(([k, v]) => k + " " + v)
      .join(" · ");
    let command = owner?.tell?.commandIdeons
      ? "Acts on the upcoming enemy turn."
      : "Waits; its owner is not commanding it this turn.";
    if (e.kind === "drone")
      command += ` Next attack: ${e.damage + (e.damageGrowth || 0) * e.age} ${e.element} damage. Does not move.`;
    if (e.behavior === "crawl")
      command += e.slot % 7 === 0
        ? ` Next: ${e.damage} ${e.element} damage, then disappears.`
        : ` Next: move${e.turnDamage ? `, then ${e.turnDamage} ${e.element} damage` : "; no attack"}.`;
    if (owner?.tell?.commandIdeons && e.behavior === "tentacle") {
      const allies = b.grid
        .flatMap((s, i) =>
          cards[s.at(-1)?.id]?.type === "Ally" && s.at(-1).hp > 0
            ? [{ c: s.at(-1), i }]
            : [],
        )
        .sort((a, z) => a.c.hp - z.c.hp || a.i - z.i);
      command += allies.length
        ? ` Next: ${e.damage + e.age + 1} Water against ${cards[allies[0].c.id].name} (column ${(allies[0].i % 7) + 1}, row ${Math.floor(allies[0].i / 7) + 1}). Target updates after earlier tendrils act.`
        : e.slot % 7 === 0
          ? " Next: Poison 2 to you."
          : " Next: move one space left.";
    }
    const help = `${e.name} · ${e.element} · ${e.hp}/${e.maxHp} HP. Owner: ${owner?.name || e.ownerName}. ${e.text} ${e.field ? fieldNames[e.field] + " field." : ""} ${e.reserve ? "Stored Ward: " + e.reserve + "." : ""} ${state} ${command}`;
    el.dataset.tooltip = help;
    el.setAttribute("aria-label", help);
    const art = artPaths["ideon-" + e.kind] || `assets/ideon-${e.kind}.png`;
    el.innerHTML = `<img class="ideon-art" src="${art}" alt=""><span class="ideon-owner" title="${esc(owner?.name || e.ownerName)} #${e.owner}">${img("enemy-" + (owner?.id || "mindHive"))}</span><span class="ideon-name">${esc(e.name)}</span><span class="ideon-health"><i style="width:${Math.max(0, (e.hp / e.maxHp) * 100)}%"></i><b>${e.hp}</b></span>${e.mark ? '<span class="ideon-mark">✧</span>' : ""}${e.field ? `<span class="ideon-field-name">${fieldNames[e.field]}</span>` : ""}`;
    if (e.kind === "drone") {
      const intent = document.createElement("span");
      intent.className = "ideon-field-name";
      intent.textContent = `Next: ${e.damage + (e.damageGrowth || 0) * e.age} ${e.element}`;
      el.append(intent);
    }
    if (e.behavior === "crawl") {
      const intent = document.createElement("span");
      intent.className = "ideon-field-name";
      intent.textContent = e.slot % 7 === 0 ? `Exit: ${e.damage} ${e.element}`
        : e.turnDamage ? `Move + ${e.turnDamage} ${e.element}` : `Move · exit ${e.damage}`;
      el.append(intent);
    }
    el.onclick = (ev) => {
      ev.stopPropagation();
      if (ctx.busy() || el.classList.contains("target-option")) return;
      ctx.dialog(
        `<h2>${esc(e.name)}</h2><img class="ideon-detail-art" src="${art}" alt=""><p>${esc(help)}</p><p>Ideon · controlled by ${esc(owner?.name || e.ownerName)} #${e.owner}</p>`,
      );
    };
    const related = (on) => {
      app
        .querySelector(`[data-enemy-uid="${e.owner}"]`)
        ?.classList.toggle("ideon-owner-highlight", on);
      for (const other of b.ideons || [])
        if (other.owner === e.owner)
          app
            .querySelector(`[data-enemy-uid="${other.uid}"]`)
            ?.classList.toggle("ideon-owner-highlight", on);
    };
    el.onpointerenter = () => related(true);
    el.onpointerleave = () => related(false);
    cell.append(el);
    if (e.behavior === "bullet") {
      const next = e.slot % 7 >= 2 ? e.slot - 2 : null;
      if (next != null) {
        const dest = app.querySelector(`.slot[data-slot="${next}"]`);
        const mark = document.createElement("span");
        mark.className = "ideon-next";
        mark.textContent = "◇";
        mark.dataset.tooltip = `${e.name}: next stop on its owner’s next command`;
        dest?.append(mark);
      } else
        el.dataset.tooltip +=
          " Next command: leaves the grid and deals 12 Pierce damage.";
    }
  }
  for (const owner of b.enemies) {
    if (owner.tell?.cannonPlan?.slot != null) {
      const slot = owner.tell.cannonPlan.slot;
      const el = app.querySelector(`.slot[data-slot="${slot}"]`);
      el?.classList.add("cannon-entry");
      if (el)
        el.dataset.tooltip = `${owner.tell.name}: next projectile enters here. Forecast changes with your formation until fired.`;
    }
    const line = app.querySelector(`[data-enemy-uid="${owner.uid}"] .info`);
    const children = (b.ideons || []).filter(
      (e) => e.owner === owner.uid && e.hp > 0,
    );
    if (line && children.length)
      line.insertAdjacentHTML(
        "beforeend",
        `<small class="ideon-owner-count">${children.length} Ideon${children.length === 1 ? "" : "s"}${children.some((e) => e.guardian) ? " · Protected" : ""}</small>`,
      );
  }
}
