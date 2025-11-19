/**
 * Test setup for viewport package
 * Configures test environment for Three.js and WebGL tests
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
  } as unknown;
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
  } as unknown;
}

// Mock Canvas for Three.js tests
const mockCanvas = {
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    canvas: { width: 800, height: 600 },
  })),
  toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  width: 800,
  height: 600,
};

global.HTMLCanvasElement = vi.fn().mockImplementation(() => mockCanvas) as unknown;

// Mock WebGL context for Three.js
const mockWebGLContext = {
  canvas: mockCanvas,
  drawingBufferWidth: 800,
  drawingBufferHeight: 600,
  getParameter: vi.fn((param) => {
    if (param === 'VERSION') return 'WebGL 2.0';
    if (param === 'SHADING_LANGUAGE_VERSION') return 'WebGL GLSL ES 3.00';
    return null;
  }),
  createShader: vi.fn(() => ({})),
  createProgram: vi.fn(() => ({})),
  compileShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  createBuffer: vi.fn(() => ({})),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  clear: vi.fn(),
  clearColor: vi.fn(),
  viewport: vi.fn(),
  uniform1f: vi.fn(),
  uniform2f: vi.fn(),
  uniform3f: vi.fn(),
  uniform4f: vi.fn(),
  uniformMatrix4fv: vi.fn(),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
};

// Mock window and document for Three.js
global.window = {
  innerWidth: 800,
  innerHeight: 600,
  devicePixelRatio: 1,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  requestAnimationFrame: vi.fn((cb) => setTimeout(cb, 16)),
  cancelAnimationFrame: vi.fn(),
} as unknown;

global.document = {
  createElement: vi.fn((tag) => {
    if (tag === 'canvas') return mockCanvas;
    return {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  }),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
} as unknown;

export {};
