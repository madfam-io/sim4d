/**
 * Monitoring system exports
 */

// Core system
export { MonitoringSystem } from './monitoring-system';
export type { MonitoringSystemConfig } from './monitoring-system';

// Error handling
export { ErrorManager } from '../error-handling/error-manager';
export {
  ErrorBoundary,
  WASMErrorBoundary,
  GeometryErrorBoundary,
  withErrorBoundary,
  useAsyncError,
} from '../error-handling/error-boundary';
export type {
  Sim4DError,
  ErrorCode,
  ErrorSeverity,
  ErrorCategory,
  RecoveryAction,
} from '../error-handling/types';

// Metrics and monitoring
export { MetricsCollector } from './metrics-collector';
export type { PerformanceMetric, SystemHealth, UserEvent } from '../error-handling/types';

// Health monitoring
export { HealthMonitor } from './health-monitor';
export type { HealthAlert, HealthThresholds } from './health-monitor';

// Retry handling
export { RetryHandler } from './retry-handler';
export type { RetryResult, RetryContext } from './retry-handler';

// Logging
export { Logger } from '../logging/logger';
export type { LogEntry, LogLevel } from '../logging/logger';

// Configuration types
export type { MonitoringConfig, RetryConfig } from '../error-handling/types';

import type { MonitoringSystemConfig } from './monitoring-system';
import { MonitoringSystem } from './monitoring-system';

// Default configurations
export const DEFAULT_MONITORING_CONFIG: MonitoringSystemConfig = {
  monitoring: {
    errorReporting: {
      enabled: true,
      sampleRate: 1.0,
      includeStackTrace: true,
    },
    performance: {
      enabled: true,
      sampleRate: 1.0,
    },
    userAnalytics: {
      enabled: true,
      anonymize: true,
    },
    logging: {
      level: 'info',
      console: true,
      remote: false,
      structured: true,
    },
  },
  healthThresholds: {
    memory: {
      warning: 500, // MB
      critical: 1000, // MB
    },
    errorRate: {
      warning: 5, // %
      critical: 15, // %
    },
    responseTime: {
      warning: 1000, // ms
      critical: 5000, // ms
    },
    wasmMemory: {
      warning: 200, // MB
      critical: 500, // MB
    },
  },
  enabledFeatures: {
    errorReporting: true,
    performanceMonitoring: true,
    healthChecks: true,
    userAnalytics: true,
    retryHandling: true,
  },
};

export const DEVELOPMENT_MONITORING_CONFIG: MonitoringSystemConfig = {
  ...DEFAULT_MONITORING_CONFIG,
  monitoring: {
    ...DEFAULT_MONITORING_CONFIG.monitoring,
    logging: {
      level: 'debug',
      console: true,
      remote: false,
      structured: true,
    },
  },
  healthThresholds: {
    ...DEFAULT_MONITORING_CONFIG.healthThresholds,
    memory: {
      warning: 1000, // MB - More lenient in dev
      critical: 2000, // MB
    },
  },
};

export const PRODUCTION_MONITORING_CONFIG: MonitoringSystemConfig = {
  ...DEFAULT_MONITORING_CONFIG,
  monitoring: {
    ...DEFAULT_MONITORING_CONFIG.monitoring,
    errorReporting: {
      enabled: true,
      sampleRate: 0.1, // Sample 10% of errors in production
      includeStackTrace: true,
    },
    logging: {
      level: 'warn',
      console: false,
      remote: true,
      structured: true,
    },
  },
};

/**
 * Initialize monitoring system with environment-appropriate configuration
 */
export function initializeMonitoring(
  environment: 'development' | 'production' | 'test' = 'development',
  customConfig?: Partial<MonitoringSystemConfig>
): Promise<MonitoringSystem> {
  const baseConfig =
    environment === 'production' ? PRODUCTION_MONITORING_CONFIG : DEVELOPMENT_MONITORING_CONFIG;

  const finalConfig: MonitoringSystemConfig = {
    ...baseConfig,
    ...customConfig,
    monitoring: {
      ...baseConfig.monitoring,
      ...customConfig?.monitoring,
    },
    healthThresholds: {
      ...baseConfig.healthThresholds,
      ...customConfig?.healthThresholds,
    },
    enabledFeatures: {
      ...baseConfig.enabledFeatures,
      ...customConfig?.enabledFeatures,
    },
  };

  const monitoringSystem = MonitoringSystem.getInstance(finalConfig);
  return monitoringSystem.initialize().then(() => monitoringSystem);
}
