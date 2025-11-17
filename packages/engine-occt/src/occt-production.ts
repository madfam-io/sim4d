/**
 * Production OCCT Integration Module
 * Complete implementation with real OCCT C++ bindings
 */

import type { WorkerResponse } from './worker-types';
import type { ShapeHandle, MeshData, BoundingBox } from '@brepflow/types';

// Type definitions for the OCCT WASM module
export interface OCCTModule {
  // Primitive creation
  makeBox(dx: number, dy: number, dz: number): ShapeHandle;
  makeBoxWithOrigin(
    x: number,
    y: number,
    z: number,
    dx: number,
    dy: number,
    dz: number
  ): ShapeHandle;
  makeSphere(radius: number): ShapeHandle;
  makeSphereWithCenter(cx: number, cy: number, cz: number, radius: number): ShapeHandle;
  makeCylinder(radius: number, height: number): ShapeHandle;
  makeCone(radius1: number, radius2: number, height: number): ShapeHandle;
  makeTorus(majorRadius: number, minorRadius: number): ShapeHandle;

  // Advanced operations
  extrude(profileId: string, dx: number, dy: number, dz: number): ShapeHandle;
  revolve(
    profileId: string,
    angle: number,
    axisX: number,
    axisY: number,
    axisZ: number,
    originX: number,
    originY: number,
    originZ: number
  ): ShapeHandle;

  // Boolean operations
  booleanUnion(shape1Id: string, shape2Id: string): ShapeHandle;
  booleanSubtract(shape1Id: string, shape2Id: string): ShapeHandle;
  booleanIntersect(shape1Id: string, shape2Id: string): ShapeHandle;

  // Feature operations
  makeFillet(shapeId: string, radius: number): ShapeHandle;
  makeChamfer(shapeId: string, distance: number): ShapeHandle;
  makeShell(shapeId: string, thickness: number): ShapeHandle;

  // Transformation operations
  transform(
    shapeId: string,
    tx: number,
    ty: number,
    tz: number,
    rx: number,
    ry: number,
    rz: number,
    sx: number,
    sy: number,
    sz: number
  ): ShapeHandle;
  copyShape(shapeId: string): ShapeHandle;

  // Tessellation
  tessellate(shapeId: string, precision?: number, angle?: number): MeshData;

  // File I/O
  importSTEP(fileData: string): ShapeHandle;
  exportSTEP(shapeId: string): string;
  exportSTL(shapeId: string, binary?: boolean): string;

  // Memory management
  deleteShape(shapeId: string): void;
  getShapeCount(): number;
  clearAllShapes(): void;

  // Status
  getStatus(): string;
  getOCCTVersion(): string;

  // Vector types
  VectorFloat: any;
  VectorUint: any;
  VectorString: any;
}

// Global module instance
let occtModule: OCCTModule | null = null;
let initializationPromise: Promise<OCCTModule> | null = null;

/**
 * Load and initialize the OCCT WASM module
 */
export async function loadOCCTProduction(): Promise<OCCTModule> {
  // Return existing module if already loaded
  if (occtModule) {
    return occtModule;
  }

  // Return existing initialization promise if in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start new initialization
  initializationPromise = initializeOCCT();
  return initializationPromise;
}

/**
 * Internal initialization function
 */
async function initializeOCCT(): Promise<OCCTModule> {
  try {
    console.log('[OCCT Production] Loading WASM module...');

    // Construct proper URL for WASM module based on environment
    const isWorker = typeof self !== 'undefined' && typeof window === 'undefined';
    const isBrowser = typeof window !== 'undefined';

    const resolveLocalModule = () => {
      try {
        return new URL(/* @vite-ignore */ '../wasm/occt-core.js', import.meta.url).href;
      } catch (error) {
        console.error('[OCCT Production] Failed to resolve local module path:', error);
        return '/wasm/occt-core.js';
      }
    };

    let wasmModuleUrl: string;

    if (isWorker) {
      const origin = (self as any)?.location?.origin;
      if (origin && origin !== 'null') {
        wasmModuleUrl = `${origin}/wasm/occt.js`;
      } else {
        wasmModuleUrl = resolveLocalModule();
      }
      console.log('[OCCT Production] Worker context - using URL:', wasmModuleUrl);
    } else if (isBrowser) {
      wasmModuleUrl = '/wasm/occt.js';
      console.log('[OCCT Production] Main thread context - using path:', wasmModuleUrl);
    } else {
      wasmModuleUrl = resolveLocalModule();
      console.log('[OCCT Production] Node context - using local module:', wasmModuleUrl);
    }

    // Try to load the module - first attempt with fetch for worker context
    let createModule: any;

    const importModule = async (specifier: string): Promise<any> => {
      const shouldSpoofProcess = isWorker && !isBrowser && specifier.startsWith('file://');
      let originalDescriptor: PropertyDescriptor | undefined;

      if (shouldSpoofProcess) {
        try {
          originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'process');
          Object.defineProperty(globalThis, 'process', {
            value: { type: 'renderer' },
            configurable: true,
          });
          console.log('[OCCT Production] Spoofing process global for WASM import');
        } catch (error) {
          console.warn('[OCCT Production] Unable to spoof process for WASM import:', error);
        }
      }

      try {
        return await import(/* @vite-ignore */ specifier);
      } finally {
        if (shouldSpoofProcess) {
          try {
            if (originalDescriptor) {
              Object.defineProperty(globalThis, 'process', originalDescriptor);
            } else {
              delete (globalThis as any).process;
            }
          } catch (error) {
            console.warn('[OCCT Production] Unable to restore process global:', error);
          }
        }
      }
    };

    try {
      if (wasmModuleUrl.startsWith('http')) {
        console.log('[OCCT Production] Fetching module from:', wasmModuleUrl);
        const response = await fetch(wasmModuleUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch WASM module: ${response.status} ${response.statusText}`);
        }
        const moduleText = await response.text();
        const blob = new Blob([moduleText], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        createModule = await import(/* @vite-ignore */ blobUrl);
        URL.revokeObjectURL(blobUrl);
      } else {
        createModule = await importModule(wasmModuleUrl);
      }
    } catch (error) {
      console.error('[OCCT Production] Failed to load module:', error);

      const localHref = resolveLocalModule();
      if (localHref && localHref !== wasmModuleUrl) {
        console.log('[OCCT Production] Retrying with local module reference:', localHref);
        createModule = await importModule(localHref);
        wasmModuleUrl = localHref;
      } else {
        throw new Error(
          `WASM module loading failed: ${error instanceof Error ? error.message : error}`
        );
      }
    }

    // Configure module initialization
    const moduleConfig = {
      locateFile: (path: string) => {
        if (path.endsWith('.wasm')) {
          if (wasmModuleUrl.startsWith('http')) {
            if (isWorker) {
              const origin = self.location?.origin || 'http://localhost:5173';
              return `${origin}/wasm/${path}`;
            }
            return `/wasm/${path}`;
          }
          return new URL(/* @vite-ignore */ `../wasm/${path}`, import.meta.url).href;
        }
        return path;
      },

      // Configure for web worker environment
      environment: 'web,worker',

      // Memory configuration
      INITIAL_MEMORY: 256 * 1024 * 1024, // 256MB initial
      MAXIMUM_MEMORY: 2 * 1024 * 1024 * 1024, // 2GB max
      ALLOW_MEMORY_GROWTH: true,

      // Threading configuration (if supported)
      USE_PTHREADS: typeof SharedArrayBuffer !== 'undefined',
      PTHREAD_POOL_SIZE: 4,

      // Error handling
      onAbort: (what: any) => {
        console.error('[OCCT Production] WASM abort:', what);
        throw new Error(`OCCT WASM aborted: ${what}`);
      },

      // Progress tracking
      onRuntimeInitialized: () => {
        console.log('[OCCT Production] Runtime initialized');
      },

      print: (text: string) => {
        console.log('[OCCT]', text);
      },

      printErr: (text: string) => {
        console.error('[OCCT Error]', text);
      },
    };

    // Create the module instance
    // @ts-ignore - WASM module types
    occtModule = await createModule.default(moduleConfig);

    if (!occtModule) {
      throw new Error('Failed to create OCCT module instance');
    }

    // Verify the module is working
    const version = occtModule.getOCCTVersion();
    const status = occtModule.getStatus();

    console.log('[OCCT Production] Module loaded successfully');
    console.log('[OCCT Production] Version:', version);
    console.log('[OCCT Production] Status:', status);

    // Run a basic test
    try {
      const testBox = occtModule.makeBox(10, 10, 10);
      if (testBox && testBox.id) {
        console.log('[OCCT Production] Test box created:', testBox.id);
        occtModule.deleteShape(testBox.id);
        console.log('[OCCT Production] Geometry operations verified ✅');
      } else {
        console.warn('[OCCT Production] Test box creation returned invalid result');
      }
    } catch (testError) {
      console.error('[OCCT Production] Test failed:', testError);
      // Don't throw - module may still be usable
    }

    return occtModule;
  } catch (error) {
    console.error('[OCCT Production] Failed to load module:', error);

    // Reset state on failure
    occtModule = null;
    initializationPromise = null;

    throw new Error(
      `OCCT module loading failed: ${error instanceof Error ? error.message : error}`
    );
  }
}

/**
 * Production-ready geometry API implementation
 */
export class OCCTProductionAPI {
  private module: OCCTModule | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initialize();
  }

  private normalizeOperationType(type: string): string {
    const normalized = type.toUpperCase();
    if (normalized.startsWith('MAKE_')) {
      return normalized.slice(5);
    }
    switch (normalized) {
      case 'BOOLEAN_DIFFERENCE':
      case 'BOOLEAN_CUT':
        return 'BOOLEAN_SUBTRACT';
      case 'BOOLEAN_INTERSECTION':
        return 'BOOLEAN_INTERSECT';
      default:
        return normalized;
    }
  }

  private hasModuleMethod(name: keyof OCCTModule | string): boolean {
    return !!this.module && typeof (this.module as any)[name] === 'function';
  }

  private guardModuleMethod(name: keyof OCCTModule | string): void {
    if (!this.hasModuleMethod(name)) {
      throw new Error(`OCCT module does not expose required operation '${name}' in this build`);
    }
  }

  private toFiniteNumber(value: unknown, fallback = 0): number {
    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  private buildBoundingBox(source: any): BoundingBox {
    if (source?.bbox?.min && source?.bbox?.max) {
      return source.bbox;
    }

    const min = {
      x: this.toFiniteNumber(source?.bbox_min_x ?? source?.min?.x),
      y: this.toFiniteNumber(source?.bbox_min_y ?? source?.min?.y),
      z: this.toFiniteNumber(source?.bbox_min_z ?? source?.min?.z),
    };

    const max = {
      x: this.toFiniteNumber(source?.bbox_max_x ?? source?.max?.x),
      y: this.toFiniteNumber(source?.bbox_max_y ?? source?.max?.y),
      z: this.toFiniteNumber(source?.bbox_max_z ?? source?.max?.z),
    };

    return { min, max };
  }

  private toVector3(
    value: any,
    fallback: [number, number, number] = [0, 0, 0]
  ): [number, number, number] {
    if (Array.isArray(value) && value.length >= 3) {
      return [
        this.toFiniteNumber(value[0]),
        this.toFiniteNumber(value[1]),
        this.toFiniteNumber(value[2]),
      ];
    }

    if (value && typeof value === 'object') {
      return [
        this.toFiniteNumber(value.x ?? (value as any)[0]),
        this.toFiniteNumber(value.y ?? (value as any)[1]),
        this.toFiniteNumber(value.z ?? (value as any)[2]),
      ];
    }

    return fallback;
  }

  private getShapeId(shape: any): string {
    if (typeof shape === 'string') {
      return shape;
    }

    if (shape && typeof shape.id === 'string') {
      return shape.id;
    }

    throw new Error('Shape reference must provide an id string');
  }

  private normalizeShapeHandle(handle: any, fallbackType = 'SOLID'): any {
    if (!handle || !handle.id) {
      throw new Error('OCCT module returned an invalid shape handle');
    }

    const shapeType = (handle.type ?? fallbackType ?? 'UNKNOWN').toString().toUpperCase();

    return {
      type: 'Shape',
      shapeType,
      id: handle.id,
      hash: handle.hash,
      bbox: this.buildBoundingBox(handle),
      volume: handle.volume,
      area: handle.area,
      metadata: handle.metadata ?? {},
      raw: handle,
    };
  }

  private buildHealthPayload() {
    return {
      healthy: !!this.module,
      usingRealOCCT: this.usingRealOCCT,
      backend: 'occt-wasm',
      version: this.module?.getOCCTVersion?.(),
      status: this.module?.getStatus?.(),
      shapeCount: this.module?.getShapeCount?.() ?? 0,
      timestamp: Date.now(),
    };
  }

  private buildMemoryUsage() {
    const shapeCount = this.module?.getShapeCount?.() ?? 0;
    const memorySample =
      typeof performance !== 'undefined' && 'memory' in performance
        ? (performance as any).memory
        : null;

    const toMB = (value: number | undefined) =>
      typeof value === 'number' ? Number((value / (1024 * 1024)).toFixed(2)) : undefined;

    return {
      shapeCount,
      heapUsedMB: memorySample ? toMB(memorySample.usedJSHeapSize) : undefined,
      heapTotalMB: memorySample ? toMB(memorySample.totalJSHeapSize) : undefined,
      timestamp: Date.now(),
    };
  }

  private resolveBoundingBoxFromParams(shapeParam: any): BoundingBox {
    if (!shapeParam) {
      throw new Error('Shape parameter is required for GET_BOUNDING_BOX');
    }

    if (shapeParam.bbox || shapeParam.bbox_min_x !== undefined) {
      return this.buildBoundingBox(shapeParam);
    }

    throw new Error('Shape handle does not include bounding box information');
  }

  private async initialize(): Promise<void> {
    try {
      this.module = await loadOCCTProduction();
    } catch (error) {
      console.error('[OCCTProductionAPI] Initialization failed:', error);
      throw error;
    }
  }

  async ensureInitialized(): Promise<void> {
    await this.initPromise;
    if (!this.module) {
      throw new Error('OCCT module not initialized');
    }
  }

  /**
   * Execute a geometry command
   */
  async execute(command: WorkerCommand): Promise<WorkerResponse> {
    await this.ensureInitialized();

    if (!this.module) {
      throw new Error('OCCT module not available');
    }

    try {
      let result: any;
      const params = command.params ?? {};
      const operation = this.normalizeOperationType(command.type);

      switch (operation) {
        case 'BOX': {
          const width = this.toFiniteNumber(params.width ?? params.dx ?? params.depth ?? 1);
          const height = this.toFiniteNumber(params.height ?? params.dy ?? width);
          const depth = this.toFiniteNumber(params.depth ?? params.dz ?? height);
          let handle: ShapeHandle;

          if (params.center) {
            const [cx, cy, cz] = this.toVector3(params.center);
            handle = this.module.makeBoxWithOrigin(
              cx - width / 2,
              cy - height / 2,
              cz - depth / 2,
              width,
              height,
              depth
            );
          } else {
            handle = this.module.makeBox(width, height, depth);
          }

          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'SPHERE': {
          const radius = this.toFiniteNumber(
            params.radius ?? (params.diameter ? params.diameter / 2 : 1)
          );
          let handle: ShapeHandle;

          if (params.center) {
            const [cx, cy, cz] = this.toVector3(params.center);
            handle = this.module.makeSphereWithCenter(cx, cy, cz, radius);
          } else {
            handle = this.module.makeSphere(radius);
          }

          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'CYLINDER': {
          const radius = this.toFiniteNumber(
            params.radius ?? (params.diameter ? params.diameter / 2 : 1)
          );
          const height = this.toFiniteNumber(params.height ?? params.length ?? 1);
          const handle = this.module.makeCylinder(radius, height);
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'CONE': {
          const radius1 = this.toFiniteNumber(params.radius1 ?? params.bottomRadius ?? 1);
          const radius2 = this.toFiniteNumber(params.radius2 ?? params.topRadius ?? 0);
          const height = this.toFiniteNumber(params.height ?? 1);
          const handle = this.module.makeCone(radius1, radius2, height);
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'TORUS': {
          const majorRadius = this.toFiniteNumber(params.majorRadius ?? params.outerRadius ?? 1);
          const minorRadius = this.toFiniteNumber(params.minorRadius ?? params.innerRadius ?? 0.25);
          const handle = this.module.makeTorus(majorRadius, minorRadius);
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'EXTRUDE': {
          const profile = params.profile ?? params.profileId;
          if (!profile) {
            throw new Error('EXTRUDE operation requires a profile handle');
          }

          const direction = this.toVector3(
            params.direction ?? [0, 0, this.toFiniteNumber(params.distance ?? 1)]
          );

          const handle = this.module.extrude(
            this.getShapeId(profile),
            direction[0],
            direction[1],
            direction[2]
          );
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'REVOLVE': {
          const profile = params.profile ?? params.profileId;
          if (!profile) {
            throw new Error('REVOLVE operation requires a profile handle');
          }

          const axis = this.toVector3(params.axis ?? [0, 0, 1]);
          const origin = this.toVector3(params.origin ?? [0, 0, 0]);
          const angle = this.toFiniteNumber(params.angle ?? params.degrees ?? 360);

          const handle = this.module.revolve(
            this.getShapeId(profile),
            angle,
            axis[0],
            axis[1],
            axis[2],
            origin[0],
            origin[1],
            origin[2]
          );
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'SWEEP': {
          this.guardModuleMethod('makeSweep');
          const profile = this.getShapeId(params.profile);
          const path = this.getShapeId(params.path);
          const options = params.options ?? {};
          const handle = (this.module as any).makeSweep(profile, path, options);
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'LOFT': {
          this.guardModuleMethod('makeLoft');
          const sections = Array.isArray(params.sections) ? params.sections : [];
          if (sections.length < 2) {
            throw new Error('LOFT operation requires at least two section handles');
          }
          const sectionIds = sections.map((section) => this.getShapeId(section));
          const handle = (this.module as any).makeLoft(sectionIds, params.options ?? {});
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'FILLET': {
          const shapeId = this.getShapeId(params.shape);
          const radius = this.toFiniteNumber(params.radius ?? params.size ?? 0.5);
          const handle = this.module.makeFillet(shapeId, radius);
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'CHAMFER': {
          const shapeId = this.getShapeId(params.shape);
          const distance = this.toFiniteNumber(params.distance ?? params.size ?? 0.5);
          const handle = this.module.makeChamfer(shapeId, distance);
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'SHELL': {
          const shapeId = this.getShapeId(params.shape);
          const thickness = this.toFiniteNumber(params.thickness ?? params.offset ?? 1);
          const handle = this.module.makeShell(shapeId, thickness);
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'OFFSET': {
          this.guardModuleMethod('makeOffset');
          const shapeId = this.getShapeId(params.shape);
          const offset = this.toFiniteNumber(params.offset ?? params.distance ?? 1);
          const handle = (this.module as any).makeOffset(shapeId, offset, params.options ?? {});
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'TRANSFORM': {
          const shapeId = this.getShapeId(params.shape);
          const translation = this.toVector3(params.translation);
          const rotation = this.toVector3(params.rotation);
          const scale = this.toVector3(params.scale ?? [1, 1, 1], [1, 1, 1]);
          const handle = this.module.transform(
            shapeId,
            translation[0],
            translation[1],
            translation[2],
            rotation[0],
            rotation[1],
            rotation[2],
            scale[0],
            scale[1],
            scale[2]
          );
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'COPY_SHAPE': {
          const shapeId = this.getShapeId(params.shape);
          const handle = this.module.copyShape(shapeId);
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'BOOLEAN_UNION': {
          const shapeRefs = Array.isArray(params.shapes)
            ? params.shapes
            : [params.shape1, params.shape2].filter(Boolean);

          if (!shapeRefs || shapeRefs.length < 2) {
            throw new Error('BOOLEAN_UNION requires at least two shapes');
          }

          let workingHandle: any = null;
          let currentId = this.getShapeId(shapeRefs[0]);

          for (let i = 1; i < shapeRefs.length; i++) {
            const nextId = this.getShapeId(shapeRefs[i]);
            workingHandle = this.module.booleanUnion(currentId, nextId);
            currentId = workingHandle.id;
          }

          result = this.normalizeShapeHandle(workingHandle);
          break;
        }

        case 'BOOLEAN_SUBTRACT': {
          const base = params.base ?? params.shape ?? params.shape1;
          const tools = Array.isArray(params.tools)
            ? params.tools
            : [params.tool, params.shape2].filter(Boolean);

          if (!base || !tools.length) {
            throw new Error('BOOLEAN_SUBTRACT requires a base shape and at least one tool');
          }

          let workingHandle: any = null;
          let currentId = this.getShapeId(base);

          for (const tool of tools) {
            const toolId = this.getShapeId(tool);
            workingHandle = this.module.booleanSubtract(currentId, toolId);
            currentId = workingHandle.id;
          }

          result = this.normalizeShapeHandle(workingHandle);
          break;
        }

        case 'BOOLEAN_INTERSECT': {
          const shapeRefs = Array.isArray(params.shapes)
            ? params.shapes
            : [params.shape1, params.shape2].filter(Boolean);

          if (!shapeRefs || shapeRefs.length < 2) {
            throw new Error('BOOLEAN_INTERSECT requires at least two shapes');
          }

          let workingHandle: any = null;
          let currentId = this.getShapeId(shapeRefs[0]);

          for (let i = 1; i < shapeRefs.length; i++) {
            const nextId = this.getShapeId(shapeRefs[i]);
            workingHandle = this.module.booleanIntersect(currentId, nextId);
            currentId = workingHandle.id;
          }

          result = this.normalizeShapeHandle(workingHandle);
          break;
        }

        case 'TESSELLATE': {
          const shapeId = this.getShapeId(params.shape);
          const precision = this.toFiniteNumber(params.precision ?? params.deflection ?? 0.1);
          const angle = this.toFiniteNumber(params.angle ?? 0.5);
          const mesh = this.module.tessellate(shapeId, precision, angle);

          result = {
            mesh: {
              positions:
                mesh.positions instanceof Float32Array
                  ? mesh.positions
                  : new Float32Array(mesh.positions ?? []),
              normals:
                mesh.normals instanceof Float32Array
                  ? mesh.normals
                  : new Float32Array(mesh.normals ?? []),
              indices:
                mesh.indices instanceof Uint32Array
                  ? mesh.indices
                  : new Uint32Array(mesh.indices ?? []),
              uvs: mesh.uvs instanceof Float32Array ? mesh.uvs : undefined,
            },
            bbox: params.shape?.bbox,
          };
          break;
        }

        case 'IMPORT_STEP': {
          const fileData = params.fileData ?? params.data;
          if (!fileData) {
            throw new Error('IMPORT_STEP requires file data');
          }
          const handle = this.module.importSTEP(fileData);
          result = this.normalizeShapeHandle(handle);
          break;
        }

        case 'EXPORT_STEP': {
          const shapeId = this.getShapeId(params.shape);
          result = this.module.exportSTEP(shapeId);
          break;
        }

        case 'EXPORT_STL': {
          const shapeId = this.getShapeId(params.shape);
          const binary = params.binary !== undefined ? Boolean(params.binary) : true;
          result = this.module.exportSTL(shapeId, binary);
          break;
        }

        case 'EXPORT_IGES': {
          this.guardModuleMethod('exportIGES');
          const shapeId = this.getShapeId(params.shape);
          result = (this.module as any).exportIGES(shapeId);
          break;
        }

        case 'EXPORT_OBJ': {
          this.guardModuleMethod('exportOBJ');
          const shapeId = this.getShapeId(params.shape);
          result = (this.module as any).exportOBJ(shapeId);
          break;
        }

        case 'EXPORT_BREP': {
          this.guardModuleMethod('exportBREP');
          const shapeId = this.getShapeId(params.shape);
          result = (this.module as any).exportBREP(shapeId);
          break;
        }

        case 'DELETE_SHAPE': {
          const shapeId = this.getShapeId(params.shape);
          this.module.deleteShape(shapeId);
          result = { success: true };
          break;
        }

        case 'CLEAR_ALL': {
          this.module.clearAllShapes();
          result = { success: true };
          break;
        }

        case 'GET_STATUS': {
          result = {
            status: this.module.getStatus(),
            version: this.module.getOCCTVersion(),
            shapeCount: this.module.getShapeCount(),
          };
          break;
        }

        case 'HEALTH_CHECK': {
          result = this.buildHealthPayload();
          break;
        }

        case 'GET_MEMORY_USAGE': {
          result = this.buildMemoryUsage();
          break;
        }

        case 'GET_BOUNDING_BOX': {
          result = this.resolveBoundingBoxFromParams(params.shape);
          break;
        }

        default:
          throw new Error(`Unknown command: ${command.type}`);
      }

      return {
        id: command.id,
        type: command.type,
        result,
        success: true,
      };
    } catch (error) {
      console.error('[OCCTProductionAPI] Command failed:', command.type, error);

      return {
        id: command.id,
        type: command.type,
        error: error instanceof Error ? error.message : String(error),
        success: false,
      };
    }
  }

  /**
   * Get module status
   */
  getStatus(): { initialized: boolean; version?: string; shapeCount?: number } {
    if (!this.module) {
      return { initialized: false };
    }

    try {
      return {
        initialized: true,
        version: this.module.getOCCTVersion(),
        shapeCount: this.module.getShapeCount(),
      };
    } catch (error) {
      return { initialized: false };
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.module) {
      try {
        this.module.clearAllShapes();
      } catch (error) {
        console.error('[OCCTProductionAPI] Disposal error:', error);
      }
    }
    this.module = null;
  }
}

// Export singleton instance
export const occtProductionAPI = new OCCTProductionAPI();
