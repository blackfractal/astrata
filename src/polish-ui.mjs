import { cards, items, enemies } from "./content.mjs";
import { blockHit, offense, adjacent } from "./engine.mjs";
const slotNames = {
  head: "Head",
  neck: "Neck",
  torso: "Armor",
  wrist1: "Left wrist",
  wrist2: "Right wrist",
  finger1: "Left ring",
  finger2: "Right ring",
};
const actTypes = ["activate", "recall"];
let drag = null;
let marketTab = "buy";
const stop = (e) => e.stopPropagation();
function run(c, a) {
  if (c.busy()) return;
  c.close();
  return c.act(a);
}
function button(c, a, cls = "") {
  return c.actionButton(a, cls);
}
function bindActions(c, root) {
  root.querySelectorAll("[data-action]").forEach(
    (el) =>
      (el.onclick = (e) => {
        stop(e);
        run(c, el.dataset.action);
      }),
  );
}
function effect(c, slot, ctx) {
  const d = cards[c.id],
    f = d.effects || {};
  const matching = c.sever
    ? 0
    : adjacent(slot).filter((i) => {
        const other = ctx.o.battle.grid[i].at(-1);
        return other?.id === c.id && !other.sever;
      }).length;
  return (
    [
      f.damage
        ? "Deal " +
          (f.damage +
            (c.upgrade ? d.upgrade?.bonus || 0 : 0) +
            (f.matchingDamage || 0) * matching)
        : f.hpDamage
          ? "Deal current HP"
          : f.randomDamage
            ? "Deal 1–" + f.randomDamage
            : null,
      f.shield
        ? `Shield ${f.shield + (c.upgrade ? d.upgrade?.bonus || 0 : 0) + (f.matchingShield || 0) * matching + (d.name.includes("Shield") ? ctx.o.bonuses.shield : 0)}`
        : null,
      f.ward ? `Ward +${f.ward}` : null,
      f.heal ? `Heal ${f.heal}` : null,
      f.poison ? `Poison ${f.poison}` : null,
      f.burn ? `Burn ${f.burn}` : null,
      f.corrode ? `Corrode ${f.corrode}` : null,
      f.channel ? `Channel +${f.channel}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || d.type
  );
}
function remaining(ctx, c, i) {
  return ctx.game.allowance(c, i);
}
function whyDisabled(ctx, c, i) {
  const b = ctx.o.battle,
    d = cards[c.id];
  if (c.zeroWard) return "Ward depleted";
  if (!remaining(ctx, c, i)) return "Activation allowance exhausted";
  if (c.freeze >= b.turn) return "Frozen";
  if (b.reaction) return "Resolve the incoming attack first";
  if (b.phase !== "activate") return "Available during activation";
  if (d.channel > b.channel)
    return `Needs ${d.channel} Channel; ${b.channel} remaining`;
  return "Card condition or target unavailable";
}
function activationChooser(ctx, slot) {
  const choices = ctx.game
    .legal()
    .filter((a) => a.type === "activate" && a.slot === slot);
  if (!choices.length) return;
  if (choices.length === 1) return run(ctx, choices[0]);
  const c = ctx.game.s.battle.grid[slot].at(-1),
    d = cards[c.id];
  ctx.dialog(
    `<h2>${d.name}</h2><p>${ctx.text(d.text)}</p><div class="activation-options"></div><button class="primary" data-confirm-activation>Activate</button>`,
  );
  const host = ctx.modal.querySelector(".activation-options");
  let filtered = choices;
  function rebuild(selections = {}) {
    filtered = choices;
    host.innerHTML = "";
    for (const [field, label] of [
      ["element", "Attunement"],
      ["target", "Enemy"],
      ["cardTarget", "Card"],
      ["newElement", "New element"],
      ["destination", "Destination"],
    ]) {
      const values = [...new Set(filtered.map((a) => a[field]))].filter(
        (v) => v != null,
      );
      if (!values.length) continue;
      let value =
        values.find((v) => String(v) === String(selections[field])) ??
        values[0];
      const text = (v) =>
        field === "target"
          ? ctx.o.battle.enemies.find((e) => e.uid === v)?.name || v
          : ["cardTarget", "destination"].includes(field)
            ? `Slot ${Number(v) + 1}${ctx.game.s.battle.grid[v]?.length ? " · " + cards[ctx.game.s.battle.grid[v].at(-1).id].name : ""}`
            : v;
      const row = document.createElement("label");
      row.textContent = label + " ";
      const select = document.createElement("select");
      select.dataset.field = field;
      for (const v of values) {
        const opt = new Option(text(v), String(v));
        opt.selected = v === value;
        select.add(opt);
      }
      row.append(select);
      host.append(row);
      filtered = filtered.filter((a) => a[field] === value);
      select.onchange = () => {
        const next = {};
        for (const el of host.querySelectorAll("select")) {
          next[el.dataset.field] = el.value;
          if (el === select) break;
        }
        rebuild(next);
      };
    }
  }
  rebuild();
  ctx.modal.querySelector("[data-confirm-activation]").onclick = () =>
    run(ctx, filtered[0]);
}
export function showCard(ctx, c, slot = null) {
  const d = cards[c.id],
    b = ctx.game?.s.battle,
    live = c.used != null;
  const allowances = live
    ? remaining(ctx, c, slot)
    : d.limit < 0
      ? Infinity
      : d.limit;
  const format = (n) => (n === Infinity ? "∞" : n);
  const upgrade = d.upgrade
    ? `<h3>Upgrade${c.upgrade ? " · acquired" : ""}</h3><p>${ctx.text(d.upgrade.text)}</p><p>${[d.upgrade.gold ? d.upgrade.gold + " Gold" : null, d.upgrade.hp ? d.upgrade.hp + " HP" : null, d.upgrade.sacrifice ? "Sacrifice another card of equal rarity" : null, d.upgrade.hex ? "Gain " + d.upgrade.hex : null, d.upgrade.element ? "Requires " + d.upgrade.element + " equipment" : null].filter(Boolean).join(" · ")}</p>`
    : "";
  ctx.dialog(
    `<h2>${d.name}${c.upgrade ? " +" : ""}</h2><div class="card-detail">${ctx.img("card-" + c.id, "full-art")}<div><div class="eyebrow">${d.element} · ${d.type} · ${d.rarity}</div><p>${ctx.text(d.text)}</p><dl class="card-facts"><dt>Focus</dt><dd>${d.focus === 99 ? "Cannot place" : d.focus}</dd><dt>Channel</dt><dd>${d.channel}</dd><dt>Activations</dt><dd>${format(allowances)} / ${d.limit < 0 ? "∞" : live ? ctx.game.allowance({ ...c, used: 0 }, slot) : d.limit}</dd><dt>Recall</dt><dd>${d.recall == null ? "Cannot recall" : d.recall + " Focus"}</dd>${live ? `<dt>Current state</dt><dd>${[d.type === "Ally" ? "HP " + c.hp : null, d.type === "Ward" ? "Ward " + c.ward : null, c.charge ? "Charge " + c.charge : null, c.lock ? "Locked" : null, c.sever ? "Severed" : null, c.freeze >= b.turn ? "Frozen" : null].filter(Boolean).join(" · ") || "Ready"}</dd>` : ""}</dl>${upgrade}</div></div><div class="card-context"></div>`,
  );
  const context = ctx.modal.querySelector(".card-context");
  if (slot != null) {
    const a = ctx.game
      .legal()
      .filter((a) => a.slot === slot && actTypes.includes(a.type));
    context.innerHTML = `<button data-full-activate ${a.some((a) => a.type === "activate") ? "" : "disabled"} title="${ctx.esc(a.some((a) => a.type === "activate") ? d.text : whyDisabled(ctx, c, slot))}">Activate · ${effect(c, slot, ctx)}</button>${a
      .filter((a) => a.type === "recall")
      .map((a) => button(ctx, a))
      .join("")}`;
    context.querySelector("[data-full-activate]").onclick = () =>
      activationChooser(ctx, slot);
    bindActions(ctx, context);
    const stack = b.grid[slot];
    if (stack.length > 1) {
      const details = document.createElement("details");
      details.innerHTML = `<summary>Stack · ${stack.length} cards</summary>${stack.map((x) => `<button data-stack-card="${x.uid}">${cards[x.id].name} · used ${x.used}</button>`).join("")}`;
      context.append(details);
      details.querySelectorAll("[data-stack-card]").forEach(
        (el) =>
          (el.onclick = () =>
            showCard(
              ctx,
              stack.find((x) => x.uid === Number(el.dataset.stackCard)),
              slot,
            )),
      );
    }
  }
  if (c.uid != null) ctx.modal.classList.add("card-peek");
}
function gearMarkup(ctx, editable = false) {
  const o = ctx.o,
    legal = ctx.actions;
  return `<div class="equipment-slots">${Object.entries(o.equipment)
    .map(([slot, uid]) => {
      const x = o.inventory.find((x) => x.uid === uid),
        d = items[x?.id],
        g = x && o.inventory.find((g) => g.uid === x.gem),
        block = o.battle?.bracelets.find((b) => b.uid === uid);
      const canDefend = legal.some(
        (a) => a.type === "bracelet" && a.uid === uid,
      );
      return `<div class="gear-slot ${canDefend ? "defense-ready" : ""}" data-equip-slot="${slot}"><span class="gear-label">${slotNames[slot]}</span><button class="gear-item" ${x ? `data-item-detail="${uid}" data-item-uid="${uid}" draggable="${editable}"` : ""} title="${ctx.esc(d ? d.name + ": " + d.text : "Empty " + slotNames[slot])}">${x ? ctx.img("item-" + x.id) : '<span class="empty-gear">+</span>'}<span>${d?.name || "Empty"}</span>${block ? `<b class="block-left">${block.block} block</b>` : ""}</button>${d?.socket ? `<button class="gem-socket" data-socket="${uid}" ${g ? `data-gem-drag="${g.uid}" data-setting-drag="${uid}" draggable="${editable}"` : ""} title="${ctx.esc(g ? items[g.id].name + ": " + items[g.id].text : "Empty Gem socket")}">${g ? ctx.img("item-" + g.id) : "◇"}<span>${g ? items[g.id].name : "Socket"}</span></button>` : ""}</div>`;
    })
    .join("")}</div>`;
}
function playerMarkup(ctx, battle = false) {
  return `<section class="player-panel ${battle ? "battle-player" : ""}"><button class="player-portrait" data-player-detail title="Druid · ${ctx.o.hp} / ${ctx.o.maxHp} HP">${ctx.img("location-druid")}<span>Druid <b>${ctx.o.hp}/${ctx.o.maxHp} HP</b></span></button>${gearMarkup(ctx)}<div class="player-status">${Object.entries(
    ctx.o.status,
  )
    .filter(([k, v]) => v)
    .map(([k, v]) => `<span>${k} ${v}</span>`)
    .join("")}</div></section>`;
}
function equipmentBody(ctx) {
  return `${gearMarkup(ctx, true)}<h3 class="stash-label">Satchel</h3><div class="satchel" data-unsocket-drop>${ctx.o.inventory
    .filter(
      (x) =>
        !Object.values(ctx.o.equipment).includes(x.uid) &&
        !ctx.o.inventory.some((g) => g.gem === x.uid),
    )
    .map(
      (x) =>
        `<button class="stash-item" draggable="true" data-item-uid="${x.uid}" data-item-detail="${x.uid}" title="${ctx.esc(items[x.id].text)}">${ctx.img("item-" + x.id)}<span>${items[x.id].name}</span></button>`,
    )
    .join("")}</div>`;
}
function itemDetails(ctx, uid) {
  const x = ctx.o.inventory.find((x) => x.uid === uid);
  if (!x) return;
  const d = items[x.id];
  const choices = ctx.game
    .legal()
    .filter(
      (a) =>
        a.item === uid ||
        (["socket", "unsocket", "sell"].includes(a.type) && a.uid === uid) ||
        (a.type === "socket" && a.gem === uid),
    );
  ctx.dialog(
    `<h2>${d.name}</h2><div class="item-detail">${ctx.img("item-" + x.id, "full-art")}<div><p>${ctx.text(d.text)}</p>${d.forbid ? `<p>Cannot socket: ${d.forbid.map((id) => items[id].name).join(", ")}</p>` : ""}<div class="item-options">${
      ["equip", "unequip", "socket", "unsocket", "sell"]
        .map((type) => {
          const list = choices.filter((a) => a.type === type);
          return list.length
            ? `<details><summary>${{ equip: "Equip", unequip: "Unequip", socket: "Socket", unsocket: "Remove Gem", sell: "Sell / remove" }[type]}</summary>${list.map((a) => button(ctx, a)).join("")}</details>`
            : "";
        })
        .join("") || "<p>No changes available here.</p>"
    }</div></div></div>`,
  );
  bindActions(ctx, ctx.modal);
}
function bindEquipment(ctx, root) {
  root.querySelectorAll("[data-item-detail]").forEach(
    (el) =>
      (el.onclick = (e) => {
        stop(e);
        if (!ctx.busy()) itemDetails(ctx, Number(el.dataset.itemDetail));
      }),
  );
  root
    .querySelectorAll("[data-player-detail]")
    .forEach(
      (el) =>
        (el.onclick = () =>
          ctx.dialog(
            `<h2>The Druid</h2><div class="item-detail">${ctx.img("location-druid", "full-art")}<p>${ctx.o.hp}/${ctx.o.maxHp} HP<br>Insight ${ctx.o.bonuses.insight} · Focus ${ctx.o.bonuses.focus} · Channel ${ctx.o.bonuses.channel}</p></div>`,
          )),
    );
  root.querySelectorAll('[data-item-uid][draggable="true"]').forEach(
    (el) =>
      (el.ondragstart = (e) => {
        drag = { item: Number(el.dataset.itemUid) };
        e.dataTransfer.setData("text/plain", JSON.stringify(drag));
        root.classList.add("dragging-gear");
        markDrops();
      }),
  );
  root.querySelectorAll("[data-gem-drag]").forEach(
    (el) =>
      (el.ondragstart = (e) => {
        stop(e);
        drag = {
          gem: Number(el.dataset.gemDrag),
          setting: Number(el.dataset.settingDrag),
        };
        e.dataTransfer.setData("text/plain", JSON.stringify(drag));
        root.querySelector("[data-unsocket-drop]")?.classList.add("drop-ready");
      }),
  );
  const current = () => ctx.game.legal();
  function dropAction(el) {
    if (!drag) return null;
    if (el.dataset.equipSlot)
      return current().find(
        (a) =>
          a.type === "equip" &&
          a.item === drag.item &&
          a.slot === el.dataset.equipSlot,
      );
    if (el.dataset.socket) {
      const gem = drag.item;
      return current().find(
        (a) =>
          a.type === "socket" &&
          a.uid === Number(el.dataset.socket) &&
          a.gem === gem,
      );
    }
    if (el.hasAttribute("data-unsocket-drop"))
      return current().find(
        (a) =>
          (a.type === "unsocket" && a.uid === drag.setting) ||
          (a.type === "unequip" && a.item === drag.item),
      );
  }
  function markDrops() {
    root
      .querySelectorAll("[data-equip-slot],[data-socket],[data-unsocket-drop]")
      .forEach((el) => el.classList.toggle("drop-ready", !!dropAction(el)));
  }
  root
    .querySelectorAll("[data-equip-slot],[data-socket],[data-unsocket-drop]")
    .forEach((el) => {
      el.ondragover = (e) => {
        if (dropAction(el)) {
          e.preventDefault();
          stop(e);
        }
      };
      el.ondrop = async (e) => {
        e.preventDefault();
        stop(e);
        const a = dropAction(el);
        drag = null;
        if (a) {
          const keepOpen = root === ctx.modal;
          await run(ctx, a);
          if (keepOpen)
            showEquipment({
              ...ctx,
              o: ctx.game.observe(),
              actions: ctx.game.legal(),
            });
        }
      };
    });
  root.querySelectorAll("[data-socket]").forEach(
    (el) =>
      (el.onclick = (e) => {
        stop(e);
        itemDetails(ctx, Number(el.dataset.socket));
      }),
  );
  root.ondragend = () => {
    drag = null;
    root.classList.remove("dragging-gear");
    root
      .querySelectorAll(".drop-ready")
      .forEach((el) => el.classList.remove("drop-ready"));
  };
}
export function showEquipment(ctx) {
  ctx.dialog(`<h2>Equipped</h2>${equipmentBody(ctx)}`);
  bindEquipment(ctx, ctx.modal);
}
function tavern(ctx) {
  const { o, actions, app } = ctx;
  const host = app.querySelector(".layout>section");
  const service = ctx.service === "shop" ? "market" : ctx.service;
  const services = [
    ["market", "Market", "Goods & cards", "◈"],
    ["rest", "Innkeeper", "Rest & recovery", "☀"],
    ["equipment", "Jeweler", "Equipment & Gems", "◇"],
    ["grimoire", "Scribe", "Cards & upgrades", "✧"],
    ["gossip", "Traveler", "Rumors", "?"],
    [
      "healer",
      "Healer",
      o.shop.healer ? "Remove afflictions" : "Away today",
      "✚",
    ],
  ];
  host.innerHTML = `<div class="section-head"><div><div class="eyebrow">Shelter beneath the roots</div><h2>The Lantern Rest</h2></div>${actions
    .filter((a) => a.type === "leave")
    .map((a) => button(ctx, a, "primary"))
    .join(
      "",
    )}</div><div class="tavern-scene">${services.map(([id, label, sub, glyph]) => `<button data-tavern="${id}" class="tavern-hotspot hotspot-${id} ${service === id ? "selected" : ""}" title="${sub}"><b>${glyph}</b><span>${label}<small>${sub}</small></span></button>`).join("")}</div><section class="tavern-service"><h3>${services.find((x) => x[0] === service)?.[1] || "Market"}</h3><div class="service-content"></div></section>`;
  host
    .querySelectorAll("[data-tavern]")
    .forEach((el) => (el.onclick = () => ctx.setService(el.dataset.tavern)));
  const content = host.querySelector(".service-content");
  if (service === "equipment") {
    content.innerHTML = `<h3>Equipped</h3>${equipmentBody(ctx)}`;
    bindEquipment(ctx, content);
  } else if (service === "market") {
    content.insertAdjacentHTML(
      "beforebegin",
      `<div class="toolbar market-tabs"><button data-market-tab="buy" class="${marketTab === "buy" ? "active" : ""}">Buy</button><button data-market-tab="sell" class="${marketTab === "sell" ? "active" : ""}">Sell / remove</button></div>`,
    );
    host.querySelectorAll("[data-market-tab]").forEach(
      (el) =>
        (el.onclick = () => {
          marketTab = el.dataset.marketTab;
          ctx.render();
        }),
    );
    if (marketTab === "sell") {
      content.innerHTML = sellCatalog(ctx);
      bindCatalog(ctx, content);
      bindActions(ctx, host);
      return;
    }
    const stock = o.shop.stock.map((id, index) => {
      const isCard = id.startsWith("card:"),
        d = isCard ? cards[id.slice(5)] : items[id],
        price = d.worth || { common: 30, rare: 65, legendary: 120 }[d.rarity],
        a = actions.find((a) => a.type === "buy" && a.index === index);
      return { id, index, isCard, d, price, a };
    });
    content.innerHTML = ["Cards", "Gems", "Equipment"]
      .map(
        (cat) =>
          `<details class="market-category" ${cat === "Cards" ? "open" : ""}><summary>${cat}</summary><div class="market-stock">${
            stock
              .filter((x) =>
                cat === "Cards"
                  ? x.isCard
                  : cat === "Gems"
                    ? !x.isCard && x.d.slot === "gem"
                    : !x.isCard && x.d.slot !== "gem",
              )
              .map(
                (x) =>
                  `<article class="market-item ${x.a ? "" : "unavailable"}">${ctx.img((x.isCard ? "card-" : "item-") + (x.isCard ? x.id.slice(5) : x.id))}<h4>${x.d.name}</h4><p>${ctx.text(x.d.text)}</p><div class="store-controls"><button data-stock-view="${x.index}">View</button>${x.a ? button(ctx, { ...x.a, label: "Buy · " + x.price + " Gold" }) : `<button disabled title="Needs ${x.price} Gold; ${o.gold} available">Buy · ${x.price} Gold</button>`}</div></article>`,
              )
              .join("") || "<p>Sold out</p>"
          }</div></details>`,
      )
      .join("");
  } else {
    const types =
      {
        rest: ["heal"],
        gossip: ["gossip"],
        healer: ["removeHex", "sell"],
        grimoire: ["upgrade", "remove"],
      }[service] || [];
    const list = actions.filter(
      (a) =>
        types.includes(a.type) &&
        (service !== "healer" || a.type !== "sell" || a.effects.cursed),
    );
    const price = o.shop.hexPrice || {
      kind: "gold",
      gold: o.shop.healerPrice,
      hp: 0,
    };
    const treatment =
      service === "healer" && o.shop.healer
        ? `<p class="treatment-cost">Hex treatment: ${[price.gold ? price.gold + " Gold" : null, price.hp ? price.hp + " HP" : null, price.kind === "allyGold" ? "one Ally card (permanently removed)" : null, price.kind === "item" ? "one item without a socketed Gem (consumed)" : null].filter(Boolean).join(" + ")}.</p>`
        : "";
    content.innerHTML =
      treatment +
      types
        .map((type) => {
          const entries = list.filter((a) => a.type === type);
          return `<details open><summary>${{ heal: "Recover HP", gossip: "Ask about the road", removeHex: "Remove Hex", sell: "Remove Cursed object", upgrade: "Upgrade a card", remove: "Remove a card" }[type]}</summary><div class="choices">${entries.map((a) => button(ctx, a)).join("") || `<p>${service === "healer" && !o.shop.healer ? "No healer is visiting." : "No eligible or affordable choices."}</p>`}</div></details>`;
        })
        .join("");
  }
  bindActions(ctx, host);
  host
    .querySelectorAll("[data-stock-view]")
    .forEach(
      (el) => (el.onclick = () => viewStock(ctx, Number(el.dataset.stockView))),
    );
}
function viewStock(ctx, index) {
  const id = ctx.o.shop.stock[index],
    a = ctx.actions.find((a) => a.type === "buy" && a.index === index);
  if (id.startsWith("card:")) {
    showCard(ctx, { id: id.slice(5) });
    ctx.modal.querySelector(".card-context").innerHTML = a
      ? button(ctx, a, "primary")
      : "<p>Not enough Gold to buy this card.</p>";
  } else {
    const d = items[id];
    ctx.dialog(
      `<h2>${d.name}</h2><div class="item-detail">${ctx.img("item-" + id, "full-art")}<div><p>${ctx.text(d.text)}</p><p>${d.slot} · Worth ${d.worth} Gold</p>${d.forbid ? `<p>Cannot socket: ${d.forbid.map((id) => items[id].name).join(", ")}</p>` : ""}${a ? button(ctx, a, "primary") : "<p>Not enough Gold to buy this item.</p>"}</div></div>`,
    );
  }
  bindActions(ctx, ctx.modal);
}
function sellCatalog(ctx) {
  const { o, actions } = ctx;
  const gear = o.inventory
    .map((x) => {
      const d = items[x.id],
        a = actions.find((a) => a.type === "sell" && a.uid === x.uid),
        gem = o.inventory.find((g) => g.uid === x.gem);
      return `<article class="market-item">${ctx.img("item-" + x.id)}<h4>${d.name}</h4><p>${ctx.text(d.text)}${gem ? "<br>Socket: " + items[gem.id].name : ""}</p><div class="store-controls"><button data-owned-view="${x.uid}">View</button>${a ? button(ctx, a) : '<button disabled title="Unsocket this Gem before selling; Cursed items also require enough Gold">Sell unavailable</button>'}</div></article>`;
    })
    .join("");
  const deck = o.deck
    .map((c) => {
      const d = cards[c.id],
        a = actions.find((a) => a.type === "remove" && a.uid === c.uid);
      return `<article class="market-item">${ctx.img("card-" + c.id)}<h4>${d.name}${c.upgrade ? " +" : ""}</h4><p>${ctx.text(d.text)}</p><div class="store-controls"><button data-owned-card="${c.uid}">View</button>${a ? button(ctx, a) : `<button disabled title="${o.shop.removeUsed ? "Removal already used at this Tavern" : d.type === "Hex" ? "Visit the Healer" : "Needs 40 Gold"}">${d.type === "Hex" ? "Visit Healer" : o.shop.removeUsed ? "Removal used" : "Remove unavailable"}</button>`}</div></article>`;
    })
    .join("");
  return `<details open><summary>Equipment & Gems</summary><div class="market-stock">${gear}</div></details><details><summary>Grimoire · one removal per Tavern</summary><div class="market-stock">${deck}</div></details>`;
}
function bindCatalog(ctx, root) {
  root
    .querySelectorAll("[data-owned-view]")
    .forEach(
      (el) =>
        (el.onclick = () => itemDetails(ctx, Number(el.dataset.ownedView))),
    );
  root.querySelectorAll("[data-owned-card]").forEach(
    (el) =>
      (el.onclick = () =>
        showCard(
          ctx,
          ctx.o.deck.find((c) => c.uid === Number(el.dataset.ownedCard)),
        )),
  );
}
function incomingDetails(ctx) {
  const h = ctx.o.battle.reaction;
  if (!h) return;
  const source = ctx.o.battle.enemies.find((e) => e.uid === h.source);
  const choices = ctx.actions
    .map((a) => {
      let note = "";
      if (["block", "bracelet"].includes(a.type)) {
        const result = blockHit(
          a.effects.block,
          a.effects.element,
          h.damage,
          h.element,
        );
        note = ` → ${result.remaining} damage continues`;
      }
      if (a.type === "intercept") {
        const damage = offense(h.damage, h.element, a.effects.element);
        note = ` → ${Math.min(damage, a.effects.allyHp)} Ally HP, ${a.effects.swallow ? 0 : Math.max(0, damage - a.effects.allyHp)} damage continues`;
      }
      return button(ctx, { ...a, label: a.label + note });
    })
    .join("");
  ctx.dialog(
    `<h2>${h.name}</h2><p>${source?.name || "Status"} → Druid</p><p class="attack-number">${h.damage} ${h.element} damage remaining</p><p>Defense stage: ${h.stage}</p><div class="choices">${choices}</div>`,
  );
  bindActions(ctx, ctx.modal);
}
export function enhance(ctx) {
  const { o, actions, app, game } = ctx;
  const sidebar = app.querySelector(".sidebar");
  if (sidebar) {
    const gate = Array.from(sidebar.children).find((el) =>
      el.textContent.includes("The gatekeeper"),
    );
    const log = sidebar.querySelector(".log");
    const ai = sidebar.lastElementChild;
    sidebar.innerHTML = "";
    if (o.mode !== "battle")
      sidebar.insertAdjacentHTML("beforeend", playerMarkup(ctx));
    if (gate) {
      const detail = document.createElement("details");
      detail.className = "gate-detail";
      detail.innerHTML =
        "<summary>Archon · " + (o.archon || "Unknown") + "</summary>";
      detail.append(gate);
      sidebar.append(detail);
    }
    if (log) {
      const detail = document.createElement("details");
      detail.innerHTML = "<summary>Recent events</summary>";
      detail.append(log);
      sidebar.append(detail);
    }
    if (ai) {
      const botbar = ai.querySelector(".botbar");
      if (botbar?.textContent.startsWith("The AI uses")) botbar.remove();
      sidebar.append(ai);
    }
    sidebar.insertAdjacentHTML(
      "beforeend",
      `<label class="speed-control"><input data-fast type="checkbox" ${ctx.settings.fast ? "checked" : ""}> Fast animations</label>`,
    );
  }
  app.querySelector("[data-fast]")?.addEventListener("change", (e) => {
    ctx.settings.fast = e.target.checked;
    ctx.saveSettings();
  });
  if (o.mode === "field") {
    app.querySelectorAll(".tile").forEach((el, i) => {
      el.dataset.cell = i;
      const x = i % 11,
        y = Math.floor(i / 11),
        foe = o.field.entities.find((e) => e.enemy && e.x === x && e.y === y);
      if (foe) el.querySelector("img")?.setAttribute("data-token", foe.uid);
      el.querySelector(".player-mark")?.setAttribute("data-player-token", "");
      const entity = o.field.entities.find(
        (e) => !e.enemy && e.x === x && e.y === y,
      );
      if (entity) {
        const glyph = el.querySelector(".glyph");
        if (glyph) {
          glyph.classList.add("glyph-" + entity.type);
          glyph.innerHTML += `<small>${entity.type}</small>`;
        }
      }
    });
    app.querySelector(".field-wrap>small")?.remove();
  }
  if (o.mode === "battle") {
    const b = o.battle;
    app
      .querySelectorAll(".enemy")
      .forEach((el, i) => (el.dataset.enemyUid = b.enemies[i].uid));
    const section = app.querySelector(".mind").parentElement;
    const hand = app.querySelector(".hand");
    if (hand && sidebar) {
      const wrap = document.createElement("section");
      wrap.className = "revealed-hand";
      wrap.innerHTML = '<div class="eyebrow">Revealed cards</div>';
      wrap.append(hand);
      sidebar.prepend(wrap);
    }
    section.insertAdjacentHTML("beforeend", playerMarkup(ctx, true));
    app
      .querySelectorAll(".resources>span")
      .forEach((el, i) =>
        el.classList.toggle("depleted", !b[["insight", "focus", "channel"][i]]),
      );
    const placement = actions.some((a) => a.type === "place"),
      activation = actions.some((a) => a.type === "activate");
    app.querySelectorAll("[data-action]").forEach((el) => {
      const a = actions.find((a) => a.key === el.dataset.action);
      if (
        a &&
        ((a.type === "activatePhase" && (b.focus <= 0 || !placement)) ||
          (a.type === "endTurn" && (b.channel <= 0 || !activation)))
      )
        el.classList.add("next-choice");
    });
    app.querySelectorAll("[data-hand]").forEach((el) => {
      const c = b.hand.find((c) => c.uid === Number(el.dataset.hand)),
        d = cards[c.id],
        legal = actions.some((a) => a.type === "place" && a.uid === c.uid),
        cost = d.focus + (b.milky ? 1 : 0);
      el.classList.toggle("unavailable", !legal);
      el.dataset.placementDisabled = String(!legal);
      el.draggable = legal;
      el.title = legal
        ? d.text
        : d.unplaceable
          ? "Cannot be placed"
          : b.phase !== "place"
            ? "Placement has ended"
            : cost > b.focus
              ? `Needs ${cost} Focus; ${b.focus} remaining`
              : "No legal slot";
      el.querySelector(".cost").textContent = d.focus === 99 ? "—" : cost;
      el.onclick = () => {
        if (ctx.busy()) return;
        ctx.select(legal ? c.uid : null);
        ctx.render();
        showCard(ctx, c);
      };
      el.ondragstart = (e) => {
        drag = { card: c.uid };
        ctx.select(c.uid);
        e.dataTransfer.setData("text/plain", JSON.stringify(drag));
        app.querySelectorAll("[data-slot]").forEach((slot) =>
          slot.classList.toggle(
            "valid",
            actions.some(
              (a) =>
                a.type === "place" &&
                a.uid === c.uid &&
                a.slot === Number(slot.dataset.slot),
            ),
          ),
        );
      };
      el.ondragend = () => {
        drag = null;
        app
          .querySelectorAll(".slot.valid")
          .forEach((el) => el.classList.remove("valid"));
      };
    });
    app.querySelectorAll("[data-slot]").forEach((old) => {
      const i = Number(old.dataset.slot),
        c = b.grid[i].at(-1),
        el = document.createElement("div");
      el.className = old.className;
      el.dataset.slot = i;
      el.innerHTML = old.innerHTML;
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.setAttribute(
        "aria-label",
        c ? cards[c.id].name + " · full details" : "Slot " + (i + 1),
      );
      old.replaceWith(el);
      if (c) {
        const d = cards[c.id],
          left = remaining(ctx, c, i),
          can = actions.some((a) => a.type === "activate" && a.slot === i);
        const nums = el.querySelector(".nums");
        nums.innerHTML = `${d.type === "Ally" ? "♥ " + c.hp + " · " : d.type === "Ward" ? "Ward " + c.ward + " · " : ""}<b>${left === Infinity ? "∞" : left}/${d.limit < 0 ? "∞" : ctx.game.allowance({ ...c, used: 0 }, i)} acts</b>${c.freeze >= b.turn ? " · Frozen" : ""}${c.lock ? " · Locked" : ""}${c.sever ? " · Severed" : ""}`;
        el.insertAdjacentHTML(
          "beforeend",
          `<button class="slot-activate ${can ? "available" : ""}" data-activate-slot="${i}" aria-disabled="${!can}" title="${ctx.esc(can ? d.text : whyDisabled(ctx, c, i))}">Activate · ${effect(c, i, ctx)}</button>`,
        );
        el.querySelector(".slot-activate").onclick = (e) => {
          stop(e);
          if (!ctx.busy() && can) activationChooser(ctx, i);
        };
      }
      el.onclick = () => {
        if (ctx.busy()) return;
        const a = game
          .legal()
          .find(
            (a) =>
              a.type === "place" &&
              a.slot === i &&
              app
                .querySelector(`[data-hand="${a.uid}"]`)
                ?.classList.contains("selected"),
          );
        if (a) run(ctx, a);
        else if (c) showCard(ctx, c, i);
      };
      el.onkeydown = (e) => {
        if (e.target === el && ["Enter", " "].includes(e.key)) {
          e.preventDefault();
          el.click();
        }
      };
      el.ondragover = (e) => {
        if (
          drag?.card &&
          actions.some(
            (a) => a.type === "place" && a.uid === drag.card && a.slot === i,
          )
        ) {
          e.preventDefault();
          el.classList.add("drop-ready");
        }
      };
      el.ondragleave = () => el.classList.remove("drop-ready");
      el.ondrop = (e) => {
        e.preventDefault();
        const a = actions.find(
          (a) => a.type === "place" && a.uid === drag?.card && a.slot === i,
        );
        drag = null;
        if (a) run(ctx, a);
      };
      if (
        actions.some((a) => a.type === "intercept" && a.slot === i) ||
        (b.reaction &&
          b.shields.some(
            (p) => p.slot === i && p.block > 0 && b.reaction.stage === "shield",
          ))
      )
        el.classList.add("defense-ready");
    });
    const hints = section.querySelectorAll(".row.spread>small");
    hints.forEach((el) => {
      if (
        el.textContent.startsWith("Choose a revealed") ||
        el.textContent.startsWith("Click a placed")
      )
        el.textContent =
          b.phase === "place"
            ? "Placement"
            : activation
              ? "Activation"
              : "No activations available";
    });
    if (b.reaction) {
      const box = section.querySelector(".panel.pulse");
      if (box) {
        box.classList.add("incoming-attack");
        box.insertAdjacentHTML(
          "afterbegin",
          '<button class="inspect-attack">Incoming attack ↘</button>',
        );
        box.querySelector(".inspect-attack").onclick = () =>
          incomingDetails(ctx);
        box
          .querySelectorAll("[data-action]")
          .forEach((el) => (el.onclick = () => run(ctx, el.dataset.action)));
      }
    }
  }
  if (o.mode === "event") {
    const scene = app.querySelector(".scene");
    scene?.insertAdjacentHTML(
      "beforeend",
      `<aside class="event-gear">${playerMarkup(ctx)}</aside>`,
    );
  }
  if (o.mode === "tavern") tavern(ctx);
  if (o.mode === "reward" || o.mode === "item") {
    const title = app.querySelector(".layout>section>h2");
    title?.insertAdjacentHTML(
      "afterend",
      `<p class="reward-rule">${o.reward?.cards ? "Choose ONE card · the other cards are left behind" : o.mode === "item" ? "Collect or leave this item" : o.reward?.gem || o.reward?.setting ? "Your reward · collect this item" : "All rewards collected"}</p>`,
    );
    app.querySelectorAll(".catalog [data-action]").forEach((el) => {
      const a = actions.find((a) => a.key === el.dataset.action);
      if (a)
        el.textContent =
          a.type === "rewardCard" ? "Choose this card" : "Collect";
    });
  }
  bindEquipment(ctx, app);
  if (ctx.frame) {
    app
      .querySelectorAll("button,select,input")
      .forEach((el) => (el.disabled = true));
  }
}
