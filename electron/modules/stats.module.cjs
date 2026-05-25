/**
 * Stats 模块 - 统计数据
 */
const { getWeekRange } = require('../../shared/date.cjs');
const { createTaskRepository } = require('../repositories/task.repository.cjs');

module.exports = {
  name: 'stats',

  init() {
    // 统计模块只读取 task repository，不需要建表。
  },

  registerHandlers(ipcMain, db) {
    const tasks = createTaskRepository(db);

    ipcMain.handle('stats:getQuadrant', async () => {
      try {
        return { success: true, data: tasks.countOpenByQuadrant() };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('stats:getWeek', async () => {
      try {
        const range = getWeekRange(new Date());
        return { success: true, data: tasks.countByRange(range.startValue, range.endValue) };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  },
};
