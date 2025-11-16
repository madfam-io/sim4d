/**
 * Test setup for constraint-solver package
 * Configures test environment for 2D constraint solving tests
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

// Set up mathematical precision for constraint solving tests
const originalMath = global.Math;
global.Math = {
  ...originalMath,
  // Ensure consistent floating point precision for tests
  abs: (x: number) => (x < 0 ? -x : x),
  sqrt: (x: number) => originalMath.sqrt(x),
  sin: (x: number) => originalMath.sin(x),
  cos: (x: number) => originalMath.cos(x),
  atan2: (y: number, x: number) => originalMath.atan2(y, x),
};

export {};
