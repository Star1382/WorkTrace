/**
 * 备份模块 - 数据库导出/导入
 * 低耦合：只通过 IPC 暴露能力，不依赖其他模块
 */
const { dialog } = require('electron');
const fs = require('fs');

function getDbPath(db) {
  return db.name;
}

function exportBackup(db) {
  return new Promise((resolve) => {
    const defaultName = `WorkTrace_备份_${formatTimestamp()}.db`;
    dialog
      .showSaveDialog({
        title: '导出数据库备份',
        defaultPath: defaultName,
        filters: [{ name: 'SQLite 数据库', extensions: ['db'] }],
      })
      .then(({ canceled, filePath }) => {
        if (canceled || !filePath) {
          return resolve({ success: false, error: '取消导出' });
        }
        try {
          const srcPath = getDbPath(db);
          fs.copyFileSync(srcPath, filePath);
          resolve({ success: true, data: { path: filePath } });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
  });
}

function importBackup(db) {
  return new Promise((resolve) => {
    dialog
      .showOpenDialog({
        title: '导入数据库备份',
        filters: [{ name: 'SQLite 数据库', extensions: ['db'] }],
        properties: ['openFile'],
      })
      .then(({ canceled, filePaths }) => {
        if (canceled || !filePaths.length) {
          return resolve({ success: false, error: '取消导入' });
        }
        const srcPath = filePaths[0];

        // 验证是有效的 SQLite 文件
        try {
          const header = Buffer.alloc(16);
          const fd = fs.openSync(srcPath, 'r');
          fs.readSync(fd, header, 0, 16, 0);
          fs.closeSync(fd);
          if (header.toString('utf8', 0, 5) !== 'SQLit') {
            return resolve({ success: false, error: '不是有效的 SQLite 数据库文件' });
          }
        } catch (error) {
          return resolve({ success: false, error: '无法读取文件：' + error.message });
        }

        try {
          const destPath = getDbPath(db);
          db.close();
          fs.copyFileSync(srcPath, destPath);
          resolve({ success: true, data: { path: destPath, needRestart: true } });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
  });
}

function exportJSON(db) {
  return new Promise((resolve) => {
    const defaultName = `WorkTrace_任务列表_${formatTimestamp()}.json`;
    dialog
      .showSaveDialog({
        title: '导出任务列表 JSON',
        defaultPath: defaultName,
        filters: [{ name: 'JSON 文件', extensions: ['json'] }],
      })
      .then(({ canceled, filePath }) => {
        if (canceled || !filePath) {
          return resolve({ success: false, error: '取消导出' });
        }
        try {
          const rows = db
            .prepare(
              'SELECT id, title, description, quadrant, status, due_date, remind_at, created_at, updated_at, completed_at FROM tasks ORDER BY created_at ASC'
            )
            .all();
          fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf-8');
          resolve({ success: true, data: { path: filePath, count: rows.length } });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
  });
}

function formatTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

module.exports = {
  name: 'backup',

  registerHandlers(ipcMain, db, _context = {}) {
    ipcMain.handle('backup:export', async () => {
      return exportBackup(db);
    });

    ipcMain.handle('backup:import', async () => {
      return importBackup(db);
    });

    ipcMain.handle('backup:exportJSON', async () => {
      return exportJSON(db);
    });
  },
};
