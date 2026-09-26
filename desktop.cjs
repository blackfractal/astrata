const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
let win;
const base = () => app.getPath("userData");
const read = (name, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(base(), name), "utf8"));
  } catch {
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
    height: 900,
    fullscreen: false,
    music: 50,
    effects: 50,
  });
  win = new BrowserWindow({
    width: settings.width,
    height: settings.height,
    minWidth: 1100,
    minHeight: 720,
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
ipcMain.handle("load", () => ({
  save: read("save.json", null),
  settings: read("settings.json", {}),
  history: read("history.json", []),
}));
ipcMain.handle("save", (_, state) => {
  if (state) write("save.json", state);
  else fs.rmSync(path.join(base(), "save.json"), { force: true });
});
ipcMain.handle("result", (_, result) => {
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
  if (!settings.fullscreen) win.setSize(settings.width, settings.height);
});
ipcMain.handle("quit", () => app.quit());
app.on("window-all-closed", () => app.quit());
