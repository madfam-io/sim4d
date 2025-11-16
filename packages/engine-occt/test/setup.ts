// Test setup for engine-occt
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Mock WASM module for tests
global.WebAssembly = global.WebAssembly || {};

beforeAll(() => {
  console.log('Setting up engine-occt tests...');
});

afterAll(() => {
  console.log('Cleaning up engine-occt tests...');
});

beforeEach(() => {
  // Clear any mocks before each test
});

afterEach(() => {
  // Clean up after each test
});
