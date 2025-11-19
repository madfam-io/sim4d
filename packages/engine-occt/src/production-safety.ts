/**
 * Production Safety Utilities
 * Critical: Ensures ONLY real OCCT geometry is used - NO MOCK GEOMETRY ALLOWED
 */

export interface EnvironmentConfig {
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  nodeEnv: string;
}

/**
 * Detect current environment
 */
export function detectEnvironment(): EnvironmentConfig {
  // Check Node.js environment
  const nodeEnv = (typeof process !== 'undefined' && process.env?.NODE_ENV) || 'development';

  // Check browser environment indicators
  const hostname = typeof window !== 'undefined' ? window.location?.hostname : '';
  const isLocalhost = Boolean(
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')
  );

  // Production detection logic
  const isProduction = Boolean(
    nodeEnv === 'production' ||
      (!isLocalhost && hostname && !hostname.includes('dev') && !hostname.includes('staging'))
  );

  const isDevelopment = Boolean(nodeEnv === 'development' || isLocalhost);

  // Enhanced test detection - check for test environment flags
  const isTest = Boolean(
    nodeEnv === 'test' ||
      (typeof global !== 'undefined' && (global as unknown).__vitest__) ||
      (typeof global !== 'undefined' && (global as unknown).__OCCT_TEST_MODE__) ||
      (typeof process !== 'undefined' && process.env?.ENABLE_REAL_OCCT_TESTING === 'true')
  );

  return {
    isProduction,
    isDevelopment,
    isTest,
    nodeEnv: nodeEnv as string,
  };
}

/**
 * Production Safety Error - thrown when real OCCT is not available
 */
export class ProductionSafetyError extends Error {
  constructor(
    message: string,
    public context?: any
  ) {
    super(`PRODUCTION SAFETY VIOLATION: ${message}`);
    this.name = 'ProductionSafetyError';
  }
}

/**
 * Validate that ONLY real OCCT geometry is being used
 * In test environment, validates that test-specific real OCCT module is present
 */
export function validateProductionSafety(
  usingRealOCCT: boolean,
  environment?: EnvironmentConfig
): void {
  // CRITICAL: ALWAYS re-detect environment to ensure we have latest flags
  // This prevents cached environment state from causing issues
  const env = detectEnvironment();

  logger.info('[ProductionSafety] Validation check:', {
    usingRealOCCT,
    isTest: env.isTest,
    nodeEnv: env.nodeEnv,
    hasTestModule: typeof global !== 'undefined' && (global as unknown).__OCCT_TEST_MODE__,
    passedEnv: environment,
  });

  // In test environment, check for test-specific real OCCT module
  if (env.isTest) {
    const hasTestOCCTModule =
      typeof global !== 'undefined' &&
      (global as unknown).__OCCT_TEST_MODE__ &&
      typeof (global as unknown).createOCCTCoreModule === 'function';

    if (!hasTestOCCTModule) {
      throw new ProductionSafetyError(
        'Test environment requires test-specific real OCCT module. Ensure test setup is properly configured.',
        {
          environment: env,
          timestamp: new Date().toISOString(),
          severity: 'CRITICAL',
          recommendation: 'Check that tests/setup/setup.ts is loading the test OCCT module',
        }
      );
    }

    logger.info('✅ [ProductionSafety] Test environment validated with real OCCT module');
    return;
  }

  // For non-test environments, enforce strict real OCCT requirement
  if (!usingRealOCCT) {
    throw new ProductionSafetyError(
      'ONLY real OCCT geometry is allowed. Mock geometry has been eliminated from this codebase.',
      {
        environment: env,
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
        recommendation: 'Ensure OCCT WASM is properly loaded and initialized',
      }
    );
  }
}

/**
 * Create production-safe configuration based on environment
 */
export function createProductionSafeConfig(overrides: any = {}): any {
  const env = detectEnvironment();

  // Real OCCT ONLY - no fallbacks
  const safeConfig = {
    enableRealOCCT: true, // ALWAYS true - no exceptions
    enablePerformanceMonitoring: true,
    enableMemoryManagement: true,
    enableErrorRecovery: true,
    maxRetries: env.isProduction ? 1 : 3,
    operationTimeout: env.isProduction ? 15000 : 30000,
    ...overrides,
  };

  // Enforce real OCCT requirement
  if (safeConfig.enableRealOCCT !== true) {
    throw new ProductionSafetyError(
      'Real OCCT cannot be disabled. Mock geometry is not supported.',
      {
        environment: env,
        config: safeConfig,
        severity: 'CRITICAL',
      }
    );
  }

  return safeConfig;
}

/**
 * Production-safe error boundaries
 */
export function createProductionErrorBoundary(operation: string, env?: EnvironmentConfig): Error {
  const environment = env || detectEnvironment();

  return new ProductionSafetyError(`Real OCCT geometry system failed. Operation: ${operation}`, {
    operation,
    environment,
    severity: 'CRITICAL',
    recommendation: 'Check WASM availability, browser compatibility, and OCCT module loading',
  });
}

/**
 * Log production safety status
 */
export function logProductionSafetyStatus(
  usingRealOCCT: boolean,
  environment?: EnvironmentConfig
): void {
  const env = environment || detectEnvironment();

  const status = {
    environment: env.nodeEnv,
    isProduction: env.isProduction,
    usingRealOCCT,
    timestamp: new Date().toISOString(),
  };

  if (usingRealOCCT) {
    logger.info('✅ PRODUCTION SAFE: Using real OCCT geometry operations', status);
  } else {
    logger.error('🚨 PRODUCTION SAFETY VIOLATION: Real OCCT geometry not available', status);
    throw new ProductionSafetyError(
      'Real OCCT geometry validation failed - mock geometry is not supported',
      status
    );
  }
}
