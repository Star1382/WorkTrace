/**
 * taskService.js - 任务相关 API
 */
import { invoke } from './ipc';

export const taskService = {
  getByDate: (date) => invoke('task:getByDate', date),
  add: (task) => invoke('task:add', task),
  update: (task) => invoke('task:update', task),
  toggleStatus: (id, status) => invoke('task:toggleStatus', id, status),
  delete: (id) => invoke('task:delete', id)
};
