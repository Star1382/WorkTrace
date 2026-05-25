const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let floatingWindow = null;
let getMainWindow = null;

function getFloatingBounds(width = 320, height = 360) {
  const display = screen.getPrimaryDisplay();
  const { x, y, width: workWidth } = display.workArea;
  return {
    x: Math.round(x + workWidth - width - 20),
    y: Math.round(y + 60),
    width,
    height
  };
}

function clampHeight(height) {
  return Math.min(600, Math.max(200, Number(height) || 360));
}

function resizeFloatingWindowToContent() {
  if (!floatingWindow || floatingWindow.isDestroyed()) {
    return false;
  }

  return floatingWindow.webContents
    .executeJavaScript('Math.ceil(document.documentElement.scrollHeight || document.body.scrollHeight || 360)', true)
    .then((contentHeight) => {
      if (!floatingWindow || floatingWindow.isDestroyed()) {
        return false;
      }
      const bounds = floatingWindow.getBounds();
      floatingWindow.setBounds({ ...bounds, height: clampHeight(contentHeight) });
      return true;
    })
    .catch(() => false);
}

function createFloatingWindow(getMainWindowCallback) {
  getMainWindow = getMainWindowCallback;

  if (floatingWindow && !floatingWindow.isDestroyed()) {
    return floatingWindow;
  }

  floatingWindow = new BrowserWindow({
    ...getFloatingBounds(),
    minHeight: 200,
    maxHeight: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'floatingPreload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  floatingWindow.on('close', (event) => {
    if (app.isQuitting) {
      return;
    }
    event.preventDefault();
    floatingWindow.hide();
  });

  floatingWindow.webContents.on('did-finish-load', resizeFloatingWindowToContent);

  if (process.env.NODE_ENV !== 'production') {
    floatingWindow.loadURL('http://localhost:5173/floating/');
  } else {
    floatingWindow.loadFile(path.join(__dirname, '../dist/floating/index.html'));
  }

  return floatingWindow;
}

function showFloatingWindow() {
  if (!floatingWindow || floatingWindow.isDestroyed()) {
    return;
  }
  floatingWindow.setBounds(getFloatingBounds(320, floatingWindow.getBounds().height));
  floatingWindow.show();
}

function hideFloatingWindow() {
  if (!floatingWindow || floatingWindow.isDestroyed()) {
    return;
  }
  floatingWindow.hide();
}

function toggleFloatingWindow() {
  if (!floatingWindow || floatingWindow.isDestroyed()) {
    return false;
  }
  if (floatingWindow.isVisible()) {
    floatingWindow.hide();
    return false;
  }
  showFloatingWindow();
  return true;
}

function showMainWindow() {
  const mainWindow = typeof getMainWindow === 'function' ? getMainWindow() : null;
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  mainWindow.show();
  mainWindow.focus();
}

function toggleAlwaysOnTop() {
  if (!floatingWindow || floatingWindow.isDestroyed()) {
    return false;
  }
  const nextState = !floatingWindow.isAlwaysOnTop();
  floatingWindow.setAlwaysOnTop(nextState);
  return nextState;
}

module.exports = {
  createFloatingWindow,
  showFloatingWindow,
  hideFloatingWindow,
  toggleFloatingWindow,
  showMainWindow,
  toggleAlwaysOnTop,
  resizeFloatingWindowToContent
};
