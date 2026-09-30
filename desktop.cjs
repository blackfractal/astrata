const { app, BrowserWindow, ipcMain, screen } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { createArchive } = require("./run-archive.cjs");
let win, runArchive;
function archive() {
  return (runArchive ||= createArchive(base(), {
    packageVersion: require("./package.json").version,
    sources: Object.fromEntries(
      ["engine.mjs", "content.mjs", "policy.mjs", "death.mjs"].map((name) => [
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
ipcMain.handle("load", () => {
  archive().importHistory(read("history.json", []));
  return {
    save: read("save.json", null),
    settings: read("settings.json", {}),
    history: read("history.json", []),
  };
});
ipcMain.handle("record", (_, event) => archive().record(event));
ipcMain.handle("save", (_, state) => {
  const previous = read("save.json", null);
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
  if (state) write("save.json", state);
  else fs.rmSync(path.join(base(), "save.json"), { force: true });
});
ipcMain.handle("result", (_, result) => {
  result = archive().result(result);
  const history = read("history.json", []);
  if (!history.some((r) => r.runId === result.runId)) {
    history.push(result);
    write("history.json", history);
  }
  fs.rmSync(path.join(base(), "save.json"), { force: true });
});
ipcMain.handle("settings", (_, settings) => {
  write("settings.json", settings);
  win.setFullScreen(!!settings.fullscreen);
  if (!settings.fullscreen) win.setContentSize(...windowSize(settings.width));
});
ipcMain.handle("quit", () => app.quit());
app.on("window-all-closed", () => app.quit());
