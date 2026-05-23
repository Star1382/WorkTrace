/**
 * WorkTrace - Electron 主进程
 * 只负责：初始化数据库 → 注册模块 → 创建窗口
 */
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { initDatabase, getDb } = require('./database.cjs');
const { initAll, registerAll } = require('./modules/index.cjs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'WorkTrace'
  });

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  console.log('[WorkTrace] Initializing...');
  
  initDatabase();
  const db = getDb();
  initAll(db);
  registerAll(require('electron').ipcMain, db);
  createWindow();
  
  console.log('[WorkTrace] Started successfully');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
