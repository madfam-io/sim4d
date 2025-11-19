/**
 * Geometry API Factory with Environment Awareness
 * Creates appropriate geometry provider based on environment and configuration
 */

import { getConfig } from './config/environment';
import { shouldUseRealWASM, getWASMConfig } from './config/wasm-config';
import type { WorkerAPI } from '@brepflow/types';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

interface LoggerLike {
  error(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  debug(message: string, data?: unknown): void;
}

const resolveEngineOCCTDistPath = () =>
  path.resolve(process.cwd(), 'packages/engine-occt/dist/index.js');

const requireEngineOCCTSafely = (): any | null => {
  try {
    return require('@brepflow/engine-occt');
  } catch (primaryError) {
    try {
      const distPath = resolveEngineOCCTDistPath();
      return require(distPath);
    } catch (fallbackError) {
      return null;
    }
  }
};

const importEngineOCCTSafely = async (): Promise<any> => {
  const requiredModule = requireEngineOCCTSafely();
  if (requiredModule) {
    return requiredModule;
  }

  try {
    return await import('@brepflow/engine-occt');
  } catch (primaryError) {
    const distPath = resolveEngineOCCTDistPath();
    try {
      return await import(pathToFileURL(distPath).href);
    } catch (fallbackError) {
      const error = new Error('Failed to load @brepflow/engine-occt module');
      (error as any).cause = primaryError;
      throw error;
    }
  }
};

let logger: LoggerLike | null = null;
const getLogger = (): LoggerLike => {
  if (logger) {
    return logger;
  }

  const engineOcctModule = requireEngineOCCTSafely();
  if (engineOcctModule?.ProductionLogger) {
    const occtLogger: LoggerLike = new engineOcctModule.ProductionLogger('GeometryAPIFactory');
    logger = occtLogger;
    return occtLogger;
  }

  // Fallback to console methods when OCCT logger is unavailable (tests or build failures)
  const consoleLogger: LoggerLike = {
    error: (message: string, data?: unknown) =>
      console.error(`[GeometryAPIFactory] ${message}`, data ?? ''),
    warn: (message: string, data?: unknown) =>
      console.warn(`[GeometryAPIFactory] ${message}`, data ?? ''),
    info: (message: string, data?: unknown) =>
      console.info(`[GeometryAPIFactory] ${message}`, data ?? ''),
    debug: (message: string, data?: unknown) =>
      console.debug(`[GeometryAPIFactory] ${message}`, data ?? ''),
  };

  logger = consoleLogger;
  return consoleLogger;
};

export interface GeometryAPIConfig {
  initTimeout?: number;
  validateOutput?: boolean;
  enableRetry?: boolean;
  retryAttempts?: number;
}

export class GeometryAPIFactory {
  private static realAPI: WorkerAPI | null = null;
  private static initializationPromise: Promise<WorkerAPI> | null = null;
  private static wasmAssetCheck: Promise<void> | null = null;
  private static wasmAssetsVerified = false;

  /**
   * Get geometry API based on environment configuration
   */
  static async getAPI(options: GeometryAPIConfig = {}): Promise<WorkerAPI> {
    const config = getConfig();
    const wasmConfig = getWASMConfig();

    getLogger().info('Creating geometry API', {
      environment: config.mode,
    });

    if (!wasmConfig.forceRealWASM && !shouldUseRealWASM()) {
      getLogger().warn(
        'WASM configuration does not force real OCCT - overriding to ensure real geometry usage'
      );
    }

    return this.getRealAPI(options);
  }

  /**
   * Get real OCCT-based geometry API
   */
  private static async getRealAPI(options: GeometryAPIConfig): Promise<WorkerAPI> {
    // Return cached instance if available
    if (this.realAPI) {
      getLogger().debug('Returning cached real geometry API');
      return this.realAPI;
    }

    // Return existing initialization promise if in progress
    if (this.initializationPromise) {
      getLogger().debug('Waiting for existing real API initialization');
      return this.initializationPromise;
    }

    // Start new initialization
    this.initializationPromise = this.initializeRealAPI(options);

    try {
      this.realAPI = await this.initializationPromise;
      return this.realAPI;
    } catch (error) {
      this.initializationPromise = null;
      throw error;
    }
  }

  /**
   * Initialize real OCCT API with proper error handling
   */
  private static async initializeRealAPI(options: GeometryAPIConfig): Promise<WorkerAPI> {
    const config = getConfig();

    getLogger().info('Initializing real OCCT geometry API');

    await this.ensureWasmAssets(config.occtWasmPath);

    try {
      // Dynamic import to avoid loading in environments where it's not available
      const { createGeometryAPI } = await importEngineOCCTSafely();

      const integratedAPI = createGeometryAPI({
        enableRealOCCT: true,
        enablePerformanceMonitoring: options.validateOutput ?? config.validateGeometryOutput,
        enableMemoryManagement: true,
        enableErrorRecovery: options.enableRetry ?? false,
        maxRetries: options.retryAttempts || 3,
        operationTimeout: options.initTimeout || config.occtInitTimeout,
      });

      // Initialize the API
      await integratedAPI.init();

      // Create adapter to match WorkerAPI interface
      // IntegratedGeometryAPI.invoke returns OperationResult<T>, but WorkerAPI expects T
      const api: WorkerAPI = {
        init: async () => {
          await integratedAPI.init();
        },
        invoke: async <T = any>(operation: string, params: unknown): Promise<T> => {
          const result = await integratedAPI.invoke(operation, params);
          if (!result.success) {
            throw new Error(result.error || `Operation ${operation} failed`);
          }
          return result.result as T;
        },
        tessellate: async (shapeId: string, deflection: number) => {
          const result = await integratedAPI.invoke('TESSELLATE', { shapeId, deflection });
          if (!result.success) {
            throw new Error(result.error || 'Tessellation failed');
          }
          return result.result;
        },
        dispose: async (handleId: string) => {
          const result = await integratedAPI.invoke('DISPOSE', { handleId });
          if (!result.success) {
            throw new Error(result.error || 'Dispose failed');
          }
        },
        terminate: async () => {
          await integratedAPI.shutdown();
        },
      };

      // Verify initialization
      const health = await api.invoke('HEALTH_CHECK', {});
      if (!(health as any)?.healthy) {
        throw new Error('Geometry API health check failed after initialization');
      }

      getLogger().info('Real OCCT geometry API initialized successfully');
      return api;
    } catch (error) {
      getLogger().error('Failed to initialize real OCCT geometry API', error);

      throw new Error(
        `Failed to initialize geometry API: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Initialize API with retry logic
   * @internal Reserved for future use
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async _initializeWithRetry(api: WorkerAPI, attempts: number): Promise<void> {
    for (let i = 0; i < attempts; i++) {
      try {
        await api.init?.();
        return;
      } catch (error) {
        getLogger().warn(`Geometry API initialization attempt ${i + 1} failed`, error);

        if (i === attempts - 1) {
          throw error;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  /**
   * Check if real API is available without initializing
   */
  static async isRealAPIAvailable(): Promise<boolean> {
    try {
      const config = getConfig();
      await this.ensureWasmAssets(config.occtWasmPath);
      return true;
    } catch (error) {
      getLogger().debug('Real API availability check failed', error);
      return false;
    }
  }

  private static async ensureWasmAssets(wasmPath: string): Promise<void> {
    if (this.wasmAssetsVerified) {
      return;
    }

    if (this.wasmAssetCheck) {
      return this.wasmAssetCheck;
    }

    this.wasmAssetCheck = this.verifyWasmAssets(wasmPath)
      .then(() => {
        this.wasmAssetsVerified = true;
      })
      .finally(() => {
        this.wasmAssetCheck = null;
      });

    return this.wasmAssetCheck;
  }

  private static async verifyWasmAssets(wasmPath: string): Promise<void> {
    const requiredArtifacts = ['occt-core.wasm', 'occt.js', 'occt-core.js'];
    const sanitizedBase = wasmPath.replace(/\/$/, '');

    try {
      const isBrowser = typeof window !== 'undefined';
      const isRemote = /^https?:\/\//i.test(sanitizedBase) || sanitizedBase.startsWith('//');
      const shouldUseFetch = isBrowser || isRemote;

      if (!shouldUseFetch && typeof process !== 'undefined') {
        const path = await import('node:path');
        const fs = await import('node:fs/promises');

        const basePath = path.isAbsolute(sanitizedBase)
          ? sanitizedBase
          : path.resolve(process.cwd(), sanitizedBase);

        const missing: string[] = [];

        for (const artifact of requiredArtifacts) {
          const candidate = path.join(basePath, artifact);
          try {
            await fs.access(candidate);
          } catch {
            missing.push(candidate);
          }
        }

        if (missing.length > 0) {
          throw new Error(`Missing OCCT artifacts: ${missing.join(', ')}`);
        }

        return;
      }

      if (typeof fetch !== 'function') {
        throw new Error('Global fetch API is not available to verify OCCT assets');
      }

      const fetchBase = sanitizedBase.startsWith('//')
        ? `${(globalThis as any)?.location?.protocol ?? 'https:'}${sanitizedBase}`
        : sanitizedBase;

      const missing: string[] = [];

      await Promise.all(
        requiredArtifacts.map(async (artifact) => {
          const url = `${fetchBase}/${artifact}`;
          try {
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) {
              missing.push(url);
            }
          } catch {
            missing.push(url);
          }
        })
      );

      if (missing.length > 0) {
        throw new Error(`Missing OCCT artifacts: ${missing.join(', ')}`);
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`OCCT asset verification failed (${wasmPath}): ${reason}`);
    }
  }

  /**
   * Reset factory state (useful for testing)
   */
  static reset(): void {
    this.realAPI = null;
    this.initializationPromise = null;
    getLogger().debug('Geometry API factory reset');
  }

  /**
   * Get current API status
   */
  static getStatus(): {
    hasRealAPI: boolean;
    isInitializing: boolean;
  } {
    return {
      hasRealAPI: !!this.realAPI,
      isInitializing: !!this.initializationPromise,
    };
  }

  /**
   * Get production API with strict configuration
   */
  static async getProductionAPI(config?: any): Promise<WorkerAPI> {
    return this.getAPI({
      validateOutput: true,
      enableRetry: false,
      ...config,
    });
  }

  /**
   * Create API for specific use case
   */
  static async createForUseCase(
    useCase: 'development' | 'testing' | 'production'
  ): Promise<WorkerAPI> {
    switch (useCase) {
      case 'development':
        return this.getAPI({
          enableRetry: true,
          retryAttempts: 2,
        });

      case 'testing':
        return this.getAPI({
          validateOutput: false,
          enableRetry: true,
          retryAttempts: 1,
        });

      case 'production':
        return this.getAPI({
          validateOutput: true,
          enableRetry: false,
        });

      default:
        throw new Error(`Unknown use case: ${useCase}`);
    }
  }
}

// Convenience exports
export const getGeometryAPI = () => GeometryAPIFactory.getAPI();

export const getRealGeometryAPI = () => GeometryAPIFactory.getAPI();

export const getProductionAPI = (config?: any) =>
  GeometryAPIFactory.getAPI({ ...config, validateOutput: true, enableRetry: false });

export const isRealGeometryAvailable = () => GeometryAPIFactory.isRealAPIAvailable();
