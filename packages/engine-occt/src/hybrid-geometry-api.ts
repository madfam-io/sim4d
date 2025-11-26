/**
 * Hybrid Geometry API
 *
 * Provides a unified API that can route operations to either:
 * - The existing IntegratedGeometryAPI (sim4d's current implementation)
 * - The new GeomCoreAdapter (migration to @madfam/geom-core)
 *
 * This enables gradual migration by allowing per-operation routing decisions
 * and A/B testing of the two implementations.
 *
 * @module engine-occt/hybrid-geometry-api
 */

import {
  IntegratedGeometryAPI,
  type GeometryAPIConfig,
  type OperationResult,
  DEFAULT_API_CONFIG,
} from './integrated-geometry-api';
import {
  GeomCoreAdapter,
  type GeomCoreAdapterConfig,
  type Sim4dOperationResult,
  OPERATION_MAP,
  DEFAULT_ADAPTER_CONFIG,
} from './geom-core-adapter';
import type { ShapeHandle, MeshData } from '@brepflow/types';
import { getLogger } from './production-logger';

const logger = getLogger('HybridGeometryAPI');

// =============================================================================
// Configuration
// =============================================================================

export type BackendPreference = 'legacy' | 'geom-core' | 'auto';

export interface HybridAPIConfig {
  /** Default backend for operations (default: 'auto') */
  defaultBackend?: BackendPreference;

  /** Enable geom-core backend (default: true) */
  enableGeomCore?: boolean;

  /** Enable legacy backend (default: true) */
  enableLegacy?: boolean;

  /** Operations to always route to geom-core */
  geomCoreOperations?: string[];

  /** Operations to always route to legacy */
  legacyOperations?: string[];

  /** Configuration for legacy API */
  legacyConfig?: Partial<GeometryAPIConfig>;

  /** Configuration for geom-core adapter */
  geomCoreConfig?: GeomCoreAdapterConfig;

  /** Enable performance comparison logging */
  enableComparison?: boolean;

  /** Comparison sample rate (0-1, default: 0.1 = 10%) */
  comparisonSampleRate?: number;
}

export const DEFAULT_HYBRID_CONFIG: Required<HybridAPIConfig> = {
  defaultBackend: 'auto',
  enableGeomCore: true,
  enableLegacy: true,
  geomCoreOperations: [],
  legacyOperations: [],
  legacyConfig: DEFAULT_API_CONFIG,
  geomCoreConfig: DEFAULT_ADAPTER_CONFIG,
  enableComparison: false,
  comparisonSampleRate: 0.1,
};

// Operations known to be stable in geom-core
const GEOM_CORE_STABLE_OPS = [
  'MAKE_BOX',
  'MAKE_SPHERE',
  'MAKE_CYLINDER',
  'MAKE_CONE',
  'MAKE_TORUS',
  'CREATE_LINE',
  'CREATE_CIRCLE',
  'CREATE_RECTANGLE',
  'BOOLEAN_UNION',
  'BOOLEAN_SUBTRACT',
  'BOOLEAN_INTERSECT',
  'MAKE_EXTRUDE',
  'MAKE_REVOLVE',
  'MAKE_FILLET',
  'MAKE_CHAMFER',
  'TRANSFORM_MOVE',
  'TRANSFORM_ROTATE',
  'TRANSFORM_SCALE',
  'TESSELLATE',
];

// =============================================================================
// Hybrid Geometry API
// =============================================================================

/**
 * Hybrid API that can route to either legacy or geom-core backend.
 * Enables gradual migration and A/B testing.
 */
export class HybridGeometryAPI {
  private legacyAPI: IntegratedGeometryAPI | null = null;
  private geomCoreAdapter: GeomCoreAdapter | null = null;
  private config: Required<HybridAPIConfig>;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private comparisonStats: Map<
    string,
    {
      legacyAvg: number;
      geomCoreAvg: number;
      samples: number;
    }
  > = new Map();

  constructor(config: HybridAPIConfig = {}) {
    this.config = { ...DEFAULT_HYBRID_CONFIG, ...config };
    logger.info('[HybridGeometryAPI] Created with config:', this.config);
  }

  /**
   * Initialize both backends
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.performInit();
    return this.initPromise;
  }

  private async performInit(): Promise<void> {
    const initPromises: Promise<void>[] = [];

    // Initialize legacy API
    if (this.config.enableLegacy) {
      this.legacyAPI = new IntegratedGeometryAPI({
        ...DEFAULT_API_CONFIG,
        ...this.config.legacyConfig,
      });
      initPromises.push(this.legacyAPI.init());
    }

    // Initialize geom-core adapter
    if (this.config.enableGeomCore) {
      this.geomCoreAdapter = new GeomCoreAdapter(this.config.geomCoreConfig);
      initPromises.push(this.geomCoreAdapter.init());
    }

    await Promise.all(initPromises);
    this.initialized = true;
    logger.info('[HybridGeometryAPI] Initialized');
  }

  /**
   * Check if initialized
   */
  get isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Determine which backend to use for an operation
   */
  private selectBackend(operation: string): 'legacy' | 'geom-core' {
    // Check explicit routing rules first
    if (this.config.geomCoreOperations.includes(operation)) {
      if (this.geomCoreAdapter) return 'geom-core';
    }

    if (this.config.legacyOperations.includes(operation)) {
      if (this.legacyAPI) return 'legacy';
    }

    // Handle default backend preference
    switch (this.config.defaultBackend) {
      case 'geom-core':
        if (this.geomCoreAdapter) return 'geom-core';
        if (this.legacyAPI) return 'legacy';
        break;

      case 'legacy':
        if (this.legacyAPI) return 'legacy';
        if (this.geomCoreAdapter) return 'geom-core';
        break;

      case 'auto':
      default:
        // Auto: Use geom-core for stable operations, legacy for others
        if (GEOM_CORE_STABLE_OPS.includes(operation) && this.geomCoreAdapter) {
          return 'geom-core';
        }
        if (this.legacyAPI) return 'legacy';
        if (this.geomCoreAdapter) return 'geom-core';
        break;
    }

    throw new Error('No backend available');
  }

  /**
   * Invoke a geometry operation with automatic backend selection
   */
  async invoke<T = unknown>(operation: string, params: unknown): Promise<OperationResult<T>> {
    await this.init();

    const backend = this.selectBackend(operation);
    const startTime = performance.now();

    try {
      let result: OperationResult<T>;

      if (backend === 'geom-core' && this.geomCoreAdapter) {
        const adapterResult = await this.geomCoreAdapter.invoke<T>(
          operation,
          params as Record<string, unknown>
        );
        result = this.convertToOperationResult(adapterResult);
      } else if (this.legacyAPI) {
        result = await this.legacyAPI.invoke<T>(operation, params);
      } else {
        throw new Error('No backend available');
      }

      const duration = performance.now() - startTime;
      this.recordTiming(operation, backend, duration);

      // Optionally run comparison
      if (this.config.enableComparison && Math.random() < this.config.comparisonSampleRate) {
        this.runComparison(operation, params, backend, result);
      }

      return result;
    } catch (error) {
      // Try fallback backend
      const fallbackBackend = backend === 'geom-core' ? 'legacy' : 'geom-core';
      logger.warn(`[HybridGeometryAPI] ${backend} failed, trying ${fallbackBackend}:`, error);

      if (fallbackBackend === 'legacy' && this.legacyAPI) {
        return this.legacyAPI.invoke<T>(operation, params);
      } else if (fallbackBackend === 'geom-core' && this.geomCoreAdapter) {
        const adapterResult = await this.geomCoreAdapter.invoke<T>(
          operation,
          params as Record<string, unknown>
        );
        return this.convertToOperationResult(adapterResult);
      }

      throw error;
    }
  }

  /**
   * Force invoke on specific backend
   */
  async invokeOn<T = unknown>(
    backend: 'legacy' | 'geom-core',
    operation: string,
    params: unknown
  ): Promise<OperationResult<T>> {
    await this.init();

    if (backend === 'geom-core' && this.geomCoreAdapter) {
      const result = await this.geomCoreAdapter.invoke<T>(
        operation,
        params as Record<string, unknown>
      );
      return this.convertToOperationResult(result);
    } else if (backend === 'legacy' && this.legacyAPI) {
      return this.legacyAPI.invoke<T>(operation, params);
    }

    throw new Error(`Backend '${backend}' not available`);
  }

  /**
   * Tessellate using selected backend
   */
  async tessellate(
    shape: ShapeHandle,
    tolerance: number = 0.1
  ): Promise<OperationResult<MeshData>> {
    await this.init();

    const backend = this.selectBackend('TESSELLATE');

    if (backend === 'geom-core' && this.geomCoreAdapter) {
      const result = await this.geomCoreAdapter.tessellate(shape, tolerance);
      return this.convertToOperationResult(result);
    } else if (this.legacyAPI) {
      return this.legacyAPI.tessellate(shape, tolerance);
    }

    throw new Error('No backend available for tessellation');
  }

  /**
   * Convert adapter result to OperationResult format
   */
  private convertToOperationResult<T>(adapterResult: Sim4dOperationResult<T>): OperationResult<T> {
    return {
      success: adapterResult.success,
      result: adapterResult.result,
      error: adapterResult.error,
      performance: adapterResult.performance,
      fallbackUsed: adapterResult.fallbackUsed,
      retryCount: adapterResult.retryCount,
    };
  }

  /**
   * Record timing for comparison
   */
  private recordTiming(operation: string, backend: 'legacy' | 'geom-core', duration: number): void {
    if (!this.config.enableComparison) return;

    let stats = this.comparisonStats.get(operation);
    if (!stats) {
      stats = { legacyAvg: 0, geomCoreAvg: 0, samples: 0 };
      this.comparisonStats.set(operation, stats);
    }

    stats.samples++;

    // Running average
    if (backend === 'legacy') {
      stats.legacyAvg = stats.legacyAvg + (duration - stats.legacyAvg) / stats.samples;
    } else {
      stats.geomCoreAvg = stats.geomCoreAvg + (duration - stats.geomCoreAvg) / stats.samples;
    }
  }

  /**
   * Run comparison between backends (for A/B testing)
   */
  private async runComparison<T>(
    operation: string,
    params: unknown,
    primaryBackend: 'legacy' | 'geom-core',
    primaryResult: OperationResult<T>
  ): Promise<void> {
    const secondaryBackend = primaryBackend === 'legacy' ? 'geom-core' : 'legacy';

    try {
      const startTime = performance.now();
      let secondaryResult: OperationResult<T>;

      if (secondaryBackend === 'geom-core' && this.geomCoreAdapter) {
        const adapterResult = await this.geomCoreAdapter.invoke<T>(
          operation,
          params as Record<string, unknown>
        );
        secondaryResult = this.convertToOperationResult(adapterResult);
      } else if (secondaryBackend === 'legacy' && this.legacyAPI) {
        secondaryResult = await this.legacyAPI.invoke<T>(operation, params);
      } else {
        return;
      }

      const duration = performance.now() - startTime;
      this.recordTiming(operation, secondaryBackend, duration);

      // Log comparison results
      if (primaryResult.success !== secondaryResult.success) {
        logger.warn(`[HybridGeometryAPI] Comparison mismatch for ${operation}:`, {
          primary: { backend: primaryBackend, success: primaryResult.success },
          secondary: { backend: secondaryBackend, success: secondaryResult.success },
        });
      }
    } catch (error) {
      logger.debug(`[HybridGeometryAPI] Comparison failed for ${operation}:`, error);
    }
  }

  /**
   * Get comparison statistics
   */
  getComparisonStats(): Map<
    string,
    {
      legacyAvg: number;
      geomCoreAvg: number;
      samples: number;
      speedup: number;
    }
  > {
    const result = new Map<
      string,
      {
        legacyAvg: number;
        geomCoreAvg: number;
        samples: number;
        speedup: number;
      }
    >();
    for (const [op, stats] of Array.from(this.comparisonStats.entries())) {
      result.set(op, {
        ...stats,
        speedup: stats.legacyAvg > 0 ? stats.legacyAvg / stats.geomCoreAvg : 1,
      });
    }
    return result;
  }

  /**
   * Get combined statistics from both backends
   */
  getStats(): {
    initialized: boolean;
    legacy: ReturnType<IntegratedGeometryAPI['getStats']> | null;
    geomCore: ReturnType<GeomCoreAdapter['getStats']> | null;
    comparison: ReturnType<HybridGeometryAPI['getComparisonStats']>;
  } {
    return {
      initialized: this.initialized,
      legacy: this.legacyAPI?.getStats() ?? null,
      geomCore: this.geomCoreAdapter?.getStats() ?? null,
      comparison: this.getComparisonStats(),
    };
  }

  /**
   * Generate diagnostic report
   */
  async generateDiagnosticReport(): Promise<string> {
    let report = '=== Hybrid Geometry API Diagnostic Report ===\n\n';

    report += `Initialized: ${this.initialized}\n`;
    report += `Default Backend: ${this.config.defaultBackend}\n`;
    report += `Legacy Enabled: ${this.config.enableLegacy}\n`;
    report += `GeomCore Enabled: ${this.config.enableGeomCore}\n\n`;

    if (this.legacyAPI) {
      report += await this.legacyAPI.generateDiagnosticReport();
      report += '\n\n';
    }

    if (this.geomCoreAdapter) {
      const stats = this.geomCoreAdapter.getStats();
      report += `GeomCore Adapter Stats: ${JSON.stringify(stats, null, 2)}\n\n`;
    }

    if (this.config.enableComparison) {
      report += '=== Comparison Statistics ===\n';
      for (const [op, stats] of Array.from(this.getComparisonStats().entries())) {
        report += `${op}: Legacy ${stats.legacyAvg.toFixed(2)}ms, GeomCore ${stats.geomCoreAvg.toFixed(2)}ms, Speedup ${stats.speedup.toFixed(2)}x (${stats.samples} samples)\n`;
      }
    }

    return report;
  }

  /**
   * Shutdown both backends
   */
  async shutdown(): Promise<void> {
    if (this.legacyAPI) {
      await this.legacyAPI.shutdown();
      this.legacyAPI = null;
    }

    if (this.geomCoreAdapter) {
      this.geomCoreAdapter.dispose();
      this.geomCoreAdapter = null;
    }

    this.initialized = false;
    this.initPromise = null;
    this.comparisonStats.clear();

    logger.info('[HybridGeometryAPI] Shutdown complete');
  }
}

// =============================================================================
// Factory Functions
// =============================================================================

let globalHybridAPI: HybridGeometryAPI | null = null;

/**
 * Get or create the global hybrid geometry API
 */
export function getHybridGeometryAPI(config?: HybridAPIConfig): HybridGeometryAPI {
  if (!globalHybridAPI) {
    globalHybridAPI = new HybridGeometryAPI(config);
  }
  return globalHybridAPI;
}

/**
 * Create a new hybrid geometry API instance
 */
export function createHybridGeometryAPI(config?: HybridAPIConfig): HybridGeometryAPI {
  return new HybridGeometryAPI(config);
}

/**
 * Shutdown the global hybrid API
 */
export async function shutdownGlobalHybridAPI(): Promise<void> {
  if (globalHybridAPI) {
    await globalHybridAPI.shutdown();
    globalHybridAPI = null;
  }
}
