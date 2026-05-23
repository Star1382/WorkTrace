export const statsService = {
  getQuadrant: () => window.electronAPI.stats.getQuadrant(),
  getWeek: () => window.electronAPI.stats.getWeek()
};
