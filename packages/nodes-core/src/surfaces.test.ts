import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  nurbsSurfaceNode,
  loftSurfaceNode,
  networkSurfaceNode,
  patchSurfaceNode,
  offsetSurfaceNode,
  surfaceCurvatureNode,
  isotrimNode,
  surfaceSplitNode,
  blendSurfacesNode,
} from './surfaces';

describe('Surface Nodes', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      worker: {
        invoke: vi.fn(),
      },
    };
  });

  describe('NURBS Surface Node', () => {
    it('should create NURBS surface from control point grid', async () => {
      const inputs = {
        points: [
          [
            { x: 0, y: 0, z: 0 },
            { x: 10, y: 0, z: 0 },
            { x: 20, y: 0, z: 0 },
          ],
          [
            { x: 0, y: 10, z: 0 },
            { x: 10, y: 10, z: 5 },
            { x: 20, y: 10, z: 0 },
          ],
        ],
        weights: [
          [1, 1, 1],
          [1, 2, 1],
        ],
      };
      const params = { degreeU: 3, degreeV: 3 };
      const expectedResult = { type: 'Surface', id: 'nurbs-surf-1' };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await nurbsSurfaceNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('CREATE_NURBS_SURFACE', {
        points: inputs.points,
        weights: inputs.weights,
        degreeU: params.degreeU,
        degreeV: params.degreeV,
      });
      expect(result).toEqual({ surface: expectedResult });
    });

    it('should handle surface without weights', async () => {
      const inputs = {
        points: [[{ x: 0, y: 0, z: 0 }]],
      };
      const params = { degreeU: 2, degreeV: 2 };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Surface' });

      await nurbsSurfaceNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('CREATE_NURBS_SURFACE', {
        points: inputs.points,
        weights: undefined,
        degreeU: 2,
        degreeV: 2,
      });
    });

    it('should validate degree bounds', () => {
      const params = nurbsSurfaceNode.params;
      expect(params.degreeU.min).toBe(1);
      expect(params.degreeU.max).toBe(7);
      expect(params.degreeV.min).toBe(1);
      expect(params.degreeV.max).toBe(7);
    });
  });

  describe('Loft Surface Node', () => {
    it('should create loft surface from curves', async () => {
      const inputs = {
        curves: [
          { type: 'Curve', id: 'c1' },
          { type: 'Curve', id: 'c2' },
          { type: 'Curve', id: 'c3' },
        ],
        guides: [
          { type: 'Curve', id: 'g1' },
          { type: 'Curve', id: 'g2' },
        ],
      };
      const params = { closed: false, smooth: true, rebuild: false };
      const expectedResult = { type: 'Surface', lofted: true };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await loftSurfaceNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('LOFT_SURFACE', {
        curves: inputs.curves,
        guides: inputs.guides,
        closed: params.closed,
        smooth: params.smooth,
        rebuild: params.rebuild,
      });
      expect(result).toEqual({ surface: expectedResult });
    });

    it('should handle closed loft', async () => {
      const inputs = {
        curves: [{ type: 'Curve' }, { type: 'Curve' }],
      };
      const params = { closed: true, smooth: false, rebuild: true };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Surface' });

      await loftSurfaceNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('LOFT_SURFACE', {
        curves: inputs.curves,
        guides: undefined,
        closed: true,
        smooth: false,
        rebuild: true,
      });
    });
  });

  describe('Network Surface Node', () => {
    it('should create network surface from curve grids', async () => {
      const inputs = {
        uCurves: [
          { type: 'Curve', id: 'u1' },
          { type: 'Curve', id: 'u2' },
        ],
        vCurves: [
          { type: 'Curve', id: 'v1' },
          { type: 'Curve', id: 'v2' },
        ],
      };
      const params = { continuity: 'G1', tolerance: 0.01 };
      const expectedResult = { type: 'Surface', network: true };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await networkSurfaceNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('NETWORK_SURFACE', {
        uCurves: inputs.uCurves,
        vCurves: inputs.vCurves,
        continuity: params.continuity,
        tolerance: params.tolerance,
      });
      expect(result).toEqual({ surface: expectedResult });
    });

    it('should support different continuity levels', () => {
      const params = networkSurfaceNode.params;
      expect(params.continuity.options).toEqual(['G0', 'G1', 'G2']);
      expect(params.continuity.default).toBe('G1');
    });

    it('should validate tolerance bounds', () => {
      const params = networkSurfaceNode.params;
      expect(params.tolerance.min).toBe(0.001);
      expect(params.tolerance.max).toBe(1);
      expect(params.tolerance.default).toBe(0.01);
    });
  });

  describe('Patch Surface Node', () => {
    it('should create patch surface from boundaries', async () => {
      const inputs = {
        boundaries: [
          { type: 'Curve', id: 'b1' },
          { type: 'Curve', id: 'b2' },
          { type: 'Curve', id: 'b3' },
          { type: 'Curve', id: 'b4' },
        ],
        internal: [{ type: 'Curve', id: 'i1' }],
      };
      const params = { spans: 10, flexibility: 1 };
      const expectedResult = { type: 'Surface', patch: true };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await patchSurfaceNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('PATCH_SURFACE', {
        boundaries: inputs.boundaries,
        internal: inputs.internal,
        spans: params.spans,
        flexibility: params.flexibility,
      });
      expect(result).toEqual({ surface: expectedResult });
    });

    it('should handle patch without internal curves', async () => {
      const inputs = {
        boundaries: [{ type: 'Curve' }],
      };
      const params = { spans: 20, flexibility: 2.5 };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Surface' });

      await patchSurfaceNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('PATCH_SURFACE', {
        boundaries: inputs.boundaries,
        internal: undefined,
        spans: 20,
        flexibility: 2.5,
      });
    });
  });

  describe('Offset Surface Node', () => {
    it('should offset surface by distance', async () => {
      const inputs = {
        surface: { type: 'Surface', id: 'surf-1' },
      };
      const params = { distance: 10, solid: false };
      const expectedResult = { type: 'Surface', offset: true };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await offsetSurfaceNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('OFFSET_SURFACE', {
        surface: inputs.surface,
        distance: params.distance,
        createSolid: params.solid,
      });
      expect(result).toEqual({ offset: expectedResult });
    });

    it('should create solid offset when requested', async () => {
      const inputs = { surface: { type: 'Surface' } };
      const params = { distance: -5, solid: true };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Solid' });

      await offsetSurfaceNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('OFFSET_SURFACE', {
        surface: inputs.surface,
        distance: -5,
        createSolid: true,
      });
    });
  });

  describe('Surface Curvature Node', () => {
    it('should analyze surface curvature', async () => {
      const inputs = {
        surface: { type: 'Surface', id: 'surf-1' },
        points: [
          { x: 5, y: 5, z: 0 },
          { x: 10, y: 10, z: 0 },
        ],
      };
      const params = { samplesU: 20, samplesV: 20 };
      const expectedResult = {
        gaussian: [0.1, 0.2],
        mean: [0.15, 0.25],
        principal1: [0.1, 0.2],
        principal2: [0.2, 0.3],
      };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await surfaceCurvatureNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('SURFACE_CURVATURE', {
        surface: inputs.surface,
        points: inputs.points,
        samplesU: params.samplesU,
        samplesV: params.samplesV,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should handle analysis without specific points', async () => {
      const inputs = {
        surface: { type: 'Surface' },
      };
      const params = { samplesU: 10, samplesV: 10 };

      mockContext.worker.invoke.mockResolvedValue({
        gaussian: [],
        mean: [],
        principal1: [],
        principal2: [],
      });

      await surfaceCurvatureNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('SURFACE_CURVATURE', {
        surface: inputs.surface,
        points: undefined,
        samplesU: 10,
        samplesV: 10,
      });
    });
  });

  describe('Isotrim Node', () => {
    it('should extract surface region', async () => {
      const inputs = {
        surface: { type: 'Surface', id: 'surf-1' },
      };
      const params = { uMin: 0.2, uMax: 0.8, vMin: 0.3, vMax: 0.7 };
      const expectedResult = { type: 'Surface', trimmed: true };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await isotrimNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('ISOTRIM', {
        surface: inputs.surface,
        uMin: params.uMin,
        uMax: params.uMax,
        vMin: params.vMin,
        vMax: params.vMax,
      });
      expect(result).toEqual({ trimmed: expectedResult });
    });

    it('should validate UV parameter bounds', () => {
      const params = isotrimNode.params;
      expect(params.uMin.min).toBe(0);
      expect(params.uMin.max).toBe(1);
      expect(params.uMax.min).toBe(0);
      expect(params.uMax.max).toBe(1);
      expect(params.vMin.min).toBe(0);
      expect(params.vMin.max).toBe(1);
      expect(params.vMax.min).toBe(0);
      expect(params.vMax.max).toBe(1);
    });
  });

  describe('Surface Split Node', () => {
    it('should split surface with curves', async () => {
      const inputs = {
        surface: { type: 'Surface', id: 'surf-1' },
        splitters: [
          { type: 'Curve', id: 'split-1' },
          { type: 'Curve', id: 'split-2' },
        ],
      };
      const params = { keepAll: true, tolerance: 0.01 };
      const expectedResult = [
        { type: 'Surface', fragment: 1 },
        { type: 'Surface', fragment: 2 },
      ];

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await surfaceSplitNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('SPLIT_SURFACE', {
        surface: inputs.surface,
        splitters: inputs.splitters,
        keepAll: params.keepAll,
        tolerance: params.tolerance,
      });
      expect(result).toEqual({ fragments: expectedResult });
    });

    it('should handle selective fragment keeping', async () => {
      const inputs = {
        surface: { type: 'Surface' },
        splitters: [{ type: 'Surface' }],
      };
      const params = { keepAll: false, tolerance: 0.001 };

      mockContext.worker.invoke.mockResolvedValue([{ type: 'Surface' }]);

      await surfaceSplitNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('SPLIT_SURFACE', {
        surface: inputs.surface,
        splitters: inputs.splitters,
        keepAll: false,
        tolerance: 0.001,
      });
    });
  });

  describe('Blend Surfaces Node', () => {
    it('should blend between two surfaces', async () => {
      const inputs = {
        surface1: { type: 'Surface', id: 'surf-1' },
        surface2: { type: 'Surface', id: 'surf-2' },
        edge1: { type: 'Curve', id: 'edge-1' },
        edge2: { type: 'Curve', id: 'edge-2' },
      };
      const params = { continuity: 'G1', bulge: 0.5 };
      const expectedResult = { type: 'Surface', blended: true };

      mockContext.worker.invoke.mockResolvedValue(expectedResult);

      const result = await blendSurfacesNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('BLEND_SURFACES', {
        surface1: inputs.surface1,
        surface2: inputs.surface2,
        edge1: inputs.edge1,
        edge2: inputs.edge2,
        continuity: params.continuity,
        bulge: params.bulge,
      });
      expect(result).toEqual({ blend: expectedResult });
    });

    it('should blend without specified edges', async () => {
      const inputs = {
        surface1: { type: 'Surface' },
        surface2: { type: 'Surface' },
      };
      const params = { continuity: 'G2', bulge: 1.0 };

      mockContext.worker.invoke.mockResolvedValue({ type: 'Surface' });

      await blendSurfacesNode.execute(inputs, params, mockContext);

      expect(mockContext.worker.invoke).toHaveBeenCalledWith('BLEND_SURFACES', {
        surface1: inputs.surface1,
        surface2: inputs.surface2,
        edge1: undefined,
        edge2: undefined,
        continuity: 'G2',
        bulge: 1.0,
      });
    });

    it('should validate continuity options', () => {
      const params = blendSurfacesNode.params;
      expect(params.continuity.options).toEqual(['G0', 'G1', 'G2']);
      expect(params.continuity.default).toBe('G1');
    });
  });
});
