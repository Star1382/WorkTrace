/**
 * Stats 模块 - 统计数据
 */
module.exports = {
  name: 'stats',
  
  init(db) {
    // 统计模块只读取 tasks 表，不需要建表
  },
  
  registerHandlers(ipcMain, db) {
    ipcMain.handle('stats:getQuadrant', async () => {
      try {
        const tasks = db.prepare(`
          SELECT quadrant, COUNT(*) as count 
          FROM tasks 
          WHERE status != 'done' AND quadrant BETWEEN 1 AND 4
          GROUP BY quadrant
        `).all();
        
        const result = { 1: 0, 2: 0, 3: 0, 4: 0 };
        tasks.forEach(t => {
          if (t.quadrant >= 1 && t.quadrant <= 4) {
            result[t.quadrant] = t.count;
          }
        });
        
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    ipcMain.handle('stats:getWeek', async () => {
      try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const formatDate = d => d.toISOString().split('T')[0];
        
        const totalResult = db.prepare(`
          SELECT COUNT(*) as count 
          FROM tasks 
          WHERE due_date BETWEEN ? AND ?
        `).get(formatDate(startOfWeek), formatDate(endOfWeek));
        
        const doneResult = db.prepare(`
          SELECT COUNT(*) as count 
          FROM tasks 
          WHERE due_date BETWEEN ? AND ? AND status = 'done'
        `).get(formatDate(startOfWeek), formatDate(endOfWeek));
        
        return {
          success: true,
          data: {
            total: totalResult.count,
            done: doneResult.count
          }
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }
};
