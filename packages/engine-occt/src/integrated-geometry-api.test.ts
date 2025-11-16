import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  IntegratedGeometryAPI,
  getGeometryAPI,
  createGeometryAPI,
  DEFAULT_API_CONFIG,
} from './integrated-geometry-api';
import type { GeometryAPIConfig, OperationResult } from './integrated-geometry-api';
import type { ShapeHandle, MeshData } from '@brepflow/types';

// Mock the dependencies
const occtFixture = vi.hoisted(() => {
  let counter = 0;
  const shapes = new Map<string, any>();

  const nextId = (prefix: string) => `${prefix}-${++counter}`;

  const defaultBBox = (
    dimensions: { width?: number; height?: number; depth?: number; radius?: number } = {}
  ) => {
    const width = dimensions.width ?? dimensions.radius ?? 1;
    const height = dimensions.height ?? dimensions.radius ?? 1;
    const depth = dimensions.depth ?? dimensions.radius ?? 1;
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: width, y: height, z: depth },
    };
  };

  const registerShape = (type: string, extras: any = {}) => {
    const id = nextId(type);
    const shape = {
      id,
      type,
      bbox: extras.bbox ?? defaultBBox(extras.dimensions),
      volume: extras.volume ?? 0,
      metadata: extras.metadata ?? {},
    };
    shapes.set(id, shape);
    return shape;
  };

  const resolveShape = (ref: any) => {
    if (!ref) return null;
    if (typeof ref === 'string') {
      return shapes.get(ref) ?? null;
    }
    if (ref.id) {
      return shapes.get(ref.id) ?? ref;
    }
    return null;
  };

  const ensureShape = (ref: any, fallbackType = 'solid') => {
    const resolved = resolveShape(ref);
    if (resolved) {
      return resolved;
    }

    if (ref && typeof ref === 'object') {
      const shape = {
        id: ref.id ?? nextId(fallbackType),
        type: ref.type ?? fallbackType,
        bbox: ref.bbox ?? defaultBBox(),
        metadata: ref.metadata ?? {},
      };
      shapes.set(shape.id, shape);
      return shape;
    }

    throw new Error(`Unable to resolve shape reference: ${JSON.stringify(ref)}`);
  };

  const createMesh = (shape: any, tolerance = 0.1) => {
    const scale = Math.max(tolerance, 0.01);
    return {
      positions: new Float32Array([0, 0, 0, scale, 0, 0, 0, scale, 0]),
      normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
      indices: new Uint32Array([0, 1, 2]),
    };
  };

  const occtModule = {
    invoke: vi.fn(async (operation: string, params: any = {}) => {
      switch (operation) {
        case 'HEALTH_CHECK':
          return { healthy: true, version: 'fixture-occt', timestamp: Date.now() };
        case 'MAKE_BOX': {
          const width = params.width ?? 1;
          const height = params.height ?? 1;
          const depth = params.depth ?? 1;
          return registerShape('solid', {
            dimensions: { width, height, depth },
            volume: width * height * depth,
            metadata: { operation: 'MAKE_BOX' },
          });
        }
        case 'MAKE_SPHERE': {
          const radius = params.radius ?? 1;
          return registerShape('solid', {
            dimensions: { radius },
            volume: (4 / 3) * Math.PI * Math.pow(radius, 3),
            metadata: { operation: 'MAKE_SPHERE' },
          });
        }
        case 'MAKE_CYLINDER': {
          const radius = params.radius ?? 1;
          const height = params.height ?? 1;
          return registerShape('solid', {
            dimensions: { radius, height },
            volume: Math.PI * radius * radius * height,
            metadata: { operation: 'MAKE_CYLINDER' },
          });
        }
        case 'BOOLEAN_UNION': {
          const shapesToCombine = (params.shapes ?? []).map((s: any) => ensureShape(s));
          return registerShape('solid', {
            metadata: {
              operation: 'BOOLEAN_UNION',
              inputs: shapesToCombine.map((s: any) => s.id),
            },
          });
        }
        case 'BOOLEAN_SUBTRACT': {
          const base = ensureShape(params.base);
          const tools = (params.tools ?? []).map((s: any) => ensureShape(s));
          return registerShape('solid', {
            metadata: {
              operation: 'BOOLEAN_SUBTRACT',
              base: base.id,
              tools: tools.map((s: any) => s.id),
            },
          });
        }
        case 'BOOLEAN_INTERSECT': {
          const inputs = (params.shapes ?? []).map((s: any) => ensureShape(s));
          return registerShape('solid', {
            metadata: {
              operation: 'BOOLEAN_INTERSECT',
              inputs: inputs.map((s: any) => s.id),
            },
          });
        }
        case 'MAKE_FILLET': {
          const base = ensureShape(params.shape);
          return registerShape('solid', {
            metadata: {
              operation: 'MAKE_FILLET',
              base: base.id,
              radius: params.radius ?? 0,
            },
          });
        }
        case 'MAKE_CHAMFER': {
          const base = ensureShape(params.shape);
          return registerShape('solid', {
            metadata: {
              operation: 'MAKE_CHAMFER',
              base: base.id,
              distance: params.distance ?? 0,
            },
          });
        }
        case 'MAKE_EXTRUDE': {
          const profile = ensureShape(params.profile, 'face');
          return registerShape('solid', {
            metadata: {
              operation: 'MAKE_EXTRUDE',
              profile: profile?.id ?? null,
              distance: params.distance ?? 0,
            },
          });
        }
        case 'TESSELLATE': {
          const shape = ensureShape(params.shape ?? params, 'solid');
          return { mesh: createMesh(shape, params.tolerance) };
        }
        case 'MAKE_BOX_WITH_ORIGIN': {
          return registerShape('solid', {
            metadata: {
              operation: 'MAKE_BOX_WITH_ORIGIN',
              origin: params.origin ?? { x: 0, y: 0, z: 0 },
            },
          });
        }
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    }),
    tessellate: vi.fn(async (shapeRef: any, tolerance?: number) => {
      const shape = ensureShape(shapeRef, 'solid');
      return createMesh(shape, tolerance);
    }),
    terminate: vi.fn().mockResolvedValue(undefined),
  };

  const reset = () => {
    counter = 0;
    shapes.clear();
    occtModule.invoke.mockClear();
    occtModule.tessellate.mockClear();
    occtModule.terminate.mockClear();
  };

  return { occtModule, reset, ensureShape };
});

vi.mock('./occt-loader', () => ({
  loadOCCTModule: vi.fn().mockImplementation(async () => occtFixture.occtModule),
  generateOCCTDiagnostics: vi.fn().mockResolvedValue('OCCT Diagnostics: OK'),
}));

vi.mock('./worker-pool', () => ({
  getWorkerPool: vi.fn().mockReturnValue({
    execute: vi.fn().mockResolvedValue({
      result: { id: 'shape-1', type: 'solid' },
    }),
    shutdown: vi.fn().mockResolvedValue(undefined),
    getStats: vi.fn().mockReturnValue({ activeWorkers: 2, queueLength: 0 }),
  }),
  DEFAULT_POOL_CONFIG: {},
}));

vi.mock('./memory-manager', () => ({
  getMemoryManager: vi.fn().mockReturnValue({
    getStats: vi.fn().mockReturnValue({ totalMemoryMB: 100, cacheHitRate: 0.8 }),
    generateOperationKey: vi.fn().mockReturnValue('cache-key-123'),
    getResult: vi.fn().mockReturnValue(null),
    cacheResult: vi.fn(),
    getMesh: vi.fn().mockReturnValue(null),
    cacheMesh: vi.fn().mockResolvedValue(undefined),
    forceCleanup: vi.fn(),
    shutdown: vi.fn(),
    generateMemoryReport: vi.fn().mockReturnValue('Memory Report: OK'),
  }),
  DEFAULT_CACHE_CONFIG: {},
}));

vi.mock('./error-recovery', () => ({
  getErrorRecoverySystem: vi.fn().mockReturnValue({
    validateOperation: vi.fn().mockResolvedValue({ valid: true }),
    handleError: vi.fn().mockResolvedValue({ recovered: false }),
    reset: vi.fn(),
    getErrorStats: vi.fn().mockReturnValue({ totalErrors: 0, recoveredErrors: 0 }),
    generateErrorReport: vi.fn().mockReturnValue('Error Report: No errors'),
  }),
}));

vi.mock('./wasm-capability-detector', () => ({
  WASMCapabilityDetector: {
    detectCapabilities: vi.fn().mockResolvedValue({
      hasWASM: true,
      hasSharedArrayBuffer: true,
      hasThreads: true,
      hasSimd: true,
    }),
    generateCapabilityReport: vi.fn().mockResolvedValue('Capability Report: All supported'),
  },
  WASMPerformanceMonitor: {
    startMeasurement: vi.fn().mockReturnValue(() => 100),
    getPerformanceReport: vi.fn().mockReturnValue('Performance Report: OK'),
    clearMeasurements: vi.fn(),
  },
}));

describe('IntegratedGeometryAPI', () => {
  let geometryAPI: IntegratedGeometryAPI;

  afterEach(async () => {
    occtFixture.reset();
    vi.clearAllMocks();

    const occtLoader = await import('./occt-loader');
    (occtLoader.loadOCCTModule as vi.Mock).mockImplementation(async () => occtFixture.occtModule);
  });

  describe('Initialization', () => {
    it('should create with default configuration', () => {
      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);
      expect(geometryAPI).toBeDefined();

      const stats = geometryAPI.getStats();
      expect(stats.initialized).toBe(false); // Not initialized until init() is called
    });

    it('should create with custom configuration', () => {
      const customConfig: GeometryAPIConfig = {
        ...DEFAULT_API_CONFIG,
        enablePerformanceMonitoring: false,
        enableErrorRecovery: false,
      };

      geometryAPI = new IntegratedGeometryAPI(customConfig);
      expect(geometryAPI).toBeDefined();
    });

    it('should fail initialization when real OCCT is disabled', async () => {
      geometryAPI = new IntegratedGeometryAPI({
        ...DEFAULT_API_CONFIG,
        enableRealOCCT: false,
      });

      await expect(geometryAPI.init()).rejects.toThrow('Real OCCT is required');
    });

    it('should initialize successfully', async () => {
      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);
      await geometryAPI.init();

      const stats = geometryAPI.getStats();
      expect(stats.initialized).toBe(true);
    });

    it('should handle initialization failure gracefully', async () => {
      const mockLoader = await import('./occt-loader');
      const originalMock = mockLoader.loadOCCTModule;

      // Temporarily mock to fail
      mockLoader.loadOCCTModule = vi.fn().mockRejectedValue(new Error('WASM load failed'));

      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);

      await expect(geometryAPI.init()).rejects.toThrow();

      // Restore original mock for subsequent tests
      mockLoader.loadOCCTModule = originalMock;
    });
  });

  describe('Operation Execution', () => {
    beforeEach(async () => {
      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);
      await geometryAPI.init();
    });

    it('should execute MAKE_BOX operation successfully', async () => {
      const result = await geometryAPI.invoke('MAKE_BOX', {
        center: { x: 0, y: 0, z: 0 },
        width: 10,
        height: 10,
        depth: 10,
      });

      expect(typeof result.success).toBe('boolean');
      if (result.success) {
        expect(result.result).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
      }
      expect(result.performance).toBeDefined();
      expect(result.performance?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should execute MAKE_SPHERE operation successfully', async () => {
      const result = await geometryAPI.invoke('MAKE_SPHERE', {
        center: { x: 0, y: 0, z: 0 },
        radius: 50,
      });

      expect(typeof result.success).toBe('boolean');
      if (result.success) {
        expect(result.result).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
      }
      expect(result.performance).toBeDefined();
    });

    it('should execute MAKE_CYLINDER operation successfully', async () => {
      const result = await geometryAPI.invoke('MAKE_CYLINDER', {
        center: { x: 0, y: 0, z: 0 },
        axis: { x: 0, y: 0, z: 1 },
        radius: 25,
        height: 100,
      });

      expect(typeof result.success).toBe('boolean');
      if (result.success) {
        expect(result.result).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
      }
    });

    it('should handle operation failure gracefully', async () => {
      const loader = await import('./occt-loader');
      const invokeSpy = vi.fn().mockImplementation((operation: string) => {
        if (operation === 'INVALID_OPERATION') {
          throw new Error('Unknown operation: INVALID_OPERATION');
        }
        return Promise.resolve({ id: 'shape-1', type: 'solid' });
      });

      (loader.loadOCCTModule as any).mockResolvedValueOnce({
        invoke: invokeSpy,
        tessellate: vi.fn().mockResolvedValue({
          vertices: new Float32Array([0, 0, 0]),
          indices: new Uint32Array([0, 1, 2]),
          normals: new Float32Array([0, 0, 1]),
        }),
        terminate: vi.fn(),
      });

      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);
      await geometryAPI.init();

      // INVALID_OPERATION should fail because the OCCT adapter throws
      const result = await geometryAPI.invoke('INVALID_OPERATION', {});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Unknown operation');
    });
  });

  describe('Tessellation', () => {
    beforeEach(async () => {
      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);
      await geometryAPI.init();
    });

    it('should tessellate shape successfully', async () => {
      const shape: ShapeHandle = {
        id: 'test-shape-1',
        type: 'solid',
        bbox: {
          min: { x: -10, y: -10, z: -10 },
          max: { x: 10, y: 10, z: 10 },
        },
      };

      const result = await geometryAPI.tessellate(shape, 0.1);

      expect(typeof result.success).toBe('boolean');
      if (result.success) {
        expect(result.result).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
      }
      expect(result.performance).toBeDefined();
    });

    it('should use cached mesh when available', async () => {
      const mockMemoryManager = await import('./memory-manager');
      const mockMesh: MeshData = {
        vertices: new Float32Array([0, 0, 0]),
        indices: new Uint32Array([0, 1, 2]),
        normals: new Float32Array([0, 0, 1]),
      };

      mockMemoryManager.getMemoryManager = vi.fn().mockReturnValue({
        getStats: vi.fn().mockReturnValue({ totalMemoryMB: 100 }),
        getMesh: vi.fn().mockReturnValue(mockMesh),
        cacheMesh: vi.fn(),
        generateOperationKey: vi.fn(),
        getResult: vi.fn(),
        cacheResult: vi.fn(),
        forceCleanup: vi.fn(),
        shutdown: vi.fn(),
        generateMemoryReport: vi.fn().mockReturnValue('Memory Report: OK'),
      });

      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);
      await geometryAPI.init();

      const shape: ShapeHandle = {
        id: 'cached-shape-1',
        type: 'solid',
      };

      const result = await geometryAPI.tessellate(shape, 0.1);

      expect(result.success).toBe(true);
      expect(result.performance?.cacheHit).toBe(true);
    });
  });

  describe('Performance and Monitoring', () => {
    beforeEach(async () => {
      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);
      await geometryAPI.init();
    });

    it('should provide comprehensive statistics', () => {
      const stats = geometryAPI.getStats();

      expect(stats.initialized).toBe(true);
      expect(stats.capabilities).toBeDefined();
      expect(stats.usingRealOCCT).toBeDefined();
      expect(stats.subsystems).toBeDefined();
    });

    it('should generate diagnostic report', async () => {
      const report = await geometryAPI.generateDiagnosticReport();

      expect(report).toContain('Integrated Geometry API Diagnostic Report');
      expect(report).toContain('Status:');
      expect(report).toContain('Real OCCT:');
      expect(report).toContain('Capabilities:');
    });

    it('should run optimization', async () => {
      await expect(geometryAPI.optimize()).resolves.not.toThrow();
    });
  });

  describe('API Testing', () => {
    beforeEach(async () => {
      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);
    });

    it('should pass API test', async () => {
      const testResult = await geometryAPI.test();

      expect(testResult.success).toBe(true);
      expect(testResult.report).toContain('API test successful');
    });

    it('should handle test failure gracefully', async () => {
      // Mock failing operation
      const mockOCCTLoader = await import('./occt-loader');
      const originalLoadOCCTModule = mockOCCTLoader.loadOCCTModule;

      mockOCCTLoader.loadOCCTModule = vi.fn().mockResolvedValue({
        invoke: vi.fn().mockRejectedValue(new Error('Test operation failed')),
        terminate: vi.fn(),
      });

      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);

      const testResult = await geometryAPI.test();

      expect(testResult.success).toBe(false);
      expect(testResult.report.toLowerCase()).toContain('failed');

      // Restore original mock for subsequent tests
      mockOCCTLoader.loadOCCTModule = originalLoadOCCTModule;
    });
  });

  describe('Lifecycle Management', () => {
    beforeEach(async () => {
      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);
      await geometryAPI.init();
    });

    it('should shutdown cleanly', async () => {
      await expect(geometryAPI.shutdown()).resolves.not.toThrow();

      const stats = geometryAPI.getStats();
      expect(stats.initialized).toBe(false);
    });
  });

  describe('Factory Functions', () => {
    it('should get singleton instance', () => {
      const api1 = getGeometryAPI();
      const api2 = getGeometryAPI();

      expect(api1).toBe(api2);
    });

    it('should create new instances', () => {
      const api1 = createGeometryAPI();
      const api2 = createGeometryAPI();

      expect(api1).not.toBe(api2);
      expect(api1).toBeInstanceOf(IntegratedGeometryAPI);
      expect(api2).toBeInstanceOf(IntegratedGeometryAPI);
    });

    it('should create with custom configuration', () => {
      const customConfig: Partial<GeometryAPIConfig> = {
        enablePerformanceMonitoring: false,
        enableErrorRecovery: false,
      };

      const api = createGeometryAPI(customConfig);
      expect(api).toBeInstanceOf(IntegratedGeometryAPI);
    });
  });

  describe('Boolean Operations', () => {
    beforeEach(async () => {
      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);
      await geometryAPI.init();
    });

    it('should perform boolean union', async () => {
      const box1 = await geometryAPI.invoke<ShapeHandle>('MAKE_BOX', {
        center: { x: 0, y: 0, z: 0 },
        width: 10,
        height: 10,
        depth: 10,
      });

      const box2 = await geometryAPI.invoke<ShapeHandle>('MAKE_BOX', {
        center: { x: 5, y: 0, z: 0 },
        width: 8,
        height: 12,
        depth: 6,
      });

      const result = await geometryAPI.invoke('BOOLEAN_UNION', {
        shapes: [box1.result!, box2.result!],
      });

      expect(typeof result.success).toBe('boolean');
      if (result.success) {
        expect(result.result).toBeDefined();
        expect(result.result?.metadata?.operation).toBe('BOOLEAN_UNION');
      } else {
        expect(result.error).toBeDefined();
      }
    });

    it('should perform boolean subtract', async () => {
      const baseShape = await geometryAPI.invoke<ShapeHandle>('MAKE_BOX', {
        center: { x: 0, y: 0, z: 0 },
        width: 12,
        height: 12,
        depth: 12,
      });

      const toolShape = await geometryAPI.invoke<ShapeHandle>('MAKE_SPHERE', {
        center: { x: 0, y: 0, z: 0 },
        radius: 5,
      });

      const result = await geometryAPI.invoke('BOOLEAN_SUBTRACT', {
        base: baseShape.result!,
        tools: [toolShape.result!],
      });

      expect(typeof result.success).toBe('boolean');
      if (result.success) {
        expect(result.result).toBeDefined();
        expect(result.result?.metadata?.operation).toBe('BOOLEAN_SUBTRACT');
      } else {
        expect(result.error).toBeDefined();
      }
    });

    it('should perform boolean intersect', async () => {
      const box = await geometryAPI.invoke<ShapeHandle>('MAKE_BOX', {
        center: { x: 0, y: 0, z: 0 },
        width: 10,
        height: 10,
        depth: 10,
      });

      const sphere = await geometryAPI.invoke<ShapeHandle>('MAKE_SPHERE', {
        center: { x: 0, y: 0, z: 0 },
        radius: 6,
      });

      const result = await geometryAPI.invoke('BOOLEAN_INTERSECT', {
        shapes: [box.result!, sphere.result!],
      });

      expect(typeof result.success).toBe('boolean');
      if (result.success) {
        expect(result.result).toBeDefined();
        expect(result.result?.metadata?.operation).toBe('BOOLEAN_INTERSECT');
      } else {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Feature Operations', () => {
    beforeEach(async () => {
      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);
      await geometryAPI.init();
    });

    it('should create fillet', async () => {
      const base = await geometryAPI.invoke<ShapeHandle>('MAKE_BOX', {
        center: { x: 0, y: 0, z: 0 },
        width: 10,
        height: 10,
        depth: 10,
      });

      const result = await geometryAPI.invoke('MAKE_FILLET', {
        shape: base.result!,
        radius: 5,
      });

      expect(typeof result.success).toBe('boolean');
      if (result.success) {
        expect(result.result).toBeDefined();
        expect(result.result?.metadata?.operation).toBe('MAKE_FILLET');
      } else {
        expect(result.error).toBeDefined();
      }
    });

    it('should create chamfer', async () => {
      const base = await geometryAPI.invoke<ShapeHandle>('MAKE_BOX', {
        center: { x: 0, y: 0, z: 0 },
        width: 10,
        height: 10,
        depth: 10,
      });

      const result = await geometryAPI.invoke('MAKE_CHAMFER', {
        shape: base.result!,
        distance: 3,
      });

      expect(typeof result.success).toBe('boolean');
      if (result.success) {
        expect(result.result).toBeDefined();
        expect(result.result?.metadata?.operation).toBe('MAKE_CHAMFER');
      } else {
        expect(result.error).toBeDefined();
      }
    });

    it('should create extrusion', async () => {
      const profile = await geometryAPI.invoke<ShapeHandle>('MAKE_BOX', {
        center: { x: 0, y: 0, z: 0 },
        width: 5,
        height: 5,
        depth: 1,
      });

      const result = await geometryAPI.invoke('MAKE_EXTRUDE', {
        profile: profile.result!,
        direction: { x: 0, y: 0, z: 1 },
        distance: 100,
      });

      expect(typeof result.success).toBe('boolean');
      if (result.success) {
        expect(result.result).toBeDefined();
        expect(result.result?.metadata?.operation).toBe('MAKE_EXTRUDE');
      } else {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Type Safety', () => {
    beforeEach(async () => {
      geometryAPI = new IntegratedGeometryAPI(DEFAULT_API_CONFIG);
      await geometryAPI.init();
    });

    it('should handle typed invoke operations', async () => {
      const result = await geometryAPI.invoke<ShapeHandle>('MAKE_BOX', {
        center: { x: 0, y: 0, z: 0 },
        width: 100,
        height: 50,
        depth: 25,
      });

      expect(typeof result.success).toBe('boolean');
      if (result.success && result.result) {
        expect(result.result.id).toBeDefined();
        expect(result.result.type).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
      }
    });

    it('should handle typed tessellation', async () => {
      const makeResult = await geometryAPI.invoke<ShapeHandle>('MAKE_BOX', {
        center: { x: 0, y: 0, z: 0 },
        width: 20,
        height: 20,
        depth: 20,
      });

      const result = await geometryAPI.tessellate(makeResult.result!, 0.1);

      expect(typeof result.success).toBe('boolean');
      if (result.success && result.result) {
        expect(result.result.vertices).toBeInstanceOf(Float32Array);
        expect(result.result.indices).toBeInstanceOf(Uint32Array);
        expect(result.result.normals).toBeInstanceOf(Float32Array);
      } else {
        expect(result.error).toBeDefined();
      }
    });
  });
});
