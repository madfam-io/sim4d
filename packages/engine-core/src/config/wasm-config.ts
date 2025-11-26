/**
 * WASM Configuration for Sim4D
 * Forces real OCCT WASM in development and production
 */

export interface WASMConfig {
  forceRealWASM: boolean;
  wasmPath: string;
  workerPath: string;
  initTimeout: number;
  enableSharedArrayBuffer: boolean;
}

/**
 * Get WASM configuration for current environment
 */
export function getWASMConfig(): WASMConfig {
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  const isTest = process.env.NODE_ENV === 'test';

  return {
    // ALWAYS use real WASM except in explicit test mode
    forceRealWASM: !isTest,

    // Path to WASM files
    wasmPath: '/packages/engine-occt/wasm/occt.wasm',

    // Path to worker script
    workerPath: '/packages/engine-occt/dist/worker.mjs',

    // Initialization timeout (ms)
    initTimeout: 30000,

    // Enable SharedArrayBuffer for better performance
    enableSharedArrayBuffer:
      typeof SharedArrayBuffer !== 'undefined' &&
      typeof crossOriginIsolated !== 'undefined' &&
      crossOriginIsolated === true,
  };
}

/**
 * Check if real WASM should be used
 */
export function shouldUseRealWASM(): boolean {
  const config = getWASMConfig();
  return config.forceRealWASM;
}

/**
 * Get WASM initialization options
 */
export function getWASMInitOptions() {
  const config = getWASMConfig();

  return {
    locateFile: (path: string) => {
      if (path.endsWith('.wasm')) {
        return config.wasmPath;
      }
      return path;
    },

    // Enable WASM threads if SharedArrayBuffer is available
    mainScriptUrlOrBlob: config.workerPath,

    // Memory configuration
    INITIAL_MEMORY: 256 * 1024 * 1024, // 256MB initial
    MAXIMUM_MEMORY: 2 * 1024 * 1024 * 1024, // 2GB max
    ALLOW_MEMORY_GROWTH: 1,

    // Threading (if available)
    USE_PTHREADS: config.enableSharedArrayBuffer ? 1 : 0,
    PTHREAD_POOL_SIZE: config.enableSharedArrayBuffer ? 4 : 0,

    // Optimization flags
    ASSERTIONS: isDevelopment ? 1 : 0,
    SAFE_HEAP: 0,
    STACK_OVERFLOW_CHECK: isDevelopment ? 1 : 0,
  };
}

const isDevelopment = process.env.NODE_ENV !== 'production';
