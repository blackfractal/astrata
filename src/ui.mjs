import { ELVES_STORY, CORRUPTIONS } from "./strata.mjs";
import { startLoomTutorial, LOOM_TUTORIAL } from "./loom-tutorial.mjs";
import { paintCorruptions } from "./corruptions-ui.mjs";
import { showArchives } from "./archives-ui.mjs";
import { discover, emptyCollection } from "./archive-profile.mjs";
import { fieldEntitiesAt } from "./field-display.mjs";
import {
  startTutorial,
  TUTORIAL,
  TUTORIAL_STEPS,
  tutorialGuide,
} from "./tutorial.mjs";
import { paintTutorial, clearTutorialUI } from "./tutorial-ui.mjs";
import { deathMessage, deathSummary } from "./death.mjs";
import { runRecord } from "./run-record.mjs";
import { installStage } from "./stage.mjs";
import { enhance, showCard, showEquipment } from "./polish-ui.mjs";
import { playFrames, installTooltips } from "./presentation.mjs";
import { Game, incomingDamageText } from "./engine.mjs";
import {
  cards,
  items,
  enemies,
  glossary,
  VERSION,
  DRUID_COMPANION_STORY,
} from "./content.mjs";
import { upgradeBadge } from "./card-upgrade-ui.mjs";
import { artPaths } from "./art-paths.mjs";
import { WeightedPolicy } from "./policy.mjs";
installStage();
const app = document.querySelector("#app"),
  modal = document.querySelector("#modal");
const storage = window.desktop || {
  record: async (event) => {
    const key = "astrata-run-" + event.runId;
    const events = JSON.parse(localStorage.getItem(key) || "[]");
    events.push({
      ...event,
      recordedAt: new Date().toISOString(),
      packageVersion: null,
    });
    localStorage.setItem(key, JSON.stringify(events));
    const d = await storage.load();
    discover(d.collections, event.state || event.result);
    localStorage.setItem("astrata", JSON.stringify(d));
  },
  load: async () => {
    const d = JSON.parse(localStorage.getItem("astrata") || '{"history":[]}');
    d.collections ||= emptyCollection();
    if (!d.collections.importedTraces) {
      for (const key of Object.keys(localStorage).filter((key) =>
        key.startsWith("astrata-run-"),
      )) {
        for (const event of JSON.parse(localStorage.getItem(key) || "[]"))
          discover(
            d.collections,
            event.state || event.result,
            event.recordedAt,
          );
      }
      d.collections.importedTraces = true;
    }
    for (const state of [...(d.history || []), d.save, d.tutorialSave])
      discover(d.collections, state);
    localStorage.setItem("astrata", JSON.stringify(d));
    return d;
  },
  save: async (save, options = {}) => {
    const d = await storage.load();
    if (save?.tutorial)
      browserTutorialStats(d, save, "start", save.uiMeta?.runId);
    localStorage.setItem(
      "astrata",
      JSON.stringify({
        ...d,
        [save?.tutorial || options.tutorial ? "tutorialSave" : "save"]: save,
      }),
    );
  },
  result: async (r) => {
    const d = await storage.load();
    discover(d.collections, r);
    if (r.tutorial) browserTutorialStats(d, r, "complete", r.runId);
    localStorage.setItem(
      "astrata",
      JSON.stringify({
        ...d,
        [r.tutorial ? "tutorialSave" : "save"]: null,
        history: [...(d.history || []).filter((x) => x.runId !== r.runId), r],
      }),
    );
  },
  settings: async (settings) => {
    const d = await storage.load();
    localStorage.setItem("astrata", JSON.stringify({ ...d, settings }));
  },
  quit: () => window.close(),
};
function browserTutorialStats(data, state, event, id) {
  if (!id) return;
  const stats = (data.tutorialStats ||= {});
  const t = (stats[state.tutorial.id] ||= {
    starts: [],
    completions: [],
    firstCompletedAt: null,
  });
  const at = new Date().toISOString();
  if (event === "start" && !t.starts.some((x) => x.runId === id))
    t.starts.push({ runId: id, at, version: state.tutorial.version });
  if (
    event === "complete" &&
    state.tutorial.completed &&
    state.outcome === "win" &&
    !t.completions.some((x) => x.runId === id)
  ) {
    t.completions.push({ runId: id, at, version: state.tutorial.version });
    t.firstCompletedAt ||= at;
  }
}
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
  height: 810,
  fullscreen: false,
  music: 50,
  effects: 50,
  fast: false,
  ...data.settings,
};
settings.height = Math.round((settings.width * 9) / 16);
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
    t.damage || (t.damagePerEmpty && t.emptySpaces != null)
      ? `${t.damage || 0} ${t.randomElement ? "in the new element" : t.element}${t.hits ? " ×" + t.hits : ""}`
      : "",
    t.randomElement ? "Change element randomly" : "",
    t.sequence
      ? t.sequence.map((x) => x.damage + " " + x.element).join(" → ")
      : "",
    t.antiElemental
      ? "Counters your largest elemental Guard total; ties → Arcane"
      : "",
    t.disrupt
      ? "Wrap whole " +
        (t.disrupt === "H" ? "row right" : "column down") +
        " 2 spaces; Holes destroy, Hypnosis compels"
      : "",
    t.markCorruption
      ? `Mark ${t.count || 1} ${CORRUPTIONS[t.markCorruption].name}${t.alsoCorruption ? " + 1 " + CORRUPTIONS[t.alsoCorruption].name : ""} · one turn to respond`
      : "",
    t.applyCorruption ? "Corrupt marked spaces" : "",
    t.releaseCorruption ? "Remove its Corruptions" : "",
    t.damagePerEmpty
      ? `${t.damagePerEmpty} per empty space before Collapse; hit after destruction${t.emptySpaces != null ? ` (${t.emptySpaces} empty)` : ""}`
      : "",
    t.damagePerAlly
      ? `+${t.damagePerAlly} per Ally per hit${t.allyCount != null ? ` (${t.allyCount} Allies)` : ""}`
      : "",
    t.purify ? "Remove Burn, Poison and Corrode" : "",
    t.pierce ? "Pierce" : "",
    t.cull ? "Cull" : "",
    t.grid === "row"
      ? "Destroy fullest row"
      : t.grid === "column"
        ? "Destroy fullest column"
        : t.grid === "destroy" && t.target === "valuable"
          ? `Destroy ${t.count || 1} most valuable stacks`
          : t.grid === "destroy" && t.target === "tallest"
            ? "Destroy tallest stack"
            : t.grid
              ? `${t.grid} ${t.count || 1} · ${t.target}`
              : "",
    ...["burn", "poison", "corrode"]
      .filter((k) => t[k])
      .map((k) => k[0].toUpperCase() + k.slice(1) + " " + t[k]),
    ...["insight", "focus", "channel"]
      .filter((k) => t[k])
      .map((k) => `${t[k]} ${k[0].toUpperCase() + k.slice(1)} next turn only`),
    t.guard ? "Gain " + t.guard + " Guard" : "",
    t.flicker ? "Negate next offensive activation" : "",
    t.howl ? "Wolves gain " + t.howl + " attack" : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
const key = (s) =>
  `<span class="key" title="${esc(glossary[s] || s)}">${s}</span>`;
const text = (s) => esc(s);
function toast(s) {
  const el = document.querySelector("#toast");
  el.textContent = s;
  el.style.display = "block";
  setTimeout(() => (el.style.display = "none"), 3500);
}
function card(c, { select = false } = {}) {
  const d = cards[c.id],
    live = c.used != null;
  return `<button class="card ${selectedHand === c.uid ? "selected" : ""}" ${select ? `data-hand="${c.uid}"` : `data-inspect-card="${c.id}"`} title="${esc(d.text)}">${img("card-" + c.id)}${upgradeBadge(c)}<span class="cost" title="Focus cost">${d.focus === 99 ? "—" : d.focus}</span><div class="body"><div class="eyebrow" style="color:var(--${c.element || d.element})">${c.element || d.element} · ${d.type}</div><h4>${d.name}${c.upgrade ? " +" : ""}</h4><div class="text">${text(d.text)}</div><div class="meta">${d.limit < 0 ? "∞" : live ? Math.max(0, d.limit - c.used) : d.limit} activations · ${d.channel} Channel<br>Recall ${d.recall == null ? "—" : d.recall} · ${d.rarity}</div></div></button>`;
}
function actionButton(a, cls = "") {
  return `<button class="${cls}" data-action="${esc(a.key)}">${esc(a.label)}</button>`;
}
function directionPad(field, actions) {
  const directions = [
    [-1, -1, "northwest", -45],
    [0, -1, "north", 0],
    [1, -1, "northeast", 45],
    [-1, 0, "west", -90],
    null,
    [1, 0, "east", 90],
    [-1, 1, "southwest", -135],
    [0, 1, "south", 180],
    [1, 1, "southeast", 135],
  ];
  return `<div class="direction-pad" role="group" aria-label="Move on the map">${directions
    .map((d) => {
      if (!d)
        return '<span class="direction-center" aria-hidden="true">•</span>';
      const [dx, dy, name, angle] = d;
      const action = actions.find(
        (a) =>
          a.type === "move" && a.x === field.x + dx && a.y === field.y + dy,
      );
      const destination = field.entities
        .filter((e) => e.x === field.x + dx && e.y === field.y + dy)
        .map((e) => (e.enemy ? enemies[e.enemy].name : e.type))
        .join(", ");
      return `<button class="direction-button" data-direction="${name}" aria-label="Move ${name}" title="${esc(action ? `Move ${name}${destination ? " · " + destination : ""}` : `Cannot move ${name}`)}" ${action ? `data-action="${esc(action.key)}"` : "disabled"}><svg viewBox="0 0 24 24" aria-hidden="true" style="transform:rotate(${angle}deg)"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>`;
    })
    .join("")}</div>`;
}
function phaseBar(b, actions) {
  const arrow = (type, label, hint) => {
    const action = actions.find((a) => a.type === type);
    return `<button class="phase-arrow ${action ? "primary available" : ""}" aria-label="${label}" title="${hint}" ${action ? `data-action="${esc(action.key)}"` : "disabled"}><svg viewBox="0 0 32 24" aria-hidden="true"><path d="M3 12h24M18 3l9 9-9 9" /></svg></button>`;
  };
  return `<nav class="phasebar" aria-label="Battle phases">
    <span class="phase-step ${b.phase === "start" && !b.reaction ? "active" : "completed"}">1 · Reveal</span>
    <span class="phase-arrow automatic" role="img" aria-label="Reveal to placement advances automatically" title="Reveal advances to Placement automatically"><svg viewBox="0 0 32 24" aria-hidden="true"><path d="M3 12h24M18 3l9 9-9 9" /></svg></span>
    <span class="phase-step ${b.phase === "place" && !b.reaction ? "active" : ""}">2 · Placement</span>
    ${arrow("activatePhase", "Begin activation", "Finish placement and begin activation. You cannot return to placement this turn.")}
    <span class="phase-step ${b.phase === "activate" && !b.reaction ? "active" : ""}">3 · Activation</span>
    ${arrow("endTurn", "End turn", "Finish activation and let enemies act.")}
    <span class="phase-step ${b.phase === "enemy" || b.reaction ? "active" : ""}">4 · Enemy</span>
  </nav>`;
}
function header(o) {
  return `<header><span class="brand">ASTRATA</span><div class="row stats"><span><b class="hp">${o.hp}</b> / ${o.maxHp} HP</span><span><b class="gold">${o.gold}</b> Gold</span><span>Stratum <b>${o.stratum || 1}</b> · Round <b>${o.field.round || "—"}</b></span></div><div class="row"><button data-ui="grimoire">Grimoire</button><button data-ui="inventory">Inventory</button><button data-ui="pause">☰ Menu</button></div></header>`;
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
  clearTutorialUI();
  app.classList.remove("battle-scene", "in-loom");
  auto = false;
  clearTimeout(autoTimer);
  app.innerHTML = `<section class="hero"><div class="hero-copy"><div class="sigil"><span>✧</span></div><div class="eyebrow">A journey through the Strata</div><h1>ASTRATA</h1><p>A living spellbook.<br>A forest that will not rest.<br>Make room for what comes next.</p><nav><button class="primary" data-ui="new">New Game <span style="float:right">→</span></button>${data.save ? `<button data-ui="continue">Continue <small>· Druid · ${data.save.hp} HP · Round ${data.save.field.round}</small></button>` : ""}${data.tutorialSave ? `<button data-ui="continueTutorial">Resume tutorial <small>· ${data.tutorialSave.tutorial?.name || "The First Clearing"}</small></button>` : ""}<button data-ui="tutorialMenu">Tutorial</button><button data-ui="settings">Settings</button><button data-ui="archives">Archives</button><button data-ui="quit">Quit</button></nav><div class="hero-foot muted">STRATA 1–2 · v2 · Mouse / Enter / Escape</div></div></section>`;
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
    data[game.s.tutorial ? "tutorialSave" : "save"] = save;
  }
}
async function act(a, controller = { kind: "human" }) {
  if (busy) return;
  busy = true;
  let startLoom = false;
  try {
    const before = game.observe();
    game.capturePresentation = true;
    const action =
      typeof a === "string" ? game.legal().find((x) => x.key === a) : a;
    const independent = game.s.tutorial?.lesson === "independent";
    game.act(action);
    if (independent) game.s.tutorial.independentIntroDismissed = true;
    if (action.type === "tutorialRetry") {
      const retryOf = runId;
      runId = crypto.randomUUID();
      started = Date.now();
      elapsed = 0;
      resultsShown = false;
      await storage.record(
        runRecord(game, runId, "start", { settings, retryOf }),
      );
    }
    audio.emit("decision");
    selectedHand = null;
    selectedSlot = null;
    await storage.record(
      runRecord(game, runId, "decision", {
        action,
        controller,
        elapsedMs: Date.now() - started,
      }),
    );
    await persist();
    await playFrames(
      before,
      game.presentation || [],
      game.observe(),
      render,
      () => settings.fast,
    );
    render();
    if (
      action.type === "enterLoom" &&
      !data.tutorialStats?.stratum2?.firstCompletedAt
    )
      startLoom = true;
  } catch (e) {
    toast(e.message);
    console.error(e);
  } finally {
    busy = false;
  }
  if (startLoom) await ui("loomTutorial");
  if (auto) schedule();
}
function schedule() {
  clearTimeout(autoTimer);
  if (auto && game?.s.mode !== "result" && modal.hidden)
    autoTimer = setTimeout(stepBot, 250);
}
async function stepBot() {
  if (
    !game ||
    game.s.mode === "result" ||
    (game.s.tutorial && tutorialGuide(game)?.kind !== "free")
  ) {
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
  await act(d.action, {
    kind: "ai",
    policy: policy.id,
    weights: policy.weights,
    reason: d.reason,
  });
}
function render(frame = null) {
  if (!game) return menu();
  app.classList.remove("battle-scene", "in-loom");
  const o = frame || game.observe(),
    actions = frame ? [] : game.legal();
  if (o.tutorial && o.mode === "tavern")
    service =
      [...TUTORIAL_STEPS.slice(0, o.tutorial.step)]
        .reverse()
        .find((x) => x.control?.startsWith("tavern:"))
        ?.control.split(":")[1] || "shop";
  let body = "";
  if (
    o.satchel.used > o.satchel.capacity &&
    actions.some((a) => a.type === "discardItem")
  ) {
    body = `<section class="satchel-overflow"><div class="eyebrow">Choose what travels with you</div><h2>Satchel full · ${o.satchel.used} / ${o.satchel.capacity}</h2><p>Keep ${o.satchel.capacity} loose items. Equipped gear and socketed Gems take no space. Nothing is discarded automatically.</p><div class="overflow-items">${actions
      .filter((a) => a.type === "discardItem")
      .map((a) => {
        const x = o.inventory.find((x) => x.uid === a.uid);
        return `<article>${img("item-" + x.id)}<h3>${items[x.id].name}</h3><p>${text(items[x.id].text)}</p>${actionButton(a)}</article>`;
      })
      .join("")}</div><div class="choices">${actions
      .filter((a) => a.type !== "discardItem")
      .map((a) => actionButton(a))
      .join("")}</div></section>`;
  } else if (o.pendingArmor) {
    body = `<div class="result"><h2>Three Armors, one traveler</h2><p>Choose what to keep.</p><div class="choices">${actions.map((a) => actionButton(a)).join("")}</div></div>`;
  } else if (o.mode === "loomIntro") {
    body = `<section class="scene companion-intro"><div class="scene-art" style="background-image:url('assets/location-loom-field.png')"><figure class="companion-portrait">${img("card-elves")}<figcaption>Machine Elves <span>Your companions in the Loom</span></figcaption></figure></div><div class="scene-copy"><div class="eyebrow">Stratum two</div><h2>The Unfinished Loom</h2><div class="rule"></div><p class="companion-story">${ELVES_STORY}</p><p>Corruptions cling to spaces, even when the cards upon them are gone. Make room for what you can protect.</p><div class="choices">${actions.map((a) => actionButton(a, "primary")).join("")}</div></div></section>`;
  } else if (["class", "gem", "intro"].includes(o.mode)) {
    const title =
      o.mode === "class"
        ? "The Druid"
        : o.mode === "gem"
          ? "A first glimmer"
          : "A companion in the Weald";
    const copy =
      o.mode === "class"
        ? "Coax life from the space between spells. Grow Allies, weave elemental patterns, and turn a crowded mind into a living grove."
        : o.mode === "gem"
          ? `${items[o.startGem].name} carries ${items[o.startGem].element}. Imbue your Bracelet to protect, or your Ring to strike. Gems can be moved at Taverns.`
          : "The Apex Predator terrorizes Astrata. Your journey begins among pale roots and dark pools. Beyond the Weald, an Archon guards the way to the deeper Strata. Gather what you can before it wakes.";
    body = `<section class="scene ${o.mode === "intro" ? "companion-intro" : ""}"><div class="scene-art" style="background-image:url('assets/location-${o.mode === "intro" ? "field" : "druid"}.png')">${o.mode === "intro" ? `<figure class="companion-portrait">${img("card-sapling")}<figcaption>Sapling <span>Your first companion</span></figcaption></figure>` : ""}</div><div class="scene-copy"><div class="eyebrow">${o.mode === "class" ? "Choose your class" : o.mode === "gem" ? "Choose your starting socket" : "Stratum one"}</div><h2>${title}</h2><div class="rule"></div>${o.mode === "intro" ? `<p class="companion-story">${DRUID_COMPANION_STORY}</p>` : ""}<p${o.mode === "intro" ? ' class="companion-world"' : ""}>${copy}</p>${o.mode === "class" ? '<p><span class="tag">70 HP</span> <span class="tag">Sapling signature</span></p>' : ""}<div class="choices">${actions.map((a) => actionButton(a, "primary")).join("")}</div></div></section>`;
  } else if (o.mode === "field") {
    const f = o.field;
    body = `<div class="layout"><section><div class="section-head"><div><div class="eyebrow">${o.tutorial ? "Stratum " + o.stratum + " tutorial" : "Stratum " + o.stratum}</div><h2>${o.tutorial ? o.tutorial.name : o.stratumName}</h2></div><div class="muted">${f.moves} movement remaining<br><small>${o.tutorial ? "A guided journey" : `${f.spawned} / 32 spawns · Pair ${Math.ceil(f.spawned / 2)} / 16`}</small></div></div><div class="field-wrap"><div class="field ${o.stratum === 2 ? "loom-field" : o.tutorial ? "clearing-field" : "weald-field"}">${Array.from(
      { length: 121 },
      (_, i) => {
        const x = i % 11,
          y = Math.floor(i / 11),
          entities = fieldEntitiesAt(f, x, y),
          foe = entities.find((e) => e.enemy),
          player = x === f.x && y === f.y,
          a = actions.find((a) => a.type === "move" && a.x === x && a.y === y),
          e = foe || entities[0];
        return `<button class="tile ${player ? "player" : ""} ${a ? "reachable" : ""}" ${a && !foe && !items[e?.item]?.consumable ? `data-action="${esc(a.key)}"` : `data-tile="${i}"`} title="${esc(`${x + 1}, ${y + 1}${entities.length ? ": " + entities.map((e) => (e.enemy ? enemies[e.enemy].name + ((e.count || 1) > 1 ? " ×" + e.count : "") : items[e.item]?.consumable ? items[e.item].name + ": " + items[e.item].text : e.type)).join(", ") : ""}`)}"><span class="coord">${x === 5 && y === 5 ? "✧" : ""}</span>${foe ? img("enemy-" + foe.enemy) : items[e?.item]?.consumable ? `<span class="field-supply" data-field-supply="${e.item}">${img("item-" + e.item)}<small>${{ healingSap: "+5 HP", focusDraught: "+Focus", channelDraught: "+Channel", insightDew: "+Draw", starFlask: "6 Arcane" }[e.item]}</small></span>` : e ? `<span class="glyph">${{ Gold: '<span class="gold-symbol" aria-label="Gold"></span>', Item: "◇", Event: "?", Tavern: "♜" }[e.type]}</span>` : ""}${player ? `<span class="player-mark" aria-label="Druid">${img("location-druid")}</span>` : ""}${entities.reduce((n, e) => n + (e.count || 1), 0) > 1 ? `<span class="count">${entities.reduce((n, e) => n + (e.count || 1), 0)}</span>` : ""}</button>`;
      },
    ).join("")}</div><div class="row spread"><div class="queue">${
      Array.from(
        { length: Math.ceil(f.queue.length / 2) },
        (_, i) =>
          `<div class="spawn-pair" title="Upcoming pair ${f.spawned / 2 + i + 1}"><small>Pair ${f.spawned / 2 + i + 1}</small><span>${f.queue
            .slice(i * 2, i * 2 + 2)
            .map(esc)
            .join(" + ")}</span></div>`,
      ).join("") ||
      (o.tutorial
        ? "<small>The Clearing reveals its path one lesson at a time.</small>"
        : "<small>The Archon has arrived.</small>")
    }</div><div class="field-movement-controls">${actions
      .filter((a) => a.type === "wait")
      .map((a) => actionButton(a, "primary"))
      .join(
        "",
      )}${directionPad(f, actions)}</div></div><small>Click a lit neighboring tile. Diagonals are allowed. Entering an occupied tile ends movement.</small></div></section>${sidebar(o)}</div>`;
  } else if (o.mode === "battle") {
    const b = o.battle;
    let selectedActions =
      selectedSlot != null
        ? actions.filter((a) => a.slot === selectedSlot && a.type !== "place")
        : [];
    body = `<div class="layout"><section><div class="section-head"><div><div class="eyebrow">Battle · Turn ${b.turn}</div><h2>The Mind Grid</h2></div><div class="resources"><span><b>${b.insight || 0}</b>${key("Insight")}</span><span><b>${b.focus || 0}</b>${key("Focus")}</span><span><b>${b.channel || 0}</b>${key("Channel")}</span></div></div><div class="enemy-line">${b.enemies
      .map(
        (e) =>
          `<article class="enemy" data-enemy="${e.id}" title="${esc(e.signature + " Counterplay: " + e.counter)}">${img("enemy-" + e.id)}<div class="info"><h4>${e.name}</h4><small style="color:var(--${e.element})">${e.element} · ${e.hp} / ${e.maxHp} HP ${e.restless ? "· Restless " + e.restless : ""}</small><div class="health-track"><i style="width:${Math.max(0, (e.hp / e.maxHp) * 100)}%"></i></div>${e.statusImmunities?.length ? `<small class="enemy-immunity">${text("Immune to " + e.statusImmunities.map((s) => s[0].toUpperCase() + s.slice(1)).join(" and "))}</small>` : ""}<div class="tell">${text(tellText(e.tell))}</div>${e.onDeath ? `<small class="death-warning">On death: ${text(tellText(e.onDeath))}</small>` : ""}<small>${Object.entries(
            e.status,
          )
            .filter(([k, v]) => v)
            .map(([k, v]) => k + " " + v)
            .join(
              " · ",
            )}${e.flicker ? " · Negates next activation" : ""}${e.guard ? " · Guard " + e.guard : ""}</small></div></article>`,
      )
      .join("")}</div>${phaseBar(b, actions)}<div class="mind">${b.grid
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
        return `<button class="slot ${c ? "" : "empty"} ${valid ? "valid" : ""} ${selectedSlot === i ? "chosen" : ""} ${spent ? "spent" : ""}" data-slot="${i}" title="${esc(c ? d.name + ": " + d.text : "Empty slot " + (i + 1))}">${c ? `${img("card-" + c.id)}${upgradeBadge(c)}${slot.length > 1 ? `<span class="level">Lv ${slot.length}</span>` : ""}<span class="overlay"><span class="name">${d.name}${c.upgrade ? " +" : ""}</span><span class="nums">${d.type === "Ally" ? "♥ " + c.hp + " · " : ""}${d.type === "Ward" ? "Ward " + c.ward + " · " : ""}${d.limit < 0 ? "∞" : game.allowance(c, i)} acts${d.charge ? " · Charge " + c.charge + "/" + d.charge : ""}${c.lock ? " · Lock" : ""}${c.sever ? " · Sever" : ""}${c.freeze >= b.turn ? " · Freeze" : ""}</span></span>` : ""}</button>`;
      })
      .join("")}</div>${
      b.reaction
        ? `<div class="panel incoming-attack" style="margin-top:12px"><h4>${b.reaction.name} · ${incomingDamageText(b.reaction)}</h4></div>`
        : `<div class="hand">${b.hand.map((c) => card(c, { select: true })).join("")}</div>`
    }<div class="row"><button data-ui="piles" class="quiet">Grimoire ${b.deck.length} · Discard ${b.discard.length} · Destroyed ${b.destroyed.length}</button><small>${Object.entries(
      o.status,
    )
      .filter(([k, v]) => v)
      .map(([k, v]) => k + " " + v)
      .join(" · ")}</small></div></section>${sidebar(o)}</div>`;
  } else if (o.mode === "event") {
    body = `<section class="scene"><div class="scene-art" style="background-image:url('assets/event-${o.event.id}.png')"></div><div class="scene-copy"><div class="eyebrow">An encounter in the Weald</div><h2>${o.event.name}</h2><div class="rule"></div><p>${o.event.text}</p><div class="choices">${actions.map((a) => actionButton(a)).join("")}</div>${botControls()}</div></section>`;
  } else if (o.mode === "tavern") {
    body = `<div class="layout tavern-layout"><section></section>${sidebar(o)}</div>`;
  } else if (o.mode === "reward" || o.mode === "item") {
    const pausedPickup =
      o.mode === "item" && tutorialGuide(game)?.kind === "note";
    const offers = pausedPickup ? game.baseLegal() : actions;
    const title =
      o.mode === "item"
        ? "Something left behind"
        : o.reward.cards
          ? o.reward.boss
            ? "Choose one legendary card"
            : "The spoils of victory"
          : o.reward.gem
            ? "A glimmer to keep"
            : o.reward.setting
              ? "A Setting for the journey"
              : "The way is clear";
    body = `<div class="layout"><section><div class="eyebrow">${o.mode === "reward" ? "Victory" : "Discovery"}</div><h2 style="margin:8px 0 28px">${title}</h2>${pausedPickup ? `<p class="tutorial-movement"><b>${o.field.moves} movement remaining</b> · The unused point was forfeited on arrival.</p>` : ""}<div class="catalog reward-catalog">${offers
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
        return `<div class="reward-option">${isCard ? card({ id }) : `<div class="card">${img("item-" + id)}<div class="body"><h4>${items[id].name}</h4><p class="text">${text(items[id].text)}</p></div></div>`}<div class="reward-choice">${
          pausedPickup
            ? "<button disabled>Continue the lesson to collect</button>"
            : actionButton(a, "primary") +
              (a.type === "takeItem"
                ? actions
                    .filter(
                      (x) => x.type === "usePickup" && x.index === a.index,
                    )
                    .map((x) => actionButton(x))
                    .join("")
                : "")
        }</div></div>`;
      })
      .join("")}</div><div class="row" style="margin-top:30px">${actions
      .filter((a) =>
        ["skipReward", "continueReward", "leaveItem"].includes(a.type),
      )
      .map((a) => actionButton(a))
      .join("")}</div></section>${sidebar(o)}</div>`;
  } else if (o.mode === "result") {
    auto = false;
    clearTimeout(autoTimer);
    if (o.tutorial) {
      body = `<section class="hero"><div class="hero-copy"><div class="eyebrow">Stratum ${o.stratum} tutorial</div><h1 style="font-size:48px">${o.outcome === "win" ? o.tutorial.name + " Complete" : "The Warden awaits another try"}</h1><p>${o.outcome === "win" ? "Your journey is ready when you are." : "Retry this final fight with your restored starting equipment, cards and health."}</p>${
        o.outcome === "win"
          ? o.stratum === 2 && data.save
            ? '<button class="primary" data-ui="continue">Continue your journey →</button>'
            : '<button class="primary" data-ui="new">Begin a normal journey →</button>'
          : actions
              .filter((a) => a.type === "tutorialRetry")
              .map((a) => actionButton(a, "primary"))
              .join("")
      }<button data-ui="home">Return to Start</button><small>Tutorial results are recorded separately from normal Stratum victories.</small></div></section>`;
    } else if (!resultsShown) {
      body = `<section class="hero"><div class="hero-copy"><div class="eyebrow">${o.outcome === "win" ? "The gatekeeper has fallen" : "The Weald remembers"}</div><h1 style="font-size:52px;letter-spacing:.03em">${o.outcome === "win" ? "Stratum " + (o.stratum || 1) + " Complete" : "You Died"}</h1><div class="rule" style="width:280px"></div><p>${o.outcome === "win" ? "For a moment, the branches grow still. This journey through the Loom is complete." : esc(deathMessage(o))}</p><button class="primary" data-ui="results">View results →</button></div></section>`;
    } else
      body = resultMarkup(data.history?.find((h) => h.runId === runId) || o);
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
    tutorialSignal,
    setService: (value) => {
      service = value;
      render();
      tutorialSignal("tavern:" + value);
    },
  });
  paintCorruptions(o, app);
  app.classList.toggle("presenting", !!frame);
  paintTutorial(
    {
      game,
      act,
      close,
      busy: () => busy,
      dismissIndependent: async () => {
        game.s.tutorial.independentIntroDismissed = true;
        await persist();
        render();
      },
    },
    !!frame,
  );
}
function botControls() {
  return `<div class="row" style="margin-top:20px"><button data-ui="botStep" class="quiet">AI step</button><button data-ui="botToggle" class="quiet">${auto ? "Stop AI" : "Watch AI"}</button></div>`;
}
function resultMarkup(o) {
  const st = o.stats;
  return `<section class="result"><div class="result-title"><div class="eyebrow">${o.tutorial ? "Tutorial" : "Druid"} · ${o.outcome === "win" ? "Victory" : "Defeat"}</div><h1>Your journey, remembered</h1><p>${o.outcome === "win" ? (o.tutorial ? "Tutorial Complete" : "Stratum " + (o.stratum || 1) + " Complete") : esc(deathSummary(o))} · Seed ${o.seed}</p><small>Build ${esc(o.packageVersion || "not recorded")} · Rules ${esc(o.version?.rules || "unknown")} · Content ${esc(o.version?.content || "unknown")}</small></div><div class="stat-grid"><div><b>${o.field.round}</b>Field rounds</div><div><b>${st.damageDealt}</b>Damage dealt</div><div><b>${st.damageTaken}</b>Damage taken</div><div><b>${Math.floor((o.realTimeMs || elapsed) / 60000)}:${String(Math.floor((o.realTimeMs || elapsed) / 1000) % 60).padStart(2, "0")}</b>Time played</div></div><div class="result-grid"><div class="panel"><h4>Encounters</h4>${st.encounters.map((e) => `<p>Round ${e.round} · ${e.enemies.join(", ")}<br><small>${e.outcome} · ${e.turns || 0} turns · HP ${e.hpStart} → ${e.hpEnd}</small></p>`).join("")}</div><div class="panel"><h4>The final Grimoire</h4><p>${o.deck.map((c) => cards[c.id].name + (c.upgrade ? " +" : "")).join(" · ")}</p><h4>Cards gained</h4><p>${st.cardsGained.join(" · ") || "None"}</p><h4>Belongings</h4><p>${st.itemsGained.join(" · ") || "None"}</p><small>Gold earned ${st.goldEarned} · spent ${st.goldSpent}<br>Bought: ${st.purchases.map((id) => (id.startsWith("card:") ? cards[id.slice(5)].name : items[id]?.name || id)).join(", ") || "None"}<br>Sold: ${st.sales.map((id) => items[id]?.name || id).join(", ") || "None"}</small></div></div><div class="row spread" style="margin-top:25px"><small>Saved to persistent Run History.</small><button class="primary" data-ui="home">Return to start</button></div></section>`;
}
let backdropPressed = false;
modal.addEventListener("pointerdown", (event) => {
  backdropPressed = event.target === modal;
});
modal.addEventListener("pointercancel", () => {
  backdropPressed = false;
});
modal.addEventListener("click", (event) => {
  if (event.target === modal && backdropPressed) {
    event.stopPropagation();
    close();
  }
  backdropPressed = false;
});
function dialog(html) {
  backdropPressed = false;
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
    `<h2>Settings</h2><label>Display <select id="display"><option value="windowed" ${!settings.fullscreen ? "selected" : ""}>Windowed</option><option value="fullscreen" ${settings.fullscreen ? "selected" : ""}>Fullscreen</option></select></label><label>Window size · 16:9 <select id="resolution">${[
      [1280, 720],
      [1440, 810],
      [1600, 900],
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
async function tutorialSignal(control) {
  const a = game
    ?.legal()
    .find((a) => a.type === "tutorialUI" && a.control === control);
  if (a) await act(a);
}
async function ui(name) {
  if (busy) return;
  switch (name) {
    case "new":
      if (!data.tutorialStats?.stratum1?.firstCompletedAt) {
        await ui(data.tutorialSave ? "continueTutorial" : "tutorialStart");
        break;
      }
      if (data.save) {
        dialog(
          '<h2>Begin a new journey?</h2><p>This forfeits the saved run.</p><button class="danger" data-ui="newConfirmed">Forfeit & begin</button>',
        );
      } else await ui("newConfirmed");
      break;
    case "loomTutorial":
      close();
      game = startLoomTutorial(new Game(LOOM_TUTORIAL.seed));
      service = "shop";
      runId = crypto.randomUUID();
      started = Date.now();
      elapsed = 0;
      resultsShown = false;
      await storage.record(runRecord(game, runId, "start", { settings }));
      await persist();
      data = await storage.load();
      render();
      break;
    case "tutorialMenu": {
      const t = data.tutorialStats?.stratum1;
      dialog(
        `<h2>Tutorial</h2><button class="primary" data-ui="tutorialStart">Stratum 1 tutorial · The First Clearing</button>${data.save?.stratum >= 2 || data.history?.some((r) => r.stratum >= 2) || data.tutorialStats?.stratum2 ? '<button data-ui="loomTutorial">Stratum 2 tutorial · The Mending Ground</button>' : ""}${data.tutorialSave ? '<button data-ui="continueTutorial">Resume current tutorial</button>' : ""}<p>${t?.starts?.length || 0} starts · ${t?.completions?.length || 0} completions</p>`,
      );
      break;
    }
    case "tutorialStart":
      if (data.tutorialSave) {
        dialog(
          '<h2>Restart The First Clearing?</h2><p>This replaces only the unfinished tutorial. Your normal journey is preserved.</p><button data-ui="tutorialConfirmed">Restart tutorial</button>',
        );
        break;
      }
      await ui("tutorialConfirmed");
      break;
    case "tutorialConfirmed":
      close();
      game = startTutorial(new Game(TUTORIAL.seed));
      service = "shop";
      runId = crypto.randomUUID();
      started = Date.now();
      elapsed = 0;
      resultsShown = false;
      await storage.record(runRecord(game, runId, "start", { settings }));
      await persist();
      data = await storage.load();
      render();
      break;
    case "continueTutorial": {
      const saved = data.tutorialSave;
      if (!saved) break;
      close();
      game = new Game(0, saved);
      runId = saved.uiMeta?.runId || crypto.randomUUID();
      started = Date.now() - (saved.uiMeta?.elapsed || 0);
      resultsShown = false;
      await storage.record(
        runRecord(game, runId, "resume", {
          settings,
          elapsedMs: Date.now() - started,
          resumedFrom: saved.version,
        }),
      );
      await persist();
      render();
      if (game.s.tutorial.lesson === "ring-equip") inventory();
      break;
    }
    case "newConfirmed":
      close();
      game = new Game();
      runId = crypto.randomUUID();
      started = Date.now();
      elapsed = 0;
      resultsShown = false;
      await storage.record(runRecord(game, runId, "start", { settings }));
      await persist();
      render();
      break;
    case "continue":
      game = new Game(0, data.save);
      runId = data.save.uiMeta?.runId || crypto.randomUUID();
      started = Date.now() - (data.save.uiMeta?.elapsed || 0);
      resultsShown = false;
      await storage.record(
        runRecord(game, runId, "resume", {
          settings,
          elapsedMs: Date.now() - started,
          resumedFrom: data.save.version,
        }),
      );
      await persist();
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
    case "saveAndHome":
      auto = false;
      clearTimeout(autoTimer);
      busy = true;
      try {
        await persist();
        game = null;
        selectedHand = null;
        selectedSlot = null;
        reason = "";
        close();
        menu();
      } catch (e) {
        toast("Could not save the run: " + e.message);
      } finally {
        busy = false;
      }
      break;
    case "quit":
      await persist();
      await storage.quit();
      break;
    case "pause":
      dialog(
        `<h2>A moment of stillness</h2><div class="column"><button data-close>Resume</button><button data-ui="settings">Settings</button><button data-ui="saveAndHome">Return to Start · autosaves first</button><button class="danger" data-ui="abandon">Abandon Run · deletes the save</button></div>`,
      );
      break;
    case "abandon":
      dialog(
        '<h2>Abandon this journey?</h2><p>The save will be deleted.</p><button class="danger" data-ui="abandonConfirmed">Abandon Run</button>',
      );
      break;
    case "abandonConfirmed":
      auto = false;
      await storage.save(null, { tutorial: !!game?.s.tutorial });
      game = null;
      data = await storage.load();
      close();
      menu();
      break;
    case "inventory":
      inventory();
      if (game.s.tutorial) {
        await tutorialSignal("inventory");
        inventory();
      }
      break;
    case "grimoire":
      dialog(
        `<h2>Your Grimoire</h2><p>Unordered. Every card returns after battle.</p><div class="catalog">${game.s.deck.map((c) => card(c)).join("")}</div>`,
      );
      await tutorialSignal("grimoire");
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
    case "archives":
    case "history":
      data = await storage.load();
      close();
      showArchives(
        {
          app,
          data,
          esc,
          img,
          text,
          dialog,
          resultMarkup,
          tellText,
          home: () => ui("home"),
        },
        name === "history" ? "history" : "hub",
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
        const e =
          game
            .observe()
            .battle?.enemies.find(
              (enemy) => enemy.uid === Number(el.dataset.enemyUid),
            ) || enemies[el.dataset.enemy];
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
          entities = fieldEntitiesAt(game.s.field, i % 11, Math.floor(i / 11));
        if (entities.length) {
          const move = game
            .legal()
            .find(
              (a) =>
                a.type === "move" &&
                a.x === i % 11 &&
                a.y === Math.floor(i / 11),
            );
          dialog(
            `<h2>Across the Weald</h2>${entities
              .map((e) => {
                if (!e.enemy)
                  return items[e.item]?.consumable
                    ? `<article class="field-supply-preview">${img("item-" + e.item)}<div><h3>${items[e.item].name}</h3><p>${text(items[e.item].text)}</p><p>${e.fieldSupply ? "Stays here until collected or used. Does not decay." : "A visible supply."}</p></div></article>`
                    : `<p>${e.type}${e.value ? " · " + e.value + " Gold" : ""}</p>`;
                const d = enemies[e.enemy],
                  preview = game.fieldEnemyPreview(e);
                return `<article class="field-enemy-preview"><div class="row">${img("enemy-" + e.enemy)}<div><h3>${d.name}${preview.count > 1 ? " ×" + preview.count : ""}</h3><p>${d.element} · ${preview.hp} HP each · ${d.tier}</p><p class="enemy-age">${preview.age == null ? "Spawn age unavailable for this older save" : `Spawned in pair ${preview.born} · ${preview.age === 0 ? "Just appeared" : `${preview.age} movement rounds old`}`}</p><p class="enemy-restless">Restless ${preview.restless} · +${preview.restless} damage per attack hit</p><p>${preview.movement}</p><p>${d.signature}</p></div></div><h4>If fought now · first cycle</h4>${preview.rotation.map((t) => `<p>${text(tellText(t))}</p>`).join("")}</article>`;
              })
              .join(
                "",
              )}${entities.some((e) => e.enemy) ? `<p class="muted">Restless increases after spawn pairs 4, 8 and 12, not every movement turn. It adds attack damage, not HP. Movement increases for Stalkers, Wanderers and Skittish enemies; Sentinels stay still and Hunters/Archons follow their own rules. Each completed battle cycle adds another +1 attack damage.</p>` : ""}${move ? actionButton({ ...move, label: entities.some((e) => e.enemy) ? "Move here · start battle" : "Move here · collect" }, "primary") : ""}`,
          );
        }
      }),
  );
}
document.addEventListener("keydown", (e) => {
  if (busy) return;
  if (e.key === "Escape") {
    e.preventDefault();
    if (!modal.hidden) close();
    else if (app.querySelector(".archives"))
      app.querySelector("[data-archive-back]").click();
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
