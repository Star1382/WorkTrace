/**
 * ipc.js - 通用 IPC 封装
 */
export async function invoke(channel, ...args) {
  return window.electronAPI.invoke(channel, ...args);
}
