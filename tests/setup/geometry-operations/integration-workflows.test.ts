/**
 * Integration Workflows Test Suite
 * End-to-end testing of complex geometry workflows and real-world scenarios
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeometryAPI } from '@sim4d/engine-occt';
import {
  setupWASMTestEnvironment,
  GeometryPerformanceTracker,
  GeometryTestDataGenerator,
} from '../wasm-test-setup';

describe('Integration Workflows', () => {
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

  describe('Mechanical Part Workflows', () => {
    it('should create a basic mechanical enclosure', async () => {
      await geometryAPI.init();

      // Create base enclosure
      const baseBox = await geometryAPI.invoke('MAKE_BOX', {
        width: 200,
        height: 120,
        depth: 60,
      });

      // Create mounting holes
      const hole1 = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 5,
        height: 70,
      });

      const hole1Positioned = await geometryAPI.invoke('TRANSFORM', {
        shape: hole1,
        tx: 20,
        ty: 20,
        tz: -5,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      const hole2 = await geometryAPI.invoke('COPY_SHAPE', {
        shape: hole1,
      });

      const hole2Positioned = await geometryAPI.invoke('TRANSFORM', {
        shape: hole2,
        tx: 180,
        ty: 20,
        tz: -5,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      // Subtract holes from base
      const withHole1 = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: baseBox,
        shape2: hole1Positioned,
      });

      const withBothHoles = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: withHole1,
        shape2: hole2Positioned,
      });

      // Add fillets to soften edges
      const filletedEnclosure = await geometryAPI.invoke('MAKE_FILLET', {
        shape: withBothHoles,
        radius: 5,
      });

      // Create hollow interior (shell)
      const finalEnclosure = await geometryAPI.invoke('MAKE_SHELL', {
        shape: filletedEnclosure,
        thickness: 3,
      });

      expect(finalEnclosure).toBeDefined();
      expect(finalEnclosure.type).toBe('solid');
      expect(finalEnclosure.volume).toBeGreaterThan(0);
      expect(finalEnclosure.volume).toBeLessThan(baseBox.volume);
    });

    it('should create a threaded fastener', async () => {
      await geometryAPI.init();

      // Create bolt shaft
      const shaft = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 6,
        height: 50,
      });

      // Create bolt head
      const head = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 10,
        height: 8,
      });

      const headPositioned = await geometryAPI.invoke('TRANSFORM', {
        shape: head,
        tx: 0,
        ty: 0,
        tz: 50,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      // Union head and shaft
      const boltBase = await geometryAPI.invoke('BOOLEAN_UNION', {
        shape1: shaft,
        shape2: headPositioned,
      });

      // Add chamfer to head
      const chamferedBolt = await geometryAPI.invoke('MAKE_CHAMFER', {
        shape: boltBase,
        distance: 1,
      });

      // Create thread relief (simplified as smaller cylinder)
      const threadRelief = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 5.5,
        height: 40,
      });

      const threadReliefPositioned = await geometryAPI.invoke('TRANSFORM', {
        shape: threadRelief,
        tx: 0,
        ty: 0,
        tz: 5,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      // Subtract thread relief
      const finalBolt = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: chamferedBolt,
        shape2: threadReliefPositioned,
      });

      expect(finalBolt).toBeDefined();
      expect(finalBolt.type).toBe('solid');
      expect(finalBolt.volume).toBeGreaterThan(0);
    });
  });

  describe('Manufacturing Workflows', () => {
    it('should create a machined part with features', async () => {
      await geometryAPI.init();

      // Start with stock material
      const stock = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 80,
        depth: 20,
      });

      // Create pocket (rectangular cavity)
      const pocket = await geometryAPI.invoke('MAKE_BOX_WITH_ORIGIN', {
        x: 20,
        y: 20,
        z: 5,
        width: 60,
        height: 40,
        depth: 12,
      });

      // Machine the pocket
      const pocketed = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: stock,
        shape2: pocket,
      });

      // Add corner fillets to pocket
      const filletedPocket = await geometryAPI.invoke('MAKE_FILLET', {
        shape: pocketed,
        radius: 2,
      });

      // Create through holes for bolts
      const hole = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 4,
        height: 25,
      });

      const hole1 = await geometryAPI.invoke('TRANSFORM', {
        shape: hole,
        tx: 15,
        ty: 15,
        tz: -2.5,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      const hole2Copy = await geometryAPI.invoke('COPY_SHAPE', {
        shape: hole,
      });

      const hole2 = await geometryAPI.invoke('TRANSFORM', {
        shape: hole2Copy,
        tx: 85,
        ty: 15,
        tz: -2.5,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      // Machine both holes
      const withHole1 = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: filletedPocket,
        shape2: hole1,
      });

      const machinedPart = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: withHole1,
        shape2: hole2,
      });

      expect(machinedPart).toBeDefined();
      expect(machinedPart.volume).toBeLessThan(stock.volume);
      expect(machinedPart.volume).toBeGreaterThan(0);
    });

    it('should create a turned part (lathe operation simulation)', async () => {
      await geometryAPI.init();

      // Create turning profile (simplified as rectangle)
      const profile = await geometryAPI.invoke('MAKE_BOX_WITH_ORIGIN', {
        x: 10,
        y: -5,
        z: -20,
        width: 30,
        height: 10,
        depth: 40,
      });

      // Revolve around centerline to create turned part
      const turnedPart = await geometryAPI.invoke('REVOLVE', {
        profile: profile,
        angle: 2 * Math.PI, // Full revolution
        axisX: 0,
        axisY: 0,
        axisZ: 1,
        originX: 0,
        originY: 0,
        originZ: 0,
      });

      // Add groove (subtract small torus)
      const groove = await geometryAPI.invoke('MAKE_TORUS', {
        majorRadius: 25,
        minorRadius: 2,
      });

      const groovedPart = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: turnedPart,
        shape2: groove,
      });

      // Add chamfers to ends
      const finalPart = await geometryAPI.invoke('MAKE_CHAMFER', {
        shape: groovedPart,
        distance: 1,
      });

      expect(finalPart).toBeDefined();
      expect(finalPart.type).toBe('solid');
      expect(finalPart.volume).toBeGreaterThan(0);
    });
  });

  describe('Assembly Workflows', () => {
    it('should create a simple bearing assembly', async () => {
      await geometryAPI.init();

      // Outer race
      const outerRaceOuter = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 30,
        height: 10,
      });

      const outerRaceInner = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 25,
        height: 12,
      });

      const outerRaceInnerPositioned = await geometryAPI.invoke('TRANSFORM', {
        shape: outerRaceInner,
        tx: 0,
        ty: 0,
        tz: -1,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      const outerRace = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: outerRaceOuter,
        shape2: outerRaceInnerPositioned,
      });

      // Inner race
      const innerRaceOuter = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 20,
        height: 8,
      });

      const innerRaceInner = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 10,
        height: 10,
      });

      const innerRaceInnerPositioned = await geometryAPI.invoke('TRANSFORM', {
        shape: innerRaceInner,
        tx: 0,
        ty: 0,
        tz: -1,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      const innerRacePositioned = await geometryAPI.invoke('TRANSFORM', {
        shape: innerRaceOuter,
        tx: 0,
        ty: 0,
        tz: 1,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      const innerRace = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: innerRacePositioned,
        shape2: innerRaceInnerPositioned,
      });

      // Ball bearings (simplified as spheres)
      const ball = await geometryAPI.invoke('MAKE_SPHERE', {
        radius: 2.5,
      });

      // Position ball at bearing race center radius
      const ballPositioned = await geometryAPI.invoke('TRANSFORM', {
        shape: ball,
        tx: 22.5,
        ty: 0,
        tz: 5,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      expect(outerRace).toBeDefined();
      expect(innerRace).toBeDefined();
      expect(ballPositioned).toBeDefined();
      expect(outerRace.volume).toBeGreaterThan(innerRace.volume);
    });

    it('should verify assembly interference checking', async () => {
      await geometryAPI.init();

      // Create two overlapping parts
      const part1 = await geometryAPI.invoke('MAKE_BOX', {
        width: 50,
        height: 50,
        depth: 50,
      });

      const part2 = await geometryAPI.invoke('MAKE_BOX_WITH_ORIGIN', {
        x: 25,
        y: 0,
        z: 0,
        width: 50,
        height: 50,
        depth: 50,
      });

      // Check for interference using intersection
      const interference = await geometryAPI.invoke('BOOLEAN_INTERSECT', {
        shape1: part1,
        shape2: part2,
      });

      expect(interference).toBeDefined();
      expect(interference.volume).toBeGreaterThan(0); // Parts do interfere

      // Create non-interfering parts
      const part3 = await geometryAPI.invoke('MAKE_BOX_WITH_ORIGIN', {
        x: 100,
        y: 0,
        z: 0,
        width: 50,
        height: 50,
        depth: 50,
      });

      const noInterference = await geometryAPI.invoke('BOOLEAN_INTERSECT', {
        shape1: part1,
        shape2: part3,
      });

      expect(noInterference.volume).toBe(0); // No interference
    });
  });

  describe('CAD File Workflows', () => {
    it('should handle complete CAD export workflow', async () => {
      await geometryAPI.init();

      // Create a complex part
      const base = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 80,
        depth: 20,
      });

      const feature = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 15,
        height: 30,
      });

      const featurePositioned = await geometryAPI.invoke('TRANSFORM', {
        shape: feature,
        tx: 50,
        ty: 40,
        tz: 20,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      const combined = await geometryAPI.invoke('BOOLEAN_UNION', {
        shape1: base,
        shape2: featurePositioned,
      });

      const filletedPart = await geometryAPI.invoke('MAKE_FILLET', {
        shape: combined,
        radius: 3,
      });

      // Export to STEP
      const stepData = await geometryAPI.invoke('EXPORT_STEP', {
        shape: filletedPart,
      });

      expect(stepData).toBeDefined();
      expect(stepData.length).toBeGreaterThan(0);
      expect(stepData).toContain('ISO-10303-21');

      // Export to STL for 3D printing
      const stlData = await geometryAPI.invoke('EXPORT_STL', {
        shape: filletedPart,
        binary: false,
      });

      expect(stlData).toBeDefined();
      expect(stlData.length).toBeGreaterThan(0);
      expect(stlData).toContain('solid');

      // Generate mesh for visualization
      const { mesh } = await geometryAPI.invoke('TESSELLATE', {
        shape: filletedPart,
      });

      expect(mesh.vertexCount).toBeGreaterThan(0);
      expect(mesh.triangleCount).toBeGreaterThan(0);
    });

    it('should handle STEP import and modification workflow', async () => {
      await geometryAPI.init();

      // Simulate importing a STEP file
      const mockStepData = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('Imported part'),'2;1');
ENDSEC;
DATA;
ENDSEC;
END-ISO-10303-21;`;

      const importedPart = await geometryAPI.invoke('IMPORT_STEP', {
        data: mockStepData,
      });

      expect(importedPart).toBeDefined();

      // Modify the imported part
      const hole = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 8,
        height: 100,
      });

      const modifiedPart = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: importedPart,
        shape2: hole,
      });

      // Re-export the modified part
      const exportedStep = await geometryAPI.invoke('EXPORT_STEP', {
        shape: modifiedPart,
      });

      expect(exportedStep).toBeDefined();
      expect(exportedStep).toContain('ISO-10303-21');
    });
  });

  describe('Performance Integration Tests', () => {
    it('should handle complex workflow within performance targets', async () => {
      await geometryAPI.init();

      const startTime = performance.now();

      // Complex workflow: Create → Modify → Feature → Export
      const base = await geometryAPI.invoke('MAKE_BOX', {
        width: 80,
        height: 60,
        depth: 40,
      });

      const cylinder = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 15,
        height: 50,
      });

      const positioned = await geometryAPI.invoke('TRANSFORM', {
        shape: cylinder,
        tx: 40,
        ty: 30,
        tz: -5,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1,
      });

      const combined = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: base,
        shape2: positioned,
      });

      const filleted = await geometryAPI.invoke('MAKE_FILLET', {
        shape: combined,
        radius: 4,
      });

      const { mesh } = await geometryAPI.invoke('TESSELLATE', {
        shape: filleted,
      });

      const stepData = await geometryAPI.invoke('EXPORT_STEP', {
        shape: filleted,
      });

      const endTime = performance.now();

      // Entire workflow should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
      expect(mesh.vertexCount).toBeGreaterThan(0);
      expect(stepData.length).toBeGreaterThan(0);
    });

    it('should handle concurrent complex operations', async () => {
      await geometryAPI.init();

      const createComplexPart = async (index: number) => {
        const base = await geometryAPI.invoke('MAKE_BOX', {
          width: 50 + index * 10,
          height: 40 + index * 5,
          depth: 30 + index * 3,
        });

        const feature = await geometryAPI.invoke('MAKE_SPHERE', {
          radius: 10 + index,
        });

        const positioned = await geometryAPI.invoke('TRANSFORM', {
          shape: feature,
          tx: 25 + index * 5,
          ty: 20,
          tz: 15,
          rx: 0,
          ry: 0,
          rz: 0,
          sx: 1,
          sy: 1,
          sz: 1,
        });

        const combined = await geometryAPI.invoke('BOOLEAN_UNION', {
          shape1: base,
          shape2: positioned,
        });

        return geometryAPI.invoke('MAKE_FILLET', {
          shape: combined,
          radius: 2 + index,
        });
      };

      const startTime = performance.now();
      const parts = await Promise.all([
        createComplexPart(0),
        createComplexPart(1),
        createComplexPart(2),
      ]);
      const endTime = performance.now();

      expect(parts).toHaveLength(3);
      expect(parts.every((part) => part && part.volume > 0)).toBe(true);
      expect(endTime - startTime).toBeLessThan(3000); // 3 operations in 3 seconds
    });
  });

  describe('Memory Management Integration', () => {
    it('should maintain stable memory usage during long workflows', async () => {
      await geometryAPI.init();

      const initialCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});

      // Simulate long workflow with cleanup
      for (let i = 0; i < 5; i++) {
        const box = await geometryAPI.invoke('MAKE_BOX', {
          width: 40,
          height: 40,
          depth: 40,
        });

        const sphere = await geometryAPI.invoke('MAKE_SPHERE', {
          radius: 15,
        });

        const combined = await geometryAPI.invoke('BOOLEAN_UNION', {
          shape1: box,
          shape2: sphere,
        });

        const filleted = await geometryAPI.invoke('MAKE_FILLET', {
          shape: combined,
          radius: 3,
        });

        // Clean up intermediate shapes
        await geometryAPI.invoke('DELETE_SHAPE', { shapeId: box.id });
        await geometryAPI.invoke('DELETE_SHAPE', { shapeId: sphere.id });
        await geometryAPI.invoke('DELETE_SHAPE', { shapeId: combined.id });
        await geometryAPI.invoke('DELETE_SHAPE', { shapeId: filleted.id });
      }

      const finalCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(finalCount).toBe(initialCount); // No memory leaks
    });

    it('should handle cleanup of complex workflows', async () => {
      await geometryAPI.init();

      const initialCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});

      // Create multiple interconnected shapes
      const shapes: ShapeHandle[] = [];

      // Base shapes
      for (let i = 0; i < 3; i++) {
        const box = await geometryAPI.invoke('MAKE_BOX', {
          width: 30,
          height: 30,
          depth: 30,
        });
        shapes.push(box);
      }

      // Operations
      const union1 = await geometryAPI.invoke('BOOLEAN_UNION', {
        shape1: shapes[0],
        shape2: shapes[1],
      });
      shapes.push(union1);

      const final = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        shape1: union1,
        shape2: shapes[2],
      });
      shapes.push(final);

      const currentCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(currentCount).toBe(initialCount + shapes.length);

      // Bulk cleanup
      await geometryAPI.invoke('CLEAR_ALL_SHAPES', {});
      const cleanedCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(cleanedCount).toBe(0);
    });
  });
});
