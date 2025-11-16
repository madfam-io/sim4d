import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // CLI should run in Node.js environment
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
