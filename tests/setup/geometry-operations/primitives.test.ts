/**
 * Primitive Geometry Operations Test Suite
 * Comprehensive testing of all primitive creation functions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeometryAPI } from '@sim4d/engine-occt';
import {
  setupWASMTestEnvironment,
  GeometryPerformanceTracker,
  GeometryTestDataGenerator,
} from '../wasm-test-setup';

describe('Primitive Geometry Operations', () => {
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

  describe('Box Creation', () => {
    it('should create a basic box with positive dimensions', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 50,
        depth: 25,
      });

      expect(box).toBeDefined();
      expect(box.id).toMatch(/^shape-\d+$/);
      expect(box.type).toBe('solid');
      expect(box.volume).toBeGreaterThan(0);
      expect(box.bbox_max_x).toBe(100);
      expect(box.bbox_max_y).toBe(50);
      expect(box.bbox_max_z).toBe(25);
    });

    it('should create a box with origin offset', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX_WITH_ORIGIN', {
        x: 10,
        y: 20,
        z: 30,
        width: 100,
        height: 50,
        depth: 25,
      });

      expect(box).toBeDefined();
      expect(box.bbox_min_x).toBe(10);
      expect(box.bbox_min_y).toBe(20);
      expect(box.bbox_min_z).toBe(30);
      expect(box.centerX).toBe(60); // 10 + 100/2
      expect(box.centerY).toBe(45); // 20 + 50/2
      expect(box.centerZ).toBe(42.5); // 30 + 25/2
    });

    it('should handle edge cases for box dimensions', async () => {
      await geometryAPI.init();

      // Very small box
      const smallBox = await geometryAPI.invoke('MAKE_BOX', {
        width: 0.001,
        height: 0.001,
        depth: 0.001,
      });
      expect(smallBox.volume).toBeCloseTo(0.000000001, 10);

      // Very large box
      const largeBox = await geometryAPI.invoke('MAKE_BOX', {
        width: 10000,
        height: 10000,
        depth: 10000,
      });
      expect(largeBox.volume).toBe(1000000000000);
    });

    it('should validate box parameters', async () => {
      await geometryAPI.init();

      // Test zero dimensions
      await expect(
        geometryAPI.invoke('MAKE_BOX', {
          width: 0,
          height: 50,
          depth: 25,
        })
      ).rejects.toThrow();

      // Test negative dimensions
      await expect(
        geometryAPI.invoke('MAKE_BOX', {
          width: -100,
          height: 50,
          depth: 25,
        })
      ).rejects.toThrow();
    });

    it('should meet performance targets for box creation', async () => {
      await geometryAPI.init();

      const endMeasurement = GeometryPerformanceTracker.startMeasurement('BOX_CREATION');

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 50,
        depth: 25,
      });

      const duration = endMeasurement();
      expect(duration).toBeLessThan(50); // 50ms target
      expect(box).toBeDefined();
    });
  });

  describe('Sphere Creation', () => {
    it('should create a basic sphere with positive radius', async () => {
      await geometryAPI.init();

      const sphere = await geometryAPI.invoke('MAKE_SPHERE', {
        radius: 25,
      });

      expect(sphere).toBeDefined();
      expect(sphere.type).toBe('solid');
      expect(sphere.volume).toBeCloseTo((4 / 3) * Math.PI * Math.pow(25, 3), 1);
      expect(sphere.bbox_min_x).toBe(-25);
      expect(sphere.bbox_max_x).toBe(25);
    });

    it('should create a sphere with center offset', async () => {
      await geometryAPI.init();

      const sphere = await geometryAPI.invoke('MAKE_SPHERE_WITH_CENTER', {
        centerX: 100,
        centerY: 200,
        centerZ: 300,
        radius: 50,
      });

      expect(sphere).toBeDefined();
      expect(sphere.centerX).toBe(100);
      expect(sphere.centerY).toBe(200);
      expect(sphere.centerZ).toBe(300);
      expect(sphere.bbox_min_x).toBe(50); // 100 - 50
      expect(sphere.bbox_max_x).toBe(150); // 100 + 50
    });

    it('should handle radius edge cases', async () => {
      await geometryAPI.init();

      // Very small sphere
      const smallSphere = await geometryAPI.invoke('MAKE_SPHERE', {
        radius: 0.001,
      });
      expect(smallSphere.volume).toBeCloseTo((4 / 3) * Math.PI * Math.pow(0.001, 3), 12);

      // Large sphere
      const largeSphere = await geometryAPI.invoke('MAKE_SPHERE', {
        radius: 1000,
      });
      expect(largeSphere.volume).toBeCloseTo((4 / 3) * Math.PI * Math.pow(1000, 3), 1);
    });

    it('should validate sphere parameters', async () => {
      await geometryAPI.init();

      // Zero radius
      await expect(
        geometryAPI.invoke('MAKE_SPHERE', {
          radius: 0,
        })
      ).rejects.toThrow();

      // Negative radius
      await expect(
        geometryAPI.invoke('MAKE_SPHERE', {
          radius: -25,
        })
      ).rejects.toThrow();
    });
  });

  describe('Cylinder Creation', () => {
    it('should create a basic cylinder', async () => {
      await geometryAPI.init();

      const cylinder = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 25,
        height: 100,
      });

      expect(cylinder).toBeDefined();
      expect(cylinder.type).toBe('solid');
      expect(cylinder.volume).toBeCloseTo(Math.PI * Math.pow(25, 2) * 100, 1);
      expect(cylinder.bbox_min_z).toBe(0);
      expect(cylinder.bbox_max_z).toBe(100);
      expect(cylinder.centerZ).toBe(50);
    });

    it('should handle cylinder edge cases', async () => {
      await geometryAPI.init();

      // Very thin cylinder
      const thinCylinder = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 0.1,
        height: 1000,
      });
      expect(thinCylinder.volume).toBeCloseTo(Math.PI * 0.01 * 1000, 3);

      // Very wide, short cylinder
      const wideCylinder = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 1000,
        height: 0.1,
      });
      expect(wideCylinder.volume).toBeCloseTo(Math.PI * 1000000 * 0.1, 1);
    });

    it('should validate cylinder parameters', async () => {
      await geometryAPI.init();

      // Zero radius
      await expect(
        geometryAPI.invoke('MAKE_CYLINDER', {
          radius: 0,
          height: 100,
        })
      ).rejects.toThrow();

      // Zero height
      await expect(
        geometryAPI.invoke('MAKE_CYLINDER', {
          radius: 25,
          height: 0,
        })
      ).rejects.toThrow();

      // Negative values
      await expect(
        geometryAPI.invoke('MAKE_CYLINDER', {
          radius: -25,
          height: 100,
        })
      ).rejects.toThrow();
    });
  });

  describe('Cone Creation', () => {
    it('should create a basic cone', async () => {
      await geometryAPI.init();

      const cone = await geometryAPI.invoke('MAKE_CONE', {
        radius1: 50,
        radius2: 25,
        height: 100,
      });

      expect(cone).toBeDefined();
      expect(cone.type).toBe('solid');

      // Volume formula: π * h * (r1² + r1*r2 + r2²) / 3
      const expectedVolume = (Math.PI * 100 * (50 * 50 + 50 * 25 + 25 * 25)) / 3;
      expect(cone.volume).toBeCloseTo(expectedVolume, 1);
    });

    it('should create a cylinder when radii are equal', async () => {
      await geometryAPI.init();

      const cone = await geometryAPI.invoke('MAKE_CONE', {
        radius1: 25,
        radius2: 25,
        height: 100,
      });

      // Should behave like a cylinder
      expect(cone.volume).toBeCloseTo(Math.PI * 25 * 25 * 100, 1);
    });

    it('should handle degenerate cone (one radius zero)', async () => {
      await geometryAPI.init();

      const cone = await geometryAPI.invoke('MAKE_CONE', {
        radius1: 50,
        radius2: 0,
        height: 100,
      });

      // True cone volume: π * r² * h / 3
      const expectedVolume = (Math.PI * 50 * 50 * 100) / 3;
      expect(cone.volume).toBeCloseTo(expectedVolume, 1);
    });
  });

  describe('Torus Creation', () => {
    it('should create a basic torus', async () => {
      await geometryAPI.init();

      const torus = await geometryAPI.invoke('MAKE_TORUS', {
        majorRadius: 50,
        minorRadius: 10,
      });

      expect(torus).toBeDefined();
      expect(torus.type).toBe('solid');

      // Volume formula: 2π² * R * r²
      const expectedVolume = 2 * Math.PI * Math.PI * 50 * 10 * 10;
      expect(torus.volume).toBeCloseTo(expectedVolume, 1);
    });

    it('should validate torus parameters', async () => {
      await geometryAPI.init();

      // Minor radius larger than major radius (should work but be unusual)
      const torus = await geometryAPI.invoke('MAKE_TORUS', {
        majorRadius: 10,
        minorRadius: 50,
      });
      expect(torus).toBeDefined();

      // Zero radii
      await expect(
        geometryAPI.invoke('MAKE_TORUS', {
          majorRadius: 0,
          minorRadius: 10,
        })
      ).rejects.toThrow();

      await expect(
        geometryAPI.invoke('MAKE_TORUS', {
          majorRadius: 50,
          minorRadius: 0,
        })
      ).rejects.toThrow();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance targets for all primitives', async () => {
      await geometryAPI.init();

      const targets = {
        MAKE_BOX: 50, // ms
        MAKE_SPHERE: 50, // ms
        MAKE_CYLINDER: 50, // ms
        MAKE_CONE: 75, // ms (more complex)
        MAKE_TORUS: 75, // ms (more complex)
      };

      for (const [operation, targetTime] of Object.entries(targets)) {
        const endMeasurement = GeometryPerformanceTracker.startMeasurement(operation);

        let result;
        switch (operation) {
          case 'MAKE_BOX':
            result = await geometryAPI.invoke(operation, { width: 100, height: 50, depth: 25 });
            break;
          case 'MAKE_SPHERE':
            result = await geometryAPI.invoke(operation, { radius: 25 });
            break;
          case 'MAKE_CYLINDER':
            result = await geometryAPI.invoke(operation, { radius: 25, height: 100 });
            break;
          case 'MAKE_CONE':
            result = await geometryAPI.invoke(operation, { radius1: 50, radius2: 25, height: 100 });
            break;
          case 'MAKE_TORUS':
            result = await geometryAPI.invoke(operation, { majorRadius: 50, minorRadius: 10 });
            break;
        }

        const duration = endMeasurement();
        expect(duration).toBeLessThan(targetTime);
        expect(result).toBeDefined();
      }
    });

    it('should handle concurrent primitive creation', async () => {
      await geometryAPI.init();

      const createRandomPrimitives = async (count: number) => {
        const promises = [];
        for (let i = 0; i < count; i++) {
          const boxParams = GeometryTestDataGenerator.generateRandomBoxParams();
          promises.push(geometryAPI.invoke('MAKE_BOX', boxParams));
        }
        return Promise.all(promises);
      };

      const startTime = performance.now();
      const results = await createRandomPrimitives(10);
      const endTime = performance.now();

      expect(results).toHaveLength(10);
      expect(results.every((r) => r && r.id)).toBe(true);
      expect(endTime - startTime).toBeLessThan(500); // 50ms per operation * 10
    });
  });

  describe('Memory Management', () => {
    it('should properly track created shapes', async () => {
      await geometryAPI.init();

      const initialCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});

      const box = await geometryAPI.invoke('MAKE_BOX', { width: 100, height: 50, depth: 25 });
      const sphere = await geometryAPI.invoke('MAKE_SPHERE', { radius: 25 });

      const currentCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(currentCount).toBe(initialCount + 2);

      await geometryAPI.invoke('DELETE_SHAPE', { shapeId: box.id });
      const afterDeleteCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(afterDeleteCount).toBe(initialCount + 1);
    });

    it('should handle shape cleanup', async () => {
      await geometryAPI.init();

      // Create multiple shapes
      await geometryAPI.invoke('MAKE_BOX', { width: 100, height: 50, depth: 25 });
      await geometryAPI.invoke('MAKE_SPHERE', { radius: 25 });
      await geometryAPI.invoke('MAKE_CYLINDER', { radius: 15, height: 75 });

      const beforeClearCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(beforeClearCount).toBeGreaterThan(0);

      await geometryAPI.invoke('CLEAR_ALL_SHAPES', {});
      const afterClearCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(afterClearCount).toBe(0);
    });
  });
});
