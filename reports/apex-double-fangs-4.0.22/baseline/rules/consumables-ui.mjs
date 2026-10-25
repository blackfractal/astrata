import { items, cards } from "./content.mjs";
import { consumableUnavailableReason, potionSummary, itemName, itemText } from "./consumables.mjs";
let selected = null,
  listeners = null;
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
      const key = x.id + (x.crystal ? ":crystal" : "");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(x);
    }
  const pendingBuff = o.mode === 'battle' && (o.battle.fury || o.battle.bastion || o.battle.confluence || o.battle.statusProtection >= o.battle.turn);
  if (!groups.size && !actions.some(a=>a.type==='braceletElement'||a.type==='inspirationKeep') && !o.battle?.inspiration && !pendingBuff) {
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
  const readyCount = [...groups.values()].reduce((n, xs) => n + (actions.some(a => a.type === "consume" && a.uid === xs[0].uid) ? xs.length : 0), 0);
  tray.innerHTML = `<div class="supplies-heading"><span>Consumables</span><small data-tooltip="No per-turn limit. Costs no Channel. Used items are gone permanently.">${readyCount} ready</small></div><div class="consumable-row">${[
    ...groups,
  ]
    .map(([, xs]) => {
      const x = xs[0],
        id = x.id,
        d = items[id],
        choices = actions.filter(
          (a) => a.type === "consume" && a.uid === x.uid,
        );
      const reason = consumableUnavailableReason(ctx.game.s, x, choices.length);
      const data =
        choices.length && !d.consumable.damage && choices.length === 1
          ? `data-action="${ctx.esc(choices[0].key)}"`
          : `data-throw="${x.uid}"`;
      return `<article class="consumable ${x.crystal ? "crystal-enhanced" : ""} ${choices.length ? "ready" : "unavailable"} ${selected === x.uid ? "selected" : ""}" data-consumable-uid="${x.uid}" draggable="${!!choices.length && !!d.consumable.damage}"><button class="consumable-art" data-consumable-view="${x.uid}" aria-label="View ${itemName(x)}" data-tooltip="${ctx.esc(itemName(x) + ": " + itemText(x))}">${ctx.img("item-" + id)}${x.crystal ? '<span class="crystal-badge">2× effect</span>' : ''}<b>×${xs.length}</b></button><button class="consumable-use" ${data} ${choices.length ? "" : "disabled"} data-tooltip="${ctx.esc(reason || itemText(x))}">${potionSummary(x)}</button></article>`;
    })
    .join(
      "",
    )}</div>${selected ? '<button class="cancel-consumable" data-cancel-potion>Choose an enemy · Cancel</button>' : ""}`;
  const host =
    o.mode === "battle"
      ? app.querySelector(".battle-dock")
      : app.querySelector(".sidebar");
  host?.append(tray);
  const buffs=o.mode==='battle'?[o.battle.fury?'Next attack ×2':null,o.battle.bastion?'Next Guard/Ward ×2':null,o.battle.confluence?'Focus ↔ Channel':null,o.battle.statusProtection>=o.battle.turn?'Status protection':null].filter(Boolean):[];
  if(buffs.length){const badge=document.createElement('div');badge.className='supply-buffs';badge.textContent=buffs.join(' · ');tray.prepend(badge);}
  if(o.battle?.inspiration) {
    const note=document.createElement('p');note.className='inspiration-prompt';
    note.textContent=o.battle.inspiration.stage==='place'?'Inspiration: place the revealed card for free.':'Inspiration: activate the highlighted card for free; it then leaves the grid.';
    tray.prepend(note);
  }
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
        `<h2>${itemName(x)}</h2><div class="item-detail">${ctx.img("item-" + x.id, "full-art")}<div><p>${ctx.text(itemText(x))}</p><p>One Satchel slot per bottle. No per-turn limit.</p></div></div>`,
      );
    };
  const choose = (uid) => {
    if (ctx.busy()) return;
    const x=o.inventory.find(x=>x.uid===uid);
    if(x && items[x.id].expansion==='supplies') {
      const choices=actions.filter(a=>a.type==='consume'&&a.uid===uid);
      const show=(list)=>ctx.dialog(`<h2>${ctx.esc(itemName(x))}</h2><p>${ctx.text(itemText(x))}</p><div class="supply-options">${list.map(a=>`<button data-action="${ctx.esc(a.key)}">${ctx.esc(a.label)}</button>`).join('')}</div>`);
      const slots=[...new Set(choices.map(a=>a.slot).filter(i=>i!=null))];
      if(choices.length>10&&slots.length>1){
        ctx.dialog(`<h2>${ctx.esc(itemName(x))}</h2><p>Choose a card, then choose the effect.</p><div class="supply-options">${slots.map(slot=>{const c=o.battle.grid[slot].at(-1);return `<button class="supply-group" data-supply-slot="${slot}">${ctx.img('card-'+c.id)}${ctx.esc(cards[c.id].name)} · column ${slot%7+1}, row ${Math.floor(slot/7)+1}</button>`;}).join('')}</div>`);
        document.querySelectorAll('[data-supply-slot]').forEach(el=>el.onclick=()=>show(choices.filter(a=>a.slot===Number(el.dataset.supplySlot))));
      }else show(choices);
      return;
    }
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
  const special=actions.filter(a=>a.type==='braceletElement'||a.type==='inspirationKeep');
  if(special.length) {
    const choices=document.createElement('details');choices.className='supply-special';
    choices.innerHTML=`<summary>Equipment / Inspiration choices</summary>${special.map(a=>`<button data-action="${ctx.esc(a.key)}">${ctx.esc(a.label)}</button>`).join('')}`;
    host?.append(choices);
    choices.querySelectorAll('[data-action]').forEach(el=>el.onclick=()=>{if(!ctx.busy())ctx.act(el.dataset.action);});
  }
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
