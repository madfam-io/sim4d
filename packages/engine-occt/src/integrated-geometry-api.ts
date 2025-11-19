/**
 * Integrated Geometry API
 * Combines all enhanced systems: WASM loader, worker pool, memory management,
 * error recovery, and capability detection for production-ready OCCT operations
 */

import { loadOCCTModule, generateOCCTDiagnostics } from './occt-loader';
import { getWorkerPool, DEFAULT_POOL_CONFIG } from './worker-pool';
import { getMemoryManager, DEFAULT_CACHE_CONFIG } from './memory-manager';
import { getErrorRecoverySystem, ErrorSeverity, ErrorCategory, OCCTError } from './error-recovery';
import { WASMCapabilityDetector, WASMPerformanceMonitor } from './wasm-capability-detector';
import {
  detectEnvironment,
  validateProductionSafety,
  createProductionSafeConfig,
  createProductionErrorBoundary,
  logProductionSafetyStatus,
  ProductionSafetyError,
  type EnvironmentConfig,
} from './production-safety';
import type { ShapeHandle, MeshData } from '@brepflow/types';

export interface GeometryAPIConfig {
  enableRealOCCT: boolean;
  enablePerformanceMonitoring: boolean;
  enableMemoryManagement: boolean;
  enableErrorRecovery: boolean;
  workerPoolConfig?: unknown;
  memoryConfig?: unknown;
  maxRetries: number;
  operationTimeout: number;
  // Dependency injection for testing - allows tests to provide mock OCCT loader
  occtLoader?: (config?: unknown) => Promise<unknown>;
}

export interface OperationResult<T = any> {
  success: boolean;
  result?: T;
  error?: string;
  performance?: {
    duration: number;
    memoryUsed: number;
    cacheHit: boolean;
  };
  fallbackUsed?: boolean;
  retryCount?: number;
}

export class IntegratedGeometryAPI {
  private static instance: IntegratedGeometryAPI | null = null;
  private occtModule: any = null;
  protected initialized = false;
  private initializationPromise: Promise<void> | null = null;
  private workerPool: any = null;
  private memoryManager: any = null;
  private errorRecovery: any = null;
  private capabilities: any = null;
  private environment: EnvironmentConfig;
  private usingRealOCCT = false;
  private meshCache = new Map<string, MeshData>();

  /**
   * Get the singleton instance
   */
  static getInstance(): IntegratedGeometryAPI | null {
    return IntegratedGeometryAPI.instance;
  }

  constructor(private config: GeometryAPIConfig) {
    console.log('⭐⭐⭐ CONSTRUCTOR - CODE VERSION 2025-11-16 15:40 ⭐⭐⭐');
    console.log('[CONSTRUCTOR] config.enableRealOCCT:', config.enableRealOCCT);

    // Store as singleton if not already set
    if (!IntegratedGeometryAPI.instance) {
      IntegratedGeometryAPI.instance = this;
    }
    // CRITICAL: Detect environment and validate production safety
    this.environment = detectEnvironment();
    console.log('[CONSTRUCTOR] environment.isTest:', this.environment.isTest);

    // Initialize subsystems
    if (config.enableMemoryManagement) {
      this.memoryManager = getMemoryManager(config.memoryConfig);
    }

    if (config.enableErrorRecovery) {
      this.errorRecovery = getErrorRecoverySystem();
    }

    if (config.workerPoolConfig) {
      this.workerPool = getWorkerPool(config.workerPoolConfig);
    }

    console.log('[IntegratedGeometryAPI] Initialized with config:', config);
    console.log('[IntegratedGeometryAPI] Config has occtLoader:', !!config.occtLoader);
  }

  /**
   * Check if the API is initialized
   */
  get isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initialize the geometry API with capability detection
   */
  async init(): Promise<void> {
    console.log('🔥🔥🔥 INIT METHOD - NEW CODE 2025-11-16 15:35 🔥🔥🔥');
    console.log('[INIT] enableRealOCCT:', this.config.enableRealOCCT);
    console.log('[INIT] environment.isTest:', this.environment.isTest);

    if (this.initialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    console.log('🚨🚨🚨 NEW CODE VERSION 2025-11-16 15:30 🚨🚨🚨');
    console.log('[DEBUG] this.config.enableRealOCCT:', this.config.enableRealOCCT);
    console.log('[DEBUG] this.environment.isTest:', this.environment.isTest);

    const endMeasurement = WASMPerformanceMonitor?.startMeasurement('api-initialization');

    try {
      console.log('[IntegratedGeometryAPI] Starting initialization...');

      // Detect capabilities
      this.capabilities = await WASMCapabilityDetector.detectCapabilities();
      console.log('[IntegratedGeometryAPI] Capabilities detected:', this.capabilities);
      console.log('[IntegratedGeometryAPI] DEBUG Point A - after capability detection');

      console.log(
        '[IntegratedGeometryAPI] DEBUG Point B - checking enableRealOCCT:',
        this.config.enableRealOCCT
      );
      // In production, real OCCT is REQUIRED
      // In test environment, allow enableRealOCCT: false for unit tests with mock OCCT
      if (!this.config.enableRealOCCT && !this.environment.isTest) {
        throw new ProductionSafetyError(
          'Real OCCT is required but has been disabled via configuration',
          { config: this.config, environment: this.environment }
        );
      }

      // If enableRealOCCT is false in test environment, skip WASM checks and use mock
      if (!this.config.enableRealOCCT && this.environment.isTest) {
        console.log(
          '[IntegratedGeometryAPI] ⚠️  Test mode with enableRealOCCT: false - using mock OCCT'
        );

        // Use injected mock loader (required for this mode)
        if (!this.config.occtLoader) {
          throw new Error(
            'Test mode with enableRealOCCT: false requires occtLoader to be provided'
          );
        }

        this.occtModule = await this.config.occtLoader({
          enablePerformanceMonitoring: this.config.enablePerformanceMonitoring,
        });
        this.usingRealOCCT = false; // Explicitly mark as using mock
        this.initialized = true;
        console.log('[IntegratedGeometryAPI] Mock OCCT loaded successfully for unit tests');
        if (endMeasurement) endMeasurement();
        return; // Skip the rest of initialization (real OCCT loading)
      }

      console.log(
        '[IntegratedGeometryAPI] DEBUG Point C - checking hasWASM:',
        this.capabilities.hasWASM
      );
      if (!this.capabilities.hasWASM) {
        throw createProductionErrorBoundary('WASM_UNAVAILABLE', this.environment);
      }

      // DIAGNOSTIC: Check if injected loader exists
      if (this.config.occtLoader) {
        console.log('[IntegratedGeometryAPI] ✅ USING INJECTED LOADER!');
      } else {
        console.log('[IntegratedGeometryAPI] ❌ NO INJECTED LOADER - using real loadOCCTModule');
      }

      try {
        // Load real OCCT with enhanced loader (or use injected loader for testing)
        const loader = this.config.occtLoader || loadOCCTModule;
        console.log('[IntegratedGeometryAPI] Selected loader:', loader);
        console.log(
          '[IntegratedGeometryAPI] Using loader:',
          loader === loadOCCTModule ? 'REAL loadOCCTModule' : 'INJECTED test loader'
        );
        this.occtModule = await loader({
          enablePerformanceMonitoring: this.config.enablePerformanceMonitoring,
        });

        this.usingRealOCCT = true;
        console.log('[IntegratedGeometryAPI] Real OCCT module loaded successfully');
        console.log(
          '[IntegratedGeometryAPI] DEBUG: usingRealOCCT value:',
          this.usingRealOCCT,
          'type:',
          typeof this.usingRealOCCT
        );
      } catch (occtError) {
        console.error('[IntegratedGeometryAPI] Failed to load real OCCT:', occtError);
        const boundaryError = createProductionErrorBoundary(
          'OCCT_INITIALIZATION',
          this.environment
        );
        (boundaryError as unknown).cause = occtError;
        throw boundaryError;
      }

      // CRITICAL: Final production safety validation
      // Skip validation in test environment where test-specific real OCCT module is used
      if (!this.environment.isTest) {
        console.log(
          '[IntegratedGeometryAPI] Validating production safety with real OCCT:',
          this.usingRealOCCT
        );
        validateProductionSafety(this.usingRealOCCT, this.environment);
        logProductionSafetyStatus(this.usingRealOCCT, this.environment);
      } else {
        console.log(
          '✅ [IntegratedGeometryAPI] Test environment - using test-specific real OCCT module'
        );
      }

      this.initialized = true;
      console.log('[IntegratedGeometryAPI] Initialization complete');

      if (endMeasurement) endMeasurement();
    } catch (error) {
      if (endMeasurement) endMeasurement();
      console.error('[IntegratedGeometryAPI] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Enhanced invoke method with full integration
   */
  async invoke<T = any>(operation: string, params: unknown): Promise<OperationResult<T>> {
    const startTime = Date.now();
    let memoryBefore = 0;
    let cacheHit = false;
    let fallbackUsed = false;
    let retryCount = 0;

    await this.init();

    const endMeasurement = WASMPerformanceMonitor?.startMeasurement(
      `operation-${operation.toLowerCase()}`
    );

    try {
      if (this.memoryManager) {
        const stats = this.memoryManager.getStats();
        memoryBefore = stats.totalMemoryMB;
      }

      if (this.errorRecovery) {
        const validation = await this.errorRecovery.validateOperation(operation, params);
        if (!validation.valid) {
          if (validation.fixable && validation.suggestedFix) {
            console.log('[IntegratedGeometryAPI] Auto-fixing parameters');
            params = validation.suggestedFix();
          } else {
            throw new OCCTError(
              `Validation failed: ${validation.errors.join(', ')}`,
              ErrorCategory.VALIDATION_ERROR,
              ErrorSeverity.MEDIUM,
              {
                operation,
                params,
                timestamp: Date.now(),
                retryCount: 0,
              },
              false
            );
          }
        }
      }

      if (this.memoryManager) {
        const cacheKey = this.memoryManager.generateOperationKey(operation, params);
        const cachedResult = this.memoryManager.getResult(cacheKey);
        if (cachedResult) {
          cacheHit = true;
          console.log(`[IntegratedGeometryAPI] Cache hit for ${operation}`);

          const duration = Date.now() - startTime;
          if (endMeasurement) endMeasurement();

          return {
            success: true,
            result: cachedResult,
            performance: {
              duration,
              memoryUsed: 0,
              cacheHit: true,
            },
            fallbackUsed,
            retryCount,
          };
        }
      }

      let rawResult: unknown;
      try {
        if (this.workerPool) {
          const workerResult = await this.workerPool.execute(operation, params, {
            timeout: this.config.operationTimeout,
            priority: this.determinePriority(operation),
          });
          rawResult = workerResult.result ?? workerResult;
        } else {
          rawResult = await this.occtModule.invoke(operation, params);
        }
      } catch (executionError) {
        if (this.errorRecovery) {
          console.log(
            `[IntegratedGeometryAPI] Error occurred, attempting recovery for ${operation}`
          );

          const recoveryResult = await this.errorRecovery.handleError(
            executionError,
            operation,
            params,
            {
              timestamp: Date.now(),
              retryCount,
            }
          );

          if (recoveryResult.recovered) {
            rawResult = recoveryResult.result;
            retryCount = 1;
            fallbackUsed = true;
            console.log('[IntegratedGeometryAPI] Successfully recovered from error');
          } else {
            throw recoveryResult.finalError || executionError;
          }
        } else {
          throw executionError;
        }
      }

      const result = this.normalizeOperationResult<T>(operation, rawResult);

      if (this.memoryManager && result) {
        const cacheKey = this.memoryManager.generateOperationKey(operation, params);
        this.memoryManager.cacheResult(cacheKey, result, this.determinePriority(operation));
      }

      const duration = Date.now() - startTime;
      let memoryUsed = 0;

      if (this.memoryManager) {
        const statsAfter = this.memoryManager.getStats();
        memoryUsed = statsAfter.totalMemoryMB - memoryBefore;
      }

      if (endMeasurement) endMeasurement();

      return {
        success: true,
        result,
        performance: {
          duration,
          memoryUsed,
          cacheHit,
        },
        fallbackUsed,
        retryCount,
      };
    } catch (error) {
      if (endMeasurement) endMeasurement();

      const duration = Date.now() - startTime;
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `[IntegratedGeometryAPI] Operation ${operation} failed after ${duration}ms:`,
        normalizedError
      );

      return {
        success: false,
        error: normalizedError.message,
        performance: {
          duration,
          memoryUsed: 0,
          cacheHit,
        },
        fallbackUsed,
        retryCount,
      };
    }
  }

  /**
   * Enhanced tessellation with memory management and caching
   */
  async tessellate(
    shape: ShapeHandle,
    tolerance: number = 0.1
  ): Promise<OperationResult<MeshData>> {
    const startTime = Date.now();
    const cacheKey = `${shape.id}:${tolerance}`;

    try {
      // Check mesh cache first
      if (this.memoryManager) {
        const cachedMesh = this.memoryManager.getMesh(shape.id, tolerance);
        if (cachedMesh) {
          console.log(`[IntegratedGeometryAPI] Mesh cache hit for shape ${shape.id}`);
          return {
            success: true,
            result: cachedMesh,
            performance: {
              duration: Date.now() - startTime,
              memoryUsed: 0,
              cacheHit: true,
            },
          };
        }
      } else {
        const cachedMesh = this.meshCache.get(cacheKey);
        if (cachedMesh) {
          console.log(`[IntegratedGeometryAPI] Mesh cache hit for shape ${shape.id}`);
          return {
            success: true,
            result: cachedMesh,
            performance: {
              duration: Date.now() - startTime,
              memoryUsed: 0,
              cacheHit: true,
            },
          };
        }
      }

      // Execute tessellation
      const tessellationResult = await this.invoke<MeshData>('TESSELLATE', { shape, tolerance });

      // Cache mesh if successful
      if (tessellationResult.success && tessellationResult.result) {
        if (this.memoryManager) {
          await this.memoryManager.cacheMesh(
            `${shape.id}_${tolerance}`,
            tessellationResult.result,
            this.determinePriority('TESSELLATE')
          );
        } else {
          this.meshCache.set(cacheKey, tessellationResult.result);
        }
      }

      return tessellationResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        performance: {
          duration: Date.now() - startTime,
          memoryUsed: 0,
          cacheHit: false,
        },
      };
    }
  }

  /**
   * Determine operation priority for caching and worker pool
   */
  private determinePriority(operation: string): number {
    const highPriorityOps = [
      'TESSELLATE',
      'BOOLEAN_UNION',
      'BOOLEAN_SUBTRACT',
      'BOOLEAN_INTERSECT',
    ];
    const mediumPriorityOps = ['MAKE_FILLET', 'MAKE_CHAMFER', 'MAKE_EXTRUDE'];

    if (highPriorityOps.includes(operation)) return 3;
    if (mediumPriorityOps.includes(operation)) return 2;
    return 1;
  }

  private normalizeOperationResult<T>(operation: string, rawResult: unknown): T {
    if (operation === 'TESSELLATE') {
      const mesh = rawResult?.mesh ?? rawResult;
      if (!mesh) {
        throw new Error('TESSELLATE operation returned no mesh data');
      }

      if (mesh.positions && !('vertices' in mesh)) {
        (mesh as unknown).vertices = mesh.positions;
      }

      if (!mesh.normals) {
        (mesh as unknown).normals = new Float32Array();
      }

      if (!mesh.indices) {
        (mesh as unknown).indices = new Uint32Array();
      }

      return mesh as T;
    }

    if (rawResult === undefined || rawResult === null) {
      throw new Error(`Operation ${operation} returned no result`);
    }

    return rawResult as T;
  }

  /**
   * Get comprehensive system statistics
   */
  getStats() {
    const stats: Record<string, unknown> = {
      initialized: this.initialized,
      capabilities: this.capabilities,
      usingRealOCCT: this.usingRealOCCT,
      environment: this.environment,
      productionSafe: this.environment.isProduction ? this.usingRealOCCT : true,
      subsystems: {},
    };

    if (this.memoryManager) {
      stats.subsystems.memory = this.memoryManager.getStats();
    }

    if (this.workerPool) {
      stats.subsystems.workerPool = this.workerPool.getStats();
    }

    if (this.errorRecovery) {
      stats.subsystems.errorRecovery = this.errorRecovery.getErrorStats();
    }

    if (WASMPerformanceMonitor) {
      stats.subsystems.performance = WASMPerformanceMonitor.getPerformanceReport();
    }

    return stats;
  }

  /**
   * Convenience method alias for getStats()
   */
  getStatistics() {
    return this.getStats();
  }

  /**
   * Generate comprehensive diagnostic report
   */
  async generateDiagnosticReport(): Promise<string> {
    const stats = this.getStats();

    let report = `
=== Integrated Geometry API Diagnostic Report ===
Status: ${this.initialized ? 'Initialized' : 'Not Initialized'}
Real OCCT: ${stats.usingRealOCCT ? 'Enabled' : 'Disabled (using mock)'}
Capabilities: ${this.capabilities ? 'Detected' : 'Not Available'}

`;

    // Add subsystem reports
    if (this.memoryManager) {
      report += '\n' + this.memoryManager.generateMemoryReport() + '\n';
    }

    if (this.errorRecovery) {
      report += '\n' + this.errorRecovery.generateErrorReport() + '\n';
    }

    // Add OCCT diagnostics if available
    try {
      const occtDiagnostics = await generateOCCTDiagnostics();
      report += '\n' + occtDiagnostics + '\n';
    } catch (error) {
      report += '\nOCCT Diagnostics: Not Available\n';
    }

    // Add performance metrics
    if (WASMPerformanceMonitor) {
      report += '\n' + WASMPerformanceMonitor.getPerformanceReport() + '\n';
    }

    return report.trim();
  }

  /**
   * Shutdown the API and all subsystems
   */
  async shutdown(): Promise<void> {
    console.log('[IntegratedGeometryAPI] Shutting down...');

    if (this.workerPool) {
      await this.workerPool.shutdown();
    }

    if (this.memoryManager) {
      this.memoryManager.shutdown();
    }

    if (this.errorRecovery) {
      this.errorRecovery.reset();
    }

    if (this.occtModule && typeof this.occtModule.terminate === 'function') {
      await this.occtModule.terminate();
    }

    this.initialized = false;
    this.initializationPromise = null;
    this.meshCache.clear();

    console.log('[IntegratedGeometryAPI] Shutdown complete');
  }

  /**
   * Force cleanup and optimization
   */
  async optimize(): Promise<void> {
    console.log('[IntegratedGeometryAPI] Running optimization...');

    if (this.memoryManager) {
      this.memoryManager.forceCleanup();
    }

    if (this.workerPool) {
      // Worker pool optimization could be added here
    }

    // Clear performance measurements
    if (WASMPerformanceMonitor) {
      WASMPerformanceMonitor.clearMeasurements();
    }

    console.log('[IntegratedGeometryAPI] Optimization complete');
  }

  /**
   * Convenience method alias for optimize()
   */
  async runOptimization(): Promise<void> {
    return this.optimize();
  }

  /**
   * Test the API with a simple operation
   */
  async test(): Promise<{ success: boolean; report: string }> {
    console.log('[IntegratedGeometryAPI] Running API test...');

    try {
      await this.init();

      // Test basic box creation
      const boxResult = await this.invoke('MAKE_BOX', {
        center: { x: 0, y: 0, z: 0 },
        width: 10,
        height: 10,
        depth: 10,
      });

      if (!boxResult.success) {
        return {
          success: false,
          report: `Box creation failed: ${boxResult.error}`,
        };
      }

      // Test tessellation if box was successful
      if (boxResult.result && boxResult.result.id) {
        const meshResult = await this.tessellate(boxResult.result, 0.1);

        if (!meshResult.success) {
          return {
            success: false,
            report: `Tessellation failed: ${meshResult.error}`,
          };
        }
      }

      const diagnostics = await this.generateDiagnosticReport();

      return {
        success: true,
        report: `API test successful!\n\n${diagnostics}`,
      };
    } catch (error) {
      return {
        success: false,
        report: `API test failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Convenience method alias for test()
   */
  async runAPITest(): Promise<{ success: boolean; report: string }> {
    return this.test();
  }

  /**
   * Execute multiple operations in batch
   */
  async batchExecute(
    operations: Array<{ operation: string; params: unknown }>
  ): Promise<OperationResult[]> {
    const results: OperationResult[] = [];

    for (const { operation, params } of operations) {
      try {
        const result = await this.invoke(operation, params);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : String(error),
          performance: {
            duration: 0,
            memoryUsed: 0,
            cacheHit: false,
          },
        });
      }
    }

    return results;
  }
}

// PRODUCTION-SAFE default configuration
// CRITICAL: Uses createProductionSafeConfig to ensure production safety
// CRITICAL: In test environments, disable real OCCT to avoid WASM loading failures
const runtimeEnvironment = detectEnvironment();
export const DEFAULT_API_CONFIG: GeometryAPIConfig = createProductionSafeConfig({
  enableRealOCCT: true,
  workerPoolConfig: runtimeEnvironment.isTest ? undefined : DEFAULT_POOL_CONFIG, // No worker pool in vitest to keep tests stable
  memoryConfig: DEFAULT_CACHE_CONFIG,
});

// Global API instance
let globalGeometryAPI: IntegratedGeometryAPI | null = null;

/**
 * Get or create the global integrated geometry API
 */
export function getGeometryAPI(config: Partial<GeometryAPIConfig> = {}): IntegratedGeometryAPI {
  if (!globalGeometryAPI) {
    globalGeometryAPI = new IntegratedGeometryAPI({ ...DEFAULT_API_CONFIG, ...config });
  }
  return globalGeometryAPI;
}

/**
 * Create a new integrated geometry API instance
 */
export function createGeometryAPI(config: Partial<GeometryAPIConfig> = {}): IntegratedGeometryAPI {
  return new IntegratedGeometryAPI({ ...DEFAULT_API_CONFIG, ...config });
}

/**
 * Shutdown the global geometry API
 */
export async function shutdownGlobalGeometryAPI(): Promise<void> {
  if (globalGeometryAPI) {
    await globalGeometryAPI.shutdown();
    globalGeometryAPI = null;
  }
}
