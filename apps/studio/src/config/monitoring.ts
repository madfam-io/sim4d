/**
 * Monitoring system configuration for different environments
 */

import { MonitoringSystemConfig } from '../lib/monitoring/monitoring-system';

// Development environment configuration
export const DEVELOPMENT_CONFIG: MonitoringSystemConfig = {
  monitoring: {
    errorReporting: {
      enabled: true,
      sampleRate: 1.0, // Report all errors in development
      includeStackTrace: true,
      // endpoint: undefined, // No external service in development
      // apiKey: undefined
    },
    performance: {
      enabled: true,
      sampleRate: 1.0, // Collect all performance data
      // endpoint: undefined // No external service in development
    },
    userAnalytics: {
      enabled: true,
      // endpoint: undefined,
      anonymize: false, // Don't anonymize in development for better debugging
    },
    logging: {
      level: 'debug',
      console: true,
      remote: false,
      structured: true,
    },
  },
  healthThresholds: {
    memory: {
      warning: 1000, // MB - More lenient in development
      critical: 2000, // MB
    },
    errorRate: {
      warning: 10, // % - More lenient in development
      critical: 25, // %
    },
    responseTime: {
      warning: 2000, // ms - More lenient in development
      critical: 10000, // ms
    },
    wasmMemory: {
      warning: 500, // MB
      critical: 1000, // MB
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

// Production environment configuration
export const PRODUCTION_CONFIG: MonitoringSystemConfig = {
  monitoring: {
    errorReporting: {
      enabled: true,
      sampleRate: 0.1, // Only report 10% of errors to reduce noise
      includeStackTrace: true,
      endpoint: process.env.VITE_ERROR_REPORTING_ENDPOINT,
      apiKey: process.env.VITE_ERROR_REPORTING_API_KEY,
    },
    performance: {
      enabled: true,
      sampleRate: 0.05, // Collect 5% of performance data
      endpoint: process.env.VITE_PERFORMANCE_ENDPOINT,
    },
    userAnalytics: {
      enabled: true,
      endpoint: process.env.VITE_ANALYTICS_ENDPOINT,
      anonymize: true, // Always anonymize in production
    },
    logging: {
      level: 'warn',
      console: false, // Don't log to console in production
      remote: true,
      structured: true,
    },
  },
  healthThresholds: {
    memory: {
      warning: 500, // MB
      critical: 1000, // MB
    },
    errorRate: {
      warning: 3, // %
      critical: 10, // %
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

// Staging environment configuration
export const STAGING_CONFIG: MonitoringSystemConfig = {
  monitoring: {
    errorReporting: {
      enabled: true,
      sampleRate: 0.5, // Report 50% of errors in staging
      includeStackTrace: true,
      endpoint: process.env.VITE_ERROR_REPORTING_ENDPOINT,
      apiKey: process.env.VITE_ERROR_REPORTING_API_KEY,
    },
    performance: {
      enabled: true,
      sampleRate: 0.2, // Collect 20% of performance data
      endpoint: process.env.VITE_PERFORMANCE_ENDPOINT,
    },
    userAnalytics: {
      enabled: true,
      endpoint: process.env.VITE_ANALYTICS_ENDPOINT,
      anonymize: true,
    },
    logging: {
      level: 'info',
      console: true,
      remote: true,
      structured: true,
    },
  },
  healthThresholds: {
    memory: {
      warning: 750, // MB - Between dev and prod
      critical: 1500, // MB
    },
    errorRate: {
      warning: 5, // %
      critical: 15, // %
    },
    responseTime: {
      warning: 1500, // ms
      critical: 7500, // ms
    },
    wasmMemory: {
      warning: 300, // MB
      critical: 750, // MB
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

// Test environment configuration (minimal monitoring)
export const TEST_CONFIG: MonitoringSystemConfig = {
  monitoring: {
    errorReporting: {
      enabled: false, // Disable external reporting in tests
      sampleRate: 0,
      includeStackTrace: false,
    },
    performance: {
      enabled: false, // Disable performance monitoring in tests
      sampleRate: 0,
    },
    userAnalytics: {
      enabled: false, // Disable analytics in tests
      anonymize: true,
    },
    logging: {
      level: 'error', // Only log errors in tests
      console: false,
      remote: false,
      structured: false,
    },
  },
  healthThresholds: {
    memory: {
      warning: 2000, // MB - Very lenient in tests
      critical: 4000, // MB
    },
    errorRate: {
      warning: 50, // % - Very lenient in tests
      critical: 90, // %
    },
    responseTime: {
      warning: 10000, // ms - Very lenient in tests
      critical: 30000, // ms
    },
    wasmMemory: {
      warning: 1000, // MB
      critical: 2000, // MB
    },
  },
  enabledFeatures: {
    errorReporting: false,
    performanceMonitoring: false,
    healthChecks: false,
    userAnalytics: false,
    retryHandling: true, // Keep retry handling for test reliability
  },
};

/**
 * Get configuration based on environment
 */
export function getMonitoringConfig(
  environment: 'development' | 'production' | 'staging' | 'test' = 'development'
): MonitoringSystemConfig {
  switch (environment) {
    case 'production':
      return PRODUCTION_CONFIG;
    case 'staging':
      return STAGING_CONFIG;
    case 'test':
      return TEST_CONFIG;
    case 'development':
    default:
      return DEVELOPMENT_CONFIG;
  }
}

/**
 * Integration configurations for popular monitoring services
 */

// Sentry configuration
export function configureSentry(dsn: string): Partial<MonitoringSystemConfig> {
  return {
    monitoring: {
      errorReporting: {
        enabled: true,
        endpoint: 'https://sentry.io/api/hooks/error/',
        apiKey: dsn,
        sampleRate: 1.0,
        includeStackTrace: true,
      },
      performance: {
        enabled: false,
        sampleRate: 0,
      },
      userAnalytics: {
        enabled: false,
        anonymize: true,
      },
      logging: {
        level: 'error',
        console: true,
        remote: false,
        structured: true,
      },
    },
  };
}

// DataDog configuration
export function configureDataDog(
  apiKey: string,
  site: string = 'datadoghq.com'
): Partial<MonitoringSystemConfig> {
  return {
    monitoring: {
      errorReporting: {
        enabled: true,
        endpoint: `https://browser-http-intake.logs.${site}/v1/input/${apiKey}`,
        apiKey,
        sampleRate: 1.0,
        includeStackTrace: true,
      },
      performance: {
        enabled: true,
        endpoint: `https://browser-http-intake.logs.${site}/v1/input/${apiKey}`,
        sampleRate: 1.0,
      },
      userAnalytics: {
        enabled: false,
        anonymize: true,
      },
      logging: {
        level: 'info',
        console: true,
        remote: true,
        structured: true,
      },
    },
  };
}

// LogRocket configuration
export function configureLogRocket(appId: string): Partial<MonitoringSystemConfig> {
  return {
    monitoring: {
      errorReporting: {
        enabled: false,
        sampleRate: 0,
        includeStackTrace: false,
      },
      performance: {
        enabled: false,
        sampleRate: 0,
      },
      userAnalytics: {
        enabled: true,
        endpoint: `https://r.lr-ingest.io/${appId}/init`,
        anonymize: false, // LogRocket handles privacy
      },
      logging: {
        level: 'info',
        console: true,
        remote: true,
        structured: true,
      },
    },
  };
}

// Custom webhook configuration
export function configureCustomWebhook(
  errorEndpoint?: string,
  performanceEndpoint?: string,
  analyticsEndpoint?: string,
  apiKey?: string
): Partial<MonitoringSystemConfig> {
  return {
    monitoring: {
      errorReporting: {
        enabled: !!errorEndpoint,
        endpoint: errorEndpoint,
        apiKey,
        sampleRate: 1.0,
        includeStackTrace: true,
      },
      performance: {
        enabled: !!performanceEndpoint,
        endpoint: performanceEndpoint,
        sampleRate: 1.0,
      },
      userAnalytics: {
        enabled: !!analyticsEndpoint,
        endpoint: analyticsEndpoint,
        anonymize: true,
      },
      logging: {
        level: 'info',
        console: true,
        remote: !!errorEndpoint,
        structured: true,
      },
    },
  };
}
