/**
 * Health Check for Collaboration Server
 * Provides comprehensive health monitoring for WebSocket server
 */

import type { Server as SocketIOServer } from 'socket.io';
import http from 'http';

export interface CollaborationHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    server: HealthCheckResult;
    redis: HealthCheckResult;
    postgres: HealthCheckResult;
    websocket: HealthCheckResult;
  };
  metrics: {
    activeSessions: number;
    activeConnections: number;
    uptime: number;
  };
}

export interface HealthCheckResult {
  healthy: boolean;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Perform comprehensive health check for collaboration server
 */
export async function performCollaborationHealthCheck(
  io: SocketIOServer,
  redisClient?: any,
  pgPool?: any
): Promise<CollaborationHealthCheck> {
  const checks = {
    server: checkServerStatus(),
    redis: await checkRedisConnection(redisClient),
    postgres: await checkPostgresConnection(pgPool),
    websocket: checkWebSocketStatus(io),
  };

  // Overall status
  const allHealthy = Object.values(checks).every((c) => c.healthy);
  const anyUnhealthy = Object.values(checks).some((c) => !c.healthy);

  const status = allHealthy ? 'healthy' : anyUnhealthy ? 'degraded' : 'unhealthy';

  // Metrics
  const sockets = await io.fetchSockets();
  const metrics = {
    activeSessions: io.sockets.adapter.rooms.size,
    activeConnections: sockets.length,
    uptime: process.uptime(),
  };

  return {
    status,
    timestamp: new Date().toISOString(),
    checks,
    metrics,
  };
}

/**
 * Check server process status
 */
function checkServerStatus(): HealthCheckResult {
  try {
    const memoryUsage = process.memoryUsage();
    const memoryMB = memoryUsage.heapUsed / 1024 / 1024;

    // Warning threshold: 256MB, Critical: 384MB
    const healthy = memoryMB < 256;
    const message =
      memoryMB < 256 ? 'Server healthy' : memoryMB < 384 ? 'Memory high' : 'Memory critical';

    return {
      healthy,
      message,
      details: {
        memoryMB: Math.round(memoryMB),
        uptime: Math.round(process.uptime()),
        pid: process.pid,
      },
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Server health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check Redis connection
 */
async function checkRedisConnection(redisClient?: any): Promise<HealthCheckResult> {
  if (!redisClient) {
    return {
      healthy: true,
      message: 'Redis not configured (optional)',
    };
  }

  try {
    await redisClient.ping();
    return {
      healthy: true,
      message: 'Redis connected',
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check PostgreSQL connection
 */
async function checkPostgresConnection(pgPool?: any): Promise<HealthCheckResult> {
  if (!pgPool) {
    return {
      healthy: true,
      message: 'PostgreSQL not configured (optional)',
    };
  }

  try {
    const client = await pgPool.connect();
    await client.query('SELECT 1');
    client.release();

    return {
      healthy: true,
      message: 'PostgreSQL connected',
    };
  } catch (error) {
    return {
      healthy: false,
      message: `PostgreSQL connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check WebSocket server status
 */
function checkWebSocketStatus(io: SocketIOServer): HealthCheckResult {
  try {
    const engine = io.engine as unknown;
    const clientsCount = engine?.clientsCount ?? 0;

    return {
      healthy: true,
      message: `WebSocket server operational`,
      details: {
        clients: clientsCount,
        namespaces: io._nsps.size,
      },
    };
  } catch (error) {
    return {
      healthy: false,
      message: `WebSocket health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Create a standalone health check script for Docker
 * Usage: node health-check.js
 */
export async function standaloneHealthCheck(): Promise<void> {
  try {
    const options = {
      hostname: 'localhost',
      port: process.env.COLLAB_PORT || 8080,
      path: '/health',
      method: 'GET',
      timeout: 3000,
    };

    const req = http.request(options, (res: any) => {
      if (res.statusCode === 200) {
        console.log('Health check passed');
        process.exit(0);
      } else {
        console.error(`Health check failed with status ${res.statusCode}`);
        process.exit(1);
      }
    });

    req.on('error', (error: Error) => {
      console.error(`Health check failed: ${error.message}`);
      process.exit(1);
    });

    req.on('timeout', () => {
      console.error('Health check timeout');
      req.destroy();
      process.exit(1);
    });

    req.end();
  } catch (error) {
    console.error(
      `Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    process.exit(1);
  }
}

// Run standalone health check if executed directly
if (require.main === module) {
  standaloneHealthCheck();
}
