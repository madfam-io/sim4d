import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  distanceNode,
  closestPointNode,
  areaNode,
  volumeNode,
  massPropertiesNode,
  boundingBoxNode,
  intersectionNode,
  evaluateCurveNode,
  evaluateSurfaceNode,
  collisionDetectionNode,
} from './analysis';

describe('Analysis Nodes', () => {
  const mockContext = {
    worker: {
      invoke: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('distanceNode', () => {
    it('should measure distance between geometries', async () => {
      const inputs = {
        geometryA: { type: 'point', x: 0, y: 0, z: 0 },
        geometryB: { type: 'point', x: 3, y: 4, z: 0 },
      };
      const params = { signed: false };

      mockContext.worker.invoke.mockResolvedValue({
        distance: 5.0,
        closestPointA: { x: 0, y: 0, z: 0 },
        closestPointB: { x: 3, y: 4, z: 0 },
      });

      const result = await distanceNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MEASURE_DISTANCE', {
        geometryA: inputs.geometryA,
        geometryB: inputs.geometryB,
        signed: false,
      });
      expect(result).toEqual({
        distance: 5.0,
        pointA: { x: 0, y: 0, z: 0 },
        pointB: { x: 3, y: 4, z: 0 },
      });
    });

    it('should handle signed distance', async () => {
      const inputs = {
        geometryA: { type: 'plane', origin: { x: 0, y: 0, z: 0 } },
        geometryB: { type: 'point', x: 0, y: 0, z: 5 },
      };
      const params = { signed: true };

      mockContext.worker.invoke.mockResolvedValue({
        distance: -5.0,
        closestPointA: { x: 0, y: 0, z: 0 },
        closestPointB: { x: 0, y: 0, z: 5 },
      });

      const result = await distanceNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MEASURE_DISTANCE', {
        geometryA: inputs.geometryA,
        geometryB: inputs.geometryB,
        signed: true,
      });
      expect(result.distance).toBe(-5.0);
    });

    it('should handle null geometries gracefully', async () => {
      const inputs = {
        geometryA: null,
        geometryB: { type: 'point', x: 1, y: 2, z: 3 },
      };
      const params = { signed: false };

      mockContext.worker.invoke.mockResolvedValue(null);

      await expect(distanceNode.execute(inputs, params, mockContext)).rejects.toThrow();
    });
  });

  describe('closestPointNode', () => {
    it('should find closest point on geometry', async () => {
      const inputs = {
        point: { x: 5, y: 5, z: 5 },
        geometry: { type: 'surface', id: 'surf1' },
      };
      const params = {};

      const mockResult = {
        closestPoint: { x: 5, y: 5, z: 0 },
        distance: 5.0,
        parameter: 0.5,
        normal: { x: 0, y: 0, z: 1 },
      };

      mockContext.worker.invoke.mockResolvedValue(mockResult);

      const result = await closestPointNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('CLOSEST_POINT', {
        point: inputs.point,
        geometry: inputs.geometry,
      });
      expect(result).toEqual({
        closest: { x: 5, y: 5, z: 0 },
        distance: 5.0,
        parameter: 0.5,
        normal: { x: 0, y: 0, z: 1 },
      });
    });

    it('should handle point on geometry', async () => {
      const inputs = {
        point: { x: 0, y: 0, z: 0 },
        geometry: { type: 'surface', id: 'surf1' },
      };
      const params = {};

      const mockResult = {
        closestPoint: { x: 0, y: 0, z: 0 },
        distance: 0.0,
        parameter: 0.0,
        normal: { x: 0, y: 0, z: 1 },
      };

      mockContext.worker.invoke.mockResolvedValue(mockResult);

      const result = await closestPointNode.execute(inputs, params, mockContext);

      expect(result.distance).toBe(0.0);
    });
  });

  describe('areaNode', () => {
    it('should calculate surface area', async () => {
      const inputs = {
        geometry: { type: 'surface', id: 'surf1' },
      };
      const params = { worldSpace: true };

      mockContext.worker.invoke.mockResolvedValue({
        area: 100.5,
        centroid: { x: 5, y: 5, z: 0 },
      });

      const result = await areaNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('CALCULATE_AREA', {
        geometry: inputs.geometry,
        worldSpace: true,
      });
      expect(result).toEqual({
        area: 100.5,
        centroid: { x: 5, y: 5, z: 0 },
      });
    });

    it('should handle invalid geometry', async () => {
      const inputs = {
        geometry: null,
      };
      const params = { worldSpace: true };

      mockContext.worker.invoke.mockResolvedValue({ area: 0, centroid: null });

      const result = await areaNode.execute(inputs, params, mockContext);

      expect(result.area).toBe(0);
    });
  });

  describe('volumeNode', () => {
    it('should calculate solid volume', async () => {
      const inputs = {
        solid: { type: 'solid', id: 'solid1' },
      };
      const params = {};

      mockContext.worker.invoke.mockResolvedValue({
        volume: 1000.0,
        centroid: { x: 0, y: 0, z: 0 },
        surfaceArea: 600.0,
      });

      const result = await volumeNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('CALCULATE_VOLUME', {
        solid: inputs.solid,
      });
      expect(result).toEqual({
        volume: 1000.0,
        centroid: { x: 0, y: 0, z: 0 },
        surfaceArea: 600.0,
      });
    });

    it('should handle open surfaces', async () => {
      const inputs = {
        solid: { type: 'surface', id: 'surf1', closed: false },
      };
      const params = {};

      mockContext.worker.invoke.mockResolvedValue(null);

      await expect(volumeNode.execute(inputs, params, mockContext)).rejects.toThrow();
    });
  });

  describe('massPropertiesNode', () => {
    it('should calculate mass properties with default density', async () => {
      const inputs = {
        geometry: { type: 'solid', id: 'solid1' },
      };
      const params = { density: 1.0 };

      const mockProperties = {
        volume: 100,
        mass: 100,
        centroid: { x: 5, y: 5, z: 5 },
        momentOfInertia: { xx: 10, yy: 10, zz: 10 },
        principalAxes: {
          axis1: { x: 1, y: 0, z: 0 },
          axis2: { x: 0, y: 1, z: 0 },
          axis3: { x: 0, y: 0, z: 1 },
        },
      };

      mockContext.worker.invoke.mockResolvedValue(mockProperties);

      const result = await massPropertiesNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('MASS_PROPERTIES', {
        geometry: inputs.geometry,
        density: 1.0,
      });
      expect(result).toEqual(mockProperties);
    });

    it('should handle custom density', async () => {
      const inputs = {
        geometry: { type: 'solid', id: 'solid2' },
      };
      const params = { density: 7.85 }; // Steel density

      const mockProperties = {
        volume: 100,
        mass: 785,
        centroid: { x: 0, y: 0, z: 0 },
        momentOfInertia: { xx: 50, yy: 50, zz: 50 },
        principalAxes: {
          axis1: { x: 1, y: 0, z: 0 },
          axis2: { x: 0, y: 1, z: 0 },
          axis3: { x: 0, y: 0, z: 1 },
        },
      };

      mockContext.worker.invoke.mockResolvedValue(mockProperties);

      const result = await massPropertiesNode.execute(inputs, params, mockContext);

      expect(result.mass).toBe(785);
    });
  });

  describe('boundingBoxNode', () => {
    it('should calculate bounding box', async () => {
      const inputs = {
        geometry: { type: 'mesh', id: 'mesh1' },
      };
      const params = { alignment: 'world', plane: null };

      const mockBox = {
        box: {
          min: { x: -10, y: -10, z: -10 },
          max: { x: 10, y: 10, z: 10 },
        },
        center: { x: 0, y: 0, z: 0 },
        diagonal: 34.64,
        dimensions: { x: 20, y: 20, z: 20 },
      };

      mockContext.worker.invoke.mockResolvedValue(mockBox);

      const result = await boundingBoxNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('BOUNDING_BOX', {
        geometry: inputs.geometry,
        alignment: 'world',
        plane: null,
      });
      expect(result).toEqual(mockBox);
    });

    it('should handle oriented bounding box', async () => {
      const inputs = {
        geometry: { type: 'mesh', id: 'mesh1' },
      };
      const params = {
        alignment: 'oriented',
        plane: { origin: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 1 } },
      };

      const mockBox = {
        box: {
          min: { x: -8, y: -8, z: -12 },
          max: { x: 8, y: 8, z: 12 },
        },
        center: { x: 0, y: 0, z: 0 },
        diagonal: 28.0,
        dimensions: { x: 16, y: 16, z: 24 },
      };

      mockContext.worker.invoke.mockResolvedValue(mockBox);

      await boundingBoxNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('BOUNDING_BOX', {
        geometry: inputs.geometry,
        alignment: 'oriented',
        plane: params.plane,
      });
    });
  });

  describe('intersectionNode', () => {
    it('should find geometry intersections', async () => {
      const inputs = {
        geometryA: { type: 'line', id: 'line1' },
        geometryB: { type: 'surface', id: 'surf1' },
      };
      const params = { tolerance: 0.001 };

      const mockIntersections = {
        type: 'points',
        points: [{ point: { x: 5, y: 5, z: 0 }, paramA: 0.5, paramB: { u: 0.5, v: 0.5 } }],
      };

      mockContext.worker.invoke.mockResolvedValue(mockIntersections);

      const result = await intersectionNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('INTERSECTION', {
        geometryA: inputs.geometryA,
        geometryB: inputs.geometryB,
        tolerance: 0.001,
      });
      expect(result).toEqual({ intersection: mockIntersections });
    });

    it('should handle no intersections', async () => {
      const inputs = {
        geometryA: { type: 'line', id: 'line1' },
        geometryB: { type: 'line', id: 'line2' },
      };
      const params = { tolerance: 0.001 };

      mockContext.worker.invoke.mockResolvedValue({ type: 'none', points: [] });

      const result = await intersectionNode.execute(inputs, params, mockContext);

      expect(result.intersection.type).toBe('none');
    });

    it('should handle curve intersections', async () => {
      const inputs = {
        geometryA: { type: 'surface', id: 'surf1' },
        geometryB: { type: 'surface', id: 'surf2' },
      };
      const params = { tolerance: 0.001 };

      const mockIntersections = {
        type: 'curves',
        curves: [{ type: 'line', start: { x: 0, y: 0, z: 0 }, end: { x: 10, y: 10, z: 0 } }],
      };

      mockContext.worker.invoke.mockResolvedValue(mockIntersections);

      const result = await intersectionNode.execute(inputs, params, mockContext);

      expect(result.intersection.type).toBe('curves');
    });
  });

  describe('evaluateCurveNode', () => {
    it('should evaluate curve at parameter', async () => {
      const inputs = {
        curve: { type: 'nurbs', id: 'curve1' },
        parameter: 0.5,
      };
      const params = {};

      const mockResult = {
        point: { x: 5, y: 5, z: 0 },
        tangent: { x: 1, y: 0, z: 0 },
        normal: { x: 0, y: 1, z: 0 },
        binormal: { x: 0, y: 0, z: 1 },
        curvature: 0.1,
      };

      mockContext.worker.invoke.mockResolvedValue(mockResult);

      const result = await evaluateCurveNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('EVALUATE_CURVE', {
        curve: inputs.curve,
        parameter: 0.5,
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle parameter out of range', async () => {
      const inputs = {
        curve: { type: 'nurbs', id: 'curve1' },
        parameter: 1.5,
      };
      const params = {};

      // Should clamp to valid range
      const mockResult = {
        point: { x: 10, y: 10, z: 0 },
        tangent: { x: 1, y: 0, z: 0 },
        normal: { x: 0, y: 1, z: 0 },
        binormal: { x: 0, y: 0, z: 1 },
        curvature: 0.0,
      };

      mockContext.worker.invoke.mockResolvedValue(mockResult);

      const result = await evaluateCurveNode.execute(inputs, params, mockContext);

      expect(result.point).toEqual({ x: 10, y: 10, z: 0 });
    });
  });

  describe('evaluateSurfaceNode', () => {
    it('should evaluate surface at UV parameters', async () => {
      const inputs = {
        surface: { type: 'nurbs', id: 'surf1' },
        u: 0.5,
        v: 0.5,
      };
      const params = {};

      const mockResult = {
        point: { x: 5, y: 5, z: 0 },
        normal: { x: 0, y: 0, z: 1 },
        uTangent: { x: 1, y: 0, z: 0 },
        vTangent: { x: 0, y: 1, z: 0 },
        gaussianCurvature: 0.0,
        meanCurvature: 0.0,
      };

      mockContext.worker.invoke.mockResolvedValue(mockResult);

      const result = await evaluateSurfaceNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('EVALUATE_SURFACE', {
        surface: inputs.surface,
        u: 0.5,
        v: 0.5,
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle parameters at boundaries', async () => {
      const inputs = {
        surface: { type: 'nurbs', id: 'surf1' },
        u: 0.0,
        v: 1.0,
      };
      const params = {};

      const mockResult = {
        point: { x: 0, y: 10, z: 0 },
        normal: { x: 0, y: 0, z: 1 },
        uTangent: { x: 1, y: 0, z: 0 },
        vTangent: { x: 0, y: 1, z: 0 },
        gaussianCurvature: 0.0,
        meanCurvature: 0.0,
      };

      mockContext.worker.invoke.mockResolvedValue(mockResult);

      const result = await evaluateSurfaceNode.execute(inputs, params, mockContext);

      expect(result.point).toEqual({ x: 0, y: 10, z: 0 });
    });
  });

  describe('collisionDetectionNode', () => {
    it('should detect collision between geometries', async () => {
      const inputs = {
        geometryA: { type: 'solid', id: 'solid1' },
        geometryB: { type: 'solid', id: 'solid2' },
      };
      const params = {
        tolerance: 0.001,
        includeContainment: true,
      };

      const mockResult = {
        collides: true,
        penetrationDepth: 2.5,
        contactPoints: [{ point: { x: 5, y: 5, z: 0 }, normal: { x: 1, y: 0, z: 0 } }],
        containment: 'partial',
      };

      mockContext.worker.invoke.mockResolvedValue(mockResult);

      const result = await collisionDetectionNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('COLLISION_DETECTION', {
        geometryA: inputs.geometryA,
        geometryB: inputs.geometryB,
        tolerance: 0.001,
        includeContainment: true,
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle no collision', async () => {
      const inputs = {
        geometryA: { type: 'solid', id: 'solid1' },
        geometryB: { type: 'solid', id: 'solid2' },
      };
      const params = {
        tolerance: 0.001,
        includeContainment: false,
      };

      const mockResult = {
        collides: false,
        penetrationDepth: 0,
        contactPoints: [],
        containment: 'none',
      };

      mockContext.worker.invoke.mockResolvedValue(mockResult);

      const result = await collisionDetectionNode.execute(inputs, params, mockContext);

      expect(result.collides).toBe(false);
      expect(result.contactPoints).toEqual([]);
    });

    it('should detect full containment', async () => {
      const inputs = {
        geometryA: { type: 'solid', id: 'small' },
        geometryB: { type: 'solid', id: 'large' },
      };
      const params = {
        tolerance: 0.001,
        includeContainment: true,
      };

      const mockResult = {
        collides: true,
        penetrationDepth: 10.0,
        contactPoints: [],
        containment: 'AinsideB',
      };

      mockContext.worker.invoke.mockResolvedValue(mockResult);

      const result = await collisionDetectionNode.execute(inputs, params, mockContext);

      expect(result.containment).toBe('AinsideB');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null inputs gracefully', async () => {
      const inputs = { geometryA: null, geometryB: null };
      const params = { signed: false };

      mockContext.worker.invoke.mockResolvedValue(null);

      await expect(distanceNode.execute(inputs, params, mockContext)).rejects.toThrow();
    });

    it('should handle invalid geometry types', async () => {
      const inputs = {
        geometry: { type: 'invalid' },
      };
      const params = { alignment: 'world', plane: null };

      mockContext.worker.invoke.mockRejectedValue(new Error('Invalid geometry type'));

      await expect(boundingBoxNode.execute(inputs, params, mockContext)).rejects.toThrow(
        'Invalid geometry type'
      );
    });

    it('should handle extreme tolerance values', async () => {
      const inputs = {
        geometryA: { type: 'line', id: 'line1' },
        geometryB: { type: 'line', id: 'line2' },
      };
      const params = { tolerance: 1e-10 };

      mockContext.worker.invoke.mockResolvedValue({ type: 'none', points: [] });

      const result = await intersectionNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('INTERSECTION', {
        geometryA: inputs.geometryA,
        geometryB: inputs.geometryB,
        tolerance: 1e-10,
      });
      expect(result.intersection.type).toBe('none');
    });
  });
});
