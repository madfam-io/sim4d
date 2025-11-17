/**
 * Production Geometry Service
 * Handles all geometry operations with real OCCT implementation
 */

import { IntegratedGeometryAPI, getGeometryAPI } from '@brepflow/engine-occt';
import { GeometryValidator } from '@brepflow/engine-occt';

export class ProductionGeometryService {
  private static instance: ProductionGeometryService;
  private api: IntegratedGeometryAPI | null = null;
  private logger: any = null;
  private validator = new GeometryValidator();
  private initializationPromise: Promise<void> | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  private getLogger() {
    if (!this.logger) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { ProductionLogger } = require('@brepflow/engine-occt');
      this.logger = new ProductionLogger('GeometryService');
    }
    return this.logger;
  }

  static getInstance(): ProductionGeometryService {
    if (!ProductionGeometryService.instance) {
      ProductionGeometryService.instance = new ProductionGeometryService();
    }
    return ProductionGeometryService.instance;
  }

  /**
   * Initialize the geometry service with production configuration
   */
  async initialize(): Promise<void> {
    if (this.api) {
      return; // Already initialized
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize();
    await this.initializationPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      this.getLogger().info('Initializing production geometry service');

      // Get production API - no mocks allowed
      this.api = getGeometryAPI({
        enableRealOCCT: true,
        enablePerformanceMonitoring: true,
        enableMemoryManagement: true,
        enableErrorRecovery: true,
        maxRetries: 3,
        operationTimeout: 30000,
      });

      // Initialize the API
      await this.api.init();

      // Start health monitoring
      this.startHealthMonitoring();

      this.getLogger().info('Production geometry service initialized successfully');
    } catch (error: unknown) {
      this.getLogger().error('Failed to initialize production geometry service', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Production geometry initialization failed: ${message}`);
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.checkHealth();
        if (!health.healthy) {
          this.getLogger().warn('Geometry service health check failed', health);
          // Attempt recovery
          await this.recover();
        }
      } catch (error: unknown) {
        this.getLogger().error('Health check error', error);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop health monitoring
   */
  private stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<{
    healthy: boolean;
    details: Record<string, any>;
  }> {
    if (!this.api) {
      return {
        healthy: false,
        details: { error: 'API not initialized' },
      };
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await this.api.invoke('HEALTH_CHECK', {});
      const memoryUsage = await this.api.invoke('GET_MEMORY_USAGE', {});

      return {
        healthy: true,
        details: {
          api: 'connected',
          memory: memoryUsage,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        healthy: false,
        details: { error: message },
      };
    }
  }

  /**
   * Attempt to recover from failures
   */
  private async recover(): Promise<void> {
    this.getLogger().warn('Attempting geometry service recovery');

    try {
      // Stop current monitoring
      this.stopHealthMonitoring();

      // Clear current API
      if (this.api) {
        try {
          await this.api.shutdown();
        } catch (e) {
          // Ignore shutdown errors
        }
        this.api = null;
      }

      // Reinitialize
      this.initializationPromise = null;
      await this.initialize();

      this.getLogger().info('Geometry service recovered successfully');
    } catch (error: unknown) {
      this.getLogger().error('Failed to recover geometry service', error);
      throw error;
    }
  }

  /**
   * Execute a geometry operation with validation
   */
  async execute<T = any>(
    operation: string,
    params: any,
    options: {
      validate?: boolean;
      timeout?: number;
    } = {}
  ): Promise<T> {
    if (!this.api) {
      throw new Error('Geometry service not initialized');
    }

    const { validate = true, timeout = 30000 } = options;

    try {
      // Set timeout for operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), timeout);
      });

      // Execute operation with timeout
      const result = (await Promise.race([
        this.api.invoke(operation, params),
        timeoutPromise,
      ])) as T;

      // Validate if required
      if (validate && this.shouldValidate(operation)) {
        const validationResult = await this.validator.validate(result);
        if (!validationResult.valid) {
          throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
        }
      }

      return result;
    } catch (error: unknown) {
      this.getLogger().error(`Geometry operation failed: ${operation}`, { params, error });
      throw error;
    }
  }

  /**
   * Determine if an operation result should be validated
   */
  private shouldValidate(operation: string): boolean {
    const validatedOperations = [
      'MAKE_BOX',
      'MAKE_SPHERE',
      'MAKE_CYLINDER',
      'MAKE_CONE',
      'MAKE_TORUS',
      'BOOLEAN_UNION',
      'BOOLEAN_INTERSECTION',
      'BOOLEAN_DIFFERENCE',
      'FILLET',
      'CHAMFER',
      'EXTRUDE',
      'REVOLVE',
      'EXPORT_STEP',
      'EXPORT_IGES',
      'EXPORT_STL',
    ];
    return validatedOperations.includes(operation);
  }

  /**
   * Export geometry with validation
   */
  async export(
    shape: any,
    format: 'STEP' | 'IGES' | 'STL' | 'OBJ',
    options: Record<string, any> = {}
  ): Promise<string | ArrayBuffer> {
    if (!this.api) {
      throw new Error('Geometry service not initialized');
    }

    // Always validate exports in production
    const exportOperation = `EXPORT_${format}`;
    const result = await this.execute(
      exportOperation,
      {
        shape,
        ...options,
      },
      {
        validate: true,
        timeout: 60000, // Longer timeout for exports
      }
    );

    // Additional export validation
    if (format === 'STEP' || format === 'IGES') {
      const exportValidation = await this.validator.validateExport(result as string, format);
      if (!exportValidation.valid) {
        throw new Error(`Export validation failed: ${exportValidation.message}`);
      }
    }

    return result;
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    this.stopHealthMonitoring();

    if (this.api) {
      try {
        await this.api.shutdown();
      } catch (error: unknown) {
        this.getLogger().error('Error during disposal', error);
      }
      this.api = null;
    }

    this.initializationPromise = null;
  }

  /**
   * Get service metrics
   */
  async getMetrics(): Promise<{
    operations: number;
    errors: number;
    averageExecutionTime: number;
    memoryUsage: any;
  }> {
    const health = await this.checkHealth();

    return {
      operations: 0, // Would be tracked in production
      errors: 0, // Would be tracked in production
      averageExecutionTime: 0, // Would be calculated
      memoryUsage: health.details.memory || {},
    };
  }
}
