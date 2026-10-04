import { tutorialGuide } from "./tutorial.mjs";
import { tutorialHint } from "./tutorial-hints.mjs";
let context = null,
  layer = null,
  observer = null,
  queued = false,
  idleTimer = null,
  lastActivity = 0,
  lastSteps = null,
  hint = null;
const IDLE_MS = 15000;
function independent() {
  return (
    context?.game.s.mode === "battle" &&
    tutorialGuide(context.game)?.kind === "free"
  );
}
function hideHint() {
  hint = null;
  if (
    independent() &&
    context.game.s.tutorial.independentIntroDismissed &&
    layer
  )
    layer.hidden = true;
  refreshTargets();
}
function armIdle() {
  clearTimeout(idleTimer);
  if (!independent() || !context.game.s.tutorial.independentIntroDismissed)
    return;
  idleTimer = setTimeout(
    checkIdle,
    Math.max(100, IDLE_MS - (performance.now() - lastActivity)),
  );
}
function activity() {
  if (!independent()) return;
  lastActivity = performance.now();
  hideHint();
  armIdle();
}
function checkIdle() {
  if (!independent() || !context.game.s.tutorial.independentIntroDismissed)
    return;
  if (
    context.busy() ||
    !document.querySelector("#modal").hidden ||
    document.hidden ||
    document.querySelector(".presentation-bar")
  ) {
    lastActivity = performance.now();
    armIdle();
    return;
  }
  if (performance.now() - lastActivity < IDLE_MS) {
    armIdle();
    return;
  }
  hint = tutorialHint(context.game);
  if (!hint) return;
  layer.hidden = false;
  layer.innerHTML = `<section class="tutorial-guide tutorial-idle-guide" aria-label="Optional tutorial suggestion" role="status" data-tutorial-hint><div class="tutorial-eyebrow">A GENTLE SUGGESTION</div><p>${escape(hint.text)}</p><small>Your choice · continue playing to dismiss.</small></section>`;
  refreshTargets();
}
const escape = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
function targets(ctx, guide, suggested = null) {
  let selectors = guide.focus ? [guide.focus] : [];
  if (guide.kind === "action")
    for (const a of suggested ? [suggested] : ctx.game.legal()) {
      if (a.type === "place")
        selectors.push(`[data-hand="${a.uid}"], [data-slot="${a.slot}"]`);
      if (a.type === "consume") selectors.push(".consumable-tray");
      if (a.type === "activate")
        selectors.push(`[data-activate-slot="${a.slot}"]`);
      if (["ward", "block", "intercept", "recall"].includes(a.type))
        selectors.push(`[data-slot="${a.slot}"]`);
      if (["bracelet", "armor"].includes(a.type))
        selectors.push(`.battle-player [data-item-uid="${a.uid}"]`);
      if (a.type === "skipEquipment")
        selectors.push(".battle-player .player-portrait");
      document.querySelectorAll("[data-action]").forEach((el) => {
        if (el.dataset.action === a.key) mark(el, !!suggested);
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
      mark(el, !!suggested);
    });
}
function mark(el, gentle) {
  el.classList.add("tutorial-target");
  if (gentle) el.classList.add("tutorial-hint-target");
  else if (
    el.matches(
      "button, [data-hand], [data-slot], [data-equip-slot], [data-item-uid], [data-socket], .player-portrait",
    )
  )
    el.classList.add("tutorial-target-control");
}
function refreshTargets() {
  queued = false;
  document
    .querySelectorAll(".tutorial-target")
    .forEach((el) =>
      el.classList.remove(
        "tutorial-target",
        "tutorial-target-control",
        "tutorial-hint-target",
      ),
    );
  if (context && layer) {
    const guide = tutorialGuide(context.game);
    if (guide?.kind === "free") {
      if (hint) targets(context, { kind: "action", focus: "" }, hint.action);
    } else if (guide) targets(context, guide);
  }
}
export function clearTutorialUI() {
  clearTimeout(idleTimer);
  hint = null;
  lastSteps = null;
  context = null;
  if (layer) layer.hidden = true;
  document.body.classList.remove("in-tutorial");
  document
    .querySelectorAll(".tutorial-target")
    .forEach((el) =>
      el.classList.remove(
        "tutorial-target",
        "tutorial-target-control",
        "tutorial-hint-target",
      ),
    );
}
export function paintTutorial(ctx, frame = false) {
  if (!observer) {
    for (const type of [
      "pointerdown",
      "pointermove",
      "keydown",
      "wheel",
      "dragstart",
      "drop",
      "visibilitychange",
    ])
      document.addEventListener(type, activity, {
        capture: true,
        passive: true,
      });
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
  if (context?.game !== ctx.game || lastSteps !== ctx.game.s.steps || frame) {
    hint = null;
    lastActivity = performance.now();
  }
  lastSteps = ctx.game.s.steps;
  context = ctx;
  document.body.classList.add("in-tutorial");
  if (!layer) {
    layer = document.createElement("aside");
    layer.id = "tutorial-layer";
    document.body.append(layer);
  }
  layer.hidden = !!frame;
  layer.className =
    ctx.game.s.mode === "battle"
      ? "tutorial-battle"
      : ctx.game.s.mode === "field"
        ? "tutorial-road tutorial-field"
        : "tutorial-road";
  if (guide.kind === "free" && ctx.game.s.tutorial.independentIntroDismissed) {
    layer.hidden = true;
    hint = null;
    refreshTargets();
    armIdle();
    return;
  }
  clearTimeout(idleTimer);
  layer.innerHTML = `<section class="tutorial-guide" aria-label="Tutorial guidance" data-tutorial-step="${escape(guide.id)}"><div class="tutorial-eyebrow">THE FIRST CLEARING <span>${guide.index + 1} / ${guide.total}</span></div><div class="tutorial-progress"><i style="width:${(100 * (guide.index + 1)) / guide.total}%"></i></div><h2>${escape(guide.title)}</h2><p>${escape(guide.text)}</p>${guide.kind === "free" ? '<button class="tutorial-next" data-tutorial-independent>Let me try <span aria-hidden="true">→</span></button>' : guide.kind === "note" ? '<button class="tutorial-next" data-tutorial-next>Continue <span aria-hidden="true">→</span></button>' : `<small>${guide.kind === "free" ? "No forced choices · read any keyword for help." : "Follow the highlighted control."}</small>`}</section>`;
  layer
    .querySelector("[data-tutorial-independent]")
    ?.addEventListener("click", async () => {
      if (ctx.busy()) return;
      lastActivity = performance.now();
      await ctx.dismissIndependent();
    });
  layer.querySelector("[data-tutorial-next]")?.addEventListener("click", () => {
    if (ctx.busy()) return;
    ctx.close();
    const a = ctx.game.legal().find((a) => a.type === "tutorialNext");
    if (a) ctx.act(a);
  });
  refreshTargets();
}
