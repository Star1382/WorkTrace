const { Notification } = require('electron');
const { ACTIVE_STATUSES } = require('../../shared/domain.cjs');

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

function getDueReminderTasks(db) {
  const now = new Date();
  return db
    .prepare(
      `
    SELECT id, title, description, quadrant, status, due_date, remind_at, created_at, updated_at, completed_at
    FROM tasks
    WHERE remind_at IS NOT NULL
      AND remind_at != ''
      AND status IN (${ACTIVE_STATUSES.map(() => '?').join(', ')})
    ORDER BY remind_at ASC
  `
    )
    .all(...ACTIVE_STATUSES)
    .filter((task) => {
      const remindAt = parseReminderTime(task.remind_at);
      return remindAt && remindAt <= now;
    });
}

function formatSqlDateTime(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:00`,
  ].join(' ');
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

  // 导出供测试使用（纯函数，无副作用）
  parseReminderTime,
  getDueReminderTasks,

  registerHandlers(ipcMain, db, context = {}) {
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
        silent: false,
      });
      notification.on('click', () => focusTask(context, task));
      notification.show();
    };

    const checkAndNotify = () => {
      try {
        getDueReminderTasks(db).forEach(showNotification);
      } catch (error) {
        console.error('[Reminder] check failed:', error);
      }
    };

    ipcMain.handle('reminder:check', async () => {
      try {
        return { success: true, data: getDueReminderTasks(db) };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('reminder:setSnooze', async (event, taskId, minutes = 10) => {
      try {
        const delayMinutes = Number.isFinite(Number(minutes)) ? Number(minutes) : 10;
        const nextReminder = new Date(Date.now() + delayMinutes * 60 * 1000);
        db.prepare(
          `
          UPDATE tasks
          SET remind_at = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
        ).run(formatSqlDateTime(nextReminder), taskId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    setTimeout(checkAndNotify, START_DELAY_MS);
    setInterval(checkAndNotify, CHECK_INTERVAL_MS);
    setInterval(cleanupOldKeys, KEY_CLEANUP_INTERVAL_MS);
  },
};
