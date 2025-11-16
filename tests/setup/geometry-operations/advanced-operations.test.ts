/**
 * Advanced Operations Test Suite
 * Comprehensive testing of fillets, chamfers, extrusion, revolution, tessellation, and file I/O
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeometryAPI } from '@brepflow/engine-occt';
import { setupWASMTestEnvironment, GeometryPerformanceTracker } from '../wasm-test-setup';
import type { ShapeHandle } from '@brepflow/engine-occt/src/occt-bindings';

describe('Advanced Operations', () => {
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

  describe('Feature Operations', () => {
    describe('Fillet Operations', () => {
      it('should create fillets on box edges', async () => {
        await geometryAPI.init();

        const box = await geometryAPI.invoke('MAKE_BOX', {
          width: 100,
          height: 100,
          depth: 100,
        });

        const filletedBox = await geometryAPI.invoke('MAKE_FILLET', {
          shape: box,
          radius: 10,
        });

        expect(filletedBox).toBeDefined();
        expect(filletedBox.type).toBe('solid');
        expect(filletedBox.volume).toBeLessThan(box.volume); // Filleting removes material
        expect(filletedBox.bbox_max_x).toBe(box.bbox_max_x);
        expect(filletedBox.bbox_max_y).toBe(box.bbox_max_y);
        expect(filletedBox.bbox_max_z).toBe(box.bbox_max_z);
      });

      it('should handle different fillet radii', async () => {
        await geometryAPI.init();

        const cylinder = await geometryAPI.invoke('MAKE_CYLINDER', {
          radius: 50,
          height: 100,
        });

        const smallFillet = await geometryAPI.invoke('MAKE_FILLET', {
          shape: cylinder,
          radius: 2,
        });

        const largeFillet = await geometryAPI.invoke('MAKE_FILLET', {
          shape: cylinder,
          radius: 15,
        });

        expect(smallFillet.volume).toBeGreaterThan(largeFillet.volume);
        expect(largeFillet.volume).toBeLessThan(cylinder.volume);
      });

      it('should validate fillet parameters', async () => {
        await geometryAPI.init();

        const box = await geometryAPI.invoke('MAKE_BOX', {
          width: 20,
          height: 20,
          depth: 20,
        });

        // Fillet radius too large
        await expect(
          geometryAPI.invoke('MAKE_FILLET', {
            shape: box,
            radius: 15, // Larger than half the smallest dimension
          })
        ).rejects.toThrow();

        // Zero radius
        await expect(
          geometryAPI.invoke('MAKE_FILLET', {
            shape: box,
            radius: 0,
          })
        ).rejects.toThrow();

        // Negative radius
        await expect(
          geometryAPI.invoke('MAKE_FILLET', {
            shape: box,
            radius: -5,
          })
        ).rejects.toThrow();
      });
    });

    describe('Chamfer Operations', () => {
      it('should create chamfers on edges', async () => {
        await geometryAPI.init();

        const box = await geometryAPI.invoke('MAKE_BOX', {
          width: 100,
          height: 100,
          depth: 100,
        });

        const chamferedBox = await geometryAPI.invoke('MAKE_CHAMFER', {
          shape: box,
          distance: 5,
        });

        expect(chamferedBox).toBeDefined();
        expect(chamferedBox.type).toBe('solid');
        expect(chamferedBox.volume).toBeLessThan(box.volume);
      });

      it('should handle various chamfer distances', async () => {
        await geometryAPI.init();

        const cone = await geometryAPI.invoke('MAKE_CONE', {
          radius1: 50,
          radius2: 25,
          height: 100,
        });

        const smallChamfer = await geometryAPI.invoke('MAKE_CHAMFER', {
          shape: cone,
          distance: 1,
        });

        const largeChamfer = await geometryAPI.invoke('MAKE_CHAMFER', {
          shape: cone,
          distance: 8,
        });

        expect(smallChamfer.volume).toBeGreaterThan(largeChamfer.volume);
      });
    });

    describe('Shell Operations', () => {
      it('should create hollow shells from solid shapes', async () => {
        await geometryAPI.init();

        const sphere = await geometryAPI.invoke('MAKE_SPHERE', {
          radius: 50,
        });

        const shell = await geometryAPI.invoke('MAKE_SHELL', {
          shape: sphere,
          thickness: 5,
        });

        expect(shell).toBeDefined();
        expect(shell.type).toBe('solid');
        expect(shell.volume).toBeLessThan(sphere.volume); // Hollow interior
        expect(shell.volume).toBeGreaterThan(0);
      });

      it('should handle different shell thicknesses', async () => {
        await geometryAPI.init();

        const box = await geometryAPI.invoke('MAKE_BOX', {
          width: 100,
          height: 100,
          depth: 100,
        });

        const thinShell = await geometryAPI.invoke('MAKE_SHELL', {
          shape: box,
          thickness: 2,
        });

        const thickShell = await geometryAPI.invoke('MAKE_SHELL', {
          shape: box,
          thickness: 10,
        });

        expect(thinShell.volume).toBeLessThan(thickShell.volume);
        expect(thickShell.volume).toBeLessThan(box.volume);
      });
    });
  });

  describe('Sweep Operations', () => {
    describe('Extrusion', () => {
      it('should extrude a profile along a vector', async () => {
        await geometryAPI.init();

        // Create a circular profile (using a sphere as proxy for circle)
        const profile = await geometryAPI.invoke('MAKE_SPHERE', {
          radius: 25,
        });

        const extruded = await geometryAPI.invoke('EXTRUDE', {
          profile: profile,
          dx: 0,
          dy: 0,
          dz: 100,
        });

        expect(extruded).toBeDefined();
        expect(extruded.type).toBe('solid');
        expect(extruded.bbox_max_z).toBeGreaterThan(profile.bbox_max_z);
      });

      it('should handle different extrusion directions', async () => {
        await geometryAPI.init();

        const profile = await geometryAPI.invoke('MAKE_BOX', {
          width: 50,
          height: 30,
          depth: 10,
        });

        // Extrude along X
        const extrudedX = await geometryAPI.invoke('EXTRUDE', {
          profile: profile,
          dx: 100,
          dy: 0,
          dz: 0,
        });

        // Extrude along Y
        const extrudedY = await geometryAPI.invoke('EXTRUDE', {
          profile: profile,
          dx: 0,
          dy: 100,
          dz: 0,
        });

        expect(extrudedX.bbox_max_x).toBeGreaterThan(profile.bbox_max_x);
        expect(extrudedY.bbox_max_y).toBeGreaterThan(profile.bbox_max_y);
      });

      it('should handle diagonal extrusion', async () => {
        await geometryAPI.init();

        const profile = await geometryAPI.invoke('MAKE_CYLINDER', {
          radius: 20,
          height: 10,
        });

        const extruded = await geometryAPI.invoke('EXTRUDE', {
          profile: profile,
          dx: 50,
          dy: 50,
          dz: 100,
        });

        expect(extruded).toBeDefined();
        expect(extruded.bbox_max_x).toBeGreaterThan(profile.bbox_max_x);
        expect(extruded.bbox_max_y).toBeGreaterThan(profile.bbox_max_y);
        expect(extruded.bbox_max_z).toBeGreaterThan(profile.bbox_max_z);
      });
    });

    describe('Revolution', () => {
      it('should revolve a profile around an axis', async () => {
        await geometryAPI.init();

        const profile = await geometryAPI.invoke('MAKE_BOX', {
          width: 10,
          height: 50,
          depth: 10,
        });

        const revolved = await geometryAPI.invoke('REVOLVE', {
          profile: profile,
          angle: Math.PI, // 180 degrees
          axisX: 0,
          axisY: 0,
          axisZ: 1,
          originX: 0,
          originY: 0,
          originZ: 0,
        });

        expect(revolved).toBeDefined();
        expect(revolved.type).toBe('solid');
        expect(revolved.volume).toBeGreaterThan(0);
      });

      it('should handle full revolution', async () => {
        await geometryAPI.init();

        const profile = await geometryAPI.invoke('MAKE_BOX', {
          width: 20,
          height: 30,
          depth: 5,
        });

        const fullRevolution = await geometryAPI.invoke('REVOLVE', {
          profile: profile,
          angle: 2 * Math.PI, // 360 degrees
          axisX: 1,
          axisY: 0,
          axisZ: 0,
          originX: 0,
          originY: 0,
          originZ: 0,
        });

        expect(fullRevolution).toBeDefined();
        expect(fullRevolution.volume).toBeGreaterThan(profile.volume);
      });

      it('should validate revolution parameters', async () => {
        await geometryAPI.init();

        const profile = await geometryAPI.invoke('MAKE_SPHERE', {
          radius: 25,
        });

        // Invalid angle
        await expect(
          geometryAPI.invoke('REVOLVE', {
            profile: profile,
            angle: 0,
            axisX: 0,
            axisY: 0,
            axisZ: 1,
            originX: 0,
            originY: 0,
            originZ: 0,
          })
        ).rejects.toThrow();

        // Invalid axis (zero vector)
        await expect(
          geometryAPI.invoke('REVOLVE', {
            profile: profile,
            angle: Math.PI,
            axisX: 0,
            axisY: 0,
            axisZ: 0,
            originX: 0,
            originY: 0,
            originZ: 0,
          })
        ).rejects.toThrow();
      });
    });
  });

  describe('Tessellation Operations', () => {
    it('should tessellate shapes to mesh data', async () => {
      await geometryAPI.init();

      const sphere = await geometryAPI.invoke('MAKE_SPHERE', {
        radius: 50,
      });

      const { mesh } = await geometryAPI.invoke('TESSELLATE', {
        shape: sphere,
      });

      expect(mesh).toBeDefined();
      expect(mesh.positions).toBeDefined();
      expect(mesh.normals).toBeDefined();
      expect(mesh.indices).toBeDefined();
      expect(mesh.vertexCount).toBeGreaterThan(0);
      expect(mesh.triangleCount).toBeGreaterThan(0);
    });

    it('should handle tessellation with custom parameters', async () => {
      await geometryAPI.init();

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      const coarse = await geometryAPI.invoke('TESSELLATE_WITH_PARAMS', {
        shape: box,
        precision: 1.0,
        angle: 0.5,
      });

      const fine = await geometryAPI.invoke('TESSELLATE_WITH_PARAMS', {
        shape: box,
        precision: 0.1,
        angle: 0.1,
      });

      expect(fine.mesh.vertexCount).toBeGreaterThan(coarse.mesh.vertexCount);
      expect(fine.mesh.triangleCount).toBeGreaterThan(coarse.mesh.triangleCount);
    });

    it('should validate tessellation parameters', async () => {
      await geometryAPI.init();

      const cylinder = await geometryAPI.invoke('MAKE_CYLINDER', {
        radius: 30,
        height: 60,
      });

      // Invalid precision (negative)
      await expect(
        geometryAPI.invoke('TESSELLATE_WITH_PARAMS', {
          shape: cylinder,
          precision: -0.1,
          angle: 0.1,
        })
      ).rejects.toThrow();

      // Invalid angle (negative)
      await expect(
        geometryAPI.invoke('TESSELLATE_WITH_PARAMS', {
          shape: cylinder,
          precision: 0.1,
          angle: -0.1,
        })
      ).rejects.toThrow();
    });
  });

  describe('File I/O Operations', () => {
    describe('STEP Export/Import', () => {
      it('should export shapes to STEP format', async () => {
        await geometryAPI.init();

        const torus = await geometryAPI.invoke('MAKE_TORUS', {
          majorRadius: 50,
          minorRadius: 15,
        });

        const stepData = await geometryAPI.invoke('EXPORT_STEP', {
          shape: torus,
        });

        expect(stepData).toBeDefined();
        expect(typeof stepData).toBe('string');
        expect(stepData).toContain('ISO-10303-21');
        expect(stepData).toContain('HEADER');
        expect(stepData).toContain('DATA');
        expect(stepData).toContain('ENDSEC');
      });

      it('should import shapes from STEP format', async () => {
        await geometryAPI.init();

        const mockStepData = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('Mock STEP file'),'2;1');
ENDSEC;
DATA;
ENDSEC;
END-ISO-10303-21;`;

        const importedShape = await geometryAPI.invoke('IMPORT_STEP', {
          data: mockStepData,
        });

        expect(importedShape).toBeDefined();
        expect(importedShape.type).toBe('solid');
        expect(importedShape.volume).toBeGreaterThan(0);
      });

      it('should handle invalid STEP data', async () => {
        await geometryAPI.init();

        const invalidStepData = 'Not a valid STEP file';

        await expect(
          geometryAPI.invoke('IMPORT_STEP', {
            data: invalidStepData,
          })
        ).rejects.toThrow();
      });
    });

    describe('STL Export', () => {
      it('should export shapes to ASCII STL format', async () => {
        await geometryAPI.init();

        const cone = await geometryAPI.invoke('MAKE_CONE', {
          radius1: 40,
          radius2: 20,
          height: 80,
        });

        const stlData = await geometryAPI.invoke('EXPORT_STL', {
          shape: cone,
          binary: false,
        });

        expect(stlData).toBeDefined();
        expect(typeof stlData).toBe('string');
        expect(stlData).toContain('solid');
        expect(stlData).toContain('facet normal');
        expect(stlData).toContain('vertex');
        expect(stlData).toContain('endsolid');
      });

      it('should export shapes to binary STL format', async () => {
        await geometryAPI.init();

        const sphere = await geometryAPI.invoke('MAKE_SPHERE', {
          radius: 25,
        });

        const binaryStlData = await geometryAPI.invoke('EXPORT_STL', {
          shape: sphere,
          binary: true,
        });

        expect(binaryStlData).toBeDefined();
        expect(typeof binaryStlData).toBe('string');
        expect(binaryStlData).toContain('BINARY_STL_DATA');
      });
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance targets for advanced operations', async () => {
      await geometryAPI.init();

      const targets = {
        MAKE_FILLET: 100, // ms
        MAKE_CHAMFER: 75, // ms
        MAKE_SHELL: 150, // ms
        EXTRUDE: 100, // ms
        REVOLVE: 200, // ms
        TESSELLATE: 50, // ms
        EXPORT_STEP: 75, // ms
        EXPORT_STL: 50, // ms
      };

      const box = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      for (const [operation, targetTime] of Object.entries(targets)) {
        const endMeasurement = GeometryPerformanceTracker.startMeasurement(operation);

        let result;
        switch (operation) {
          case 'MAKE_FILLET':
            result = await geometryAPI.invoke(operation, { shape: box, radius: 5 });
            break;
          case 'MAKE_CHAMFER':
            result = await geometryAPI.invoke(operation, { shape: box, distance: 3 });
            break;
          case 'MAKE_SHELL':
            result = await geometryAPI.invoke(operation, { shape: box, thickness: 5 });
            break;
          case 'EXTRUDE':
            result = await geometryAPI.invoke(operation, {
              profile: box,
              dx: 0,
              dy: 0,
              dz: 50,
            });
            break;
          case 'REVOLVE':
            result = await geometryAPI.invoke(operation, {
              profile: box,
              angle: Math.PI,
              axisX: 0,
              axisY: 0,
              axisZ: 1,
              originX: 0,
              originY: 0,
              originZ: 0,
            });
            break;
          case 'TESSELLATE':
            result = await geometryAPI.invoke(operation, { shape: box });
            break;
          case 'EXPORT_STEP':
            result = await geometryAPI.invoke(operation, { shape: box });
            break;
          case 'EXPORT_STL':
            result = await geometryAPI.invoke(operation, { shape: box, binary: false });
            break;
        }

        const duration = endMeasurement();
        expect(duration).toBeLessThan(targetTime);
        expect(result).toBeDefined();
      }
    });
  });

  describe('Memory Management', () => {
    it('should properly manage memory during advanced operations', async () => {
      await geometryAPI.init();

      const initialCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});

      // Create base shape
      const baseBox = await geometryAPI.invoke('MAKE_BOX', {
        width: 100,
        height: 100,
        depth: 100,
      });

      // Perform various operations
      const filleted = await geometryAPI.invoke('MAKE_FILLET', {
        shape: baseBox,
        radius: 8,
      });

      const chamfered = await geometryAPI.invoke('MAKE_CHAMFER', {
        shape: filleted,
        distance: 5,
      });

      const shell = await geometryAPI.invoke('MAKE_SHELL', {
        shape: chamfered,
        thickness: 10,
      });

      const currentCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(currentCount).toBe(initialCount + 4); // base + 3 operations

      // Clean up intermediate shapes
      await geometryAPI.invoke('DELETE_SHAPE', { shapeId: baseBox.id });
      await geometryAPI.invoke('DELETE_SHAPE', { shapeId: filleted.id });
      await geometryAPI.invoke('DELETE_SHAPE', { shapeId: chamfered.id });
      await geometryAPI.invoke('DELETE_SHAPE', { shapeId: shell.id });

      const finalCount = await geometryAPI.invoke('GET_SHAPE_COUNT', {});
      expect(finalCount).toBe(initialCount);
    });

    it('should handle large tessellation operations efficiently', async () => {
      await geometryAPI.init();

      const torus = await geometryAPI.invoke('MAKE_TORUS', {
        majorRadius: 100,
        minorRadius: 25,
      });

      // Fine tessellation should still complete within memory limits
      const fine = await geometryAPI.invoke('TESSELLATE_WITH_PARAMS', {
        shape: torus,
        precision: 0.1,
        angle: 0.05,
      });

      expect(fine.mesh.vertexCount).toBeGreaterThan(1000);
      expect(fine.mesh.triangleCount).toBeGreaterThan(500);
      expect(fine.mesh.positions.length).toBe(fine.mesh.vertexCount * 3);
      expect(fine.mesh.indices.length).toBe(fine.mesh.triangleCount * 3);
    });
  });
});
