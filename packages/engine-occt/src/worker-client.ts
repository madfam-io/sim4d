// TODO: Align ShapeHandle interface between @brepflow/types and local occt-bindings.ts
import type { WorkerAPI, ShapeHandle, MeshData } from '@brepflow/types';
import { createHandleId } from '@brepflow/types';
import type {
  WorkerRequest,
  WorkerResponse,
  GeometryResult,
  TessellationResult,
} from './worker-types';

export class WorkerClient implements WorkerAPI {
  private worker: Worker | null = null;
  private pending = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (error: any) => void;
    }
  >();
  private requestId = 0;
  private initPromise: Promise<void> | null = null;

  constructor(private workerUrl?: string) {}

  /**
   * Initialize the worker with robust path resolution
   */
  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      try {
        // Create worker based on environment
        if (this.workerUrl) {
          this.worker = new Worker(this.workerUrl, { type: 'module' });
        } else {
          // Use default worker path - resolve from engine-occt package
          try {
            // In production, check if we're in a bundled environment
            if (import.meta.url.includes('/assets/')) {
              // Production bundle - use relative path from assets
              const workerPath = './worker' + '.mjs';
              this.worker = new Worker(/* @vite-ignore */ new URL(workerPath, import.meta.url), {
                type: 'module',
              });
            } else {
              // Development - try engine-occt dist path
              const workerUrl = new URL(
                /* @vite-ignore */ '../engine-occt/dist/worker.mjs',
                import.meta.url
              ).href;
              this.worker = new Worker(workerUrl, { type: 'module' });
            }
          } catch {
            // Final fallback: construct path dynamically to avoid Vite static analysis
            const workerPath = './worker' + '.mjs';
            this.worker = new Worker(/* @vite-ignore */ new URL(workerPath, import.meta.url), {
              type: 'module',
            });
          }
        }

        // Set up message handling
        this.worker.onmessage = this.handleMessage.bind(this);
        this.worker.onerror = this.handleError.bind(this);

        // Send init message
        this.sendRequest({ type: 'INIT', params: {} }).then(() => resolve(), reject);
      } catch (error) {
        reject(error);
      }
    });

    return this.initPromise;
  }

  /**
   * Send request to worker
   */
  private async sendRequest(request: Partial<WorkerRequest>): Promise<any> {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    const id = `req_${++this.requestId}`;
    const fullRequest = { ...request, id };

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker!.postMessage(fullRequest);

      // Add timeout
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Request ${id} timed out`));
        }
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Handle worker messages
   */
  private handleMessage(event: MessageEvent<WorkerResponse>): void {
    const { id, success, result, error } = event.data;

    const pending = this.pending.get(id);
    if (!pending) return;

    this.pending.delete(id);

    if (success) {
      pending.resolve(result);
    } else {
      pending.reject(new Error(error?.message || 'Unknown error'));
    }
  }

  /**
   * Handle worker errors
   */
  private handleError(error: ErrorEvent): void {
    console.error('Worker error:', error);

    // Reject all pending requests
    for (const [id, { reject }] of this.pending) {
      reject(new Error('Worker error: ' + error.message));
    }
    this.pending.clear();
  }

  /**
   * Invoke geometry operation
   */
  async invoke<T = any>(operation: string, params: any): Promise<T> {
    await this.init();

    const result = await this.sendRequest({
      type: operation as any,
      params,
    } as WorkerRequest);

    return result as T;
  }

  /**
   * Tessellate shape to mesh
   */
  async tessellate(shapeId: string, deflection: number): Promise<MeshData> {
    await this.init();

    const result = (await this.sendRequest({
      type: 'TESSELLATE',
      params: {
        shape: { id: createHandleId(shapeId), type: 'solid' },
        deflection,
      },
    })) as TessellationResult;

    return result.mesh;
  }

  /**
   * Dispose shape handle
   */
  async dispose(handleId: string): Promise<void> {
    await this.init();

    await this.sendRequest({
      type: 'DISPOSE',
      params: { handle: handleId },
    });
  }

  /**
   * Terminate worker
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pending.clear();
    this.initPromise = null;
  }
}

// Singleton instance
let workerClient: WorkerClient | null = null;

/**
 * Get or create worker client instance
 */
export function getWorkerClient(): WorkerClient {
  if (!workerClient) {
    workerClient = new WorkerClient();
  }
  return workerClient;
}

/**
 * Create a new worker client instance
 */
export function createWorkerClient(workerUrl?: string): WorkerClient {
  return new WorkerClient(workerUrl);
}
