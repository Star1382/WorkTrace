export const taskService = {
  getByDate: (date) => window.electronAPI.task.getByDate(date),
  getByWeek: (params = {}) => window.electronAPI.task.getByWeek(params),
  getByMonth: (params = {}) => window.electronAPI.task.getByMonth(params),
  getByQuadrant: (params = {}) => window.electronAPI.task.getByQuadrant(params),
  add: (task) => window.electronAPI.task.add(task),
  quickAdd: (text, defaultDueDate) => window.electronAPI.task.quickAdd({ text, defaultDueDate }),
  update: (task) => window.electronAPI.task.update(task),
  toggleStatus: (id, status) => window.electronAPI.task.toggleStatus(id, status),
  delete: (id) => window.electronAPI.task.delete(id)
};
