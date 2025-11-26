import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/setup.ts'],
    testTimeout: 30000, // 30 seconds for complex tests
    hookTimeout: 30000, // 30 seconds for setup/teardown hooks
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage/unit',
      include: [
        'packages/**/src/**/*.{ts,tsx}',
        'apps/**/src/**/*.{ts,tsx}',
        'scripts/**/*.{ts,tsx}',
        'config/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.ts',
        '**/*.d.ts',
        '**/__mocks__/',
        '**/dist/',
        'third_party/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '.idea', '.git', '.cache', '**/wasm/**'],
  },
  resolve: {
    alias: {
      '@sim4d/types': path.resolve(__dirname, './packages/types/src'),
      '@sim4d/engine-core': path.resolve(__dirname, './packages/engine-core/src'),
      '@sim4d/engine-occt': path.resolve(__dirname, './packages/engine-occt/src'),
      '@sim4d/nodes-core': path.resolve(__dirname, './packages/nodes-core/src'),
    },
  },
});
