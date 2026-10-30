import { pressureSignature, pressureTell } from "./difficulty.mjs";
import { cardText } from "./content.mjs";
import { achievements } from "./archive-profile.mjs";
import {
  archiveEntries,
  archiveFacets,
  archiveMatches,
  archiveCardStats,
} from "./archive-catalog.mjs";

const sections = [
  ["cards", "Cards"],
  ["enemies", "Enemies"],
  ["equipment", "Equipment"],
  ["achievements", "Achievements"],
  ["history", "Run History"],
];
const filterNames = {
  element: "Element",
  role: "Role",
  rarity: "Rarity",
  type: "Card type",
  character: "Character",
  stratum: "Stratum",
  tier: "Rank",
  kind: "Enemy type",
  movement: "Movement",
  category: "Category",
  curse: "Curse",
};
export function showArchives(ctx, section = "cards") {
  if (!sections.some(([id]) => id === section)) section = "cards";
  const { app, data, esc, img, text, dialog } = ctx,
    collection = data.collections || {},
    heading = sections.find(([id]) => id === section)[1];
  app.innerHTML = `<section class="archives"><nav class="archive-tabs" aria-label="Archives sections">${sections.map(([id, title]) => `<button data-archive-nav="${id}" aria-current="${section === id ? "page" : "false"}">${title}</button>`).join("")}<button data-archive-back>Return to start ↗</button></nav><header class="archives-heading"><div><div class="eyebrow">ARCHIVES</div><h1>${heading}</h1></div></header><div class="archive-body"></div></section>`;
  app.querySelector("[data-archive-back]").onclick = ctx.home;
  app.querySelectorAll("[data-archive-nav]").forEach((el) => {
    el.onclick = () => showArchives(ctx, el.dataset.archiveNav);
  });
  app.querySelector('[aria-current="page"]').focus();
  const body = app.querySelector(".archive-body");
  if (section === "history") {
    const recent = (data.history || []).slice(-20).reverse();
    const names = [
      "",
      "The Whispering Weald",
      "The Unfinished Loom",
      "The Lucent Grotto",
      "The Apex",
    ];
    body.innerHTML = `<p class="muted">The most recent 20 runs</p><div class="archive-history">${recent.map((h, i) => `<button data-run="${i}"><span class="archive-run-number">${String(i + 1).padStart(2, "0")}</span><span><b>${esc(h.tutorial?.name || (h.tutorial ? "Tutorial" : names[h.stratum || 1] || "Astrata"))}</b><small>${esc(h.outcome)} · Round ${h.field?.round ?? "—"} · Seed ${esc(h.seed)}</small></span><span class="muted">v${esc(h.packageVersion || "unrecorded")} ↗</span></button>`).join("") || "<p>No runs recorded yet.</p>"}</div>`;
    body.querySelectorAll("[data-run]").forEach((el) => {
      el.onclick = () =>
        dialog(ctx.resultMarkup(recent[Number(el.dataset.run)]));
    });
    return;
  }
  if (section === "achievements") {
    body.innerHTML = `<div class="archive-achievements">${achievements
      .filter((a) => !a.retired)
      .map((a) => {
        const earned = collection.achievements?.[a.id];
        return `<article class="archive-achievement ${earned ? "earned" : ""}"><span class="achievement-seal" aria-hidden="true">${earned ? "✦" : "◇"}</span><div><h2>${esc(a.name)}</h2><p class="achievement-description">${esc(a.description)}</p><span class="${earned ? "gold" : "muted"}">${earned ? "Achieved" : "Not yet achieved"}</span></div></article>`;
      })
      .join("")}</div>`;
    return;
  }
  const entries = archiveEntries(section, collection[section]),
    filters = { query: "", visibility: "all" };
  // Only discovered definitions contribute options, so filters do not spoil hidden content.
  const facets = {};
  for (const entry of entries)
    for (const variant of entry.variants) {
      for (const [key, values] of Object.entries(
        archiveFacets(section, variant.definition),
      )) {
        facets[key] ||= new Set();
        for (const value of values) if (value) facets[key].add(value);
      }
    }
  const controls = Object.entries(facets).filter(
    ([key, values]) => values.size && (key !== "character" || values.size > 1),
  );
  body.innerHTML = `<div class="archive-filters"><span>${entries.filter((e) => e.seen).length} / ${entries.length} discovered</span><label class="archive-search">Find <input type="search" aria-label="Search discovered entries" placeholder="Search discoveries"></label><label>Show <select data-visibility aria-label="Collection visibility"><option value="all">All entries</option><option value="seen">Discovered</option><option value="unseen">Undiscovered</option></select></label><button data-filter-toggle aria-expanded="false" aria-controls="archive-filter-panel">Filters</button></div><div id="archive-filter-panel" class="archive-filter-panel" hidden>${controls
    .map(
      ([key, values]) =>
        `<label>${filterNames[key]}<select data-filter="${key}" aria-label="${filterNames[key]}"><option value="">Any</option>${[
          ...values,
        ]
          .sort()
          .map(
            (value) => `<option value="${esc(value)}">${esc(value)}</option>`,
          )
          .join("")}</select></label>`,
    )
    .join(
      "",
    )}<button data-filter-reset>Clear filters</button></div><div class="archive-results-count" aria-live="polite"></div><div class="archive-gallery"></div>`;
  const gallery = body.querySelector(".archive-gallery"),
    toggle = body.querySelector("[data-filter-toggle]"),
    panel = body.querySelector(".archive-filter-panel");
  function artwork(id, d, detail = false) {
    const prefix = { cards: "card-", enemies: "enemy-", equipment: "item-" }[
      section
    ];
    return `<span class="archive-art ${detail ? "archive-art-detail" : ""}">${img(prefix + id).replace("<img ", `<img loading="${detail ? "eager" : "lazy"}" decoding="async" `)}${
      section === "cards"
        ? archiveCardStats(d)
            .map(
              (s) =>
                `<span class="archive-stat archive-stat-${s.key}" title="${esc(s.help)}" aria-label="${esc(s.help)}: ${esc(s.value)}"><small>${s.label}</small><b>${esc(s.value)}</b></span>`,
            )
            .join("")
        : ""
    }</span>`;
  }
  function paint() {
    const filtered = entries.filter((entry) =>
      archiveMatches(entry, section, filters),
    );
    const count = Object.keys(filters).filter(
      (key) => !["query", "visibility"].includes(key) && filters[key],
    ).length;
    toggle.textContent = count ? `Filters · ${count}` : "Filters";
    body.querySelector(".archive-results-count").textContent =
      `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"}`;
    gallery.innerHTML =
      filtered
        .map((entry) => {
          const variantIndex = entry.variants.findIndex((v) =>
            archiveMatches({ ...entry, variants: [v] }, section, filters),
          );
          const variant = entry.variants[variantIndex],
            d = variant?.definition || entry.definition;
          return entry.seen
            ? `<button class="archive-entry" data-entry="${entry.id}" data-variant="${variantIndex}">${artwork(variant.id, d)}<span class="archive-entry-copy"><b>${esc(d.name)}</b><small>${esc(d.element || d.slot || "")}${d.type || d.tier ? " · " + esc(d.type || d.tier) : ""}</small></span></button>`
            : `<div class="archive-entry undiscovered" aria-label="Undiscovered ${section === "equipment" ? "equipment" : section === "enemies" ? "enemy" : "card"}"><span class="unknown-sigil">?</span><span class="archive-entry-copy"><b>Undiscovered</b></span></div>`;
        })
        .join("") ||
      '<p class="muted archive-empty">No matching discoveries.</p>';
    gallery.querySelectorAll("[data-entry]").forEach((el) => {
      el.onclick = () =>
        details(
          entries.find((e) => e.id === el.dataset.entry),
          Number(el.dataset.variant),
        );
    });
  }
  function details(entry, variantIndex = 0) {
    if (!entry?.seen) return;
    const { id, definition: d } = entry.variants[variantIndex];
    const specifics =
      section === "cards"
        ? `<p class="gold">${esc(d.element)} · ${esc(d.type)} · ${esc(d.rarity)}</p>${d.hp || d.charge ? `<p>${d.hp ? `Initial HP ${d.hp}` : ""}${d.hp && d.charge ? " · " : ""}${d.charge ? `Charge ${d.charge}` : ""}</p>` : ""}<p>${text(cardText(d, collection.highestStratum || 1))}</p>`
        : section === "enemies"
          ? `<p class="gold">${esc(d.tier)} · ${esc(d.element)} · ${d.hp} base HP</p><p>${esc(d.schedule || d.movement || "")}</p><p>${text(pressureSignature(d.signature, d))}</p>${d.rotation?.length ? `<h3>Move cycle</h3><ol>${d.rotation.map((t) => `<li>${text(ctx.tellText(pressureTell(t, d)))}</li>`).join("")}</ol>` : ""}${d.onDeath ? `<h3>On death</h3><p>${text(ctx.tellText(pressureTell(d.onDeath, d)))}</p>` : ""}<p class="muted">${text(d.counter || "")}</p>`
          : `<p class="gold">${esc(d.slot)}</p><p>${text(d.text)}</p>`;
    dialog(
      `<div class="archive-detail">${artwork(id, d, true)}<div><div class="eyebrow">${heading}</div><h2>${esc(d.name)}</h2>${entry.variants.length > 1 ? `<label class="archive-variant">Version <select id="archive-variant">${entry.variants.map((v, i) => `<option value="${i}" ${i === variantIndex ? "selected" : ""}>${esc(v.label)}</option>`).join("")}</select></label>` : ""}${specifics}</div></div>`,
    );
    const variantControl = document.getElementById("archive-variant");
    if (variantControl)
      variantControl.onchange = (e) => details(entry, Number(e.target.value));
  }
  body.querySelector("input").oninput = (e) => {
    filters.query = e.target.value.trim();
    paint();
  };
  body.querySelector("[data-visibility]").onchange = (e) => {
    filters.visibility = e.target.value;
    paint();
  };
  toggle.onclick = () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
  };
  body.querySelectorAll("[data-filter]").forEach((el) => {
    el.onchange = () => {
      filters[el.dataset.filter] = el.value;
      paint();
    };
  });
  body.querySelector("[data-filter-reset]").onclick = () => {
    body.querySelectorAll("[data-filter]").forEach((el) => {
      el.value = "";
      delete filters[el.dataset.filter];
    });
    filters.query = "";
    filters.visibility = "all";
    body.querySelector("input").value = "";
    body.querySelector("[data-visibility]").value = "all";
    paint();
  };
  paint();
}
