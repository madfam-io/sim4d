/**
 * Mock @brepflow/engine-occt module
 *
 * This file is aliased in vitest.config.ts to replace the real engine-occt module
 * during test execution, allowing us to test geometry-api-factory.ts without
 * requiring actual WASM bindings.
 */

import { vi } from 'vitest';
import type { WorkerAPI, GeometryHandle, ShapeType } from '@brepflow/types';

// Mock geometry handle counter
let handleCounter = 1;

const createMockGeometryHandle = (type: ShapeType = 'SOLID'): GeometryHandle => ({
  id: `mock-geometry-${handleCounter++}`,
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

const createMockWorkerAPI = (): WorkerAPI => ({
  invoke: vi.fn().mockImplementation(async (operation: string, params: unknown) => {
    switch (operation) {
      case 'MAKE_BOX':
      case 'MAKE_CYLINDER':
      case 'MAKE_SPHERE':
      case 'MAKE_EXTRUDE':
      case 'BOOLEAN_UNION':
      case 'BOOLEAN_DIFFERENCE':
      case 'BOOLEAN_INTERSECTION':
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
  terminate: vi.fn(),
  isReady: vi.fn().mockResolvedValue(true),
  getStatus: vi.fn().mockResolvedValue({ ready: true, busy: false }),
  dispose: vi.fn().mockResolvedValue(undefined),
  getMemoryUsage: vi.fn().mockResolvedValue({ used: 1024 * 1024, total: 16 * 1024 * 1024 }),
});

/**
 * Mock createGeometryAPI function
 * Returns an IntegratedGeometryAPI-like object
 */
export const createGeometryAPI = vi.fn().mockImplementation((config?: unknown) => {
  return {
    init: vi.fn().mockResolvedValue(undefined),
    invoke: vi.fn().mockImplementation(async (operation: string, params: unknown) => {
      // Return OperationResult format
      switch (operation) {
        case 'HEALTH_CHECK':
          return { success: true, result: { healthy: true } };
        case 'MAKE_BOX':
        case 'MAKE_CYLINDER':
        case 'MAKE_SPHERE':
        case 'MAKE_EXTRUDE':
        case 'BOOLEAN_UNION':
        case 'BOOLEAN_DIFFERENCE':
        case 'BOOLEAN_INTERSECTION':
        case 'FILLET':
        case 'CHAMFER':
          return { success: true, result: { shape: createMockGeometryHandle('SOLID') } };
        case 'VALIDATE':
          return { success: true, result: { isValid: true, errors: [] } };
        case 'TESSELLATE':
          return {
            success: true,
            result: {
              vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0]),
              normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
              indices: new Uint32Array([0, 1, 2]),
            },
          };
        case 'DISPOSE':
          return { success: true, result: undefined };
        default:
          return { success: false, error: `Unsupported operation: ${operation}` };
      }
    }),
    shutdown: vi.fn().mockResolvedValue(undefined),
  };
});

/**
 * Mock ProductionLogger class
 */
export class ProductionLogger {
  name: string;
  error = vi.fn();
  warn = vi.fn();
  info = vi.fn();
  debug = vi.fn();

  constructor(name: string) {
    this.name = name;
  }
}

/**
 * Reset mock state between tests
 */
export const resetMockState = () => {
  handleCounter = 1;
  vi.clearAllMocks();
};

// Auto-export for ESM compatibility
export default {
  createGeometryAPI,
  ProductionLogger,
  resetMockState,
};
