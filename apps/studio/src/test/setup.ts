import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Worker for Node.js environment
class WorkerMock {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  postMessage(data: unknown) {
    // Simulate async worker response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(
          new MessageEvent('message', {
            data: {
              id: data.id,
              success: true,
              result: {
                initialized: true,
                production: false,
              },
            },
          })
        );
      }
    }, 0);
  }

  terminate() {
    // Cleanup
  }

  addEventListener(event: string, handler: EventListener) {
    if (event === 'message') {
      this.onmessage = handler as any;
    } else if (event === 'error') {
      this.onerror = handler as any;
    }
  }

  removeEventListener(event: string, handler: EventListener) {
    if (event === 'message') {
      this.onmessage = null;
    } else if (event === 'error') {
      this.onerror = null;
    }
  }
}

// Assign to global
(global as any).Worker = WorkerMock;

// Mock import.meta.url for ESM modules
Object.defineProperty(import.meta, 'url', {
  value: 'http://localhost:3000',
  writable: true,
});

// Mock fetch for testing
global.fetch = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
