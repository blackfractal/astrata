import { cards, items } from "./content.mjs";
import { tradeAssets } from "./engine.mjs";
const slots = {
  wrist1: "Left wrist",
  wrist2: "Right wrist",
  finger1: "Left ring",
  finger2: "Right ring",
  head: "Head",
  neck: "Neck",
  torso: "Armor",
};
function details(ctx, x, kind) {
  const d = (kind === "item" ? items : cards)[x.id];
  const gem = kind === "item" && ctx.o.inventory.find((g) => g.uid === x.gem);
  return `<p>${ctx.text(d.text)}</p>${x.upgrade && d.upgrade ? `<p>Upgrade: ${ctx.text(d.upgrade.text)}</p>` : ""}${kind === "card" ? `<p>${d.element} · ${d.type} · ${d.focus} Focus · ${d.channel} Channel · ${d.limit < 0 ? "∞" : d.limit} activations${x.upgrade ? " · Upgraded" : ""}</p>` : ""}${gem ? `<p class="trade-gem">${items[gem.id].name}: ${ctx.text(items[gem.id].text)}<br>The socketed Gem is given away with this Setting.</p>` : ""}`;
}
function tradeChooser(ctx, index) {
  if (ctx.busy()) return;
  const choice = ctx.o.event.choices[index],
    trade = choice.trade,
    assets = tradeAssets(ctx.o, trade),
    isItem = trade.kind === "item";
  const actions = ctx.actions.filter(
      (a) => a.type === "eventChoice" && a.index === index,
    ),
    key = isItem ? "tradeItem" : "tradeCard";
  const assetMarkup = (x) => {
    const d = (isItem ? items : cards)[x.id],
      eligible = actions.some((a) => a[key] === x.uid),
      gem = isItem && ctx.o.inventory.find((g) => g.uid === x.gem);
    return `<article class="trade-asset ${eligible ? "" : "unavailable"}" data-trade-asset="${x.uid}"><button class="trade-select" data-trade-select="${x.uid}" draggable="${eligible}" ${eligible ? "" : "disabled"} aria-pressed="false"><span class="trade-asset-art">${ctx.img((isItem ? "item-" : "card-") + x.id)}${gem ? `<span class="fitted-gem" data-fitted-gem="${gem.uid}" aria-label="Includes socketed ${ctx.esc(items[gem.id].name)}" title="${ctx.esc(items[gem.id].name)} is given away with this Setting">${ctx.img("item-" + gem.id)}</span>` : ""}</span><b>${d.name}${x.upgrade ? " +" : ""}</b><small>${x.equippedSlot ? slots[x.equippedSlot] : isItem ? "Satchel" : "Grimoire"}</small>${isItem && x.gem ? `<small>Includes ${items[ctx.o.inventory.find((g) => g.uid === x.gem).id].name}</small>` : ""}</button>${x.reason ? `<small>${ctx.esc(x.reason)}</small>` : ""}<details><summary>View details</summary>${details(ctx, x, trade.kind)}</details></article>`;
  };
  const group = (title, list) =>
    list.length
      ? `<section class="trade-group"><h3>${title}</h3><div class="trade-assets">${list.map(assetMarkup).join("")}</div></section>`
      : "";
  const rewards = [
    choice.card ? { id: choice.card, kind: "card" } : null,
    choice.item ? { id: choice.item, kind: "item" } : null,
  ].filter(Boolean);
  ctx.dialog(
    `<div class="trade-heading"><div class="eyebrow">${ctx.esc(ctx.o.event.name)}</div><h2>${ctx.esc(choice.label)}</h2></div><div class="trade-layout"><div class="trade-belongings">${
      isItem
        ? group(
            "Equipped",
            assets.filter((x) => x.equippedSlot),
          ) +
          group(
            "Satchel",
            assets.filter((x) => !x.equippedSlot),
          )
        : group("Grimoire", assets)
    }${assets.length ? "" : "<p>No matching belongings.</p>"}</div><section class="trade-reward" data-trade-drop aria-label="Trade offer drop area"><div class="eyebrow">You receive</div>${rewards.map((x) => `<h3>${(x.kind === "card" ? cards : items)[x.id].name}</h3>${ctx.img(x.kind + "-" + x.id, "trade-reward-art")}<details><summary>View reward</summary>${details(ctx, x, x.kind)}</details>`).join("")}<p class="trade-selection" aria-live="polite">Select or drag a ${ctx.esc(trade.label || trade.kind)} here.</p><button class="primary" data-trade-confirm disabled>Trade selected ${ctx.esc(trade.label || trade.kind)}</button></section></div><div class="trade-footer"><button data-trade-back>← Back to choices</button></div>`,
  );
  ctx.modal.querySelector(".dialog").classList.add("trade-dialog");
  let selected = null,
    dragged = null,
    committed = false;
  const zone = ctx.modal.querySelector("[data-trade-drop]"),
    confirm = ctx.modal.querySelector("[data-trade-confirm]");
  const actionFor = (uid) => actions.find((a) => a[key] === uid);
  const select = (uid) => {
    if (!actionFor(uid)) return;
    selected = uid;
    for (const el of ctx.modal.querySelectorAll("[data-trade-select]"))
      el.setAttribute(
        "aria-pressed",
        String(Number(el.dataset.tradeSelect) === uid),
      );
    const x = assets.find((x) => x.uid === uid),
      d = (isItem ? items : cards)[x.id];
    ctx.modal.querySelector(".trade-selection").textContent =
      `Offer ${d.name}${x.upgrade ? " +" : ""}${isItem && x.gem ? " with " + items[ctx.o.inventory.find((g) => g.uid === x.gem).id].name : ""}${x.equippedSlot ? " · " + slots[x.equippedSlot] : ""}`;
    confirm.disabled = false;
    zone.classList.add("has-offer");
  };
  const commit = (uid) => {
    if (committed || ctx.busy()) return;
    const expected = actionFor(uid),
      current =
        expected && ctx.game.legal().find((a) => a.key === expected.key);
    if (!current) return;
    committed = true;
    ctx.close();
    ctx.act(current);
  };
  for (const el of ctx.modal.querySelectorAll("[data-trade-select]")) {
    const uid = Number(el.dataset.tradeSelect);
    el.onclick = () => select(uid);
    el.ondragstart = (e) => {
      if (!actionFor(uid)) {
        e.preventDefault();
        return;
      }
      dragged = uid;
      select(uid);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(uid));
      zone.classList.add("accepting-offer");
    };
    el.ondragend = () => {
      dragged = null;
      zone.classList.remove("accepting-offer", "drag-over");
    };
  }
  zone.ondragover = (e) => {
    if (dragged != null && actionFor(dragged)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      zone.classList.add("drag-over");
    }
  };
  zone.ondragleave = (e) => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove("drag-over");
  };
  zone.ondrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const uid = dragged;
    dragged = null;
    zone.classList.remove("accepting-offer", "drag-over");
    if (uid != null) commit(uid);
  };
  confirm.onclick = () => commit(selected);
  ctx.modal.querySelector("[data-trade-back]").onclick = () => ctx.close();
}
export function eventTrades(ctx) {
  const choices = ctx.app.querySelector(".scene-copy .choices");
  if (!choices || !ctx.o.event.choices.some((c) => c.trade)) return;
  choices.innerHTML = ctx.o.event.choices
    .map((c, index) => {
      const legal = ctx.actions.filter(
        (a) => a.type === "eventChoice" && a.index === index,
      );
      return c.trade
        ? `<button data-event-trade="${index}" ${legal.length ? "" : "disabled"}>${ctx.esc(c.label)}</button>`
        : legal.map((a) => ctx.actionButton(a)).join("");
    })
    .join("");
  for (const el of choices.querySelectorAll("[data-event-trade]"))
    el.onclick = () => tradeChooser(ctx, Number(el.dataset.eventTrade));
  for (const el of choices.querySelectorAll("[data-action]"))
    el.onclick = () => {
      if (!ctx.busy()) ctx.act(el.dataset.action);
    };
}
