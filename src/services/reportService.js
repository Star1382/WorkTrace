import { invoke } from './ipc';

export const reportService = {
  weekly: (date) => invoke('report:weekly', { date }),
  monthly: (date) => invoke('report:monthly', { date }),
  exportText: (type, date) => invoke('report:exportText', { type, date }),
  copyToClipboard: (text) => invoke('report:copyToClipboard', { text }),
  saveToFile: (text, filename) => invoke('report:saveToFile', { text, filename })
};
