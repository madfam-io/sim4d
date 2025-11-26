/**
 * Transformation Operations Test Suite
 * Comprehensive testing of translate, rotate, scale, and advanced transformations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeometryAPI } from '@sim4d/engine-occt';
import { setupWASMTestEnvironment, GeometryPerformanceTracker } from '../wasm-test-setup';
import type { ShapeHandle } from '@sim4d/engine-occt/src/occt-bindings';

describe('Transformation Operations', () => {
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

  describe('Translation Operations', () => {
    it('should translate a box to a new position', async () => {
      await geometryAPI.init();

      const originalBox = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 50,
        depth: 25,
      });

      const translatedBox = await geometryAPI.invoke('TRANSFORM', {
        shape: originalBox,
        tx: 100,
        ty: 50,
        tz: 25,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      expect(translatedBox).toBeDefined();
      expect(translatedBox.type).toBe('solid');
      expect(translatedBox.volume).toBeCloseTo(originalBox.volume, 1);
      expect(translatedBox.centerX).toBe(originalBox.centerX + 100);
      expect(translatedBox.centerY).toBe(originalBox.centerY + 50);
      expect(translatedBox.centerZ).toBe(originalBox.centerZ + 25);
    });

    it('should handle negative translation values', async () => {
      await geometryAPI.init();

      const sphere = await geometryAPI.invoke('MAKE_SPHERE_WITH_CENTER', {
        centerX: 100,
        centerY: 100,
        centerZ: 100,
        radius: 25,
      });

      const translated = await geometryAPI.invoke('TRANSFORM', {
        shape: sphere,
        tx: -50,
        ty: -75,
        tz: -100,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      expect(translated.centerX).toBe(50); // 100 - 50
      expect(translated.centerY).toBe(25); // 100 - 75
      expect(translated.centerZ).toBe(0); // 100 - 100
    });

    it('should preserve shape properties during translation', async () => {
      await geometryAPI.init();

      const cylinder = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 30,
        height: 100,
      });

      const translated = await geometryAPI.invoke('TRANSFORM', {
        shape: cylinder,
        tx: 200,
        ty: 300,
        tz: 400,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      expect(translated.volume).toBeCloseTo(cylinder.volume, 1);
      expect(translated.type).toBe(cylinder.type);
      // Dimensions should be preserved
      const originalHeight = cylinder.bbox_max_z - cylinder.bbox_min_z;
      const translatedHeight = translated.bbox_max_z - translated.bbox_min_z;
      expect(translatedHeight).toBeCloseTo(originalHeight, 1);
    });
  });

  describe('Scaling Operations', () => {
    it('should uniformly scale a shape', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 50,
        depth: 25,
      });

      const scaled = await geometryAPI.invoke('TRANSFORM', {
        shape: box,
        tx: 0,
        ty: 0,
        tz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 2,
        sy: 2,
        sz: 2,
      });

      expect(scaled).toBeDefined();
      expect(scaled.volume).toBeCloseTo(box.volume * 8, 1); // 2³ = 8
      expect(scaled.centerX).toBe(box.centerX);
      expect(scaled.centerY).toBe(box.centerY);
      expect(scaled.centerZ).toBe(box.centerZ);
    });

    it('should handle non-uniform scaling', async () => {
      await geometryAPI.init();

      const sphere = await geometryAPI.invoke('MAKE_SPHERE', {
        radius: 50,
      });

      const scaled = await geometryAPI.invoke('TRANSFORM', {
        shape: sphere,
        tx: 0,
        ty: 0,
        tz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 2,
        sy: 1,
        sz: 0.5,
      });

      expect(scaled).toBeDefined();
      expect(scaled.volume).toBeCloseTo(sphere.volume * 1, 1); // 2 * 1 * 0.5 = 1
    });

    it('should handle scaling down', async () => {
      await geometryAPI.init();

      const torus = await geometryAPI.invoke('MAKE_TORUS', {
        majorRadius: 100,
        minorRadius: 20,
      });

      const scaled = await geometryAPI.invoke('TRANSFORM', {
        shape: torus,
        tx: 0,
        ty: 0,
        tz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 0.5,
        sy: 0.5,
        sz: 0.5,
      });

      expect(scaled.volume).toBeCloseTo(torus.volume * 0.125, 1); // 0.5³ = 0.125
    });

    it('should validate scaling parameters', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 50,
        depth: 25,
      });

      // Zero scaling should be handled appropriately
      await expect(
        geometryAPI.invoke('TRANSFORM', {
          shape: box,
          tx: 0,
          ty: 0,
          tz: 0,
          rx: 0,
          ry: 0,
          rz: 0,
          sx: 0,
          sy: 1,
          sz: 1,
        })
      ).rejects.toThrow();

      // Negative scaling should be handled
      const negativeScaled = await geometryAPI.invoke('TRANSFORM', {
        shape: box,
        tx: 0,
        ty: 0,
        tz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: -1,
        sy: 1,
        sz: 1,
      });

      expect(negativeScaled).toBeDefined();
      expect(Math.abs(negativeScaled.volume)).toBeCloseTo(box.volume, 1);
    });
  });

  describe('Rotation Operations', () => {
    it('should rotate shape around axes', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX_WITH_ORIGIN', {
        x: 50,
        y: 0,
        z: 0,
        width: 100,
        height: 50,
        depth: 25,
      });

      // 90-degree rotation around Z-axis (π/2 radians)
      const rotated = await geometryAPI.invoke('TRANSFORM', {
        shape: box,
        tx: 0,
        ty: 0,
        tz: 0,
        rx: 0,
        ry: 0,
        rz: Math.PI / 2,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      expect(rotated).toBeDefined();
      expect(rotated.volume).toBeCloseTo(box.volume, 1);
      // After 90° rotation around Z, X and Y should be swapped
    });

    it('should handle multiple axis rotations', async () => {
      await geometryAPI.init();

      const cylinder = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 25,
        height: 100,
      });

      // Rotate around X and Y axes
      const rotated = await geometryAPI.invoke('TRANSFORM', {
        shape: cylinder,
        tx: 0,
        ty: 0,
        tz: 0,
        rx: Math.PI / 4,
        ry: Math.PI / 6,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      expect(rotated).toBeDefined();
      expect(rotated.volume).toBeCloseTo(cylinder.volume, 1);
    });

    it('should preserve volume during rotation', async () => {
      await geometryAPI.init();

      const cone = await geometryAPI.invoke('MAKE_CONE', {
        radius1: 50,
        radius2: 25,
        height: 100,
      });

      const rotated = await geometryAPI.invoke('TRANSFORM', {
        shape: cone,
        tx: 0,
        ty: 0,
        tz: 0,
        rx: Math.PI,
        ry: Math.PI / 2,
        rz: Math.PI / 3,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      expect(rotated.volume).toBeCloseTo(cone.volume, 1);
    });
  });

  describe('Combined Transformations', () => {
    it('should apply translation, rotation, and scaling together', async () => {
      await geometryAPI.init();

      const sphere = await geometryAPI.invoke('MAKE_SPHERE', {
        radius: 25,
      });

      const transformed = await geometryAPI.invoke('TRANSFORM', {
        shape: sphere,
        tx: 100,
        ty: 50,
        tz: 25,
        rx: Math.PI / 4,
        ry: 0,
        rz: Math.PI / 6,
        sx: 2,
        sy: 1.5,
        sz: 0.8,
      });

      expect(transformed).toBeDefined();
      expect(transformed.centerX).toBe(sphere.centerX + 100);
      expect(transformed.centerY).toBe(sphere.centerY + 50);
      expect(transformed.centerZ).toBe(sphere.centerZ + 25);
      expect(transformed.volume).toBeCloseTo(sphere.volume * 2.4, 1); // 2 * 1.5 * 0.8
    });

    it('should handle complex transformation chains', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 50,
        height: 50,
        depth: 50,
      });

      // First transformation: translate and scale
      const step1 = await geometryAPI.invoke('TRANSFORM', {
        shape: box,
        tx: 50,
        ty: 0,
        tz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 2,
        sy: 2,
        sz: 2,
      });

      // Second transformation: rotate the result
      const step2 = await geometryAPI.invoke('TRANSFORM', {
        shape: step1,
        tx: 0,
        ty: 0,
        tz: 0,
        rx: 0,
        ry: 0,
        rz: Math.PI / 2,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      expect(step2).toBeDefined();
      expect(step2.volume).toBeCloseTo(box.volume * 8, 1); // Only scaling affects volume
    });
  });

  describe('Shape Copying', () => {
    it('should create exact copy of a shape', async () => {
      await geometryAPI.init();

      const original = await geometryAPI.invoke('MAKE_TORUS', {
        majorRadius: 50,
        minorRadius: 15,
      });

      const copy = await geometryAPI.invoke('COPY_SHAPE', {
        shape: original,
      });

      expect(copy).toBeDefined();
      expect(copy.id).not.toBe(original.id); // Different ID
      expect(copy.type).toBe(original.type);
      expect(copy.volume).toBeCloseTo(original.volume, 1);
      expect(copy.centerX).toBeCloseTo(original.centerX, 1);
      expect(copy.centerY).toBeCloseTo(original.centerY, 1);
      expect(copy.centerZ).toBeCloseTo(original.centerZ, 1);
    });

    it('should allow independent modification of copies', async () => {
      await geometryAPI.init();

      const original = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 50,
        depth: 25,
      });

      const copy = await geometryAPI.invoke('COPY_SHAPE', {
        shape: original,
      });

      // Transform the copy
      const transformedCopy = await geometryAPI.invoke('TRANSFORM', {
        shape: copy,
        tx: 200,
        ty: 0,
        tz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      // Original should be unchanged
      expect(original.centerX).toBe(50); // Original center
      expect(transformedCopy.centerX).toBe(250); // 50 + 200
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid transformation parameters', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 50,
        depth: 25,
      });

      // Invalid shape reference
      await expect(
        geometryAPI.invoke('TRANSFORM', {
          shape: { id: 'invalid', type: 'solid' } as ShapeHandle,
          tx: 0,
          ty: 0,
          tz: 0,
          rx: 0,
          ry: 0,
          rz: 0,
          sx: 1,
          sy: 1,
          sz: 1,
        })
      ).rejects.toThrow();

      // Invalid transformation parameters
      await expect(
        geometryAPI.invoke('TRANSFORM', {
          shape: box,
          tx: NaN,
          ty: 0,
          tz: 0,
          rx: 0,
          ry: 0,
          rz: 0,
          sx: 1,
          sy: 1,
          sz: 1,
        })
      ).rejects.toThrow();
    });

    it('should validate copy operation parameters', async () => {
      await geometryAPI.init();

      await expect(
        geometryAPI.invoke('COPY_SHAPE', {
          shape: null as any,
        })
      ).rejects.toThrow();

      await expect(
        geometryAPI.invoke('COPY_SHAPE', {
          shape: { id: 'invalid', type: 'solid' } as ShapeHandle,
        })
      ).rejects.toThrow();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance targets for transformations', async () => {
      await geometryAPI.init();

      const targets = {
        simple_transform: 25, // ms - translation only
        complex_transform: 50, // ms - combined operations
        copy_operation: 15, // ms - shape copying
      };

      // Simple transform (translation only)
      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 50,
        depth: 25,
      });

      let endMeasurement = GeometryPerformanceTracker.startMeasurement('simple_transform');
      await geometryAPI.invoke('TRANSFORM', {
        shape: box,
        tx: 100,
        ty: 50,
        tz: 25,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });
      let duration = endMeasurement();
      expect(duration).toBeLessThan(targets.simple_transform);

      // Complex transform
      endMeasurement = GeometryPerformanceTracker.startMeasurement('complex_transform');
      await geometryAPI.invoke('TRANSFORM', {
        shape: box,
        tx: 100,
        ty: 50,
        tz: 25,
        rx: Math.PI / 4,
        ry: Math.PI / 6,
        rz: Math.PI / 3,
        sx: 2,
        sy: 1.5,
        sz: 0.8,
      });
      duration = endMeasurement();
      expect(duration).toBeLessThan(targets.complex_transform);

      // Copy operation
      endMeasurement = GeometryPerformanceTracker.startMeasurement('copy_operation');
      await geometryAPI.invoke('COPY_SHAPE', { shape: box });
      duration = endMeasurement();
      expect(duration).toBeLessThan(targets.copy_operation);
    });

    it('should handle batch transformation operations efficiently', async () => {
      await geometryAPI.init();

      const shapes = await Promise.all([
        geometryAPI.invoke('MAKE_BOX', { width: 50, height: 50, depth: 50 }),
        geometryAPI.invoke('MAKE_SPHERE', { radius: 25 }),
        geometryAPI.invoke('MAKE_CYLINDER', { radius: 20, height: 60 }),
        geometryAPI.invoke('MAKE_CONE', { radius1: 30, radius2: 15, height: 50 }),
        geometryAPI.invoke('MAKE_TORUS', { majorRadius: 40, minorRadius: 8 }),
      ]);

      const startTime = performance.now();
      const transformedShapes = await Promise.all(
        shapes.map((shape, index) =>
          geometryAPI.invoke('TRANSFORM', {
            shape,
            tx: index * 100,
            ty: 0,
            tz: 0,
            rx: 0,
            ry: 0,
            rz: (index * Math.PI) / 4,
            sx: 1 + index * 0.2,
            sy: 1,
            sz: 1,
          })
        )
      );
      const endTime = performance.now();

      expect(transformedShapes).toHaveLength(5);
      expect(transformedShapes.every((s) => s && s.id)).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // 5 transforms in < 200ms
    });
  });

  describe('Memory Management', () => {
    it('should properly track transformed shapes', async () => {
      await geometryAPI.init();

      const initialCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});

      const original = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 50,
        depth: 25,
      });

      const transformed = await geometryAPI.invoke('TRANSFORM', {
        shape: original,
        tx: 100,
        ty: 0,
        tz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 2,
        sy: 2,
        sz: 2,
      });

      const copy = await geometryAPI.invoke('COPY_SHAPE', {
        shape: original,
      });

      const currentCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(currentCount).toBe(initialCount + 3); // Original + transformed + copy

      // Clean up
      await geometryAPI.invoke('DELETE_SHAPE', { shapeId: original.id });
      await geometryAPI.invoke('DELETE_SHAPE', { shapeId: transformed.id });
      await geometryAPI.invoke('DELETE_SHAPE', { shapeId: copy.id });

      const finalCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(finalCount).toBe(initialCount);
    });
  });
});
