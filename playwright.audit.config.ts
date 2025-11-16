import { defineConfig, devices } from '@playwright/test';

const PREVIEW_HOST = process.env.PREVIEW_HOST ?? '127.0.0.1';
const PREVIEW_PORT = process.env.PREVIEW_PORT ?? '5173';
const PREVIEW_URL = `http://${PREVIEW_HOST}:${PREVIEW_PORT}`;

/**
 * BrepFlow Audit Playwright Configuration
 * Specifically optimized for comprehensive functionality and accessibility auditing
 */
export default defineConfig({
  testDir: './tests/audit',
  fullyParallel: false, // Run sequentially for more stable results
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Minimal retries for audit consistency
  workers: 1, // Single worker to avoid interference
  timeout: 180000, // 3 minutes for comprehensive node testing
  expect: {
    timeout: 30000, // Extended timeout for audit operations
    toHaveScreenshot: {
      threshold: 0.2, // More tolerant for accessibility features
      animations: 'disabled',
    },
  },
  reporter: [
    ['html', { outputFolder: 'audit-report' }],
    ['json', { outputFile: 'audit-results.json' }],
    ['junit', { outputFile: 'audit-results.xml' }],
    ['list'],
  ],
  use: {
    baseURL: PREVIEW_URL,
    trace: 'on',
    video: 'on',
    screenshot: 'on',
    viewport: { width: 1920, height: 1080 },
    // Enhanced accessibility and audit features
    launchOptions: {
      args: [
        '--enable-webgl',
        '--enable-accelerated-2d-canvas',
        '--enable-shared-array-buffer',
        '--enable-unsafe-webgpu',
        '--disable-web-security',
        '--enable-features=SharedArrayBuffer',
        // Accessibility-specific flags
        '--force-prefers-reduced-motion',
        '--enable-accessibility-logging',
        '--accessibility-fail-on-warning',
      ],
    },
  },
  projects: [
    {
      name: 'accessibility-audit',
      testDir: './tests/audit/accessibility',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'functionality-audit',
      testDir: './tests/audit/functionality',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'performance-audit',
      testDir: './tests/audit/performance',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'cross-browser-audit',
      testDir: './tests/audit/accessibility',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  // Start dev server before running tests
  webServer: {
    command: `bash scripts/start-studio-preview.sh ${PREVIEW_HOST} ${PREVIEW_PORT}`,
    url: PREVIEW_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 240000,
  },
});
