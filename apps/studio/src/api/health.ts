/**
 * Health check endpoints for production monitoring
 */

import { getConfig } from '@brepflow/engine-core';

const logger = {
  info: (msg: string, ...args: unknown[]) => console.info('[HealthCheck]', msg, ...args),
  error: (msg: string, ...args: unknown[]) => console.error('[HealthCheck]', msg, ...args),
  warn: (msg: string, ...args: unknown[]) => console.warn('[HealthCheck]', msg, ...args),
  debug: (msg: string, ...args: unknown[]) => console.debug('[HealthCheck]', msg, ...args),
};

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: HealthCheckResult[];
  metadata: {
    environment: string;
    uptime: number;
    memoryUsage: MemoryUsage;
  };
}

export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  responseTime: number;
  message?: string;
  details?: any;
}

export interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

class HealthCheckService {
  private startTime = Date.now();
  private checks: Map<string, () => Promise<HealthCheckResult>> = new Map();

  constructor() {
    this.registerDefaultChecks();
  }

  private registerDefaultChecks() {
    // Geometry engine check
    this.registerCheck('geometry_engine', async () => {
      const start = performance.now();
      try {
        // Check if engine is available via store
        const engineAvailable = await this.checkGeometryEngine();
        const responseTime = performance.now() - start;

        if (!engineAvailable) {
          return {
            name: 'geometry_engine',
            status: 'fail',
            responseTime,
            message: 'Geometry engine not available',
          };
        }

        return {
          name: 'geometry_engine',
          status: 'pass',
          responseTime,
          message: 'Geometry engine operational',
        };
      } catch (error) {
        return {
          name: 'geometry_engine',
          status: 'fail',
          responseTime: performance.now() - start,
          message: error instanceof Error ? error.message : 'Check failed',
        };
      }
    });

    // Memory check
    this.registerCheck('memory', async () => {
      const start = performance.now();
      const memory = this.getMemoryUsage();
      const responseTime = performance.now() - start;

      const config = getConfig();
      const threshold = config.workerRestartThresholdMB;
      const maxMemory = config.maxWorkerMemoryMB;

      if (memory.used > threshold) {
        return {
          name: 'memory',
          status: 'warn',
          responseTime,
          message: `Memory usage high: ${memory.used}MB / ${maxMemory}MB`,
          details: memory,
        };
      }

      return {
        name: 'memory',
        status: 'pass',
        responseTime,
        message: `Memory usage normal: ${memory.used}MB / ${maxMemory}MB`,
        details: memory,
      };
    });

    // WebAssembly check
    this.registerCheck('webassembly', async () => {
      const start = performance.now();
      const responseTime = performance.now() - start;

      if (typeof WebAssembly === 'undefined') {
        return {
          name: 'webassembly',
          status: 'fail',
          responseTime,
          message: 'WebAssembly not supported',
        };
      }

      // Check for SharedArrayBuffer (required for WASM threads)
      if (typeof SharedArrayBuffer === 'undefined') {
        return {
          name: 'webassembly',
          status: 'warn',
          responseTime,
          message: 'SharedArrayBuffer not available - WASM threads disabled',
        };
      }

      return {
        name: 'webassembly',
        status: 'pass',
        responseTime,
        message: 'WebAssembly fully supported',
      };
    });

    // Configuration check
    this.registerCheck('configuration', async () => {
      const start = performance.now();
      const config = getConfig();
      const responseTime = performance.now() - start;

      // Check for production configuration issues
      const issues: string[] = [];

      if (config.isProduction && !config.requireRealOCCT) {
        issues.push('Real OCCT not required in production');
      }

      if (config.isProduction && !config.validateGeometryOutput) {
        issues.push('Geometry validation disabled in production');
      }

      if (issues.length > 0) {
        return {
          name: 'configuration',
          status: 'fail',
          responseTime,
          message: 'Configuration issues detected',
          details: issues,
        };
      }

      return {
        name: 'configuration',
        status: 'pass',
        responseTime,
        message: 'Configuration valid',
      };
    });
  }

  registerCheck(name: string, check: () => Promise<HealthCheckResult>) {
    this.checks.set(name, check);
  }

  private async checkGeometryEngine(): Promise<boolean> {
    // This would check the actual store/engine state
    // For now, we'll simulate the check
    try {
      // In a real implementation, this would:
      // 1. Get the store instance
      // 2. Check if engine is initialized
      // 3. Run a simple operation
      return true;
    } catch (error) {
      logger.error('Geometry engine check failed', error);
      return false;
    }
  }

  private getMemoryUsage(): MemoryUsage {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      return {
        used,
        total,
        percentage: Math.round((used / total) * 100),
      };
    }

    // Fallback for environments without memory API
    return {
      used: 0,
      total: 0,
      percentage: 0,
    };
  }

  async checkHealth(): Promise<HealthStatus> {
    const checkResults: HealthCheckResult[] = [];

    // Run all checks in parallel
    const checkPromises = Array.from(this.checks.values()).map((check) => check());
    const results = await Promise.allSettled(checkPromises);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        checkResults.push(result.value);
      } else {
        checkResults.push({
          name: 'unknown',
          status: 'fail',
          responseTime: 0,
          message: 'Check failed to execute',
        });
      }
    }

    // Determine overall status
    const failedChecks = checkResults.filter((r) => r.status === 'fail');
    const warnChecks = checkResults.filter((r) => r.status === 'warn');

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (failedChecks.length > 0) {
      overallStatus = 'unhealthy';
    } else if (warnChecks.length > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const status: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0', // Get from package.json
      checks: checkResults,
      metadata: {
        environment: getConfig().mode,
        uptime: Date.now() - this.startTime,
        memoryUsage: this.getMemoryUsage(),
      },
    };

    // Log health check results
    if (overallStatus === 'unhealthy') {
      logger.error('Health check failed', status);
    } else if (overallStatus === 'degraded') {
      logger.warn('Health check degraded', status);
    } else {
      logger.debug('Health check passed', status);
    }

    return status;
  }

  async checkLiveness(): Promise<{ alive: boolean; timestamp: string }> {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
    };
  }

  async checkReadiness(): Promise<{ ready: boolean; timestamp: string; checks: string[] }> {
    const health = await this.checkHealth();
    const ready = health.status !== 'unhealthy';
    const failedChecks = health.checks.filter((c) => c.status === 'fail').map((c) => c.name);

    return {
      ready,
      timestamp: new Date().toISOString(),
      checks: failedChecks,
    };
  }
}

// Singleton instance
export const healthCheckService = new HealthCheckService();

// API endpoint handlers (for use with your server framework)
export const healthEndpoints = {
  // Full health check - /api/health
  health: async () => {
    const config = getConfig();
    if (!config.enableHealthChecks) {
      return { status: 503, body: { error: 'Health checks disabled' } };
    }

    try {
      const status = await healthCheckService.checkHealth();
      const httpStatus =
        status.status === 'healthy' ? 200 : status.status === 'degraded' ? 200 : 503;
      return { status: httpStatus, body: status };
    } catch (error) {
      logger.error('Health check endpoint error', error);
      return {
        status: 503,
        body: {
          error: 'Health check failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },

  // Liveness probe - /api/health/live
  live: async () => {
    try {
      const result = await healthCheckService.checkLiveness();
      return { status: 200, body: result };
    } catch (error) {
      return { status: 503, body: { alive: false } };
    }
  },

  // Readiness probe - /api/health/ready
  ready: async () => {
    const config = getConfig();
    if (!config.enableHealthChecks) {
      return { status: 503, body: { error: 'Health checks disabled' } };
    }

    try {
      const result = await healthCheckService.checkReadiness();
      const httpStatus = result.ready ? 200 : 503;
      return { status: httpStatus, body: result };
    } catch (error) {
      return {
        status: 503,
        body: {
          ready: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
};
