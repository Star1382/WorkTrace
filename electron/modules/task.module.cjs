/**
 * Task 模块 - 任务 CRUD 操作
 */
const { createTaskRepository } = require('../repositories/task.repository.cjs');
const { parseLocalDate, formatDate, getWeekRange } = require('../../shared/date.cjs');

const WEEKDAY_INDEX = {
  一: 0,
  二: 1,
  三: 2,
  四: 3,
  五: 4,
  六: 5,
  日: 6,
  天: 6,
  '1': 0,
  '2': 1,
  '3': 2,
  '4': 3,
  '5': 4,
  '6': 5,
  '7': 6
};

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}

function stripToken(text, match) {
  return text.replace(match[0], ' ');
}

function parseQuickTaskText(text, now = new Date()) {
  let workingText = String(text || '').trim();
  let dueDate = formatDate(now);
  let quadrant = 0;

  if (!workingText) {
    throw new Error('请输入任务内容');
  }

  if (workingText.includes('[紧急]')) {
    quadrant = 1;
    workingText = workingText.replaceAll('[紧急]', ' ');
  }
  if (workingText.includes('[重要]') && quadrant !== 1) {
    quadrant = 3;
    workingText = workingText.replaceAll('[重要]', ' ');
  } else {
    workingText = workingText.replaceAll('[重要]', ' ');
  }

  const monthDayMatch = workingText.match(/(\d{1,2})月(\d{1,2})日/);
  const weekdayMatch = workingText.match(/(?:本)?(?:周|星期)([一二三四五六日天1-7])/);
  const relativeMatch = workingText.match(/今天|明天|后天/);

  if (monthDayMatch) {
    const month = Number(monthDayMatch[1]);
    const day = Number(monthDayMatch[2]);
    dueDate = formatDate(new Date(now.getFullYear(), month - 1, day));
    workingText = stripToken(workingText, monthDayMatch);
  } else if (weekdayMatch) {
    const weekRange = getWeekRange(now);
    const target = addDays(weekRange.start, WEEKDAY_INDEX[weekdayMatch[1]]);
    dueDate = formatDate(target);
    workingText = stripToken(workingText, weekdayMatch);
  } else if (relativeMatch) {
    const offset = relativeMatch[0] === '今天' ? 0 : relativeMatch[0] === '明天' ? 1 : 2;
    dueDate = formatDate(addDays(now, offset));
    workingText = stripToken(workingText, relativeMatch);
  }

  const title = workingText.replace(/\s+/g, ' ').trim();
  if (!title) {
    throw new Error('请输入任务标题');
  }

  return { title, due_date: dueDate, quadrant };
}

module.exports = {
  name: 'task',

  init(db) {
    createTaskRepository(db).init();
  },

  registerHandlers(ipcMain, db) {
    const tasks = createTaskRepository(db);

    ipcMain.handle('task:getByDate', async (event, date) => {
      try {
        return { success: true, data: tasks.getByDate(date) };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('task:getByWeek', async (event, params = {}) => {
      try {
        const result = tasks.getByWeek(params);
        return { success: true, data: result.tasks, range: result.range };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('task:getByMonth', async (event, params = {}) => {
      try {
        const result = tasks.getByMonth(params);
        return { success: true, data: result.tasks, range: result.range };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('task:getByQuadrant', async (event, params = {}) => {
      try {
        return { success: true, data: tasks.getByQuadrant(params) };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('task:add', async (event, task) => {
      try {
        return { success: true, data: tasks.add(task) };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('task:quickAdd', async (event, params = {}) => {
      try {
        const parsed = parseQuickTaskText(params.text, parseLocalDate(params.defaultDueDate));
        return { success: true, data: { ...tasks.quickAdd(parsed), parsed } };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('task:update', async (event, task) => {
      try {
        tasks.update(task);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('task:toggleStatus', async (event, taskId, newStatus) => {
      try {
        const { TASK_STATUS } = require('../../shared/domain.cjs');
        const completedAt = newStatus === TASK_STATUS.DONE ? new Date().toISOString() : null;
        tasks.toggleStatus(taskId, newStatus, completedAt);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('task:delete', async (event, taskId) => {
      try {
        tasks.delete(taskId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }
};
