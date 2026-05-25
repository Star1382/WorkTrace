import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.cjs'],
    environment: 'node',
    globals: true
  }
});
