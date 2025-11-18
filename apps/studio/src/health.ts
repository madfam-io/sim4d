/**
 * Health Check Endpoint for Studio
 * Provides comprehensive system health monitoring
 */

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    wasm: HealthCheckResult;
    viewport: HealthCheckResult;
    memory: HealthCheckResult;
    collaboration: HealthCheckResult;
  };
}

export interface HealthCheckResult {
  healthy: boolean;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(): Promise<HealthCheck> {
  const checks = {
    wasm: await checkWasmWorker(),
    viewport: checkViewportRenderer(),
    memory: checkMemoryUsage(),
    collaboration: checkCollaborationConnection(),
  };

  // Overall status based on individual checks
  const allHealthy = Object.values(checks).every((c) => c.healthy);
  const anyUnhealthy = Object.values(checks).some((c) => !c.healthy);

  const status = allHealthy ? 'healthy' : anyUnhealthy ? 'degraded' : 'unhealthy';

  return {
    status,
    timestamp: new Date().toISOString(),
    checks,
  };
}

/**
 * Check WASM worker status
 */
async function checkWasmWorker(): Promise<HealthCheckResult> {
  try {
    // Check if WASM is available and initialized
    const wasmAvailable = typeof WebAssembly !== 'undefined';

    if (!wasmAvailable) {
      return {
        healthy: false,
        message: 'WebAssembly not available in this environment',
      };
    }

    // Try to access global window object for WASM status
    if (typeof window !== 'undefined' && (window as any).occtStatus) {
      const occtStatus = (window as any).occtStatus;
      return {
        healthy: occtStatus.initialized === true,
        message: occtStatus.initialized ? 'OCCT WASM initialized' : 'OCCT WASM not initialized',
        details: {
          initialized: occtStatus.initialized,
          wasmSize: '9.3MB',
        },
      };
    }

    // Fallback: WASM available but status unknown
    return {
      healthy: true,
      message: 'WebAssembly available',
      details: {
        wasmAvailable,
      },
    };
  } catch (error) {
    return {
      healthy: false,
      message: `WASM health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check viewport renderer status
 */
function checkViewportRenderer(): HealthCheckResult {
  try {
    // Check if Three.js and WebGL are available
    if (typeof window === 'undefined') {
      return {
        healthy: true,
        message: 'Server-side rendering (no viewport)',
      };
    }

    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    if (!gl) {
      return {
        healthy: false,
        message: 'WebGL not available',
      };
    }

    return {
      healthy: true,
      message: 'Viewport renderer operational',
      details: {
        webgl2: !!canvas.getContext('webgl2'),
      },
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Viewport health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check memory usage
 */
function checkMemoryUsage(): HealthCheckResult {
  try {
    if (typeof window === 'undefined' || !(performance as any).memory) {
      return {
        healthy: true,
        message: 'Memory monitoring not available',
      };
    }

    const memory = (performance as any).memory;
    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
    const usagePercent = (usedMB / limitMB) * 100;

    // Warning threshold: 80%, Critical: 90%
    const healthy = usagePercent < 80;
    const message =
      usagePercent < 80
        ? 'Memory usage normal'
        : usagePercent < 90
          ? 'Memory usage high'
          : 'Memory usage critical';

    return {
      healthy,
      message,
      details: {
        usedMB: Math.round(usedMB),
        limitMB: Math.round(limitMB),
        usagePercent: Math.round(usagePercent),
      },
    };
  } catch (error) {
    return {
      healthy: true,
      message: 'Memory monitoring not supported',
    };
  }
}

/**
 * Check collaboration connection status
 */
function checkCollaborationConnection(): HealthCheckResult {
  try {
    if (typeof window === 'undefined') {
      return {
        healthy: true,
        message: 'Server-side rendering (no collaboration)',
      };
    }

    // Check if collaboration is enabled via environment
    const collabEnabled =
      import.meta.env['VITE_COLLABORATION_WS_URL'] && import.meta.env['VITE_COLLABORATION_API_URL'];

    if (!collabEnabled) {
      return {
        healthy: true,
        message: 'Collaboration not configured (optional feature)',
      };
    }

    // Check global collaboration state
    if ((window as any).collaborationState) {
      const state = (window as any).collaborationState;
      return {
        healthy: state.connected === true,
        message: state.connected ? 'Collaboration connected' : 'Collaboration disconnected',
        details: {
          connected: state.connected,
          sessionId: state.sessionId,
        },
      };
    }

    return {
      healthy: true,
      message: 'Collaboration configured but not active',
    };
  } catch (error) {
    return {
      healthy: true,
      message: 'Collaboration check failed (non-critical)',
    };
  }
}

/**
 * Express-style health endpoint handler
 */
export function handleHealthRequest(): Promise<Response> {
  // Note: This is for Vite dev server middleware
  // In production, would use Express res object
  return performHealthCheck().then((health) => {
    const status = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    return new Response(JSON.stringify(health, null, 2), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });
}
