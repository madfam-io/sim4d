import { defineConfig } from 'vitest/config';
import path from 'node:path';

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
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'tests/**',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}',
        'dist/**',
        '**/*.d.ts',
        '**/node_modules/**',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    alias: {
      '@sim4d/engine-occt': path.resolve(
        __dirname,
        './tests/setup/__mocks__/engine-occt.mock.ts'
      ),
    },
  },
  resolve: {
    alias: {
      '@sim4d/engine-occt': path.resolve(
        __dirname,
        './tests/setup/__mocks__/engine-occt.mock.ts'
      ),
    },
  },
});
