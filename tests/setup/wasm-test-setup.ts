/**
 * WASM Test Environment Setup
 * Provides proper test infrastructure for geometry operations with optimized dependency handling
 */

import { vi } from 'vitest';
import type { OCCTModule, ShapeHandle, MeshData } from '@sim4d/engine-occt/src/occt-bindings';

// WASM optimization flags
const WASM_OPTIMIZATION_CONFIG = {
  enableSharedArrayBuffer: !!globalThis.SharedArrayBuffer,
  enableThreads: typeof globalThis.Worker !== 'undefined',
  memoryPages: 256, // 16MB initial memory
  maxMemoryPages: 32768, // 2GB max memory
  useCompactMode: process.env.NODE_ENV === 'test',
};

// Mock WASM module for test environment
let mockShapeCounter = 0;
let mockShapeRegistry = new Map<string, ShapeHandle>();

/**
 * Creates a mock shape handle for testing
 */
function createMockShape(
  type: 'solid' | 'surface' | 'curve' = 'solid',
  overrides: Partial<ShapeHandle> = {}
): ShapeHandle {
  const id = `test-shape-${++mockShapeCounter}`;
  const shape: ShapeHandle = {
    id,
    type,
    bbox_min_x: -50,
    bbox_min_y: -50,
    bbox_min_z: -50,
    bbox_max_x: 50,
    bbox_max_y: 50,
    bbox_max_z: 50,
    hash: `hash-${id}`,
    volume: type === 'solid' ? 1000 : undefined,
    area: 600,
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    ...overrides,
  };

  mockShapeRegistry.set(id, shape);
  return shape;
}

/**
 * Creates a mock mesh data for testing
 */
function createMockMesh(): MeshData {
  return {
    positions: new Float32Array([
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      0, // Triangle 1
      0,
      0,
      1,
      1,
      0,
      1,
      0,
      1,
      1, // Triangle 2
    ]),
    normals: new Float32Array([
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1, // Triangle 1 normals
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1, // Triangle 2 normals
    ]),
    indices: new Uint32Array([0, 1, 2, 3, 4, 5]),
    edges: new Uint32Array([0, 1, 1, 2, 2, 0, 3, 4, 4, 5, 5, 3]),
    vertexCount: 6,
    triangleCount: 2,
    edgeCount: 6,
  };
}

/**
 * Mock OCCT module for comprehensive testing
 */
export function createMockOCCTModule(): OCCTModule {
  return {
    // Primitive creation
    makeBox: vi.fn((dx: number, dy: number, dz: number) => {
      return createMockShape('solid', {
        bbox_max_x: dx,
        bbox_max_y: dy,
        bbox_max_z: dz,
        volume: dx * dy * dz,
      });
    }),

    makeBoxWithOrigin: vi.fn(
      (x: number, y: number, z: number, dx: number, dy: number, dz: number) => {
        return createMockShape('solid', {
          bbox_min_x: x,
          bbox_min_y: y,
          bbox_min_z: z,
          bbox_max_x: x + dx,
          bbox_max_y: y + dy,
          bbox_max_z: z + dz,
          centerX: x + dx / 2,
          centerY: y + dy / 2,
          centerZ: z + dz / 2,
          volume: dx * dy * dz,
        });
      }
    ),

    makeSphere: vi.fn((radius: number) => {
      return createMockShape('solid', {
        bbox_min_x: -radius,
        bbox_min_y: -radius,
        bbox_min_z: -radius,
        bbox_max_x: radius,
        bbox_max_y: radius,
        bbox_max_z: radius,
        volume: (4 / 3) * Math.PI * Math.pow(radius, 3),
      });
    }),

    makeSphereWithCenter: vi.fn((cx: number, cy: number, cz: number, radius: number) => {
      return createMockShape('solid', {
        bbox_min_x: cx - radius,
        bbox_min_y: cy - radius,
        bbox_min_z: cz - radius,
        bbox_max_x: cx + radius,
        bbox_max_y: cy + radius,
        bbox_max_z: cz + radius,
        centerX: cx,
        centerY: cy,
        centerZ: cz,
        volume: (4 / 3) * Math.PI * Math.pow(radius, 3),
      });
    }),

    makeCylinder: vi.fn((radius: number, height: number) => {
      return createMockShape('solid', {
        bbox_min_x: -radius,
        bbox_min_y: -radius,
        bbox_min_z: 0,
        bbox_max_x: radius,
        bbox_max_y: radius,
        bbox_max_z: height,
        centerZ: height / 2,
        volume: Math.PI * Math.pow(radius, 2) * height,
      });
    }),

    makeCone: vi.fn((radius1: number, radius2: number, height: number) => {
      const maxRadius = Math.max(radius1, radius2);
      return createMockShape('solid', {
        bbox_min_x: -maxRadius,
        bbox_min_y: -maxRadius,
        bbox_min_z: 0,
        bbox_max_x: maxRadius,
        bbox_max_y: maxRadius,
        bbox_max_z: height,
        centerZ: height / 2,
        volume:
          (Math.PI * height * (radius1 * radius1 + radius1 * radius2 + radius2 * radius2)) / 3,
      });
    }),

    makeTorus: vi.fn((majorRadius: number, minorRadius: number) => {
      const outerRadius = majorRadius + minorRadius;
      return createMockShape('solid', {
        bbox_min_x: -outerRadius,
        bbox_min_y: -outerRadius,
        bbox_min_z: -minorRadius,
        bbox_max_x: outerRadius,
        bbox_max_y: outerRadius,
        bbox_max_z: minorRadius,
        volume: 2 * Math.PI * Math.PI * majorRadius * minorRadius * minorRadius,
      });
    }),

    // Advanced operations
    extrude: vi.fn((profileId: string, dx: number, dy: number, dz: number) => {
      const profile = mockShapeRegistry.get(profileId);
      if (!profile) throw new Error(`Profile ${profileId} not found`);

      return createMockShape('solid', {
        bbox_min_x: profile.bbox_min_x,
        bbox_min_y: profile.bbox_min_y,
        bbox_min_z: profile.bbox_min_z,
        bbox_max_x: profile.bbox_max_x + Math.abs(dx),
        bbox_max_y: profile.bbox_max_y + Math.abs(dy),
        bbox_max_z: profile.bbox_max_z + Math.abs(dz),
      });
    }),

    revolve: vi.fn(
      (
        profileId: string,
        angle: number,
        axisX: number,
        axisY: number,
        axisZ: number,
        originX: number,
        originY: number,
        originZ: number
      ) => {
        const profile = mockShapeRegistry.get(profileId);
        if (!profile) throw new Error(`Profile ${profileId} not found`);

        return createMockShape('solid');
      }
    ),

    // Boolean operations
    booleanUnion: vi.fn((shape1Id: string, shape2Id: string) => {
      const shape1 = mockShapeRegistry.get(shape1Id);
      const shape2 = mockShapeRegistry.get(shape2Id);
      if (!shape1 || !shape2) throw new Error('Shape not found for boolean operation');

      return createMockShape('solid', {
        bbox_min_x: Math.min(shape1.bbox_min_x, shape2.bbox_min_x),
        bbox_min_y: Math.min(shape1.bbox_min_y, shape2.bbox_min_y),
        bbox_min_z: Math.min(shape1.bbox_min_z, shape2.bbox_min_z),
        bbox_max_x: Math.max(shape1.bbox_max_x, shape2.bbox_max_x),
        bbox_max_y: Math.max(shape1.bbox_max_y, shape2.bbox_max_y),
        bbox_max_z: Math.max(shape1.bbox_max_z, shape2.bbox_max_z),
        volume: (shape1.volume || 0) + (shape2.volume || 0),
      });
    }),

    booleanSubtract: vi.fn((shape1Id: string, shape2Id: string) => {
      const shape1 = mockShapeRegistry.get(shape1Id);
      const shape2 = mockShapeRegistry.get(shape2Id);
      if (!shape1 || !shape2) throw new Error('Shape not found for boolean operation');

      return createMockShape('solid', {
        ...shape1,
        volume: Math.max(0, (shape1.volume || 0) - (shape2.volume || 0)),
      });
    }),

    booleanIntersect: vi.fn((shape1Id: string, shape2Id: string) => {
      const shape1 = mockShapeRegistry.get(shape1Id);
      const shape2 = mockShapeRegistry.get(shape2Id);
      if (!shape1 || !shape2) throw new Error('Shape not found for boolean operation');

      return createMockShape('solid', {
        bbox_min_x: Math.max(shape1.bbox_min_x, shape2.bbox_min_x),
        bbox_min_y: Math.max(shape1.bbox_min_y, shape2.bbox_min_y),
        bbox_min_z: Math.max(shape1.bbox_min_z, shape2.bbox_min_z),
        bbox_max_x: Math.min(shape1.bbox_max_x, shape2.bbox_max_x),
        bbox_max_y: Math.min(shape1.bbox_max_y, shape2.bbox_max_y),
        bbox_max_z: Math.min(shape1.bbox_max_z, shape2.bbox_max_z),
        volume: Math.min(shape1.volume || 0, shape2.volume || 0),
      });
    }),

    // Feature operations
    makeFillet: vi.fn((shapeId: string, radius: number) => {
      const shape = mockShapeRegistry.get(shapeId);
      if (!shape) throw new Error(`Shape ${shapeId} not found`);
      return createMockShape('solid', { ...shape });
    }),

    makeChamfer: vi.fn((shapeId: string, distance: number) => {
      const shape = mockShapeRegistry.get(shapeId);
      if (!shape) throw new Error(`Shape ${shapeId} not found`);
      return createMockShape('solid', { ...shape });
    }),

    makeShell: vi.fn((shapeId: string, thickness: number) => {
      const shape = mockShapeRegistry.get(shapeId);
      if (!shape) throw new Error(`Shape ${shapeId} not found`);
      return createMockShape('solid', {
        ...shape,
        volume: (shape.volume || 0) * 0.8, // Approximate shell volume reduction
      });
    }),

    // Transformation operations
    transform: vi.fn(
      (
        shapeId: string,
        tx: number,
        ty: number,
        tz: number,
        rx: number,
        ry: number,
        rz: number,
        sx: number,
        sy: number,
        sz: number
      ) => {
        const shape = mockShapeRegistry.get(shapeId);
        if (!shape) throw new Error(`Shape ${shapeId} not found`);

        return createMockShape('solid', {
          ...shape,
          centerX: shape.centerX + tx,
          centerY: shape.centerY + ty,
          centerZ: shape.centerZ + tz,
          volume: (shape.volume || 0) * sx * sy * sz,
        });
      }
    ),

    copyShape: vi.fn((shapeId: string) => {
      const shape = mockShapeRegistry.get(shapeId);
      if (!shape) throw new Error(`Shape ${shapeId} not found`);
      return createMockShape(shape.type, { ...shape });
    }),

    // Tessellation
    tessellate: vi.fn((shapeId: string, precision?: number, angle?: number) => {
      const shape = mockShapeRegistry.get(shapeId);
      if (!shape) throw new Error(`Shape ${shapeId} not found`);
      return createMockMesh();
    }),

    tessellateWithParams: vi.fn((shapeId: string, precision: number, angle: number) => {
      const shape = mockShapeRegistry.get(shapeId);
      if (!shape) throw new Error(`Shape ${shapeId} not found`);
      return createMockMesh();
    }),

    // File I/O
    importSTEP: vi.fn((fileData: string) => {
      return createMockShape('solid');
    }),

    exportSTEP: vi.fn((shapeId: string) => {
      const shape = mockShapeRegistry.get(shapeId);
      if (!shape) throw new Error(`Shape ${shapeId} not found`);
      return `ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('Mock STEP export for ${shapeId}'),'2;1');\nENDSEC;\nDATA;\nENDSEC;\nEND-ISO-10303-21;`;
    }),

    exportSTL: vi.fn((shapeId: string, binary?: boolean) => {
      const shape = mockShapeRegistry.get(shapeId);
      if (!shape) throw new Error(`Shape ${shapeId} not found`);

      if (binary) {
        // Return binary STL representation as string
        return 'BINARY_STL_DATA';
      } else {
        return `solid ${shapeId}\n  facet normal 0 0 1\n    outer loop\n      vertex 0 0 0\n      vertex 1 0 0\n      vertex 0 1 0\n    endloop\n  endfacet\nendsolid ${shapeId}`;
      }
    }),

    // Memory management
    deleteShape: vi.fn((shapeId: string) => {
      mockShapeRegistry.delete(shapeId);
    }),

    getShapeCount: vi.fn(() => mockShapeRegistry.size),

    clearAllShapes: vi.fn(() => {
      mockShapeRegistry.clear();
      mockShapeCounter = 0;
    }),

    // Status and version
    getStatus: vi.fn(() => 'mock_ready'),
    getOCCTVersion: vi.fn(() => 'Mock OCCT 7.8.0'),

    // Vector types
    VectorFloat: vi.fn(),
    VectorUint: vi.fn(),
  };
}

/**
 * Performance testing utilities
 */
export class GeometryPerformanceTracker {
  private static measurements: { operation: string; duration: number; timestamp: number }[] = [];

  static startMeasurement(operation: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.measurements.push({
        operation,
        duration,
        timestamp: Date.now(),
      });
      return duration;
    };
  }

  static getAverageDuration(operation: string): number {
    const operationMeasurements = this.measurements.filter((m) => m.operation === operation);
    if (operationMeasurements.length === 0) return 0;

    const total = operationMeasurements.reduce((sum, m) => sum + m.duration, 0);
    return total / operationMeasurements.length;
  }

  static getMeasurements(): typeof GeometryPerformanceTracker.measurements {
    return [...this.measurements];
  }

  static clearMeasurements(): void {
    this.measurements = [];
  }
}

/**
 * Test data generators
 */
export class GeometryTestDataGenerator {
  static generateRandomBoxParams(): { width: number; height: number; depth: number } {
    return {
      width: Math.random() * 100 + 10,
      height: Math.random() * 100 + 10,
      depth: Math.random() * 100 + 10,
    };
  }

  static generateRandomSphereParams(): { radius: number } {
    return {
      radius: Math.random() * 50 + 5,
    };
  }

  static generateRandomCylinderParams(): { radius: number; height: number } {
    return {
      radius: Math.random() * 25 + 5,
      height: Math.random() * 100 + 10,
    };
  }
}

/**
 * Optimized setup function for WASM tests with dependency bundling optimization
 */
export async function setupWASMTestEnvironment(): Promise<{
  mockOCCT: OCCTModule;
  cleanup: () => void;
  config: typeof WASM_OPTIMIZATION_CONFIG;
}> {
  // Pre-warm critical dependencies
  const mockOCCT = createMockOCCTModule();
  // Import OCCT bindings for mocking WASM loader functions
  const occtBindings = await import('@sim4d/engine-occt');

  // Ensure a clean loader state before wiring spies
  occtBindings.resetWASMLoader();

  const loadOCCTSpy = vi.spyOn(occtBindings, 'loadOCCT').mockImplementation(async () => mockOCCT);
  const getModuleSpy = vi.spyOn(occtBindings, 'getOCCTModule').mockReturnValue(mockOCCT);
  const isLoadedSpy = vi.spyOn(occtBindings, 'isWASMLoaded').mockReturnValue(true);
  const getLoadErrorSpy = vi.spyOn(occtBindings, 'getWASMLoadError').mockReturnValue(null);

  // Apply performance optimizations for test environment
  if (WASM_OPTIMIZATION_CONFIG.useCompactMode) {
    // Reduce mock precision for faster test execution
    vi.mocked(mockOCCT.tessellate).mockImplementation((shapeId: string) => {
      const shape = mockShapeRegistry.get(shapeId);
      if (!shape) throw new Error(`Shape ${shapeId} not found`);

      // Return minimal mesh for test speed
      return {
        positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
        normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
        indices: new Uint32Array([0, 1, 2]),
        edges: new Uint32Array([0, 1, 1, 2, 2, 0]),
        vertexCount: 3,
        triangleCount: 1,
        edgeCount: 3,
      };
    });
  }

  const cleanup = () => {
    mockOCCT.clearAllShapes();
    mockShapeRegistry.clear();
    mockShapeCounter = 0;
    GeometryPerformanceTracker.clearMeasurements();
    loadOCCTSpy.mockRestore();
    getModuleSpy.mockRestore();
    isLoadedSpy.mockRestore();
    getLoadErrorSpy.mockRestore();
    occtBindings.resetWASMLoader();

    // Force garbage collection in test environment
    if (global.gc) {
      global.gc();
    }
  };

  return { mockOCCT, cleanup, config: WASM_OPTIMIZATION_CONFIG };
}

/**
 * Memory-efficient batch test utilities
 */
export class BatchTestRunner {
  private static instance: BatchTestRunner;
  private batchSize = 10;
  private currentBatch: any[] = [];

  static getInstance(): BatchTestRunner {
    if (!BatchTestRunner.instance) {
      BatchTestRunner.instance = new BatchTestRunner();
    }
    return BatchTestRunner.instance;
  }

  async runBatch<T>(items: T[], processor: (item: T) => Promise<any>): Promise<any[]> {
    const results: any[] = [];

    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);

      // Allow event loop processing between batches
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return results;
  }

  setBatchSize(size: number): void {
    this.batchSize = Math.max(1, Math.min(50, size));
  }
}
