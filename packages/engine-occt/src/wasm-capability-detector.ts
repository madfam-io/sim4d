/**
 * WASM Capability Detection System
 * Detects browser capabilities for optimal OCCT WASM configuration
 */

export interface WASMCapabilities {
  hasWASM: boolean;
  hasSharedArrayBuffer: boolean;
  hasThreads: boolean;
  hasSimd: boolean;
  memoryCeiling: number;
  browserEngine: 'chromium' | 'firefox' | 'webkit' | 'unknown';
  workerSupport: boolean;
  crossOriginIsolated: boolean;
}

export interface OCCTConfig {
  mode: 'full-occt' | 'optimized-occt';
  wasmFile: string;
  workers: number;
  memory: string;
  useThreads: boolean;
  enableSIMD: boolean;
}

export class WASMCapabilityDetector {
  private static cachedCapabilities: WASMCapabilities | null = null;

  /**
   * Detect all browser capabilities for WASM optimization
   */
  static async detectCapabilities(): Promise<WASMCapabilities> {
    if (this.cachedCapabilities) {
      return this.cachedCapabilities;
    }

    const capabilities: WASMCapabilities = {
      hasWASM: await this.detectWASMSupport(),
      hasSharedArrayBuffer: this.detectSharedArrayBuffer(),
      hasThreads: this.detectThreadSupport(),
      hasSimd: await this.detectSIMDSupport(),
      memoryCeiling: await this.estimateMemoryLimit(),
      browserEngine: this.detectBrowserEngine(),
      workerSupport: this.detectWorkerSupport(),
      crossOriginIsolated: this.detectCrossOriginIsolation(),
    };

    this.cachedCapabilities = capabilities;
    console.log('[WASM] Detected capabilities:', capabilities);

    return capabilities;
  }

  /**
   * Get optimal OCCT configuration based on capabilities
   */
  static async getOptimalConfiguration(): Promise<OCCTConfig> {
    const caps = await this.detectCapabilities();

    console.log('[WASM] Capability details:', {
      hasWASM: caps.hasWASM,
      hasSharedArrayBuffer: caps.hasSharedArrayBuffer,
      hasThreads: caps.hasThreads,
      hasSimd: caps.hasSimd,
      memoryCeiling: caps.memoryCeiling,
      crossOriginIsolated: caps.crossOriginIsolated,
      browserEngine: caps.browserEngine,
    });

    // Full OCCT with threading (best performance)
    if (caps.hasSharedArrayBuffer && caps.hasThreads && caps.crossOriginIsolated) {
      console.log('[WASM] Using full-occt mode with threading');
      return {
        mode: 'full-occt',
        wasmFile: 'occt.wasm', // 13MB version with full features
        workers: Math.min(navigator.hardwareConcurrency || 4, 8),
        memory: '2GB',
        useThreads: true,
        enableSIMD: caps.hasSimd,
      };
    }

    // Optimized OCCT without threading - ALWAYS AVAILABLE if WASM is supported
    // Real geometry is NON-NEGOTIABLE for this application
    if (caps.hasWASM) {
      console.log('[WASM] Using optimized-occt mode (no threading)');
      return {
        mode: 'optimized-occt',
        wasmFile: 'occt-core.wasm', // 8.7MB optimized version
        workers: Math.min(navigator.hardwareConcurrency || 2, 4),
        memory: '1GB',
        useThreads: false,
        enableSIMD: caps.hasSimd,
      };
    }

    // Final fallback - if browser has ANY WASM support, force optimized mode
    console.warn('[WASM] Forcing optimized-occt mode despite capability detection');
    return {
      mode: 'optimized-occt',
      wasmFile: 'occt-core.wasm',
      workers: 2,
      memory: '512MB',
      useThreads: false,
      enableSIMD: false,
    };
  }

  /**
   * Test basic WebAssembly support
   */
  private static async detectWASMSupport(): Promise<boolean> {
    try {
      if (typeof WebAssembly !== 'object') {
        return false;
      }

      // Test with a minimal WASM module
      const wasmCode = new Uint8Array([
        0,
        97,
        115,
        109,
        1,
        0,
        0,
        0, // WASM magic number and version
        1,
        4,
        1,
        96,
        0,
        0, // Function type section
        3,
        2,
        1,
        0, // Function section
        10,
        4,
        1,
        2,
        0,
        11, // Code section with empty function
      ]);

      const module = await WebAssembly.compile(wasmCode);
      const instance = await WebAssembly.instantiate(module);

      return instance instanceof WebAssembly.Instance;
    } catch (error) {
      console.warn('[WASM] WebAssembly not supported:', error);
      return false;
    }
  }

  /**
   * Detect SharedArrayBuffer support (required for threading)
   */
  private static detectSharedArrayBuffer(): boolean {
    try {
      return typeof SharedArrayBuffer !== 'undefined' && typeof Atomics !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Detect thread support
   */
  private static detectThreadSupport(): boolean {
    return (
      typeof Worker !== 'undefined' &&
      'hardwareConcurrency' in navigator &&
      (navigator.hardwareConcurrency || 0) > 1
    );
  }

  /**
   * Detect WASM SIMD support
   */
  private static async detectSIMDSupport(): Promise<boolean> {
    try {
      // Test WASM module with SIMD instructions
      const simdWasm = new Uint8Array([
        0,
        97,
        115,
        109,
        1,
        0,
        0,
        0, // WASM magic
        1,
        5,
        1,
        96,
        0,
        1,
        123, // Function type (returns v128)
        3,
        2,
        1,
        0, // Function section
        10,
        9,
        1,
        7,
        0,
        253,
        15,
        253,
        15,
        11, // Code with SIMD
      ]);

      await WebAssembly.compile(simdWasm);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Estimate available memory limit
   */
  private static async estimateMemoryLimit(): Promise<number> {
    try {
      // Try to allocate progressively larger amounts of memory
      const testSizes = [512, 1024, 2048, 4096]; // MB
      let maxMemory = 0;

      for (const size of testSizes) {
        try {
          const _buffer = new ArrayBuffer(size * 1024 * 1024);
          maxMemory = size;
          // Don't hold onto the buffer
        } catch {
          break;
        }
      }

      // Add device memory API if available
      if ('deviceMemory' in navigator) {
        const deviceMemory = (navigator as any).deviceMemory * 1024; // GB to MB
        return Math.min(maxMemory, deviceMemory / 2); // Use half of device memory
      }

      return maxMemory;
    } catch {
      return 512; // Conservative fallback
    }
  }

  /**
   * Detect browser engine for optimization hints
   */
  private static detectBrowserEngine(): WASMCapabilities['browserEngine'] {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
      return 'chromium';
    } else if (userAgent.includes('firefox')) {
      return 'firefox';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'webkit';
    } else {
      return 'unknown';
    }
  }

  /**
   * Detect Web Worker support
   */
  private static detectWorkerSupport(): boolean {
    try {
      return (
        typeof Worker !== 'undefined' && typeof URL !== 'undefined' && typeof Blob !== 'undefined'
      );
    } catch {
      return false;
    }
  }

  /**
   * Detect Cross-Origin Isolation (required for SharedArrayBuffer)
   */
  private static detectCrossOriginIsolation(): boolean {
    try {
      return self.crossOriginIsolated === true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a capability report for debugging
   */
  static async generateCapabilityReport(): Promise<string> {
    const caps = await this.detectCapabilities();
    const config = await this.getOptimalConfiguration();

    return `
=== WASM Capability Report ===
WebAssembly Support: ${caps.hasWASM ? '✓' : '✗'}
SharedArrayBuffer Support: ${caps.hasSharedArrayBuffer ? '✓' : '✗'}
Threading Support: ${caps.hasThreads ? '✓' : '✗'}
SIMD Support: ${caps.hasSimd ? '✓' : '✗'}
Worker Support: ${caps.workerSupport ? '✓' : '✗'}
Cross-Origin Isolated: ${caps.crossOriginIsolated ? '✓' : '✗'}
Memory Ceiling: ${caps.memoryCeiling}MB
Browser Engine: ${caps.browserEngine}
Hardware Concurrency: ${navigator.hardwareConcurrency || 'unknown'}

=== Optimal Configuration ===
Mode: ${config.mode}
WASM File: ${config.wasmFile}
Workers: ${config.workers}
Memory Limit: ${config.memory}
Threading: ${config.useThreads ? 'enabled' : 'disabled'}
SIMD: ${config.enableSIMD ? 'enabled' : 'disabled'}
    `.trim();
  }
}

/**
 * Performance monitoring for WASM operations
 */
export class WASMPerformanceMonitor {
  private static measurements = new Map<string, number[]>();

  static startMeasurement(operation: string): () => number {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      if (!this.measurements.has(operation)) {
        this.measurements.set(operation, []);
      }

      this.measurements.get(operation)!.push(duration);

      // Keep only last 100 measurements
      const measurements = this.measurements.get(operation)!;
      if (measurements.length > 100) {
        measurements.shift();
      }

      return duration;
    };
  }

  static getAverageTime(operation: string): number {
    const measurements = this.measurements.get(operation);
    if (!measurements || measurements.length === 0) {
      return 0;
    }

    const sum = measurements.reduce((a, b) => a + b, 0);
    return sum / measurements.length;
  }

  static getPerformanceReport(): string {
    const report = ['=== WASM Performance Report ==='];

    for (const [operation, measurements] of this.measurements.entries()) {
      const avg = this.getAverageTime(operation);
      const min = Math.min(...measurements);
      const max = Math.max(...measurements);
      const count = measurements.length;

      report.push(
        `${operation}: avg=${avg.toFixed(1)}ms, min=${min.toFixed(1)}ms, max=${max.toFixed(1)}ms (${count} samples)`
      );
    }

    return report.join('\n');
  }

  static clearMeasurements(): void {
    this.measurements.clear();
  }
}
