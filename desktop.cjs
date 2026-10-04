const { app, BrowserWindow, ipcMain, screen } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { recordTutorial } = require("./tutorial-profile.cjs");
const { createArchive } = require("./run-archive.cjs");
const { createCollectionStore } = require("./collection-store.cjs");
let collectionStore;
async function collections() {
  return (collectionStore ||= import("./src/archive-profile.mjs").then((api) =>
    createCollectionStore(base(), api),
  ));
}
let win, runArchive;
function archive() {
  return (runArchive ||= createArchive(base(), {
    packageVersion: require("./package.json").version,
    sources: Object.fromEntries(
      [
        "engine.mjs",
        "strata.mjs",
        "corruptions.mjs",
        "content.mjs",
        "policy.mjs",
        "death.mjs",
        "tutorial.mjs",
        "loom-tutorial.mjs",
        "consumables.mjs",
      ].map((name) => [
        name,
        fs.readFileSync(path.join(__dirname, "src", name), "utf8"),
      ]),
    ),
  }));
}
function windowSize(width) {
  const area = (
    win
      ? screen.getDisplayMatching(win.getBounds())
      : screen.getPrimaryDisplay()
  ).workAreaSize;
  const requested = Number.isFinite(Number(width)) ? Number(width) : 1440;
  const fitted = Math.max(
    640,
    Math.min(requested, area.width - 24, ((area.height - 64) * 16) / 9),
  );
  return [Math.floor(fitted), Math.floor((fitted * 9) / 16)];
}
const base = () => app.getPath("userData");
const read = (name, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(base(), name), "utf8"));
  } catch (error) {
    if (name === "history.json" && error.code !== "ENOENT") throw error;
    return fallback;
  }
};
const write = (name, data) => {
  fs.mkdirSync(base(), { recursive: true });
  const file = path.join(base(), name);
  fs.writeFileSync(file + ".tmp", JSON.stringify(data));
  fs.renameSync(file + ".tmp", file);
};
app.whenReady().then(() => {
  const settings = read("settings.json", {
    width: 1440,
    height: 810,
    fullscreen: false,
    music: 50,
    effects: 50,
  });
  const [width, height] = windowSize(settings.width);
  win = new BrowserWindow({
    width,
    height,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    title: "Astrata",
    backgroundColor: "#101b19",
    fullscreen: settings.fullscreen,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.setMenu(null);
  win.loadFile("index.html");
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file:")) event.preventDefault();
  });
});
ipcMain.handle("load", async () => {
  archive().importHistory(read("history.json", []));
  const data = {
    save: read("save.json", null),
    tutorialSave: read("tutorial-save.json", null),
    tutorialStats: read("tutorial-stats.json", {}),
    settings: read("settings.json", {}),
    history: read("history.json", []),
  };
  data.collections = (await collections()).load(data);
  return data;
});
ipcMain.handle("record", async (_, event) => {
  const result = archive().record(event);
  (await collections()).record(event);
  return result;
});
ipcMain.handle("save", async (_, state, options = {}) => {
  const isTutorial = !!state?.tutorial || !!options.tutorial;
  const saveFile = isTutorial ? "tutorial-save.json" : "save.json";
  const previous = read(saveFile, null);
  if (
    !state ||
    (previous &&
      (previous.uiMeta?.runId
        ? previous.uiMeta.runId !== state.uiMeta?.runId
        : previous.seed !== state.seed))
  )
    archive().forfeit(
      previous,
      state ? "Replaced by a new journey" : "Abandoned by player",
    );
  if (state) {
    (await collections()).record({ state });
    write(saveFile, state);
    if (isTutorial)
      write(
        "tutorial-stats.json",
        recordTutorial(
          read("tutorial-stats.json", {}),
          state,
          "start",
          state.uiMeta?.runId,
        ),
      );
  } else fs.rmSync(path.join(base(), saveFile), { force: true });
});
ipcMain.handle("result", async (_, result) => {
  (await collections()).record({ result });
  result = archive().result(result);
  const history = read("history.json", []);
  if (!history.some((r) => r.runId === result.runId)) {
    history.push(result);
    write("history.json", history);
  }
  if (result.tutorial)
    write(
      "tutorial-stats.json",
      recordTutorial(
        read("tutorial-stats.json", {}),
        result,
        "complete",
        result.runId,
      ),
    );
  fs.rmSync(
    path.join(base(), result.tutorial ? "tutorial-save.json" : "save.json"),
    { force: true },
  );
});
ipcMain.handle("settings", (_, settings) => {
  write("settings.json", settings);
  win.setFullScreen(!!settings.fullscreen);
  if (!settings.fullscreen) win.setContentSize(...windowSize(settings.width));
});
ipcMain.handle("quit", () => app.quit());
app.on("window-all-closed", () => app.quit());
