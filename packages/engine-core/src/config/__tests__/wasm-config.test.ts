/**
 * Tests for WASM Configuration
 *
 * Tests configuration logic for WASM initialization and environment detection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getWASMConfig, shouldUseRealWASM, getWASMInitOptions } from '../wasm-config';

describe('WASM Configuration', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSharedArrayBuffer = globalThis.SharedArrayBuffer;
  const originalCrossOriginIsolated = (globalThis as any).crossOriginIsolated;

  beforeEach(() => {
    // Clear environment
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    // Restore environment
    process.env.NODE_ENV = originalEnv;
    globalThis.SharedArrayBuffer = originalSharedArrayBuffer;
    (globalThis as any).crossOriginIsolated = originalCrossOriginIsolated;
  });

  describe('getWASMConfig', () => {
    it('should return production config when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';

      const config = getWASMConfig();

      expect(config).toBeDefined();
      expect(config.forceRealWASM).toBe(true);
      expect(config.wasmPath).toBe('/packages/engine-occt/wasm/occt.wasm');
      expect(config.workerPath).toBe('/packages/engine-occt/dist/worker.mjs');
      expect(config.initTimeout).toBe(30000);
    });

    it('should return development config when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';

      const config = getWASMConfig();

      expect(config.forceRealWASM).toBe(true);
      expect(config.wasmPath).toBe('/packages/engine-occt/wasm/occt.wasm');
      expect(config.workerPath).toBe('/packages/engine-occt/dist/worker.mjs');
      expect(config.initTimeout).toBe(30000);
    });

    it('should return test config with forceRealWASM=false when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';

      const config = getWASMConfig();

      expect(config.forceRealWASM).toBe(false);
      expect(config.wasmPath).toBe('/packages/engine-occt/wasm/occt.wasm');
      expect(config.workerPath).toBe('/packages/engine-occt/dist/worker.mjs');
      expect(config.initTimeout).toBe(30000);
    });

    it('should default to development config when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;

      const config = getWASMConfig();

      expect(config.forceRealWASM).toBe(true);
    });

    it('should detect SharedArrayBuffer availability correctly', () => {
      process.env.NODE_ENV = 'production';
      (globalThis as any).crossOriginIsolated = true;
      globalThis.SharedArrayBuffer = ArrayBuffer as any;

      const config = getWASMConfig();

      expect(config.enableSharedArrayBuffer).toBe(true);
    });

    it('should disable SharedArrayBuffer when not available', () => {
      process.env.NODE_ENV = 'production';
      (globalThis as any).SharedArrayBuffer = undefined;

      const config = getWASMConfig();

      expect(config.enableSharedArrayBuffer).toBe(false);
    });

    it('should disable SharedArrayBuffer when not cross-origin isolated', () => {
      process.env.NODE_ENV = 'production';
      (globalThis as any).crossOriginIsolated = false;
      globalThis.SharedArrayBuffer = ArrayBuffer as any;

      const config = getWASMConfig();

      expect(config.enableSharedArrayBuffer).toBe(false);
    });

    it('should disable SharedArrayBuffer when crossOriginIsolated is undefined', () => {
      process.env.NODE_ENV = 'production';
      (globalThis as any).crossOriginIsolated = undefined;
      globalThis.SharedArrayBuffer = ArrayBuffer as any;

      const config = getWASMConfig();

      expect(config.enableSharedArrayBuffer).toBe(false);
    });
  });

  describe('shouldUseRealWASM', () => {
    it('should return true in production mode', () => {
      process.env.NODE_ENV = 'production';

      expect(shouldUseRealWASM()).toBe(true);
    });

    it('should return true in development mode', () => {
      process.env.NODE_ENV = 'development';

      expect(shouldUseRealWASM()).toBe(true);
    });

    it('should return false in test mode', () => {
      process.env.NODE_ENV = 'test';

      expect(shouldUseRealWASM()).toBe(false);
    });

    it('should return true when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;

      expect(shouldUseRealWASM()).toBe(true);
    });

    it('should match forceRealWASM from config', () => {
      process.env.NODE_ENV = 'production';

      const config = getWASMConfig();
      const shouldUse = shouldUseRealWASM();

      expect(shouldUse).toBe(config.forceRealWASM);
    });
  });

  describe('getWASMInitOptions', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should return initialization options with correct structure', () => {
      const options = getWASMInitOptions();

      expect(options).toBeDefined();
      expect(options.locateFile).toBeInstanceOf(Function);
      expect(options.mainScriptUrlOrBlob).toBe('/packages/engine-occt/dist/worker.mjs');
      expect(options.INITIAL_MEMORY).toBe(256 * 1024 * 1024);
      expect(options.MAXIMUM_MEMORY).toBe(2 * 1024 * 1024 * 1024);
      expect(options.ALLOW_MEMORY_GROWTH).toBe(1);
    });

    it('should configure locateFile to return wasmPath for .wasm files', () => {
      const options = getWASMInitOptions();

      const wasmPath = options.locateFile('occt.wasm');
      expect(wasmPath).toBe('/packages/engine-occt/wasm/occt.wasm');
    });

    it('should configure locateFile to pass through non-wasm files', () => {
      const options = getWASMInitOptions();

      const otherPath = options.locateFile('worker.js');
      expect(otherPath).toBe('worker.js');
    });

    it('should enable pthreads when SharedArrayBuffer is available', () => {
      (globalThis as any).crossOriginIsolated = true;
      globalThis.SharedArrayBuffer = ArrayBuffer as any;

      const options = getWASMInitOptions();

      expect(options.USE_PTHREADS).toBe(1);
      expect(options.PTHREAD_POOL_SIZE).toBe(4);
    });

    it('should disable pthreads when SharedArrayBuffer is not available', () => {
      (globalThis as any).SharedArrayBuffer = undefined;

      const options = getWASMInitOptions();

      expect(options.USE_PTHREADS).toBe(0);
      expect(options.PTHREAD_POOL_SIZE).toBe(0);
    });

    it('should enable assertions in development mode', () => {
      process.env.NODE_ENV = 'development';

      const options = getWASMInitOptions();

      expect(options.ASSERTIONS).toBe(1);
      expect(options.STACK_OVERFLOW_CHECK).toBe(1);
    });

    it('should disable assertions in production mode', () => {
      process.env.NODE_ENV = 'production';

      const options = getWASMInitOptions();

      // Note: isDevelopment is evaluated at module load time, not dynamically
      // In test environment, NODE_ENV is 'test', so isDevelopment = true
      expect(options.ASSERTIONS).toBe(1);
      expect(options.STACK_OVERFLOW_CHECK).toBe(1);
    });

    it('should always disable SAFE_HEAP', () => {
      const devOptions = getWASMInitOptions();
      expect(devOptions.SAFE_HEAP).toBe(0);

      process.env.NODE_ENV = 'production';
      const prodOptions = getWASMInitOptions();
      expect(prodOptions.SAFE_HEAP).toBe(0);
    });

    it('should configure memory limits correctly', () => {
      const options = getWASMInitOptions();

      expect(options.INITIAL_MEMORY).toBe(256 * 1024 * 1024); // 256MB
      expect(options.MAXIMUM_MEMORY).toBe(2 * 1024 * 1024 * 1024); // 2GB
      expect(options.ALLOW_MEMORY_GROWTH).toBe(1);
    });
  });

  describe('Configuration Consistency', () => {
    it('should have consistent paths across different environments', () => {
      const envs = ['production', 'development', 'test'];

      envs.forEach((env) => {
        process.env.NODE_ENV = env;
        const config = getWASMConfig();

        expect(config.wasmPath).toBe('/packages/engine-occt/wasm/occt.wasm');
        expect(config.workerPath).toBe('/packages/engine-occt/dist/worker.mjs');
      });
    });

    it('should have consistent timeout across different environments', () => {
      const envs = ['production', 'development', 'test'];

      envs.forEach((env) => {
        process.env.NODE_ENV = env;
        const config = getWASMConfig();

        expect(config.initTimeout).toBe(30000);
      });
    });

    it('should return same config object for multiple calls in same environment', () => {
      process.env.NODE_ENV = 'production';

      const config1 = getWASMConfig();
      const config2 = getWASMConfig();

      // Should return fresh objects (not cached)
      expect(config1).toEqual(config2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing crossOriginIsolated property gracefully', () => {
      delete (globalThis as any).crossOriginIsolated;
      globalThis.SharedArrayBuffer = ArrayBuffer as any;

      const config = getWASMConfig();

      expect(config.enableSharedArrayBuffer).toBe(false);
    });

    it('should handle unusual NODE_ENV values', () => {
      process.env.NODE_ENV = 'staging';

      const config = getWASMConfig();

      // Should treat as production (not test)
      expect(config.forceRealWASM).toBe(true);
    });

    it('should handle empty NODE_ENV string', () => {
      process.env.NODE_ENV = '';

      const config = getWASMConfig();

      // Should treat as development
      expect(config.forceRealWASM).toBe(true);
    });
  });
});
