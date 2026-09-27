import { enhance, showCard, showEquipment } from "./polish-ui.mjs";
import { playFrames, installTooltips } from "./presentation.mjs";
import { Game } from "./engine.mjs";
import { cards, items, enemies, glossary, VERSION } from "./content.mjs";
import { artPaths } from "./art-paths.mjs";
import { WeightedPolicy } from "./policy.mjs";
const app = document.querySelector("#app"),
  modal = document.querySelector("#modal");
const storage = window.desktop || {
  load: async () =>
    JSON.parse(localStorage.getItem("astrata") || '{"history":[]}'),
  save: async (save) => {
    const d = await storage.load();
    localStorage.setItem("astrata", JSON.stringify({ ...d, save }));
  },
  result: async (r) => {
    const d = await storage.load();
    localStorage.setItem(
      "astrata",
      JSON.stringify({ ...d, save: null, history: [...(d.history || []), r] }),
    );
  },
  settings: async (settings) => {
    const d = await storage.load();
    localStorage.setItem("astrata", JSON.stringify({ ...d, settings }));
  },
  quit: () => window.close(),
};
let data = await storage.load(),
  game = null,
  selectedHand = null,
  selectedSlot = null,
  service = "shop",
  auto = false,
  autoTimer = null,
  reason = "",
  runId = "",
  started = 0,
  elapsed = 0,
  resultsShown = false,
  busy = false;
let settings = {
  width: 1440,
  height: 900,
  fullscreen: false,
  music: 50,
  effects: 50,
  fast: false,
  ...data.settings,
};
const policy = new WeightedPolicy();
const audio = {
  emit(name) {
    document.dispatchEvent(
      new CustomEvent("astrata-audio", {
        detail: { name, music: settings.music, effects: settings.effects },
      }),
    );
  },
};
const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const img = (id, cls = "") =>
  `<img class="${cls}" src="${artPaths[id] || `assets/${id}.png`}" alt="${esc(id.replace(/^(card|enemy|item|event|location)-/, ""))}">`;
function tellText(t) {
  return [
    t.name,
    t.damage ? `${t.damage} ${t.element}${t.hits ? " ×" + t.hits : ""}` : "",
    t.pierce ? "Pierce" : "",
    t.cull ? "Cull" : "",
    t.grid ? `${t.grid} ${t.count || 1} · ${t.target}` : "",
    ...["burn", "poison", "corrode"]
      .filter((k) => t[k])
      .map((k) => k[0].toUpperCase() + k.slice(1) + " " + t[k]),
    t.insight ? `${t.insight} Insight next turn` : "",
    t.guard ? "Gain " + t.guard + " guard" : "",
    t.flicker ? "Negate next offensive activation" : "",
    t.howl ? "Wolves gain " + t.howl + " attack" : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
const key = (s) =>
  `<span class="key" title="${esc(glossary[s] || s)}">${s}</span>`;
const text = (s) =>
  esc(s).replace(
    /\b(Attune|Focus|Channel|Insight|Recall|Spent|Ward|Shield|Ally|Burn|Poison|Corrode|Lock|Freeze|Sever|Stack|Charge|Herald|Restless|Pierce|Cull|Taunt|Isolated|Cornerstone|Bonded|Tower)\b/g,
    (w) => key(w),
  );
function toast(s) {
  const el = document.querySelector("#toast");
  el.textContent = s;
  el.style.display = "block";
  setTimeout(() => (el.style.display = "none"), 3500);
}
function card(c, { select = false } = {}) {
  const d = cards[c.id],
    live = c.used != null;
  return `<button class="card ${selectedHand === c.uid ? "selected" : ""}" ${select ? `data-hand="${c.uid}"` : `data-inspect-card="${c.id}"`} title="${esc(d.text)}">${img("card-" + c.id)}<span class="cost" title="Focus cost">${d.focus === 99 ? "—" : d.focus}</span><div class="body"><div class="eyebrow" style="color:var(--${d.element})">${d.element} · ${d.type}</div><h4>${d.name}${c.upgrade ? " +" : ""}</h4><div class="text">${text(d.text)}</div><div class="meta">${d.limit < 0 ? "∞" : live ? Math.max(0, d.limit - c.used) : d.limit} activations · ${d.channel} Channel<br>Recall ${d.recall == null ? "—" : d.recall} · ${d.rarity}</div></div></button>`;
}
function actionButton(a, cls = "") {
  return `<button class="${cls}" data-action="${esc(a.key)}">${esc(a.label)}</button>`;
}
function header(o) {
  return `<header><span class="brand">ASTRATA</span><div class="row stats"><span><b class="hp">${o.hp}</b> / ${o.maxHp} HP</span><span><b class="gold">${o.gold}</b> Gold</span><span>Stratum <b>1</b> · Round <b>${o.field.round || "—"}</b></span></div><div class="row"><button data-ui="grimoire">Grimoire</button><button data-ui="inventory">Inventory</button><button data-ui="pause">☰ Menu</button></div></header>`;
}
function sidebar(o) {
  const selected =
    o.battle && selectedSlot != null ? o.battle.grid[selectedSlot] : null;
  const detail = selected?.length
    ? '<div class="panel"><h4>' +
      cards[selected.at(-1).id].name +
      '</h4><div style="font-size:12px">' +
      selected.map((c) => text(cards[c.id].text)).join("<br>") +
      '</div><div class="choices" style="margin-top:10px;max-height:230px">' +
      game
        .legal()
        .filter((a) => a.slot === selectedSlot && a.type !== "place")
        .map((a) => actionButton(a))
        .join("") +
      "</div></div>"
    : "";
  return `<aside class="sidebar"><div><div class="eyebrow">The traveler</div><h3>Druid</h3><small>Growth & pattern</small></div><div class="panel"><h4>The three economies</h4><div>${key("Insight")} <span class="gold">${o.bonuses.insight}</span> · ${key("Focus")} <span class="gold">${o.bonuses.focus}</span> · ${key("Channel")} <span class="gold">${o.bonuses.channel}</span></div><small>Starting values each battle</small></div>${detail}<div><div class="eyebrow">The gatekeeper</div><p>${o.archon || "An unknown Archon waits."}</p><small>Herald victories and Tavern gossip reveal its identity.${o.nextHealerHint != null ? `<br>Next Tavern: ${o.nextHealerHint ? "healer visiting" : "no healer"}.` : ""}</small></div><div class="log">${o.log
    .slice(-9)
    .reverse()
    .map((s) => `<p>${esc(s)}</p>`)
    .join(
      "",
    )}</div><div><button data-ui="help" class="quiet">Rules & keywords ↗</button><div class="row"><button data-ui="botStep" title="Let the weighted bot choose one legal action">AI step</button><button data-ui="botToggle">${auto ? "Stop AI" : "Watch AI"}</button></div><div class="botbar">${esc(reason || "The AI uses the same visible state and legal choices as you.")}</div></div></aside>`;
}
function menu() {
  auto = false;
  clearTimeout(autoTimer);
  app.innerHTML = `<section class="hero"><div class="hero-copy"><div class="sigil"><span>✧</span></div><div class="eyebrow">A journey through the Strata</div><h1>ASTRATA</h1><p>A living spellbook.<br>A forest that will not rest.<br>Make room for what comes next.</p><nav><button class="primary" data-ui="new">New Game <span style="float:right">→</span></button>${data.save ? `<button data-ui="continue">Continue <small>· Druid · ${data.save.hp} HP · Round ${data.save.field.round}</small></button>` : ""}<button data-ui="settings">Settings</button><button data-ui="history">Run History</button><button data-ui="quit">Quit</button></nav><div class="hero-foot muted">STRATUM 1 · v1 · Polish 1 · Mouse / Enter / Escape</div></div></section>`;
  bind();
}
async function persist() {
  if (!game) return;
  elapsed = Date.now() - started;
  if (game.s.mode === "result") {
    const o = game.observe();
    await storage.result({ ...o, runId, realTimeMs: elapsed, apexDefeats: 0 });
    data = await storage.load();
  } else {
    const save = { ...game.save(), uiMeta: { runId, elapsed } };
    await storage.save(save);
    data.save = save;
  }
}
async function act(a) {
  if (busy) return;
  busy = true;
  try {
    const before = game.observe();
    game.capturePresentation = true;
    game.act(a);
    audio.emit("decision");
    selectedHand = null;
    selectedSlot = null;
    await persist();
    await playFrames(
      before,
      game.presentation || [],
      game.observe(),
      render,
      () => settings.fast,
    );
    render();
  } catch (e) {
    toast(e.message);
    console.error(e);
  } finally {
    busy = false;
  }
  if (auto) schedule();
}
function schedule() {
  clearTimeout(autoTimer);
  if (auto && game?.s.mode !== "result" && modal.hidden)
    autoTimer = setTimeout(stepBot, 250);
}
async function stepBot() {
  if (!game || game.s.mode === "result") {
    auto = false;
    return;
  }
  const d = policy.choose(game.observe(), game.legal());
  if (!d) {
    auto = false;
    toast("No legal choice available.");
    return;
  }
  reason = d.reason;
  await act(d.action);
}
function render(frame = null) {
  if (!game) return menu();
  const o = frame || game.observe(),
    actions = frame ? [] : game.legal();
  let body = "";
  if (o.pendingArmor) {
    body = `<div class="result"><h2>Three Armors, one traveler</h2><p>Choose what to keep.</p><div class="choices">${actions.map((a) => actionButton(a)).join("")}</div></div>`;
  } else if (["class", "gem", "intro"].includes(o.mode)) {
    const title =
      o.mode === "class"
        ? "The Druid"
        : o.mode === "gem"
          ? "A first glimmer"
          : "The Ashen Weald";
    const copy =
      o.mode === "class"
        ? "Coax life from the space between spells. Grow Allies, weave elemental patterns, and turn a crowded mind into a living grove."
        : o.mode === "gem"
          ? `${items[o.startGem].name} carries ${items[o.startGem].element}. Imbue your Bracelet to protect, or your Ring to strike. Gems can be moved at Taverns.`
          : "The Apex Predator terrorizes Astrata. Your journey begins among pale roots and dark pools. Beyond the Weald, an Archon guards the way to the deeper Strata. Gather what you can before it wakes.";
    body = `<section class="scene"><div class="scene-art" style="background-image:url('assets/location-${o.mode === "intro" ? "field" : "druid"}.png')"></div><div class="scene-copy"><div class="eyebrow">${o.mode === "class" ? "Choose your class" : o.mode === "gem" ? "Choose your starting socket" : "Stratum one"}</div><h2>${title}</h2><div class="rule"></div><p>${copy}</p>${o.mode === "class" ? '<p><span class="tag">65 HP</span> <span class="tag">Sapling signature</span></p>' : ""}<div class="choices">${actions.map((a) => actionButton(a, "primary")).join("")}</div></div></section>`;
  } else if (o.mode === "field") {
    const f = o.field;
    body = `<div class="layout"><section><div class="section-head"><div><div class="eyebrow">Stratum one</div><h2>The Ashen Weald</h2></div><div class="muted">${f.moves} movement remaining<br><small>${f.spawned} / 16 spawns</small></div></div><div class="field-wrap"><div class="field">${Array.from(
      { length: 121 },
      (_, i) => {
        const x = i % 11,
          y = Math.floor(i / 11),
          entities = f.entities.filter((e) => e.x === x && e.y === y),
          foe = entities.find((e) => e.enemy),
          player = x === f.x && y === f.y,
          a = actions.find((a) => a.type === "move" && a.x === x && a.y === y),
          e = foe || entities[0];
        return `<button class="tile ${player ? "player" : ""} ${a ? "reachable" : ""}" ${a ? `data-action="${esc(a.key)}"` : `data-tile="${i}"`} title="${esc(`${x + 1}, ${y + 1}${entities.length ? ": " + entities.map((e) => (e.enemy ? enemies[e.enemy].name : e.type)).join(", ") : ""}`)}"><span class="coord">${x === 5 && y === 5 ? "✧" : ""}</span>${foe ? img("enemy-" + foe.enemy) : e ? `<span class="glyph">${{ Gold: "◈", Item: "◇", Event: "?", Tavern: "♜" }[e.type]}</span>` : ""}${player ? '<span class="player-mark">✦</span>' : ""}${entities.length > 1 ? `<span class="count">${entities.length}</span>` : ""}</button>`;
      },
    ).join(
      "",
    )}</div><div class="row spread"><div class="queue">${f.queue.map((t) => `<span title="Upcoming spawn type">${t}</span>`).join("") || "<small>The Archon has arrived.</small>"}</div>${actions
      .filter((a) => a.type === "wait")
      .map((a) => actionButton(a, "primary"))
      .join(
        "",
      )}</div><small>Click a lit neighboring tile. Diagonals are allowed. Entering an occupied tile ends movement.</small></div></section>${sidebar(o)}</div>`;
  } else if (o.mode === "battle") {
    const b = o.battle;
    let selectedActions =
      selectedSlot != null
        ? actions.filter((a) => a.slot === selectedSlot && a.type !== "place")
        : [];
    body = `<div class="layout"><section><div class="section-head"><div><div class="eyebrow">Battle · Turn ${b.turn}</div><h2>The Mind Grid</h2></div><div class="resources"><span><b>${b.insight || 0}</b>${key("Insight")}</span><span><b>${b.focus || 0}</b>${key("Focus")}</span><span><b>${b.channel || 0}</b>${key("Channel")}</span></div></div><div class="enemy-line">${b.enemies
      .map(
        (e) =>
          `<article class="enemy" data-enemy="${e.id}" title="${esc(e.signature + " Counterplay: " + e.counter)}">${img("enemy-" + e.id)}<div class="info"><h4>${e.name}</h4><small style="color:var(--${e.element})">${e.element} · ${e.hp} / ${e.maxHp} HP ${e.restless ? "· Restless " + e.restless : ""}</small><div class="health-track"><i style="width:${Math.max(0, (e.hp / e.maxHp) * 100)}%"></i></div><div class="tell">${text(tellText(e.tell))}</div><small>${Object.entries(
            e.status,
          )
            .filter(([k, v]) => v)
            .map(([k, v]) => k + " " + v)
            .join(
              " · ",
            )}${e.flicker ? " · Negates next activation" : ""}${e.guard ? " · Guard " + e.guard : ""}</small></div></article>`,
      )
      .join(
        "",
      )}</div><div class="phasebar"><span>1 · Reveal</span><span class="${b.phase === "place" ? "active" : ""}">2 · Placement</span><span class="${b.phase === "activate" ? "active" : ""}">3 · Activation</span><span class="${b.phase === "enemy" || b.reaction ? "active" : ""}">4 · Enemy</span></div><div class="mind">${b.grid
      .map((slot, i) => {
        const c = slot.at(-1),
          d = cards[c?.id],
          valid =
            selectedHand != null &&
            actions.some(
              (a) =>
                a.type === "place" && a.uid === selectedHand && a.slot === i,
            ),
          spent = c && (c.zeroWard || game.allowance(c, i) === 0);
        return `<button class="slot ${c ? "" : "empty"} ${valid ? "valid" : ""} ${selectedSlot === i ? "chosen" : ""} ${spent ? "spent" : ""}" data-slot="${i}" title="${esc(c ? d.name + ": " + d.text : "Empty slot " + (i + 1))}">${c ? `${img("card-" + c.id)}<span class="level">${slot.length > 1 ? "Lv " + slot.length + " · " : ""}${i + 1}</span><span class="overlay"><span class="name">${d.name}${c.upgrade ? " +" : ""}</span><span class="nums">${d.type === "Ally" ? "♥ " + c.hp + " · " : ""}${d.type === "Ward" ? "Ward " + c.ward + " · " : ""}${d.limit < 0 ? "∞" : game.allowance(c, i)} acts${c.charge ? " · ⚡" + c.charge : ""}${c.lock ? " · Lock" : ""}${c.sever ? " · Sever" : ""}${c.freeze >= b.turn ? " · Freeze" : ""}</span></span>` : i + 1}</button>`;
      })
      .join("")}</div>${
      b.reaction
        ? `<div class="panel pulse" style="margin-top:12px"><h4>${b.reaction.name} · ${b.reaction.damage} ${b.reaction.element} damage remaining</h4><p>${b.reaction.stage === "ally" ? "Choose an Ally or let your equipment take the hit." : "Choose which " + (b.reaction.stage === "shield" ? "Shield portion" : "Bracelet") + " absorbs this hit."}</p><div class="row wrap">${actions.map((a) => actionButton(a)).join("")}</div></div>`
        : `<div class="row spread" style="margin-top:12px"><small>${b.phase === "place" ? "Choose a revealed card, then a lit slot. Click a placed card to Recall." : "Click a placed card, then choose its activation and target."}</small>${actions
            .filter((a) => ["activatePhase", "endTurn"].includes(a.type))
            .map((a) => actionButton(a, "primary"))
            .join(
              "",
            )}</div><div class="hand">${b.hand.map((c) => card(c, { select: true })).join("")}</div>`
    }<div class="row"><button data-ui="piles" class="quiet">Grimoire ${b.deck.length} · Discard ${b.discard.length} · Destroyed ${b.destroyed.length}</button><small>${Object.entries(
      o.status,
    )
      .filter(([k, v]) => v)
      .map(([k, v]) => k + " " + v)
      .join(" · ")}</small></div></section>${sidebar(o)}</div>`;
  } else if (o.mode === "event") {
    body = `<section class="scene"><div class="scene-art" style="background-image:url('assets/event-${o.event.id}.png')"></div><div class="scene-copy"><div class="eyebrow">An encounter in the Weald</div><h2>${o.event.name}</h2><div class="rule"></div><p>${o.event.text}</p><div class="choices">${actions.map((a) => actionButton(a)).join("")}</div>${botControls()}</div></section>`;
  } else if (o.mode === "tavern") {
    body = `<div class="layout"><section></section>${sidebar(o)}</div>`;
  } else if (o.mode === "reward" || o.mode === "item") {
    const title =
      o.mode === "item"
        ? "Something left behind"
        : o.reward.cards
          ? "The spoils of victory"
          : o.reward.gem
            ? "A glimmer to keep"
            : o.reward.setting
              ? "A Setting for the journey"
              : "The way is clear";
    body = `<div class="layout"><section><div class="eyebrow">${o.mode === "reward" ? "Victory" : "Discovery"}</div><h2 style="margin:8px 0 28px">${title}</h2><div class="catalog">${actions
      .filter((a) => a.id || a.type === "takeItem")
      .map((a) => {
        const id =
            a.id ||
            (o.itemOffer[a.index].startsWith("card:")
              ? o.itemOffer[a.index].slice(5)
              : o.itemOffer[a.index]),
          isCard =
            a.type === "rewardCard" ||
            (a.type === "takeItem" && o.itemOffer[a.index].startsWith("card:"));
        return `<div>${isCard ? card({ id }) : `<div class="card">${img("item-" + id)}<div class="body"><h4>${items[id].name}</h4><p class="text">${text(items[id].text)}</p></div></div>`}<div style="margin-top:12px">${actionButton(a, "primary")}</div></div>`;
      })
      .join("")}</div><div class="row" style="margin-top:30px">${actions
      .filter((a) => ["skipReward", "continueReward"].includes(a.type))
      .map((a) => actionButton(a))
      .join("")}</div></section>${sidebar(o)}</div>`;
  } else if (o.mode === "result") {
    auto = false;
    clearTimeout(autoTimer);
    if (!resultsShown) {
      body = `<section class="hero"><div class="hero-copy"><div class="eyebrow">${o.outcome === "win" ? "The gatekeeper has fallen" : "The Weald remembers"}</div><h1 style="font-size:52px;letter-spacing:.03em">${o.outcome === "win" ? "Stratum 1 Complete" : "You Died"}</h1><div class="rule" style="width:280px"></div><p>${o.outcome === "win" ? "For a moment, the branches grow still. Your first journey is complete." : esc(o.cause) + ". Another traveler may find a different way."}</p><button class="primary" data-ui="results">View results →</button></div></section>`;
    } else body = resultMarkup(o);
  }
  app.innerHTML =
    (o.mode === "result" && !resultsShown ? "" : header(o)) + body;
  bind();
  enhance({
    game,
    o,
    actions,
    frame,
    app,
    modal,
    settings,
    act,
    render,
    dialog,
    close,
    img,
    esc,
    text,
    card,
    actionButton,
    busy: () => busy,
    select: (uid) => {
      selectedHand = uid;
      selectedSlot = null;
    },
    inspect: inspectCard,
    saveSettings: () => storage.settings(settings),
    service,
    setService: (value) => {
      service = value;
      render();
    },
  });
  app.classList.toggle("presenting", !!frame);
}
function botControls() {
  return `<div class="row" style="margin-top:20px"><button data-ui="botStep" class="quiet">AI step</button><button data-ui="botToggle" class="quiet">${auto ? "Stop AI" : "Watch AI"}</button></div>`;
}
function resultMarkup(o) {
  const st = o.stats;
  return `<section class="result"><div class="result-title"><div class="eyebrow">Druid · ${o.outcome === "win" ? "Victory" : "Defeat"}</div><h1>Your journey, remembered</h1><p>${o.outcome === "win" ? "Stratum 1 Complete" : esc(o.cause)} · Seed ${o.seed}</p></div><div class="stat-grid"><div><b>${o.field.round}</b>Field rounds</div><div><b>${st.damageDealt}</b>Damage dealt</div><div><b>${st.damageTaken}</b>Damage taken</div><div><b>${Math.floor((o.realTimeMs || elapsed) / 60000)}:${String(Math.floor((o.realTimeMs || elapsed) / 1000) % 60).padStart(2, "0")}</b>Time played</div></div><div class="result-grid"><div class="panel"><h4>Encounters</h4>${st.encounters.map((e) => `<p>Round ${e.round} · ${e.enemies.join(", ")}<br><small>${e.outcome} · ${e.turns || 0} turns · HP ${e.hpStart} → ${e.hpEnd}</small></p>`).join("")}</div><div class="panel"><h4>The final Grimoire</h4><p>${o.deck.map((c) => cards[c.id].name + (c.upgrade ? " +" : "")).join(" · ")}</p><h4>Cards gained</h4><p>${st.cardsGained.join(" · ") || "None"}</p><h4>Belongings</h4><p>${st.itemsGained.join(" · ") || "None"}</p><small>Gold earned ${st.goldEarned} · spent ${st.goldSpent}<br>Bought: ${st.purchases.map((id) => (id.startsWith("card:") ? cards[id.slice(5)].name : items[id]?.name || id)).join(", ") || "None"}<br>Sold: ${st.sales.map((id) => items[id]?.name || id).join(", ") || "None"}</small></div></div><div class="row spread" style="margin-top:25px"><small>Saved to persistent Run History.</small><button class="primary" data-ui="home">Return to start</button></div></section>`;
}
function dialog(html) {
  modal.innerHTML = `<section class="dialog"><button class="dialog-close quiet" data-close aria-label="Close">✕</button>${html}</section>`;
  modal.classList.remove("card-peek");
  modal.hidden = false;
  clearTimeout(autoTimer);
  bind(modal);
  modal.querySelector("button")?.focus();
}
function close() {
  modal.hidden = true;
  modal.classList.remove("card-peek");
  modal.innerHTML = "";
  schedule();
}
function polishContext() {
  return {
    game,
    o: game?.observe(),
    actions: game?.legal() || [],
    app,
    modal,
    settings,
    act,
    render,
    dialog,
    close,
    img,
    esc,
    text,
    card,
    actionButton,
    busy: () => busy,
    select: (uid) => {
      selectedHand = uid;
      selectedSlot = null;
    },
  };
}
function inspectCard(id) {
  showCard(polishContext(), { id });
}
function inventory() {
  showEquipment(polishContext());
}
function showSettings() {
  dialog(
    `<h2>Settings</h2><label>Display <select id="display"><option value="windowed" ${!settings.fullscreen ? "selected" : ""}>Windowed</option><option value="fullscreen" ${settings.fullscreen ? "selected" : ""}>Fullscreen</option></select></label><label>Resolution <select id="resolution">${[
      [1280, 800],
      [1440, 900],
      [1600, 1000],
      [1920, 1080],
    ]
      .map(
        ([w, h]) =>
          `<option value="${w},${h}" ${settings.width === w ? "selected" : ""}>${w} × ${h}</option>`,
      )
      .join(
        "",
      )}</select></label><label>Fast animations <input id="fast" type="checkbox" ${settings.fast ? "checked" : ""}></label><label>Music <input id="music" type="range" min="0" max="100" value="${settings.music}"></label><label>Effects <input id="effects" type="range" min="0" max="100" value="${settings.effects}"></label><small>This edition is silent. Volume settings are retained for future audio.</small><div style="margin-top:20px"><button class="primary" data-ui="applySettings">Apply</button></div>`,
  );
}
async function ui(name) {
  if (busy) return;
  switch (name) {
    case "new":
      if (data.save) {
        dialog(
          '<h2>Begin a new journey?</h2><p>This forfeits the saved run.</p><button class="danger" data-ui="newConfirmed">Forfeit & begin</button>',
        );
      } else await ui("newConfirmed");
      break;
    case "newConfirmed":
      close();
      game = new Game();
      runId = crypto.randomUUID();
      started = Date.now();
      elapsed = 0;
      resultsShown = false;
      await persist();
      render();
      break;
    case "continue":
      game = new Game(0, data.save);
      runId = data.save.uiMeta?.runId || crypto.randomUUID();
      started = Date.now() - (data.save.uiMeta?.elapsed || 0);
      resultsShown = false;
      render();
      break;
    case "home":
      close();
      game = null;
      data = await storage.load();
      menu();
      break;
    case "results":
      resultsShown = true;
      render();
      break;
    case "settings":
      showSettings();
      break;
    case "applySettings": {
      const [width, height] = modal
        .querySelector("#resolution")
        .value.split(",")
        .map(Number);
      settings = {
        width,
        height,
        fast: modal.querySelector("#fast").checked,
        fullscreen: modal.querySelector("#display").value === "fullscreen",
        music: Number(modal.querySelector("#music").value),
        effects: Number(modal.querySelector("#effects").value),
      };
      await storage.settings(settings);
      close();
      break;
    }
    case "quit":
      await persist();
      await storage.quit();
      break;
    case "pause":
      dialog(
        `<h2>A moment of stillness</h2><div class="column"><button data-close>Resume</button><button data-ui="settings">Settings</button><button data-ui="quit">Return to Desktop · autosaves first</button><button class="danger" data-ui="abandon">Abandon Run · deletes the save</button></div>`,
      );
      break;
    case "abandon":
      dialog(
        '<h2>Abandon this journey?</h2><p>The save will be deleted.</p><button class="danger" data-ui="abandonConfirmed">Abandon Run</button>',
      );
      break;
    case "abandonConfirmed":
      auto = false;
      await storage.save(null);
      game = null;
      data = await storage.load();
      close();
      menu();
      break;
    case "inventory":
      inventory();
      break;
    case "grimoire":
      dialog(
        `<h2>Your Grimoire</h2><p>Unordered. Every card returns after battle.</p><div class="catalog">${game.s.deck.map((c) => card(c)).join("")}</div>`,
      );
      break;
    case "piles": {
      const b = game.observe().battle;
      dialog(
        ["deck", "discard", "destroyed"]
          .map(
            (k) =>
              `<h2>${k === "deck" ? "Grimoire" : k}</h2><div class="catalog" style="margin-bottom:25px">${b[k].map((c) => card(c)).join("") || "<p>Empty</p>"}</div>`,
          )
          .join(""),
      );
      break;
    }
    case "help":
      dialog(
        `<h2>The language of the Grimoire</h2><p>Fire → Earth → Wind → Water → Fire. Forward +50%, backward −50%; damage rounds up. Chaos and Light are mutually strong. Arcane is neutral.</p>${Object.entries(
          glossary,
        )
          .map(([k, v]) => `<p><b class="gold">${k}</b> · ${v}</p>`)
          .join("")}`,
      );
      break;
    case "history":
      data = await storage.load();
      dialog(
        `<h2>Run History</h2><div class="choices">${(data.history || []).map((h, i) => `<button data-history="${i}">Druid · ${h.outcome} · Round ${h.field.round} · Seed ${h.seed}</button>`).join("") || "<p>No journeys recorded yet.</p>"}</div>`,
      );
      break;
    case "botStep":
      await stepBot();
      break;
    case "botToggle":
      auto = !auto;
      render();
      schedule();
      break;
  }
}
function bind(root = app) {
  root.querySelectorAll("[data-enemy]").forEach(
    (el) =>
      (el.onclick = () => {
        const e = enemies[el.dataset.enemy];
        dialog(
          "<h2>" +
            e.name +
            '</h2><div class="row">' +
            img("enemy-" + e.id) +
            "<div><p>" +
            e.element +
            " · " +
            e.hp +
            " HP · " +
            e.tier +
            "</p><p>" +
            e.movement +
            " " +
            (e.speed || "") +
            (e.schedule ? " · " + e.schedule : "") +
            "</p><p>" +
            e.signature +
            "</p><small>Counterplay: " +
            e.counter +
            '</small></div></div><h3 style="margin-top:20px">Tell rotation</h3>' +
            e.rotation.map((t) => "<p>" + text(tellText(t)) + "</p>").join("") +
            '<p class="muted">Each completed cycle adds 1 attack damage. Restless adds 1 damage per token. Archons below half HP add 3 attack damage.</p>',
        );
      }),
  );

  root.querySelectorAll("[data-action]").forEach(
    (el) =>
      (el.onclick = async () => {
        if (busy) return;
        const wasOpen = !modal.hidden;
        if (wasOpen) close();
        await act(el.dataset.action);
      }),
  );
  root
    .querySelectorAll("[data-ui]")
    .forEach((el) => (el.onclick = () => ui(el.dataset.ui)));
  root.querySelectorAll("[data-close]").forEach((el) => (el.onclick = close));
  root.querySelectorAll("[data-hand]").forEach(
    (el) =>
      (el.onclick = () => {
        selectedHand = Number(el.dataset.hand);
        selectedSlot = null;
        render();
      }),
  );
  root.querySelectorAll("[data-slot]").forEach(
    (el) =>
      (el.onclick = () => {
        const slot = Number(el.dataset.slot),
          a = game
            .legal()
            .find(
              (a) =>
                a.type === "place" && a.uid === selectedHand && a.slot === slot,
            );
        if (a) act(a);
        else {
          selectedSlot = slot;
          selectedHand = null;
          render();
        }
      }),
  );
  root
    .querySelectorAll("[data-inspect-card]")
    .forEach((el) => (el.onclick = () => inspectCard(el.dataset.inspectCard)));
  root.querySelectorAll("[data-service]").forEach(
    (el) =>
      (el.onclick = () => {
        service = el.dataset.service;
        render();
      }),
  );
  root
    .querySelectorAll("[data-history]")
    .forEach(
      (el) =>
        (el.onclick = () =>
          dialog(resultMarkup(data.history[Number(el.dataset.history)]))),
    );
  root.querySelectorAll("[data-tile]").forEach(
    (el) =>
      (el.onclick = () => {
        const i = Number(el.dataset.tile),
          entities = game.s.field.entities.filter(
            (e) => e.x === i % 11 && e.y === Math.floor(i / 11),
          );
        if (entities.length)
          dialog(
            `<h2>Across the Weald</h2>${entities.map((e) => (e.enemy ? `<div class="row" style="margin:20px 0">${img("enemy-" + e.enemy)}<div><h3>${enemies[e.enemy].name}</h3><p>${enemies[e.enemy].movement} · ${enemies[e.enemy].schedule || ""} · Restless ${e.restless}</p><p>${enemies[e.enemy].signature}</p><small>${enemies[e.enemy].counter}</small></div></div>` : `<p>${e.type}${e.value ? " · " + e.value + " Gold" : ""}</p>`)).join("")}`,
          );
      }),
  );
}
document.addEventListener("keydown", (e) => {
  if (busy) return;
  if (e.key === "Escape") {
    e.preventDefault();
    if (!modal.hidden) close();
    else if (game) ui("pause");
  }
  if (e.key === "Enter" && document.activeElement?.tagName !== "BUTTON") {
    const button = (!modal.hidden ? modal : app).querySelector(
      "button.primary",
    );
    if (button) {
      e.preventDefault();
      button.click();
    }
  }
});
window.addEventListener("error", (e) =>
  toast("Unexpected error: " + e.message),
);
installTooltips();
menu();
