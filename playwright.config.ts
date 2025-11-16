import { defineConfig, devices } from '@playwright/test';

/**
 * BrepFlow Studio Playwright Configuration
 * Optimized for CAD application testing with WebGL and Three.js
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Extra retries for WebGL flakiness
  workers: process.env.CI ? 2 : undefined,
  timeout: 60000, // CAD operations can be slow
  expect: {
    timeout: 15000, // Allow time for geometry rendering
    toHaveScreenshot: {
      threshold: 0.15, // Allow 15% difference for Three.js rendering variations
      animations: 'disabled',
    },
  },
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1920, height: 1080 }, // Consistent CAD workspace
    // Enable WebGL and required features for BrepFlow
    launchOptions: {
      args: [
        '--enable-webgl',
        '--enable-accelerated-2d-canvas',
        '--enable-shared-array-buffer',
        '--enable-unsafe-webgpu', // For future WebGPU support
        '--disable-web-security', // For WASM SharedArrayBuffer
        '--enable-features=SharedArrayBuffer',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // WebKit disabled due to limited WASM SharedArrayBuffer support
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Mobile testing - disabled for CAD application
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    */
  ],
  // Start dev server before running tests
  // TEMPORARILY DISABLED: Server already running
  // webServer: {
  //   command: 'pnpm --filter @brepflow/studio run dev',
  //   url: 'http://127.0.0.1:5173',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
  // Global setup and teardown
  // TEMPORARILY DISABLED for debugging
  // globalSetup: './tests/setup/global-setup.ts',
  // globalTeardown: './tests/setup/global-teardown.ts',
});
