import { cards, enemies, items } from "./content.mjs";
import { achievements } from "./archive-profile.mjs";

const sections = [
  ["history", "Run History", "Journeys remembered", "Ⅰ"],
  ["cards", "Cards", "Leaves of the Grimoire", "Ⅱ"],
  ["enemies", "Enemies", "Faces of the Strata", "Ⅲ"],
  ["equipment", "Equipment", "Treasures along the path", "Ⅳ"],
  ["achievements", "Achievements", "Deeds and mysteries", "Ⅴ"],
];
export function showArchives(ctx, section = "hub") {
  const { app, data, esc, img, text, dialog } = ctx,
    collection = data.collections;
  let query = "",
    visibility = "all";
  const heading = sections.find(([id]) => id === section)?.[1] || "Archives";
  app.innerHTML = `<section class="archives"><header class="archives-heading"><div><div class="eyebrow">ASTRATA · THE ARCHIVES</div><h1>${heading}</h1></div><button data-archive-back>${section === "hub" ? "Return to start" : "All Archives"} ↗</button></header>${section === "hub" ? "" : `<nav class="archive-tabs" aria-label="Archives sections">${sections.map(([id, title]) => `<button data-archive-nav="${id}" aria-current="${section === id ? "page" : "false"}">${title}</button>`).join("")}</nav>`}<div class="archive-body"></div></section>`;
  app.querySelector("[data-archive-back]").onclick = () =>
    section === "hub" ? ctx.home() : showArchives(ctx);
  app
    .querySelectorAll("[data-archive-nav]")
    .forEach(
      (el) => (el.onclick = () => showArchives(ctx, el.dataset.archiveNav)),
    );
  app.querySelector("[data-archive-back]").focus();
  const body = app.querySelector(".archive-body");
  if (section === "hub") {
    body.innerHTML = `<p class="archive-intro">What you have found. What remains unknown.</p><div class="archive-volumes">${sections.map(([id, title, sub, numeral]) => `<button class="archive-volume" data-volume="${id}"><span class="archive-numeral">${numeral}</span><h2>${title}</h2><span>${sub}</span><b aria-hidden="true">↗</b></button>`).join("")}</div>`;
    body
      .querySelectorAll("[data-volume]")
      .forEach(
        (el) => (el.onclick = () => showArchives(ctx, el.dataset.volume)),
      );
    return;
  }
  if (section === "history") {
    const recent = (data.history || []).slice(-20).reverse();
    body.innerHTML = `<p class="muted">The most recent 20 journeys</p><div class="archive-history">${recent.map((h, i) => `<button data-run="${i}"><span class="archive-run-number">${String(i + 1).padStart(2, "0")}</span><span><b>${h.tutorial ? "The First Clearing" : "The Whispering Weald"}</b><small>${esc(h.outcome)} · Round ${h.field?.round ?? "—"} · Seed ${esc(h.seed)}</small></span><span class="muted">v${esc(h.packageVersion || "unrecorded")} ↗</span></button>`).join("") || "<p>No journeys recorded yet.</p>"}</div>`;
    body
      .querySelectorAll("[data-run]")
      .forEach(
        (el) =>
          (el.onclick = () =>
            dialog(ctx.resultMarkup(recent[Number(el.dataset.run)]))),
      );
    return;
  }
  if (section === "achievements") {
    body.innerHTML = `<div class="archive-achievements">${achievements
      .map((a) => {
        const earned = collection.achievements?.[a.id];
        return `<article class="archive-achievement ${earned ? "earned" : ""}"><span class="achievement-seal" aria-hidden="true">${earned ? "✦" : "◇"}</span><div><h2>${esc(a.name)}</h2><span class="${earned ? "gold" : "muted"}">${earned ? "Achieved" : "Not yet achieved"}</span></div></article>`;
      })
      .join("")}</div>`;
    return;
  }
  const catalog = { cards, enemies, equipment: items }[section];
  if (!catalog) return;
  const discovered = collection[section] || {},
    entries = Object.entries(catalog);
  body.innerHTML = `<div class="archive-filters"><span>${entries.filter(([id]) => discovered[id]).length} / ${entries.length} discovered</span><label>Find <input type="search" aria-label="Search discovered entries" placeholder="Search discoveries"></label><label>Show <select aria-label="Collection visibility"><option value="all">All entries</option><option value="seen">Discovered</option><option value="unseen">Undiscovered</option></select></label></div><div class="archive-gallery"></div>`;
  const gallery = body.querySelector(".archive-gallery");
  function paint() {
    const filtered = entries.filter(
      ([id, d]) =>
        (visibility !== "seen" || discovered[id]) &&
        (visibility !== "unseen" || !discovered[id]) &&
        (!query || (discovered[id] && d.name.toLowerCase().includes(query))),
    );
    gallery.innerHTML =
      filtered
        .map(([id, d]) =>
          discovered[id]
            ? `<button class="archive-entry" data-entry="${id}">${img({ cards: "card-", enemies: "enemy-", equipment: "item-" }[section] + id)}<span class="archive-entry-copy"><b>${esc(d.name)}</b><small>${esc(d.element || d.slot || d.type)}${d.tier ? " · " + esc(d.tier) : ""}</small></span></button>`
            : `<div class="archive-entry undiscovered" aria-label="Undiscovered ${section === "equipment" ? "equipment" : section === "enemies" ? "enemy" : "card"}"><span class="unknown-sigil">?</span><span class="archive-entry-copy"><b>Undiscovered</b></span></div>`,
        )
        .join("") || '<p class="muted">No matching discoveries.</p>';
    gallery
      .querySelectorAll("[data-entry]")
      .forEach((el) => (el.onclick = () => details(el.dataset.entry)));
  }
  function details(id) {
    if (!discovered[id]) return;
    const d = catalog[id],
      prefix = { cards: "card-", enemies: "enemy-", equipment: "item-" }[
        section
      ];
    const specifics =
      section === "cards"
        ? `<p class="gold">${esc(d.element)} · ${esc(d.type)} · ${esc(d.rarity)}</p><p>Focus ${d.unplaceable ? "Automatic" : d.focus} · Activation allowance ${d.limit < 0 ? "∞" : d.limit} · Channel ${d.channel ?? 1}${d.hp ? " · Initial HP " + d.hp : ""}${d.charge ? " · Charge " + d.charge : ""} · Recall ${d.recall == null ? "Unavailable" : d.recall}</p><p>${text(d.text)}</p>`
        : section === "enemies"
          ? `<p class="gold">${esc(d.tier)} · ${esc(d.element)} · ${d.hp} base HP</p><p>${esc(d.schedule || d.movement)}</p><p>${text(d.signature)}</p><h3>Move cycle</h3><ol>${d.rotation.map((t) => `<li>${text(ctx.tellText(t))}</li>`).join("")}</ol>${d.onDeath ? `<h3>On death</h3><p>${text(ctx.tellText(d.onDeath))}</p>` : ""}<p class="muted">${text(d.counter)}</p>`
          : `<p class="gold">${esc(d.slot)}</p><p>${text(d.text)}</p>`;
    dialog(
      `<div class="archive-detail">${img(prefix + id, "full-art")}<div><div class="eyebrow">${heading} · Discovered</div><h2>${esc(d.name)}</h2>${specifics}</div></div>`,
    );
  }
  body.querySelector("input").oninput = (e) => {
    query = e.target.value.trim().toLowerCase();
    paint();
  };
  body.querySelector("select").onchange = (e) => {
    visibility = e.target.value;
    paint();
  };
  paint();
}
