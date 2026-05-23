export const reportService = {
  weekly: (date) => window.electronAPI.report.weekly(date),
  monthly: (date) => window.electronAPI.report.monthly(date),
  exportText: (type, date) => window.electronAPI.report.exportText(type, date),
  copyToClipboard: (text) => window.electronAPI.report.copyToClipboard(text),
  saveToFile: (text, filename) => window.electronAPI.report.saveToFile(text, filename)
};
