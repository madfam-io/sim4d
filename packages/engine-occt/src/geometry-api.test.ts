import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeometryAPI } from './geometry-api';
import type { ShapeHandle, MeshData } from '@brepflow/types';

let shapeCounter = 0;

const stubShape = (type: string): ShapeHandle => ({
  id: `${type}-${++shapeCounter}`,
  type,
  bbox: {
    min: { x: 0, y: 0, z: 0 },
    max: { x: 1, y: 1, z: 1 },
  },
});

const stubMesh = (): MeshData => ({
  positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
  normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
  indices: new Uint32Array([0, 1, 2]),
});

const wrapperStub = {
  initialize: vi.fn().mockResolvedValue(undefined),
  makeBox: vi.fn(() => stubShape('box')),
  makeBoxWithOrigin: vi.fn(() => stubShape('box-origin')),
  makeSphere: vi.fn(() => stubShape('sphere')),
  makeSphereWithCenter: vi.fn(() => stubShape('sphere-center')),
  makeCylinder: vi.fn(() => stubShape('cylinder')),
  makeCone: vi.fn(() => stubShape('cone')),
  makeTorus: vi.fn(() => stubShape('torus')),
  makeShell: vi.fn(() => stubShape('shell')),
  booleanUnion: vi.fn(() => stubShape('union')),
  booleanSubtract: vi.fn(() => stubShape('subtract')),
  booleanIntersect: vi.fn(() => stubShape('intersect')),
  makeFillet: vi.fn(() => stubShape('fillet')),
  makeChamfer: vi.fn(() => stubShape('chamfer')),
  transform: vi.fn(() => stubShape('transform')),
  copyShape: vi.fn(() => stubShape('copy')),
  tessellate: vi.fn(() => stubMesh()),
  tessellateWithParams: vi.fn(() => stubMesh()),
  extrude: vi.fn(() => stubShape('extrude')),
  revolve: vi.fn(() => stubShape('revolve')),
  exportSTEP: vi.fn(() => 'STEP DATA'),
  exportIGES: vi.fn(() => 'IGES DATA'),
  exportOBJ: vi.fn(() => 'OBJ DATA'),
  exportSTL: vi.fn(() => new ArrayBuffer(8)),
  importSTEP: vi.fn(() => stubShape('imported')),
  deleteShape: vi.fn(),
  clearAllShapes: vi.fn(),
  getShapeCount: vi.fn(() => 0),
  getOCCTVersion: vi.fn(() => 'stub-occt'),
};

vi.mock('./occt-wrapper', () => ({
  getOCCTWrapper: () => wrapperStub,
}));

describe('GeometryAPI', () => {
  beforeEach(() => {
    shapeCounter = 0;
    Object.values(wrapperStub).forEach((value) => {
      if (typeof value === 'function' && 'mockReset' in value) {
        (value as vi.Mock).mockClear();
      }
    });
  });

  it('initializes the underlying OCCT wrapper once', async () => {
    const api = new GeometryAPI();
    await api.init();
    await api.init(); // second call should be a no-op

    expect(wrapperStub.initialize).toHaveBeenCalledTimes(1);
    expect(api.isInitialized).toBe(true);
  });

  describe('primitive operations', () => {
    it('creates a box', async () => {
      const api = new GeometryAPI();
      const result = await api.invoke<ShapeHandle>('MAKE_BOX', {});

      expect(result.id).toMatch(/^box-/);
      expect(wrapperStub.makeBox).toHaveBeenCalled();
    });

    it('creates a sphere', async () => {
      const api = new GeometryAPI();
      const result = await api.invoke<ShapeHandle>('MAKE_SPHERE', {});

      expect(result.id).toMatch(/^sphere-/);
      expect(wrapperStub.makeSphere).toHaveBeenCalled();
    });
  });

  describe('boolean operations', () => {
    it('performs boolean union', async () => {
      const api = new GeometryAPI();
      // Create shapes through API so they are properly registered
      const shapeA = await api.invoke<ShapeHandle>('MAKE_BOX', {});
      const shapeB = await api.invoke<ShapeHandle>('MAKE_SPHERE', {});

      const result = await api.invoke<ShapeHandle>('BOOLEAN_UNION', { shapes: [shapeA, shapeB] });

      expect(result.id).toMatch(/^union-/);
      expect(wrapperStub.booleanUnion).toHaveBeenCalled();
    });
  });

  describe('tessellation', () => {
    it('tessellates a shape handle and caches the mesh', async () => {
      const api = new GeometryAPI();
      // Create shape through API so it is properly registered
      const shape = await api.invoke<ShapeHandle>('MAKE_BOX', {});

      const first = await api.invoke<{ mesh: MeshData }>('TESSELLATE', { shape, deflection: 0.1 });
      const second = await api.invoke<{ mesh: MeshData }>('TESSELLATE', { shape, deflection: 0.1 });

      expect(first.mesh.positions.length).toBeGreaterThan(0);
      expect(second.mesh).toBe(first.mesh); // cache hit
      expect(wrapperStub.tessellate).toHaveBeenCalledTimes(1);
    });
  });

  describe('exports', () => {
    it('exports STEP data', async () => {
      const api = new GeometryAPI();
      // Create shape through API so it is properly registered
      const shape = await api.invoke<ShapeHandle>('MAKE_BOX', {});

      const result = await api.invoke<string>('EXPORT_STEP', { shape });

      expect(result).toBe('STEP DATA');
      expect(wrapperStub.exportSTEP).toHaveBeenCalledWith(shape);
    });
  });

  it('throws on unsupported operations', async () => {
    const api = new GeometryAPI();

    await expect(api.invoke('UNKNOWN_OP', {})).rejects.toThrow('Unsupported geometry operation');
  });
});
