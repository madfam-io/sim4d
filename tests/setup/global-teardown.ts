import { FullConfig } from '@playwright/test';

/**
 * Global teardown for BrepFlow E2E tests
 * Cleanup and reporting
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting BrepFlow E2E Test Global Teardown...');

  // Clean up any test artifacts
  // Add any cleanup logic here if needed

  console.log('✅ BrepFlow E2E Test Global Teardown complete');
}

export default globalTeardown;
