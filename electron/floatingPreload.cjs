const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('floatingAPI', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  hide: () => ipcRenderer.send('floating:hide'),
  showMain: () => ipcRenderer.send('floating:showMain'),
  togglePin: () => ipcRenderer.invoke('floating:togglePin')
});
