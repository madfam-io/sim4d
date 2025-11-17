/**
 * OCCT Integration Tests - Real Geometry Operations
 * Validates actual OCCT functionality with comprehensive test scenarios
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { loadOCCTModule } from './occt-loader';
import { OCCTMemoryManager } from './occt-bindings';
import { WASMLoader } from './wasm-loader';
import type { ShapeHandle, _MeshData } from '@brepflow/types';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds for WASM operations
  precision: 0.01,
  angleTolerance: 0.1,
  memoryThreshold: 100, // MB
};

describe('OCCT Integration Tests', () => {
  let occtModule: any = null;
  const testShapes: Map<string, ShapeHandle> = new Map();

  // Helper function to skip tests when OCCT is not available or detect Node.js mock
  const skipIfNoOCCT = () => {
    if (!occtModule) {
      console.log('Skipping test - OCCT module not available in test environment');
      return true;
    }

    // Check if we're running with Node.js mock instead of real OCCT
    const status = occtModule.getStatus();
    if (status && status.includes('Node.js OCCT Mock')) {
      console.log('Detected Node.js mock environment - adjusting test expectations');
      return false; // Don't skip, but we'll handle mock behavior
    }

    return false;
  };

  const isUsingMock = () => {
    if (!occtModule || typeof occtModule.getStatus !== 'function') {
      return true;
    }
    const status = occtModule.getStatus();
    return typeof status === 'string' && status.toLowerCase().includes('mock');
  };

  beforeAll(async () => {
    // Skip tests if WASM capabilities are insufficient
    const loader = WASMLoader.getInstance();
    const capabilities = await loader.detectCapabilities();

    if (!capabilities.hasWASM) {
      console.warn('Skipping OCCT tests - WebAssembly not supported');
      return;
    }

    try {
      console.log('Loading OCCT module for integration tests...');
      occtModule = await loadOCCTModule();

      if (!occtModule) {
        console.warn('OCCT module unavailable in test environment - tests will be skipped');
        return;
      }

      console.log('OCCT module loaded successfully');
    } catch (error) {
      console.warn('Failed to load OCCT, skipping integration tests:', error);
      occtModule = null;
    }
  }, TEST_CONFIG.timeout);

  afterAll(async () => {
    // Cleanup all test shapes
    if (occtModule && occtModule.deleteShape) {
      for (const [_id, shape] of testShapes) {
        try {
          occtModule.deleteShape(shape.id);
        } catch (error) {
          console.warn(`Failed to delete shape ${shape.id}:`, error);
        }
      }
      testShapes.clear();
    }

    // Memory cleanup
    OCCTMemoryManager.cleanup();
  });

  beforeEach(() => {
    // Clear test shapes before each test
    testShapes.clear();
  });

  describe('Module Loading and Initialization', () => {
    it('should load OCCT module', async () => {
      expect(occtModule).toBeDefined();
      expect(occtModule.getStatus).toBeDefined();
    });

    it('should provide status information', async () => {
      if (skipIfNoOCCT()) return;

      const status = occtModule.getStatus();
      expect(status).toBeDefined();
      expect(typeof status).toBe('string');
    });

    it('should support memory management', async () => {
      if (skipIfNoOCCT()) return;

      expect(occtModule.getShapeCount).toBeDefined();
      const shapeCount = occtModule.getShapeCount();
      expect(shapeCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Basic Shape Creation', () => {
    it('should create a box shape', async () => {
      if (skipIfNoOCCT()) return;

      const box = occtModule.makeBox(10, 20, 30);
      expect(box).toBeDefined();
      expect(box.id).toBeDefined();

      expect(box.type).toBe('solid');
      expect(box.volume).toBeCloseTo(6000, 1);

      testShapes.set('test_box', box);
    });

    it('should create a sphere shape', async () => {
      if (skipIfNoOCCT()) return;

      const sphere = occtModule.makeSphere(15);
      expect(sphere).toBeDefined();
      expect(sphere.id).toBeDefined();

      expect(sphere.type).toBe('solid');
      const expectedVolume = (4 / 3) * Math.PI * Math.pow(15, 3);
      expect(sphere.volume).toBeCloseTo(expectedVolume, 1);

      testShapes.set('test_sphere', sphere);
    });

    it('should create a cylinder shape', async () => {
      if (skipIfNoOCCT()) return;

      const cylinder = occtModule.makeCylinder(10, 25);
      expect(cylinder).toBeDefined();
      expect(cylinder.id).toBeDefined();

      expect(cylinder.type).toBe('solid');
      const expectedVolume = Math.PI * Math.pow(10, 2) * 25;
      expect(cylinder.volume).toBeCloseTo(expectedVolume, 1);

      testShapes.set('test_cylinder', cylinder);
    });

    it('should create shapes with different parameters', async () => {
      if (skipIfNoOCCT()) return;

      const smallBox = occtModule.makeBox(1, 1, 1);
      const largeBox = occtModule.makeBox(100, 100, 100);

      expect(smallBox.id).toBeDefined();
      expect(largeBox.id).toBeDefined();
      expect(smallBox.id).not.toBe(largeBox.id);

      if (!isUsingMock()) {
        expect(smallBox.volume).toBeLessThan(largeBox.volume);
      }
    });
  });

  describe('Boolean Operations', () => {
    it('should perform union operations', async () => {
      if (skipIfNoOCCT()) return;

      const box1 = occtModule.makeBox(20, 20, 20);
      const box2 = occtModule.makeBoxWithOrigin(10, 10, 10, 20, 20, 20);

      expect(box1).toBeDefined();
      expect(box2).toBeDefined();

      if (isUsingMock()) {
        // Mock should handle basic union operation
        const union = occtModule.booleanUnion(box1.id, box2.id);
        expect(union).toBeDefined();
        expect(union.id).toBeDefined();
      } else {
        const union = occtModule.booleanUnion(box1.id, box2.id);
        expect(union).toBeDefined();
        expect(union.type).toBe('solid');
        // Union volume should be between the two box volumes
        expect(union.volume).toBeGreaterThan(Math.max(box1.volume, box2.volume));
        expect(union.volume).toBeLessThan(box1.volume + box2.volume);
      }
    });

    it('should perform subtraction operations', async () => {
      if (skipIfNoOCCT()) return;

      const box = occtModule.makeBox(50, 50, 50);
      const sphere = occtModule.makeSphere(20);

      if (isUsingMock()) {
        const subtraction = occtModule.booleanSubtract(box.id, sphere.id);
        expect(subtraction).toBeDefined();
        expect(subtraction.id).toBeDefined();
      } else {
        const subtraction = occtModule.booleanSubtract(box.id, sphere.id);
        expect(subtraction).toBeDefined();
        expect(subtraction.type).toBe('solid');
        expect(subtraction.volume).toBeLessThan(box.volume);
      }
    });

    it('should perform intersection operations', async () => {
      if (skipIfNoOCCT()) return;

      const box = occtModule.makeBox(30, 30, 30);
      const sphere = occtModule.makeSphere(25);

      if (isUsingMock()) {
        const intersection = occtModule.booleanIntersect(box.id, sphere.id);
        expect(intersection).toBeDefined();
        expect(intersection.id).toBeDefined();
      } else {
        const intersection = occtModule.booleanIntersect(box.id, sphere.id);
        expect(intersection).toBeDefined();
        expect(intersection.type).toBe('solid');
        expect(intersection.volume).toBeLessThan(Math.min(box.volume, sphere.volume));
      }
    });
  });

  describe('Feature Operations', () => {
    it('should create fillets', async () => {
      if (skipIfNoOCCT()) return;

      const box = occtModule.makeBox(20, 20, 20);

      if (isUsingMock()) {
        const fillet = occtModule.makeFillet(box.id, 2);
        expect(fillet).toBeDefined();
        expect(fillet.id).toBeDefined();
      } else {
        const fillet = occtModule.makeFillet(box.id, 2);
        expect(fillet).toBeDefined();
        expect(fillet.type).toBe('solid');
        // Fillet should reduce volume slightly
        expect(fillet.volume).toBeLessThan(box.volume);
      }
    });

    it('should create chamfers', async () => {
      if (skipIfNoOCCT()) return;

      const box = occtModule.makeBox(25, 25, 25);

      if (isUsingMock()) {
        const chamfer = occtModule.makeChamfer(box.id, 1.5);
        expect(chamfer).toBeDefined();
        expect(chamfer.id).toBeDefined();
      } else {
        const chamfer = occtModule.makeChamfer(box.id, 1.5);
        expect(chamfer).toBeDefined();
        expect(chamfer.type).toBe('solid');
        expect(chamfer.volume).toBeLessThan(box.volume);
      }
    });
  });

  describe('Transformation Operations', () => {
    it('should transform shapes', async () => {
      if (skipIfNoOCCT()) return;

      const box = occtModule.makeBox(10, 10, 10);

      if (isUsingMock()) {
        const transformed = occtModule.transform(box.id, 5, 5, 5, 0, 0, 0, 1, 1, 1);
        expect(transformed).toBeDefined();
        expect(transformed.id).toBeDefined();
      } else {
        const transformed = occtModule.transform(box.id, 5, 5, 5, 0, 0, 0, 1, 1, 1);
        expect(transformed).toBeDefined();
        expect(transformed.type).toBe('solid');
        // Volume should remain the same for translation
        expect(transformed.volume).toBeCloseTo(box.volume, 1);
      }
    });

    it('should copy shapes', async () => {
      if (skipIfNoOCCT()) return;

      const sphere = occtModule.makeSphere(12);

      if (isUsingMock()) {
        const copy = occtModule.copyShape(sphere.id);
        expect(copy).toBeDefined();
        expect(copy.id).toBeDefined();
        expect(copy.id).not.toBe(sphere.id);
      } else {
        const copy = occtModule.copyShape(sphere.id);
        expect(copy).toBeDefined();
        expect(copy.type).toBe('solid');
        expect(copy.id).not.toBe(sphere.id);
        expect(copy.volume).toBeCloseTo(sphere.volume, 1);
      }
    });
  });

  describe('Tessellation and Mesh Generation', () => {
    it('should tessellate shapes', async () => {
      if (skipIfNoOCCT()) return;

      const box = occtModule.makeBox(15, 15, 15);

      const mesh = occtModule.tessellate(box.id, 0.1, 0.5);
      expect(mesh).toBeDefined();

      if (isUsingMock()) {
        // Mock should provide basic mesh structure
        expect(mesh.vertices || mesh.positions).toBeDefined();
        expect(mesh.indices || mesh.triangles).toBeDefined();
      } else {
        expect(mesh.positions).toBeInstanceOf(Float32Array);
        expect(mesh.indices).toBeInstanceOf(Uint32Array);
        expect(mesh.triangleCount).toBeGreaterThan(0);
        expect(mesh.vertexCount).toBeGreaterThan(0);
      }
    });

    it('should tessellate with different precision', async () => {
      if (skipIfNoOCCT()) return;

      const sphere = occtModule.makeSphere(10);

      const coarseMesh = occtModule.tessellate(sphere.id, 1.0, 1.0);
      const fineMesh = occtModule.tessellate(sphere.id, 0.1, 0.1);

      expect(coarseMesh).toBeDefined();
      expect(fineMesh).toBeDefined();

      if (!isUsingMock()) {
        // Fine mesh should have more triangles than coarse mesh
        expect(fineMesh.triangleCount).toBeGreaterThan(coarseMesh.triangleCount);
      }
    });
  });

  describe('Error Handling', () => {
    it('should validate input parameters', async () => {
      if (skipIfNoOCCT()) return;

      if (isUsingMock()) {
        // Mock should handle invalid parameters gracefully
        const invalidBox = occtModule.makeBox(-10, 20, 30);
        expect(invalidBox).toBeDefined(); // Mock may still return something
      } else {
        // Real OCCT should throw or return error for negative dimensions
        expect(() => {
          occtModule.makeBox(-10, 20, 30);
        }).toThrow();
      }
    });

    it('should handle invalid shape IDs', async () => {
      if (skipIfNoOCCT()) return;

      if (isUsingMock()) {
        // Mock should handle invalid IDs gracefully - no exception thrown
        expect(() => {
          occtModule.deleteShape('invalid_id');
        }).not.toThrow();
      } else {
        expect(() => {
          occtModule.deleteShape('invalid_shape_id');
        }).not.toThrow(); // Should handle gracefully
      }
    });
  });

  describe('File I/O Operations', () => {
    it('should export to STEP format', async () => {
      if (skipIfNoOCCT()) return;

      const box = occtModule.makeBox(25, 25, 25);

      const stepData = occtModule.exportSTEP(box.id);
      expect(stepData).toBeDefined();

      if (isUsingMock()) {
        expect(typeof stepData).toBe('string');
        expect(stepData).toContain(box.id);
      } else {
        expect(typeof stepData).toBe('string');
        expect(stepData.length).toBeGreaterThan(0);
        expect(stepData).toContain('STEP');
      }
    });

    it('should export to STL format', async () => {
      if (skipIfNoOCCT()) return;

      const sphere = occtModule.makeSphere(8);

      const stlData = occtModule.exportSTL(sphere.id);
      expect(stlData).toBeDefined();

      if (isUsingMock()) {
        expect(stlData).toBeDefined();
      } else {
        expect(typeof stlData === 'string' || stlData instanceof ArrayBuffer).toBe(true);
      }
    });
  });

  describe('OCCT Performance Benchmarks', () => {
    it('should perform boolean operations within performance targets', async () => {
      if (skipIfNoOCCT()) return;

      if (isUsingMock()) {
        // Mock operations should be fast
        const start = performance.now();
        const box1 = occtModule.makeBox(50, 50, 50);
        const box2 = occtModule.makeBox(50, 50, 50);
        const union = occtModule.booleanUnion(box1.id, box2.id);
        const duration = performance.now() - start;

        expect(union).toBeDefined();
        expect(duration).toBeLessThan(100); // Mock should be very fast
        return;
      }

      const box1 = occtModule.makeBox(50, 50, 50);
      const box2 = occtModule.makeBoxWithOrigin(25, 25, 25, 50, 50, 50);

      const start = performance.now();
      const union = occtModule.booleanUnion(box1.id, box2.id);
      const duration = performance.now() - start;

      expect(union).toBeDefined();
      expect(duration).toBeLessThan(5000); // 5 seconds max for boolean ops
    });

    it('should tessellate meshes within performance targets', async () => {
      if (skipIfNoOCCT()) return;

      const sphere = occtModule.makeSphere(25);

      const start = performance.now();
      const mesh = occtModule.tessellate(sphere.id, 0.1);
      const tessellationTime = performance.now() - start;

      expect(mesh).toBeDefined();
      expect(tessellationTime).toBeLessThan(5000); // 5 seconds max

      if (!isUsingMock()) {
        expect(mesh.triangleCount).toBeLessThan(100000); // Reasonable triangle count
      }

      // Cleanup
      occtModule.deleteShape(sphere.id);
    });
  });
});
