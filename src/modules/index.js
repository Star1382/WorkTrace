const moduleFiles = import.meta.glob('./*.module.jsx', { eager: true });

function isFeatureModule(value) {
  return value
    && typeof value === 'object'
    && typeof value.key === 'string'
    && typeof value.label === 'string'
    && typeof value.render === 'function';
}

export const featureModules = Object.values(moduleFiles)
  .flatMap((moduleExports) => Object.values(moduleExports).filter(isFeatureModule))
  .sort((a, b) => (a.order || 0) - (b.order || 0));

export const defaultModuleKey = featureModules[0]?.key || 'today';
