import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  nurbsCurveNode,
  interpolateCurveNode,
  offsetCurveNode,
  curvatureAnalysisNode,
  divideCurveNode,
  blendCurvesNode,
  projectCurveNode,
  curveIntersectionNode,
} from './curves';

describe('Curve Nodes', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      worker: {
        invoke: vi.fn(),
      },
    };
  });

  describe('NURBS Curve Node', () => {
    it('should create NURBS curve with control points', async () => {
      const inputs = {
        points: [
          { x: 0, y: 0, z: 0 },
          { x: 10, y: 0, z: 0 },
          { x: 10, y: 10, z: 0 },
        ],
        weights: [1, 1, 1],
      };
      const params = { degree: 3, periodic: false };
      const expectedResult = { type: 'Curve', id: 'nurbs-1' };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await nurbsCurveNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('CREATE_NURBS_CURVE', {
        points: inputs.points,
        weights: inputs.weights,
        degree: params.degree,
        periodic: params.periodic,
      });
      expect(result).toEqual({ curve: expectedResult });
    });

    it('should handle null weights', async () => {
      const inputs = {
        points: [
          { x: 0, y: 0, z: 0 },
          { x: 10, y: 0, z: 0 },
        ],
        weights: undefined,
      };
      const params = { degree: 2, periodic: true };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Curve' });

      await nurbsCurveNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('CREATE_NURBS_CURVE', {
        points: inputs.points,
        weights: null,
        degree: params.degree,
        periodic: params.periodic,
      });
    });

    it('should validate degree bounds', () => {
      const params = nurbsCurveNode.params;
      expect(params.degree.min).toBe(1);
      expect(params.degree.max).toBe(7);
      expect(params.degree.default).toBe(3);
    });
  });

  describe('Interpolate Curve Node', () => {
    it('should interpolate curve through points', async () => {
      const inputs = {
        points: [
          { x: 0, y: 0, z: 0 },
          { x: 5, y: 5, z: 0 },
          { x: 10, y: 0, z: 0 },
        ],
        tangents: [
          { x: 1, y: 0, z: 0 },
          { x: 0, y: 1, z: 0 },
          { x: -1, y: 0, z: 0 },
        ],
      };
      const params = { closed: false, smooth: 0.5 };
      const expectedResult = { type: 'Curve', interpolated: true };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await interpolateCurveNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('INTERPOLATE_CURVE', {
        points: inputs.points,
        tangents: inputs.tangents,
        closed: params.closed,
        smoothness: params.smooth,
      });
      expect(result).toEqual({ curve: expectedResult });
    });

    it('should handle closed curves', async () => {
      const inputs = {
        points: [
          { x: 0, y: 0, z: 0 },
          { x: 10, y: 0, z: 0 },
          { x: 10, y: 10, z: 0 },
          { x: 0, y: 10, z: 0 },
        ],
      };
      const params = { closed: true, smooth: 0.8 };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Curve' });

      await interpolateCurveNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('INTERPOLATE_CURVE', {
        points: inputs.points,
        tangents: undefined,
        closed: true,
        smoothness: 0.8,
      });
    });
  });

  describe('Offset Curve Node', () => {
    it('should offset curve by distance', async () => {
      const inputs = {
        curve: { type: 'Curve', id: 'curve-1' },
        plane: { origin: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 1 } },
      };
      const params = { distance: 10, corner: 'round' };
      const expectedResult = { type: 'Curve', offset: true };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await offsetCurveNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('OFFSET_CURVE', {
        curve: inputs.curve,
        distance: params.distance,
        plane: inputs.plane,
        cornerStyle: params.corner,
      });
      expect(result).toEqual({ offset: expectedResult });
    });

    it('should support different corner styles', () => {
      const params = offsetCurveNode.params;
      expect(params.corner.options).toEqual(['round', 'sharp', 'smooth']);
      expect(params.corner.default).toBe('round');
    });

    it('should handle negative offset distances', async () => {
      const inputs = { curve: { type: 'Curve' } };
      const params = { distance: -5, corner: 'sharp' };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Curve' });

      await offsetCurveNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('OFFSET_CURVE', {
        curve: inputs.curve,
        distance: -5,
        plane: undefined,
        cornerStyle: 'sharp',
      });
    });
  });

  describe('Curvature Analysis Node', () => {
    it('should analyze curve curvature', async () => {
      const inputs = {
        curve: { type: 'Curve', id: 'curve-1' },
      };
      const params = { samples: 100 };
      const expectedResult = {
        values: [0.1, 0.2, 0.15],
        max: 0.2,
        min: 0.1,
        inflections: [{ x: 5, y: 5, z: 0 }],
      };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await curvatureAnalysisNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('ANALYZE_CURVATURE', {
        curve: inputs.curve,
        samples: params.samples,
      });
      expect(result).toEqual({
        curvature: expectedResult.values,
        maxCurvature: expectedResult.max,
        minCurvature: expectedResult.min,
        inflectionPoints: expectedResult.inflections,
      });
    });

    it('should validate sample count bounds', () => {
      const params = curvatureAnalysisNode.params;
      expect(params.samples.min).toBe(10);
      expect(params.samples.max).toBe(1000);
      expect(params.samples.default).toBe(100);
    });
  });

  describe('Divide Curve Node', () => {
    it('should divide curve by count', async () => {
      const inputs = {
        curve: { type: 'Curve', id: 'curve-1' },
      };
      const params = { count: 10, byLength: false };
      const expectedResult = {
        points: Array(10).fill({ x: 0, y: 0, z: 0 }),
        params: Array(10)
          .fill(0)
          .map((_, i) => i / 9),
        tangents: Array(10).fill({ x: 1, y: 0, z: 0 }),
      };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await divideCurveNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('DIVIDE_CURVE', {
        curve: inputs.curve,
        count: params.count,
        byLength: params.byLength,
      });
      expect(result.points).toHaveLength(10);
      expect(result.params).toHaveLength(10);
      expect(result.tangents).toHaveLength(10);
    });

    it('should divide curve by length', async () => {
      const inputs = { curve: { type: 'Curve' } };
      const params = { count: 20, byLength: true };

      mockContext.worker.invoke.mockResolvedValue({
        points: [],
        params: [],
        tangents: [],
      });

      await divideCurveNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('DIVIDE_CURVE', {
        curve: inputs.curve,
        count: 20,
        byLength: true,
      });
    });
  });

  describe('Blend Curves Node', () => {
    it('should blend between two curves', async () => {
      const inputs = {
        curve1: { type: 'Curve', id: 'curve-1' },
        curve2: { type: 'Curve', id: 'curve-2' },
        point1: { x: 10, y: 0, z: 0 },
        point2: { x: 20, y: 0, z: 0 },
      };
      const params = { continuity: 'G1', bulge: 0.5 };
      const expectedResult = { type: 'Curve', blended: true };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await blendCurvesNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('BLEND_CURVES', {
        curve1: inputs.curve1,
        curve2: inputs.curve2,
        point1: inputs.point1,
        point2: inputs.point2,
        continuity: params.continuity,
        bulge: params.bulge,
      });
      expect(result).toEqual({ blend: expectedResult });
    });

    it('should support different continuity levels', () => {
      const params = blendCurvesNode.params;
      expect(params.continuity.options).toEqual(['G0', 'G1', 'G2', 'G3']);
      expect(params.continuity.default).toBe('G1');
    });

    it('should validate bulge parameter bounds', () => {
      const params = blendCurvesNode.params;
      expect(params.bulge.min).toBe(0);
      expect(params.bulge.max).toBe(2);
      expect(params.bulge.default).toBe(0.5);
    });
  });

  describe('Project Curve Node', () => {
    it('should project curve onto surface', async () => {
      const inputs = {
        curve: { type: 'Curve', id: 'curve-1' },
        target: { type: 'Surface', id: 'surface-1' },
        direction: { x: 0, y: 0, z: -1 },
      };
      const params = { keepOriginal: false };
      const expectedResult = [{ type: 'Curve', projected: true }];

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await projectCurveNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('PROJECT_CURVE', {
        curve: inputs.curve,
        target: inputs.target,
        direction: inputs.direction,
        keepOriginal: params.keepOriginal,
      });
      expect(result).toEqual({ projected: expectedResult });
    });

    it('should handle projection without direction', async () => {
      const inputs = {
        curve: { type: 'Curve' },
        target: { type: 'Plane' },
      };
      const params = { keepOriginal: true };

      mockContext.worker.invoke.mockResolvedValue([]);

      await projectCurveNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('PROJECT_CURVE', {
        curve: inputs.curve,
        target: inputs.target,
        direction: undefined,
        keepOriginal: true,
      });
    });
  });

  describe('Curve Intersection Node', () => {
    it('should find curve intersections', async () => {
      const inputs = {
        curveA: { type: 'Curve', id: 'curve-1' },
        curveB: { type: 'Curve', id: 'curve-2' },
      };
      const params = { tolerance: 0.001 };
      const expectedResult = {
        points: [{ x: 5, y: 5, z: 0 }],
        paramsA: [0.5],
        paramsB: [0.5],
      };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await curveIntersectionNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('CURVE_INTERSECTION', {
        curveA: inputs.curveA,
        curveB: inputs.curveB,
        tolerance: params.tolerance,
      });
      expect(result).toEqual({
        points: expectedResult.points,
        parametersA: expectedResult.paramsA,
        parametersB: expectedResult.paramsB,
      });
    });

    it('should handle no intersections', async () => {
      const inputs = {
        curveA: { type: 'Curve' },
        curveB: { type: 'Curve' },
      };
      const params = { tolerance: 0.01 };

      mockContext.worker.invoke.mockResolvedValue({
        points: [],
        paramsA: [],
        paramsB: [],
      });

      const result = await curveIntersectionNode.execute(inputs, params, mockContext);

      expect(result.points).toEqual([]);
      expect(result.parametersA).toEqual([]);
      expect(result.parametersB).toEqual([]);
    });

    it('should validate tolerance bounds', () => {
      const params = curveIntersectionNode.params;
      expect(params.tolerance.min).toBe(0.0001);
      expect(params.tolerance.max).toBe(1);
      expect(params.tolerance.default).toBe(0.001);
    });
  });
});
