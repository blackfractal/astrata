import { tutorialGuide } from "./tutorial.mjs";
let context = null,
  layer = null,
  observer = null,
  queued = false;
const escape = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
function targets(ctx, guide) {
  let selectors = guide.focus ? [guide.focus] : [];
  if (guide.kind === "action")
    for (const a of ctx.game.legal()) {
      if (a.type === "place")
        selectors.push(`[data-hand="${a.uid}"], [data-slot="${a.slot}"]`);
      if (a.type === "activate")
        selectors.push(`[data-activate-slot="${a.slot}"]`);
      if (["ward", "block", "intercept"].includes(a.type))
        selectors.push(`[data-slot="${a.slot}"]`);
      if (a.type === "bracelet")
        selectors.push(`.battle-player [data-item-uid="${a.uid}"]`);
      if (a.type === "skipEquipment")
        selectors.push(".battle-player .player-portrait");
      document.querySelectorAll("[data-action]").forEach((el) => {
        if (el.dataset.action === a.key) el.classList.add("tutorial-target");
      });
    }
  for (const selector of selectors)
    document.querySelectorAll(selector).forEach((el) => {
      if (
        ctx.game.s.mode === "tavern" &&
        el.matches("[data-equip-slot], [data-socket] ") &&
        !el.closest(".tavern-service")
      )
        return;
      el.classList.add("tutorial-target");
    });
}
function refreshTargets() {
  queued = false;
  document
    .querySelectorAll(".tutorial-target")
    .forEach((el) => el.classList.remove("tutorial-target"));
  if (context && layer) {
    const guide = tutorialGuide(context.game);
    if (guide) targets(context, guide);
  }
}
export function clearTutorialUI() {
  context = null;
  if (layer) layer.hidden = true;
  document.body.classList.remove("in-tutorial");
  document
    .querySelectorAll(".tutorial-target")
    .forEach((el) => el.classList.remove("tutorial-target"));
}
export function paintTutorial(ctx, frame = false) {
  if (!observer) {
    observer = new MutationObserver(() => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(refreshTargets);
      }
    });
    observer.observe(document.querySelector("#app"), {
      childList: true,
      subtree: true,
    });
    observer.observe(document.querySelector("#modal"), {
      childList: true,
      subtree: true,
    });
  }
  const guide = tutorialGuide(ctx.game);
  if (!guide || ctx.game.s.mode === "result") return clearTutorialUI();
  context = ctx;
  document.body.classList.add("in-tutorial");
  if (!layer) {
    layer = document.createElement("aside");
    layer.id = "tutorial-layer";
    document.body.append(layer);
  }
  layer.hidden = !!frame;
  layer.className =
    ctx.game.s.mode === "battle" ? "tutorial-battle" : "tutorial-road";
  layer.innerHTML = `<section class="tutorial-guide" aria-label="Tutorial guidance" data-tutorial-step="${escape(guide.id)}"><div class="tutorial-eyebrow">THE FIRST CLEARING <span>${guide.index + 1} / ${guide.total}</span></div><div class="tutorial-progress"><i style="width:${(100 * (guide.index + 1)) / guide.total}%"></i></div><h2>${escape(guide.title)}</h2><p>${escape(guide.text)}</p>${guide.kind === "note" ? '<button class="tutorial-next" data-tutorial-next>Continue <span aria-hidden="true">→</span></button>' : `<small>${guide.kind === "free" ? "No forced choices · read any keyword for help." : "Follow the highlighted control."}</small>`}</section>`;
  layer.querySelector("[data-tutorial-next]")?.addEventListener("click", () => {
    if (ctx.busy()) return;
    ctx.close();
    const a = ctx.game.legal().find((a) => a.type === "tutorialNext");
    if (a) ctx.act(a);
  });
  refreshTargets();
}
