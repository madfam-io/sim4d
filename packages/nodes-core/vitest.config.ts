import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./tests/setup/setup.ts'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['tests/**', '**/*.test.{js,ts,jsx,tsx}', '**/*.spec.{js,ts,jsx,tsx}', 'dist/**'],
    },
  },
  resolve: {
    alias: {
      '@brepflow/types': path.resolve(__dirname, '../types/src'),
      '@brepflow/engine-core': path.resolve(__dirname, '../engine-core/src'),
    },
  },
});
