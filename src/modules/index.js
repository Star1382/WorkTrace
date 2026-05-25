const moduleFiles = import.meta.glob('./*.module.jsx', { eager: true });

function isFeatureModule(value) {
  return value
    && typeof value === 'object'
    && typeof value.key === 'string'
    && typeof value.label === 'string'
    && typeof value.render === 'function';
}

const rawModules = Object.values(moduleFiles)
  .flatMap((moduleExports) => Object.values(moduleExports).filter(isFeatureModule));

// 检测重复 key —— 低耦合设计要求每个模块 key 唯一
const seenKeys = new Map();
rawModules.forEach((mod) => {
  if (seenKeys.has(mod.key)) {
    const prevFile = seenKeys.get(mod.key);
    const msg = `[modules] 重复的模块 key "${mod.key}" —— 已存在于 ${prevFile}，当前模块被忽略。请修改其中一个 key 值。`;
    console.error(msg);
    throw new Error(msg);
  }
  seenKeys.set(mod.key, mod._sourceFile || '(未知文件)');
});

export const featureModules = rawModules
  .sort((a, b) => (a.order || 0) - (b.order || 0));

export const defaultModuleKey = featureModules[0]?.key || 'today';

export const sidebarWidgets = featureModules
  .flatMap((module) => (module.sidebarWidgets || []).map((widget) => ({ ...widget, moduleKey: module.key })))
  .sort((a, b) => (a.order || 0) - (b.order || 0));
