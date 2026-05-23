/**
 * preload.cjs - 白名单能力接口
 */
const { contextBridge, ipcRenderer } = require('electron');

function on(channel, callback) {
  const listener = (event, ...args) => callback(...args);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('electronAPI', {
  task: {
    getByDate: (date) => ipcRenderer.invoke('task:getByDate', date),
    getByWeek: (params = {}) => ipcRenderer.invoke('task:getByWeek', params),
    getByMonth: (params = {}) => ipcRenderer.invoke('task:getByMonth', params),
    getByQuadrant: (params = {}) => ipcRenderer.invoke('task:getByQuadrant', params),
    add: (task) => ipcRenderer.invoke('task:add', task),
    quickAdd: (params) => ipcRenderer.invoke('task:quickAdd', params),
    update: (task) => ipcRenderer.invoke('task:update', task),
    toggleStatus: (id, status) => ipcRenderer.invoke('task:toggleStatus', id, status),
    delete: (id) => ipcRenderer.invoke('task:delete', id)
  },
  stats: {
    getQuadrant: () => ipcRenderer.invoke('stats:getQuadrant'),
    getWeek: () => ipcRenderer.invoke('stats:getWeek')
  },
  report: {
    weekly: (date) => ipcRenderer.invoke('report:weekly', { date }),
    monthly: (date) => ipcRenderer.invoke('report:monthly', { date }),
    exportText: (type, date) => ipcRenderer.invoke('report:exportText', { type, date }),
    copyToClipboard: (text) => ipcRenderer.invoke('report:copyToClipboard', { text }),
    saveToFile: (text, filename) => ipcRenderer.invoke('report:saveToFile', { text, filename })
  },
  reminder: {
    check: () => ipcRenderer.invoke('reminder:check'),
    setSnooze: (taskId, minutes) => ipcRenderer.invoke('reminder:setSnooze', taskId, minutes),
    onFocusTask: (callback) => on('reminder:focusTask', callback)
  }
});
