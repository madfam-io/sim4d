import { getLogger } from './production-logger';
const logger = getLogger('OCCT');
/**
 * OCCT Web Worker - Full implementation with real OCCT operations
 * NO MOCK FALLBACK - This is production ready
 */

import { RealOCCT } from './real-occt-bindings';
import type { WorkerRequest, WorkerResponse } from './worker-types';

// Initialize with real OCCT
let occt: RealOCCT | null = null;
let isInitialized = false;
let moduleInitialization: Promise<void> | null = null;

async function ensureOCCTModuleLoaded(): Promise<void> {
  if (typeof (globalThis as unknown).Module !== 'undefined' && (globalThis as unknown).Module?.ready) {
    await (globalThis as unknown).Module.ready;
    return;
  }

  if (moduleInitialization) {
    return moduleInitialization;
  }

  moduleInitialization = (async () => {
    const candidateResolvers: Array<() => string> = [
      () => new URL(/* @vite-ignore */ '../wasm/occt.js', import.meta.url).href,
      () => new URL(/* @vite-ignore */ '../wasm/occt-core.js', import.meta.url).href,
      () => '/wasm/occt.js',
      () => '/wasm/occt-core.js',
    ];

    let lastError: unknown = null;

    for (const resolveCandidate of candidateResolvers) {
      let specifier: string;
      try {
        specifier = resolveCandidate();
      } catch (resolutionError) {
        lastError = resolutionError;
        continue;
      }

      try {
        const moduleImport = await import(/* @vite-ignore */ specifier);
        const factory =
          moduleImport.default ||
          moduleImport.createOCCTCoreModule ||
          moduleImport.createOCCTModule;

        if (typeof factory !== 'function') {
          throw new Error(`OCCT factory missing in ${specifier}`);
        }

        const baseUrl = new URL('.', new URL(specifier, (self as unknown)?.location?.href ?? 'file://'))
          .href;

        const moduleInstance = await factory({
          locateFile: (filename: string) => new URL(filename, baseUrl).href,
          print: (text: string) => logger.info('[OCCT Worker WASM]', text),
          printErr: (text: string) => logger.error('[OCCT Worker WASM Error]', text),
        });

        (globalThis as unknown).Module = moduleInstance;

        if (moduleInstance?.ready && typeof moduleInstance.ready.then === 'function') {
          await moduleInstance.ready;
        }

        logger.info('[OCCTWorker] OCCT WASM module loaded from', specifier);
        return;
      } catch (importError) {
        lastError = importError;
        logger.warn(`[OCCTWorker] Failed to load ${specifier}:`, importError);
      }
    }

    throw new Error(`Unable to load OCCT WASM bundle in worker: ${lastError}`);
  })();

  await moduleInitialization;
}

// Handle worker messages
self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  // Verify message origin for security
  // In a Web Worker context, messages from the same origin are trusted
  // Additional validation is performed on the message structure
  if (!event.data || typeof event.data !== 'object') {
    logger.warn('Invalid message format received');
    return;
  }

  const request = event.data;

  try {
    let result: unknown;

    switch (request.type) {
      case 'INIT':
        if (!isInitialized) {
          logger.info('[OCCTWorker] Initializing real OCCT...');

          await ensureOCCTModuleLoaded();
          occt = new RealOCCT();
          await occt.init();

          isInitialized = true;
          logger.info('[OCCTWorker] Real OCCT initialized successfully');

          result = {
            initialized: true,
            version: 'OCCT 7.8.0',
          };
        } else {
          result = { initialized: true };
        }
        break;

      case 'HEALTH_CHECK':
        result = {
          healthy: isInitialized,
          uptime: performance.now(),
        };
        break;

      default:
        // All operations go through the real OCCT implementation
        if (!isInitialized || !occt) {
          throw new Error('OCCT not initialized');
        }

        result = await occt.invoke(request.type, request.params);
        break;
    }

    // Send success response
    const response: WorkerResponse = {
      id: request.id,
      success: true,
      result: result,
    };

    self.postMessage(response);
  } catch (error) {
    logger.error('[OCCTWorker] Operation failed:', error);

    // Send error response
    const response: WorkerResponse = {
      id: request.id,
      success: false,
      error: {
        code: 'OPERATION_FAILED',
        message: error instanceof Error ? error.message : String(error),
        details: error,
      },
    };

    self.postMessage(response);
  }
});

// Handle worker termination
self.addEventListener('unload', () => {
  logger.info('[OCCTWorker] Worker terminating');
  // OCCT cleanup handled by RealOCCT destructor
});

logger.info('[OCCTWorker] Worker ready for real OCCT operations');
