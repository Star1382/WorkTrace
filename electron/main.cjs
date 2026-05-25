/**
 * WorkTrace - Electron 主进程
 * 只负责：初始化数据库 → 注册模块 → 创建窗口
 */
const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  globalShortcut,
  ipcMain,
  nativeImage,
} = require('electron');
const path = require('path');
const { initDatabase, getDb } = require('./database.cjs');
const { initAll, registerAll } = require('./modules/index.cjs');
const {
  createFloatingWindow,
  showFloatingWindow,
  hideFloatingWindow,
  toggleFloatingWindow,
  showMainWindow,
  toggleAlwaysOnTop,
  resizeFloatingWindowToContent,
} = require('./floatingWindow.cjs');

let mainWindow;
let tray;

const TRAY_ICON_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANklEQVR4nGP8z8Dwn4ECwESJ5lEDRg0YNWDUGGxgYmJigAqG////MzAwMIQBGRgYGEYNAwBWUCMP7MAJJwAAAABJRU5ErkJggg==';

function createWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'WorkTrace',
  });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('close', (event) => {
    if (app.isQuitting) {
      return;
    }
    event.preventDefault();
    mainWindow.hide();
  });

  return mainWindow;
}

function createTray() {
  if (tray) {
    return tray;
  }

  const icon = nativeImage.createFromDataURL(TRAY_ICON_DATA_URL);
  tray = new Tray(icon);
  tray.setToolTip('WorkTrace');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => showMainWindow(),
      },
      {
        label: '显示小黄条',
        click: () => showFloatingWindow(),
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ])
  );

  tray.on('double-click', () => showMainWindow());
  return tray;
}

app.whenReady().then(() => {
  console.log('[WorkTrace] Initializing...');

  initDatabase();
  const db = getDb();
  initAll(db);
  registerAll(require('electron').ipcMain, db, {
    getMainWindow: () => mainWindow,
  });
  createWindow();
  createFloatingWindow(() => mainWindow);
  createTray();

  ipcMain.on('floating:hide', () => hideFloatingWindow());
  ipcMain.on('floating:showMain', () => showMainWindow());
  ipcMain.handle('floating:togglePin', () => toggleAlwaysOnTop());
  ipcMain.handle('floating:resizeToContent', () => resizeFloatingWindowToContent());

  globalShortcut.register('CommandOrControl+Shift+W', () => {
    toggleFloatingWindow();
  });

  console.log('[WorkTrace] Started successfully');
});

// window-all-closed 已移除：关闭窗口时只 hide 不 close，该事件永不触发
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    createFloatingWindow(() => mainWindow);
  } else if (mainWindow) {
    showMainWindow();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
