import { getLogger } from './production-logger';
const logger = getLogger('OCCT');
/**
 * Enhanced Worker Pool Management for OCCT Operations
 * Provides concurrent geometry processing with load balancing, automatic scaling,
 * and integration with WASM capability detection
 */

import { WorkerClient } from './worker-client';
import {
  WASMCapabilityDetector,
  WASMPerformanceMonitor,
  type OCCTConfig,
} from './wasm-capability-detector';
import type {
  WorkerRequest as _WorkerRequest,
  WorkerResponse as _WorkerResponse,
  HealthCheckResult,
} from './worker-types';
import type { ShapeHandle as _ShapeHandle, MeshData as _MeshData } from '@brepflow/types';

export interface PoolWorker {
  id: string;
  client: WorkerClient;
  busy: boolean;
  lastUsed: number;
  taskCount: number;
  errorCount: number;
  memoryPressure: boolean;
  occtMode: 'full-occt' | 'optimized-occt';
  capabilities: unknown;
  averageTaskDuration: number;
  lastHealthCheck: number;
  circuitBreakerTripped: boolean;
}

export interface PoolConfig {
  minWorkers: number;
  maxWorkers: number;
  idleTimeout: number;
  maxTasksPerWorker: number;
  healthCheckInterval: number;
  workerUrl?: string;
  memoryThreshold: number;
  enableCapabilityDetection: boolean;
  enablePerformanceMonitoring: boolean;
  enableCircuitBreaker: boolean;
  preferredOCCTMode?: 'full-occt' | 'optimized-occt';
  adaptiveScaling: boolean;
  taskTimeout: number;

  // DEPENDENCY INJECTION for testing
  // Allows tests to provide mock worker factory instead of real WorkerClient instantiation
  workerFactory?: (url: string | undefined, options: unknown) => WorkerClient;
  // Allows tests to provide mock capability detector
  capabilityDetector?: () => Promise<unknown>;
  // Allows tests to provide mock OCCT config provider
  configProvider?: () => Promise<OCCTConfig | null>;
  // Allows tests to provide mock performance monitor
  performanceMonitor?: {
    startMeasurement: (name: string) => (() => number) | undefined;
  };
}

export class WorkerPool {
  private workers = new Map<string, PoolWorker>();
  private queue: Array<{
    request: unknown;
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
    priority: number;
    timeout?: number;
    operation: string;
  }> = [];

  private nextWorkerId = 1;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private isShuttingDown = false;
  private globalCapabilities: unknown = null;
  private optimalOCCTConfig: OCCTConfig | null = null;

  // Dependency injection - store injected or default implementations
  private readonly workerFactory: (url: string | undefined, options: unknown) => WorkerClient;
  private readonly capabilityDetector: () => Promise<unknown>;
  private readonly configProvider: () => Promise<OCCTConfig | null>;
  private readonly performanceMonitor: {
    startMeasurement: (name: string) => (() => number) | undefined;
  };

  constructor(private config: PoolConfig) {
    // Initialize injected dependencies or use defaults
    this.workerFactory = config.workerFactory || ((url) => new WorkerClient(url));
    this.capabilityDetector =
      config.capabilityDetector || (() => WASMCapabilityDetector.detectCapabilities());
    this.configProvider =
      config.configProvider || (() => WASMCapabilityDetector.getOptimalConfiguration());
    this.performanceMonitor = config.performanceMonitor || WASMPerformanceMonitor;

    logger.info('[WorkerPool] Initialized with config:', {
      hasCustomWorkerFactory: !!config.workerFactory,
      hasCustomCapabilityDetector: !!config.capabilityDetector,
      hasCustomConfigProvider: !!config.configProvider,
      hasCustomPerformanceMonitor: !!config.performanceMonitor,
    });

    this.initializeCapabilities();
    this.startHealthChecks();
    this.startCleanupTimer();
    this.initializeMinWorkers();
  }

  /**
   * Initialize capabilities and optimal configuration
   * Uses injected capability detector and config provider for testability
   */
  private async initializeCapabilities(): Promise<void> {
    if (this.config.enableCapabilityDetection) {
      try {
        // Use injected dependency or default
        this.globalCapabilities = await this.capabilityDetector();
        this.optimalOCCTConfig = await this.configProvider();
        logger.info('[WorkerPool] Detected capabilities:', this.globalCapabilities);
        logger.info('[WorkerPool] Optimal OCCT config:', this.optimalOCCTConfig);
      } catch (error) {
        logger.warn('[WorkerPool] Failed to detect capabilities:', error);
        this.optimalOCCTConfig = null;
      }
    }
  }

  /**
   * Initialize minimum number of workers
   */
  private async initializeMinWorkers(): Promise<void> {
    const initPromises = [];
    for (let i = 0; i < this.config.minWorkers; i++) {
      initPromises.push(this.createWorker());
    }
    await Promise.all(initPromises);
    logger.info(`[WorkerPool] Initialized ${this.config.minWorkers} workers`);
  }

  /**
   * Create a new capability-aware worker
   * Uses injected worker factory and performance monitor for testability
   */
  private async createWorker(): Promise<PoolWorker> {
    const id = `worker_${this.nextWorkerId++}`;
    const startTime = Date.now();

    if (this.config.enablePerformanceMonitoring) {
      const _endMeasurement = this.performanceMonitor.startMeasurement(`worker-creation-${id}`);
    }

    try {
      // Determine OCCT mode for this worker
      const occtMode = this.determineWorkerOCCTMode();

      // Create worker client with injected factory
      const client = this.workerFactory(this.config.workerUrl, {
        occtMode,
        capabilities: this.globalCapabilities,
        enablePerformanceMonitoring: this.config.enablePerformanceMonitoring,
      });

      await client.init();

      const worker: PoolWorker = {
        id,
        client,
        busy: false,
        lastUsed: Date.now(),
        taskCount: 0,
        errorCount: 0,
        memoryPressure: false,
        occtMode,
        capabilities: this.globalCapabilities,
        averageTaskDuration: 0,
        lastHealthCheck: Date.now(),
        circuitBreakerTripped: false,
      };

      this.workers.set(id, worker);

      const duration = Date.now() - startTime;
      logger.info(`[WorkerPool] Created ${occtMode} worker ${id} in ${duration}ms`);

      return worker;
    } catch (error) {
      logger.error(`[WorkerPool] Failed to create worker ${id}:`, error);
      throw error;
    }
  }

  /**
   * Determine the optimal OCCT mode for a new worker
   */
  private determineWorkerOCCTMode(): 'full-occt' | 'optimized-occt' {
    // Use explicit preference if set
    if (this.config.preferredOCCTMode) {
      return this.config.preferredOCCTMode;
    }

    // Use detected optimal configuration
    if (this.optimalOCCTConfig) {
      return this.optimalOCCTConfig.mode;
    }

    // Adaptive selection based on current pool composition
    if (this.config.adaptiveScaling) {
      const workerModes = Array.from(this.workers.values()).map((w) => w.occtMode);
      const fullOCCTCount = workerModes.filter((m) => m === 'full-occt').length;
      const optimizedCount = workerModes.filter((m) => m === 'optimized-occt').length;

      // Balance the pool - prefer having at least one of each type if capabilities allow
      if (this.globalCapabilities?.hasWASM && fullOCCTCount === 0) {
        return 'full-occt';
      } else if (this.globalCapabilities?.hasWASM && optimizedCount === 0) {
        return 'optimized-occt';
      }

      // Default to optimal configuration
      return (this.optimalOCCTConfig as OCCTConfig | null)?.mode || 'optimized-occt';
    }

    // Conservative default
    return 'optimized-occt';
  }

  /**
   * Get an available worker or create one if needed, with optional mode preference
   */
  private async getAvailableWorker(preferredMode?: string): Promise<PoolWorker> {
    // Find idle worker with preferred mode
    if (preferredMode) {
      for (const worker of this.workers.values()) {
        if (
          !worker.busy &&
          !worker.memoryPressure &&
          !worker.circuitBreakerTripped &&
          worker.occtMode === preferredMode
        ) {
          return worker;
        }
      }
    }

    // Find any idle worker (circuit breaker aware)
    for (const worker of this.workers.values()) {
      if (!worker.busy && !worker.memoryPressure && !worker.circuitBreakerTripped) {
        return worker;
      }
    }

    // Find any idle worker (ignoring circuit breaker if desperate)
    for (const worker of this.workers.values()) {
      if (!worker.busy && !worker.memoryPressure) {
        return worker;
      }
    }

    // Check if we can create more workers
    if (this.workers.size < this.config.maxWorkers) {
      return await this.createWorker();
    }

    // Wait for a worker to become available
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const timeout = 30000;

      const checkWorkers = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > timeout) {
          reject(new Error('No workers available within timeout'));
          return;
        }

        // Check for preferred mode first
        if (preferredMode) {
          for (const worker of this.workers.values()) {
            if (
              !worker.busy &&
              !worker.memoryPressure &&
              !worker.circuitBreakerTripped &&
              worker.occtMode === preferredMode
            ) {
              resolve(worker);
              return;
            }
          }
        }

        // Check for any available worker
        for (const worker of this.workers.values()) {
          if (!worker.busy && !worker.memoryPressure && !worker.circuitBreakerTripped) {
            resolve(worker);
            return;
          }
        }

        // Check again after a short delay
        setTimeout(checkWorkers, 10);
      };

      checkWorkers();
    });
  }

  /**
   * Execute an operation on the pool with enhanced routing and monitoring
   */
  async execute<T = unknown>(
    operation: string,
    params: unknown,
    options: {
      priority?: number;
      timeout?: number;
      preferredMode?: 'full-occt' | 'optimized-occt';
    } = {}
  ): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error('Worker pool is shutting down');
    }

    const { priority = 0, timeout = this.config.taskTimeout, preferredMode } = options;
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let performanceEndMeasurement: (() => number) | undefined = undefined;
    if (this.config.enablePerformanceMonitoring) {
      performanceEndMeasurement = this.performanceMonitor.startMeasurement(
        `operation-${operation.toLowerCase()}`
      );
    }

    return new Promise<T>((resolve, reject) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        if (performanceEndMeasurement) performanceEndMeasurement();
        reject(new Error(`Task ${taskId} timeout after ${timeout}ms`));
      }, timeout);

      // Wrap async logic in IIFE to avoid async promise executor
      (async () => {
        try {
          const worker = await this.getAvailableWorker(preferredMode);

          // Mark worker as busy
          worker.busy = true;
          worker.lastUsed = Date.now();
          worker.taskCount++;

          const taskStartTime = Date.now();

          try {
            const result = await worker.client.invoke<T>(operation, params);

            // Task completed successfully
            const taskDuration = Date.now() - taskStartTime;
            worker.busy = false;

            // Update worker performance metrics
            if (worker.taskCount === 1) {
              worker.averageTaskDuration = taskDuration;
            } else {
              worker.averageTaskDuration =
                (worker.averageTaskDuration * (worker.taskCount - 1) + taskDuration) /
                worker.taskCount;
            }

            // Reset circuit breaker on success
            if (worker.circuitBreakerTripped) {
              worker.circuitBreakerTripped = false;
              logger.info(`[WorkerPool] Circuit breaker reset for worker ${worker.id}`);
            }

            clearTimeout(timeoutId);
            if (performanceEndMeasurement) performanceEndMeasurement();
            resolve(result);

            // Process next queued task if any
            this.processQueue();
          } catch (error) {
            worker.busy = false;
            worker.errorCount++;

            // Circuit breaker logic
            if (this.config.enableCircuitBreaker && worker.errorCount >= 3) {
              worker.circuitBreakerTripped = true;
              logger.warn(`[WorkerPool] Circuit breaker tripped for worker ${worker.id}`);
            }

            // Check if worker should be replaced due to errors
            if (worker.errorCount > 5) {
              logger.warn(`[WorkerPool] Replacing worker ${worker.id} due to repeated errors`);
              this.replaceWorker(worker.id);
            }

            clearTimeout(timeoutId);
            if (performanceEndMeasurement) performanceEndMeasurement();
            reject(error);
          }
        } catch (error) {
          // Could not get worker - queue for retry if high priority
          if (priority > 0) {
            this.queue.push({
              request: { operation, params },
              resolve,
              reject,
              priority,
              timeout,
              operation,
            });
            this.queue.sort((a, b) => b.priority - a.priority);
          } else {
            clearTimeout(timeoutId);
            if (performanceEndMeasurement) performanceEndMeasurement();
            reject(error);
          }
        }
      })();
    });
  }

  /**
   * Process queued tasks
   */
  private processQueue(): void {
    if (this.queue.length === 0) return;

    const availableWorkers = Array.from(this.workers.values()).filter(
      (w) => !w.busy && !w.memoryPressure
    );

    while (this.queue.length > 0 && availableWorkers.length > 0) {
      const task = this.queue.shift()!;
      const worker = availableWorkers.shift()!;

      worker.busy = true;
      worker.lastUsed = Date.now();
      worker.taskCount++;

      worker.client
        .invoke(task.request.operation, task.request.params)
        .then((result) => {
          worker.busy = false;
          task.resolve(result);
          this.processQueue();
        })
        .catch((error) => {
          worker.busy = false;
          worker.errorCount++;
          task.reject(error);
        });
    }
  }

  /**
   * Replace a problematic worker
   */
  private async replaceWorker(workerId: string): Promise<void> {
    const worker = this.workers.get(workerId);
    if (!worker) return;

    try {
      await worker.client.terminate();
      this.workers.delete(workerId);

      // Create replacement if we're below minimum
      if (this.workers.size < this.config.minWorkers) {
        await this.createWorker();
      }
    } catch (error) {
      logger.error(`[WorkerPool] Failed to replace worker ${workerId}:`, error);
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.healthCheckTimer = setInterval(async () => {
      for (const [workerId, worker] of this.workers) {
        if (worker.busy) continue; // Skip busy workers

        try {
          const health = await worker.client.invoke<HealthCheckResult>('HEALTH_CHECK', {});

          // Check memory pressure
          const memoryPressure = health.memoryUsage > this.config.memoryThreshold;
          if (memoryPressure !== worker.memoryPressure) {
            worker.memoryPressure = memoryPressure;
            logger.info(`[WorkerPool] Worker ${workerId} memory pressure: ${memoryPressure}`);
          }

          // Replace worker if under memory pressure and has processed many tasks
          if (memoryPressure && worker.taskCount > this.config.maxTasksPerWorker) {
            logger.info(`[WorkerPool] Replacing worker ${workerId} due to memory pressure`);
            this.replaceWorker(workerId);
          }
        } catch (error) {
          logger.warn(`[WorkerPool] Health check failed for worker ${workerId}:`, error);
          worker.errorCount++;

          if (worker.errorCount > 2) {
            this.replaceWorker(workerId);
          }
        }
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Start cleanup timer for idle workers
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const idleWorkers = Array.from(this.workers.values()).filter(
        (w) => !w.busy && now - w.lastUsed > this.config.idleTimeout
      );

      // Keep minimum workers
      const workersToRemove = idleWorkers.slice(this.config.minWorkers);

      for (const worker of workersToRemove) {
        if (this.workers.size > this.config.minWorkers) {
          logger.info(`[WorkerPool] Removing idle worker ${worker.id}`);
          worker.client.terminate();
          this.workers.delete(worker.id);
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const workers = Array.from(this.workers.values());
    const busyWorkers = workers.filter((w) => w.busy).length;
    const totalTasks = workers.reduce((sum, w) => sum + w.taskCount, 0);
    const totalErrors = workers.reduce((sum, w) => sum + w.errorCount, 0);
    const memoryPressureWorkers = workers.filter((w) => w.memoryPressure).length;

    return {
      totalWorkers: this.workers.size,
      busyWorkers,
      idleWorkers: this.workers.size - busyWorkers,
      queuedTasks: this.queue.length,
      totalTasks,
      totalErrors,
      memoryPressureWorkers,
      errorRate: totalTasks > 0 ? (totalErrors / totalTasks) * 100 : 0,
    };
  }

  /**
   * Shutdown the pool and terminate all workers
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;

    // Clear timers
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    // Reject queued tasks
    for (const task of this.queue) {
      task.reject(new Error('Worker pool shutting down'));
    }
    this.queue.length = 0;

    // Terminate all workers
    const terminatePromises = Array.from(this.workers.values()).map((worker) =>
      worker.client.terminate()
    );

    await Promise.all(terminatePromises);
    this.workers.clear();

    logger.info('[WorkerPool] Shutdown complete');
  }
}

// Enhanced default pool configuration
export const DEFAULT_POOL_CONFIG: PoolConfig = {
  minWorkers: 2,
  maxWorkers: 6,
  idleTimeout: 300000, // 5 minutes
  maxTasksPerWorker: 100,
  healthCheckInterval: 30000, // 30 seconds
  memoryThreshold: 1024, // 1GB in MB
  enableCapabilityDetection: true,
  enablePerformanceMonitoring: true,
  enableCircuitBreaker: true,
  adaptiveScaling: true,
  taskTimeout: 30000, // 30 seconds
};

// Global pool instance
let globalPool: WorkerPool | null = null;

/**
 * Get or create the global worker pool
 */
export function getWorkerPool(config?: Partial<PoolConfig>): WorkerPool {
  if (!globalPool) {
    globalPool = new WorkerPool({ ...DEFAULT_POOL_CONFIG, ...config });
  }
  return globalPool;
}

/**
 * Create a new worker pool instance
 */
export function createWorkerPool(config?: Partial<PoolConfig>): WorkerPool {
  return new WorkerPool({ ...DEFAULT_POOL_CONFIG, ...config });
}

/**
 * Shutdown the global pool
 */
export async function shutdownGlobalPool(): Promise<void> {
  if (globalPool) {
    await globalPool.shutdown();
    globalPool = null;
  }
}
