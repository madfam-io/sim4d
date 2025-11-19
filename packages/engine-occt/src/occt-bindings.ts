// OCCT.wasm TypeScript Bindings
// Real OCCT integration with WebAssembly

export interface OCCTModule {
  // Geometry operations
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
  tessellateWithParams(shapeId: string, precision: number, angle: number): MeshData;

  // File I/O operations
  importSTEP(fileData: string): ShapeHandle;
  exportSTEP(shapeId: string): string;
  exportSTL(shapeId: string, binary?: boolean): string;
  exportIGES?(shapeId: string): string; // Optional - may not be available in all builds
  exportOBJ?(shapeId: string): string; // Optional - may not be available in all builds

  // Memory management
  deleteShape(shapeId: string): void;
  getShapeCount(): number;
  clearAllShapes(): void;

  // Status and version
  getStatus(): string;
  getOCCTVersion(): string;

  // Vector types for interfacing with Emscripten
  VectorFloat: any;
  VectorUint: any;
}

export interface ShapeHandle {
  id: string;
  type: 'solid' | 'surface' | 'curve';
  bbox_min_x: number;
  bbox_min_y: number;
  bbox_min_z: number;
  bbox_max_x: number;
  bbox_max_y: number;
  bbox_max_z: number;
  hash: string;
  volume?: number;
  area?: number;
  centerX?: number;
  centerY?: number;
  centerZ?: number;
}

export interface MeshData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  edges: Uint32Array;
  uvs?: Float32Array;
  vertexCount?: number;
  triangleCount?: number;
  edgeCount?: number;
}

// Module loader with real OCCT WASM integration
let occtModule: OCCTModule | null = null;
let wasmModule: any = null;
let wasmLoaded = false;
let wasmLoadAttempted = false;
let wasmLoadError: Error | null = null;

/**
 * Memory management utilities for OCCT shapes
 */
export class OCCTMemoryManager {
  private static trackedShapes = new Set<string>();

  static trackShape(shapeId: string): void {
    this.trackedShapes.add(shapeId);
  }

  static untrackShape(shapeId: string): void {
    this.trackedShapes.delete(shapeId);
  }

  static getTrackedShapes(): string[] {
    return Array.from(this.trackedShapes);
  }

  static getShapeCount(): number {
    return this.trackedShapes.size;
  }

  static cleanup(): void {
    if (occtModule && wasmLoaded) {
      // Clean up all tracked shapes
      for (const shapeId of this.trackedShapes) {
        try {
          occtModule.deleteShape(shapeId);
        } catch (error) {
          console.warn(`Failed to delete shape ${shapeId}:`, error);
        }
      }
    }
    this.trackedShapes.clear();
  }
}

/**
 * Error boundary wrapper for WASM operations
 * Ensures the platform can gracefully handle WASM loading failures
 */
function createErrorBoundaryWrapper<T extends (...args: unknown[]) => any>(
  operation: string,
  fn: T
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error: any) => {
          console.error(`[OCCT] Operation '${operation}' failed:`, error);
          throw new Error(`OCCT operation '${operation}' failed: ${error.message || error}`);
        });
      }
      return result;
    } catch (error: unknown) {
      console.error(`[OCCT] Operation '${operation}' failed:`, error);
      throw new Error(`OCCT operation '${operation}' failed: ${error.message || error}`);
    }
  }) as T;
}

/**
 * Attempts to dynamically load the WASM module with proper error boundaries
 * This function will be called when WASM files are actually available
 */
async function attemptWASMLoad(): Promise<unknown> {
  // This function will attempt to load WASM when it's available
  // For now, we use a dynamic import approach that won't break Vite

  try {
    // Check if we're in Node.js environment (Vitest tests)
    const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
    const isBrowser = typeof window !== 'undefined';
    const isWorker = typeof self !== 'undefined' && typeof importScripts === 'function';

    if (isNode && !isBrowser && !isWorker) {
      console.log('[OCCT] Node.js environment detected, loading Node.js WASM module');
      // Delegate to occt-loader.ts which has Node.js support
      const { loadOCCTModule } = await import('./occt-loader');
      return await loadOCCTModule();
    }

    // Check if we're in a browser/worker environment
    // In workers, 'self' is the global scope; in browser, it's 'window'
    const globalScope: any =
      typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : null;

    if (!globalScope) {
      console.log('[OCCT] Non-browser/worker environment detected, WASM loading deferred');
      return null;
    }

    // Check for required browser features
    // SharedArrayBuffer is available on the global scope (self in workers, window in browser)
    if (!globalScope.SharedArrayBuffer) {
      console.warn(
        '[OCCT] SharedArrayBuffer not available. Real geometry requires COOP/COEP headers.'
      );
      console.warn('[OCCT] Add these headers to your server:');
      console.warn('[OCCT]   Cross-Origin-Opener-Policy: same-origin');
      console.warn('[OCCT]   Cross-Origin-Embedder-Policy: require-corp');
      return null;
    }

    const wasmCandidates = ['/wasm/occt.js', '/wasm/occt-core.js'];
    let wasmPath: string | null = null;

    for (const candidate of wasmCandidates) {
      const response = await fetch(candidate, { method: 'HEAD' }).catch(() => null);
      if (response?.ok) {
        wasmPath = candidate;
        break;
      }
    }

    if (!wasmPath) {
      console.error('[OCCT] CRITICAL: WASM files not found. ONLY real geometry is supported.');
      console.error('[OCCT] Geometry operations will fail. Check /wasm directory.');
      return null; // Fail on use, not on load
    }

    console.log('[OCCT] Loading WASM module from:', wasmPath);
    const module = await import(/* @vite-ignore */ wasmPath);
    const wasmModuleFactory = module.default || module;

    // Initialize the WASM module with public directory paths
    const wasmInstance = await wasmModuleFactory({
      locateFile: (file: string) => {
        // All WASM files are now in the public directory
        return `/wasm/${file}`;
      },
      print: (text: string) => console.log('[OCCT WASM]', text),
      printErr: (text: string) => console.error('[OCCT WASM Error]', text),
    });

    console.log('[OCCT] WASM module loaded successfully');
    return wasmInstance;
  } catch (error) {
    // WASM loading failed - allow app to start but geometry will fail on use
    console.error('[OCCT] CRITICAL: WASM loading failed. ONLY real geometry is supported.');
    console.error('[OCCT] Error:', (error as Error).message);
    console.error('[OCCT] Geometry operations will fail when attempted.');
    return null; // Fail on use, not on load
  }
}

/**
 * Flatten nested bbox structure from WASM to flat properties expected by GeometryAPI
 */
function flattenBoundingBox(shape: unknown): any {
  if (!shape) return flattenBoundingBox(shape);

  // If bbox is nested (new WASM format), flatten it
  if (shape.bbox && typeof shape.bbox === 'object' && shape.bbox.min && shape.bbox.max) {
    return {
      ...shape,
      bbox_min_x: shape.bbox.min.x,
      bbox_min_y: shape.bbox.min.y,
      bbox_min_z: shape.bbox.min.z,
      bbox_max_x: shape.bbox.max.x,
      bbox_max_y: shape.bbox.max.y,
      bbox_max_z: shape.bbox.max.z,
    };
  }

  return flattenBoundingBox(shape);
}

/**
 * Creates the real OCCT module implementation with error boundaries
 */
function createRealOCCTModule(wasm: any): OCCTModule {
  return {
    makeBox: createErrorBoundaryWrapper('makeBox', (dx: number, dy: number, dz: number) => {
      console.log(`[OCCT] Creating box: ${dx} x ${dy} x ${dz}`);
      const shape = wasm.makeBox(dx, dy, dz);
      if (!shape || !shape.id) {
        throw new Error('Invalid shape returned from WASM');
      }
      OCCTMemoryManager.trackShape(shape.id);
      return flattenBoundingBox(shape);
    }),

    makeBoxWithOrigin: createErrorBoundaryWrapper(
      'makeBoxWithOrigin',
      (x: number, y: number, z: number, dx: number, dy: number, dz: number) => {
        console.log(`[OCCT] Creating box with origin: (${x},${y},${z}) size ${dx}x${dy}x${dz}`);
        const shape = wasm.makeBoxWithOrigin(x, y, z, dx, dy, dz);
        if (!shape || !shape.id) {
          throw new Error('Invalid shape returned from WASM');
        }
        OCCTMemoryManager.trackShape(shape.id);
        return flattenBoundingBox(shape);
      }
    ),

    makeSphere: createErrorBoundaryWrapper('makeSphere', (radius: number) => {
      console.log(`[OCCT] Creating sphere: radius ${radius}`);
      const shape = wasm.makeSphere(radius);
      if (!shape || !shape.id) {
        throw new Error('Invalid shape returned from WASM');
      }
      OCCTMemoryManager.trackShape(shape.id);
      return flattenBoundingBox(shape);
    }),

    makeSphereWithCenter: createErrorBoundaryWrapper(
      'makeSphereWithCenter',
      (cx: number, cy: number, cz: number, radius: number) => {
        console.log(`[OCCT] Creating sphere with center: (${cx},${cy},${cz}) radius ${radius}`);
        const shape = wasm.makeSphereWithCenter(cx, cy, cz, radius);
        if (!shape || !shape.id) {
          throw new Error('Invalid shape returned from WASM');
        }
        OCCTMemoryManager.trackShape(shape.id);
        return flattenBoundingBox(shape);
      }
    ),

    makeCylinder: createErrorBoundaryWrapper('makeCylinder', (radius: number, height: number) => {
      console.log(`[OCCT] Creating cylinder: radius ${radius}, height ${height}`);
      const shape = wasm.makeCylinder(radius, height);
      if (!shape || !shape.id) {
        throw new Error('Invalid shape returned from WASM');
      }
      OCCTMemoryManager.trackShape(shape.id);
      return flattenBoundingBox(shape);
    }),

    makeCone: createErrorBoundaryWrapper(
      'makeCone',
      (radius1: number, radius2: number, height: number) => {
        console.log(`[OCCT] Creating cone: r1=${radius1}, r2=${radius2}, h=${height}`);
        const shape = wasm.makeCone(radius1, radius2, height);
        if (!shape || !shape.id) {
          throw new Error('Invalid shape returned from WASM');
        }
        OCCTMemoryManager.trackShape(shape.id);
        return flattenBoundingBox(shape);
      }
    ),

    makeTorus: createErrorBoundaryWrapper(
      'makeTorus',
      (majorRadius: number, minorRadius: number) => {
        console.log(`[OCCT] Creating torus: major=${majorRadius}, minor=${minorRadius}`);
        const shape = wasm.makeTorus(majorRadius, minorRadius);
        if (!shape || !shape.id) {
          throw new Error('Invalid shape returned from WASM');
        }
        OCCTMemoryManager.trackShape(shape.id);
        return flattenBoundingBox(shape);
      }
    ),

    // Advanced operations
    extrude: createErrorBoundaryWrapper(
      'extrude',
      (profileId: string, dx: number, dy: number, dz: number) => {
        console.log(`[OCCT] Extruding profile ${profileId}: (${dx}, ${dy}, ${dz})`);
        const shape = wasm.extrude(profileId, dx, dy, dz);
        if (!shape || !shape.id) {
          throw new Error('Invalid shape returned from WASM');
        }
        OCCTMemoryManager.trackShape(shape.id);
        return flattenBoundingBox(shape);
      }
    ),

    revolve: createErrorBoundaryWrapper(
      'revolve',
      (
        profileId: string,
        angle: number,
        axisX: number,
        axisY: number,
        axisZ: number,
        originX: number,
        originY: number,
        originZ: number
      ) => {
        console.log(`[OCCT] Revolving profile ${profileId}: angle=${angle}`);
        const shape = wasm.revolve(
          profileId,
          angle,
          axisX,
          axisY,
          axisZ,
          originX,
          originY,
          originZ
        );
        if (!shape || !shape.id) {
          throw new Error('Invalid shape returned from WASM');
        }
        OCCTMemoryManager.trackShape(shape.id);
        return flattenBoundingBox(shape);
      }
    ),

    // Boolean operations
    booleanUnion: createErrorBoundaryWrapper(
      'booleanUnion',
      (shape1Id: string, shape2Id: string) => {
        console.log(`[OCCT] Boolean union: ${shape1Id} + ${shape2Id}`);
        const shape = wasm.booleanUnion(shape1Id, shape2Id);
        if (!shape || !shape.id) {
          throw new Error('Invalid shape returned from WASM');
        }
        OCCTMemoryManager.trackShape(shape.id);
        OCCTMemoryManager.untrackShape(shape1Id);
        OCCTMemoryManager.untrackShape(shape2Id);
        return flattenBoundingBox(shape);
      }
    ),

    booleanSubtract: createErrorBoundaryWrapper(
      'booleanSubtract',
      (shape1Id: string, shape2Id: string) => {
        console.log(`[OCCT] Boolean subtract: ${shape1Id} - ${shape2Id}`);
        const shape = wasm.booleanSubtract(shape1Id, shape2Id);
        if (!shape || !shape.id) {
          throw new Error('Invalid shape returned from WASM');
        }
        OCCTMemoryManager.trackShape(shape.id);
        OCCTMemoryManager.untrackShape(shape1Id);
        OCCTMemoryManager.untrackShape(shape2Id);
        return flattenBoundingBox(shape);
      }
    ),

    booleanIntersect: createErrorBoundaryWrapper(
      'booleanIntersect',
      (shape1Id: string, shape2Id: string) => {
        console.log(`[OCCT] Boolean intersect: ${shape1Id} ∩ ${shape2Id}`);
        const shape = wasm.booleanIntersect(shape1Id, shape2Id);
        if (!shape || !shape.id) {
          throw new Error('Invalid shape returned from WASM');
        }
        OCCTMemoryManager.trackShape(shape.id);
        OCCTMemoryManager.untrackShape(shape1Id);
        OCCTMemoryManager.untrackShape(shape2Id);
        return flattenBoundingBox(shape);
      }
    ),

    // Feature operations
    makeFillet: createErrorBoundaryWrapper('makeFillet', (shapeId: string, radius: number) => {
      console.log(`[OCCT] Creating fillet on ${shapeId}: radius=${radius}`);
      const shape = wasm.makeFillet(shapeId, radius);
      if (!shape || !shape.id) {
        throw new Error('Invalid shape returned from WASM');
      }
      OCCTMemoryManager.trackShape(shape.id);
      OCCTMemoryManager.untrackShape(shapeId);
      return flattenBoundingBox(shape);
    }),

    makeChamfer: createErrorBoundaryWrapper('makeChamfer', (shapeId: string, distance: number) => {
      console.log(`[OCCT] Creating chamfer on ${shapeId}: distance=${distance}`);
      const shape = wasm.makeChamfer(shapeId, distance);
      if (!shape || !shape.id) {
        throw new Error('Invalid shape returned from WASM');
      }
      OCCTMemoryManager.trackShape(shape.id);
      OCCTMemoryManager.untrackShape(shapeId);
      return flattenBoundingBox(shape);
    }),

    makeShell: createErrorBoundaryWrapper('makeShell', (shapeId: string, thickness: number) => {
      console.log(`[OCCT] Creating shell from ${shapeId}: thickness=${thickness}`);
      const shape = wasm.makeShell(shapeId, thickness);
      if (!shape || !shape.id) {
        throw new Error('Invalid shape returned from WASM');
      }
      OCCTMemoryManager.trackShape(shape.id);
      OCCTMemoryManager.untrackShape(shapeId);
      return flattenBoundingBox(shape);
    }),

    // Transformation operations
    transform: createErrorBoundaryWrapper(
      'transform',
      (
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
      ) => {
        console.log(`[OCCT] Transforming ${shapeId}`);
        const shape = wasm.transform(shapeId, tx, ty, tz, rx, ry, rz, sx, sy, sz);
        if (!shape || !shape.id) {
          throw new Error('Invalid shape returned from WASM');
        }
        OCCTMemoryManager.trackShape(shape.id);
        OCCTMemoryManager.untrackShape(shapeId);
        return flattenBoundingBox(shape);
      }
    ),

    copyShape: createErrorBoundaryWrapper('copyShape', (shapeId: string) => {
      console.log(`[OCCT] Copying shape ${shapeId}`);
      const shape = wasm.copyShape(shapeId);
      if (!shape || !shape.id) {
        throw new Error('Invalid shape returned from WASM');
      }
      OCCTMemoryManager.trackShape(shape.id);
      return flattenBoundingBox(shape);
    }),

    // Tessellation
    tessellate: createErrorBoundaryWrapper(
      'tessellate',
      (shapeId: string, precision?: number, angle?: number) => {
        console.log(`[OCCT] Tessellating ${shapeId}: precision=${precision}, angle=${angle}`);
        return wasm.tessellate(shapeId, precision || 0.01, angle || 0.5);
      }
    ),

    tessellateWithParams: createErrorBoundaryWrapper(
      'tessellateWithParams',
      (shapeId: string, precision: number, angle: number) => {
        console.log(`[OCCT] Tessellating ${shapeId}: precision=${precision}, angle=${angle}`);
        return wasm.tessellateWithParams(shapeId, precision, angle);
      }
    ),

    // File I/O
    importSTEP: createErrorBoundaryWrapper('importSTEP', (fileData: string) => {
      console.log(`[OCCT] Importing STEP file: ${fileData.length} bytes`);
      const shape = wasm.importSTEP(fileData);
      if (!shape || !shape.id) {
        throw new Error('Invalid shape returned from WASM');
      }
      OCCTMemoryManager.trackShape(shape.id);
      return flattenBoundingBox(shape);
    }),

    exportSTEP: createErrorBoundaryWrapper('exportSTEP', (shapeId: string) => {
      console.log(`[OCCT] Exporting ${shapeId} to STEP`);
      return wasm.exportSTEP(shapeId);
    }),

    exportSTL: createErrorBoundaryWrapper('exportSTL', (shapeId: string, binary?: boolean) => {
      console.log(`[OCCT] Exporting ${shapeId} to STL (${binary ? 'binary' : 'ASCII'})`);
      return wasm.exportSTL(shapeId, binary);
    }),

    // Memory management
    deleteShape: createErrorBoundaryWrapper('deleteShape', (shapeId: string) => {
      console.log(`[OCCT] Deleting shape ${shapeId}`);
      wasm.deleteShape(shapeId);
      OCCTMemoryManager.untrackShape(shapeId);
    }),

    getShapeCount: createErrorBoundaryWrapper('getShapeCount', () => {
      return wasm.getShapeCount();
    }),

    clearAllShapes: createErrorBoundaryWrapper('clearAllShapes', () => {
      console.log('[OCCT] Clearing all shapes');
      wasm.clearAllShapes();
      OCCTMemoryManager.cleanup();
    }),

    // Status and version
    getStatus: createErrorBoundaryWrapper('getStatus', () => {
      return wasm.getStatus();
    }),

    getOCCTVersion: createErrorBoundaryWrapper('getOCCTVersion', () => {
      return wasm.getOCCTVersion();
    }),

    // Vector types
    VectorFloat: wasm.VectorFloat,
    VectorUint: wasm.VectorUint,
  };
}

/**
 * Main OCCT loader with proper error boundaries and fallback handling
 * This ensures the platform always has geometry capabilities, either real or mock
 */
export async function loadOCCT(): Promise<OCCTModule | null> {
  // Return cached module if already loaded
  if (occtModule) {
    return occtModule;
  }

  // Prevent multiple load attempts
  if (wasmLoadAttempted) {
    if (wasmLoadError) {
      console.log('[OCCT] Previous WASM load failed - only real OCCT geometry is supported');
      return null;
    }
    return occtModule;
  }

  wasmLoadAttempted = true;

  try {
    // Attempt to load the real WASM module
    console.log('[OCCT] Attempting to load real OCCT WASM module...');
    wasmModule = await attemptWASMLoad();

    if (wasmModule) {
      // Successfully loaded WASM - create real OCCT module
      console.log('[OCCT] ✅ Real OCCT WASM loaded successfully!');
      occtModule = createRealOCCTModule(wasmModule);
      wasmLoaded = true;

      // Test the module
      try {
        const version = occtModule.getOCCTVersion();
        console.log(`[OCCT] Running OCCT version: ${version}`);
      } catch (e) {
        console.log('[OCCT] OCCT module loaded (version check not available)');
      }

      return occtModule;
    } else {
      // WASM not available - fail on use, not on load
      console.error(
        '[OCCT] CRITICAL: Real OCCT WASM not available. ONLY real geometry is supported.'
      );
      console.error('[OCCT] Expected WASM files at: /wasm/occt.js or /wasm/occt-core.js');
      console.error('[OCCT] Geometry operations will fail when attempted.');
      return null; // Fail on use, not on load
    }
  } catch (error) {
    // Error loading WASM - FAIL HARD, NO MOCK FALLBACK
    wasmLoadError = error as Error;
    console.error('[OCCT] CRITICAL: Failed to load WASM module. ONLY real geometry is supported.');
    console.error('[OCCT] Error details:', error);

    // Return null to trigger mock fallback
    return null;
  }
}

/**
 * Gets the current OCCT module if loaded
 */
export function getOCCTModule(): OCCTModule | null {
  return occtModule;
}

/**
 * Checks if real OCCT WASM is loaded
 */
export function isWASMLoaded(): boolean {
  return wasmLoaded;
}

/**
 * Gets the WASM load error if any
 */
export function getWASMLoadError(): Error | null {
  return wasmLoadError;
}

/**
 * Resets the WASM loader state (useful for retrying after compilation)
 */
export function resetWASMLoader(): void {
  if (occtModule && wasmLoaded) {
    OCCTMemoryManager.cleanup();
  }
  occtModule = null;
  wasmModule = null;
  wasmLoaded = false;
  wasmLoadAttempted = false;
  wasmLoadError = null;
  console.log('[OCCT] WASM loader reset - will retry on next load');
}

// Re-export the original RealOCCT class for backward compatibility
export { RealOCCT } from './real-occt-bindings';
