// Test setup for engine-occt
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fetch, { Headers, Request, Response } from 'node-fetch';

// Polyfill fetch for Node.js environment (required for OCCT WASM loading)
if (!globalThis.fetch) {
  globalThis.fetch = fetch as any;
  globalThis.Headers = Headers as any;
  globalThis.Request = Request as any;
  globalThis.Response = Response as any;
}

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
