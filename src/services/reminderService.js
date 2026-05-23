export const reminderService = {
  check: () => window.electronAPI.reminder.check(),
  setSnooze: (taskId, minutes) => window.electronAPI.reminder.setSnooze(taskId, minutes)
};
