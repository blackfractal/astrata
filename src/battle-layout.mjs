import { items, MIND_COLUMNS, MIND_ROWS } from "./content.mjs";
let toolsOpen = false;
export function arrangeBattle(ctx) {
  const { app, o, actions } = ctx;
  const old = app.querySelector(".layout"),
    mind = app.querySelector(".mind");
  if (!old || !mind) return;
  app.classList.add("battle-scene");
  mind.style.setProperty("--mind-columns", MIND_COLUMNS);
  mind.style.setProperty("--mind-rows", MIND_ROWS);
  const layout = document.createElement("section");
  layout.className = "battle-layout";
  const command = document.createElement("div");
  command.className = "battle-command";
  command.append(
    app.querySelector(".phasebar"),
    app.querySelector(".resources"),
  );
  const arena = document.createElement("div");
  arena.className = "battle-arena";
  const player = app.querySelector(".battle-player");
  const enemies = app.querySelector(".enemy-line");
  const enemyArea = document.createElement("section");
  enemyArea.className = "battle-foes";
  const heading = document.createElement("div");
  heading.className = "eyebrow";
  heading.textContent = `Enemies · ${o.battle.enemies.length}`;
  enemies.classList.toggle("solo-enemy", o.battle.enemies.length === 1);
  enemies.classList.toggle("many-enemies", o.battle.enemies.length > 3);
  enemies.classList.toggle("crowded-enemies", o.battle.enemies.length > 6);
  enemyArea.append(heading, enemies);
  arena.append(player, mind, enemyArea);
  const dock = document.createElement("section");
  dock.className = "battle-dock";
  const incoming = old.querySelector(".incoming-attack");
  const hand = old.querySelector(".revealed-hand");
  if (incoming) dock.append(incoming);
  else if (hand) dock.append(hand);
  else dock.innerHTML = '<div class="eyebrow">Revealed cards</div>';
  const footer = document.createElement("footer");
  footer.className = "battle-footer";
  const piles = old.querySelector('[data-ui="piles"]');
  if (piles) footer.append(piles);
  const turn = document.createElement("span");
  turn.className = "battle-turn";
  turn.textContent = `Turn ${o.battle.turn}`;
  footer.append(turn);
  const tools = document.createElement("details");
  tools.className = "battle-tools";
  tools.open = toolsOpen;
  tools.ontoggle = () => {
    if (tools.isConnected) toolsOpen = tools.open;
  };
  tools.innerHTML = "<summary>Battle tools</summary>";
  const sidebar = old.querySelector(".sidebar");
  if (sidebar) tools.append(sidebar);
  footer.append(tools);
  layout.append(command, arena, dock, footer);
  old.replaceWith(layout);
  const activeEnemy = enemies.querySelector(
    `[data-enemy-uid="${o.battle.reaction?.source}"]`,
  );
  if (activeEnemy)
    activeEnemy.scrollIntoView({ block: "nearest", inline: "nearest" });

  const takeHit = actions.find((a) => a.type === "skipEquipment");
  const portrait = player.querySelector(".player-portrait");
  if (takeHit && portrait) {
    portrait.classList.add("defense-ready");
    portrait.setAttribute(
      "aria-label",
      "Druid: take the hit and save remaining defenses",
    );
    portrait.title =
      "Click the Druid to take this hit without using remaining cards or item block. Armor still applies.";
    portrait.onclick = (e) => {
      e.stopPropagation();
      if (!ctx.busy()) {
        const current = ctx.game
          .legal()
          .find((a) => a.type === "skipEquipment");
        if (current) {
          ctx.close();
          ctx.act(current);
        }
      }
    };
  }

  // Keep compact equipment spatially arranged around the portrait.
  const labels = {
    head: "Head",
    neck: "Neck",
    torso: "Armor",
    wrist1: "L wrist",
    wrist2: "R wrist",
    finger1: "L ring",
    finger2: "R ring",
  };
  player.querySelectorAll("[data-equip-slot]").forEach((slot) => {
    const label = labels[slot.dataset.equipSlot];
    slot.querySelector(".gear-label").textContent = label;
    const button = slot.querySelector(".gear-item"),
      uid = Number(button.dataset.itemUid);
    const owned = o.inventory.find((x) => x.uid === uid),
      def = items[owned?.id];
    button.setAttribute("aria-label", `${label}: ${def?.name || "Empty"}`);
    const block = actions.find((a) => a.type === "bracelet" && a.uid === uid);
    if (block) {
      button.classList.add("block-available");
      button.setAttribute("aria-label", `${label}: ${block.label}`);
      button.title =
        block.label + " · Click to block this attack. " + (def?.text || "");
      button.onclick = (e) => {
        e.stopPropagation();
        if (!ctx.busy()) {
          ctx.close();
          ctx.act(block);
        }
      };
    }
    const bracelet = o.battle.bracelets.find((b) => b.uid === uid);
    slot.classList.toggle("defense-empty", !!bracelet && bracelet.block <= 0);
    slot.classList.toggle(
      "attack-ready",
      !!def?.effect.firstAttackOnly &&
        o.battle.phase === "activate" &&
        o.battle.firstAttackTurn !== o.battle.turn,
    );
  });
}
