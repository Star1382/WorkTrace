const { contextBridge, ipcRenderer } = require('electron');

const INVOKE_WHITELIST = new Set([
  'task:getByDate',
  'task:toggleStatus',
  'task:quickAdd',
  'stats:getWeek',
  'floating:resizeToContent',
]);

contextBridge.exposeInMainWorld('floatingAPI', {
  invoke: (channel, ...args) => {
    if (!INVOKE_WHITELIST.has(channel)) {
      throw new Error(`floating window: channel "${channel}" is not allowed`);
    }
    return ipcRenderer.invoke(channel, ...args);
  },
  hide: () => ipcRenderer.send('floating:hide'),
  showMain: () => ipcRenderer.send('floating:showMain'),
  togglePin: () => ipcRenderer.invoke('floating:togglePin'),
});
