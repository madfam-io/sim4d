/**
 * WASM Test Utilities
 * Comprehensive test harness for WASM-dependent components
 *
 * Provides mock Worker API, geometry operation stubs, and dynamic import handling
 * for testing geometry-api-factory.ts and other WASM-dependent modules.
 */

import { vi } from 'vitest';
import type { WorkerAPI, GeometryHandle, ShapeType } from '@brepflow/types';

/**
 * Mock geometry handle generator
 */
let mockHandleCounter = 1;
export const createMockGeometryHandle = (type: ShapeType = 'SOLID'): GeometryHandle => ({
  id: `mock-geometry-${mockHandleCounter++}`,
  type,
  valid: true,
  metadata: {
    volume: 1000,
    surfaceArea: 600,
    boundingBox: {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 10, y: 10, z: 10 },
    },
  },
});

/**
 * Mock Worker API implementation
 * Simulates @brepflow/engine-occt Worker API for testing
 */
export const createMockWorkerAPI = (): WorkerAPI => {
  const mockAPI: WorkerAPI = {
    // Primitive creation
    invoke: vi.fn().mockImplementation(async (operation: string, params: unknown) => {
      // Simulate geometry operations
      switch (operation) {
        case 'MAKE_BOX':
          return { shape: createMockGeometryHandle('SOLID') };
        case 'MAKE_CYLINDER':
          return { shape: createMockGeometryHandle('SOLID') };
        case 'MAKE_SPHERE':
          return { shape: createMockGeometryHandle('SOLID') };
        case 'MAKE_EXTRUDE':
          return { shape: createMockGeometryHandle('SOLID') };
        case 'BOOLEAN_UNION':
        case 'BOOLEAN_DIFFERENCE':
        case 'BOOLEAN_INTERSECTION':
          return { shape: createMockGeometryHandle('SOLID') };
        case 'FILLET':
        case 'CHAMFER':
          return { shape: createMockGeometryHandle('SOLID') };
        case 'VALIDATE':
          return { isValid: true, errors: [] };
        case 'TESSELATE':
          return {
            vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0]),
            normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
            indices: new Uint32Array([0, 1, 2]),
          };
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    }),

    // Worker lifecycle
    terminate: vi.fn(),
    isReady: vi.fn().mockResolvedValue(true),
    getStatus: vi.fn().mockResolvedValue({ ready: true, busy: false }),

    // Memory management
    dispose: vi.fn().mockResolvedValue(undefined),
    getMemoryUsage: vi.fn().mockResolvedValue({ used: 1024 * 1024, total: 16 * 1024 * 1024 }),
  };

  return mockAPI;
};

/**
 * Mock @brepflow/engine-occt module
 * Use with vi.mock() to stub the entire module
 */
export const mockEngineOCCTModule = {
  createGeometryAPI: vi.fn().mockImplementation(async (config?: unknown) => {
    return createMockWorkerAPI();
  }),

  ProductionLogger: vi.fn().mockImplementation((name: string) => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    name,
  })),

  // Re-export types (for TypeScript compatibility)
  WorkerAPI: {} as unknown,
  GeometryHandle: {} as unknown,
};

/**
 * Setup WASM test environment
 * Call this in beforeEach() for WASM-dependent tests
 */
export const setupWASMTestEnvironment = () => {
  // Mock vi.mock() for @brepflow/engine-occt
  vi.doMock('@brepflow/engine-occt', () => mockEngineOCCTModule);

  // Reset mock counters
  mockHandleCounter = 1;

  // Clear all mocks
  vi.clearAllMocks();
};

/**
 * Teardown WASM test environment
 * Call this in afterEach() for WASM-dependent tests
 */
export const teardownWASMTestEnvironment = () => {
  vi.doUnmock('@brepflow/engine-occt');
  vi.clearAllMocks();
};

/**
 * Mock WASM configuration
 */
export const mockWASMConfig = {
  enabled: true,
  wasmPath: '/mock/path/to/occt.wasm',
  workerPath: '/mock/path/to/occt.worker.js',
  memoryLimit: 512 * 1024 * 1024, // 512 MB
  threadCount: 2,
};

/**
 * Mock environment configuration for WASM tests
 */
export const mockEnvironmentConfig = {
  mode: 'test' as const,
  features: {
    realWASM: false,
    mockGeometry: true,
    webGPU: false,
  },
  paths: {
    wasmAssets: '/mock/wasm/',
    workers: '/mock/workers/',
  },
};

/**
 * Helper to mock shouldUseRealWASM configuration
 */
export const mockShouldUseRealWASM = (value: boolean) => {
  vi.doMock('../../src/config/wasm-config', () => ({
    shouldUseRealWASM: vi.fn().mockReturnValue(value),
    getWASMConfig: vi.fn().mockReturnValue(mockWASMConfig),
  }));
};

/**
 * Helper to mock environment configuration
 */
export const mockGetConfig = () => {
  vi.doMock('../../src/config/environment', () => ({
    getConfig: vi.fn().mockReturnValue(mockEnvironmentConfig),
  }));
};

/**
 * Complete WASM test harness setup
 * Sets up all necessary mocks for geometry-api-factory testing
 */
export const setupCompleteWASMHarness = (options: { useRealWASM?: boolean } = {}) => {
  const { useRealWASM = false } = options;

  // Mock environment and WASM config
  mockGetConfig();
  mockShouldUseRealWASM(useRealWASM);

  // Mock engine-occt module
  setupWASMTestEnvironment();

  return {
    mockWorkerAPI: createMockWorkerAPI(),
    mockConfig: mockEnvironmentConfig,
    mockWASMConfig,
  };
};

/**
 * Assertions for WorkerAPI behavior
 */
export const expectWorkerAPICall = (mockAPI: WorkerAPI, operation: string, params?: any) => {
  expect(mockAPI.invoke).toHaveBeenCalledWith(
    operation,
    params ? expect.objectContaining(params) : expect.anything()
  );
};

/**
 * Assertions for geometry handle validity
 */
export const expectValidGeometryHandle = (handle: any) => {
  expect(handle).toBeDefined();
  expect(handle).toHaveProperty('id');
  expect(handle).toHaveProperty('type');
  expect(handle).toHaveProperty('valid', true);
};

/**
 * Mock createGeometryProxy utility
 */
export const createMockGeometryProxy = () => {
  const mockProxy = {
    box: vi.fn().mockResolvedValue(createMockGeometryHandle('SOLID')),
    cylinder: vi.fn().mockResolvedValue(createMockGeometryHandle('SOLID')),
    sphere: vi.fn().mockResolvedValue(createMockGeometryHandle('SOLID')),
    extrude: vi.fn().mockResolvedValue(createMockGeometryHandle('SOLID')),
    union: vi.fn().mockResolvedValue(createMockGeometryHandle('SOLID')),
    difference: vi.fn().mockResolvedValue(createMockGeometryHandle('SOLID')),
    intersection: vi.fn().mockResolvedValue(createMockGeometryHandle('SOLID')),
    fillet: vi.fn().mockResolvedValue(createMockGeometryHandle('SOLID')),
    chamfer: vi.fn().mockResolvedValue(createMockGeometryHandle('SOLID')),
    validate: vi.fn().mockResolvedValue({ isValid: true, errors: [] }),
    tesselate: vi.fn().mockResolvedValue({
      vertices: new Float32Array(9),
      normals: new Float32Array(9),
      indices: new Uint32Array(3),
    }),
  };

  return mockProxy;
};

/**
 * Type exports for test use
 */
export type MockWorkerAPI = ReturnType<typeof createMockWorkerAPI>;
export type MockGeometryProxy = ReturnType<typeof createMockGeometryProxy>;
