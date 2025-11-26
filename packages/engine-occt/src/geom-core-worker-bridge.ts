/**
 * GeomCore Worker Bridge
 *
 * Enables geom-core SDK usage in Web Workers, matching sim4d's existing
 * worker architecture. This bridge handles message passing between the
 * main thread and worker threads.
 *
 * @module engine-occt/geom-core-worker-bridge
 */

import type {
  WorkerRequest,
  WorkerResponse,
  GeometryResult,
  TessellationResult,
} from './worker-types';
import { GeomCoreAdapter, type GeomCoreAdapterConfig, OPERATION_MAP } from './geom-core-adapter';
import { getLogger } from './production-logger';

const logger = getLogger('GeomCoreWorkerBridge');

// =============================================================================
// Worker Bridge Types
// =============================================================================

export interface WorkerBridgeConfig extends GeomCoreAdapterConfig {
  /** Worker timeout in ms (default: 30000) */
  timeout?: number;
  /** Max concurrent operations (default: 4) */
  maxConcurrent?: number;
}

export const DEFAULT_BRIDGE_CONFIG: Required<WorkerBridgeConfig> = {
  enabled: true,
  fallbackOnError: true,
  verbose: false,
  sdkConfig: {
    enableRemoteCompute: false,
    enablePrecomputation: true,
    maxMemoryBytes: 256 * 1024 * 1024, // 256MB per worker
    slowOperationThresholdMs: 50,
  },
  timeout: 30000,
  maxConcurrent: 4,
};

// =============================================================================
// Worker-Side Bridge (runs in Web Worker)
// =============================================================================

/**
 * Worker-side bridge that processes messages using geom-core adapter.
 * This class should be instantiated inside a Web Worker.
 */
export class GeomCoreWorkerHandler {
  private adapter: GeomCoreAdapter;
  private initialized = false;

  constructor(config?: GeomCoreAdapterConfig) {
    this.adapter = new GeomCoreAdapter(config);
  }

  /**
   * Initialize the worker handler
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    await this.adapter.init();
    this.initialized = true;
    logger.info('[GeomCoreWorkerHandler] Initialized');
  }

  /**
   * Handle incoming worker message
   */
  async handleMessage(request: WorkerRequest): Promise<WorkerResponse> {
    const { id, type, params } = request as WorkerRequest & { params: Record<string, unknown> };

    try {
      // Handle special messages
      if (type === 'INIT') {
        await this.init();
        return {
          id,
          success: true,
          result: { initialized: true },
        };
      }

      if (type === 'HEALTH_CHECK') {
        return {
          id,
          success: true,
          result: {
            healthy: this.initialized,
            memoryUsage: 0,
            uptime: performance.now(),
          },
        };
      }

      if (type === 'SHUTDOWN') {
        this.adapter.dispose();
        return {
          id,
          success: true,
          result: { shutdown: true },
        };
      }

      if (type === 'CLEANUP') {
        await this.adapter.invoke('CLEANUP', {});
        return {
          id,
          success: true,
          result: { cleaned: true },
        };
      }

      // Ensure initialized for geometry operations
      await this.init();

      // Execute geometry operation through adapter
      const result = await this.adapter.invoke(type, params);

      if (result.success) {
        return {
          id,
          success: true,
          result: result.result,
        };
      } else {
        return {
          id,
          success: false,
          error: {
            code: 'OPERATION_FAILED',
            message: result.error ?? 'Unknown error',
          },
        };
      }
    } catch (error) {
      logger.error(`[GeomCoreWorkerHandler] Error handling ${type}:`, error);
      return {
        id,
        success: false,
        error: {
          code: 'WORKER_ERROR',
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}

// =============================================================================
// Main Thread Bridge Client
// =============================================================================

interface PendingRequest {
  resolve: (response: WorkerResponse) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

/**
 * Main thread client that communicates with geom-core worker.
 * This class runs on the main thread and sends messages to workers.
 */
export class GeomCoreWorkerClient {
  private worker: Worker | null = null;
  private pending: Map<string, PendingRequest> = new Map();
  private config: Required<WorkerBridgeConfig>;
  private requestId = 0;
  private initialized = false;

  constructor(config?: WorkerBridgeConfig) {
    this.config = { ...DEFAULT_BRIDGE_CONFIG, ...config };
  }

  /**
   * Initialize with a worker instance
   */
  async init(worker: Worker): Promise<void> {
    if (this.initialized) return;

    this.worker = worker;

    // Set up message handler
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      this.handleResponse(event.data);
    };

    this.worker.onerror = (error) => {
      logger.error('[GeomCoreWorkerClient] Worker error:', error);
    };

    // Send init message
    const response = await this.send({ type: 'INIT', params: {} });
    if (!response.success) {
      throw new Error(`Worker init failed: ${response.error?.message}`);
    }

    this.initialized = true;
    logger.info('[GeomCoreWorkerClient] Initialized');
  }

  /**
   * Send a request to the worker
   */
  async send(request: { type: string; params: unknown }): Promise<WorkerResponse> {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    const id = `req_${++this.requestId}`;
    const fullRequest = { ...request, id };

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Worker request timeout: ${request.type}`));
      }, this.config.timeout);

      this.pending.set(id, { resolve, reject, timeoutId });
      this.worker!.postMessage(fullRequest);
    });
  }

  /**
   * Handle worker response
   */
  private handleResponse(response: WorkerResponse): void {
    const pending = this.pending.get(response.id);
    if (!pending) {
      logger.warn('[GeomCoreWorkerClient] Unknown response id:', response.id);
      return;
    }

    clearTimeout(pending.timeoutId);
    this.pending.delete(response.id);
    pending.resolve(response);
  }

  /**
   * Invoke geometry operation
   */
  async invoke<T = unknown>(
    operation: string,
    params: Record<string, unknown>
  ): Promise<WorkerResponse<T>> {
    return this.send({
      type: operation as WorkerRequest['type'],
      params,
    }) as Promise<WorkerResponse<T>>;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.send({ type: 'HEALTH_CHECK', params: {} });
      return response.success && response.result?.healthy;
    } catch {
      return false;
    }
  }

  /**
   * Shutdown worker
   */
  async shutdown(): Promise<void> {
    if (!this.worker) return;

    try {
      await this.send({ type: 'SHUTDOWN', params: {} });
    } catch {
      // Ignore shutdown errors
    }

    // Cancel pending requests
    for (const [id, pending] of Array.from(this.pending.entries())) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error('Worker shutdown'));
    }
    this.pending.clear();

    this.worker.terminate();
    this.worker = null;
    this.initialized = false;

    logger.info('[GeomCoreWorkerClient] Shutdown complete');
  }
}

// =============================================================================
// Worker Pool with GeomCore
// =============================================================================

interface PooledWorker {
  client: GeomCoreWorkerClient;
  busy: boolean;
  taskCount: number;
}

/**
 * Worker pool that manages multiple geom-core workers for parallel processing.
 */
export class GeomCoreWorkerPool {
  private workers: PooledWorker[] = [];
  private config: Required<WorkerBridgeConfig>;
  private workerFactory: () => Worker;
  private initialized = false;

  constructor(workerFactory: () => Worker, config?: WorkerBridgeConfig) {
    this.workerFactory = workerFactory;
    this.config = { ...DEFAULT_BRIDGE_CONFIG, ...config };
  }

  /**
   * Initialize the worker pool
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    const initPromises: Promise<void>[] = [];

    for (let i = 0; i < this.config.maxConcurrent; i++) {
      const worker = this.workerFactory();
      const client = new GeomCoreWorkerClient(this.config);

      initPromises.push(
        client.init(worker).then(() => {
          this.workers.push({
            client,
            busy: false,
            taskCount: 0,
          });
        })
      );
    }

    await Promise.all(initPromises);
    this.initialized = true;
    logger.info(`[GeomCoreWorkerPool] Initialized with ${this.workers.length} workers`);
  }

  /**
   * Get least busy worker
   */
  private getLeastBusyWorker(): PooledWorker {
    let best = this.workers[0];
    for (const worker of this.workers) {
      if (!worker.busy && worker.taskCount < best.taskCount) {
        best = worker;
      }
    }
    return best;
  }

  /**
   * Execute operation on pool
   */
  async execute<T = unknown>(
    operation: string,
    params: Record<string, unknown>
  ): Promise<WorkerResponse<T>> {
    await this.init();

    const worker = this.getLeastBusyWorker();
    worker.busy = true;
    worker.taskCount++;

    try {
      const result = await worker.client.invoke<T>(operation, params);
      return result;
    } finally {
      worker.busy = false;
    }
  }

  /**
   * Execute multiple operations in parallel
   */
  async executeParallel<T = unknown>(
    operations: Array<{ operation: string; params: Record<string, unknown> }>
  ): Promise<WorkerResponse<T>[]> {
    await this.init();

    return Promise.all(
      operations.map(({ operation, params }) => this.execute<T>(operation, params))
    );
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    workerCount: number;
    busyWorkers: number;
    totalTasks: number;
  } {
    return {
      workerCount: this.workers.length,
      busyWorkers: this.workers.filter((w) => w.busy).length,
      totalTasks: this.workers.reduce((sum, w) => sum + w.taskCount, 0),
    };
  }

  /**
   * Shutdown all workers
   */
  async shutdown(): Promise<void> {
    await Promise.all(this.workers.map((w) => w.client.shutdown()));
    this.workers = [];
    this.initialized = false;
    logger.info('[GeomCoreWorkerPool] Shutdown complete');
  }
}

// =============================================================================
// Worker Script Helper
// =============================================================================

/**
 * Setup function to be called inside a Web Worker script.
 * Creates the worker handler and wires up message handling.
 *
 * Usage in worker script:
 * ```typescript
 * import { setupGeomCoreWorker } from './geom-core-worker-bridge';
 * setupGeomCoreWorker();
 * ```
 */
export function setupGeomCoreWorker(config?: GeomCoreAdapterConfig): void {
  const handler = new GeomCoreWorkerHandler(config);

  self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    const response = await handler.handleMessage(event.data);
    self.postMessage(response);
  };

  logger.info('[GeomCoreWorker] Worker script initialized');
}

// =============================================================================
// Factory Functions
// =============================================================================

let globalPool: GeomCoreWorkerPool | null = null;

/**
 * Get or create the global worker pool
 */
export function getGeomCoreWorkerPool(
  workerFactory: () => Worker,
  config?: WorkerBridgeConfig
): GeomCoreWorkerPool {
  if (!globalPool) {
    globalPool = new GeomCoreWorkerPool(workerFactory, config);
  }
  return globalPool;
}

/**
 * Create a new worker pool instance
 */
export function createGeomCoreWorkerPool(
  workerFactory: () => Worker,
  config?: WorkerBridgeConfig
): GeomCoreWorkerPool {
  return new GeomCoreWorkerPool(workerFactory, config);
}

/**
 * Shutdown the global worker pool
 */
export async function shutdownGlobalPool(): Promise<void> {
  if (globalPool) {
    await globalPool.shutdown();
    globalPool = null;
  }
}
