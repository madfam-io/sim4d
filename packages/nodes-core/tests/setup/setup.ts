/**
 * Test setup for nodes-core package
 * Configures test environment for node registry and geometry node tests
 */

import { vi } from 'vitest';

// Mock performance if not available
if (typeof global.performance === 'undefined') {
  global.performance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  } as any;
}

// Mock crypto.randomUUID if not available
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
    getRandomValues: vi.fn((arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  } as any;
}

// Mock WebWorker for geometry processing
global.Worker = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  terminate: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock SharedArrayBuffer for WASM tests
if (typeof global.SharedArrayBuffer === 'undefined') {
  global.SharedArrayBuffer = ArrayBuffer;
}

export {};
