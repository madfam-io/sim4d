/**
 * Production OCCT Worker API
 * Manages Web Worker communication with real OCCT geometry operations
 */

import { getConfig } from '@brepflow/engine-core';
import type { WorkerAPI, WorkerRequest, WorkerResponse } from '@brepflow/types';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Lazy logger initialization to avoid constructor issues during module loading
let logger: unknown = null;
const getLogger = () => {
  if (!logger) {
    // Use dynamic import but don't wait - fallback to console temporarily
    import('./production-logger').then(({ ProductionLogger }) => {
      logger = new ProductionLogger('ProductionWorkerAPI');
    });
    // Return console logger as fallback
    return console;
  }
  return logger;
};

export interface ProductionWorkerConfig {
  wasmPath: string;
  initTimeout: number;
  validateOutput: boolean;
  memoryThreshold: number;
}

export class ProductionWorkerAPI implements WorkerAPI {
  private worker: Worker | null = null;
  private requestId = 0;
  private pendingRequests = new Map<
    number,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();
  private isInitialized = false;
  private config: ProductionWorkerConfig;

  constructor(config: ProductionWorkerConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    if (this.isInitialized) {
      getLogger().debug('Worker already initialized');
      return;
    }

    getLogger().info('Initializing production OCCT worker');

    // Check environment
    const _envConfig = getConfig();
    // Create worker
    try {
      // Use public directory path for worker - this works reliably across environments
      let workerUrl: string;
      let nodeWorkerUrlObject: URL | null = null;
      const isNodeRuntime = typeof process !== 'undefined' && !!process.versions?.node;

      if (isNodeRuntime) {
        const localWorkerPath = path.resolve(process.cwd(), 'packages/engine-occt/dist/worker.mjs');
        nodeWorkerUrlObject = pathToFileURL(localWorkerPath);
        workerUrl = nodeWorkerUrlObject.href;
        getLogger().info('Node context: using local worker file', { workerUrl, localWorkerPath });
      } else if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
        workerUrl = '/wasm/worker.mjs';
        getLogger().info('Browser context: using public worker path');
      } else if (typeof self !== 'undefined' && (self as unknown).location) {
        const origin = (self as unknown).location?.origin || 'http://localhost:5174';
        workerUrl = `${origin}/wasm/worker.mjs`;
        getLogger().info('Worker context: using public worker URL');
      } else {
        const localWorkerPath = path.resolve(process.cwd(), 'packages/engine-occt/dist/worker.mjs');
        nodeWorkerUrlObject = pathToFileURL(localWorkerPath);
        workerUrl = nodeWorkerUrlObject.href;
        getLogger().info('Unknown context: falling back to local worker file', {
          workerUrl,
          localWorkerPath,
        });
      }

      getLogger().info(`Creating worker with URL: ${workerUrl}`);
      const workerOptions: any = { type: 'module' };

      if (isNodeRuntime) {
        const { Worker: NodeWorker } = await import('node:worker_threads');
        this.worker = new NodeWorker(nodeWorkerUrlObject ?? workerUrl, workerOptions);
      } else {
        this.worker = new Worker(workerUrl, workerOptions);
      }

      this.setupWorkerHandlers();

      // Initialize OCCT
      await this.invoke('INIT', {});
      this.isInitialized = true;

      getLogger().info('Production OCCT worker initialized successfully');
    } catch (error) {
      getLogger().error('Failed to initialize production worker', error);
      this.cleanup();
      throw new Error(
        `Worker initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private setupWorkerHandlers(): void {
    if (!this.worker) return;

    const handleMessage = (response: WorkerResponse) => {
      if (response.id !== undefined) {
        const pending = this.pendingRequests.get(response.id);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(response.id);

          if (response.success) {
            pending.resolve(response.result);
          } else {
            const error = new Error(response.error?.message || 'Worker operation failed');
            (error as unknown).code = response.error?.code;
            (error as unknown).details = response.error?.details;
            pending.reject(error);
          }
        }
      } else {
        this.handleWorkerEvent(response);
      }
    };

    const handleError = (event: unknown) => {
      const message = event?.message || event?.toString?.() || 'Worker error';
      getLogger().error('Worker error', event);
      this.handleWorkerError(new Error(message));
    };

    if (typeof this.worker.on === 'function') {
      this.worker.on('message', (data: WorkerResponse) => handleMessage(data));
      this.worker.on('error', handleError);
      this.worker.on('messageerror', handleError);
    } else {
      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => handleMessage(event.data);
      this.worker.onerror = handleError;
      this.worker.onmessageerror = handleError;
    }
  }

  private handleWorkerEvent(event: unknown): void {
    switch (event.type) {
      case 'MEMORY_PRESSURE':
        getLogger().warn('Worker memory pressure detected', {
          usedMB: event.usedMB,
          threshold: event.threshold,
        });
        // Could trigger worker restart here
        break;

      case 'WORKER_ERROR':
        getLogger().error('Worker reported error', event.error);
        break;

      default:
        getLogger().debug('Unknown worker event', event);
    }
  }

  private handleWorkerError(error: Error): void {
    // Reject all pending requests
    for (const [_id, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(error);
    }
    this.pendingRequests.clear();

    // Mark as not initialized
    this.isInitialized = false;
  }

  async invoke<T>(operation: string, params: unknown): Promise<T> {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    if (operation !== 'INIT' && !this.isInitialized) {
      throw new Error('Worker not ready - call init() first');
    }

    const requestId = ++this.requestId;
    const request: WorkerRequest = {
      id: requestId,
      type: operation,
      params,
    };

    return new Promise<T>((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Operation ${operation} timed out after ${this.config.initTimeout}ms`));
      }, this.config.initTimeout);

      // Store pending request
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout,
      });

      // Send request
      this.worker!.postMessage(request);

      getLogger().debug(`Sent request ${requestId}: ${operation}`, params);
    });
  }

  async shutdown(): Promise<void> {
    if (this.worker) {
      try {
        // Attempt graceful shutdown
        await this.invoke('SHUTDOWN', {}).catch(() => {
          // Ignore shutdown errors
        });
      } finally {
        this.cleanup();
      }
    }
  }

  private cleanup(): void {
    // Clear pending requests
    for (const [_id, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Worker terminated'));
    }
    this.pendingRequests.clear();

    // Terminate worker
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.isInitialized = false;
    getLogger().info('Worker cleaned up');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.invoke('HEALTH_CHECK', {});
      return !!(result as unknown)?.healthy;
    } catch (error) {
      getLogger().error('Health check failed', error);
      return false;
    }
  }

  // Memory management
  async getMemoryUsage(): Promise<number> {
    try {
      const result = await this.invoke('HEALTH_CHECK', {});
      return (result as unknown)?.memoryUsage || 0;
    } catch (error) {
      getLogger().error('Failed to get memory usage', error);
      return 0;
    }
  }

  // Force cleanup of geometry objects
  async cleanupGeometry(): Promise<void> {
    try {
      await this.invoke('CLEANUP', {});
    } catch (error) {
      getLogger().error('Cleanup failed', error);
    }
  }

  // Tessellate shape for rendering
  async tessellate(shapeId: string, deflection: number): Promise<unknown> {
    try {
      const result = await this.invoke('TESSELLATE', {
        shapeId,
        deflection,
      });
      return result;
    } catch (error) {
      getLogger().error('Tessellation failed', error);
      throw error;
    }
  }

  // Dispose of a shape handle
  async dispose(handleId: string): Promise<void> {
    try {
      await this.invoke('DISPOSE', { handleId });
    } catch (error) {
      getLogger().error('Dispose failed', error);
    }
  }

  // Get worker status
  getStatus(): {
    initialized: boolean;
    pendingRequests: number;
    workerId: string | null;
  } {
    return {
      initialized: this.isInitialized,
      pendingRequests: this.pendingRequests.size,
      workerId: this.worker ? 'production-worker' : null,
    };
  }
}

// Factory function for easy creation
export function createProductionAPI(
  overrides: Partial<ProductionWorkerConfig> = {}
): ProductionWorkerAPI {
  const config = getConfig();

  const fullConfig: ProductionWorkerConfig = {
    wasmPath: config.occtWasmPath,
    initTimeout: config.occtInitTimeout,
    validateOutput: config.validateGeometryOutput,
    memoryThreshold: config.workerRestartThresholdMB,
    ...overrides,
  };

  return new ProductionWorkerAPI(fullConfig);
}
