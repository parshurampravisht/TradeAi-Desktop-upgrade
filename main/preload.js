const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Store operations
  getStore: (key) => ipcRenderer.invoke("get-store", key),
  setStore: (key, value) => ipcRenderer.invoke("set-store", key, value),
  deleteStore: (key) => ipcRenderer.invoke("delete-store", key),

  // Memory operations (your old ones)
  readMemory: (key) => ipcRenderer.invoke("readMemory-ipc", key),
  updateMemory: (data) => ipcRenderer.invoke("updateMemory-ipc", data),

  // Logging operation
  registerLog: (log) => ipcRenderer.invoke("register_log", log),

  // Client status operation
  setClientStatusApiRes: (data) => ipcRenderer.invoke("set-clientStatusApiRes", data),

  // Parse operations
  parseClientOrders: (data) => ipcRenderer.invoke("parse-clientOrders-ipc", data),

  store: {
    read: (key) => ipcRenderer.invoke("store-read", key),
    // optionally: write, delete, etc.
  },
});

// Keep old ipc helper if needed elsewhere
contextBridge.exposeInMainWorld("ipc", {
  send(channel, value) {
    ipcRenderer.send(channel, value);
  },
  on(channel, callback) {
    const subscription = (_event, ...args) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
});