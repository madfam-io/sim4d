/**
 * GeomCore Adapter
 *
 * Bridges sim4d's IntegratedGeometryAPI interface with @madfam/geom-core SDK.
 * This adapter enables gradual migration from sim4d's engine-occt to geom-core's
 * zero-lag architecture while maintaining full API compatibility.
 *
 * Key Features:
 * - Operation name mapping (MAKE_BOX → makeBox)
 * - Result format conversion (OperationResult compatibility)
 * - Drop-in replacement for IntegratedGeometryAPI
 * - Supports both local WASM and remote GPU compute routing
 *
 * @module engine-occt/geom-core-adapter
 */

import type { GeomCoreSDK, GeomCoreConfig } from '@madfam/geom-core';
import type {
  GeometryEngine,
  ShapeHandle as GeomCoreShapeHandle,
  OperationResult as GeomCoreOperationResult,
  Vec3,
  MeshData,
  BoxParams,
  SphereParams,
  CylinderParams,
  ConeParams,
  TorusParams,
  BooleanUnionParams,
  BooleanSubtractParams,
  BooleanIntersectParams,
  ExtrudeParams,
  RevolveParams,
  SweepParams,
  LoftParams,
  FilletParams,
  ChamferParams,
  ShellParams,
  DraftParams,
  OffsetParams,
  TranslateParams,
  RotateParams,
  ScaleParams,
  MirrorParams,
  LineParams,
  CircleParams,
  RectangleParams,
  ArcParams,
  PolygonParams,
  ImportParams,
  ExportParams,
  AssemblyParams,
  MateParams,
  PatternParams,
  TessellateOptions,
} from '@madfam/geom-core';

import type { ShapeHandle, MeshData as Sim4dMeshData } from '@brepflow/types';
import { getLogger } from './production-logger';

const logger = getLogger('GeomCoreAdapter');

// =============================================================================
// Operation Name Mapping
// =============================================================================

/**
 * Maps sim4d operation names to geom-core SDK method names
 */
export const OPERATION_MAP: Record<string, string> = {
  // 3D Primitives
  MAKE_BOX: 'makeBox',
  MAKE_SPHERE: 'makeSphere',
  MAKE_CYLINDER: 'makeCylinder',
  MAKE_CONE: 'makeCone',
  MAKE_TORUS: 'makeTorus',

  // 2D Primitives
  CREATE_LINE: 'createLine',
  CREATE_CIRCLE: 'createCircle',
  CREATE_RECTANGLE: 'createRectangle',
  CREATE_ARC: 'createArc',
  CREATE_POLYGON: 'createPolygon',

  // Boolean Operations
  BOOLEAN_UNION: 'booleanUnion',
  BOOLEAN_SUBTRACT: 'booleanSubtract',
  BOOLEAN_INTERSECT: 'booleanIntersect',

  // Feature Operations
  MAKE_EXTRUDE: 'extrude',
  MAKE_REVOLVE: 'revolve',
  MAKE_SWEEP: 'sweep',
  MAKE_LOFT: 'loft',
  MAKE_FILLET: 'fillet',
  MAKE_CHAMFER: 'chamfer',
  MAKE_SHELL: 'shell',
  MAKE_DRAFT: 'draft',
  MAKE_OFFSET: 'offset',

  // Transforms
  TRANSFORM_MOVE: 'translate',
  TRANSFORM_ROTATE: 'rotate',
  TRANSFORM_SCALE: 'scale',
  TRANSFORM_MIRROR: 'mirror',

  // Analysis
  TESSELLATE: 'tessellate',
  GET_PROPERTIES: 'getProperties',
  GET_VOLUME: 'getVolume',
  GET_SURFACE_AREA: 'getSurfaceArea',
  GET_CENTER_OF_MASS: 'getCenterOfMass',

  // I/O Operations
  IMPORT_STEP: 'importFile',
  EXPORT_STEP: 'exportFile',
  EXPORT_STL: 'exportFile',

  // Memory Management
  DISPOSE: 'disposeShape',
  CLEANUP: 'disposeAll',
};

// =============================================================================
// Result Conversion
// =============================================================================

/**
 * Converts geom-core OperationResult to sim4d OperationResult format
 */
export interface Sim4dOperationResult<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
  performance?: {
    duration: number;
    memoryUsed: number;
    cacheHit: boolean;
  };
  fallbackUsed?: boolean;
  retryCount?: number;
}

function convertResult<T>(geomResult: GeomCoreOperationResult<T>): Sim4dOperationResult<T> {
  return {
    success: geomResult.success,
    result: geomResult.value,
    error: geomResult.error?.message,
    performance: {
      duration: geomResult.durationMs ?? 0,
      memoryUsed: geomResult.memoryUsedBytes ?? 0,
      cacheHit: geomResult.wasCached ?? false,
    },
    fallbackUsed: geomResult.executedRemotely ?? false,
    retryCount: 0,
  };
}

/**
 * Converts sim4d ShapeHandle to geom-core format (they're compatible)
 */
function toGeomCoreShape(shape: ShapeHandle): GeomCoreShapeHandle {
  return shape as unknown as GeomCoreShapeHandle;
}

/**
 * Converts geom-core ShapeHandle to sim4d format
 */
function toSim4dShape(shape: GeomCoreShapeHandle): ShapeHandle {
  return shape as unknown as ShapeHandle;
}

// =============================================================================
// Parameter Conversion
// =============================================================================

/**
 * Converts sim4d operation parameters to geom-core parameter format
 */
function convertParams(
  operation: string,
  params: Record<string, unknown>
): Record<string, unknown> {
  switch (operation) {
    case 'MAKE_BOX':
      return {
        width: params.width,
        height: params.height,
        depth: params.depth,
        center: params.center,
      } as unknown as Record<string, unknown>;

    case 'MAKE_SPHERE':
      return {
        radius: params.radius,
        center: params.center,
      } as unknown as Record<string, unknown>;

    case 'MAKE_CYLINDER':
      return {
        radius: params.radius,
        height: params.height,
        center: params.center,
        axis: params.axis,
      } as unknown as Record<string, unknown>;

    case 'MAKE_CONE':
      return {
        radius1: params.radius1 ?? params.radius,
        radius2: params.radius2 ?? 0,
        height: params.height,
        center: params.center,
        axis: params.axis,
      } as unknown as Record<string, unknown>;

    case 'MAKE_TORUS':
      return {
        majorRadius: params.majorRadius ?? params.radius,
        minorRadius: params.minorRadius ?? params.tubeRadius,
        center: params.center,
        axis: params.axis,
      } as unknown as Record<string, unknown>;

    case 'BOOLEAN_UNION':
      return {
        shapes: params.shapes,
      } as unknown as Record<string, unknown>;

    case 'BOOLEAN_SUBTRACT':
      return {
        base: params.base,
        tools: params.tools,
      } as unknown as Record<string, unknown>;

    case 'BOOLEAN_INTERSECT':
      return {
        shapes: params.shapes,
      } as unknown as Record<string, unknown>;

    case 'MAKE_EXTRUDE':
      return {
        profile: params.profile,
        direction: params.direction,
        distance: params.distance,
      } as unknown as Record<string, unknown>;

    case 'MAKE_REVOLVE':
      return {
        profile: params.profile,
        center: params.origin,
        axis: params.direction,
        angle: params.angle,
      } as unknown as Record<string, unknown>;

    case 'MAKE_SWEEP':
      return {
        profile: params.profile,
        path: params.path,
      } as unknown as Record<string, unknown>;

    case 'MAKE_LOFT':
      return {
        profiles: params.profiles,
        solid: !params.ruled,
      } as unknown as Record<string, unknown>;

    case 'MAKE_FILLET':
      return {
        shape: params.shape,
        radius: params.radius,
        edges: params.edges,
      } as unknown as Record<string, unknown>;

    case 'MAKE_CHAMFER':
      return {
        shape: params.shape,
        distance: params.distance,
        edges: params.edges,
      } as unknown as Record<string, unknown>;

    case 'MAKE_SHELL':
      return {
        shape: params.shape,
        thickness: params.thickness,
        facesToRemove: params.faces,
      } as unknown as Record<string, unknown>;

    case 'MAKE_OFFSET':
      return {
        shape: params.shape,
        distance: params.distance,
        join: params.join,
      } as unknown as Record<string, unknown>;

    case 'TRANSFORM_MOVE':
      return {
        shape: params.shape,
        vector: params.offset,
      } as unknown as Record<string, unknown>;

    case 'TRANSFORM_ROTATE':
      return {
        shape: params.shape,
        center: params.origin,
        axis: params.axis,
        angle: params.angle,
      } as unknown as Record<string, unknown>;

    case 'TRANSFORM_SCALE':
      return {
        shape: params.shape,
        center: params.origin,
        factor: typeof params.scale === 'number' ? params.scale : 1,
      } as unknown as Record<string, unknown>;

    case 'TRANSFORM_MIRROR':
      return {
        shape: params.shape,
        point: params.origin,
        normal: convertPlaneToNormal(params.plane as string),
      } as unknown as Record<string, unknown>;

    case 'TESSELLATE':
      return {
        shape: params.shape,
        deflection: params.deflection ?? 0.1,
        angle: params.angle ?? 0.5,
      };

    case 'IMPORT_STEP':
      return {
        data: params.data ?? params.filepath,
        format: 'step',
        filename: params.filepath,
      } as unknown as Record<string, unknown>;

    case 'EXPORT_STEP':
      return {
        shape: params.shapes?.[0] ?? params.shape,
        format: 'step',
      } as unknown as Record<string, unknown>;

    case 'EXPORT_STL':
      return {
        shape: params.shape,
        format: 'stl',
        options: {
          binary: params.binary ?? true,
          deflection: params.deflection ?? 0.1,
        },
      } as unknown as Record<string, unknown>;

    default:
      return params;
  }
}

function convertPlaneToNormal(plane?: string): Vec3 {
  switch (plane) {
    case 'XY':
      return { x: 0, y: 0, z: 1 };
    case 'XZ':
      return { x: 0, y: 1, z: 0 };
    case 'YZ':
      return { x: 1, y: 0, z: 0 };
    default:
      return { x: 0, y: 0, z: 1 };
  }
}

// =============================================================================
// Adapter Configuration
// =============================================================================

export interface GeomCoreAdapterConfig {
  /** Enable geom-core adapter (default: true) */
  enabled?: boolean;
  /** Fall back to original API on adapter errors (default: true) */
  fallbackOnError?: boolean;
  /** Log adapter operations (default: false) */
  verbose?: boolean;
  /** GeomCore SDK configuration */
  sdkConfig?: GeomCoreConfig;
}

export const DEFAULT_ADAPTER_CONFIG: Required<GeomCoreAdapterConfig> = {
  enabled: true,
  fallbackOnError: true,
  verbose: false,
  sdkConfig: {
    enableRemoteCompute: false,
    enablePrecomputation: true,
    maxMemoryBytes: 512 * 1024 * 1024,
    slowOperationThresholdMs: 100,
  },
};

// =============================================================================
// GeomCore Adapter
// =============================================================================

/**
 * Adapter that bridges sim4d's IntegratedGeometryAPI with geom-core SDK.
 * Provides drop-in replacement capability for gradual migration.
 */
export class GeomCoreAdapter {
  private sdk: GeomCoreSDK | null = null;
  private engine: GeometryEngine | null = null;
  private config: Required<GeomCoreAdapterConfig>;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(config: GeomCoreAdapterConfig = {}) {
    this.config = { ...DEFAULT_ADAPTER_CONFIG, ...config };
    logger.info('[GeomCoreAdapter] Created with config:', this.config);
  }

  /**
   * Initialize the adapter with geom-core engine and SDK
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.performInit();
    return this.initPromise;
  }

  private async performInit(): Promise<void> {
    try {
      logger.info('[GeomCoreAdapter] Initializing...');

      // Dynamic import to handle the file: dependency
      const geomCore = await import('@madfam/geom-core');

      // Load OCCT WASM module from engine-occt's existing loader
      const { loadOCCT } = await import('./occt-bindings');
      const occtModule = await loadOCCT();

      // Create engine with OCCT module (cast to WASMModule as both are the same OCCT instance)
      this.engine = geomCore.createGeometryEngine(
        occtModule as unknown as Parameters<typeof geomCore.createGeometryEngine>[0]
      );

      // Create SDK with configuration
      this.sdk = geomCore.createGeomCoreSDK(this.engine, this.config.sdkConfig);

      this.initialized = true;
      logger.info('[GeomCoreAdapter] Initialization complete');
    } catch (error) {
      logger.error('[GeomCoreAdapter] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check if adapter is initialized
   */
  get isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Invoke a geometry operation through geom-core
   */
  async invoke<T = unknown>(
    operation: string,
    params: Record<string, unknown>
  ): Promise<Sim4dOperationResult<T>> {
    if (!this.config.enabled) {
      return {
        success: false,
        error: 'GeomCore adapter is disabled',
      };
    }

    await this.init();

    if (!this.sdk || !this.engine) {
      return {
        success: false,
        error: 'GeomCore SDK not initialized',
      };
    }

    const methodName = OPERATION_MAP[operation];
    if (!methodName) {
      logger.warn(`[GeomCoreAdapter] Unknown operation: ${operation}`);
      return {
        success: false,
        error: `Unknown operation: ${operation}`,
      };
    }

    try {
      if (this.config.verbose) {
        logger.info(`[GeomCoreAdapter] ${operation} → ${methodName}`, params);
      }

      const convertedParams = convertParams(operation, params);
      const result = await this.executeOperation<T>(methodName, convertedParams);

      if (this.config.verbose) {
        logger.info(`[GeomCoreAdapter] ${operation} result:`, result);
      }

      return result;
    } catch (error) {
      logger.error(`[GeomCoreAdapter] ${operation} failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute an operation on the SDK or engine
   */
  private async executeOperation<T>(
    methodName: string,
    params: Record<string, unknown>
  ): Promise<Sim4dOperationResult<T>> {
    if (!this.sdk || !this.engine) {
      throw new Error('SDK not initialized');
    }

    // SDK async methods (with smart routing)
    const sdkMethods: Record<string, (p: unknown) => Promise<GeomCoreOperationResult<unknown>>> = {
      makeBox: (p) => this.sdk!.makeBox(p as BoxParams),
      makeSphere: (p) => this.sdk!.makeSphere(p as SphereParams),
      makeCylinder: (p) => this.sdk!.makeCylinder(p as CylinderParams),
      makeCone: (p) => this.sdk!.makeCone(p as ConeParams),
      makeTorus: (p) => this.sdk!.makeTorus(p as TorusParams),
      booleanUnion: (p) => this.sdk!.booleanUnion(p as BooleanUnionParams),
      booleanSubtract: (p) => this.sdk!.booleanSubtract(p as BooleanSubtractParams),
      booleanIntersect: (p) => this.sdk!.booleanIntersect(p as BooleanIntersectParams),
      extrude: (p) => this.sdk!.extrude(p as ExtrudeParams),
      revolve: (p) => this.sdk!.revolve(p as RevolveParams),
      sweep: (p) => this.sdk!.sweep(p as SweepParams),
      loft: (p) => this.sdk!.loft(p as LoftParams),
      fillet: (p) => this.sdk!.fillet(p as FilletParams),
      chamfer: (p) => this.sdk!.chamfer(p as ChamferParams),
      shell: (p) => this.sdk!.shell(p as ShellParams),
      offset: (p) => this.sdk!.offset(p as OffsetParams),
      translate: (p) => this.sdk!.translate(p as TranslateParams),
      rotate: (p) => this.sdk!.rotate(p as RotateParams),
      scale: (p) => this.sdk!.scale(p as ScaleParams),
      mirror: (p) => this.sdk!.mirror(p as MirrorParams),
      tessellate: (p) => {
        const { shape, ...opts } = p as { shape: string } & TessellateOptions;
        return this.sdk!.tessellate(shape, opts);
      },
      getProperties: (p) => this.sdk!.getProperties((p as { shape: string }).shape),
      getVolume: (p) => this.sdk!.getVolume((p as { shape: string }).shape),
      getSurfaceArea: (p) => this.sdk!.getSurfaceArea((p as { shape: string }).shape),
    };

    // Engine direct methods (sync, no routing)
    const engineMethods: Record<string, (p: unknown) => GeomCoreOperationResult<unknown>> = {
      createLine: (p) => this.engine!.createLine(p as LineParams),
      createCircle: (p) => this.engine!.createCircle(p as CircleParams),
      createRectangle: (p) => this.engine!.createRectangle(p as RectangleParams),
      createArc: (p) => this.engine!.createArc(p as ArcParams),
      createPolygon: (p) => this.engine!.createPolygon(p as PolygonParams),
      draft: (p) => this.engine!.draft(p as DraftParams),
      importFile: (p) => this.engine!.importFile(p as ImportParams),
      exportFile: (p) => this.engine!.exportFile(p as ExportParams),
      getCenterOfMass: (p) => this.engine!.getCenterOfMass((p as { shape: string }).shape),
      disposeShape: (p) => {
        const success = this.engine!.disposeShape((p as { handle: string }).handle);
        return { success, value: undefined };
      },
      disposeAll: () => {
        this.engine!.disposeAll();
        return { success: true, value: undefined };
      },
    };

    // Try SDK method first (async with routing)
    if (sdkMethods[methodName]) {
      const result = await sdkMethods[methodName](params);
      return convertResult<T>(result as GeomCoreOperationResult<T>);
    }

    // Fall back to engine method (sync)
    if (engineMethods[methodName]) {
      const result = engineMethods[methodName](params);
      return convertResult<T>(result as GeomCoreOperationResult<T>);
    }

    throw new Error(`Unknown method: ${methodName}`);
  }

  /**
   * Tessellate a shape to mesh data
   */
  async tessellate(
    shape: ShapeHandle,
    tolerance: number = 0.1
  ): Promise<Sim4dOperationResult<Sim4dMeshData>> {
    await this.init();

    if (!this.sdk) {
      return {
        success: false,
        error: 'SDK not initialized',
      };
    }

    const result = await this.sdk.tessellate(shape.id, {
      deflection: tolerance,
    });

    return convertResult<Sim4dMeshData>(result as GeomCoreOperationResult<Sim4dMeshData>);
  }

  /**
   * Get adapter statistics
   */
  getStats(): {
    initialized: boolean;
    enabled: boolean;
    sdkStats?: ReturnType<GeomCoreSDK['getStats']>;
  } {
    return {
      initialized: this.initialized,
      enabled: this.config.enabled,
      sdkStats: this.sdk?.getStats(),
    };
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    if (this.sdk) {
      this.sdk.dispose();
      this.sdk = null;
    }
    this.engine = null;
    this.initialized = false;
    this.initPromise = null;
    logger.info('[GeomCoreAdapter] Disposed');
  }
}

// =============================================================================
// Factory Functions
// =============================================================================

let globalAdapter: GeomCoreAdapter | null = null;

/**
 * Get or create the global GeomCore adapter
 */
export function getGeomCoreAdapter(config?: GeomCoreAdapterConfig): GeomCoreAdapter {
  if (!globalAdapter) {
    globalAdapter = new GeomCoreAdapter(config);
  }
  return globalAdapter;
}

/**
 * Create a new GeomCore adapter instance
 */
export function createGeomCoreAdapter(config?: GeomCoreAdapterConfig): GeomCoreAdapter {
  return new GeomCoreAdapter(config);
}

/**
 * Shutdown the global adapter
 */
export function shutdownGlobalAdapter(): void {
  if (globalAdapter) {
    globalAdapter.dispose();
    globalAdapter = null;
  }
}
