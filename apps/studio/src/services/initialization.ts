/**
 * Application Initialization Service
 * Handles startup sequence, validation, and health checks
 */

import { getGeometryAPI } from '@brepflow/engine-occt';
import { getConfig } from '@brepflow/engine-core';
import { healthCheckService } from '../api/health';
import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'initialization' });

export interface InitializationResult {
  success: boolean;
  geometryAPI: 'real' | 'none';
  warnings: string[];
  errors: string[];
  capabilities: {
    webassembly: boolean;
    sharedArrayBuffer: boolean;
    workers: boolean;
    realGeometry: boolean;
  };
}

export interface InitializationOptions {
  skipGeometryInit?: boolean;
  timeoutMs?: number;
}

export class InitializationService {
  private static instance: InitializationService | null = null;
  private initResult: InitializationResult | null = null;

  static getInstance(): InitializationService {
    if (!this.instance) {
      this.instance = new InitializationService();
    }
    return this.instance;
  }

  async initialize(options: InitializationOptions = {}): Promise<InitializationResult> {
    if (this.initResult) {
      logger.debug('Returning cached initialization result');
      return this.initResult;
    }

    logger.info('Starting application initialization');
    const startTime = performance.now();

    const result: InitializationResult = {
      success: false,
      geometryAPI: 'none',
      warnings: [],
      errors: [],
      capabilities: {
        webassembly: false,
        sharedArrayBuffer: false,
        workers: false,
        realGeometry: false,
      },
    };

    try {
      // 1. Check environment and configuration
      await this.validateEnvironment(result);

      // 2. Check browser capabilities
      this.checkBrowserCapabilities(result);

      // 3. Initialize geometry API if requested
      if (!options.skipGeometryInit) {
        await this.initializeGeometryAPI(result, options);
      }

      // 4. Run health checks
      await this.runHealthChecks(result);

      // 5. Final validation
      this.validateInitialization(result);

      const duration = performance.now() - startTime;
      logger.info(`Initialization completed in ${duration.toFixed(2)}ms`, {
        success: result.success,
        geometryAPI: result.geometryAPI,
        warnings: result.warnings.length,
        errors: result.errors.length,
      });

      this.initResult = result;
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      logger.error('Initialization failed', error);

      this.initResult = result;
      return result;
    }
  }

  private async validateEnvironment(result: InitializationResult): Promise<void> {
    const config = getConfig();

    logger.debug('Validating environment configuration');

    // Check for production configuration issues
    if (config.isProduction && !config.requireRealOCCT) {
      result.errors.push('Real OCCT must be required in production');
    }

    // Validate memory settings
    if (config.workerRestartThresholdMB > config.maxWorkerMemoryMB) {
      result.errors.push('Worker restart threshold exceeds maximum worker memory');
    }
  }

  private checkBrowserCapabilities(result: InitializationResult): void {
    logger.debug('Checking browser capabilities');

    // WebAssembly support
    result.capabilities.webassembly = typeof WebAssembly !== 'undefined';
    if (!result.capabilities.webassembly) {
      result.errors.push('WebAssembly is not supported in this browser');
    }

    // SharedArrayBuffer support (for WASM threads)
    result.capabilities.sharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    if (!result.capabilities.sharedArrayBuffer) {
      result.warnings.push('SharedArrayBuffer not available - WASM threading disabled');
    }

    // Web Workers support
    result.capabilities.workers = typeof Worker !== 'undefined';
    if (!result.capabilities.workers) {
      result.errors.push('Web Workers are not supported in this browser');
    }

    // Check for cross-origin isolation (required for SharedArrayBuffer)
    if (result.capabilities.sharedArrayBuffer && !crossOriginIsolated) {
      result.warnings.push('Cross-origin isolation not enabled - some features may be limited');
    }
  }

  private async initializeGeometryAPI(
    result: InitializationResult,
    options: InitializationOptions
  ): Promise<void> {
    logger.debug('Initializing geometry API');

    try {
      // IntegratedGeometryAPI always aims for real geometry
      result.capabilities.realGeometry = true;

      if (!result.capabilities.realGeometry) {
        const message = 'Real geometry API is required but not available';
        result.errors.push(message);
        logger.error(message);
        return;
      }

      // Use getGeometryAPI from engine-occt
      const api = getGeometryAPI({
        enableRealOCCT: true,
        maxRetries: 2,
        operationTimeout: options.timeoutMs || 30000,
      });

      // Initialize the API
      await api.init();

      result.geometryAPI = 'real';
      logger.info('Initialized with real geometry API');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Geometry API initialization failed';
      result.errors.push(errorMessage);
      logger.error('Geometry API initialization failed', error);
    }
  }

  private async runHealthChecks(result: InitializationResult): Promise<void> {
    logger.debug('Running health checks');

    try {
      const healthStatus = await healthCheckService.checkHealth();

      if (healthStatus.status === 'unhealthy') {
        result.errors.push('Application health check failed');
      } else if (healthStatus.status === 'degraded') {
        result.warnings.push('Application health check shows degraded status');
      }

      // Add specific check results to warnings/errors
      for (const check of healthStatus.checks) {
        if (check.status === 'fail') {
          result.errors.push(`Health check failed: ${check.name} - ${check.message}`);
        } else if (check.status === 'warn') {
          result.warnings.push(`Health check warning: ${check.name} - ${check.message}`);
        }
      }
    } catch (error) {
      result.warnings.push('Health checks could not be completed');
      logger.warn('Health checks failed', error);
    }
  }

  private validateInitialization(result: InitializationResult): void {
    // Determine overall success
    result.success = result.errors.length === 0 && result.geometryAPI !== 'none';

    // Log final status
    if (result.success) {
      logger.info('Initialization successful', {
        geometryAPI: result.geometryAPI,
        warnings: result.warnings.length,
      });
    } else {
      logger.error('Initialization failed', {
        errors: result.errors,
        warnings: result.warnings,
      });
    }
  }

  // Get cached initialization result
  getInitializationResult(): InitializationResult | null {
    return this.initResult;
  }

  // Reset initialization state (for testing)
  reset(): void {
    this.initResult = null;
    // IntegratedGeometryAPI doesn't have static reset
  }

  // Check if application is ready
  isReady(): boolean {
    return this.initResult?.success ?? false;
  }

  // Get initialization warnings
  getWarnings(): string[] {
    return this.initResult?.warnings ?? [];
  }

  // Get initialization errors
  getErrors(): string[] {
    return this.initResult?.errors ?? [];
  }
}

// Convenience functions
export const initializeApp = (options?: InitializationOptions) =>
  InitializationService.getInstance().initialize(options);

export const getInitializationStatus = () =>
  InitializationService.getInstance().getInitializationResult();

export const isAppReady = () => InitializationService.getInstance().isReady();
