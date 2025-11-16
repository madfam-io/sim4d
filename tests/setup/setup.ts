import path from 'node:path';
import { vi } from 'vitest';

// Setup global test environment
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock WebGL context for viewport tests when running in browser-like environments
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
    if (contextType === 'webgl2' || contextType === 'webgl') {
      return {
        getExtension: vi.fn(),
        getParameter: vi.fn(),
        createShader: vi.fn(),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        attachShader: vi.fn(),
        createProgram: vi.fn(),
        linkProgram: vi.fn(),
        useProgram: vi.fn(),
        getProgramParameter: vi.fn(() => true),
        getShaderParameter: vi.fn(() => true),
        enable: vi.fn(),
        disable: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
        viewport: vi.fn(),
        drawArrays: vi.fn(),
        drawElements: vi.fn(),
      };
    }
    return null;
  }) as any;
}

// Mock Worker for WASM tests
global.Worker = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  onmessage: vi.fn(),
  terminate: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;

// Mock SharedArrayBuffer for WASM threading
global.SharedArrayBuffer = ArrayBuffer as any;

// Mock performance API
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
};

// Set test timeout
vi.setConfig({
  testTimeout: 10000, // 10 seconds
});
// Ensure OCCT assets resolve during tests
process.env.OCCT_WASM_PATH =
  process.env.OCCT_WASM_PATH || path.resolve(process.cwd(), 'packages/engine-occt/wasm');

// Stub fetch to acknowledge OCCT asset checks during unit tests
if (typeof global.fetch === 'undefined') {
  global.fetch = vi.fn();
}

const originalFetch = global.fetch as any;
global.fetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : (input as Request).url;
  if (/occt.*\.(wasm|js)$/i.test(url)) {
    return {
      ok: true,
      status: 200,
      headers: typeof Headers !== 'undefined' ? new Headers() : ({} as any),
      text: async () => '',
      json: async () => ({}),
      arrayBuffer: async () => new ArrayBuffer(0),
    } as Response;
  }
  if (typeof originalFetch === 'function') {
    return originalFetch(input, init);
  }
  return {
    ok: true,
    status: 200,
    headers: typeof Headers !== 'undefined' ? new Headers() : ({} as any),
    text: async () => '',
    json: async () => ({}),
    arrayBuffer: async () => new ArrayBuffer(0),
  } as Response;
});
