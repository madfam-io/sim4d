/**
 * Enhanced OCCT WASM Module Loader with Capability Detection
 * Handles loading and initialization of the real OCCT WebAssembly module
 */

import {
  WASMCapabilityDetector,
  WASMPerformanceMonitor,
  type OCCTConfig,
} from './wasm-capability-detector';

declare function _createOCCTCoreModule(config?: any): Promise<any>;

export interface LoaderOptions {
  forceMode?: 'full-occt' | 'optimized-occt';
  wasmBasePath?: string;
  enablePerformanceMonitoring?: boolean;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

class LoaderState {
  private static circuitBreaker: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'closed',
  };

  static isCircuitOpen(): boolean {
    if (this.circuitBreaker.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime;
      const cooldownPeriod = 30000; // 30 seconds

      if (timeSinceLastFailure > cooldownPeriod) {
        this.circuitBreaker.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  static recordFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();

    const failureThreshold = 3;
    if (this.circuitBreaker.failures >= failureThreshold) {
      this.circuitBreaker.state = 'open';
      console.warn('[OCCT] Circuit breaker opened due to repeated failures');
    }
  }

  static resetCircuitBreaker(): void {
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
    };
  }
}

/**
 * Reset the OCCT loader circuit breaker (for testing)
 */
export function resetOCCTCircuitBreaker(): void {
  LoaderState.resetCircuitBreaker();
}

/**
 * Load and initialize the OCCT WASM module with enhanced capability detection
 */
export async function loadOCCTModule(options: LoaderOptions = {}): Promise<any> {
  const endMeasurement = WASMPerformanceMonitor.startMeasurement('occt-load-total');

  try {
    // Check circuit breaker
    if (LoaderState.isCircuitOpen()) {
      throw new Error('OCCT circuit breaker open due to repeated failures');
    }

    // Enhanced environment detection
    const isBrowser = typeof window !== 'undefined';
    const isWorker = typeof importScripts === 'function';
    const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
    const isTest =
      typeof global !== 'undefined' &&
      ((global as any).__vitest || process.env.NODE_ENV === 'test');

    console.log('[OCCT] Environment detection:', { isBrowser, isWorker, isNode, isTest });

    if (isNode && !isBrowser && !isWorker) {
      console.log('[OCCT] Loading Node.js WASM module');
      return loadNodeJSOCCT();
    }

    // Get optimal configuration based on capabilities
    const config = options.forceMode
      ? await getConfigForMode(options.forceMode)
      : await WASMCapabilityDetector.getOptimalConfiguration();

    console.log('[OCCT] Selected configuration:', config);

    // Attempt to load based on configuration with retry logic
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`[OCCT] Load attempt ${attempts}/${maxAttempts} for mode: ${config.mode}`);

        let occtModule: any;

        switch (config.mode) {
          case 'full-occt':
            occtModule = await loadFullOCCTModule(config, options);
            break;
          case 'optimized-occt':
            occtModule = await loadOptimizedOCCTModule(config, options);
            break;
          default:
            throw new Error(`Unsupported OCCT mode: ${config.mode}`);
        }

        // Success - reset circuit breaker
        LoaderState.resetCircuitBreaker();

        const duration = endMeasurement();
        console.log(`[OCCT] Successfully loaded ${config.mode} in ${duration.toFixed(1)}ms`);

        return occtModule;
      } catch (error: unknown) {
        console.warn(`[OCCT] Attempt ${attempts} failed:`, error);

        if (attempts >= maxAttempts) {
          LoaderState.recordFailure();
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to load OCCT after ${maxAttempts} attempts: ${message}`);
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts - 1) * 1000));
      }
    }

    throw new Error('Unexpected end of load attempts');
  } catch (error) {
    endMeasurement();
    console.error('[OCCT] Failed to load WASM module:', error);
    throw error;
  }
}
async function loadNodeJSOCCT(): Promise<any> {
  const fs = await import(/* @vite-ignore */ 'fs');
  const path = await import(/* @vite-ignore */ 'path');
  const url = await import(/* @vite-ignore */ 'url');

  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const wasmDir = path.resolve(__dirname, '../wasm');
  const moduleBasename = process.env.OCCT_NODE_BASENAME || 'occt-core.node';
  const jsPath = path.join(wasmDir, `${moduleBasename}.mjs`);
  const wasmPath = path.join(wasmDir, `${moduleBasename}.wasm`);
  const workerPath = path.join(wasmDir, `${moduleBasename}.worker.js`);

  console.log('[OCCT Node.js] Loading WASM bundle from:', jsPath);

  const missingArtifacts: string[] = [];
  if (!fs.existsSync(jsPath)) missingArtifacts.push(path.basename(jsPath));
  if (!fs.existsSync(wasmPath)) missingArtifacts.push(path.basename(wasmPath));
  if (!fs.existsSync(workerPath)) {
    console.warn(
      '[OCCT Node.js] Worker glue not found. Pthread worker paths will be resolved relative to the current working directory.'
    );
  }

  if (missingArtifacts.length > 0) {
    throw new Error(
      `OCCT Node bundle missing: ${missingArtifacts.join(', ')}. Run "pnpm run build:wasm" to regenerate.`
    );
  }

  const moduleUrl = url.pathToFileURL(jsPath).href;
  const wasmUrl = url.pathToFileURL(wasmPath).href;
  const workerUrl = fs.existsSync(workerPath) ? url.pathToFileURL(workerPath).href : undefined;

  const wasmModuleImport = await import(/* @vite-ignore */ moduleUrl);
  const factory =
    wasmModuleImport.default ||
    wasmModuleImport.createOCCTCoreModule ||
    wasmModuleImport.createOCCTModule;

  if (typeof factory !== 'function') {
    throw new Error(`OCCT Node bundle does not export a usable factory function: ${moduleUrl}`);
  }

  const moduleInstance = await factory({
    locateFile: (filename: string) => {
      if (filename.endsWith('.wasm')) {
        return wasmUrl;
      }
      if (filename.endsWith('.worker.js') && workerUrl) {
        return workerUrl;
      }
      return path.join(wasmDir, filename);
    },
    print: (text: string) => console.log('[OCCT Node WASM]', text),
    printErr: (text: string) => console.error('[OCCT Node WASM]', text),
  });

  (globalThis as any).Module = moduleInstance;

  console.log(
    '[OCCT Node.js] OCCT wasm module ready with exports:',
    Object.keys(moduleInstance).length
  );

  const adapter = new OCCTAdapter(moduleInstance);
  await adapter.init();
  return adapter;
}

async function loadFullOCCTModule(config: OCCTConfig, _options: LoaderOptions): Promise<any> {
  const wasmFile = config.wasmFile;
  const wasmUrl = new URL(/* @vite-ignore */ `../wasm/${wasmFile}`, import.meta.url).href;

  // Check if the WASM file is accessible
  const checkResponse = await fetch(wasmUrl, { method: 'HEAD' });
  if (!checkResponse.ok) {
    throw new Error(`WASM file not accessible: ${wasmUrl}`);
  }

  // Load the JavaScript glue code - REQUIRED for pthread support
  try {
    const jsUrl = new URL(/* @vite-ignore */ '../wasm/occt.js', import.meta.url).href;
    const jsModule = await import(jsUrl);

    // Get the factory function from the module
    const factory = jsModule.default || jsModule.createOCCTModule;

    if (typeof factory !== 'function') {
      throw new Error('OCCT JS glue code does not export a factory function');
    }

    // Configure the module with capability-aware settings
    const moduleConfig = {
      locateFile: (path: string) => {
        if (path.endsWith('.wasm')) {
          return wasmUrl;
        }
        if (path.endsWith('.js') || path.endsWith('.worker.js')) {
          return new URL(/* @vite-ignore */ `../wasm/${path}`, import.meta.url).href;
        }
        return path;
      },

      // Memory configuration based on detected capabilities
      INITIAL_MEMORY:
        parseInt(config.memory.replace(/GB|MB/, '')) *
        (config.memory.includes('GB') ? 1024 * 1024 * 1024 : 1024 * 1024),
      MAXIMUM_MEMORY: 4 * 1024 * 1024 * 1024, // 4GB max
      ALLOW_MEMORY_GROWTH: true,

      // Threading support (requires COOP/COEP headers)
      USE_PTHREADS: config.useThreads,
      PTHREAD_POOL_SIZE: config.workers,

      // Runtime callbacks
      onRuntimeInitialized: function (this: any) {
        console.log('[OCCT] Full runtime initialized successfully');

        // Validate that we have the expected OCCT functions
        if (this._BRepPrimAPI_MakeBox) {
          console.log('[OCCT] BRepPrimAPI_MakeBox available ✓');
        }
        if (this._BRepPrimAPI_MakeSphere) {
          console.log('[OCCT] BRepPrimAPI_MakeSphere available ✓');
        }
        if (this._BRepPrimAPI_MakeCylinder) {
          // eslint-disable-next-line no-secrets/no-secrets -- False positive: OCCT API class name
          console.log('[OCCT] BRepPrimAPI_MakeCylinder available ✓');
        }
      },

      print: (text: string) => {
        console.log('[OCCT Output]', text);
      },

      printErr: (text: string) => {
        console.error('[OCCT Error]', text);
      },
    };

    // Call the Emscripten factory function with our config
    const occtModule = await factory(moduleConfig);

    console.log('[OCCT] Full module loaded successfully', {
      hasExports: !!occtModule,
      exportCount: occtModule ? Object.keys(occtModule).length : 0,
    });

    (globalThis as any).Module = occtModule;

    // Wrap the raw OCCT module with an invoke interface
    const occtAdapter = new OCCTAdapter(occtModule);
    await occtAdapter.init();
    return occtAdapter;
  } catch (error) {
    console.error('[OCCT] Failed to load full OCCT module:', error);
    throw error;
  }
}

async function loadOptimizedOCCTModule(config: OCCTConfig, _options: LoaderOptions): Promise<any> {
  const wasmFile = config.wasmFile;
  const wasmUrl = new URL(/* @vite-ignore */ `../wasm/${wasmFile}`, import.meta.url).href;

  // Check if the WASM file is accessible
  const checkResponse = await fetch(wasmUrl, { method: 'HEAD' });
  if (!checkResponse.ok) {
    throw new Error(`WASM file not accessible: ${wasmUrl}`);
  }

  // Load the JavaScript glue code
  try {
    const jsUrl = new URL(/* @vite-ignore */ '../wasm/occt-core.js', import.meta.url).href;
    const jsModule = await import(jsUrl);

    // Get the factory function from the module
    const factory = jsModule.default || jsModule.createOCCTCoreModule;

    if (typeof factory !== 'function') {
      throw new Error('OCCT Core JS glue code does not export a factory function');
    }

    // Configure the module with optimized settings
    const moduleConfig = {
      locateFile: (path: string) => {
        if (path.endsWith('.wasm')) {
          return wasmUrl;
        }
        if (path.endsWith('.js')) {
          return new URL(/* @vite-ignore */ `../wasm/${path}`, import.meta.url).href;
        }
        return path;
      },

      // Optimized memory configuration
      INITIAL_MEMORY:
        parseInt(config.memory.replace(/GB|MB/, '')) *
        (config.memory.includes('GB') ? 1024 * 1024 * 1024 : 1024 * 1024),
      MAXIMUM_MEMORY: 2 * 1024 * 1024 * 1024, // 2GB max for optimized
      ALLOW_MEMORY_GROWTH: true,

      // No threading for optimized version
      USE_PTHREADS: false,

      // Runtime callbacks
      onRuntimeInitialized: function () {
        console.log('[OCCT] Optimized runtime initialized successfully');
      },

      print: (text: string) => {
        console.log('[OCCT Output]', text);
      },

      printErr: (text: string) => {
        console.error('[OCCT Error]', text);
      },
    };

    // Call the Emscripten factory function with our config
    const occtModule = await factory(moduleConfig);

    console.log('[OCCT] Optimized module loaded successfully');

    (globalThis as any).Module = occtModule;

    // Wrap the raw OCCT module with an invoke interface
    const occtAdapter = new OCCTAdapter(occtModule);
    await occtAdapter.init();
    return occtAdapter;
  } catch (error) {
    console.error('[OCCT] Failed to load optimized OCCT module:', error);
    throw error;
  }
}

async function _instantiateWASMDirect(wasmUrl: string, _Module?: any): Promise<any> {
  const response = await fetch(wasmUrl);
  const wasmBuffer = await response.arrayBuffer();

  const wasmModule = await WebAssembly.compile(wasmBuffer);
  // OCCT requires 512MB minimum (8192 pages × 64KB/page = 512MB)
  // Using shared memory for potential threading support
  const memory = new WebAssembly.Memory({ initial: 8192, maximum: 32768, shared: true });

  const instance = await WebAssembly.instantiate(wasmModule, {
    env: {
      memory,
      __memory_base: 0,
      __table_base: 0,
      abort: () => {
        throw new Error('WASM abort');
      },
      emscripten_resize_heap: () => false,
    },
    wasi_snapshot_preview1: {
      proc_exit: () => {},
      fd_close: () => 0,
      fd_write: () => 0,
      fd_seek: () => 0,
    },
  });

  return {
    ...instance.exports,
    memory,
    HEAP8: new Int8Array(memory.buffer),
    HEAP16: new Int16Array(memory.buffer),
    HEAP32: new Int32Array(memory.buffer),
    HEAPU8: new Uint8Array(memory.buffer),
    HEAPU16: new Uint16Array(memory.buffer),
    HEAPU32: new Uint32Array(memory.buffer),
    HEAPF32: new Float32Array(memory.buffer),
    HEAPF64: new Float64Array(memory.buffer),
  };
}

async function getConfigForMode(mode: string): Promise<OCCTConfig> {
  const caps = await WASMCapabilityDetector.detectCapabilities();

  const baseConfig = {
    workers: Math.min(navigator.hardwareConcurrency || 2, 4),
    enableSIMD: caps.hasSimd,
    useThreads: false,
    memory: '1GB',
  };

  switch (mode) {
    case 'full-occt':
      return {
        ...baseConfig,
        mode: 'full-occt',
        wasmFile: 'occt.wasm',
        workers: Math.min(navigator.hardwareConcurrency || 4, 8),
        memory: '2GB',
        useThreads: caps.hasThreads && caps.hasSharedArrayBuffer,
      };
    case 'optimized-occt':
      return {
        ...baseConfig,
        mode: 'optimized-occt',
        wasmFile: 'occt-core.wasm',
      };
    default:
      throw new Error(`Unknown forced mode: ${mode}`);
  }
}

/**
 * Check if OCCT WASM is available with enhanced detection
 */
export async function isOCCTAvailable(): Promise<{
  available: boolean;
  mode: string;
  capabilities?: any;
}> {
  try {
    // Get capabilities first
    const capabilities = await WASMCapabilityDetector.detectCapabilities();

    // Check for different WASM files
    const wasmFiles = [
      { file: 'occt.wasm', mode: 'full-occt' },
      { file: 'occt-core.wasm', mode: 'optimized-occt' },
    ];

    for (const { file, mode } of wasmFiles) {
      try {
        const response = await fetch(
          new URL(/* @vite-ignore */ `../wasm/${file}`, import.meta.url).href,
          {
            method: 'HEAD',
          }
        );
        if (response.ok) {
          return { available: true, mode, capabilities };
        }
      } catch {
        continue;
      }
    }

    // No WASM bundle accessible
    return { available: false, mode: 'unavailable', capabilities };
  } catch {
    return { available: false, mode: 'unknown' };
  }
}

/**
 * Generate diagnostic report for OCCT loader
 */
export async function generateOCCTDiagnostics(): Promise<string> {
  const availability = await isOCCTAvailable();
  const capabilityReport = await WASMCapabilityDetector.generateCapabilityReport();
  const performanceReport = WASMPerformanceMonitor.getPerformanceReport();

  return `
=== OCCT Loader Diagnostics ===
WASM Available: ${availability.available ? '✓' : '✗'}
Recommended Mode: ${availability.mode}
Circuit Breaker State: ${LoaderState.isCircuitOpen() ? 'OPEN' : 'CLOSED'}

${capabilityReport}

${performanceReport}
  `.trim();
}

/**
 * Adapter that wraps the raw OCCT module with the invoke interface
 */
class OCCTAdapter {
  constructor(private readonly occtModule: any) {}

  async invoke<T>(operation: string, params: unknown): Promise<T> {
    const op = operation?.toUpperCase?.() ?? operation;

    try {
      switch (op) {
        case 'MAKE_BOX':
          return this.makeBox(params) as T;
        case 'MAKE_SPHERE':
          return this.makeSphere(params) as T;
        case 'MAKE_CYLINDER':
          return this.makeCylinder(params) as T;
        case 'BOOLEAN_UNION':
          return this.booleanUnion(params) as T;
        case 'BOOLEAN_SUBTRACT':
          return this.booleanSubtract(params) as T;
        case 'BOOLEAN_INTERSECT':
          return this.booleanIntersect(params) as T;
        case 'DELETE_SHAPE':
          return this.deleteShape(params) as T;
        case 'GET_SHAPE_COUNT':
          return this.occtModule.getShapeCount() as T;
        case 'TESSELLATE':
          return this.tessellate(params) as T;
        default:
          throw new Error(`Unsupported OCCT operation: ${operation}`);
      }
    } catch (error) {
      console.error(`[OCCTAdapter] Operation ${operation} failed:`, error);
      throw error;
    }
  }

  private normalizeShape(handle: any) {
    if (!handle || !handle.id) {
      throw new Error('OCCT returned an invalid shape handle');
    }

    const bbox = {
      min: {
        x: handle.bbox_min_x ?? 0,
        y: handle.bbox_min_y ?? 0,
        z: handle.bbox_min_z ?? 0,
      },
      max: {
        x: handle.bbox_max_x ?? 0,
        y: handle.bbox_max_y ?? 0,
        z: handle.bbox_max_z ?? 0,
      },
    };

    return {
      id: handle.id,
      type: handle.type ?? 'solid',
      bbox,
      hash: handle.hash ?? handle.id,
      volume: handle.volume,
      area: handle.area,
    };
  }

  private getShapeId(input: unknown): string {
    if (!input) {
      throw new Error('Shape identifier not provided');
    }
    if (typeof input === 'string') {
      return input;
    }
    if (input.id) {
      return input.id;
    }
    throw new Error('Invalid shape reference');
  }

  private makeBox(params: {
    width?: number;
    height?: number;
    depth?: number;
    dx?: number;
    dy?: number;
    dz?: number;
  }) {
    const width = params.width ?? params.dx ?? params.depth ?? 1;
    const height = params.height ?? params.dy ?? width;
    const depth = params.depth ?? params.dz ?? height;
    const handle = this.occtModule.makeBox(width, height, depth);
    return this.normalizeShape(handle);
  }

  private makeSphere(params: { radius?: number }) {
    const radius = params.radius ?? 1;
    const handle = this.occtModule.makeSphere(radius);
    return this.normalizeShape(handle);
  }

  private makeCylinder(params: { radius?: number; height?: number; depth?: number }) {
    const radius = params.radius ?? 1;
    const height = params.height ?? params.depth ?? 1;
    const handle = this.occtModule.makeCylinder(radius, height);
    return this.normalizeShape(handle);
  }

  private booleanUnion(params: { shapes: any[] }) {
    const shapes = params.shapes || [];
    if (shapes.length < 2) {
      throw new Error('BOOLEAN_UNION requires at least two shapes');
    }

    let handle = this.occtModule.booleanUnion(
      this.getShapeId(shapes[0]),
      this.getShapeId(shapes[1])
    );

    for (let i = 2; i < shapes.length; i++) {
      handle = this.occtModule.booleanUnion(handle.id, this.getShapeId(shapes[i]));
    }

    return this.normalizeShape(handle);
  }

  private booleanSubtract(params: { base: any; tools: any[] }) {
    const baseId = this.getShapeId(params.base);
    const tools = params.tools || [];
    if (tools.length === 0) {
      throw new Error('BOOLEAN_SUBTRACT requires at least one tool shape');
    }

    let handle = this.occtModule.booleanSubtract(baseId, this.getShapeId(tools[0]));
    for (let i = 1; i < tools.length; i++) {
      handle = this.occtModule.booleanSubtract(handle.id, this.getShapeId(tools[i]));
    }

    return this.normalizeShape(handle);
  }

  private booleanIntersect(params: { shapes: any[] }) {
    const shapes = params.shapes || [];
    if (shapes.length < 2) {
      throw new Error('BOOLEAN_INTERSECT requires at least two shapes');
    }
    let handle = this.occtModule.booleanIntersect(
      this.getShapeId(shapes[0]),
      this.getShapeId(shapes[1])
    );

    for (let i = 2; i < shapes.length; i++) {
      handle = this.occtModule.booleanIntersect(handle.id, this.getShapeId(shapes[i]));
    }

    return this.normalizeShape(handle);
  }

  private deleteShape(params: { id: string }) {
    const shapeId = this.getShapeId(params.id ?? params);
    this.occtModule.deleteShape(shapeId);
    return { success: true };
  }

  private tessellate(params: { shape: any; deflection?: number; angle?: number }) {
    const shapeId = this.getShapeId(params.shape);
    const deflection = params.deflection ?? 0.1;
    const angle = params.angle ?? 0.5;
    const mesh = this.occtModule.tessellate(shapeId, deflection, angle);

    return this.normalizeMesh(mesh);
  }

  private normalizeMesh(mesh: any) {
    const toFloat32 = (value: unknown) => {
      if (!value) return new Float32Array();
      if (value instanceof Float32Array) return value;
      if (typeof value.toTypedArray === 'function') {
        return value.toTypedArray() as Float32Array;
      }
      if (Array.isArray(value) || typeof value.length === 'number') {
        return new Float32Array(value);
      }
      if (typeof value.size === 'function' && typeof value.get === 'function') {
        const size = value.size();
        const array = new Float32Array(size);
        for (let i = 0; i < size; i++) {
          array[i] = value.get(i);
        }
        return array;
      }
      return new Float32Array();
    };

    const toUint32 = (value: unknown) => {
      if (!value) return new Uint32Array();
      if (value instanceof Uint32Array) return value;
      if (typeof value.toTypedArray === 'function') {
        return value.toTypedArray() as Uint32Array;
      }
      if (Array.isArray(value) || typeof value.length === 'number') {
        return new Uint32Array(value);
      }
      if (typeof value.size === 'function' && typeof value.get === 'function') {
        const size = value.size();
        const array = new Uint32Array(size);
        for (let i = 0; i < size; i++) {
          array[i] = value.get(i);
        }
        return array;
      }
      return new Uint32Array();
    };

    const positions = toFloat32(mesh?.positions);
    const normals = toFloat32(mesh?.normals);
    const indices = toUint32(mesh?.indices);
    const edges = toUint32(mesh?.edges);

    return {
      positions,
      normals,
      indices,
      edges,
      vertexCount: positions.length / 3,
      triangleCount: indices.length / 3,
    };
  }

  async init(): Promise<void> {
    if (this.occtModule?.ready && typeof this.occtModule.ready.then === 'function') {
      await this.occtModule.ready;
    }
  }

  async shutdown(): Promise<void> {
    if (typeof this.occtModule?.clearAllShapes === 'function') {
      this.occtModule.clearAllShapes();
    }
  }
}
