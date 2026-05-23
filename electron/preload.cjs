/**
 * preload.cjs - 预加载脚本
 * 只暴露通用 invoke 方法
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
});
