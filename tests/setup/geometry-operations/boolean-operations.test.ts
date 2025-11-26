/**
 * Boolean Operations Test Suite
 * Comprehensive testing of union, subtraction, and intersection operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeometryAPI } from '@sim4d/engine-occt';
import { setupWASMTestEnvironment, GeometryPerformanceTracker } from '../wasm-test-setup';
import type { ShapeHandle } from '@sim4d/engine-occt/src/occt-bindings';

describe('Boolean Operations', () => {
  let geometryAPI: GeometryAPI;
  let cleanup: () => void;

  beforeEach(async () => {
    const { cleanup: cleanupFn } = await setupWASMTestEnvironment();
    cleanup = cleanupFn;
    geometryAPI = new GeometryAPI();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Union Operations', () => {
    it('should perform basic union of two overlapping boxes', async () => {
      await geometryAPI.init();

      const box1 = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const box2 = await geometryAPI.invoke('MAKE_BOX_WITH_ORIGIN', {
        x: 50,
        y: 0,
        z: 0,
        width: 100,
        height: 100,
        depth: 100,
      });

      const union = await geometryAPI.invoke('BOOLEAN_UNION', {
        shape1: box1,
        shape2: box2,
      });

      expect(union).toBeDefined();
      expect(union.type).toBe('solid');
      expect(union.volume).toBeGreaterThan(box1.volume);
      expect(union.volume).toBeLessThan(box1.volume + box2.volume); // Some overlap
      expect(union.bbox_min_x).toBe(0);
      expect(union.bbox_max_x).toBe(150); // 50 + 100
    });

    it('should union non-overlapping shapes', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 50,
        height: 50,
        depth: 50,
      });

      const sphere = await geometryAPI.invoke('MAKE_SPHERE_WITH_CENTER', {
        centerX: 100,
        centerY: 0,
        centerZ: 0,
        radius: 25,
      });

      const union = await geometryAPI.invoke('BOOLEAN_UNION', {
        shape1: box,
        shape2: sphere,
      });

      expect(union).toBeDefined();
      expect(union.volume).toBeCloseTo(box.volume + sphere.volume, 1);
      expect(union.bbox_min_x).toBe(-25); // Box starts at 0, sphere at 75
      expect(union.bbox_max_x).toBe(125); // Sphere extends to 125
    });

    it('should handle union of identical shapes', async () => {
      await geometryAPI.init();

      const box1 = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const box2 = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const union = await geometryAPI.invoke('BOOLEAN_UNION', {
        shape1: box1,
        shape2: box2,
      });

      expect(union).toBeDefined();
      expect(union.volume).toBeCloseTo(box1.volume, 1); // Same volume as single box
    });
  });

  describe('Subtraction Operations', () => {
    it('should subtract sphere from box', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const sphere = await geometryAPI.invoke('MAKE_SPHERE', {
        radius: 30,
      });

      const result = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: box,
        shape2: sphere,
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('solid');
      expect(result.volume).toBeLessThan(box.volume);
      expect(result.volume).toBeGreaterThan(0);
      // Bounding box should still be the box
      expect(result.bbox_max_x).toBe(100);
      expect(result.bbox_max_y).toBe(100);
      expect(result.bbox_max_z).toBe(100);
    });

    it('should handle complete subtraction', async () => {
      await geometryAPI.init();

      const smallBox = await geometryAPI.invoke('MAKE_BOX', {
        width: 50,
        height: 50,
        depth: 50,
      });

      const largeBox = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const result = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: smallBox,
        shape2: largeBox,
      });

      expect(result).toBeDefined();
      expect(result.volume).toBe(0); // Complete subtraction
    });

    it('should handle non-overlapping subtraction', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 50,
        height: 50,
        depth: 50,
      });

      const sphere = await geometryAPI.invoke('MAKE_SPHERE_WITH_CENTER', {
        centerX: 100,
        centerY: 0,
        centerZ: 0,
        radius: 25,
      });

      const result = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: box,
        shape2: sphere,
      });

      expect(result).toBeDefined();
      expect(result.volume).toBeCloseTo(box.volume, 1); // No change
    });
  });

  describe('Intersection Operations', () => {
    it('should intersect two overlapping boxes', async () => {
      await geometryAPI.init();

      const box1 = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const box2 = await geometryAPI.invoke('MAKE_BOX_WITH_ORIGIN', {
        x: 50,
        y: 0,
        z: 0,
        width: 100,
        height: 100,
        depth: 100,
      });

      const intersection = await geometryAPI.invoke('BOOLEAN_INTERSECT', {
        shape1: box1,
        shape2: box2,
      });

      expect(intersection).toBeDefined();
      expect(intersection.type).toBe('solid');
      expect(intersection.volume).toBeGreaterThan(0);
      expect(intersection.volume).toBeLessThan(box1.volume);
      expect(intersection.bbox_min_x).toBe(50); // Intersection starts at overlap
      expect(intersection.bbox_max_x).toBe(100); // Box1 ends at 100
    });

    it('should handle box-sphere intersection', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const sphere = await geometryAPI.invoke('MAKE_SPHERE', {
        radius: 40,
      });

      const intersection = await geometryAPI.invoke('BOOLEAN_INTERSECT', {
        shape1: box,
        shape2: sphere,
      });

      expect(intersection).toBeDefined();
      expect(intersection.volume).toBeGreaterThan(0);
      expect(intersection.volume).toBeLessThan(sphere.volume);
      // Should be constrained by both shapes
      expect(intersection.bbox_min_x).toBeGreaterThanOrEqual(-40);
      expect(intersection.bbox_max_x).toBeLessThanOrEqual(40);
    });

    it('should handle non-overlapping intersection', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 50,
        height: 50,
        depth: 50,
      });

      const sphere = await geometryAPI.invoke('MAKE_SPHERE_WITH_CENTER', {
        centerX: 100,
        centerY: 0,
        centerZ: 0,
        radius: 25,
      });

      const intersection = await geometryAPI.invoke('BOOLEAN_INTERSECT', {
        shape1: box,
        shape2: sphere,
      });

      expect(intersection).toBeDefined();
      expect(intersection.volume).toBe(0); // No overlap
    });
  });

  describe('Complex Boolean Chains', () => {
    it('should handle multi-step boolean operations', async () => {
      await geometryAPI.init();

      // Create base box
      const base = await geometryAPI.invoke('MAKE_BOX', {
        width: 200,
        height: 100,
        depth: 50,
      });

      // Create hole cylinder
      const hole = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 20,
        height: 60,
      });

      // Subtract hole from base
      const withHole = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: base,
        shape2: hole,
      });

      // Add a feature sphere
      const feature = await geometryAPI.invoke('MAKE_SPHERE_WITH_CENTER', {
        centerX: 150,
        centerY: 0,
        centerZ: 25,
        radius: 30,
      });

      // Union with feature
      const final = await geometryAPI.invoke('BOOLEAN_UNION', {
        shape1: withHole,
        shape2: feature,
      });

      expect(final).toBeDefined();
      expect(final.volume).toBeGreaterThan(0);
      expect(final.volume).toBeLessThan(base.volume + feature.volume);
    });

    it('should handle boolean operations with different primitive types', async () => {
      await geometryAPI.init();

      // Box base
      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      // Cylinder feature
      const cylinder = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 30,
        height: 120,
      });

      // Torus detail
      const torus = await geometryAPI.invoke('MAKE_TORUS', {
        majorRadius: 40,
        minorRadius: 10,
      });

      // Complex operation: (box ∪ cylinder) - torus
      const intermediate = await geometryAPI.invoke('BOOLEAN_UNION', {
        shape1: box,
        shape2: cylinder,
      });

      const final = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: intermediate,
        shape2: torus,
      });

      expect(final).toBeDefined();
      expect(final.volume).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid shape references', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      await expect(
        geometryAPI.invoke('BOOLEAN_UNION', {
          shape1: box,
          shape2: { id: 'invalid-shape', type: 'solid' } as ShapeHandle,
        })
      ).rejects.toThrow();
    });

    it('should validate boolean operation parameters', async () => {
      await geometryAPI.init();

      await expect(
        geometryAPI.invoke('BOOLEAN_UNION', {
          shape1: null as any,
          shape2: null as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance targets for boolean operations', async () => {
      await geometryAPI.init();

      const targets = {
        BOOLEAN_UNION: 100, // ms
        BOOLEAN_SUBTRACT: 100, // ms
        BOOLEAN_INTERSECT: 150, // ms (more complex)
      };

      for (const [operation, targetTime] of Object.entries(targets)) {
        const endMeasurement = GeometryPerformanceTracker.startMeasurement(operation);

        const box1 = await geometryAPI.invoke('MAKE_BOX', {
          width: 100,
          height: 100,
          depth: 100,
        });

        const box2 = await geometryAPI.invoke('MAKE_BOX_WITH_ORIGIN', {
          x: 50,
          y: 0,
          z: 0,
          width: 100,
          height: 100,
          depth: 100,
        });

        await geometryAPI.invoke(operation as any, {
          shape1: box1,
          shape2: box2,
        });

        const duration = endMeasurement();
        expect(duration).toBeLessThan(targetTime);
      }
    });

    it('should handle concurrent boolean operations', async () => {
      await geometryAPI.init();

      const createAndUnion = async () => {
        const box1 = await geometryAPI.invoke('MAKE_BOX', {
          width: Math.random() * 50 + 25,
          height: Math.random() * 50 + 25,
          depth: Math.random() * 50 + 25,
        });

        const box2 = await geometryAPI.invoke('MAKE_BOX_WITH_ORIGIN', {
          x: Math.random() * 25,
          y: 0,
          z: 0,
          width: Math.random() * 50 + 25,
          height: Math.random() * 50 + 25,
          depth: Math.random() * 50 + 25,
        });

        return geometryAPI.invoke('BOOLEAN_UNION', {
          shape1: box1,
          shape2: box2,
        });
      };

      const startTime = performance.now();
      const results = await Promise.all([
        createAndUnion(),
        createAndUnion(),
        createAndUnion(),
        createAndUnion(),
        createAndUnion(),
      ]);
      const endTime = performance.now();

      expect(results).toHaveLength(5);
      expect(results.every((r) => r && r.id && r.volume > 0)).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // 5 operations in < 1s
    });
  });

  describe('Memory Management', () => {
    it('should properly clean up intermediate shapes', async () => {
      await geometryAPI.init();

      const initialCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});

      // Create shapes for boolean operations
      const box1 = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const box2 = await geometryAPI.invoke('MAKE_BOX_WITH_ORIGIN', {
        x: 50,
        y: 0,
        z: 0,
        width: 100,
        height: 100,
        depth: 100,
      });

      const union = await geometryAPI.invoke('BOOLEAN_UNION', {
        shape1: box1,
        shape2: box2,
      });

      const currentCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(currentCount).toBe(initialCount + 3); // Two inputs + result

      // Clean up
      await geometryAPI.invoke('DELETE_SHAPE', { shapeId: box1.id });
      await geometryAPI.invoke('DELETE_SHAPE', { shapeId: box2.id });
      await geometryAPI.invoke('DELETE_SHAPE', { shapeId: union.id });

      const finalCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(finalCount).toBe(initialCount);
    });
  });
});
