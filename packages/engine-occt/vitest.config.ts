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
      reporter: ['text', 'json', 'html'],
      exclude: ['tests/**', '**/*.test.{js,ts,jsx,tsx}', '**/*.spec.{js,ts,jsx,tsx}', 'dist/**'],
    },
    // Ensure test environment variables are set
    env: {
      NODE_ENV: 'test',
      ENABLE_REAL_OCCT_TESTING: 'true',
    },
  },
});
