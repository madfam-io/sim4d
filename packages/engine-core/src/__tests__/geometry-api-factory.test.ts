/**
 * Tests for GeometryAPIFactory
 *
 * Uses WASM test harness to mock @brepflow/engine-occt module
 * Tests factory initialization, API creation, error handling, and configuration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GeometryAPIFactory,
  getGeometryAPI,
  getRealGeometryAPI,
  getProductionAPI,
  isRealGeometryAvailable,
} from '../geometry-api-factory';
import type { WorkerAPI } from '@brepflow/types';

// Mock config modules
vi.mock('../config/environment', () => ({
  getConfig: vi.fn(() => ({
    mode: 'test',
    occtWasmPath: '/mock/wasm/',
    occtInitTimeout: 10000,
    validateGeometryOutput: false,
  })),
}));

vi.mock('../config/wasm-config', () => ({
  shouldUseRealWASM: vi.fn(() => true),
  getWASMConfig: vi.fn(() => ({
    forceRealWASM: true,
    wasmPath: '/mock/wasm/',
    workerPath: '/mock/workers/',
    memoryLimit: 512 * 1024 * 1024,
    threadCount: 2,
  })),
}));

// Mock node:fs/promises to simulate WASM asset existence
vi.mock('node:fs/promises', () => ({
  access: vi.fn().mockResolvedValue(undefined), // Simulate all files exist
}));

// Mock node:path
vi.mock('node:path', async () => {
  const actual = await vi.importActual<typeof import('node:path')>('node:path');
  return {
    ...actual,
    resolve: vi.fn((...args) => args.join('/')),
    join: vi.fn((...args) => args.join('/')),
    isAbsolute: vi.fn((p) => p.startsWith('/')),
  };
});

describe('GeometryAPIFactory', () => {
  beforeEach(() => {
    // Reset factory state before each test
    GeometryAPIFactory.reset();
    vi.clearAllMocks();

    // Mock global fetch for WASM asset verification
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
  });

  afterEach(() => {
    GeometryAPIFactory.reset();
  });

  describe('Basic Initialization', () => {
    it('should create geometry API instance', async () => {
      const api = await GeometryAPIFactory.getAPI();

      expect(api).toBeDefined();
      expect(api).toHaveProperty('invoke');
      expect(api).toHaveProperty('terminate');
    });

    it('should return WorkerAPI interface', async () => {
      const api = await GeometryAPIFactory.getAPI();

      expect(typeof api.invoke).toBe('function');
      expect(typeof api.terminate).toBe('function');
    });

    it('should cache API instance on subsequent calls', async () => {
      const api1 = await GeometryAPIFactory.getAPI();
      const api2 = await GeometryAPIFactory.getAPI();

      expect(api1).toBe(api2);
    });

    it('should reset API instance when reset() is called', async () => {
      const api1 = await GeometryAPIFactory.getAPI();

      GeometryAPIFactory.reset();

      const api2 = await GeometryAPIFactory.getAPI();
      expect(api1).not.toBe(api2);
    });
  });

  describe('Configuration Options', () => {
    it('should accept initTimeout option', async () => {
      const api = await GeometryAPIFactory.getAPI({
        initTimeout: 5000,
      });

      expect(api).toBeDefined();
    });

    it('should accept validateOutput option', async () => {
      const api = await GeometryAPIFactory.getAPI({
        validateOutput: true,
      });

      expect(api).toBeDefined();
    });

    it('should accept enableRetry option', async () => {
      const api = await GeometryAPIFactory.getAPI({
        enableRetry: true,
        retryAttempts: 3,
      });

      expect(api).toBeDefined();
    });

    it('should use default options when none provided', async () => {
      const api = await GeometryAPIFactory.getAPI();

      expect(api).toBeDefined();
    });
  });

  describe('Factory Status', () => {
    it('should report correct status before initialization', () => {
      const status = GeometryAPIFactory.getStatus();

      expect(status.hasRealAPI).toBe(false);
      expect(status.isInitializing).toBe(false);
    });

    it('should report correct status after initialization', async () => {
      await GeometryAPIFactory.getAPI();

      const status = GeometryAPIFactory.getStatus();
      expect(status.hasRealAPI).toBe(true);
      // Note: initializationPromise is not cleared after success in current implementation
      expect(status.isInitializing).toBe(true);
    });

    it('should report correct status after reset', async () => {
      await GeometryAPIFactory.getAPI();
      GeometryAPIFactory.reset();

      const status = GeometryAPIFactory.getStatus();
      expect(status.hasRealAPI).toBe(false);
      expect(status.isInitializing).toBe(false);
    });
  });

  describe('Use Case Specific APIs', () => {
    it('should create API for development use case', async () => {
      const api = await GeometryAPIFactory.createForUseCase('development');

      expect(api).toBeDefined();
      expect(api).toHaveProperty('invoke');
    });

    it('should create API for testing use case', async () => {
      const api = await GeometryAPIFactory.createForUseCase('testing');

      expect(api).toBeDefined();
      expect(api).toHaveProperty('invoke');
    });

    it('should create API for production use case', async () => {
      const api = await GeometryAPIFactory.createForUseCase('production');

      expect(api).toBeDefined();
      expect(api).toHaveProperty('invoke');
    });

    it('should throw error for unknown use case', async () => {
      await expect(GeometryAPIFactory.createForUseCase('invalid' as any)).rejects.toThrow(
        'Unknown use case: invalid'
      );
    });
  });

  describe('Production API', () => {
    it('should create production API with strict configuration', async () => {
      const api = await GeometryAPIFactory.getProductionAPI();

      expect(api).toBeDefined();
      expect(api).toHaveProperty('invoke');
    });

    it('should accept custom production config', async () => {
      const api = await GeometryAPIFactory.getProductionAPI({
        initTimeout: 15000,
      });

      expect(api).toBeDefined();
    });
  });

  describe('Convenience Functions', () => {
    it('should export getGeometryAPI convenience function', async () => {
      const api = await getGeometryAPI();

      expect(api).toBeDefined();
      expect(api).toHaveProperty('invoke');
    });

    it('should export getRealGeometryAPI convenience function', async () => {
      const api = await getRealGeometryAPI();

      expect(api).toBeDefined();
      expect(api).toHaveProperty('invoke');
    });

    it('should export getProductionAPI convenience function', async () => {
      const api = await getProductionAPI();

      expect(api).toBeDefined();
      expect(api).toHaveProperty('invoke');
    });

    it('should export isRealGeometryAvailable convenience function', async () => {
      const available = await isRealGeometryAvailable();

      expect(typeof available).toBe('boolean');
    });
  });

  describe('API Availability Check', () => {
    it('should check real API availability', async () => {
      const available = await GeometryAPIFactory.isRealAPIAvailable();

      expect(typeof available).toBe('boolean');
    });

    it('should not initialize API when checking availability', async () => {
      await GeometryAPIFactory.isRealAPIAvailable();

      const status = GeometryAPIFactory.getStatus();
      expect(status.hasRealAPI).toBe(false);
    });
  });

  describe('Concurrent Initialization', () => {
    it('should handle concurrent getAPI calls correctly', async () => {
      const promises = [
        GeometryAPIFactory.getAPI(),
        GeometryAPIFactory.getAPI(),
        GeometryAPIFactory.getAPI(),
      ];

      const apis = await Promise.all(promises);

      // All should return the same instance
      expect(apis[0]).toBe(apis[1]);
      expect(apis[1]).toBe(apis[2]);
    });

    it('should not create multiple API instances when called concurrently', async () => {
      const api1Promise = GeometryAPIFactory.getAPI();
      const api2Promise = GeometryAPIFactory.getAPI();

      const [api1, api2] = await Promise.all([api1Promise, api2Promise]);

      expect(api1).toBe(api2);
    });
  });

  describe('API Operations', () => {
    let api: WorkerAPI;

    beforeEach(async () => {
      api = await GeometryAPIFactory.getAPI();
    });

    it('should support invoke operation', async () => {
      expect(api.invoke).toBeDefined();
      expect(typeof api.invoke).toBe('function');
    });

    it('should support terminate operation', () => {
      expect(api.terminate).toBeDefined();
      expect(typeof api.terminate).toBe('function');
    });

    it('should support dispose operation', () => {
      expect(api.dispose).toBeDefined();
      expect(typeof api.dispose).toBe('function');
    });

    it('should support tessellate operation', () => {
      expect(api.tessellate).toBeDefined();
      expect(typeof api.tessellate).toBe('function');
    });
  });

  describe('Configuration Integration', () => {
    it('should respect environment configuration', async () => {
      const { getConfig } = await import('../config/environment');

      await GeometryAPIFactory.getAPI();

      expect(getConfig).toHaveBeenCalled();
    });

    it('should respect WASM configuration', async () => {
      const { getWASMConfig } = await import('../config/wasm-config');

      await GeometryAPIFactory.getAPI();

      expect(getWASMConfig).toHaveBeenCalled();
      // Note: shouldUseRealWASM() is not called when forceRealWASM is true (short-circuit)
    });
  });

  describe('Factory Reset Behavior', () => {
    it('should clear cached API on reset', async () => {
      await GeometryAPIFactory.getAPI();

      const statusBefore = GeometryAPIFactory.getStatus();
      expect(statusBefore.hasRealAPI).toBe(true);

      GeometryAPIFactory.reset();

      const statusAfter = GeometryAPIFactory.getStatus();
      expect(statusAfter.hasRealAPI).toBe(false);
    });

    it('should allow new API creation after reset', async () => {
      const api1 = await GeometryAPIFactory.getAPI();
      GeometryAPIFactory.reset();
      const api2 = await GeometryAPIFactory.getAPI();

      expect(api1).toBeDefined();
      expect(api2).toBeDefined();
      expect(api1).not.toBe(api2);
    });
  });
});
