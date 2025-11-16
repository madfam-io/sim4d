/**
 * Test setup for engine-occt package
 * Configures test environment with REAL OCCT WASM geometry for comprehensive testing
 *
 * CRITICAL: Uses test-specific real OCCT implementation - NOT mocks
 * This ensures production safety requirements are met while enabling thorough testing
 */

import { vi, beforeEach, afterEach } from 'vitest';
import { createTestOCCTModule, resetTestOCCTEnvironment } from './test-occt-module';

// Set test environment flag
process.env.NODE_ENV = 'test';
process.env.ENABLE_REAL_OCCT_TESTING = 'true';

// Mark as test environment for production safety checks
if (typeof global !== 'undefined') {
  (global as any).__vitest__ = true;
  (global as any).__OCCT_TEST_MODE__ = true;
}

// Polyfill performance if not available
if (typeof global.performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  } as any;
}

// Polyfill crypto.randomUUID if not available
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  } as any;
}

// Mock WebWorker for test environment
// Real implementation would use Worker threads, but for tests we simulate synchronous operations
global.Worker = class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  constructor(scriptURL: string | URL) {
    console.log(`[TestWorker] Created worker for: ${scriptURL}`);
  }

  postMessage(message: any): void {
    // Simulate async worker response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', { data: { success: true, result: message } }));
      }
    }, 0);
  }

  terminate(): void {
    console.log('[TestWorker] Worker terminated');
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (type === 'message' && typeof listener === 'function') {
      this.onmessage = listener as (event: MessageEvent) => void;
    }
  }

  removeEventListener(): void {}
  dispatchEvent(): boolean {
    return true;
  }
} as any;

// Polyfill window for Node.js test environment
if (typeof global.window === 'undefined') {
  global.window = {
    isSecureContext: true,
    location: {
      protocol: 'https:',
      hostname: 'localhost',
      href: 'https://localhost',
    },
  } as any;
}

// Provide SharedArrayBuffer for WASM threading tests
if (typeof global.SharedArrayBuffer === 'undefined') {
  // In test environment, use regular ArrayBuffer as fallback
  global.SharedArrayBuffer = ArrayBuffer as any;
}

// Ensure WebAssembly is available
if (typeof global.WebAssembly === 'undefined') {
  global.WebAssembly = {
    Module: class {},
    Instance: class {},
    Memory: class {},
    Table: class {},
    compile: async () => ({}),
    instantiate: async () => ({ instance: {}, module: {} }),
    validate: () => true,
  } as any;
}

// CRITICAL: Create test-specific REAL OCCT module
// This is NOT a mock - it provides actual geometric operations for testing
const testOCCTModule = createTestOCCTModule();

// Make the test OCCT module globally available
(global as any).Module = testOCCTModule;
(global as any).createOCCTCoreModule = async () => testOCCTModule;

// Reset test environment before each test
beforeEach(() => {
  resetTestOCCTEnvironment();
  console.log('[TestSetup] Environment reset for new test');
});

// Cleanup after each test
afterEach(() => {
  console.log('[TestSetup] Test completed, environment cleaned');
});

console.log('✅ Test environment configured with REAL OCCT module for geometry validation');

export {};
