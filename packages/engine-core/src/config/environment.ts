/**
 * Environment configuration management
 * Provides type-safe access to environment variables with validation
 */

export interface EnvironmentConfig {
  // Application
  mode: 'production' | 'development' | 'test';
  isProduction: boolean;
  isDevelopment: boolean;

  // Geometry Engine
  requireRealOCCT: boolean;
  occtWasmPath: string;
  occtInitTimeout: number;
  validateGeometryOutput: boolean;

  // Performance
  maxWorkerMemoryMB: number;
  enableMemoryMonitoring: boolean;
  meshCacheSizeMB: number;
  workerRestartThresholdMB: number;

  // Security
  enableCSP: boolean;
  requireCorsValidation: boolean;
  allowedOrigins: string[];

  // Logging
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  enableErrorReporting: boolean;
  sentryDSN?: string;
  enablePerformanceMonitoring: boolean;

  // Features
  enableExportValidation: boolean;
  enableHealthChecks: boolean;
  enableAdminDashboard: boolean;

  // Export
  maxExportSizeMB: number;
  supportedFormats: string[];
  requireExportValidation: boolean;
}

class EnvironmentManager {
  private config: EnvironmentConfig | null = null;

  /**
   * Parse and validate environment configuration
   */
  private parseConfig(): EnvironmentConfig {
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined';
    const processEnv = isBrowser ? {} : typeof process !== 'undefined' ? process.env : {};

    const mode = (processEnv.SIM4D_MODE || processEnv.NODE_ENV || 'development') as
      | 'production'
      | 'development'
      | 'test';
    const isProduction = mode === 'production';
    const isDevelopment = mode === 'development';

    return {
      // Application
      mode,
      isProduction,
      isDevelopment,

      // Geometry Engine - ALWAYS USE REAL OCCT NOW
      requireRealOCCT: true, // Always require real OCCT
      occtWasmPath: processEnv.OCCT_WASM_PATH || '/assets/wasm',
      occtInitTimeout: this.parseNumber(processEnv.OCCT_INIT_TIMEOUT, 30000),
      validateGeometryOutput: this.parseBoolean(processEnv.VALIDATE_GEOMETRY_OUTPUT, isProduction),

      // Performance
      maxWorkerMemoryMB: this.parseNumber(processEnv.MAX_WORKER_MEMORY_MB, 2048),
      enableMemoryMonitoring: this.parseBoolean(processEnv.ENABLE_MEMORY_MONITORING, true),
      meshCacheSizeMB: this.parseNumber(processEnv.MESH_CACHE_SIZE_MB, 512),
      workerRestartThresholdMB: this.parseNumber(processEnv.WORKER_RESTART_THRESHOLD_MB, 1800),

      // Security
      enableCSP: this.parseBoolean(processEnv.ENABLE_CSP, isProduction),
      requireCorsValidation: this.parseBoolean(processEnv.REQUIRE_CORS_VALIDATION, isProduction),
      allowedOrigins: this.parseStringArray(processEnv.ALLOWED_ORIGINS, ['https://sim4d.com']),

      // Logging
      logLevel: (processEnv.LOG_LEVEL || (isDevelopment ? 'debug' : 'error')) as
        | 'error'
        | 'warn'
        | 'info'
        | 'debug',
      enableErrorReporting: this.parseBoolean(processEnv.ENABLE_ERROR_REPORTING, isProduction),
      sentryDSN: processEnv.SENTRY_DSN,
      enablePerformanceMonitoring: this.parseBoolean(
        processEnv.ENABLE_PERFORMANCE_MONITORING,
        isProduction
      ),

      // Features
      enableExportValidation: this.parseBoolean(processEnv.ENABLE_EXPORT_VALIDATION, isProduction),
      enableHealthChecks: this.parseBoolean(processEnv.ENABLE_HEALTH_CHECKS, true),
      enableAdminDashboard: this.parseBoolean(processEnv.ENABLE_ADMIN_DASHBOARD, isDevelopment),

      // Export
      maxExportSizeMB: this.parseNumber(processEnv.MAX_EXPORT_SIZE_MB, 100),
      supportedFormats: this.parseStringArray(processEnv.SUPPORTED_FORMATS, [
        'step',
        'iges',
        'stl',
        'obj',
      ]),
      requireExportValidation: this.parseBoolean(
        processEnv.REQUIRE_EXPORT_VALIDATION,
        isProduction
      ),
    };
  }

  /**
   * Parse boolean environment variable
   */
  private parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  /**
   * Parse number environment variable
   */
  private parseNumber(value: string | undefined, defaultValue: number): number {
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Parse comma-separated string array
   */
  private parseStringArray(value: string | undefined, defaultValue: string[]): string[] {
    if (!value) return defaultValue;
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /**
   * Get environment configuration
   */
  getConfig(): EnvironmentConfig {
    if (!this.config) {
      this.config = this.parseConfig();
      this.validateConfig(this.config);
    }
    return this.config;
  }

  /**
   * Validate configuration consistency
   */
  private validateConfig(config: EnvironmentConfig): void {
    // Production validations
    if (config.isProduction) {
      if (!config.requireRealOCCT) {
        throw new Error('Production mode must require real OCCT');
      }
      if (!config.validateGeometryOutput) {
        console.warn('⚠️ Production mode should validate geometry output');
      }
    }

    // Development validations
    // Memory validations
    if (config.workerRestartThresholdMB > config.maxWorkerMemoryMB) {
      throw new Error('Worker restart threshold cannot exceed max worker memory');
    }

    // Export validations
    if (config.requireExportValidation && !config.validateGeometryOutput) {
      throw new Error('Export validation requires geometry output validation');
    }
  }

  /**
   * Override configuration for testing
   */
  setTestConfig(overrides: Partial<EnvironmentConfig>): void {
    if (this.config?.mode !== 'test') {
      throw new Error('Can only override config in test mode');
    }
    this.config = { ...this.config!, ...overrides };
  }

  /**
   * Reset configuration (for testing)
   */
  reset(): void {
    this.config = null;
  }
}

// Singleton instance
export const Environment = new EnvironmentManager();

// Export convenience getters
export const getConfig = () => Environment.getConfig();
export const isProduction = () => Environment.getConfig().isProduction;
export const isDevelopment = () => Environment.getConfig().isDevelopment;
