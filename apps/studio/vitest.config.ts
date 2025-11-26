import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.spec.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/tests/**',
        '!src/**/*.stories.{ts,tsx}',
        '!src/main.tsx',
        '!src/vite-env.d.ts',
      ],
      exclude: [
        'node_modules',
        'dist',
        '.turbo',
        'coverage',
        '**/*.config.*',
        '**/mockData',
        '**/__mocks__',
      ],
      thresholds: {
        // NOTE: Temporary thresholds (60%/55%/45%/60%) - target 80%+ after instrumentation improvements.
        lines: 60,
        functions: 55,
        branches: 45,
        statements: 60,
      },
    },
    css: true,
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.turbo'],
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@sim4d/engine-core': resolve(__dirname, '../../packages/engine-core/src'),
      '@sim4d/engine-occt': resolve(__dirname, '../../packages/engine-occt/src'),
      '@sim4d/nodes-core': resolve(__dirname, '../../packages/nodes-core/src'),
      '@sim4d/types': resolve(__dirname, '../../packages/types/src'),
      '@sim4d/viewport': resolve(__dirname, '../../packages/viewport/src'),
    },
  },
});
