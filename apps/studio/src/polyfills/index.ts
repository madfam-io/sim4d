/**
 * Runtime polyfill loader for Node.js modules in browser environment
 * This script sets up global module resolution for external Node.js dependencies
 */

import pathMock from './path-mock';
import urlMock from './url-mock';
import fsMock from './fs-mock';
import cryptoMock from './crypto-mock';
import uuidMock from './uuid-mock';
import xxhashMock from './xxhash-mock';

declare global {
  interface Window {
    require?: (id: string) => any;
    process?: any;
    global?: any;
    Buffer?: any;
  }
}

// Set up global process object for Node.js compatibility
if (typeof window !== 'undefined') {
  window.global = window.global || window;
  window.process = window.process || {
    env: { NODE_ENV: 'production' },
    version: 'v16.0.0',
    versions: { node: '16.0.0' },
    platform: 'browser',
    browser: true,
    argv: [],
    cwd: () => '/',
    nextTick: (fn: Function) => setTimeout(fn, 0),
  };

  // Set up Buffer polyfill if needed
  if (!window.Buffer) {
    window.Buffer = {
      from: (data: unknown) => new Uint8Array(data),
      alloc: (size: number) => new Uint8Array(size),
      isBuffer: () => false,
    };
  }

  // Set up a simple require function for our polyfills
  (window as unknown).require = function (id: string) {
    switch (id) {
      case 'path':
        return pathMock;
      case 'url':
        return urlMock;
      case 'fs':
        return fsMock;
      case 'crypto':
        return cryptoMock;
      case 'uuid':
        return uuidMock;
      case 'xxhash-wasm':
        return xxhashMock;
      default:
        throw new Error(`Module "${id}" not found. Only Node.js polyfills are available.`);
    }
  };
}

// Export for manual imports as well
export {
  pathMock as path,
  urlMock as url,
  fsMock as fs,
  cryptoMock as crypto,
  uuidMock as uuid,
  xxhashMock as xxhash,
};
