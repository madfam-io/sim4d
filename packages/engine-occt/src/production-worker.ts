/**
 * Production-ready OCCT.wasm worker with proper error handling
 * No mock fallbacks - fails fast if real geometry unavailable
 */

import { loadOCCT, OCCTMemoryManager } from './occt-bindings';
import { GeometryValidator } from './geometry-validator';
import { ProductionLogger } from './production-logger';
import type { WorkerRequest, WorkerResponse } from './worker-types';

let occtModule: unknown = null;
let isInitialized = false;
const logger = new ProductionLogger('OCCTWorker');
const validator = new GeometryValidator();

// Production error handler
class WorkerError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'WorkerError';
  }
}

// Memory monitoring
let memoryMonitor: NodeJS.Timeout | null = null;

function startMemoryMonitoring() {
  if (memoryMonitor) return;

  memoryMonitor = setInterval(() => {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as unknown).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);

      logger.debug(`Memory usage: ${usedMB}MB / ${totalMB}MB`);

      // Check for memory pressure
      const threshold = parseInt(
        (typeof process !== 'undefined' ? process.env.WORKER_RESTART_THRESHOLD_MB : undefined) ||
          '1800'
      );
      if (usedMB > threshold) {
        logger.warn(`Memory threshold exceeded: ${usedMB}MB > ${threshold}MB`);
        self.postMessage({
          type: 'MEMORY_PRESSURE',
          usedMB,
          threshold,
        });
      }
    }
  }, 30000); // Check every 30 seconds
}

function stopMemoryMonitoring() {
  if (memoryMonitor) {
    clearInterval(memoryMonitor);
    memoryMonitor = null;
  }
}

// Handle messages from main thread
self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  // Security Note: Origin verification for dedicated Web Workers
  // -------------------------------------------------------------
  // Unlike SharedWorker or BroadcastChannel, dedicated Web Workers (created via `new Worker()`)
  // can ONLY receive messages from the script that created them. The `event.origin` property
  // is not available in dedicated worker MessageEvents. This is a fundamental security property
  // of the Worker API specification.
  //
  // Instead of origin verification, we perform rigorous message structure validation to ensure
  // messages conform to our expected protocol and reject malformed or suspicious messages.
  // This is the recommended approach per OWASP guidelines for dedicated workers.

  // Step 1: Verify message structure for security
  if (!event.data || typeof event.data !== 'object') {
    logger.warn('Invalid message format received - rejecting');
    return;
  }

  const request = event.data;

  // Step 2: Validate required message fields to ensure it's from a trusted source
  if (!request.type || typeof request.type !== 'string') {
    logger.warn('Message missing required type field - rejecting');
    return;
  }

  // Step 3: Validate request ID if present
  if (
    request.id !== undefined &&
    typeof request.id !== 'string' &&
    typeof request.id !== 'number'
  ) {
    logger.warn('Invalid request ID format - rejecting');
    return;
  }

  // Step 4: Whitelist validation - only accept known command types
  const validTypes = [
    'INIT',
    'HEALTH_CHECK',
    'CREATE_LINE',
    'CREATE_CIRCLE',
    'CREATE_RECTANGLE',
    'MAKE_BOX',
    'MAKE_CYLINDER',
    'MAKE_SPHERE',
    'MAKE_EXTRUDE',
    'BOOLEAN_UNION',
    'BOOLEAN_SUBTRACT',
    'BOOLEAN_INTERSECT',
    'TESSELLATE',
    'DISPOSE',
    'CLEANUP',
    'SHUTDOWN',
  ];

  if (!validTypes.includes(request.type)) {
    logger.warn(`Unknown or invalid request type: ${request.type} - rejecting`);
    return;
  }

  // Step 5: Additional validation - ensure type matches expected patterns
  const validTypePattern = /^[A-Z_]+$/;
  if (!validTypePattern.test(request.type)) {
    logger.warn(`Invalid request type pattern: ${request.type} - rejecting`);
    return;
  }

  const startTime = performance.now();

  try {
    let result: unknown;

    switch (request.type) {
      case 'INIT':
        if (!isInitialized) {
          logger.info('Initializing OCCT worker...');

          try {
            occtModule = await loadOCCT();

            // Verify OCCT is real, not mock
            if (!occtModule.getOCCTVersion) {
              throw new WorkerError(
                'MOCK_GEOMETRY_IN_PRODUCTION',
                'Mock geometry detected in production mode',
                { hasVersion: false }
              );
            }

            const version = occtModule.getOCCTVersion();
            logger.info(`OCCT initialized: ${version}`);

            isInitialized = true;
            startMemoryMonitoring();

            result = {
              initialized: true,
              version,
              capabilities: {
                boolean: true,
                fillet: !!occtModule.makeFillet,
                chamfer: !!occtModule.makeChamfer,
                shell: !!occtModule.makeShell,
              },
            };
          } catch (error) {
            logger.error('OCCT initialization failed', error);
            throw new WorkerError(
              'OCCT_INIT_FAILED',
              'Failed to initialize OCCT geometry engine',
              error
            );
          }
        } else {
          result = { initialized: true };
        }
        break;

      case 'HEALTH_CHECK':
        result = {
          healthy: isInitialized,
          memoryUsage: OCCTMemoryManager.getShapeCount(),
          uptime: performance.now(),
        };
        break;

      case 'CREATE_LINE':
      case 'CREATE_CIRCLE':
      case 'CREATE_RECTANGLE':
        throw new WorkerError(
          'OPERATION_NOT_SUPPORTED',
          `2D operations not yet implemented: ${request.type}`,
          { operation: request.type }
        );

      case 'MAKE_BOX': {
        if (!isInitialized || !occtModule) {
          throw new WorkerError('NOT_INITIALIZED', 'OCCT not initialized');
        }

        const box = occtModule.makeBox(
          request.params.width,
          request.params.height,
          request.params.depth
        );

        if (validator.isEnabled()) {
          validator.validateShape(box, 'box');
        }

        result = transformShapeHandle(box);
        logger.debug(`Created box: ${box.id}`);
        break;
      }

      case 'MAKE_CYLINDER': {
        if (!isInitialized || !occtModule) {
          throw new WorkerError('NOT_INITIALIZED', 'OCCT not initialized');
        }

        const cylinder = occtModule.makeCylinder(request.params.radius, request.params.height);

        if (validator.isEnabled()) {
          validator.validateShape(cylinder, 'cylinder');
        }

        result = transformShapeHandle(cylinder);
        logger.debug(`Created cylinder: ${cylinder.id}`);
        break;
      }

      case 'MAKE_SPHERE': {
        if (!isInitialized || !occtModule) {
          throw new WorkerError('NOT_INITIALIZED', 'OCCT not initialized');
        }

        const sphere = occtModule.makeSphere(request.params.radius);

        if (validator.isEnabled()) {
          validator.validateShape(sphere, 'sphere');
        }

        result = transformShapeHandle(sphere);
        logger.debug(`Created sphere: ${sphere.id}`);
        break;
      }

      case 'BOOLEAN_UNION':
        if (!isInitialized || !occtModule) {
          throw new WorkerError('NOT_INITIALIZED', 'OCCT not initialized');
        }

        result = performBooleanUnion(request.params.shapes);
        break;

      case 'BOOLEAN_SUBTRACT':
        if (!isInitialized || !occtModule) {
          throw new WorkerError('NOT_INITIALIZED', 'OCCT not initialized');
        }

        result = performBooleanSubtract(request.params.base, request.params.tools);
        break;

      case 'BOOLEAN_INTERSECT':
        if (!isInitialized || !occtModule) {
          throw new WorkerError('NOT_INITIALIZED', 'OCCT not initialized');
        }

        result = performBooleanIntersect(request.params.shapes);
        break;

      case 'TESSELLATE': {
        if (!isInitialized || !occtModule) {
          throw new WorkerError('NOT_INITIALIZED', 'OCCT not initialized');
        }

        const mesh = occtModule.tessellate(
          request.params.shape.id,
          request.params.deflection || 0.1
        );

        if (validator.isEnabled()) {
          validator.validateMesh(mesh);
        }

        result = {
          mesh,
          bbox: request.params.shape.bbox,
        };
        break;
      }

      case 'DISPOSE':
        if (!isInitialized || !occtModule) {
          throw new WorkerError('NOT_INITIALIZED', 'OCCT not initialized');
        }

        occtModule.deleteShape(request.params.handle);
        OCCTMemoryManager.untrackShape(request.params.handle);
        result = { disposed: true };
        break;

      case 'CLEANUP':
        OCCTMemoryManager.cleanup();
        result = { cleaned: true };
        break;

      case 'SHUTDOWN':
        stopMemoryMonitoring();
        OCCTMemoryManager.cleanup();
        self.close();
        break;

      default:
        throw new WorkerError('UNKNOWN_OPERATION', `Unknown operation: ${request.type}`, {
          operation: request.type,
        });
    }

    // Log performance metrics
    const duration = performance.now() - startTime;
    if (duration > 100) {
      logger.warn(`Slow operation ${request.type}: ${duration.toFixed(2)}ms`);
    }

    // Send success response
    const response: WorkerResponse = {
      id: request.id,
      success: true,
      result,
    };
    self.postMessage(response);
  } catch (error) {
    logger.error(`Operation ${request.type} failed`, error);

    // Send error response
    const response: WorkerResponse = {
      id: request.id,
      success: false,
      error: {
        code: error instanceof WorkerError ? error.code : 'WORKER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof WorkerError ? error.details : error,
      },
    };
    self.postMessage(response);
  }
});

// Transform OCCT shape handle to our format
function transformShapeHandle(occtShape: unknown) {
  return {
    id: occtShape.id,
    type: occtShape.type,
    bbox: {
      min: {
        x: occtShape.bbox_min_x,
        y: occtShape.bbox_min_y,
        z: occtShape.bbox_min_z,
      },
      max: {
        x: occtShape.bbox_max_x,
        y: occtShape.bbox_max_y,
        z: occtShape.bbox_max_z,
      },
    },
    hash: occtShape.hash,
  };
}

// Boolean operations with validation
function performBooleanUnion(shapes: unknown[]): unknown {
  if (shapes.length < 2) {
    throw new WorkerError('INVALID_PARAMS', 'Boolean union requires at least 2 shapes', {
      count: shapes.length,
    });
  }

  let result = shapes[0];
  for (let i = 1; i < shapes.length; i++) {
    const occtShape = occtModule.booleanUnion(result.id, shapes[i].id);
    result = transformShapeHandle(occtShape);

    if (validator.isEnabled()) {
      validator.validateBooleanResult(result, 'union');
    }
  }

  logger.debug(`Boolean union completed: ${result.id}`);
  return result;
}

function performBooleanSubtract(base: unknown, tools: unknown[]): unknown {
  if (!base || tools.length === 0) {
    throw new WorkerError(
      'INVALID_PARAMS',
      'Boolean subtract requires base and at least one tool',
      { hasBase: !!base, toolCount: tools.length }
    );
  }

  let result = base;
  for (const tool of tools) {
    const occtShape = occtModule.booleanSubtract(result.id, tool.id);
    result = transformShapeHandle(occtShape);

    if (validator.isEnabled()) {
      validator.validateBooleanResult(result, 'subtract');
    }
  }

  logger.debug(`Boolean subtract completed: ${result.id}`);
  return result;
}

function performBooleanIntersect(shapes: unknown[]): unknown {
  if (shapes.length < 2) {
    throw new WorkerError('INVALID_PARAMS', 'Boolean intersect requires at least 2 shapes', {
      count: shapes.length,
    });
  }

  let result = shapes[0];
  for (let i = 1; i < shapes.length; i++) {
    const occtShape = occtModule.booleanIntersect(result.id, shapes[i].id);
    result = transformShapeHandle(occtShape);

    if (validator.isEnabled()) {
      validator.validateBooleanResult(result, 'intersect');
    }
  }

  logger.debug(`Boolean intersect completed: ${result.id}`);
  return result;
}

// Handle uncaught errors
self.addEventListener('error', (event) => {
  logger.error('Uncaught worker error', event.error);
  self.postMessage({
    type: 'WORKER_ERROR',
    error: {
      code: 'UNCAUGHT_ERROR',
      message: event.error?.message || 'Unknown error',
      stack: event.error?.stack,
    },
  });
});

self.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', event.reason);
  self.postMessage({
    type: 'WORKER_ERROR',
    error: {
      code: 'UNHANDLED_REJECTION',
      message: event.reason?.message || 'Unknown rejection',
      stack: event.reason?.stack,
    },
  });
});

// Export for TypeScript
export {};
