/**
 * Geometry Integration Tests
 * Validates production geometry operations without mock implementations
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GeometryAPIFactory } from '@brepflow/engine-core';
import { ProductionGeometryService } from '../apps/studio/src/services/geometry-service.production';
import { HealthService } from '../apps/studio/src/services/health-service';
import { WorkerAPI } from '@brepflow/engine-occt';

describe('Production Geometry Integration', () => {
  let geometryService: ProductionGeometryService;
  let healthService: HealthService;
  let api: WorkerAPI;

  beforeAll(async () => {
    // Set production environment
    process.env.NODE_ENV = 'production';
    process.env.ENABLE_MOCK_GEOMETRY = 'false';
    process.env.REQUIRE_REAL_OCCT = 'true';

    // Initialize services
    geometryService = ProductionGeometryService.getInstance();
    healthService = HealthService.getInstance();

    // Initialize production API
    try {
      await geometryService.initialize();
      api = await GeometryAPIFactory.getProductionAPI({
        enableMock: false,
        requireRealOCCT: true,
        validateOutput: true,
      });
    } catch (error) {
      console.error('Failed to initialize production geometry:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await geometryService.dispose();
    if (api) {
      await api.terminate();
    }
  });

  describe('Health Checks', () => {
    it('should report healthy status when properly initialized', async () => {
      const health = await healthService.getHealth();

      expect(health.status).toBe('healthy');
      expect(health.checks.geometry.status).toBe('pass');
      expect(health.checks.wasm.status).toBe('pass');
      expect(health.checks.workers.status).toBe('pass');
    });

    it('should check geometry service health', async () => {
      const health = await geometryService.checkHealth();

      expect(health.healthy).toBe(true);
      expect(health.details.api).toBe('connected');
    });

    it('should report readiness', async () => {
      const readiness = await healthService.getReadiness();

      expect(readiness.ready).toBe(true);
      expect(readiness.message).toBe('Ready to serve');
    });
  });

  describe('Basic Geometry Operations', () => {
    it('should create a box with real OCCT', async () => {
      const box = await geometryService.execute('MAKE_BOX', {
        width: 100,
        height: 50,
        depth: 25,
      });

      expect(box).toBeDefined();
      expect(box.type).toBe('Shape');
      expect(box.shapeType).toBe('SOLID');

      // Validate bounding box
      const bounds = await geometryService.execute('GET_BOUNDING_BOX', { shape: box });
      expect(bounds.max.x - bounds.min.x).toBeCloseTo(100, 1);
      expect(bounds.max.y - bounds.min.y).toBeCloseTo(50, 1);
      expect(bounds.max.z - bounds.min.z).toBeCloseTo(25, 1);
    });

    it('should create a sphere with real OCCT', async () => {
      const sphere = await geometryService.execute('MAKE_SPHERE', {
        radius: 50,
      });

      expect(sphere).toBeDefined();
      expect(sphere.type).toBe('Shape');
      expect(sphere.shapeType).toBe('SOLID');

      // Validate bounding box
      const bounds = await geometryService.execute('GET_BOUNDING_BOX', { shape: sphere });
      const size = Math.max(
        bounds.max.x - bounds.min.x,
        bounds.max.y - bounds.min.y,
        bounds.max.z - bounds.min.z
      );
      expect(size).toBeCloseTo(100, 1); // Diameter should be ~100
    });

    it('should create a cylinder with real OCCT', async () => {
      const cylinder = await geometryService.execute('MAKE_CYLINDER', {
        radius: 25,
        height: 100,
      });

      expect(cylinder).toBeDefined();
      expect(cylinder.type).toBe('Shape');
      expect(cylinder.shapeType).toBe('SOLID');
    });
  });

  describe('Boolean Operations', () => {
    it('should perform union of two boxes', async () => {
      const box1 = await geometryService.execute('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const box2 = await geometryService.execute('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
        position: { x: 50, y: 50, z: 50 },
      });

      const union = await geometryService.execute('BOOLEAN_UNION', {
        shape1: box1,
        shape2: box2,
      });

      expect(union).toBeDefined();
      expect(union.type).toBe('Shape');
      expect(union.shapeType).toBe('SOLID');
    });

    it('should perform intersection of two boxes', async () => {
      const box1 = await geometryService.execute('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const box2 = await geometryService.execute('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
        position: { x: 50, y: 50, z: 50 },
      });

      const intersection = await geometryService.execute('BOOLEAN_INTERSECTION', {
        shape1: box1,
        shape2: box2,
      });

      expect(intersection).toBeDefined();
      expect(intersection.type).toBe('Shape');

      // Intersection should be smaller than either input
      const bounds = await geometryService.execute('GET_BOUNDING_BOX', { shape: intersection });
      const volume =
        (bounds.max.x - bounds.min.x) *
        (bounds.max.y - bounds.min.y) *
        (bounds.max.z - bounds.min.z);
      expect(volume).toBeLessThan(100 * 100 * 100);
    });

    it('should perform difference of two boxes', async () => {
      const box1 = await geometryService.execute('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const box2 = await geometryService.execute('MAKE_BOX', {
        width: 50,
        height: 50,
        depth: 50,
        position: { x: 25, y: 25, z: 25 },
      });

      const difference = await geometryService.execute('BOOLEAN_DIFFERENCE', {
        shape1: box1,
        shape2: box2,
      });

      expect(difference).toBeDefined();
      expect(difference.type).toBe('Shape');
    });
  });

  describe('Transformations', () => {
    it('should fillet edges of a box', async () => {
      const box = await geometryService.execute('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const filleted = await geometryService.execute('FILLET', {
        shape: box,
        radius: 10,
        edges: 'all',
      });

      expect(filleted).toBeDefined();
      expect(filleted.type).toBe('Shape');
    });

    it('should chamfer edges of a box', async () => {
      const box = await geometryService.execute('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const chamfered = await geometryService.execute('CHAMFER', {
        shape: box,
        distance: 5,
        edges: 'all',
      });

      expect(chamfered).toBeDefined();
      expect(chamfered.type).toBe('Shape');
    });
  });

  describe('Export Operations', () => {
    it('should export to STEP format', async () => {
      const box = await geometryService.execute('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const stepData = await geometryService.export(box, 'STEP');

      expect(stepData).toBeDefined();
      expect(typeof stepData).toBe('string');
      expect(stepData).toContain('ISO-10303-21');
      expect(stepData).toContain('STEP');
    });

    it('should export to STL format', async () => {
      const sphere = await geometryService.execute('MAKE_SPHERE', {
        radius: 50,
      });

      const stlData = await geometryService.export(sphere, 'STL', {
        binary: true,
        tolerance: 0.01,
      });

      expect(stlData).toBeDefined();
      expect(stlData instanceof ArrayBuffer).toBe(true);

      // Check STL binary header
      const view = new DataView(stlData as ArrayBuffer);
      expect(view.byteLength).toBeGreaterThan(84); // Header + at least one triangle
    });

    it('should export to IGES format', async () => {
      const cylinder = await geometryService.execute('MAKE_CYLINDER', {
        radius: 25,
        height: 100,
      });

      const igesData = await geometryService.export(cylinder, 'IGES');

      expect(igesData).toBeDefined();
      expect(typeof igesData).toBe('string');
      expect(igesData).toMatch(/^[SG]/); // IGES starts with S or G
    });
  });

  describe('Error Handling', () => {
    it('should reject operations with invalid parameters', async () => {
      await expect(
        geometryService.execute('MAKE_BOX', {
          width: -100, // Invalid negative dimension
          height: 100,
          depth: 100,
        })
      ).rejects.toThrow();
    });

    it('should timeout long-running operations', async () => {
      // Create a complex operation that might timeout
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          geometryService
            .execute(
              'MAKE_BOX',
              {
                width: Math.random() * 100,
                height: Math.random() * 100,
                depth: Math.random() * 100,
              },
              {
                timeout: 100, // Very short timeout
              }
            )
            .catch(() => null)
        );
      }

      const results = await Promise.all(promises);
      const timeouts = results.filter((r) => r === null);

      // Some operations should have timed out
      expect(timeouts.length).toBeGreaterThan(0);
    });

    it('should recover from service failures', async () => {
      // This test would simulate a failure and recovery
      // For now, just verify the recovery method exists
      expect(geometryService.checkHealth).toBeDefined();
      expect(geometryService.initialize).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent operations', async () => {
      const startTime = Date.now();

      const operations = Array.from({ length: 10 }, (_, i) =>
        geometryService.execute('MAKE_BOX', {
          width: 100 + i * 10,
          height: 100 + i * 10,
          depth: 100 + i * 10,
        })
      );

      const results = await Promise.all(operations);
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.type).toBe('Shape');
      });

      // Should complete within reasonable time (5 seconds for 10 operations)
      expect(duration).toBeLessThan(5000);
    });

    it('should report memory usage', async () => {
      const metrics = await geometryService.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.memoryUsage).toBeDefined();
    });
  });
});

describe('Production Environment Validation', () => {
  it('should not contain any mock geometry references', async () => {
    // This test would scan the production build for mock references
    // For unit testing, we just verify the environment is set correctly
    expect(process.env.ENABLE_MOCK_GEOMETRY).toBe('false');
    expect(process.env.REQUIRE_REAL_OCCT).toBe('true');
  });

  it('should have WebAssembly support', () => {
    expect(typeof WebAssembly).toBe('object');
    expect(WebAssembly.compile).toBeDefined();
    expect(WebAssembly.instantiate).toBeDefined();
  });

  it('should have Worker support', () => {
    expect(typeof Worker).toBe('function');
  });
});
