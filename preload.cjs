const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("desktop", {
  record: (event) => ipcRenderer.invoke("record", event),
  load: () => ipcRenderer.invoke("load"),
  save: (state, options) => ipcRenderer.invoke("save", state, options),
  result: (r) => ipcRenderer.invoke("result", r),
  settings: (s) => ipcRenderer.invoke("settings", s),
  quit: () => ipcRenderer.invoke("quit"),
});
