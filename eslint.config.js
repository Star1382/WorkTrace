import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        navigator: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        Buffer: 'readonly',
      }
    },
    settings: {
      react: {
        version: '18'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react/prop-types': 'off'
    }
  },
  {
    // 忽略 node_modules / dist / release
    ignores: ['node_modules/**', 'dist/**', 'release/**']
  }
];
