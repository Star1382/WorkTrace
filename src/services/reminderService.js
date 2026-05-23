import { invoke } from './ipc';

export const reminderService = {
  check: () => invoke('reminder:check'),
  setSnooze: (taskId, minutes) => invoke('reminder:setSnooze', taskId, minutes)
};
