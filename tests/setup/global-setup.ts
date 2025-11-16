import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for BrepFlow E2E tests
 * Prepares browser environment and validates app readiness
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting BrepFlow E2E Test Global Setup...');

  // Start a browser to pre-warm the application
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the app and wait for basic readiness
    console.log('📱 Pre-warming BrepFlow Studio application...');
    await page.goto('http://localhost:5173');

    // Wait for the app to be ready - use actual BrepFlow Studio selectors
    await page.waitForSelector(
      'h1:has-text("Welcome to BrepFlow Studio!"), h2:has-text("What\'s your experience"), #root:not(:empty)',
      {
        timeout: 30000,
      }
    );

    // Verify WebGL context is available
    const webglSupport = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    });

    if (!webglSupport) {
      console.warn('⚠️ WebGL not available - 3D viewport tests may fail');
    } else {
      console.log('✅ WebGL support confirmed');
    }

    // Check if WASM is supported
    const wasmSupport = await page.evaluate(() => {
      return typeof WebAssembly === 'object';
    });

    if (!wasmSupport) {
      console.warn('⚠️ WebAssembly not supported - geometry tests may fail');
    } else {
      console.log('✅ WebAssembly support confirmed');
    }

    console.log('✅ BrepFlow Studio pre-warming complete');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
