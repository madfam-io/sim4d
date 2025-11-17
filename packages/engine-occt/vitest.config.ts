import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Changed from jsdom to node for better WASM support
    cache: false, // Disable caching to force fresh module loading
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
        'test/**',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}',
        'dist/**',
        '**/*.d.ts',
        '**/node_modules/**',
        'wasm/**',
      ],
      all: true,
      lines: 60,
      functions: 70,
      branches: 60,
      statements: 60,
    },
    // Ensure test environment variables are set
    env: {
      NODE_ENV: 'test',
      ENABLE_REAL_OCCT_TESTING: 'true',
    },
  },
});
