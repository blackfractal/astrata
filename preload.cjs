const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("desktop", {
  load: () => ipcRenderer.invoke("load"),
  save: (state) => ipcRenderer.invoke("save", state),
  result: (r) => ipcRenderer.invoke("result", r),
  settings: (s) => ipcRenderer.invoke("settings", s),
  quit: () => ipcRenderer.invoke("quit"),
});
