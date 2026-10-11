// A fixed composition, uniformly fitted inside any actual display surface.
export const STAGE = { width: 1600, height: 900 };
export function stageBounds() {
  const scale = Math.min(innerWidth / STAGE.width, innerHeight / STAGE.height);
  return {
    scale,
    width: STAGE.width * scale,
    height: STAGE.height * scale,
    left: (innerWidth - STAGE.width * scale) / 2,
    top: (innerHeight - STAGE.height * scale) / 2,
  };
}
export function installStage() {
  const fit = () => {
    const b = stageBounds(),
      css = document.documentElement.style;
    for (const [key, value] of Object.entries(b))
      css.setProperty("--stage-" + key, key === "scale" ? value : value + "px");
  };
  addEventListener("resize", fit);
  fit();
}
