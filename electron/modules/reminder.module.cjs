const { Notification } = require('electron');
const { formatDateTime } = require('../../shared/date.cjs');
const { createTaskRepository } = require('../repositories/task.repository.cjs');

const CHECK_INTERVAL_MS = 60 * 1000;
const START_DELAY_MS = 5 * 1000;
const MAX_NOTIFIED_KEYS = 1000;
const KEY_CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

function parseReminderTime(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDueReminderTasks(taskRepository) {
  const now = new Date();
  return taskRepository.getDueReminderCandidates().filter((task) => {
    const remindAt = parseReminderTime(task.remind_at);
    return remindAt && remindAt <= now;
  });
}

function focusTask(context, task) {
  const mainWindow = context.getMainWindow?.();
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.send('reminder:focusTask', task);
}

module.exports = {
  name: 'reminder',

  registerHandlers(ipcMain, db, context = {}) {
    const tasks = createTaskRepository(db);
    const notifiedKeys = new Map();
    
    const cleanupOldKeys = () => {
      if (notifiedKeys.size > MAX_NOTIFIED_KEYS) {
        const entries = Array.from(notifiedKeys.entries());
        const toRemove = entries.slice(0, entries.length - MAX_NOTIFIED_KEYS);
        toRemove.forEach(([key]) => notifiedKeys.delete(key));
      }
    };

    const showNotification = (task) => {
      const key = `${task.id}:${task.remind_at}`;
      if (notifiedKeys.has(key)) {
        return;
      }
      notifiedKeys.set(key, Date.now());
      cleanupOldKeys();

      if (!Notification.isSupported()) {
        focusTask(context, task);
        return;
      }

      const notification = new Notification({
        title: 'WorkTrace 任务提醒',
        body: task.title,
        silent: false
      });
      notification.on('click', () => focusTask(context, task));
      notification.show();
    };

    const checkAndNotify = () => {
      try {
        getDueReminderTasks(tasks).forEach(showNotification);
      } catch (error) {
        console.error('[Reminder] check failed:', error);
      }
    };

    ipcMain.handle('reminder:check', async () => {
      try {
        return { success: true, data: getDueReminderTasks(tasks) };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('reminder:setSnooze', async (event, taskId, minutes = 10) => {
      try {
        const delayMinutes = Number.isFinite(Number(minutes)) ? Number(minutes) : 10;
        const nextReminder = new Date(Date.now() + delayMinutes * 60 * 1000);
        tasks.setReminder(taskId, formatDateTime(nextReminder));
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    setTimeout(checkAndNotify, START_DELAY_MS);
    setInterval(checkAndNotify, CHECK_INTERVAL_MS);
    setInterval(cleanupOldKeys, KEY_CLEANUP_INTERVAL_MS);
  }
};
