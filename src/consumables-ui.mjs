import { items } from "./content.mjs";
import { consumableReason } from "./consumables.mjs";
let selected = null,
  listeners = null;
const short = {
  healingSap: "+5 HP",
  focusDraught: "+1 Focus",
  channelDraught: "+1 Channel",
  insightDew: "Draw 1",
  starFlask: "6 Arcane",
};
export function enhanceConsumables(ctx) {
  listeners?.abort();
  listeners = new AbortController();
  const { o, app, actions } = ctx;
  if (!["battle", "field"].includes(o.mode)) {
    selected = null;
    return;
  }
  const groups = new Map();
  for (const x of o.inventory)
    if (items[x.id].consumable) {
      if (!groups.has(x.id)) groups.set(x.id, []);
      groups.get(x.id).push(x);
    }
  if (!groups.size) {
    selected = null;
    return;
  }
  if (
    selected &&
    !actions.some((a) => a.type === "consume" && a.uid === selected)
  )
    selected = null;
  const tray = document.createElement("section");
  tray.className = "consumable-tray";
  const spent =
    o.mode === "battle"
      ? o.battle.consumableTurn === o.battle.turn
      : o.field.consumableRound === o.field.round;
  tray.innerHTML = `<div class="supplies-heading"><span>Consumables</span><small data-tooltip="One consumable per player turn. Costs no Channel. Used items are gone permanently.">${spent ? "Used this turn" : "1 ready"}</small></div><div class="consumable-row">${[
    ...groups,
  ]
    .map(([id, xs]) => {
      const x = xs[0],
        d = items[id],
        choices = actions.filter(
          (a) => a.type === "consume" && a.uid === x.uid,
        );
      const reason =
        consumableReason(ctx.game.s, x) ||
        (!choices.length ? "Unavailable during this lesson." : "");
      const data =
        choices.length && !d.consumable.damage
          ? `data-action="${ctx.esc(choices[0].key)}"`
          : `data-throw="${x.uid}"`;
      return `<article class="consumable ${choices.length ? "ready" : "unavailable"} ${selected === x.uid ? "selected" : ""}" data-consumable-uid="${x.uid}" draggable="${!!choices.length && !!d.consumable.damage}"><button class="consumable-art" data-consumable-view="${x.uid}" aria-label="View ${d.name}" data-tooltip="${ctx.esc(d.name + ": " + d.text)}">${ctx.img("item-" + id)}<b>×${xs.length}</b></button><button class="consumable-use" ${data} ${choices.length ? "" : "disabled"} data-tooltip="${ctx.esc(reason || d.text)}">${short[id]}</button></article>`;
    })
    .join(
      "",
    )}</div>${selected ? '<button class="cancel-consumable" data-cancel-potion>Choose an enemy · Cancel</button>' : ""}`;
  const host =
    o.mode === "battle"
      ? app.querySelector(".battle-dock")
      : app.querySelector(".sidebar");
  host?.append(tray);
  for (const el of tray.querySelectorAll("[data-action]"))
    el.onclick = () => {
      if (!ctx.busy()) ctx.act(el.dataset.action);
    };
  for (const el of tray.querySelectorAll("[data-consumable-view]"))
    el.onclick = () => {
      if (ctx.busy()) return;
      const x = o.inventory.find(
          (x) => x.uid === Number(el.dataset.consumableView),
        ),
        d = items[x.id];
      ctx.dialog(
        `<h2>${d.name}</h2><div class="item-detail">${ctx.img("item-" + x.id, "full-art")}<div><p>${ctx.text(d.text)}</p><p>One Satchel slot per bottle.</p></div></div>`,
      );
    };
  const choose = (uid) => {
    if (ctx.busy()) return;
    selected = uid;
    ctx.render();
  };
  for (const el of tray.querySelectorAll("[data-throw]"))
    el.onclick = () => choose(Number(el.dataset.throw));
  tray
    .querySelector("[data-cancel-potion]")
    ?.addEventListener("click", () => choose(null));
  for (const el of tray.querySelectorAll('[draggable="true"]')) {
    el.ondragstart = (e) => {
      selected = Number(el.dataset.consumableUid);
      e.dataTransfer.setData(
        "application/astrata-consumable",
        String(selected),
      );
      e.dataTransfer.effectAllowed = "copy";
      markTargets();
    };
    el.ondragend = () => {
      selected = null;
      ctx.render();
    };
  }
  function markTargets() {
    for (const enemy of app.querySelectorAll("[data-enemy-uid]")) {
      const a = actions.find(
        (a) =>
          a.type === "consume" &&
          a.uid === selected &&
          a.target === Number(enemy.dataset.enemyUid),
      );
      enemy.classList.toggle("consumable-target", !!a);
    }
  }
  markTargets();
  const commit = (target) => {
    const a = actions.find(
      (a) =>
        a.type === "consume" &&
        a.uid === selected &&
        a.target === Number(target.dataset.enemyUid),
    );
    if (a && !ctx.busy()) {
      selected = null;
      ctx.act(a);
    }
  };
  app.addEventListener(
    "click",
    (e) => {
      if (!selected) return;
      const enemy = e.target.closest("[data-enemy-uid]");
      if (enemy) {
        e.preventDefault();
        e.stopImmediatePropagation();
        commit(enemy);
      } else if (!e.target.closest(".consumable-tray")) choose(null);
    },
    { capture: true, signal: listeners.signal },
  );
  for (const enemy of app.querySelectorAll("[data-enemy-uid]")) {
    enemy.addEventListener("dragover", (e) => {
      if (selected) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }
    });
    enemy.addEventListener(
      "drop",
      (e) => {
        if (selected) {
          e.preventDefault();
          e.stopImmediatePropagation();
          commit(enemy);
        }
      },
      { capture: true },
    );
  }
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && selected) {
        e.preventDefault();
        e.stopImmediatePropagation();
        choose(null);
      }
    },
    { capture: true, signal: listeners.signal },
  );
}
