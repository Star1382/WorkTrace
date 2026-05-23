const fs = require('fs');
const path = require('path');

/**
 * 模块注册器 - 自动扫描并加载所有业务模块
 */
function loadModules() {
  const modules = {};
  const dir = __dirname;
  
  const files = fs.readdirSync(dir).filter(f => {
    return f !== 'index.cjs' && f.endsWith('.module.cjs');
  });
  
  for (const file of files) {
    const mod = require(path.join(dir, file));
    if (mod && mod.name) {
      modules[mod.name] = mod;
      console.log(`[ModuleLoader] Loaded module: ${mod.name}`);
    }
  }
  
  return modules;
}

function initAll(db) {
  const modules = loadModules();
  for (const mod of Object.values(modules)) {
    if (mod.init) {
      console.log(`[ModuleLoader] Initializing module: ${mod.name}`);
      mod.init(db);
    }
  }
  return modules;
}

function registerAll(ipcMain, db, context = {}) {
  const modules = loadModules();
  for (const mod of Object.values(modules)) {
    if (mod.registerHandlers) {
      console.log(`[ModuleLoader] Registering handlers for module: ${mod.name}`);
      mod.registerHandlers(ipcMain, db, context);
    }
  }
}

module.exports = { loadModules, initAll, registerAll };
