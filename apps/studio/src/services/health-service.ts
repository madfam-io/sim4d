/**
 * Health Monitoring Service
 * Provides comprehensive health checks for production deployment
 */

import { ProductionGeometryService } from './geometry-service.production';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    geometry: HealthCheck;
    memory: HealthCheck;
    wasm: HealthCheck;
    workers: HealthCheck;
    browser: HealthCheck;
  };
  metrics: {
    uptime: number;
    totalRequests: number;
    errorRate: number;
    memoryUsage: MemoryInfo;
  };
}

export interface HealthCheck {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: any;
}

interface MemoryInfo {
  used: number;
  total: number;
  percentage: number;
}

export class HealthService {
  private static instance: HealthService;
  private startTime = Date.now();
  private totalRequests = 0;
  private totalErrors = 0;

  private constructor() {}

  static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  /**
   * Perform comprehensive health check
   */
  async getHealth(): Promise<HealthStatus> {
    const checks = {
      geometry: await this.checkGeometry(),
      memory: await this.checkMemory(),
      wasm: await this.checkWASM(),
      workers: await this.checkWorkers(),
      browser: await this.checkBrowser(),
    };

    const allHealthy = Object.values(checks).every((c) => c.status === 'pass');
    const anyFailed = Object.values(checks).some((c) => c.status === 'fail');

    return {
      status: anyFailed ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.VITE_APP_VERSION || '1.0.0',
      checks,
      metrics: {
        uptime: Date.now() - this.startTime,
        totalRequests: this.totalRequests,
        errorRate: this.totalRequests > 0 ? this.totalErrors / this.totalRequests : 0,
        memoryUsage: await this.getMemoryUsage(),
      },
    };
  }

  /**
   * Check geometry service health
   */
  private async checkGeometry(): Promise<HealthCheck> {
    try {
      const geometryService = ProductionGeometryService.getInstance();
      const health = await geometryService.checkHealth();

      if (!health.healthy) {
        return {
          status: 'fail',
          message: 'Geometry service is unhealthy',
          details: health.details,
        };
      }

      return {
        status: 'pass',
        message: 'Geometry service is operational',
        details: health.details,
      };
    } catch (error: unknown) {
      return {
        status: 'fail',
        message: `Geometry service error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemory(): Promise<HealthCheck> {
    const memory = await this.getMemoryUsage();

    if (memory.percentage > 90) {
      return {
        status: 'fail',
        message: `Critical memory usage: ${memory.percentage.toFixed(1)}%`,
        details: memory,
      };
    }

    if (memory.percentage > 75) {
      return {
        status: 'warn',
        message: `High memory usage: ${memory.percentage.toFixed(1)}%`,
        details: memory,
      };
    }

    return {
      status: 'pass',
      message: `Memory usage normal: ${memory.percentage.toFixed(1)}%`,
      details: memory,
    };
  }

  /**
   * Check WebAssembly support
   */
  private async checkWASM(): Promise<HealthCheck> {
    if (typeof WebAssembly === 'undefined') {
      return {
        status: 'fail',
        message: 'WebAssembly not supported',
      };
    }

    if (typeof SharedArrayBuffer === 'undefined') {
      return {
        status: 'warn',
        message: 'SharedArrayBuffer not available (COOP/COEP headers may be missing)',
      };
    }

    try {
      // Try to compile a minimal WASM module
      const wasmCode = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
      await WebAssembly.compile(wasmCode);

      return {
        status: 'pass',
        message: 'WebAssembly fully supported',
        details: {
          sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
          threads: 'crossOriginIsolated' in window && window.crossOriginIsolated,
        },
      };
    } catch (error: unknown) {
      return {
        status: 'fail',
        message: `WebAssembly compilation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Check worker availability
   */
  private async checkWorkers(): Promise<HealthCheck> {
    if (typeof Worker === 'undefined') {
      return {
        status: 'fail',
        message: 'Web Workers not supported',
      };
    }

    try {
      // Test worker creation
      const workerCode = `self.postMessage('test');`;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);

      const testWorker = new Worker(workerUrl);

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          testWorker.terminate();
          URL.revokeObjectURL(workerUrl);
          resolve({
            status: 'fail',
            message: 'Worker communication timeout',
          });
        }, 5000);

        testWorker.onmessage = (e) => {
          clearTimeout(timeout);
          testWorker.terminate();
          URL.revokeObjectURL(workerUrl);

          if (e.data === 'test') {
            resolve({
              status: 'pass',
              message: 'Workers operational',
            });
          } else {
            resolve({
              status: 'warn',
              message: 'Worker communication abnormal',
            });
          }
        };

        testWorker.onerror = (error) => {
          clearTimeout(timeout);
          testWorker.terminate();
          URL.revokeObjectURL(workerUrl);
          resolve({
            status: 'fail',
            message: `Worker error: ${error instanceof Error ? error.message : String(error)}`,
          });
        };
      });
    } catch (error: unknown) {
      return {
        status: 'fail',
        message: `Worker creation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Check browser compatibility
   */
  private async checkBrowser(): Promise<HealthCheck> {
    const required = {
      WebGL2: typeof WebGL2RenderingContext !== 'undefined',
      IndexedDB: 'indexedDB' in window,
      LocalStorage: 'localStorage' in window,
      Fetch: 'fetch' in window,
      Promises: typeof Promise !== 'undefined',
    };

    const missing = Object.entries(required)
      .filter(([, supported]) => !supported)
      .map(([feature]) => feature);

    if (missing.length > 0) {
      return {
        status: 'fail',
        message: `Missing browser features: ${missing.join(', ')}`,
        details: required,
      };
    }

    // Check for optimal features
    const optimal = {
      WebGPU: 'gpu' in navigator,
      OffscreenCanvas: typeof OffscreenCanvas !== 'undefined',
      ResizeObserver: typeof ResizeObserver !== 'undefined',
    };

    const missingOptimal = Object.entries(optimal)
      .filter(([, supported]) => !supported)
      .map(([feature]) => feature);

    if (missingOptimal.length > 0) {
      return {
        status: 'pass',
        message: 'Browser compatible (some optional features missing)',
        details: { ...required, ...optimal },
      };
    }

    return {
      status: 'pass',
      message: 'Browser fully compatible',
      details: { ...required, ...optimal },
    };
  }

  /**
   * Get memory usage information
   */
  private async getMemoryUsage(): Promise<MemoryInfo> {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }

    // Fallback estimation
    return {
      used: 0,
      total: 2147483648, // 2GB default
      percentage: 0,
    };
  }

  /**
   * Record a request for metrics
   */
  recordRequest(isError: boolean = false): void {
    this.totalRequests++;
    if (isError) {
      this.totalErrors++;
    }
  }

  /**
   * Get liveness check (basic availability)
   */
  async getLiveness(): Promise<{ alive: boolean }> {
    return { alive: true };
  }

  /**
   * Get readiness check (ready to serve traffic)
   */
  async getReadiness(): Promise<{ ready: boolean; message?: string }> {
    try {
      const health = await this.getHealth();
      const ready = health.status !== 'unhealthy';

      return {
        ready,
        message: ready ? 'Ready to serve' : 'Service not ready',
      };
    } catch (error: unknown) {
      return {
        ready: false,
        message: `Readiness check failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
