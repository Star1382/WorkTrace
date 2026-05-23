/**
 * Task 模块 - 任务 CRUD 操作
 */
module.exports = {
  name: 'task',
  
  init(db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        quadrant INTEGER DEFAULT 0,
        status TEXT DEFAULT 'todo',
        due_date DATE,
        remind_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )
    `);
  },
  
  registerHandlers(ipcMain, db) {
    ipcMain.handle('task:getByDate', async (event, date) => {
      try {
        const tasks = db.prepare(
          'SELECT * FROM tasks WHERE due_date = ? ORDER BY created_at ASC'
        ).all(date);
        return { success: true, data: tasks };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('task:getByQuadrant', async (event, params = {}) => {
      try {
        const excludeDone = params.excludeDone !== false;
        const tasks = excludeDone
          ? db.prepare(`
              SELECT * FROM tasks
              WHERE status != 'done'
              ORDER BY quadrant ASC, due_date ASC, created_at ASC
            `).all()
          : db.prepare(`
              SELECT * FROM tasks
              ORDER BY quadrant ASC, due_date ASC, created_at ASC
            `).all();

        return { success: true, data: tasks };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    ipcMain.handle('task:add', async (event, task) => {
      try {
        const stmt = db.prepare(`
          INSERT INTO tasks (title, description, quadrant, status, due_date, remind_at) 
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
          task.title,
          task.description || '',
          task.quadrant || 0,
          task.status || 'todo',
          task.due_date,
          task.remind_at || null
        );
        return { success: true, data: { id: result.lastInsertRowid } };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    ipcMain.handle('task:update', async (event, task) => {
      try {
        const stmt = db.prepare(`
          UPDATE tasks 
          SET title = ?, description = ?, quadrant = ?, status = ?, due_date = ?, remind_at = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `);
        stmt.run(
          task.title,
          task.description || '',
          task.quadrant,
          task.status,
          task.due_date || null,
          task.remind_at || null,
          task.id
        );
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    ipcMain.handle('task:toggleStatus', async (event, taskId, newStatus) => {
      try {
        if (newStatus === 'done') {
          db.prepare(`
            UPDATE tasks 
            SET status = ?, completed_at = datetime('now'), updated_at = datetime('now') 
            WHERE id = ?
          `).run(newStatus, taskId);
        } else {
          db.prepare(`
            UPDATE tasks 
            SET status = ?, completed_at = NULL, updated_at = datetime('now') 
            WHERE id = ?
          `).run(newStatus, taskId);
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    ipcMain.handle('task:delete', async (event, taskId) => {
      try {
        db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }
};
